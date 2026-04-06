import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../src/components/Header';
import { Colors } from '../src/constants/Colors';
import { useAuth } from '../src/contexts/AuthContext';
import { useCart } from '../src/contexts/CartContext';
import { database } from '../src/services/database';

export default function Checkout() {
  const router = useRouter();
  const { items: cart, total: totalValue, clearCart } = useCart();
  const { user } = useAuth();

  const handleFinishOrder = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para finalizar o pedido.");
      return;
    }

    const orderData = {
      user_id: user.id,
      total: totalValue,
      items: JSON.stringify(cart),
      date: new Date().toLocaleString('pt-BR'),
      status: 'preparing'
    };

    try {
      database.runSync(
        'INSERT INTO orders (user_id, total, items, date, status) VALUES (?, ?, ?, ?, ?)',
        [orderData.user_id, orderData.total, orderData.items, orderData.date, orderData.status]
      );

      const lastOrder = database.getFirstSync(
        'SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [user.id]
      );
      const orderId = lastOrder ? lastOrder.id : '0000';

      const firstItemName = cart.length > 0 ? cart[0].name : 'item';
      const notificationDescription = cart.length > 1
        ? `Seu pedido de ${firstItemName} e outros itens foi recebido e está aguardando processamento.`
        : `Seu pedido de ${firstItemName} foi recebido e está aguardando processamento.`;

      database.runSync(
        'INSERT INTO notifications (user_id, title, message, status, date) VALUES (?, ?, ?, ?, ?)',
        [
          user.id,
          `PEDIDO #${orderId} REALIZADO`,
          notificationDescription,
          'preparing',
          orderData.date
        ]
      );

      try {
        await fetch('http://192.168.1.10:3000/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderData, id: orderId }),
        });
      } catch (apiError) {
        console.log("Aviso: Backend offline. Notificação e pedido salvos localmente.");
      }

      clearCart();
      router.push('/payment-success');

    } catch (dbError) {
      console.error(dbError);
      Alert.alert("Erro", "Não foi possível processar o pedido localmente.");
    }
  };
  return (
    <View style={styles.container}>
      <Header title="Finalizar Pedido" showBack />

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          {cart && cart.map((item) => (
            <View key={`${item.id}-${item.size}`} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.quantity}x {item.name}</Text>
              <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {totalValue.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishOrder}
          disabled={!cart || cart.length === 0}
        >
          <Text style={styles.finishButtonText}>Confirmar e Pagar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: Colors.primary },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemText: { fontSize: 16, color: '#333' },
  itemPrice: { fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  finishButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40
  },
  finishButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});