import { useRouter } from "expo-router";
import { Pencil, Plus, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function resolveImageUrl(imagem) {
  if (!imagem) return null;
  if (/^https?:\/\//i.test(imagem)) return imagem;
  if (imagem.startsWith("/")) return `${API_URL}${imagem}`;
  return null;
}
import { AdminNavbar } from "../../src/components/AdminNavbar";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useToast } from "../../src/contexts/ToastContext";
import { adminService } from "../../src/services/api";

export default function AdminProdutos() {
  const router = useRouter();
  const { showToast } = useToast();
  const [bolos, setBolos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadBolos = useCallback(async () => {
    try {
      const data = await adminService.getBolos();
      setBolos(data);
    } catch {
      setBolos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBolos(); }, [loadBolos]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminService.deleteBolo(id);
      setBolos((prev) => prev.filter((b) => b.id_bolo !== id));
      showToast("Bolo excluído.", "success");
    } catch {
      showToast("Não foi possível excluir.", "error");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Produtos" showBack />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bolos}
          keyExtractor={(item) => String(item.id_bolo)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const imageUrl = resolveImageUrl(item.imagem);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/admin/editar-bolo?id=${item.id_bolo}`)}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]} />
                )}
                <View style={styles.info}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  <Text style={styles.preco}>R$ {Number(item.preco).toFixed(2).replace(".", ",")}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/admin/editar-bolo?id=${item.id_bolo}`)}
                  >
                    <Pencil size={16} color={Colors.background} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={(e) => { e.stopPropagation?.(); setDeleteTarget({ id: item.id_bolo, nome: item.nome }); }}
                  >
                    <Trash2 size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum bolo cadastrado.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/admin/criar-bolo")}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      <AdminNavbar />

      <ConfirmDialog
        visible={!!deleteTarget}
        type="danger"
        title="Excluir bolo?"
        message={`"${deleteTarget?.nome}" será removido permanentemente do cardápio.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, elevation: 2 },
  productImage: { width: 56, height: 56, borderRadius: 10 },
  productImagePlaceholder: { backgroundColor: "#e0d5cc" },
  info: { flex: 1, gap: 4 },
  nome: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  preco: { fontFamily: Fonts.newsreaderBold, fontSize: 14, color: Colors.secondary },
  actions: { flexDirection: "row", gap: 10 },
  editBtn: { backgroundColor: Colors.primary, padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: Colors.accent, padding: 8, borderRadius: 8 },
  emptyText: { textAlign: "center", color: Colors.secondary, fontFamily: Fonts.poppins, marginTop: 40 },
  fab: { position: "absolute", bottom: 80, right: 22, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", elevation: 6 },
});
