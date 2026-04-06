import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { FormInput } from '../../src/components/FormInput';
import { Navbar } from '../../src/components/Navbar';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { useAuth } from '../../src/contexts/AuthContext'; // Importado

export default function EditPasswordPage() {
  const router = useRouter();
  const { updateUserData } = useAuth(); // Hook de autenticação

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 1. Validação de campos vazios
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    // 2. Validação de tamanho mínimo
    if (newPassword.length < 6) {
      return Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
    }

    // 3. Validação de coincidência
    if (newPassword !== confirmPassword) {
      return Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
    }

    // 4. Validação de senha nova igual à antiga 
    if (newPassword === currentPassword) {
      return Alert.alert('Aviso', 'A nova senha não pode ser igual à senha atual.');
    }

    try {
      setLoading(true);

      // Chamando o motor de atualização
      const result = await updateUserData({ password: newPassword });

      if (result.success) {
        Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Falha ao atualizar senha.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
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
          secureTextEntry={true} // Garante que a senha fique oculta
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <FormInput
          label="Nova senha"
          placeholder="••••••••••••"
          secureTextEntry={true}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <FormInput
          label="Confirmar nova senha"
          placeholder="••••••••••••"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity onPress={() => Alert.alert('Recuperação', 'Link de redefinição enviado ao seu e-mail.')}>
          <Text style={styles.forgotText}>Esqueceu senha?</Text>
        </TouchableOpacity>

        <Button
          fullWidth
          onPress={handleSave}
          loading={loading} // Adicionado feedback visual de carregamento
        >
          Alterar senha
        </Button>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#FFF6E9' },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader || 'System', fontSize: 24, color: Colors.primary || '#4F2C1D' },
  description: {
    fontFamily: Fonts.poppins || 'System',
    fontSize: 14,
    color: Colors.primary || '#4F2C1D',
    opacity: 0.8,
    marginBottom: 5
  },
  forgotText: {
    fontFamily: Fonts.poppins || 'System',
    fontSize: 14,
    color: Colors.primary || '#4F2C1D',
    textAlign: 'right',
    textDecorationLine: 'underline',
    marginBottom: 10
  },
});