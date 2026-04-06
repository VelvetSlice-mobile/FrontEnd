import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Camera } from 'lucide-react-native';

import DeleteAccountModal from '../src/components/DeleteAccountModal';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { IMAGES } from '../src/constants/Images';
import { useAuth } from '../src/contexts/AuthContext';
import { Navbar } from '../src/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const settingsItems = [
    { label: 'Alterar nome', value: user?.name || 'Nome usuário', route: '/settings/edit-name' },
    { label: 'Alterar telefone', value: user?.phone || '(11) 9****-**95', route: '/settings/edit-phone' },
    { label: 'Alterar email', value: user?.email || 'usuario@email.com', route: '/settings/edit-email' },
    { label: 'Alterar senha', value: '**************', route: '/settings/edit-password' },]

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setShowDeleteModal(false);
      Alert.alert('Conta', 'Sua conta foi removida com sucesso.');
      logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar a conta agora.');
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      { text: 'Tirar foto', onPress: () => console.log('Camera') },
      { text: 'Escolher da galeria', onPress: () => console.log('Galeria') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Perfil</Text>

          <View style={styles.avatarContainer}>
            <Image
              source={IMAGES.profile?.avatar || { uri: 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
              <Camera size={16} color={Colors.background || '#FFF'} />
            </TouchableOpacity>
          </View>

          {settingsItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingCard} onPress={() => router.push(item.route)}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{item.value}</Text>
                <ChevronRight size={16} color={Colors.accent || '#D4AF37'} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.settingCard} onPress={handleLogout}>
            <Text style={styles.settingLabel}>Sair</Text>
            <ChevronRight size={16} color={Colors.accent || '#D4AF37'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Apagar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 100 },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  subtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary, marginBottom: 10 },
  avatarContainer: { alignSelf: 'center', position: 'relative', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.secondary || '#ccc' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.accent || '#D4AF37', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background || '#FFF' },
  settingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3, marginBottom: 8 },
  settingLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.accent },
  deleteButton: { marginTop: 20 },
  deleteText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.accent, textAlign: 'center', textDecorationLine: 'underline' },
});