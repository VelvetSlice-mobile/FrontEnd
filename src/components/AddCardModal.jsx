import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";

import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { Button } from "./Button";

export function AddCardModal({ onClose, onSave, cardData }) {
  const [holderName, setHolderName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardType, setCardType] = useState("credit"); // crédito ou débito
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cardData) {
      setHolderName(cardData.holder || "");
      setCpf(cardData.cpf || "");
      setCardNumber(cardData.number || "");
      setCvv(cardData.cvv || "");
      setExpiry(cardData.expiry || "");
      setCardType(cardData.type || "credito");
    } else {
      // resetar campos para um novo cartão
      setHolderName("");
      setCpf("");
      setCardNumber("");
      setCvv("");
      setExpiry("");
      setCardType("credito");
    }
  }, [cardData]);

  const handleAdd = () => {
    if (!holderName || !cpf || !cardNumber || !cvv || !expiry) {
      Alert.alert("Atenção", "Preencha todos os dados.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      Alert.alert("Atenção", "CPF inválido.");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert("Atenção", "Número do cartão inválido.");
      return;
    }

    if (!/^\d{2}\/\d{4}$/.test(expiry)) {
      Alert.alert("Atenção", "Validade inválida. Use MM/AAAA.");
      return;
    }

    setIsSaving(true);

    const newCard = {
      id: cardData?.id || Math.random().toString(36).substring(2, 9),
      holder: holderName,
      cpf,
      number: cardNumber,
      cvv,
      expiry,
      type: cardType,
    };
    // ... dentro de handleAdd
    setTimeout(() => {
      if (onSave) {
        onSave({
          number: cardNumber,
          selectedType: cardType, // Corrigido: era 'selectedType: selectedType' (que não existia)
          holder: holderName, // Corrigido: era 'name: cardName'
        });
      }
      Alert.alert(
        "Sucesso",
        cardData ? "Cartão atualizado!" : "Cartão adicionado!",
      );
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleExpiryChange = (text) => {
    const cleanText = text.replace(/\D/g, "");
    let formatted = cleanText;
    if (cleanText.length > 2) {
      formatted = cleanText.slice(0, 2) + "/" + cleanText.slice(2, 6);
    }
    setExpiry(formatted);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {cardData ? "Editar cartão" : "Adicionar cartão"}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de cartão</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  cardType === "credit" && styles.typeButtonActive,
                ]}
                onPress={() => setCardType("credit")}
              >
                <Text
                  style={[
                    styles.typeText,
                    cardType === "credit" && styles.typeTextActive,
                  ]}
                >
                  Crédito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  cardType === "debito" && styles.typeButtonActive,
                ]}
                onPress={() => setCardType("debito")}
              >
                <Text
                  style={[
                    styles.typeText,
                    cardType === "debito" && styles.typeTextActive,
                  ]}
                >
                  Débito
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do titular</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome como está no cartão"
              placeholderTextColor={Colors.secondary || "#999"}
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
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, backgroundColor: "transparent", elevation: 0 }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onPress={handleAdd} style={{ flex: 2 }} loading={isSaving}>
              {cardData ? "Atualizar cartão" : "Adicionar cartão"}
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
    shadowColor: "#000",
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
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    color: Colors.primary,
    fontFamily: Fonts.poppins,
    fontSize: 14,
  },
  typeTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
