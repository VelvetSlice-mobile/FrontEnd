import { useFocusEffect } from "@react-navigation/native";
import {
    CheckCircle,
    ClipboardCopy,
    Package,
    Truck,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Header } from "../src/components/Header";
import { Navbar } from "../src/components/Navbar";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useAuth } from "../src/contexts/AuthContext";
import { orderService } from "../src/services/api";
import { database } from "../src/services/database";

const STATUS_LABELS = {
  preparing: "Preparando",
  in_transit: "Em rota",
  delivered: "Entregue",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("preparing");

  const loadOrders = useCallback(async () => {
    if (!user) return;

    const userId = user.id ?? user.id_cliente;
    if (!userId) return;

    try {
      const normalizeStatus = (status) => {
        const raw = (status || "").toString().trim().toLowerCase();
        if (!raw || raw === "pending" || raw.includes("pend"))
          return "preparing";
        if (
          raw.includes("pago") ||
          raw.includes("paid") ||
          raw.includes("approved")
        )
          return "preparing";
        if (raw.includes("rota") || raw.includes("transit"))
          return "in_transit";
        if (raw.includes("entreg") || raw.includes("delivered"))
          return "delivered";
        return "preparing";
      };

      const localResult = database.getAllSync(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
        [userId],
      );

      const localOrders = localResult.map((order) => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : [],
        status: normalizeStatus(order.status),
      }));

      const backendOrders = await orderService.getByClientId(userId);

      if (!Array.isArray(backendOrders)) {
        setOrders(localOrders);
        return;
      }

      const localMap = new Map(localOrders.map((order) => [order.id, order]));
      const backendIds = backendOrders
        .map((order) => order.id_pedido)
        .filter((id) => Number.isFinite(Number(id)));

      // Remove do cache local qualquer pedido do usuário que não existe mais no backend.
      if (backendIds.length === 0) {
        database.runSync("DELETE FROM orders WHERE user_id = ?", [userId]);
      } else {
        const placeholders = backendIds.map(() => "?").join(", ");
        database.runSync(
          `DELETE FROM orders WHERE user_id = ? AND id NOT IN (${placeholders})`,
          [userId, ...backendIds],
        );
      }

      const merged = backendOrders.map((backendOrder) => {
        const id = backendOrder.id_pedido;
        const mappedStatus = normalizeStatus(backendOrder.status_pedido);
        const cached = localMap.get(id);

        database.runSync(
          "INSERT OR REPLACE INTO orders (id, user_id, total, items, date, status) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id,
            userId,
            backendOrder.valor_total,
            JSON.stringify(cached?.items || []),
            backendOrder.data_pedido,
            mappedStatus,
          ],
        );

        return {
          id,
          user_id: userId,
          total: backendOrder.valor_total,
          date: backendOrder.data_pedido,
          status: mappedStatus,
          items: cached?.items || [],
        };
      });

      merged.sort((a, b) => (b.id || 0) - (a.id || 0));
      setOrders(merged);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);

      // Sem backend, usa o cache local como fallback para não quebrar a tela.
      const fallbackLocal = database
        .getAllSync("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [
          userId,
        ])
        .map((order) => ({
          ...order,
          items: order.items ? JSON.parse(order.items) : [],
          status:
            (order.status || "").toString().trim().toLowerCase() || "preparing",
        }));
      setOrders(fallbackLocal);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const handleCopyTracking = (code) => {
    Alert.alert(
      "Copiado",
      `Código ${code} copiado para a área de transferência!`,
    );
  };

  const statusOptions = ["preparing", "in_transit", "delivered"];

  return (
    <View style={styles.container}>
      <Header title="Seus Pedidos" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Meus Pedidos</Text>
          <View style={styles.divider} />

          <View style={styles.tabsRow}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusTab,
                  activeTab === status && styles.statusTabActive,
                ]}
                onPress={() => setActiveTab(status)}
              >
                {status === "preparing" && (
                  <Package
                    size={18}
                    color={
                      activeTab === status ? Colors.background : Colors.primary
                    }
                  />
                )}
                {status === "in_transit" && (
                  <Truck
                    size={18}
                    color={
                      activeTab === status ? Colors.background : Colors.primary
                    }
                  />
                )}
                {status === "delivered" && (
                  <CheckCircle
                    size={18}
                    color={
                      activeTab === status ? Colors.background : Colors.primary
                    }
                  />
                )}
                <Text
                  style={[
                    styles.statusTabText,
                    activeTab === status && styles.statusTabTextActive,
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum pedido encontrado nesta categoria.
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Pedido #{order.id}</Text>
                    <TouchableOpacity
                      style={styles.copyRow}
                      onPress={() => handleCopyTracking(`VS-${order.id}`)}
                    >
                      <ClipboardCopy size={14} color={Colors.background} />
                      <Text style={styles.trackingCode}>Copiar Rastreio</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.orderDateText}>{order.date}</Text>
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Detalhes</Text>
                  <View style={styles.itemDivider} />

                  {order.items.map((item) => (
                    <View
                      key={`${item.id ?? item.name}-${item.size ?? "na"}-${item.quantity ?? 1}`}
                      style={styles.orderItem}
                    >
                      <Image
                        source={item.image}
                        style={styles.orderItemImage}
                      />
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <View style={styles.sizeRow}>
                          <Text style={styles.labelText}>
                            Qtd: {item.quantity} | Tam: {item.size}
                          </Text>
                        </View>
                        <Text style={styles.totalPrice}>
                          R${" "}
                          {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <Text style={styles.trackingDescription}>
                    O rastreamento da sua entrega é feito pela Velvet Log.
                  </Text>

                  <View style={styles.itemDivider} />

                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotalLabel}>Total Pago</Text>
                      <Text style={styles.orderTotalPrice}>
                        R$ {Number(order.total).toFixed(2).replace(".", ",")}
                      </Text>
                    </View>
                    <Button
                      onPress={() =>
                        Alert.alert(
                          "Rastreio",
                          "Seu pedido está sendo processado pela Velvet Log.",
                        )
                      }
                    >
                      Rastrear
                    </Button>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 120 },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 16 },
  pageTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: 5,
    opacity: 0.3,
  },
  tabsRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  statusTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusTabActive: { backgroundColor: Colors.primary },
  statusTabText: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  statusTabTextActive: { color: Colors.background },
  emptyContainer: { marginTop: 50, alignItems: "center" },
  emptyText: {
    textAlign: "center",
    color: Colors.secondary,
    fontFamily: Fonts.poppins,
    fontSize: 14,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: "hidden",
    marginBottom: 15,
  },
  orderHeader: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackingLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 18,
    color: "#D4AF37",
  },
  copyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trackingCode: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.background,
    textDecorationLine: "underline",
  },
  orderDateText: {
    fontFamily: Fonts.poppins,
    fontSize: 10,
    color: Colors.background,
  },
  orderItems: { padding: 12, gap: 10 },
  itemsTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: "#000" },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.secondary,
    opacity: 0.2,
    marginVertical: 5,
  },
  orderItem: { flexDirection: "row", gap: 12, marginBottom: 10 },
  orderItemImage: { width: 60, height: 60, borderRadius: 8 },
  orderItemInfo: { flex: 1, gap: 2 },
  orderItemName: {
    fontFamily: Fonts.newsreader,
    fontSize: 18,
    color: Colors.primary,
  },
  sizeRow: { flexDirection: "row", alignItems: "center" },
  labelText: { fontFamily: Fonts.poppins, fontSize: 13, color: "#666" },
  totalPrice: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 16,
    color: Colors.primary,
  },
  trackingDescription: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  orderTotalLabel: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
  },
  orderTotalPrice: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 20,
    color: Colors.primary,
  },
});
