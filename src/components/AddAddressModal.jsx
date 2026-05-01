import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useViaCep } from "../hooks/useViaCep";
import { addressService } from "../services/api";
import { Button } from "./Button";

export function AddAddressModal({ onClose, onSave, user, addressData }) {
  const { endereco, loading, error, buscarCep, atualizarEndereco } = useViaCep(addressData);
  const [saving, setSaving] = useState(false);
  
  // NOVO: Estado para a referência do endereço
  const [nomeEndereco, setNomeEndereco] = useState(addressData?.nome_endereco || "");

  const handleCepChange = (texto) => {
    atualizarEndereco('cep', texto);
    if (texto.replace(/\D/g, '').length === 8) {
      buscarCep(texto);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (!endereco.cep || !endereco.rua || !endereco.numero || !nomeEndereco) {
      Alert.alert("Atenção", "Preencha a Referência, o CEP e o Número.");
      return;
    }

    setSaving(true);
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
        nome_endereco: nomeEndereco,
      };

      if (addressData?.id_endereco) {
        await addressService.update(addressData.id_endereco, payload);
      } else {
        await addressService.create(payload);
      }

      onClose(); 
      onSave(); 
      
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar o endereço.");
      setSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBody}>
        <Text style={styles.title}>{addressData ? "Editar Endereço" : "Novo Endereço"}</Text>

        <TextInput
          style={styles.input}
          placeholder="Referência (Ex: Casa, Trabalho, Namorada)"
          value={nomeEndereco}
          onChangeText={setNomeEndereco}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={endereco.cep}
          onChangeText={handleCepChange}
          keyboardType="numeric"
          maxLength={9}
          onBlur={() => buscarCep(endereco.cep)}
        />
        
        {loading && <ActivityIndicator size="small" color={Colors.primary} />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={[styles.input, styles.inputDisabled]}
          placeholder="Rua"
          value={endereco.rua}
          editable={false}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Número"
            value={endereco.numero}
            onChangeText={(txt) => atualizarEndereco('numero', txt)}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Complemento"
            value={endereco.complemento}
            onChangeText={(txt) => atualizarEndereco('complemento', txt)}
          />
        </View>

        <TextInput
          style={[styles.input, styles.inputDisabled]}
          placeholder="Bairro"
          value={endereco.bairro}
          editable={false}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputDisabled, { flex: 1, marginRight: 10 }]}
            placeholder="Cidade"
            value={endereco.cidade}
            editable={false}
          />
          <TextInput
            style={[styles.input, styles.inputDisabled, { width: 60 }]}
            placeholder="UF"
            value={endereco.estado}
            editable={false}
          />
        </View>

        <Button fullWidth onPress={handleSave} style={{ marginTop: 10 }} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>

        <TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={saving}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "center", padding: 20 },
  modalBody: { backgroundColor: "#FFF", borderRadius: 16, padding: 20 },
  title: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff' },
  inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' },
  errorText: { color: 'red', marginBottom: 10, fontFamily: Fonts.poppins, fontSize: 12 },
  row: { flexDirection: 'row' },
  cancelBtn: { marginTop: 15, padding: 10 },
  cancelText: { textAlign: "center", color: "#999", fontFamily: Fonts.poppins }
});