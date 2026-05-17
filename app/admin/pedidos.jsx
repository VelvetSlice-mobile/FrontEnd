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
  { label: "Entregas", value: "Entregue" },
];

const STATUS_COLOR = {
  Pendente: "#f39c12",
  Pago: Colors.primary,
  Enviado: "#2980b9",
  Entregue: "#27ae60",
};

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
              <View style={styles.cardLeft}>
                <Text style={styles.pedidoId}>#{item.id_pedido}</Text>
                <Text style={styles.clienteName}>{item.nome_cliente}</Text>
                <Text style={styles.pedidoDate}>{item.data_pedido?.slice(0, 10)}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status_pedido] || "#999" }]}>
                  <Text style={styles.statusText}>{item.status_pedido}</Text>
                </View>
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
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 2 },
  cardLeft: { gap: 4 },
  pedidoId: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  clienteName: { fontFamily: Fonts.poppins, fontSize: 13, color: "#333" },
  pedidoDate: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary },
  cardRight: { alignItems: "flex-end", gap: 6 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontFamily: Fonts.poppins, fontSize: 11, color: "#fff" },
  pedidoTotal: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  emptyText: { textAlign: "center", color: Colors.secondary, fontFamily: Fonts.poppins, marginTop: 40 },
});
