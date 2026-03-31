import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/Button';

export default function EditEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSave = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite o email');
      return;
    }
    Alert.alert('Sucesso', 'Email alterado com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Alterar email</Text>
        <Text style={styles.description}>
          Atualize seu endereço de email para manter suas informações atualizadas.
        </Text>
        <FormInput
          label="Email"
          placeholder="Digite seu novo email"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button fullWidth onPress={handleSave}>
          Alterar email
        </Button>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 12 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  description: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary },
});
