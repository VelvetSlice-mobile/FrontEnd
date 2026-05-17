<<<<<<< Updated upstream
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bell } from 'lucide-react-native';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
export function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>Bem vindos a</Text>
          <Text style={styles.title}>Velvet Slice</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => Alert.alert('Notificações', 'Você não tem novas mensagens.')}
        >
          <Bell size={18} color={Colors.background || '#FFF'} />
=======
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

export function Header({ title, showBack = false }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/")}>
              <Text style={styles.subtitle}>Bem vindos a</Text>
              <Text style={styles.title}>Velvet Slice</Text>
            </TouchableOpacity>
          )}
          {showBack && <Text style={styles.pageTitle}>{title || ""}</Text>}
        </View>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push("/notifications")}
        >
          <Bell size={18} color={Colors.background} />
>>>>>>> Stashed changes
        </TouchableOpacity>
      </View>
    </View>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  showBack: PropTypes.bool,
};

const styles = StyleSheet.create({
  header: {
<<<<<<< Updated upstream
    backgroundColor: Colors.primary || '#1A1A1A',
    paddingTop: 60, 
=======
    backgroundColor: Colors.primary,
    paddingTop: 60,
>>>>>>> Stashed changes
    paddingBottom: 25,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 8,
<<<<<<< Updated upstream
    shadowColor: Colors.primary || '#000',
=======
    shadowColor: Colors.primary,
>>>>>>> Stashed changes
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
<<<<<<< Updated upstream
    color: Colors.secondary || '#ccc',
=======
    color: Colors.secondary,
>>>>>>> Stashed changes
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 28,
<<<<<<< Updated upstream
    color: Colors.background || '#FFF',
  },
  bellButton: {
    backgroundColor: Colors.secondary || '#ccc',
=======
    color: Colors.background,
  },
  pageTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 22,
    color: Colors.background,
  },
  backButton: {
    padding: 4,
  },
  bellButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
>>>>>>> Stashed changes
    padding: 10,
    borderRadius: 10,
  },
});