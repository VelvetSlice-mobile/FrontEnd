import { usePathname, useRouter } from "expo-router";
import { Home, Search, ShoppingCart, User } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";

export function Navbar({ visible }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isVisible = visible;

  if (!isVisible) return null;

  const isActive = (path) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const getColor = (path) => (isActive(path) ? Colors.accent : Colors.white);

  const avatarUrl = user?.avatarUrl ?? user?.avatar_url ?? null;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
      ]}
    >
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.iconContainer}
          activeOpacity={0.7}
        >
          <Home color={getColor("/")} size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/search")}
          style={styles.iconContainer}
          activeOpacity={0.7}
        >
          <Search color={getColor("/search")} size={22} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={styles.iconContainer}
          activeOpacity={0.7}
        >
          <ShoppingCart color={getColor("/cart")} size={22} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.iconContainer}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarIcon} />
          ) : (
            <User color={getColor("/profile")} size={24} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  navBar: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
  },
});
