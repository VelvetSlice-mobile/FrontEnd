import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 55) / 2;

/**
 * Componente de Card de Produto para Listagens
 * @param {Object} props
 * @param {Object} props.product - Objeto contendo os dados do produto
 */
export function ProductCard({ product }) {
  const router = useRouter();

  if (!product) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.8}
    >
      <Image 
        source={product.image} 
        style={styles.image} 
        resizeMode="cover" 
      />
      
      <View style={styles.info}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            R$ {product.price.toFixed(2).replace('.', ',')}
            <Text style={styles.perKg}>/kg</Text>
          </Text>
          
          <View style={styles.ratingBadge}>
            <Star size={10} color={Colors.accent || '#D4AF37'} fill={Colors.accent || '#D4AF37'} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  info: {
    paddingTop: 10,
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
    color: Colors.primary || '#4F2C1D',
  },
  perKg: {
    fontSize: 10,
    fontFamily: Fonts.poppins,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
  },
  ratingText: {
    fontFamily: Fonts.newsreader,
    fontSize: 12,
    color: Colors.accent || '#D4AF37',
  },
  name: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary || '#4F2C1D',
    lineHeight: 20,
  },
});