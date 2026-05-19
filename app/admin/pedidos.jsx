import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AdminNavbar } from "../../src/components/AdminNavbar";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { adminService } from "../../src/services/api";

const TABS = [
  { label: "Pendentes", value: "Pendente" },
  { label: "Preparando", value: "Pago" },
  { label: "Enviados", value: "Enviado" },
  { label: "Entregues", value: "Entregue" },
];

const STATUS_COLOR = {
  Pendente: "#f39c12",
  Pago: Colors.primary,
  Enviado: "#2980b9",
  Entregue: "#27ae60",
};

const STATUS_LABEL = {
  Pendente: "Pendente",
  Pago: "Preparando",
  Enviado: "Enviado",
  Entregue: "Entregue",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return dateStr.slice(0, 10);
  }
}

export default function AdminPedidos() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Pendente");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getPedidos(activeTab);
      setPedidos(data);
    } catch {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);

  return (
    <View style={styles.container}>
      <Header title="Pedidos" showBack />

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id_pedido)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/admin/pedido-detalhado?id=${item.id_pedido}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.pedidoId}>#{item.id_pedido}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status_pedido] || "#999" }]}>
                  <Text style={styles.statusText}>{STATUS_LABEL[item.status_pedido] || item.status_pedido}</Text>
                </View>
              </View>
              <Text style={styles.clienteName}>{item.nome_cliente}</Text>
              <Text style={styles.itemCount}>
                {item.total_itens != null ? `${item.total_itens} ${item.total_itens === 1 ? "item" : "itens"}` : ""}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.pedidoDate}>{formatDate(item.data_pedido)}</Text>
                <Text style={styles.pedidoTotal}>
                  R$ {Number(item.valor_total).toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum pedido nesta categoria.</Text>
          }
        />
      )}
      <AdminNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabsRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, alignItems: "center" },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.primary },
  tabTextActive: { color: Colors.background },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2, gap: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pedidoId: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontFamily: Fonts.poppins, fontSize: 11, color: "#fff" },
  clienteName: { fontFamily: Fonts.poppins, fontSize: 13, color: "#333" },
  itemCount: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  pedidoDate: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary },
  pedidoTotal: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  emptyText: { textAlign: "center", color: Colors.secondary, fontFamily: Fonts.poppins, marginTop: 40 },
});
