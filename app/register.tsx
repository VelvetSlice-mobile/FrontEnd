import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    Alert.alert('Sucesso', 'Conta criada com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Velvet Slice</Text>
          <Text style={styles.subtitle}>Sejam bem vindos a Velvet Slice!</Text>

          <View style={styles.divider} />

          <FormInput
            label="Nome "
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
            value={password}
            onChangeText={setPassword}
          />

          <FormInput
            label="Confirmar senha"
            placeholder="••••••••••••"
            icon="password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity onPress={() => router.push('/reset-password' as never)}>
            <Text style={styles.forgotText}>
              Esqueceu senha? Clique <Text style={styles.linkUnderline}>aqui</Text>!
            </Text>
          </TouchableOpacity>

          <Button fullWidth onPress={handleRegister}>
            Cadastrar
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push('/login' as never)}>
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
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
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
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary, textAlign: 'center' },
  subtitle: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.secondary, marginVertical: 4 },
  forgotText: { fontFamily: Fonts.josefinSans, fontSize: 14, color: Colors.secondary, textAlign: 'right' },
  linkUnderline: { textDecorationLine: 'underline' },
  registerText: { fontFamily: Fonts.josefinSans, fontSize: 14, color: Colors.greenText, textAlign: 'center' },
});
