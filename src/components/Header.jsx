import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

export function Header({ title, showBack = false, userName }) {
  const router = useRouter();

  const firstName = userName ? userName.split(" ")[0] : null;

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
              {firstName ? (
                <Text style={styles.subtitle}>
                  Bem-vinda,{" "}
                  <Text style={styles.subtitleName}>{firstName}</Text>
                </Text>
              ) : (
                <Text style={styles.subtitle}>Bem vindos a</Text>
              )}
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
        </TouchableOpacity>
      </View>
    </View>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  showBack: PropTypes.bool,
  userName: PropTypes.string,
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 8,
    shadowColor: Colors.primary,
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
    color: Colors.secondary,
  },
  subtitleName: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.background,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 28,
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
    backgroundColor: Colors.accent,
    padding: 10,
    borderRadius: 10,
  },
});