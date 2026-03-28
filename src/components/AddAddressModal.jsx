import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Button } from './Button';

export function AddAddressModal({ onClose }) {
  const [placeName, setPlaceName] = useState('');
  const [street, setStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [number, setNumber] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [complement, setComplement] = useState('');

  const handleAdd = () => {
    if (!placeName || !street || !cep) {
      Alert.alert('Atenção', 'Por favor, preencha os campos principais.');
      return;
    }

    Alert.alert('Sucesso', 'Endereço adicionado!');
    if (onClose) onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Adicionar endereço</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do lugar</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Dê um nome ao lugar" 
              placeholderTextColor={Colors.secondary || '#999'} 
              value={placeName} 
              onChangeText={setPlaceName} 
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Logradouro</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o logradouro" 
              placeholderTextColor={Colors.secondary || '#999'} 
              value={street} 
              onChangeText={setStreet} 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nº</Text>
              <TextInput 
                style={styles.input} 
                placeholder="123" 
                placeholderTextColor={Colors.secondary} 
                value={number} 
                onChangeText={setNumber} 
                keyboardType="numeric" 
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 2 }]}>
              <Text style={styles.label}>CEP</Text>
              <TextInput 
                style={styles.input} 
                placeholder="00000-000" 
                placeholderTextColor={Colors.secondary} 
                value={cep} 
                onChangeText={setCep} 
                keyboardType="numeric" 
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>UF</Text>
              <TextInput 
                style={styles.input} 
                placeholder="SP" 
                placeholderTextColor={Colors.secondary} 
                value={uf} 
                onChangeText={setUf} 
                autoCapitalize="characters" 
                maxLength={2} 
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Apto, Bloco, etc." 
              placeholderTextColor={Colors.secondary} 
              value={complement} 
              onChangeText={setComplement} 
            />
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
              Adicionar
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
    gap: 10 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 10,
    marginBottom: 20 
  },
});