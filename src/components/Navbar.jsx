import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Search, ShoppingCart, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

import { Colors } from '../constants/Colors';

/**
 * Componente de Barra de Navegação Inferior
 * Gerencia a navegação principal e destaca o ícone da página ativa
 */
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Verifica se a rota atual corresponde ao caminho do ícone
   * @param {string} path 
   * @returns {boolean}
   */
  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  /**
   * Define a cor do ícone baseada no estado ativo
   * @param {string} path 
   * @returns {string}
   */
  const getColor = (path) =>
    isActive(path) ? (Colors.accent || '#D4AF37') : (Colors.primary || '#4F2C1D');

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => router.push('/')} 
        style={styles.iconContainer}
        activeOpacity={0.7}
      >
        <Home color={getColor('/')} size={24} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => router.push('/search')} 
        style={styles.iconContainer}
        activeOpacity={0.7}
      >
        <Search color={getColor('/search')} size={22} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => router.push('/cart')} 
        style={styles.iconContainer}
        activeOpacity={0.7}
      >
        <ShoppingCart color={getColor('/cart')} size={22} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => router.push('/profile')} 
        style={styles.iconContainer}
        activeOpacity={0.7}
      >
        <User color={getColor('/profile')} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 75,
    backgroundColor: Colors.background || '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79,44,29,0.1)',
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    paddingBottom: 10,
  },
  iconContainer: { 
    padding: 12,
    borderRadius: 20,
  },
});