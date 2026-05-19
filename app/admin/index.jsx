import { useRouter } from "expo-router";
import { Package, Search, ShoppingBag } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AdminNavbar } from "../../src/components/AdminNavbar";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { Fonts } from "../../src/constants/Fonts";
import { adminService } from "../../src/services/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function resolveImageUrl(imagem) {
  if (!imagem) return null;
  if (/^https?:\/\//i.test(imagem)) return imagem;
  if (imagem.startsWith("/")) return `${API_URL}${imagem}`;
  return null;
}

export default function AdminHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({ produtos: 0, vendas: 0, pedidos: 0 });
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, mv] = await Promise.all([
        adminService.getStats(),
        adminService.getMaisVendidos(),
      ]);
      setStats(s);
      setMaisVendidos(mv);
    } catch {
      // falha silenciosa — dados do dashboard não disponíveis
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = search
    ? maisVendidos.filter((item) => item.nome.toLowerCase().includes(search.toLowerCase()))
    : maisVendidos;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header userName={user?.name ?? user?.nome} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.searchRow}>
          <Search size={16} color={Colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar"
            placeholderTextColor={Colors.secondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionLabel}>Resumo da sua loja</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Package size={22} color={Colors.background} />
            </View>
            <View>
              <Text style={styles.statLabel}>Pedidos</Text>
              <Text style={styles.statValue}>{stats.pedidos}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <ShoppingBag size={22} color={Colors.background} />
            </View>
            <View>
              <Text style={styles.statLabel}>Vendas</Text>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                R$ {Number(stats.vendas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Mais vendidos</Text>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id_bolo)}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const imageUrl = resolveImageUrl(item.imagem);
            return (
              <TouchableOpacity
                style={styles.productRow}
                onPress={() => router.push(`/admin/editar-bolo?id=${item.id_bolo}`)}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]} />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.nome}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Ativo</Text>
                  </View>
                  <Text style={styles.precoLabel}>Preço</Text>
                  <Text style={styles.productPrice}>
                    R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
  },
  sectionLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 18,
    color: Colors.primary,
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 10,
  },
  statsRow: { flexDirection: "row", gap: 12, marginHorizontal: 22 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  statValue: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.primary },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 22,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    gap: 12,
    elevation: 2,
  },
  productImage: { width: 70, height: 70, borderRadius: 10 },
  productImagePlaceholder: { backgroundColor: "#e0d5cc" },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  activeBadge: {
    backgroundColor: "#27ae60",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  activeBadgeText: { fontFamily: Fonts.poppins, fontSize: 10, color: "#fff" },
  precoLabel: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary, marginTop: 2 },
  productPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 14, color: Colors.primary },
  emptyText: { textAlign: "center", color: Colors.secondary, fontFamily: Fonts.poppins, marginTop: 20, marginHorizontal: 22 },
});
