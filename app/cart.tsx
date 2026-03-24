import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Minus, Trash2 } from 'lucide-react-native';
import { useCart } from '../src/contexts/CartContext';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const [coupon, setCoupon] = useState('');

  const handleApplyCoupon = () => {
    if (coupon.trim()) {
      Alert.alert('Cupom', 'Cupom aplicado com sucesso!');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Carrinho</Text>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          ) : (
            <>
              {items.map((item) => (
                <View key={item.id} style={styles.cartCard}>
                  <Image source={item.image} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category || 'Frutudos'}</Text>
                    <View style={styles.sizeRow}>
                      <Text style={styles.sizeLabel}>Tamanho:</Text>
                      <View style={styles.sizeBadge}>
                        <Text style={styles.sizeText}>1Kg</Text>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.subTotalLabel}>Sub total</Text>
                      <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</Text>
                    </View>
                  </View>
                  <View style={styles.quantityColumn}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.qtyButton}
                      >
                        <Plus size={14} color={Colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                        }}
                        style={styles.qtyButtonDark}
                      >
                        <Minus size={14} color={Colors.background} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Trash2 size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Coupon */}
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Digite o cupom..."
                  placeholderTextColor={Colors.darkAccent}
                  value={coupon}
                  onChangeText={setCoupon}
                />
                <TouchableOpacity style={styles.couponButton} onPress={handleApplyCoupon}>
                  <Text style={styles.couponButtonText}>Inserir</Text>
                </TouchableOpacity>
              </View>

              {/* Total and CTA */}
              <View style={styles.bottomRow}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Sub-total</Text>
                  <Text style={styles.totalPrice}>R$ {total.toFixed(2).replace('.', ',')}</Text>
                </View>
                <Button onPress={() => router.push('/checkout' as never)}>
                  Ir para pagamento
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 12 },
  pageTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.black, textAlign: 'center' },
  emptyText: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.secondary, textAlign: 'center', marginTop: 40 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  itemImage: { width: 100, height: 120, borderRadius: 8 },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  itemCategory: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  sizeBadge: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  sizeText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  priceContainer: { gap: 2 },
  subTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  itemPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  quantityColumn: { alignItems: 'center', justifyContent: 'space-between' },
  quantityControl: { alignItems: 'center', gap: 4 },
  qtyButton: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 4, padding: 4 },
  qtyButtonDark: { backgroundColor: Colors.primary, borderRadius: 4, padding: 4 },
  qtyText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  couponRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
    paddingLeft: 12,
  },
  couponInput: { flex: 1, fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.darkAccent, height: 44 },
  couponButton: { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  couponButtonText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.background },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  totalContainer: { gap: 4 },
  totalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  totalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
});
