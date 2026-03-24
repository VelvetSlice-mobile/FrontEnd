import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Product } from '../data/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 55) / 2;

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}` as never)}
      activeOpacity={0.8}
    >
      <Image source={product.image} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            R$ {product.price.toFixed(2).replace('.', ',')}
            <Text style={styles.perKg}>/kg</Text>
          </Text>
          <View style={styles.ratingBadge}>
            <Star size={10} color={Colors.accent} fill={Colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 136,
    borderRadius: 8,
  },
  info: {
    paddingTop: 8,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: Fonts.poppins,
    fontSize: 16,
    color: Colors.primary,
  },
  perKg: {
    fontSize: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
  },
  ratingText: {
    fontFamily: Fonts.newsreader,
    fontSize: 10,
    color: Colors.accent,
  },
  name: {
    fontFamily: Fonts.newsreader,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 18,
  },
});
