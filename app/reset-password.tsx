import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/Button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = () => {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Velvet Slice</Text>
          <Text style={styles.subtitle}>Esqueceu senha?</Text>

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
            label="Nova senha"
            placeholder="••••••••••••"
            icon="password"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <FormInput
            label="Confirmar nova senha"
            placeholder="••••••••••••"
            icon="password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button fullWidth onPress={handleReset}>
            Redefinir
          </Button>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push('/register' as never)}>
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
  linkUnderline: { textDecorationLine: 'underline' },
  registerText: { fontFamily: Fonts.josefinSans, fontSize: 14, color: Colors.greenText, textAlign: 'center' },
});
