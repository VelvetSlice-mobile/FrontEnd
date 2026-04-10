import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { FormInput } from '../../src/components/FormInput';
import { Navbar } from '../../src/components/Navbar';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { useAuth } from '../../src/contexts/AuthContext'; // Importado

export default function EditPhonePage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth(); // Hook de autenticação

  // Inicia com o telefone atual do usuário (se houver)
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 1. Validação de campo vazio
    if (!phone.trim()) {
      return Alert.alert('Erro', 'Por favor, digite o número de telefone.');
    }

    // 2. Validação simples de tamanho (DDD + Número)
    // Remove caracteres não numéricos para validar apenas a quantidade de dígitos
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return Alert.alert('Erro', 'Por favor, insira um telefone válido com DDD.');
    }

    // 3. Verifica se o telefone é igual ao atual
    if (phone.trim() === user?.phone) {
      return router.back();
    }

    try {
      setLoading(true);

      // Chamando o motor de atualização
      const result = await updateUserData({ phone: phone.trim() });

      if (result.success) {
        Alert.alert('Sucesso', 'Telefone alterado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Falha ao atualizar telefone.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Número de telefone</Text>
        <Text style={styles.description}>
          Adicione um número de celular para manter suas informações atualizadas e facilitar o acesso à sua conta.
        </Text>

        <FormInput
          label="Telefone completo"
          placeholder="+55 (11) 9****-****"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad" // Abre o teclado numérico
          maxLength={19} // Limite para evitar textos gigantes
        />

        <Button
          fullWidth
          onPress={handleSave}
          loading={loading}
          style={styles.buttonMargin}
        >
          Alterar telefone
        </Button>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#FFF6E9'
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 60,
    gap: 16
  },
  title: {
    fontFamily: Fonts.newsreader || 'System',
    fontSize: 24,
    color: Colors.primary || '#4F2C1D'
  },
  description: {
    fontFamily: Fonts.poppins || 'System',
    fontSize: 14,
    color: Colors.primary || '#4F2C1D',
    opacity: 0.8,
    marginBottom: 5
  },
  buttonMargin: {
    marginTop: 10
  }
});