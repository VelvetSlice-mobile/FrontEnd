import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
export function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => router.push("/")}
          activeOpacity={0.8}
        >
          <Text style={styles.subtitle}>Bem vindos a</Text>
          <Text style={styles.title}>Velvet Slice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={() =>
            Alert.alert("Notificações", "Você não tem novas mensagens.")
          }
        >
          <Bell size={18} color={Colors.background || "#FFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary || "#1A1A1A",
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 8,
    shadowColor: Colors.primary || "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    gap: 2,
  },
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.secondary || "#ccc",
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 28,
    color: Colors.background || "#FFF",
  },
  bellButton: {
    backgroundColor: Colors.secondary || "#ccc",
    padding: 10,
    borderRadius: 10,
  },
});
