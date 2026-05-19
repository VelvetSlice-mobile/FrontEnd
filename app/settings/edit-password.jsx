import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { FormInput } from '../../src/components/FormInput';
import { Header } from '../../src/components/Header';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { authService } from '../../src/services/api';
import { saveUser } from '../../src/services/database';

function formatLastChanged(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function EditPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const lastChanged = formatLastChanged(user?.lastPasswordChange ?? user?.ultima_alteracao_senha);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast('Preencha todos os campos.', 'error');
    }

    if (newPassword.length < 6) {
      return showToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
    }

    if (newPassword.length > 100) {
      return showToast('A nova senha deve ter no máximo 100 caracteres.', 'error');
    }

    if (newPassword !== confirmPassword) {
      return showToast('A confirmação não confere com a nova senha.', 'error');
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
      const result = await authService.updatePassword(userId, {
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      });

      saveUser({
        ...user,
        password: newPassword,
        lastPasswordChange: result?.ultima_alteracao_senha ?? user?.lastPasswordChange,
      });

      showToast('Senha alterada com sucesso!', 'success');
      router.back();
    } catch (error) {
      showToast(error.message || 'Falha ao alterar senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Alterar senha" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Alterar senha</Text>
        <Text style={styles.description}>
          Use entre 6 e 100 caracteres. Misture letras, números e símbolos (!@#$%) para mais segurança.
        </Text>

        {lastChanged ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Última alteração: {lastChanged}</Text>
          </View>
        ) : null}

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
          maxLength={100}
        />

        <FormInput
          label="Confirmar nova senha"
          placeholder="••••••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          maxLength={100}
        />

        <Button fullWidth onPress={handleSave} loading={loading} style={styles.buttonMargin}>
          Alterar senha
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, paddingTop: 24, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  description: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, opacity: 0.8 },
  infoBox: {
    backgroundColor: 'rgba(79,44,29,0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoText: {
    fontFamily: Fonts.poppins,
    fontSize: 13,
    color: Colors.primary,
  },
  buttonMargin: { marginTop: 10 },
});
