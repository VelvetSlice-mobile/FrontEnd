import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image as LucideImage } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../src/components/Button";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useToast } from "../../src/contexts/ToastContext";
import { adminService } from "../../src/services/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
const CATEGORIAS = ["Bolo", "Choco", "Frutas", "Doces"];

function resolveImageUrl(imagem) {
  if (!imagem) return null;
  if (/^https?:\/\//i.test(imagem)) return imagem;
  if (imagem.startsWith("/")) return `${API_URL}${imagem}`;
  return null;
}

export default function EditarBoloForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [newImageUri, setNewImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBolo = useCallback(async () => {
    try {
      const bolos = await adminService.getBolos();
      const bolo = bolos.find((b) => String(b.id_bolo) === String(id));
      if (bolo) {
        setNome(bolo.nome);
        setDescricao(bolo.descricao || "");
        setPreco(String(bolo.preco).replace(".", ","));
        setCategoria(bolo.categoria || "");
        setCurrentImageUrl(resolveImageUrl(bolo.imagem));
      }
    } catch {
      showToast("Não foi possível carregar o bolo.", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadBolo(); }, [loadBolo]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Permissão para acessar a galeria é necessária.", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSalvar = async () => {
    const precoNum = Number(preco.replace(",", "."));
    if (!nome.trim() || Number.isNaN(precoNum) || precoNum <= 0) {
      showToast("Nome e preço válidos são obrigatórios.", "warning");
      return;
    }
    setSaving(true);
    try {
      await adminService.updateBolo(id, { nome: nome.trim(), descricao: descricao.trim(), preco: precoNum, categoria });
      if (newImageUri) {
        await adminService.uploadBoloImage(id, newImageUri);
      }
      showToast("Bolo atualizado com sucesso!", "success");
      router.back();
    } catch {
      showToast("Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const displayImageUri = newImageUri ?? currentImageUrl;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Editar informações" showBack />
      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {displayImageUri ? (
            <>
              <Image source={{ uri: displayImageUri }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <LucideImage size={20} color="#fff" />
                <Text style={styles.imageOverlayText}>Trocar foto</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <LucideImage size={32} color={Colors.secondary} />
              <Text style={styles.imagePlaceholderText}>Toque para adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nome do bolo</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriaRow}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, categoria === cat && styles.catBtnActive]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.catText, categoria === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
        />

        <Button fullWidth onPress={handleSalvar} style={{ marginTop: 20 }}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 22, gap: 6, paddingBottom: 40 },
  imagePicker: { borderRadius: 12, overflow: "hidden", marginBottom: 8, position: "relative" },
  imagePreview: { width: "100%", height: 200, borderRadius: 12 },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  imageOverlayText: { fontFamily: Fonts.poppins, fontSize: 13, color: "#fff" },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary },
  label: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, backgroundColor: "#fff" },
  textArea: { height: 100, textAlignVertical: "top" },
  categoriaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  catBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  catBtnActive: { backgroundColor: Colors.primary },
  catText: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary },
  catTextActive: { color: Colors.background },
});
