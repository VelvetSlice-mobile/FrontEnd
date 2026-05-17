import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

const CONFIG = {
  success: { color: Colors.success,   Icon: CheckCircle },
  error:   { color: Colors.accent,    Icon: XCircle },
  warning: { color: Colors.secondary, Icon: AlertTriangle },
  info:    { color: Colors.primary,   Icon: Info },
};

function ToastItem({ toast, onDismiss }) {
  const { color, Icon } = CONFIG[toast.type] ?? CONFIG.info;
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      exiting={FadeOutUp.duration(250)}
      style={[styles.toast, { borderLeftColor: color }]}
    >
      <Icon size={18} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <Text style={styles.message} numberOfLines={3}>{toast.message}</Text>
      <TouchableOpacity onPress={() => onDismiss(toast.id)} hitSlop={10}>
        <X size={15} color={Colors.secondary} strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  const insets = useSafeAreaInsets();
  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 12 }]} pointerEvents="box-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.poppins,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
  },
});
