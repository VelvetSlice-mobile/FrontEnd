import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Search, ShoppingCart, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const getColor = (path: string) =>
    isActive(path) ? Colors.accent : Colors.primary;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/')} style={styles.iconContainer}>
        <Home color={getColor('/')} size={22} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconContainer}>
        <Search color={getColor('/search')} size={20} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/cart')} style={styles.iconContainer}>
        <ShoppingCart color={getColor('/cart')} size={20} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/profile')} style={styles.iconContainer}>
        <User color={getColor('/profile')} size={22} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79,44,29,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: { padding: 10 },
});
