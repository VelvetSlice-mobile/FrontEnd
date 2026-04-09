import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Importação de constantes e componentes
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/Button';

// Importação do contexto de autenticação
import { useAuth } from '../src/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Estados em JavaScript puro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    try {
      // Chama a função de login do seu AuthContext
      await login(email, password);
      // replace('/') evita que o usuário volte para o login ao apertar o botão "voltar"
      router.replace('/');
    } catch (error) {
      Alert.alert('Erro', 'Falha na autenticação. Verifique suas credenciais.');
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
          <Text style={styles.title}>Velvet Slice</Text>
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
            secureTextEntry={true} // Garante que a senha fique oculta
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => router.push('/reset-password')}>
            <Text style={styles.forgotText}>
              Esqueceu senha? Clique <Text style={styles.linkUnderline}>aqui</Text>!
            </Text>
          </TouchableOpacity>

          <Button 
            fullWidth 
            onPress={handleLogin} 
            disabled={loading}
          >
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
    shadowColor: Colors.primary || '#000',
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
    backgroundColor: Colors.secondary || '#ccc',
    marginVertical: 4,
  },
  forgotText: {
    fontFamily: Fonts.josefinSans || 'sans-serif',
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'right',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
  },
  registerText: {
    fontFamily: Fonts.josefinSans || 'sans-serif',
    fontSize: 14,
    color: Colors.greenText || 'green',
    textAlign: 'center',
  },
});