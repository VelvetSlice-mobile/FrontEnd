import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Button } from './Button';

interface Props {
  onClose: () => void;
}

export function AddAddressModal({ onClose }: Props) {
  const [placeName, setPlaceName] = useState('');
  const [street, setStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [number, setNumber] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [complement, setComplement] = useState('');

  const handleAdd = () => {
    Alert.alert('Sucesso', 'Endereço adicionado!');
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Adicionar endereço</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do lugar</Text>
            <TextInput style={styles.input} placeholder="De um nome do lugar" placeholderTextColor={Colors.secondary} value={placeName} onChangeText={setPlaceName} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Logradouro</Text>
            <TextInput style={styles.input} placeholder="Digite o logradouro do endereço" placeholderTextColor={Colors.secondary} value={street} onChangeText={setStreet} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Número do endereço</Text>
            <TextInput style={styles.input} placeholder="Digite o número do endereço" placeholderTextColor={Colors.secondary} value={addressNumber} onChangeText={setAddressNumber} keyboardType="numeric" />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Número</Text>
              <TextInput style={styles.input} placeholder="Ex: 123" placeholderTextColor={Colors.secondary} value={number} onChangeText={setNumber} keyboardType="numeric" />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>CEP</Text>
              <TextInput style={styles.input} placeholder="Digite o CEP" placeholderTextColor={Colors.secondary} value={cep} onChangeText={setCep} keyboardType="numeric" />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>UF</Text>
              <TextInput style={styles.input} placeholder="Ex: SP" placeholderTextColor={Colors.secondary} value={uf} onChangeText={setUf} autoCapitalize="characters" maxLength={2} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput style={styles.input} placeholder="Digite o complemento do endereço" placeholderTextColor={Colors.secondary} value={complement} onChangeText={setComplement} />
          </View>

          <View style={styles.buttonRow}>
            <Button variant="outline" onPress={onClose}>Cancelar</Button>
            <Button onPress={handleAdd} style={{ flex: 1 }}>Adicionar endereço</Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 22, maxHeight: '80%',
  },
  title: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary, marginBottom: 16 },
  fieldGroup: { marginBottom: 16, gap: 8 },
  label: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary },
  input: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 12, height: 44, fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary,
  },
  row: { flexDirection: 'row', gap: 10 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
