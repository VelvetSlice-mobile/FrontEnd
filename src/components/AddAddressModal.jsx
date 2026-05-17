import PropTypes from "prop-types";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
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
      const payload = {
        fk_Cliente_id_cliente: user?.id ?? user?.id_cliente,
        CEP: endereco.cep,
        logradouro: endereco.rua,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        nome_endereco: nomeEndereco.trim(),
      };
      if (isEditing) {
        await addressService.update(addressData.id_endereco, payload);
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
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>{isEditing ? "Editar endereço" : "Novo endereço"}</Text>

          <Text style={styles.label}>Referência</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Casa, Trabalho, Namorada"
            placeholderTextColor={Colors.secondary}
            value={nomeEndereco}
            onChangeText={setNomeEndereco}
            autoCapitalize="words"
          />

          <Text style={styles.label}>CEP</Text>
          <View style={styles.cepRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="00000-000"
              placeholderTextColor={Colors.secondary}
              value={endereco.cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={9}
              onBlur={() => buscarCep(endereco.cep)}
            />
            {loading && <ActivityIndicator size="small" color={Colors.primary} style={styles.cepLoader} />}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Rua</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="Preenchido pelo CEP"
            placeholderTextColor={Colors.secondary}
            value={endereco.rua}
            editable={false}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={Colors.secondary}
                value={endereco.numero}
                onChangeText={(txt) => atualizarEndereco("numero", txt)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                placeholder="Apto, Bloco..."
                placeholderTextColor={Colors.secondary}
                value={endereco.complemento}
                onChangeText={(txt) => atualizarEndereco("complemento", txt)}
              />
            </View>
          </View>

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="Preenchido pelo CEP"
            placeholderTextColor={Colors.secondary}
            value={endereco.bairro}
            editable={false}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Cidade"
                placeholderTextColor={Colors.secondary}
                value={endereco.cidade}
                editable={false}
              />
            </View>
            <View style={{ width: 70 }}>
              <Text style={styles.label}>UF</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="SP"
                placeholderTextColor={Colors.secondary}
                value={endereco.estado}
                editable={false}
              />
            </View>
          </View>

          <Button fullWidth onPress={handleSave} style={{ marginTop: 16 }} disabled={saving}>
            {saveLabel}
          </Button>

          {isEditing && onDelete ? (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(addressData)} disabled={saving}>
              <Trash2 size={16} color={Colors.accent} />
              <Text style={styles.deleteText}>Excluir endereço</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

AddAddressModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  user: PropTypes.shape({ id: PropTypes.number, id_cliente: PropTypes.number }),
  addressData: PropTypes.shape({
    id_endereco: PropTypes.number,
    nome_endereco: PropTypes.string,
  }),
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
    maxHeight: "85%",
  },
  handleArea: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.secondary, opacity: 0.4 },
  content: { paddingHorizontal: 22, paddingBottom: 8 },
  title: { fontFamily: Fonts.newsreader, fontSize: 22, color: Colors.primary, marginBottom: 12 },
  label: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary, marginBottom: 4, marginTop: 10, opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: "#fff",
  },
  inputDisabled: { backgroundColor: "#f0e8de", borderColor: Colors.secondary, opacity: 0.7 },
  cepRow: { flexDirection: "row", alignItems: "center" },
  cepLoader: { marginLeft: 10 },
  errorText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.accent, marginTop: 2 },
  row: { flexDirection: "row" },
  deleteBtn: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  deleteText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.accent, textDecorationLine: "underline" },
  cancelBtn: { marginTop: 2, paddingVertical: 8, alignItems: "center" },
  cancelText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.secondary },
});
