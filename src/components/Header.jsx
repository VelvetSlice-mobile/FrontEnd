import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

export function Header({ title, showBack = false }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.background || '#FFF'} />
            </TouchableOpacity>
          )}
          
          <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>{showBack ? '' : 'Bem vindos a'}</Text>
            <Text style={styles.title}>{title || 'Velvet Slice'}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={20} color={Colors.background || '#FFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary || '#1A1A1A',
    paddingTop: 60, 
    paddingBottom: 25,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 8,
    shadowColor: Colors.primary || '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    gap: 0,
  },
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 14,
    color: Colors.secondary || '#ccc',
    marginBottom: -4,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 26,
    color: Colors.background || '#FFF',
  },
  bellButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 12,
  },
  backButton: {
    padding: 4,
  }
});