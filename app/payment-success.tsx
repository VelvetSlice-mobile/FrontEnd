import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { products } from '../src/data/products';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';
import { ProductCard } from '../src/components/ProductCard';
import { useCart } from '../src/contexts/CartContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  React.useEffect(() => {
    clearCart();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          {/* Success Section */}
          <View style={styles.successSection}>
            <View style={styles.checkIconContainer}>
              <CheckCircle size={50} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Pagamento concluido</Text>
            <Text style={styles.successSubtitle}>O seu pedido está sendo processado</Text>
            <Text style={styles.successDescription}>
              Vá para página de <Text style={styles.boldItalic}>meus pedidos</Text> para ver a sua compra
            </Text>
            <Button onPress={() => router.push('/orders' as never)}>
              Ir para meus pedidos
            </Button>
          </View>

          <View style={styles.divider} />

          {/* Recommendations */}
          <Text style={styles.sectionTitle}>Recomendações</Text>
          <View style={styles.grid}>
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 12 },
  successSection: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  checkIconContainer: {
    shadowColor: Colors.success,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  successTitle: { fontFamily: Fonts.newsreaderBold, fontSize: 24, color: Colors.primary },
  successSubtitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  successDescription: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary, textAlign: 'center' },
  boldItalic: { fontFamily: Fonts.newsreaderItalic, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.3 },
  sectionTitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.black },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
