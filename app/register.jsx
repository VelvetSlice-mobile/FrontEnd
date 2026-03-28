import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Importação de constantes e componentes
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/Button';

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados em JavaScript puro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Simulação de cadastro com sucesso
    Alert.alert('Sucesso', 'Conta criada com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
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
            label="Nome"
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={setName}
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

          <TouchableOpacity onPress={() => router.push('/reset-password')}>
            <Text style={styles.forgotText}>
              Esqueceu senha? Clique <Text style={styles.linkUnderline}>aqui</Text>!
            </Text>
          </TouchableOpacity>

          <Button fullWidth onPress={handleRegister}>
            Cadastrar
          </Button>

          <View style={styles.divider} />

          {/* Link para voltar ao login */}
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
    padding: 24 
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
    backgroundColor: Colors.secondary || '#ccc', 
    marginVertical: 4 
  },
  forgotText: { 
    fontFamily: Fonts.josefinSans || 'sans-serif', 
    fontSize: 14, 
    color: Colors.secondary, 
    textAlign: 'right' 
  },
  linkUnderline: { 
    textDecorationLine: 'underline' 
  },
  registerText: { 
    fontFamily: Fonts.josefinSans || 'sans-serif', 
    fontSize: 14, 
    color: Colors.greenText || 'green', 
    textAlign: 'center' 
  },
});