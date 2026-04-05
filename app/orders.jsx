import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Package, Truck, CheckCircle, ClipboardCopy } from 'lucide-react-native';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { IMAGES } from '../src/constants/Images';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';
import { database } from '../src/services/database';
import { useAuth } from '../src/contexts/AuthContext';

const STATUS_LABELS = {
  preparing: 'Preparando',
  in_transit: 'Em rota',
  delivered: 'Entregue',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('preparing');

  useEffect(() => {
    if (user) {
      try {
        const result = database.getAllSync(
          'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
          [user.id]
        );

        const formattedOrders = result.map(order => ({
          ...order,
          items: JSON.parse(order.items),
          status: order.status || 'preparing'
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Erro ao carregar pedidos do SQLite:", error);
      }
    }
  }, [user]);

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const handleCopyTracking = (code) => {
    Alert.alert('Copiado', `Código ${code} copiado para a área de transferência!`);
  };

  const statusOptions = ['preparing', 'in_transit', 'delivered'];

  return (
    <View style={styles.container}>
      <Header title="Seus Pedidos" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.tabsRow}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusTab,
                  activeTab === status && styles.statusTabActive
                ]}
                onPress={() => setActiveTab(status)}
              >
                {status === 'preparing' && (
                  <Package size={20} color={activeTab === status ? Colors.background : Colors.primary} />
                )}
                {status === 'in_transit' && (
                  <Truck size={20} color={activeTab === status ? Colors.background : Colors.primary} />
                )}
                {status === 'delivered' && (
                  <CheckCircle size={20} color={activeTab === status ? Colors.background : Colors.primary} />
                )}
                <Text style={[
                  styles.statusTabText,
                  activeTab === status && styles.statusTabTextActive
                ]}>
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum pedido encontrado nesta categoria.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Pedido #{order.id}</Text>
                    <TouchableOpacity
                      style={styles.copyRow}
                      onPress={() => handleCopyTracking(`VS-${order.id}`)}
                    >
                      <ClipboardCopy size={14} color={Colors.background} />
                      <Text style={styles.trackingCode}>Copiar Rastreio</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.orderStatusText}>{order.date}</Text>
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Detalhes</Text>
                  <View style={styles.itemDivider} />

                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItem}>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <View style={styles.sizeRow}>
                          <Text style={styles.labelText}>Qtd: {item.quantity} | Tam: {item.size}</Text>
                        </View>
                        <Text style={styles.totalPrice}>
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View style={styles.itemDivider} />

                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotalLabel}>Total Pago</Text>
                      <Text style={styles.orderTotalPrice}>
                        R$ {Number(order.total).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    <Button onPress={() => Alert.alert('Status', 'Seu pedido está sendo processado pela Velvet Log.')}>
                      Detalhes
                    </Button>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 120 },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 16 },
  tabsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 10 },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusTabActive: { backgroundColor: Colors.primary },
  statusTabText: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary },
  statusTabTextActive: { color: Colors.background },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: Colors.secondary, fontFamily: Fonts.poppins, fontSize: 14 },
  orderCard: { borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, overflow: 'hidden', marginBottom: 15 },
  orderHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackingLabel: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.accent || '#D4AF37' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackingCode: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.background, textDecorationLine: 'underline' },
  orderStatusText: { fontFamily: Fonts.poppins, fontSize: 10, color: Colors.background },
  orderItems: { padding: 12, gap: 10 },
  itemsTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: '#000' },
  itemDivider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.2, marginVertical: 5 },
  orderItem: { paddingVertical: 5 },
  orderItemInfo: { gap: 2 },
  orderItemName: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  sizeRow: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontFamily: Fonts.poppins, fontSize: 13, color: '#666' },
  totalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary, marginTop: 4 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  orderTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  orderTotalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
});