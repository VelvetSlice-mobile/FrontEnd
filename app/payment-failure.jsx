import { useRouter } from "expo-router";
import { XCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Header } from "../src/components/Header";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header showBack />
      <View style={styles.content}>
        <XCircle size={60} color="#e74c3c" />
        <Text style={styles.title}>Pagamento não concluído</Text>
        <Text style={styles.subtitle}>
          Houve um problema ao processar o seu pagamento. Seu pedido foi salvo e
          você pode tentar novamente.
        </Text>
        <Button onPress={() => router.replace("/checkout")} style={styles.btn}>
          Tentar novamente
        </Button>
        <Button onPress={() => router.replace("/")} style={[styles.btn, styles.btnSecondary]}>
          Voltar ao início
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  btn: { width: "100%" },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.primary },
});
