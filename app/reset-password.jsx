import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../src/components/Button";
import { FormInput } from "../src/components/FormInput";
import { Header } from "../src/components/Header";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useToast } from "../src/contexts/ToastContext";
import { authService } from "../src/services/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      return showToast("Preencha todos os campos.", "error");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return showToast("Informe um e-mail válido.", "error");
    }

    if (newPassword.length < 6) {
      return showToast("A nova senha deve ter no mínimo 6 caracteres.", "error");
    }

    if (newPassword.length > 100) {
      return showToast("A nova senha deve ter no máximo 100 caracteres.", "error");
    }

    if (newPassword !== confirmPassword) {
      return showToast("As senhas não coincidem.", "error");
    }

    try {
      setLoading(true);
      await authService.resetPassword(email.trim(), newPassword);
      showToast("Senha redefinida com sucesso! Faça login.", "success");
      router.replace("/login");
    } catch (error) {
      showToast(error.message || "Erro ao redefinir senha.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Redefinir senha" showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Esqueceu a senha?</Text>
          <Text style={styles.subtitle}>
            Informe o e-mail da sua conta e escolha uma nova senha.
          </Text>

          <View style={styles.divider} />

          <FormInput
            label="E-mail cadastrado"
            placeholder="Digite seu e-mail"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <FormInput
            label="Nova senha"
            placeholder="••••••••••••"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            maxLength={100}
          />
          <Text style={styles.hint}>
            Entre 6 e 100 caracteres. Use letras, números e símbolos (!@#$%) para mais segurança.
          </Text>

          <FormInput
            label="Confirmar nova senha"
            placeholder="••••••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            maxLength={100}
          />
          {confirmPassword.length > 0 && confirmPassword !== newPassword ? (
            <Text style={styles.hintError}>As senhas não coincidem.</Text>
          ) : null}

          <Button fullWidth onPress={handleReset} loading={loading}>
            Redefinir senha
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.backText}>
              Lembrou a senha? Voltar para o{" "}
              <Text style={styles.linkUnderline}>login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary,
    marginVertical: 4,
  },
  hint: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
    marginTop: -8,
  },
  hintError: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.accent,
    marginTop: -8,
  },
  backText: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
  },
  linkUnderline: {
    textDecorationLine: "underline",
    color: Colors.primary,
  },
});
