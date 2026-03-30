import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Bell, Search } from "lucide-react-native";
import { useRouter, usePathname } from 'expo-router'; 
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

interface HeaderProps {
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
}

export function Header({ value, onChangeText, autoFocus }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname(); 

  const handleSearchChange = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }

    if (pathname === "/" && text.length > 0) {
      router.push({
        pathname: "/search",
        params: { q: text }, 
      });
    }
  };

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

      <View style={styles.searchBar}>
        <Search size={14} color={Colors.secondary} />
        <TextInput
          style={styles.searchInputField}
          placeholder="Pesquisar"
          placeholderTextColor={Colors.secondary}
          value={value}
          onChangeText={handleSearchChange}
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
        />
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  searchText: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
  },
  searchInputField: {
    flex: 1,
    fontFamily: Fonts.poppins,
    fontSize: 12,
    color: Colors.secondary,
    height: "100%",
    padding: 0,
    ...({ outlineStyle: 'none' } as any),
  },
});
