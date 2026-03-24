import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, CreditCard, QrCode } from 'lucide-react-native';
import { useCart } from '../src/contexts/CartContext';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';
import { AddAddressModal } from '../src/components/AddAddressModal';
import { AddCardModal } from '../src/components/AddCardModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [selectedCard, setSelectedCard] = useState<'credit' | 'debit'>('credit');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const shipping = 80;
  const discount = -20;
  const grandTotal = total + shipping + discount;

  const handlePurchase = () => {
    if (paymentMethod === 'pix') {
      router.push('/pix-payment' as never);
    } else {
      router.push('/payment-success' as never);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Comprar</Text>

          {/* Address Section */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <TouchableOpacity onPress={() => setShowAddAddress(true)}>
              <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Text style={styles.addressIconText}>📍</Text>
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>Casa</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                Avenida Paulista - de 612 a 1510 - lado par{'\n'}Bela Vista São Paulo/SP 01310-100
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.primary} />
          </View>

          {/* Items Section */}
          <Text style={styles.sectionTitle}>Itens</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={item.image} style={styles.orderItemImage} />
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <View style={styles.sizeRow}>
                  <Text style={styles.labelText}>Tamanho:</Text>
                  <View style={styles.sizeBadge}>
                    <Text style={styles.sizeText}>1Kg</Text>
                  </View>
                </View>
                <View style={styles.sizeRow}>
                  <Text style={styles.labelText}>Quantidade:</Text>
                  <Text style={styles.valueText}>{item.quantity}</Text>
                </View>
                <Text style={styles.itemTotalLabel}>Total</Text>
                <Text style={styles.itemTotalPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>
          ))}

          {/* Payment Method */}
          <Text style={styles.sectionTitle}>Método de pagamento</Text>
          <View style={styles.paymentMethodRow}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <CreditCard size={24} color={paymentMethod === 'card' ? Colors.background : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('pix')}
            >
              <QrCode size={24} color={paymentMethod === 'pix' ? Colors.background : Colors.primary} />
            </TouchableOpacity>
          </View>

          {paymentMethod === 'card' && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.savedCardsLabel}>Cartões salvos</Text>
                <TouchableOpacity onPress={() => setShowAddCard(true)}>
                  <Plus size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.cardOption, selectedCard === 'credit' && styles.cardOptionSelected]}
                onPress={() => setSelectedCard('credit')}
              >
                <CreditCard size={20} color={selectedCard === 'credit' ? Colors.background : Colors.primary} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, selectedCard === 'credit' && styles.cardTitleSelected]}>Cartão de crédito</Text>
                  <Text style={[styles.cardNumber, selectedCard === 'credit' && styles.cardNumberSelected]}>1236.****.****.1236</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cardOption, selectedCard === 'debit' && styles.cardOptionSelected]}
                onPress={() => setSelectedCard('debit')}
              >
                <CreditCard size={20} color={selectedCard === 'debit' ? Colors.background : Colors.primary} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, selectedCard === 'debit' && styles.cardTitleSelected]}>Cartão de débito</Text>
                  <Text style={[styles.cardNumber, selectedCard === 'debit' && styles.cardNumberSelected]}>1236.****.****.1236</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.detailDivider} />
            <Text style={styles.detailTitle}>Detalhes de pagamento</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total dos produtos</Text>
              <Text style={styles.detailValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total do frete</Text>
              <Text style={styles.detailValue}>R$ {shipping.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cupom de desconto</Text>
              <Text style={styles.detailValue}>R$ {discount.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.grandTotal}>R$ {grandTotal.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          <Button fullWidth onPress={handlePurchase}>
            Comprar
          </Button>
        </View>
      </ScrollView>
      <Navbar />

      <Modal visible={showAddAddress} animationType="slide" transparent>
        <AddAddressModal onClose={() => setShowAddAddress(false)} />
      </Modal>
      <Modal visible={showAddCard} animationType="slide" transparent>
        <AddCardModal onClose={() => setShowAddCard(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 12 },
  pageTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.black, textAlign: 'center' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.black },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, padding: 12,
  },
  addressIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  addressIconText: { fontSize: 20 },
  addressInfo: { flex: 1, gap: 4 },
  addressName: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  addressText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  orderItem: {
    flexDirection: 'row', gap: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.secondary, padding: 10,
  },
  orderItemImage: { width: 100, height: 120, borderRadius: 8 },
  orderItemInfo: { flex: 1, gap: 2 },
  orderItemName: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  valueText: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary },
  sizeBadge: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  sizeText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  itemTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  itemTotalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.darkAccent },
  paymentMethodRow: { flexDirection: 'row', gap: 12 },
  paymentOption: {
    width: 60, height: 50, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  paymentOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  savedCardsLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.black },
  cardOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.primary, padding: 12,
  },
  cardOptionSelected: { backgroundColor: Colors.primary },
  cardInfo: { gap: 2 },
  cardTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  cardTitleSelected: { color: Colors.background },
  cardNumber: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  cardNumberSelected: { color: Colors.background },
  paymentDetails: { gap: 8 },
  detailDivider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.3 },
  detailTitle: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  detailValue: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  totalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  grandTotal: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.darkAccent },
});
