import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Camera } from 'lucide-react-native';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { IMAGES } from '../src/constants/Images';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from '../src/components/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const settingsItems = [
    { label: 'Alterar nome', value: user?.name || 'Nome usuario', route: '/settings/edit-name' },
    { label: 'Alterar telefone', value: '(11)9****-**95', route: '/settings/edit-phone' },
    { label: 'Alterar email', value: user?.email || 'nl********@gmail.com', route: '/settings/edit-email' },
    { label: 'Alterar senha', value: '**************', route: '/settings/edit-password' },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    Alert.alert('Conta', 'Conta apagada com sucesso');
    logout();
    router.replace('/login');
  };

  const handleChangePhoto = () => {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      { text: 'Tirar foto', onPress: () => {} },
      { text: 'Escolher da galeria', onPress: () => {} },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Perfil</Text>

          {/* Avatar with camera button */}
          <View style={styles.avatarContainer}>
            <Image source={IMAGES.profile.avatar} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
              <Camera size={16} color={Colors.background} />
            </TouchableOpacity>
          </View>

          {/* Settings Items */}
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingCard}
              onPress={() => router.push(item.route as never)}
            >
              <Text style={styles.settingLabel}>{item.label}</Text>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{item.value}</Text>
                <ChevronRight size={16} color={Colors.accent} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.settingCard} onPress={handleLogout}>
            <Text style={styles.settingLabel}>Sair</Text>
            <ChevronRight size={16} color={Colors.accent} />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.deleteText}>Apagar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar />

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🥚</Text>
            <Text style={styles.modalTitle}>Deseja apagar sua conta?</Text>
            <Text style={styles.modalDescription}>
              Está ação é irreversivel, após essa ação você perderá acesso a todos os seus dados
            </Text>
            <View style={styles.modalButtons}>
              <Button variant="outline" onPress={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button onPress={handleDeleteAccount}>
                Confirmar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  subtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  avatarContainer: { alignSelf: 'center', position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 100, borderWidth: 2, borderColor: Colors.secondary },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: Colors.accent, width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  settingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: 12, padding: 16,
    shadowColor: Colors.primary, shadowOpacity: 0.24, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  settingLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.accent },
  deleteText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.accent, textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: {
    backgroundColor: Colors.background, borderRadius: 12, padding: 24, width: 330,
    alignItems: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOpacity: 0.24, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  modalIcon: { fontSize: 37 },
  modalTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary, textAlign: 'center' },
  modalDescription: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 16, marginTop: 8 },
});
