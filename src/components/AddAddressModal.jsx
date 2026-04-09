import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { addressService } from "../services/api";
import { Button } from "./Button";

export function AddAddressModal({ onClose, onSave, addressData, user }) {
  const userId = user?.id ?? user?.id_cliente;

  const [placeName, setPlaceName] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [cep, setCep] = useState("");
  const [uf, setUf] = useState("");
  const [complement, setComplement] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (addressData) {
      setPlaceName(addressData.nome_endereco || "");
      setStreet(addressData.logradouro || "");
      setNumber(addressData.numero?.toString() || "");
      setCep(addressData.CEP || "");
      setUf(addressData.estado || "");
      setComplement(addressData.complemento || "");
    } else {
      setPlaceName("");
      setStreet("");
      setNumber("");
      setCep("");
      setUf("");
      setComplement("");
    }
  }, [addressData]);

  const handleAdd = async () => {
    if (!placeName || !street || !cep) {
      Alert.alert("Atenção", "Por favor, preencha os campos principais.");
      return;
    }

    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado para vincular o endereço.");
      return;
    }

    const dadosEndereco = {
      nome_endereco: placeName,
      logradouro: street,
      numero: number,
      CEP: cep,
      estado: uf,
      complemento: complement,
      fk_Cliente_id_cliente: userId,
    };

    try {
      setIsSaving(true);
      let result;

      if (addressData?.id_endereco) {
        result = await addressService.update(
          addressData.id_endereco,
          dadosEndereco,
        );
        Alert.alert("Sucesso", "Endereço atualizado!");
      } else {
        const novoEndereco = await addressService.create(dadosEndereco);

        result = novoEndereco;
        Alert.alert("Sucesso", "Endereço salvo!");
      }

      if (onSave) onSave(result);
      if (onClose) onClose();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {addressData ? "Editar endereço" : "Adicionar endereço"}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do lugar (Ex: Casa, Trabalho)</Text>
            <TextInput
              style={styles.input}
              placeholder="Dê um nome ao lugar"
              value={placeName}
              onChangeText={setPlaceName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Logradouro</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, Avenida, etc."
              value={street}
              onChangeText={setStreet}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nº</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 2 }]}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                value={cep}
                onChangeText={setCep}
                keyboardType="numeric"
                maxLength={9}
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>UF</Text>
              <TextInput
                style={styles.input}
                placeholder="SP"
                value={uf}
                onChangeText={setUf}
                autoCapitalize="characters"
                maxLength={2}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              placeholder="Apto, Bloco, etc."
              value={complement}
              onChangeText={setComplement}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="outline"
              onPress={onClose}
              style={styles.cancelButton}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onPress={handleAdd} style={{ flex: 2 }} loading={isSaving}>
              {addressData ? "Salvar alterações" : "Adicionar"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: Colors.background || "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    maxHeight: "85%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 6,
  },
  label: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});
