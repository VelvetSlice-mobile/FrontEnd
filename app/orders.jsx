import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Package, Truck, CheckCircle, ClipboardCopy } from 'lucide-react-native';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { IMAGES } from '../src/constants/Images';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';

const STATUS_LABELS = {
  preparing: 'Preparando',
  in_transit: 'Em rota',
  delivered: 'Entregue',
};

const mockOrders = [
  {
    id: '1',
    trackingCode: 'BR987654321',
    status: 'preparing',
    items: [
      { 
        name: 'Bolo de morango', 
        size: '1Kg', 
        quantity: 2, 
        total: 390, 
        image: IMAGES.bolos?.morango || null
      },
    ],
    orderTotal: 95,
  },
  {
    id: '2',
    trackingCode: 'BR123456789',
    status: 'preparing',
    items: [
      { 
        name: 'Bolo de chocolate', 
        size: '1Kg', 
        quantity: 1, 
        total: 150, 
        image: IMAGES.bolos?.chocolate || null 
      },
    ],
    orderTotal: 150,
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('preparing');

  const filteredOrders = mockOrders.filter((o) => o.status === activeTab);

  const handleCopyTracking = (code) => {
    Alert.alert('Copiado', `Código ${code} copiado!`);
  };

  const statusOptions = ['preparing', 'in_transit', 'delivered'];

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Seus pedidos</Text>

          <View style={styles.divider} />

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
            <Text style={styles.emptyText}>Nenhum pedido nesta categoria.</Text>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Rastreio:</Text>
                    <TouchableOpacity
                      style={styles.copyRow}
                      onPress={() => handleCopyTracking(order.trackingCode)}
                    >
                      <ClipboardCopy size={14} color={Colors.background} />
                      <Text style={styles.trackingCode}>{order.trackingCode}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.orderStatus}>{STATUS_LABELS[order.status]}</Text>
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Itens pedidos</Text>
                  <View style={styles.itemDivider} />

                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItem}>
                      <Image source={item.image} style={styles.orderItemImage} />
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        
                        <View style={styles.sizeRow}>
                          <Text style={styles.labelText}>Tamanho:</Text>
                          <View style={styles.sizeBadge}>
                            <Text style={styles.sizeText}>{item.size}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.sizeRow}>
                          <Text style={styles.labelText}>Quantidade:</Text>
                          <Text style={styles.valueText}>{item.quantity}</Text>
                        </View>
                        
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>
                          R$ {item.total.toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <Text style={styles.trackingDescription}>
                    O rastreamento da sua entrega é feito pela Velvet Log. 
                    Clique no botão abaixo para acompanhar em tempo real.
                  </Text>

                  <View style={styles.itemDivider} />

                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotalLabel}>Total do pedido</Text>
                      <Text style={styles.orderTotalPrice}>
                        R$ {order.orderTotal.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    <Button onPress={() => Alert.alert('Rastreio', 'Abrindo site da transportadora...')}>
                      Rastrear
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
  scrollContent: { paddingBottom: 100 },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 16 },
  pageTitle: { 
    fontFamily: Fonts.newsreader, 
    fontSize: 24, 
    color: Colors.primary, 
    textAlign: 'center' 
  },
  divider: { height: 1, backgroundColor: Colors.primary, marginVertical: 5 },
  tabsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  statusTab: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: Colors.primary,
    paddingVertical: 10, 
    paddingHorizontal: 14,
  },
  statusTabActive: { backgroundColor: Colors.primary },
  statusTabText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  statusTabTextActive: { color: Colors.background },
  emptyText: { textAlign: 'center', marginTop: 20, color: Colors.secondary, fontFamily: Fonts.poppins },
  orderCard: { borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, overflow: 'hidden', marginBottom: 10 },
  orderHeader: {
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 12,
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trackingLabel: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.accent || '#D4AF37' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackingCode: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.background },
  orderStatus: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.background },
  orderItems: { padding: 12, gap: 10 },
  itemsTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.black || '#000' },
  itemDivider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.3 },
  orderItem: { 
    flexDirection: 'row', 
    gap: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: Colors.secondary, 
    padding: 10 
  },
  orderItemImage: { width: 100, height: 120, borderRadius: 8 },
  orderItemInfo: { flex: 1, gap: 2 },
  orderItemName: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary },
  valueText: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary },
  sizeBadge: { 
    borderWidth: 1, 
    borderColor: Colors.primary, 
    borderRadius: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 2 
  },
  sizeText: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  totalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  totalPrice: { 
    fontFamily: Fonts.newsreaderBold, 
    fontSize: 16, 
    color: Colors.darkAccent || '#000' 
  },
  trackingDescription: { 
    fontFamily: Fonts.poppins, 
    fontSize: 12, 
    color: Colors.secondary,
    lineHeight: 18 
  },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  orderTotalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
});