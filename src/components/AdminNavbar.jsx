import { usePathname, useRouter } from "expo-router";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

const TABS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Pedidos", icon: ShoppingBag, path: "/admin/pedidos" },
  { label: "Produtos", icon: Package, path: "/admin/produtos" },
];

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {TABS.map(({ label, icon: Icon, path }) => {
        const active = isActive(path);
        return (
          <TouchableOpacity
            key={path}
            style={styles.tab}
            onPress={() => router.push(path)}
          >
            <Icon size={22} color={active ? Colors.primary : "#aaa"} strokeWidth={active ? 2.5 : 1.5} />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 3,
  },
  label: {
    fontFamily: Fonts.poppins,
    fontSize: 11,
    color: "#aaa",
  },
  labelActive: {
    color: Colors.primary,
  },
});
