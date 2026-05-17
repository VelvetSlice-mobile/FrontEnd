import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { AddAddressModal } from "../src/components/AddAddressModal";
import { Button } from "../src/components/Button";
import { ConfirmDialog } from "../src/components/ConfirmDialog";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { IMAGES } from "../src/constants/Images";
import { useAuth } from "../src/contexts/AuthContext";
import { useToast } from "../src/contexts/ToastContext";
import { addressService } from "../src/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserAvatar } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const userId = user?.id ?? user?.id_cliente;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const loadAddress = async () => {
    setLoadingAddress(true);
    try {
      if (!userId) { setAddresses([]); return; }
      const data = await addressService.getByClientId(userId);
      setAddresses(Array.isArray(data) ? data : data ? [data] : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => { loadAddress(); }, [userId]);

  const settingsItems = [
    { label: "Alterar nome", value: user?.name || "Nome usuário", route: "/settings/edit-name" },
    { label: "Alterar telefone", value: user?.phone || "Não cadastrado", route: "/settings/edit-phone" },
    { label: "Alterar email", value: user?.email || "usuario@email.com", route: "/settings/edit-email" },
    { label: "Alterar senha", value: "••••••••••••", route: "/settings/edit-password" },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    logout();
    router.replace("/login");
    showToast("Conta removida com sucesso.", "info");
  };

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

  const handleSaveAddress = () => {
    loadAddress();
    setSelectedAddress(null);
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressTarget?.id_endereco) return;
    try {
      await addressService.delete(deleteAddressTarget.id_endereco, userId);
      setDeleteAddressTarget(null);
      setShowAddressModal(false);
      setSelectedAddress(null);
      loadAddress();
      showToast("Endereço removido.", "success");
    } catch {
      showToast("Não foi possível excluir o endereço.", "error");
    }
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
              <Camera size={16} color={Colors.background || "#FFF"} />
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

          <TouchableOpacity style={styles.settingCard} onPress={() => router.push("/orders")}>
            <Text style={styles.settingLabel}>Meus pedidos</Text>
            <ChevronRight size={16} color={Colors.accent || "#D4AF37"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={user ? handleLogout : () => router.push("/login")}
          >
            <Text style={styles.settingLabel}>{user ? "Sair" : "Entrar"}</Text>
            <ChevronRight size={16} color={Colors.accent || "#D4AF37"} />
          </TouchableOpacity>

          <View style={styles.addressSectionRow}>
            <Text style={styles.addressSectionTitle}>Meus endereços</Text>
            <TouchableOpacity
              style={styles.plusIconCircle}
              onPress={() => { setSelectedAddress(null); setShowAddressModal(true); }}
            >
              <Plus size={16} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {loadingAddress ? (
            <Text style={styles.addressHelperText}>Carregando...</Text>
          ) : addresses.length === 0 ? (
            <Text style={styles.addressHelperText}>
              Nenhum endereço cadastrado. Toque no "+" para adicionar.
            </Text>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((item) => {
                const isSelected = selectedAddress?.id_endereco === item.id_endereco;
                return (
                  <View
                    key={item.id_endereco}
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  >
                    <Image
                      source={require("../src/assets/images/mapa_endereco.png")}
                      style={styles.mapImage}
                      resizeMode="cover"
                    />
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressName}>{item.nome_endereco || "Casa"}</Text>
                      <Text style={styles.addressText}>
                        {`${item.logradouro || ""} - ${item.numero || "s/n"}\n${item.CEP || ""}`}
                      </Text>
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        onPress={() => { setSelectedAddress(item); setShowAddressModal(true); }}
                        style={styles.addressIconBtn}
                      >
                        <Pencil size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setDeleteAddressTarget(item)}
                        style={styles.addressIconBtn}
                      >
                        <Trash2 size={18} color={Colors.accent} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.settingCard} onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.deleteText}>Excluir minha conta</Text>
            <ChevronRight size={16} color={Colors.accent || "#D4AF37"} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de foto — opções */}
      <Modal visible={showPhotoOptions} transparent animationType="slide">
        <TouchableOpacity style={styles.photoOverlay} activeOpacity={1} onPress={() => setShowPhotoOptions(false)}>
          <View style={[styles.photoSheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.photoSheetTitle}>Foto de perfil</Text>
            <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
              <Text style={styles.photoOptionText}>Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={pickFromGallery}>
              <Text style={styles.photoOptionText}>Escolher da galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoOption, styles.photoCancel]} onPress={() => setShowPhotoOptions(false)}>
              <Text style={[styles.photoOptionText, { color: Colors.secondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showAddressModal} animationType="slide" transparent>
        <AddAddressModal
          onClose={() => { setShowAddressModal(false); setSelectedAddress(null); }}
          onSave={handleSaveAddress}
          onDelete={(address) => { setDeleteAddressTarget(address); setShowAddressModal(false); }}
          addressData={selectedAddress}
          user={user}
        />
      </Modal>

      <ConfirmDialog
        visible={showDeleteModal}
        type="danger"
        title="Excluir sua conta?"
        message="Esta ação é irreversível. Você perderá acesso a todos os seus dados."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmDialog
        visible={!!deleteAddressTarget}
        type="danger"
        title="Excluir endereço?"
        message="Este endereço será removido permanentemente."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteAddressTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  content: { paddingHorizontal: 22, paddingTop: 60, gap: 16 },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  subtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  avatarContainer: { alignSelf: "center", position: "relative", marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.secondary || "#ccc" },
  cameraButton: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: Colors.accent || "#D4AF37",
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.background || "#FFF",
  },
  settingCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.background, borderRadius: 12, padding: 16,
    shadowColor: Colors.primary || "#000", shadowOpacity: 0.1,
    shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  settingLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.accent },
  addressSectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  addressSectionTitle: { fontFamily: Fonts.newsreader, fontSize: 22, color: Colors.primary },
  plusIconCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  addressList: { width: "100%", gap: 10 },
  mapImage: { width: 70, height: "100%", borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  addressCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, padding: 7 },
  addressCardSelected: { borderColor: Colors.accent, borderWidth: 2, backgroundColor: "#fff6ee" },
  addressActions: { flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 8 },
  addressIconBtn: { padding: 6 },
  addressInfo: { flex: 1 },
  addressName: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  addressText: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary, lineHeight: 18 },
  addressHelperText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary, opacity: 0.8 },
  deleteText: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.accent },
  photoOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  photoSheet: { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 4 },
  photoSheetTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary, textAlign: "center", marginBottom: 8 },
  photoOption: { paddingVertical: 14, borderRadius: 10, alignItems: "center", backgroundColor: "#fff", marginBottom: 4 },
  photoCancel: { marginTop: 4, backgroundColor: "transparent" },
  photoOptionText: { fontFamily: Fonts.poppins, fontSize: 15, color: Colors.primary },
});
