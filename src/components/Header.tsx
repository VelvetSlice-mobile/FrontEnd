import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

export function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>Bem vindos a</Text>
          <Text style={styles.title}>Velvet Slice</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={16} color={Colors.background} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/search' as never)}
      >
        <Search size={14} color={Colors.secondary} />
        <Text style={styles.searchText}>Pesquisar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 16,
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    gap: 4,
  },
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.secondary,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.background,
  },
  bellButton: {
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 4,
  },
  searchBar: {
    backgroundColor: Colors.background,
    height: 30,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  searchText: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
  },
});
