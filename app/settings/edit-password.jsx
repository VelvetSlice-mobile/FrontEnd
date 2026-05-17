import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { FormInput } from '../../src/components/FormInput';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { authService } from '../../src/services/api';
import { saveUser } from '../../src/services/database';

export default function EditPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast('Preencha todos os campos.', 'error');
    }

    if (newPassword.length < 6) {
      return showToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
    }

    if (newPassword !== confirmPassword) {
      return showToast('A nova senha e a confirmação não coincidem.', 'error');
    }

    if (newPassword === currentPassword) {
      return showToast('A nova senha não pode ser igual à senha atual.', 'warning');
    }

    const userId = user?.id ?? user?.id_cliente;
    if (!userId) {
      return showToast('Usuário não identificado. Faça login novamente.', 'error');
    }

    try {
      setLoading(true);
      await authService.updatePassword(userId, {
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      });

      saveUser({ ...user, password: newPassword });

      showToast('Senha alterada com sucesso!', 'success');
      router.back();
    } catch (error) {
      showToast(error.message || 'Falha ao alterar senha.', 'error');
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
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <FormInput
          label="Nova senha"
          placeholder="••••••••••••"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <FormInput
          label="Confirmar nova senha"
          placeholder="••••••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button fullWidth onPress={handleSave} loading={loading}>
          Alterar senha
        </Button>
      </View>
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
    marginBottom: 5,
  },
});
