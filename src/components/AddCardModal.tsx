import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Button } from './Button';

interface Props {
  onClose: () => void;
}

export function AddCardModal({ onClose }: Props) {
  const [holderName, setHolderName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleAdd = () => {
    Alert.alert('Sucesso', 'Cartão adicionado!');
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Adicionar cartão</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do titular</Text>
            <TextInput style={styles.input} placeholder="Digite o nome do titular do cartão" placeholderTextColor={Colors.secondary} value={holderName} onChangeText={setHolderName} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CPF do titular</Text>
            <TextInput style={styles.input} placeholder="Digite o CPF do titular do cartão" placeholderTextColor={Colors.secondary} value={cpf} onChangeText={setCpf} keyboardType="numeric" />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Número do cartão</Text>
            <TextInput style={styles.input} placeholder="Digite o número do cartão" placeholderTextColor={Colors.secondary} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput style={styles.input} placeholder="CVV" placeholderTextColor={Colors.secondary} value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={4} secureTextEntry />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Validade</Text>
              <TextInput style={styles.input} placeholder="MM/AAAA" placeholderTextColor={Colors.secondary} value={expiry} onChangeText={setExpiry} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button variant="outline" onPress={onClose}>Cancelar</Button>
            <Button onPress={handleAdd} style={{ flex: 1 }}>Adicionar cartão</Button>
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
