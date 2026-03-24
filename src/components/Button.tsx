import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'solid' | 'outline';
}

export function Button({ children, fullWidth, variant = 'solid', style, ...rest }: ButtonProps) {
  const isSolid = variant === 'solid';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSolid ? styles.solid : styles.outline,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={[styles.text, isSolid ? styles.textSolid : styles.textOutline]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  solid: { backgroundColor: Colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.accent },
  text: { fontFamily: Fonts.newsreaderBold, fontSize: 16 },
  textSolid: { color: Colors.background },
  textOutline: { color: Colors.accent },
});
