import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/Button';

export default function EditPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!phone.trim()) {
      Alert.alert('Erro', 'Digite o telefone');
      return;
    }
    Alert.alert('Sucesso', 'Telefone alterado com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Número de telefone</Text>
        <Text style={styles.description}>
          Adicione um número de celular para sempre conseguir entrar na sua conta.
        </Text>
        <FormInput
          label="Telefone completo"
          placeholder="+55 (11) 9 ****-****"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Button fullWidth onPress={handleSave}>
          Alterar telefone
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
