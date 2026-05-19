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

export default function EditEmailPage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      showToast("Digite um e-mail.", "warning");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      showToast("Informe um e-mail válido.", "warning");
      return;
    }
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      router.back();
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserData({ email: email.trim().toLowerCase() });
      if (result.success) {
        showToast("E-mail alterado com sucesso!", "success");
        router.back();
      } else {
        showToast(result.message || "Falha ao atualizar e-mail.", "error");
      }
    } catch {
      showToast("Ocorreu um erro ao processar sua solicitação.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Alterar e-mail" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Alterar e-mail</Text>
        <Text style={styles.description}>
          Atualize seu endereço de e-mail para manter suas informações em dia.
        </Text>

        <FormInput
          label="Novo e-mail"
          placeholder="exemplo@email.com"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button fullWidth onPress={handleSave} loading={loading} style={styles.buttonMargin}>
          Salvar alteração
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
