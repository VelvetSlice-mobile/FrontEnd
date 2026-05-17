import { AlertTriangle, Info, Trash2 } from "lucide-react-native";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

const TYPE_CONFIG = {
  danger:  { Icon: Trash2,         iconColor: Colors.accent,    confirmBg: Colors.accent },
  warning: { Icon: AlertTriangle,  iconColor: Colors.secondary, confirmBg: Colors.secondary },
  info:    { Icon: Info,           iconColor: Colors.primary,   confirmBg: Colors.primary },
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  onConfirm,
  onCancel,
}) {
  const { Icon, iconColor, confirmBg } = TYPE_CONFIG[type] ?? TYPE_CONFIG.danger;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
            <Icon size={32} color={iconColor} strokeWidth={1.8} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.75}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.newsreader,
    fontSize: 22,
    color: Colors.primary,
    textAlign: "center",
  },
  message: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmText: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: "#fff",
  },
});
