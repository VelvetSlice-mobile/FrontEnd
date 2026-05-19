import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useAuth } from "../src/contexts/AuthContext";
import { useNav } from "../src/contexts/NavContext";
import { useToast } from "../src/contexts/ToastContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { setShowNav } = useNav();
  const { showToast } = useToast();
  const lastOffset = useRef(0);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!name.trim()) {
      showToast("Informe seu nome.", "warning");
      return;
    }
    if (name.trim().length < 2) {
      showToast("Nome deve ter pelo menos 2 caracteres.", "warning");
      return;
    }
    if (!phone.trim()) {
      showToast("Informe seu telefone.", "warning");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      showToast("Telefone inválido. Use DDD + número.", "warning");
      return;
    }
    if (!email.trim()) {
      showToast("Informe seu e-mail.", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Informe um e-mail válido.", "warning");
      return;
    }
    if (!password) {
      showToast("Informe uma senha.", "warning");
      return;
    }
    if (password.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres.", "warning");
      return;
    }
    if (!confirmPassword) {
      showToast("Confirme sua senha.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      showToast("As senhas não coincidem.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
      if (result.success) {
        showToast("Conta criada com sucesso!", "success");
        router.replace("/");
      } else {
        showToast(result.message || "Erro ao registrar.", "error");
      }
    } catch {
      showToast("Erro inesperado ao registrar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
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
            placeholder="Digite seu telefone"
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

          <Button fullWidth onPress={handleRegister} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.registerText}>
              Já possui uma conta? Entre <Text style={styles.linkUnderline}>aqui</Text>!
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
    backgroundColor: Colors.background 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 24,
    paddingBottom: 140,
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
    textAlign: 'center' 
  },
  subtitle: { 
    fontFamily: Fonts.poppins, 
    fontSize: 14, 
    color: Colors.primary, 
    textAlign: 'center' 
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary,
    marginVertical: 4
  },
  forgotText: {
    fontFamily: Fonts.josefinSans,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'right'
  },
  linkUnderline: {
    textDecorationLine: 'underline'
  },
  registerText: {
    fontFamily: Fonts.josefinSans,
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center'
  },
});