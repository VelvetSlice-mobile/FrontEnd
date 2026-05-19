import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from '../src/components/Button';
import { FormInput } from '../src/components/FormInput';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { useAuth } from "../src/contexts/AuthContext";
import { useToast } from "../src/contexts/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  const handleTitlePress = () => {
    tapCountRef.current += 1;
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      router.push("/register-admin");
      return;
    }
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showToast("Informe seu e-mail.", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Informe um e-mail válido.", "warning");
      return;
    }
    if (!password) {
      showToast("Informe sua senha.", "warning");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.success === false) {
        showToast(result.message || "Credenciais inválidas.", "error");
        return;
      }
      router.replace(result?.user?.role === "admin" ? "/admin" : "/");
    } catch {
      showToast("Falha na conexão. Verifique sua internet.", "error");
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
      >
        <View style={styles.card}>
          <TouchableOpacity onPress={handleTitlePress} activeOpacity={1}>
            <Text style={styles.title}>Velvet Slice</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Sejam bem vindos a Velvet Slice!</Text>

          <View style={styles.divider} />

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

          <TouchableOpacity onPress={() => router.push('/reset-password')}>
            <Text style={styles.forgotText}>
              Esqueceu senha? Clique <Text style={styles.linkUnderline}>aqui</Text>!
            </Text>
          </TouchableOpacity>

          <Button fullWidth onPress={handleLogin} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>
              Ainda não possui conta? Crie uma <Text style={styles.linkUnderline}>aqui</Text>!
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
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary,
    marginVertical: 4,
  },
  forgotText: {
    fontFamily: Fonts.josefinSans,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'right',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
  },
  registerText: {
    fontFamily: Fonts.josefinSans,
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
  },
});
