import { usePathname, useRouter } from "expo-router";
import { Home, Package, ShoppingBag, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

const TABS = [
  { icon: Home, path: "/admin" },
  { icon: ShoppingBag, path: "/admin/pedidos" },
  { icon: Package, path: "/admin/produtos" },
  { icon: User, path: "/admin/perfil" },
];

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    if (path === "/admin/perfil") return pathname === "/admin/perfil";
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
      <View style={styles.navBar}>
        {TABS.map(({ icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <TouchableOpacity
              key={path}
              style={styles.iconContainer}
              onPress={() => router.push(path)}
              activeOpacity={0.7}
            >
              <Icon
                size={24}
                color={active ? Colors.accent : Colors.background}
                strokeWidth={active ? 2.5 : 1.5}
              />
            </TouchableOpacity>
          );
        })}
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
});
