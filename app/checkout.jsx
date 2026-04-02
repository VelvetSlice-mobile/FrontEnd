import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import { Colors } from '../src/constants/Colors';
import { useAuth } from '../src/contexts/AuthContext';
import { useCart } from '../src/contexts/CartContext';
import { database } from '../src/services/database'; // Importação do banco local

export default function Checkout() {
  const router = useRouter();
  const { cart, totalValue, clearCart } = useCart();
  const { user } = useAuth();

  const handleFinishOrder = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para finalizar o pedido.");
      return;
    }

    // Criamos o objeto do pedido
    const orderData = {
      user_id: user.id,
      total: totalValue,
      items: JSON.stringify(cart), // Convertemos o array do carrinho para String (exigência do SQLite)
      date: new Date().toLocaleString('pt-BR'),
    };

    try {
      // 1. PERSISTÊNCIA LOCAL (Garante que o dado não se perca)
      // Usamos o SQLite para salvar o pedido imediatamente no celular
      database.runSync(
        'INSERT INTO orders (user_id, total, items, date) VALUES (?, ?, ?, ?)',
        [orderData.user_id, orderData.total, orderData.items, orderData.date]
      );

      // 2. TENTATIVA DE SINCRONIZAÇÃO COM O BACKEND
      // O app tenta enviar para a API, mas se der erro (servidor desligado), cai no 'catch'
      try {
        const response = await fetch('http://192.168.1.10:3000/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        
        if (!response.ok) throw new Error("Erro na API");
        console.log("Pedido sincronizado com o servidor com sucesso!");
      } catch (apiError) {
        console.log("Aviso: Backend offline. O pedido foi salvo localmente no SQLite.");
      }

      // 3. FINALIZAÇÃO NO FRONTEND
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
          {cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
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

        <TouchableOpacity style={styles.finishButton} onPress={handleFinishOrder}>
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