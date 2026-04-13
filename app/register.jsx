import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
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
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useAuth } from "../src/contexts/AuthContext";
import { useNav } from "../src/contexts/NavContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      lastOffset.current = 0;
      setShowNav(false);

      return () => {
        setShowNav(true);
      };
    }, [setShowNav]),
  );

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const delta = currentOffset - lastOffset.current;

    if (currentOffset <= 10 || delta < 0) {
      setShowNav(false);
    } else if (delta > 0) {
      setShowNav(true);
    }

    lastOffset.current = currentOffset;
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name, email, password, phone });
      if (result.success) {
        Alert.alert("Sucesso", "Conta criada com sucesso!", [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      } else {
        Alert.alert("Erro", result.message || "Erro ao registrar");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Velvet Slice</Text>
          <Text style={styles.subtitle}>Sejam bem vindos a Velvet Slice!</Text>

          <View style={styles.divider} />

          <FormInput
            label="Nome"
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Telefone"
            placeholder="+55 (11)9****_****"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <FormInput
            label="Email"
            placeholder="Digite seu email"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <FormInput
            label="Senha"
            placeholder="••••••••••••"
            icon="password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <FormInput
            label="Confirmar senha"
            placeholder="••••••••••••"
            icon="password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity onPress={() => router.push("/reset-password")}>
            <Text style={styles.forgotText}>
              Esqueceu senha? Clique{" "}
              <Text style={styles.linkUnderline}>aqui</Text>!
            </Text>
          </TouchableOpacity>

          <Button fullWidth onPress={handleRegister} disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.registerText}>
              Já possui uma conta? Entre{" "}
              <Text style={styles.linkUnderline}>aqui</Text>!
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
    paddingBottom: 140,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: Colors.primary || "#000",
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
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary || "#ccc",
    marginVertical: 4,
  },
  forgotText: {
    fontFamily: Fonts.josefinSans || "sans-serif",
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "right",
  },
  linkUnderline: {
    textDecorationLine: "underline",
  },
  registerText: {
    fontFamily: Fonts.josefinSans || "sans-serif",
    fontSize: 14,
    color: Colors.greenText || "green",
    textAlign: "center",
  },
});
