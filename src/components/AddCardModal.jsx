import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Button } from './Button';

export function AddCardModal({ onClose }) {
  const [holderName, setHolderName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleAdd = () => {
    if (!holderName || !cardNumber || !cvv || !expiry) {
      Alert.alert('Atenção', 'Por favor, preencha os dados do cartão.');
      return;
    }

    Alert.alert('Sucesso', 'Cartão adicionado!');
    if (onClose) onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Adicionar cartão</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do titular</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o nome como está no cartão" 
              placeholderTextColor={Colors.secondary || '#999'} 
              value={holderName} 
              onChangeText={setHolderName} 
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CPF do titular</Text>
            <TextInput 
              style={styles.input} 
              placeholder="000.000.000-00" 
              placeholderTextColor={Colors.secondary} 
              value={cpf} 
              onChangeText={setCpf} 
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Número do cartão</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0000 0000 0000 0000" 
              placeholderTextColor={Colors.secondary} 
              value={cardNumber} 
              onChangeText={setCardNumber} 
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput 
                style={styles.input} 
                placeholder="123" 
                placeholderTextColor={Colors.secondary} 
                value={cvv} 
                onChangeText={setCvv} 
                keyboardType="numeric" 
                maxLength={4} 
                secureTextEntry 
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Validade</Text>
              <TextInput 
                style={styles.input} 
                placeholder="MM/AAAA" 
                placeholderTextColor={Colors.secondary} 
                value={expiry} 
                onChangeText={setExpiry} 
                keyboardType="numeric" 
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              variant="outline" 
              onPress={onClose}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button 
              onPress={handleAdd} 
              style={{ flex: 2 }}
            >
              Adicionar cartão
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
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modal: {
    backgroundColor: Colors.background || '#FFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    padding: 22, 
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  title: { 
    fontFamily: Fonts.newsreader, 
    fontSize: 24, 
    color: Colors.primary, 
    marginBottom: 20,
    textAlign: 'center'
  },
  fieldGroup: { 
    marginBottom: 16, 
    gap: 6 
  },
  label: { 
    fontFamily: Fonts.poppins, 
    fontSize: 14, 
    color: Colors.primary 
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
    flexDirection: 'row', 
    gap: 12 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 10,
    marginBottom: 20 
  },
});