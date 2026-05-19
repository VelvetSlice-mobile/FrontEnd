import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdminNavbar } from "../../src/components/AdminNavbar";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { IMAGES } from "../../src/constants/Images";
import { useAuth } from "../../src/contexts/AuthContext";
import { useToast } from "../../src/contexts/ToastContext";

export default function AdminPerfil() {
  const router = useRouter();
  const { user, logout, updateUserAvatar } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const settingsItems = [
    { label: "Alterar nome", value: user?.name || "Nome usuário", route: "/settings/edit-name" },
    { label: "Alterar telefone", value: user?.phone || "Não cadastrado", route: "/settings/edit-phone" },
    { label: "Alterar email", value: user?.email || "usuario@email.com", route: "/settings/edit-email" },
    { label: "Alterar senha", value: "••••••••••••", route: "/settings/edit-password" },
  ];

  const uploadSelectedImage = async (imageUri) => {
    setUploadingPhoto(true);
    const result = await updateUserAvatar(imageUri);
    setUploadingPhoto(false);
    if (result.success) {
      showToast("Foto de perfil atualizada.", "success");
    } else {
      showToast(result.message || "Não foi possível atualizar a foto.", "error");
    }
  };

  const pickFromGallery = async () => {
    setShowPhotoOptions(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Permita acesso à galeria para continuar.", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setShowPhotoOptions(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast("Permita acesso à câmera para continuar.", "warning");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadSelectedImage(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace("/login");
  };

  const navbarHeight = 60 + insets.bottom;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: navbarHeight + 32 }]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Perfil</Text>

          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.avatarUrl || user?.avatar_url
                  ? { uri: user?.avatarUrl || user?.avatar_url }
                  : IMAGES.profile?.avatar || { uri: "https://via.placeholder.com/100" }
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => !uploadingPhoto && setShowPhotoOptions(true)}
              disabled={uploadingPhoto}
            >
              <Camera size={16} color={Colors.background} />
            </TouchableOpacity>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Administrador</Text>
          </View>

          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingCard}
              onPress={() => router.push(item.route)}
            >
              <Text style={styles.settingLabel}>{item.label}</Text>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue} numberOfLines={1}>{item.value}</Text>
                <ChevronRight size={16} color={Colors.accent} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.settingLabel}>Sair</Text>
            <ChevronRight size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPhotoOptions} transparent animationType="slide">
        <TouchableOpacity
          style={styles.photoOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoOptions(false)}
        >
          <View style={[styles.photoSheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.photoSheetTitle}>Foto de perfil</Text>
            <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
              <Text style={styles.photoOptionText}>Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={pickFromGallery}>
              <Text style={styles.photoOptionText}>Escolher da galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoOption, styles.photoCancel]}
              onPress={() => setShowPhotoOptions(false)}
            >
              <Text style={[styles.photoOptionText, { color: Colors.secondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmDialog
        visible={showLogoutModal}
        type="warning"
        title="Sair da conta?"
        message="Você será redirecionado para a tela de login."
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <AdminNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  subtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  avatarContainer: { alignSelf: "center", position: "relative", marginBottom: 4 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.secondary },
  cameraButton: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: Colors.accent,
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.background,
  },
  roleBadge: {
    alignSelf: "center",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 4,
  },
  roleBadgeText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.background },
  settingCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.background, borderRadius: 12, padding: 16,
    shadowColor: Colors.primary, shadowOpacity: 0.1,
    shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  settingLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: "55%" },
  settingValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.accent },
  photoOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  photoSheet: {
    backgroundColor: Colors.background, borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, gap: 4,
  },
  photoSheetTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary, textAlign: "center", marginBottom: 8 },
  photoOption: { paddingVertical: 14, borderRadius: 10, alignItems: "center", backgroundColor: "#fff", marginBottom: 4 },
  photoCancel: { marginTop: 4, backgroundColor: "transparent" },
  photoOptionText: { fontFamily: Fonts.poppins, fontSize: 15, color: Colors.primary },
});
