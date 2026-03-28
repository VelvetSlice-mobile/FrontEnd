import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/Button';

export default function EditPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Alterar senha</Text>
        <Text style={styles.description}>
          A senha deve ter no mínimo 6 caracteres e incluir uma combinação de números, letras e caracteres especiais (!@#$%)
        </Text>

        <FormInput
          label="Senha atual"
          placeholder="••••••••••••"
          icon="password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
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

        <TouchableOpacity>
          <Text style={styles.forgotText}>Esqueceu senha?</Text>
        </TouchableOpacity>

        <Button fullWidth onPress={handleSave}>
          Alterar senha
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
  forgotText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, textAlign: 'right' },
});
