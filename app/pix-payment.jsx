import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { QrCode } from 'lucide-react-native';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';

export default function PixPaymentPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(3599); // 59:59

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const total = 640;
  const shipping = 80;
  const discount = -20;
  const productsTotal = 580;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Comprar</Text>
          <Text style={styles.sectionTitle}>Método de pagamento</Text>

          {/* QR Code Area */}
          <View style={styles.qrSection}>
            <View style={styles.qrPlaceholder}>
              <QrCode size={200} color={Colors.primary} />
            </View>
            <View style={styles.pixInfoSection}>
              <View style={styles.pixIconContainer}>
                <QrCode size={30} color={Colors.secondary} />
              </View>
              <Text style={styles.timerText}>Tempo restante {minutes}:{seconds}</Text>
              <Text style={styles.scanTitle}>Escaneie o Qr Code com seu celular</Text>
              <Text style={styles.scanDescription}>
                Abra o app do seu banco no celular, selecione pix e aponte a camera para o código.
              </Text>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.divider} />
            <Text style={styles.detailTitle}>Detalhes de pagamento</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total dos produtos</Text>
              <Text style={styles.detailValue}>R$ {productsTotal.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total do frete</Text>
              <Text style={styles.detailValue}>R$ {shipping.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cupom de desconto</Text>
              <Text style={styles.detailValue}>R$ {discount.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.grandTotal}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>
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
  pageTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.black, textAlign: 'center' },
  sectionTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.black },
  qrSection: { alignItems: 'center', gap: 12 },
  qrPlaceholder: {
    width: 250, height: 250, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.white, borderRadius: 8,
  },
  pixInfoSection: { alignItems: 'center', gap: 8 },
  pixIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.gray },
  scanTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary, textAlign: 'center' },
  scanDescription: { fontFamily: Fonts.poppins, fontSize: 14, color: Colors.primary, textAlign: 'center' },
  paymentDetails: { gap: 8 },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.3 },
  detailTitle: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  detailValue: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  totalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  grandTotal: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.darkAccent },
});
