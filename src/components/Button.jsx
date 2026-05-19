import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

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

Button.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['solid', 'outline']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  fullWidth: { width: '100%' },
  solid: { backgroundColor: Colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent },
  text: { fontFamily: Fonts.newsreaderBold, fontSize: 16 },
  textSolid: { color: Colors.background },
  textOutline: { color: Colors.accent },
});