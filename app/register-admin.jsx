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
import { adminService } from "../src/services/api";

export default function RegisterAdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha || !confirmSenha || !codigo) {
      return showToast("Preencha todos os campos obrigatórios.", "warning");
    }

    if (nome.trim().length < 2) {
      return showToast("Nome deve ter pelo menos 2 caracteres.", "warning");
    }

    if (telefone && telefone.replace(/\D/g, "").length < 10) {
      return showToast("Telefone inválido. Use DDD + número.", "warning");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return showToast("Informe um e-mail válido.", "warning");
    }

    if (senha.length < 6) {
      return showToast("A senha deve ter pelo menos 6 caracteres.", "warning");
    }

    if (senha.length > 100) {
      return showToast("A senha deve ter no máximo 100 caracteres.", "warning");
    }

    if (senha !== confirmSenha) {
      return showToast("As senhas não coincidem.", "error");
    }

    setLoading(true);
    try {
      await adminService.registerAdmin({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha,
        codigo,
      });

      showToast("Cadastro realizado! Entre com suas credenciais.", "success");
      router.replace("/login");
    } catch (err) {
      const raw = err.message || "Erro ao cadastrar.";
      const msg = raw.includes("já cadastrado")
        ? "Este e-mail já está em uso."
        : raw;
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Cadastro de Vendedor" showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Cadastro de Vendedor</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para criar sua conta de vendedor.
          </Text>

          <View style={styles.divider} />

          <FormInput
            label="Nome completo"
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
          />

          <FormInput
            label="Telefone"
            placeholder="+55 (11) 9****-****"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
            maxLength={19}
          />

          <FormInput
            label="E-mail"
            placeholder="email@exemplo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <FormInput
            label="Senha"
            placeholder="••••••••••••"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            maxLength={100}
          />
          <Text style={styles.hint}>Entre 6 e 100 caracteres.</Text>

          <FormInput
            label="Confirmar senha"
            placeholder="••••••••••••"
            secureTextEntry
            value={confirmSenha}
            onChangeText={setConfirmSenha}
            maxLength={100}
          />
          {confirmSenha.length > 0 && confirmSenha !== senha ? (
            <Text style={styles.hintError}>As senhas não coincidem.</Text>
          ) : null}

          <FormInput
            label="Código de acesso"
            placeholder="••••••••••••"
            secureTextEntry
            value={codigo}
            onChangeText={setCodigo}
          />
          <Text style={styles.hint}>Código fornecido pela administração.</Text>

          <Button fullWidth onPress={handleRegister} loading={loading}>
            Cadastrar
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.backText}>
              Já tem cadastro?{" "}
              <Text style={styles.linkUnderline}>Acesse aqui</Text>
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
