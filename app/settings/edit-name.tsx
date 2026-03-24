import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/Button';

export default function EditNamePage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome');
      return;
    }
    Alert.alert('Sucesso', 'Nome alterado com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Editar nome de usuário</Text>
        <Text style={styles.description}>
          Altere seu nome de usuário para manter suas informações atualizadas na plataforma.
        </Text>
        <FormInput
          label="Nome de usuário"
          placeholder="Nome exemplo"
          value={name}
          onChangeText={setName}
        />
        <Button fullWidth onPress={handleSave}>
          Alterar nome
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
