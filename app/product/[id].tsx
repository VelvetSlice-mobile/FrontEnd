import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, Share2 } from 'lucide-react-native';
import { products } from '../../src/data/products';
import { useCart } from '../../src/contexts/CartContext';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { Navbar } from '../../src/components/Navbar';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <Button onPress={() => router.back()} style={{ marginTop: 20 }}>Voltar</Button>
      </View>
    );
  }

  const weights = [1, 2, 3, 4, 5];
  const totalPrice = product.price * selectedWeight;

  const handleAddToCart = () => {
    addToCart(product, selectedWeight);
    Alert.alert('Sucesso', 'Produto adicionado ao carrinho!');
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Confira ${product.name} na Velvet Slice!` });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={Colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryText}>{product.category || 'Frutudos'}</Text>
            <View style={styles.ratingBadge}>
              <Star size={10} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.divider} />

          {/* Size Selection */}
          <Text style={styles.sizeTitle}>Tamanho:</Text>
          <View style={styles.weightRow}>
            {weights.map((w) => (
              <TouchableOpacity
                key={w}
                onPress={() => setSelectedWeight(w)}
                style={[styles.weightButton, selectedWeight === w && styles.weightActive]}
              >
                <Text style={[styles.weightText, selectedWeight === w && styles.weightTextActive]}>
                  {w}Kg
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.subTotalLabel}>Sub-total</Text>
              <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2).replace('.', ',')}</Text>
            </View>
            <Button onPress={handleAddToCart} style={styles.addButton}>
              Adicionar ao carrinho
            </Button>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Share2 size={18} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              style={[styles.iconButton, styles.heartButton]}
            >
              <Heart
                size={18}
                color={Colors.background}
                fill={isFavorite ? Colors.background : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  imageContainer: { width: '100%', height: 400, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute', top: 50, left: 22,
    backgroundColor: Colors.background, padding: 10, borderRadius: 100,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5,
  },
  infoContainer: { padding: 22, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  ratingText: { fontFamily: Fonts.newsreader, fontSize: 10, color: Colors.accent },
  productName: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  productDescription: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.secondary, lineHeight: 24 },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.3 },
  sizeTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  weightRow: { flexDirection: 'row', gap: 12 },
  weightButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  weightActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  weightText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  weightTextActive: { color: Colors.background },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  priceBlock: { flex: 1, gap: 4 },
  subTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  totalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  addButton: { paddingHorizontal: 16, paddingVertical: 10 },
  iconButton: { width: 37, height: 37, borderRadius: 8, borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  heartButton: { backgroundColor: Colors.accent, borderColor: Colors.accent },
});
