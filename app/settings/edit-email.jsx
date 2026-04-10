import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text
} from "react-native";
import { Button } from "../../src/components/Button";
import { FormInput } from "../../src/components/FormInput";
import { Navbar } from "../../src/components/Navbar";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useAuth } from "../../src/contexts/AuthContext"; // Importado

export default function EditEmailPage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth(); // Hook de autenticação

  // Iniciamos com o email atual do usuário
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 1. Validação de campo vazio
    if (!email.trim()) {
      return Alert.alert("Erro", "Por favor, digite um e-mail.");
    }

    // 2. Validação de formato de e-mail (Regex)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert(
        "Erro",
        "Por favor, insira um formato de e-mail válido.",
      );
    }

    // 3. Verifica se o e-mail é igual ao atual
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      return router.back();
    }

    try {
      setLoading(true);

      // Chamando o motor de atualização no Contexto
      const result = await updateUserData({
        email: email.trim().toLowerCase(),
      });

      if (result.success) {
        Alert.alert("Sucesso", "E-mail alterado com sucesso!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erro", result.message || "Falha ao atualizar e-mail.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Alterar e-mail</Text>
        <Text style={styles.description}>
          Atualize seu endereço de e-mail para manter suas informações de
          contato e segurança em dia.
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

        <Button
          fullWidth
          onPress={handleSave}
          loading={loading}
          style={styles.buttonMargin}
        >
          Salvar alteração
        </Button>
      </ScrollView>
      <Navbar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#FFF6E9",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 60,
    gap: 16,
  },
  title: {
    fontFamily: Fonts.newsreader || "System",
    fontSize: 24,
    color: Colors.primary || "#4F2C1D",
  },
  description: {
    fontFamily: Fonts.poppins || "System",
    fontSize: 14,
    color: Colors.primary || "#4F2C1D",
    opacity: 0.8,
    marginBottom: 5,
  },
  buttonMargin: {
    marginTop: 10,
  },
});
