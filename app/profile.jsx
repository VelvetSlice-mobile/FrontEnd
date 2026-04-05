import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Camera } from 'lucide-react-native';

import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { IMAGES } from '../src/constants/Images';
import { useAuth } from '../src/contexts/AuthContext';

import { Navbar } from '../src/components/Navbar';
import { Button } from '../src/components/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const settingsItems = [
    { 
      label: 'Alterar nome', 
      value: user?.name || 'Nome usuário', 
      route: '/settings/edit-name' 
    },
    { 
      label: 'Alterar telefone', 
      value: '(11) 9****-**95', 
      route: '/settings/edit-phone' 
    },
    { 
      label: 'Alterar email', 
      value: user?.email || 'usuario@email.com', 
      route: '/settings/edit-email' 
    },
    { 
      label: 'Alterar senha', 
      value: '**************', 
      route: '/settings/edit-password' 
    },
    {
      label: 'Meus Pedidos', 
      value: 'Ver histórico', 
      route: '/orders'
    },
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
      { text: 'Tirar foto', onPress: () => console.log('Camera') },
      { text: 'Escolher da galeria', onPress: () => console.log('Galeria') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
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
            <TouchableOpacity
              key={item.label}
              style={styles.settingCard}
              onPress={() => router.push(item.route)}
            >
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

          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.deleteText}>Apagar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Deseja apagar sua conta?</Text>
            <Text style={styles.modalDescription}>
              Esta ação é irreversível. Após essa ação você perderá acesso a todos os seus dados.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button 
                variant="outline" 
                onPress={() => setShowDeleteModal(false)}
                style={styles.flex1}
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleDeleteAccount}
                style={styles.flex1}
              >
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
  scrollContent: { paddingBottom: 100 },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  subtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  avatarContainer: { alignSelf: 'center', position: 'relative', marginBottom: 10 },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 2, 
    borderColor: Colors.secondary || '#ccc' 
  },
  cameraButton: {
    position: 'absolute', 
    bottom: 0, 
    right: 0,
    backgroundColor: Colors.accent || '#D4AF37', 
    width: 32, 
    height: 32, 
    borderRadius: 16,
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2, 
    borderColor: Colors.background || '#FFF',
  },
  settingCard: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: Colors.background, 
    borderRadius: 12, 
    padding: 16,
    shadowColor: Colors.primary || '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3,
  },
  settingLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.accent },
  deleteText: { 
    fontFamily: Fonts.poppins, 
    fontSize: 14, 
    color: Colors.accent, 
    textAlign: 'center', 
    marginTop: 20 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalCard: {
    backgroundColor: Colors.background, 
    borderRadius: 16, 
    padding: 24, 
    width: '85%',
    alignItems: 'center', 
    gap: 12,
    elevation: 10,
  },
  modalIcon: { fontSize: 40 },
  modalTitle: { 
    fontFamily: Fonts.newsreader, 
    fontSize: 22, 
    color: Colors.primary, 
    textAlign: 'center' 
  },
  modalDescription: { 
    fontFamily: Fonts.newsreader, 
    fontSize: 15, 
    color: Colors.primary, 
    textAlign: 'center',
    opacity: 0.8 
  },
  modalButtons: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 15,
    width: '100%' 
  },
  flex1: { flex: 1 },
});