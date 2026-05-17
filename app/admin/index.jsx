import { useRouter } from "expo-router";
import { Package, ShoppingBag } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { AdminNavbar } from "../../src/components/AdminNavbar";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useAuth } from "../../src/contexts/AuthContext";
import { adminService } from "../../src/services/api";

export default function AdminHome() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ produtos: 0, vendas: 0, pedidos: 0 });
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, mv] = await Promise.all([
        adminService.getStats(),
        adminService.getMaisVendidos(),
      ]);
      setStats(s);
      setMaisVendidos(mv);
    } catch {
      // mantém os dados anteriores se falhar
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Bem-vindo,</Text>
          <Text style={styles.headerTitle}>{user?.name || "Admin"}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.sectionLabel}>Resumo da loja</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.produtos}</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>
          <View style={styles.statCard}>
            <ShoppingBag size={22} color={Colors.primary} />
            <Text style={styles.statValue}>
              R$ {Number(stats.vendas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statLabel}>Vendidos</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Mais ações</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/admin/pedidos")}>
            <Text style={styles.actionText}>Ver Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/admin/produtos")}>
            <Text style={styles.actionText}>Gerenciar Produtos</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Mais vendidos</Text>
        <FlatList
          data={maisVendidos}
          keyExtractor={(item) => String(item.id_bolo)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productRow}
              onPress={() => router.push(`/admin/editar-bolo?id=${item.id_bolo}`)}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nome}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Ativo</Text>
                </View>
                <Text style={styles.productPrice}>
                  R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <Text style={styles.soldCount}>{item.total_vendido} vendidos</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
        />
      </ScrollView>
      <AdminNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerSub: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.secondary },
  headerTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.background },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.background },
  sectionLabel: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary, marginHorizontal: 22, marginTop: 20, marginBottom: 10 },
  statsRow: { flexDirection: "row", gap: 12, marginHorizontal: 22 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", gap: 6, elevation: 2 },
  statValue: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.primary },
  statLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  actionsRow: { flexDirection: "row", gap: 12, marginHorizontal: 22 },
  actionBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, padding: 14, alignItems: "center" },
  actionText: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.background },
  productRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 22, marginBottom: 12, backgroundColor: "#fff", borderRadius: 12, padding: 12, elevation: 2 },
  productInfo: { gap: 4 },
  productName: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  activeBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  activeBadgeText: { fontFamily: Fonts.poppins, fontSize: 10, color: Colors.background },
  productPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 14, color: Colors.secondary },
  soldCount: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  emptyText: { textAlign: "center", color: Colors.secondary, fontFamily: Fonts.poppins, marginTop: 20 },
});
