import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddAddressModal } from "../src/components/AddAddressModal";

import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { IMAGES } from "../src/constants/Images";
import { useAuth } from "../src/contexts/AuthContext";
import { addressService } from "../src/services/api";

import { Button } from "../src/components/Button";
import { Navbar } from "../src/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserAvatar } = useAuth();
  const userId = user?.id ?? user?.id_cliente;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const loadAddress = async () => {
    setLoadingAddress(true);
    try {
      if (!userId) {
        setAddresses([]);
        return;
      }

      const data = await addressService.getByClientId(userId);
      setAddresses(Array.isArray(data) ? data : data ? [data] : []);
    } catch (error) {
      setAddresses([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    loadAddress();
  }, [userId]);

  const settingsItems = [
    {
      label: "Alterar nome",
      value: user?.name || "Nome usuário",
      route: "/settings/edit-name",
    },
    {
      label: "Alterar telefone",
      value: user?.phone || "Telefone não cadastrado",
      route: "/settings/edit-phone",
    },
    {
      label: "Alterar email",
      value: user?.email || "usuario@email.com",
      route: "/settings/edit-email",
    },
    {
      label: "Alterar senha",
      value: "**************",
      route: "/settings/edit-password",
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    Alert.alert("Conta", "Conta apagada com sucesso");
    logout();
    router.replace("/login");
  };

  const uploadSelectedImage = async (imageUri) => {
    setUploadingPhoto(true);
    const result = await updateUserAvatar(imageUri);
    setUploadingPhoto(false);

    if (!result.success) {
      Alert.alert(
        "Erro",
        result.message || "Não foi possível atualizar a foto.",
      );
      return;
    }

    Alert.alert("Sucesso", "Foto de perfil atualizada.");
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita acesso à galeria para continuar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita acesso à câmera para continuar.",
      );
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

  const handleChangePhoto = () => {
    if (uploadingPhoto) return;

    Alert.alert("Foto de perfil", "Escolha uma opção", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSaveAddress = () => {
    loadAddress();
    setSelectedAddress(null);
  };

  const handleDeleteAddress = (address) => {
    if (!address?.id_endereco) return;

    Alert.alert(
      "Excluir endereço",
      "Tem certeza? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await addressService.delete(address.id_endereco, userId);
              setShowAddressModal(false);
              setSelectedAddress(null);
              loadAddress();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o endereço.");
            }
          },
        },
      ],
    );
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
              source={
                user?.avatarUrl || user?.avatar_url
                  ? { uri: user?.avatarUrl || user?.avatar_url }
                  : IMAGES.profile?.avatar || {
                      uri: "https://via.placeholder.com/100",
                    }
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
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
                <ChevronRight size={16} color={Colors.accent || "#D4AF37"} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => router.push("/orders")}
          >
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
              onPress={() => {
                setSelectedAddress(null);
                setShowAddressModal(true);
              }}
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
              {addresses.map((item) => (
                <TouchableOpacity
                  key={item.id_endereco}
                  style={styles.addressCard}
                  onPress={() => {
                    setSelectedAddress(item);
                    setShowAddressModal(true);
                  }}
                >
                  <Image
                    source={require("../src/assets/images/mapa_endereco.png")}
                    style={styles.mapImage}
                    resizeMode="cover"
                  />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>
                      {item.nome_endereco || "Casa"}
                    </Text>
                    <Text style={styles.addressText}>
                      {`${item.logradouro || ""} - ${item.numero || "s/n"}\n${item.CEP || ""}`}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.deleteText}>Excluir minha conta</Text>
            <ChevronRight size={16} color={Colors.accent || "#D4AF37"} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />

      <Modal visible={showAddressModal} animationType="slide" transparent>
        <AddAddressModal
          onClose={() => {
            setShowAddressModal(false);
            setSelectedAddress(null);
          }}
          onSave={handleSaveAddress}
          onDelete={handleDeleteAddress}
          addressData={selectedAddress}
          user={user}
        />
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Deseja apagar sua conta?</Text>
            <Text style={styles.modalDescription}>
              Esta ação é irreversível. Após essa ação você perderá acesso a
              todos os seus dados.
            </Text>

            <View style={styles.modalButtons}>
              <Button
                variant="outline"
                onPress={() => setShowDeleteModal(false)}
                style={styles.flex1}
              >
                Cancelar
              </Button>
              <Button onPress={handleDeleteAccount} style={styles.flex1}>
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
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.secondary || "#ccc",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent || "#D4AF37",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background || "#FFF",
  },
  settingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.primary || "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  settingLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: {
    fontFamily: Fonts.poppins,
    fontSize: 13,
    color: Colors.accent,
  },
  addressSectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  addressSectionTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 22,
    color: Colors.primary,
  },
  plusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addressList: {
    width: "100%",
    gap: 10,
  },
  mapImage: {
    width: 70,
    height: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 7,
  },
  addressInfo: { flex: 1 },
  addressName: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 20,
    color: Colors.primary,
  },
  addressText: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary,
    lineHeight: 18,
  },
  addressHelperText: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.8,
  },
  deleteText: {
    fontFamily: Fonts.newsreader,
    fontSize: 20,
    color: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    gap: 12,
    elevation: 10,
  },
  modalIcon: { fontSize: 40 },
  modalTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 22,
    color: Colors.primary,
    textAlign: "center",
  },
  modalDescription: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary,
    textAlign: "center",
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
    width: "100%",
  },
  flex1: { flex: 1 },
});
