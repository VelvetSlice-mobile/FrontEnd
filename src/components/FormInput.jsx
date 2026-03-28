import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff, Mail } from 'lucide-react-native';

// Importação de constantes
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

/**
 * Componente de Input de Formulário customizado
 * @param {Object} props
 * @param {string} props.label - Rótulo do campo
 * @param {'mail' | 'password'} props.icon - Ícone a ser exibido
 * @param {boolean} props.secureTextEntry - Se o texto deve ser ocultado
 */
export function FormInput({ label, icon, secureTextEntry, style, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Define se é um campo de senha baseado no ícone ou na prop nativa
  const isPassword = icon === 'password' || secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.secondary || '#999'}
          // Se for senha, alterna entre ocultar e mostrar conforme o estado showPassword
          secureTextEntry={isPassword ? !showPassword : false}
          {...rest}
        />

        {/* Ícone de E-mail */}
        {icon === 'mail' && (
          <Mail size={20} color={Colors.primary} style={styles.icon} />
        )}

        {/* Lógica de Olho (Mostrar/Ocultar Senha) */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
            // hitSlop aumenta a área de clique para facilitar o toque no celular
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            {showPassword ? (
              <Eye size={20} color={Colors.secondary} />
            ) : (
              <EyeOff size={20} color={Colors.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 12, // Margem inferior para separar os inputs no formulário
  },
  label: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
    height: '100%',
  },
  icon: {
    marginLeft: 8,
  },
});