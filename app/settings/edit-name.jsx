import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { Button } from "../../src/components/Button";
import { FormInput } from "../../src/components/FormInput";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useAuth } from "../../src/contexts/AuthContext";
import { useToast } from "../../src/contexts/ToastContext";

export default function EditNamePage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");

  const handleSave = async () => {
    if (name.trim().length < 3) {
      showToast("O nome precisa ter pelo menos 3 letras.", "warning");
      return;
    }
    if (name.trim() === user?.name) {
      router.back();
      return;
    }

    const result = await updateUserData({ name: name.trim() });
    if (result.success) {
      showToast("Nome atualizado com sucesso!", "success");
      router.back();
    } else {
      showToast("Não foi possível atualizar o nome.", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Editar nome" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Editar nome</Text>
        <Text style={styles.description}>
          Altere seu nome para manter suas informações atualizadas.
        </Text>

        <FormInput
          label="Como deseja ser chamado?"
          placeholder="Seu nome completo"
          value={name}
          onChangeText={setName}
        />

        <Button fullWidth onPress={handleSave} style={styles.buttonMargin}>
          Salvar alterações
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, paddingTop: 24, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  description: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, opacity: 0.8 },
  buttonMargin: { marginTop: 10 },
});
