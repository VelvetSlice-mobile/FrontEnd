import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { products } from "../src/data/products";
import { useCart } from "../src/contexts/CartContext";
import { useNav } from "../src/contexts/NavContext";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { Header } from "../src/components/Header";
import { Button } from "../src/components/Button";
import { ProductCard } from "../src/components/ProductCard";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const dif = currentOffset - lastOffset.current;

    if (currentOffset <= 10) {
      setShowNav(true);
    } else if (dif > 0) {
      setShowNav(false);
    } else if (dif < 0) {
      setShowNav(true);
    }

    lastOffset.current = currentOffset;
  }

  useEffect(() => {
    if (clearCart) {
      clearCart();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.successSection}>
            <View style={styles.checkIconContainer}>
              <CheckCircle size={60} color={Colors.success} />
            </View>

            <Text style={styles.successTitle}>Pagamento concluído</Text>
            <Text style={styles.successSubtitle}>
              O seu pedido está sendo processado
            </Text>

            <Text style={styles.successDescription}>
              Vá para a página de{" "}
              <Text style={styles.boldItalic}>meus pedidos</Text> para
              acompanhar a sua entrega.
            </Text>

            <Button
              onPress={() => router.push("/orders")}
              style={styles.mainButton}
            >
              Ir para meus pedidos
            </Button>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Recomendações para você</Text>

          <View style={styles.grid}>
            {products &&
              products
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 22,
    marginTop: 20,
    gap: 16,
  },
  successSection: {
    alignItems: "center",
    gap: 15,
    paddingVertical: 30,
  },
  checkIconContainer: {
    shadowColor: Colors.success || "#4CAF50",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    marginBottom: 10,
  },
  successTitle: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 26,
    color: Colors.primary,
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 18,
    color: Colors.secondary || "#666",
    textAlign: "center",
  },
  successDescription: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 22,
  },
  boldItalic: {
    fontFamily: Fonts.newsreaderItalic,
    fontWeight: "bold",
  },
  mainButton: {
    marginTop: 10,
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary,
    opacity: 0.2,
    marginVertical: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
