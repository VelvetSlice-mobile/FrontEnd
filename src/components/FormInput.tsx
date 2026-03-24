import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff, Mail } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: 'mail' | 'password';
}

export function FormInput({ label, icon, secureTextEntry, style, ...rest }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = icon === 'password' || secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.secondary}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {icon === 'mail' && (
          <Mail size={20} color={Colors.primary} style={styles.icon} />
        )}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
