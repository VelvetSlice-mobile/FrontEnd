import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext'; // Importe necessário

export default function EditNamePage() {
  const router = useRouter();
  const { user, updateUserData } = useAuth(); // Pega a função do contexto

  // Iniciamos o state com o nome atual do usuário para facilitar a edição
  const [name, setName] = useState(user?.name || '');

  const handleSave = async () => {
    // VALIDAÇÃO
    if (name.trim().length < 3) {
      return Alert.alert("Ops!", "O nome precisa ter pelo menos 3 letras.");
    }

    // Se o nome for igual ao atual, apenas volta sem gastar processamento
    if (name.trim() === user?.name) {
      return router.back();
    }

    const result = await updateUserData({ name: name.trim() });

    if (result.success) {
      Alert.alert("Sucesso", "Nome atualizado!");
      router.back();
    } else {
      Alert.alert("Erro", "Não foi possível atualizar o nome.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Editar nome de usuário</Text>

        <Text style={styles.description}>
          Altere seu nome de usuário para manter suas informações atualizadas na plataforma.
        </Text>

        <FormInput
          label="Como deseja ser chamado?"
          placeholder="Seu nome completo"
          value={name}
          onChangeText={setName}
        />

        <Button fullWidth onPress={handleSave} style={styles.buttonMargin}>
          Salvar Alterações
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
    gap: 16 // Aumentei um pouco o gap para respirar melhor
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
    marginBottom: 10,
    opacity: 0.8
  },
  buttonMargin: {
    marginTop: 10
  }
});
