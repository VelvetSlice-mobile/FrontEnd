import { usePathname, useRouter } from "expo-router";
import { Home, Search, ShoppingCart, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const getColor = (path: string) =>
    isActive(path) ? Colors.accent : Colors.white;

  return (
    <View
      style={[
        styles.container,
        {
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.navBar}>
      <TouchableOpacity
        onPress={() => router.push("/")}
        style={styles.iconContainer}
      >
        <Home color={getColor("/")} size={22} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/search")}
        style={styles.iconContainer}
      >
        <Search color={getColor("/search")} size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/cart")}
        style={styles.iconContainer}
      >
        <ShoppingCart color={getColor("/cart")} size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={styles.iconContainer}
      >
        <User color={getColor("/profile")} size={22} />
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 2, 
    left: 0,
    right: 0,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'transparent', 
  },
  
  navBar: {
    backgroundColor: Colors.primary, 
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 20, 
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconContainer: { 
    padding: 10, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
});