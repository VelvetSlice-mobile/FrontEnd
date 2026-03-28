import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';

import { products } from '../../src/data/products';
import { useCart } from '../../src/contexts/CartContext';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Button } from '../../src/components/Button';
import { Navbar } from '../../src/components/Navbar';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [selectedWeight, setSelectedWeight] = useState('1Kg');
  const product = products.find((p) => p.id === id);

  if (!product) return <View style={styles.container}><Text>Produto não encontrado</Text></View>;

  const weights = ['1Kg', '2Kg', '3Kg', '4Kg', '5Kg'];
  const weightMultiplier = parseInt(selectedWeight);
  const totalPrice = product.price * weightMultiplier;

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, 1);
    Alert.alert('Sucesso', 'Adicionado ao carrinho!');
    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={Colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            <View style={styles.ratingBadge}>
              <Star size={12} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <Text style={styles.sizeTitle}>Escolha o peso:</Text>
          <View style={styles.weightRow}>
            {weights.map((w) => (
              <TouchableOpacity
                key={w}
                onPress={() => setSelectedWeight(w)}
                style={[styles.weightButton, selectedWeight === w && styles.weightActive]}
              >
                <Text style={[styles.weightText, selectedWeight === w && styles.weightTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.subTotalLabel}>Total deste item</Text>
              <Text style={styles.totalPriceText}>R$ {totalPrice.toFixed(2).replace('.', ',')}</Text>
            </View>
            <Button onPress={handleAddToCart}>Adicionar</Button>
          </View>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { width: '100%', height: 350 },
  productImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#FFF', padding: 10, borderRadius: 100 },
  infoContainer: { padding: 22, gap: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { fontFamily: Fonts.poppins, color: Colors.secondary, fontSize: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: Fonts.newsreaderBold, color: Colors.accent },
  productName: { fontFamily: Fonts.newsreader, fontSize: 26, color: Colors.primary },
  productDescription: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.secondary, lineHeight: 22 },
  sizeTitle: { fontFamily: Fonts.newsreader, fontSize: 18, marginTop: 10 },
  weightRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  weightButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  weightActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  weightText: { color: Colors.primary },
  weightTextActive: { color: '#FFF' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  subTotalLabel: { fontSize: 12, color: Colors.secondary },
  totalPriceText: { fontSize: 22, fontFamily: Fonts.newsreaderBold, color: Colors.primary }
});