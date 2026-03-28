import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Importação de constantes
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

/**
 * Componente de Botão Customizado
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do botão (texto ou ícone)
 * @param {boolean} props.fullWidth - Se o botão deve ocupar 100% da largura
 * @param {'solid' | 'outline'} props.variant - Estilo visual do botão
 * @param {Object} props.style - Estilos adicionais passados via prop
 */
export function Button({ 
  children, 
  fullWidth, 
  variant = 'solid', 
  style, 
  ...rest 
}) {
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
      <Text style={[
        styles.text, 
        isSolid ? styles.textSolid : styles.textOutline
      ]}>
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
    // Adicionado um feedback visual de toque para Android
    elevation: 2,
  },
  fullWidth: { 
    width: '100%' 
  },
  solid: { 
    backgroundColor: Colors.accent || '#D4AF37' 
  },
  outline: { 
    backgroundColor: 'transparent', 
    borderWidth: 1.5, 
    borderColor: Colors.accent || '#D4AF37' 
  },
  text: { 
    fontFamily: Fonts.newsreaderBold, 
    fontSize: 16 
  },
  textSolid: { 
    color: Colors.background || '#FFF' 
  },
  textOutline: { 
    color: Colors.accent || '#D4AF37' 
  },
});