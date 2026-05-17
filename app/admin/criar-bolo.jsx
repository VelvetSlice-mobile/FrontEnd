import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Image as LucideImage } from "lucide-react-native";
import React, { useState } from "react";
import {
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

const CATEGORIAS = ["Brigadeiro", "Morango", "Chocolate", "Cenoura", "Baunilha", "Outro"];

export default function CriarBolo() {
  const router = useRouter();
  const { showToast } = useToast();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !preco.trim()) {
      showToast("Nome e preço são obrigatórios.", "warning");
      return;
    }
    const precoNum = Number(preco.replace(",", "."));
    if (Number.isNaN(precoNum) || precoNum <= 0) {
      showToast("Informe um preço válido.", "warning");
      return;
    }

    setLoading(true);
    try {
      const bolo = await adminService.createBolo({
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNum,
        categoria,
      });

      if (imageUri && bolo?.id_bolo) {
        await adminService.uploadBoloImage(bolo.id_bolo, imageUri);
      }

      showToast("Bolo criado com sucesso!", "success");
      router.back();
    } catch {
      showToast("Não foi possível criar o bolo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Criar bolo" showBack />
      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <LucideImage size={32} color={Colors.secondary} />
              <Text style={styles.imagePlaceholderText}>Toque para adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nome do bolo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Brigadeiro"
          placeholderTextColor={Colors.secondary}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o bolo, ingredientes, sabores e detalhes..."
          placeholderTextColor={Colors.secondary}
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
          placeholder="0,00"
          placeholderTextColor={Colors.secondary}
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
        />

        <Button fullWidth onPress={handleSalvar} style={{ marginTop: 20 }}>
          {loading ? "Salvando..." : "Salvar bolo"}
        </Button>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 22, gap: 6, paddingBottom: 40 },
  imagePicker: { borderRadius: 12, overflow: "hidden", marginBottom: 8 },
  imagePreview: { width: "100%", height: 200, borderRadius: 12 },
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
  cancelText: { textAlign: "center", fontFamily: Fonts.poppins, fontSize: 14, color: Colors.secondary },
});
