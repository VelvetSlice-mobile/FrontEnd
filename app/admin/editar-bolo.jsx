import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useToast } from "../../src/contexts/ToastContext";
import { adminService } from "../../src/services/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function resolveImageUrl(imagem) {
  if (!imagem) return null;
  if (/^https?:\/\//i.test(imagem)) return imagem;
  if (imagem.startsWith("/")) return `${API_URL}${imagem}`;
  return null;
}

export default function EditarBolo() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [bolo, setBolo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadBolo = useCallback(async () => {
    try {
      const bolos = await adminService.getBolos();
      const found = bolos.find((b) => String(b.id_bolo) === String(id));
      if (found) setBolo(found);
    } catch {
      showToast("Não foi possível carregar o bolo.", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadBolo(); }, [loadBolo]);

  const handleToggleAtivo = async () => {
    setToggling(true);
    try {
      const result = await adminService.toggleBoloAtivo(id);
      setBolo((prev) => ({ ...prev, ativo: result.ativo }));
      showToast(result.ativo ? "Bolo ativado na loja." : "Bolo ocultado da loja.", "success");
    } catch {
      showToast("Não foi possível alterar o status.", "error");
    } finally {
      setToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    try {
      await adminService.deleteBolo(id);
      router.replace("/admin/produtos");
    } catch {
      showToast("Não foi possível excluir o bolo.", "error");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const imageUrl = resolveImageUrl(bolo?.imagem);
  const isAtivo = bolo?.ativo !== 0;

  return (
    <View style={styles.container}>
      <Header title="Editar bolo" showBack />

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={styles.heroPlaceholder} />
      )}

      <Text style={styles.sectionLabel}>Editar bolo</Text>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => router.push(`/admin/editar-bolo-form?id=${id}`)}
        >
          <View style={styles.actionIconBox}>
            <Pencil size={20} color={Colors.background} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Editar</Text>
            <Text style={styles.actionDesc}>Editar informações do bolo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleToggleAtivo}
          disabled={toggling}
        >
          <View style={styles.actionIconBox}>
            {isAtivo
              ? <EyeOff size={20} color={Colors.background} />
              : <Eye size={20} color={Colors.background} />}
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{isAtivo ? "Desativar" : "Ativar"}</Text>
            <Text style={styles.actionDesc}>{isAtivo ? "Ocultar bolo da loja" : "Mostrar bolo na loja"}</Text>
          </View>
          {toggling && <ActivityIndicator size="small" color={Colors.primary} />}
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => setShowDeleteDialog(true)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: Colors.accent }]}>
            <Trash2 size={20} color="#fff" />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: Colors.accent }]}>Excluir</Text>
            <Text style={styles.actionDesc}>Excluir bolo permanentemente</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDeleteDialog}
        type="danger"
        title="Excluir bolo?"
        message="Esta ação é irreversível. O bolo será removido permanentemente do cardápio."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroImage: { width: "100%", height: 220 },
  heroPlaceholder: { width: "100%", height: 220, backgroundColor: "#e0d5cc" },
  sectionLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 18,
    color: Colors.primary,
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 10,
  },
  card: { backgroundColor: "#fff", borderRadius: 14, marginHorizontal: 16, elevation: 2 },
  actionRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: { flex: 1 },
  actionTitle: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary },
  actionDesc: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  separator: { height: 1, backgroundColor: Colors.background, marginHorizontal: 14 },
});
