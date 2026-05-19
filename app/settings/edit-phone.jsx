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

export default function EditPhonePage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!phone.trim()) {
      showToast("Digite o número de telefone.", "warning");
      return;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      showToast("Informe um telefone válido com DDD.", "warning");
      return;
    }
    if (phone.trim() === user?.phone) {
      router.back();
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserData({ phone: phone.trim() });
      if (result.success) {
        showToast("Telefone alterado com sucesso!", "success");
        router.back();
      } else {
        showToast(result.message || "Falha ao atualizar telefone.", "error");
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
      <Header title="Telefone" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Número de telefone</Text>
        <Text style={styles.description}>
          Adicione um número de celular para manter suas informações atualizadas.
        </Text>

        <FormInput
          label="Telefone completo"
          placeholder="+55 (11) 9****-****"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={19}
        />

        <Button fullWidth onPress={handleSave} loading={loading} style={styles.buttonMargin}>
          Alterar telefone
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
