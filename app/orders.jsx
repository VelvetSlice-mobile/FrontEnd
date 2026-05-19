import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, PanResponder } from 'react-native';
import { Package, Truck, CheckCircle, XCircle, ClipboardCopy, Info, CreditCard, MapPin, Tag } from 'lucide-react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { products as localProducts } from '../src/data/products';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { Button } from '../src/components/Button';
import { database } from '../src/services/database';
import { orderService } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/contexts/ToastContext';

const STATUS_LABELS = {
  preparing: "Preparando",
  in_transit: "Em rota",
  delivered: "Entregue",
  rejected: "Recusado",
};

function OrderInfoSheet({ order, onClose }) {
  const insets = useSafeAreaInsets();
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => { if (g.dy > 60) onClose(); },
    })
  ).current;

  if (!order) return null;

  const addressLine = order.address
    ? [
        order.address.logradouro && `${order.address.logradouro}, ${order.address.numero}`,
        order.address.bairro,
        order.address.cidade && order.address.estado
          ? `${order.address.cidade} - ${order.address.estado}`
          : order.address.cidade || order.address.estado,
        order.address.cep,
      ].filter(Boolean).join("\n")
    : null;

  return (
    <View style={sheetStyles.overlay}>
      <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[sheetStyles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={sheetStyles.handleArea} {...panResponder.panHandlers}>
          <View style={sheetStyles.handle} />
        </View>
        <Text style={sheetStyles.title}>Pedido #{order.id}</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sheetStyles.content}>
          <View style={sheetStyles.row}>
            <CreditCard size={18} color={Colors.primary} />
            <View style={sheetStyles.rowText}>
              <Text style={sheetStyles.label}>Pagamento</Text>
              <Text style={sheetStyles.value}>{order.metodo_pagamento || "Não informado"}</Text>
            </View>
          </View>

          <View style={sheetStyles.divider} />

          <View style={sheetStyles.row}>
            <MapPin size={18} color={Colors.primary} />
            <View style={sheetStyles.rowText}>
              <Text style={sheetStyles.label}>Endereço de entrega</Text>
              {addressLine
                ? <Text style={sheetStyles.value}>{addressLine}</Text>
                : <Text style={sheetStyles.valueMuted}>Não informado</Text>}
            </View>
          </View>

          <View style={sheetStyles.divider} />

          <View style={sheetStyles.row}>
            <Tag size={18} color={Colors.primary} />
            <View style={sheetStyles.rowText}>
              <Text style={sheetStyles.label}>Cupom aplicado</Text>
              {order.cupom_codigo
                ? <Text style={sheetStyles.value}>{order.cupom_codigo} — R$ {Number(order.desconto_valor).toFixed(2).replace(".", ",")} de desconto</Text>
                : <Text style={sheetStyles.valueMuted}>Nenhum</Text>}
            </View>
          </View>

          <View style={sheetStyles.divider} />

          <View style={sheetStyles.row}>
            <Package size={18} color={Colors.primary} />
            <View style={sheetStyles.rowText}>
              <Text style={sheetStyles.label}>Status</Text>
              <Text style={sheetStyles.value}>{STATUS_LABELS[order.status] ?? order.status}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 100 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
    maxHeight: "70%",
  },
  handleArea: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc" },
  title: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary, paddingHorizontal: 22, marginBottom: 8 },
  content: { paddingHorizontal: 22, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 14 },
  rowText: { flex: 1, gap: 3 },
  label: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary },
  valueMuted: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary, fontStyle: "italic" },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.15 },
});

export default function OrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { status: initialStatus } = useLocalSearchParams();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(initialStatus || 'preparing');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;

    const userId = user.id ?? user.id_cliente;
    if (!userId) return;

    try {
      const normalizeStatus = (status) => {
        const raw = (status || '').toString().trim().toLowerCase();
        if (!raw || raw === 'pending' || raw.includes('pend')) return 'preparing';
        if (raw.includes('pago') || raw.includes('paid') || raw.includes('approved')) return 'preparing';
        if (raw.includes('recusado') || raw.includes('rejected') || raw.includes('cancel')) return 'rejected';
        if (raw.includes('rota') || raw.includes('transit')) return 'in_transit';
        if (raw.includes('entreg') || raw.includes('delivered')) return 'delivered';
        return 'preparing';
      };

      const STATUS_NOTIFICATIONS = {
        in_transit: { title: "Pedido em rota!", message: "Seu pedido saiu para entrega." },
        delivered: { title: "Pedido entregue!", message: "Seu pedido foi entregue. Bom apetite!" },
      };

      const localResult = database.getAllSync(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
        [userId]
      );

      const localOrders = localResult.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : [],
        status: normalizeStatus(order.status),
      }));

      const backendOrders = await orderService.getByClientId(userId);

      if (!Array.isArray(backendOrders) || backendOrders.length === 0) {
        setOrders(localOrders);
        return;
      }

      const localMap = new Map(localOrders.map(order => [order.id, order]));

      const merged = backendOrders.map((backendOrder) => {
        const id = backendOrder.id_pedido;
        const mappedStatus = normalizeStatus(backendOrder.status_pedido);
        const cached = localMap.get(id);

        if (cached && cached.status !== mappedStatus) {
          const localDate = new Date().toLocaleString("pt-BR");
          try {
            if (cached.status === 'pending_payment' && mappedStatus === 'preparing') {
              database.runSync(
                "UPDATE notifications SET title = ?, message = ?, status = ? WHERE user_id = ? AND title = ?",
                [
                  `PEDIDO #${id} - Pagamento confirmado`,
                  "Seu pagamento foi confirmado! Estamos preparando seu pedido.",
                  "preparing",
                  userId,
                  `PEDIDO #${id} - PAGAMENTO`,
                ],
              );
            } else if (cached.status === 'pending_payment' && mappedStatus === 'rejected') {
              database.runSync(
                "UPDATE notifications SET title = ?, message = ?, status = ? WHERE user_id = ? AND title = ?",
                [
                  `PEDIDO #${id} - Pagamento recusado`,
                  "Seu pagamento foi recusado ou cancelado. Tente novamente.",
                  "rejected",
                  userId,
                  `PEDIDO #${id} - PAGAMENTO`,
                ],
              );
            } else if (STATUS_NOTIFICATIONS[mappedStatus]) {
              const { title, message } = STATUS_NOTIFICATIONS[mappedStatus];
              database.runSync(
                "INSERT OR IGNORE INTO notifications (user_id, title, message, status, date) VALUES (?, ?, ?, ?, ?)",
                [userId, `PEDIDO #${id} - ${title}`, message, mappedStatus, localDate],
              );
            }
          } catch { /* falha silenciosa — notificação local é opcional */ }
        }

        const backendItems = (backendOrder.itens || []).map((i) => ({
          id: i.id_bolo,
          name: i.nome,
          quantity: i.quantidade,
          price: i.preco_unitario,
          size: i.tamanho,
          image: cached?.items?.find((li) => String(li.id) === String(i.id_bolo))?.image
            ?? localProducts.find((lp) => String(lp.id) === String(i.id_bolo))?.image
            ?? null,
        }));
        const resolvedItems = backendItems.length > 0 ? backendItems : (cached?.items || []);

        database.runSync(
          "INSERT OR REPLACE INTO orders (id, user_id, total, items, date, status) VALUES (?, ?, ?, ?, ?, ?)",
          [id, userId, backendOrder.valor_total, JSON.stringify(resolvedItems), backendOrder.data_pedido, mappedStatus],
        );

        const address = backendOrder.logradouro
          ? {
              nome: backendOrder.nome_endereco,
              logradouro: backendOrder.logradouro,
              numero: backendOrder.numero,
              bairro: backendOrder.bairro,
              cidade: backendOrder.cidade,
              estado: backendOrder.estado,
              cep: backendOrder.CEP,
              complemento: backendOrder.complemento,
            }
          : null;

        return {
          id,
          user_id: userId,
          total: backendOrder.valor_total,
          date: backendOrder.data_pedido,
          status: mappedStatus,
          items: resolvedItems,
          metodo_pagamento: backendOrder.metodo_pagamento ?? null,
          cupom_codigo: backendOrder.cupom_codigo ?? null,
          desconto_valor: backendOrder.desconto_valor ?? 0,
          address,
        };
      });

      merged.sort((a, b) => (b.id || 0) - (a.id || 0));
      setOrders(merged);
    } catch {
      showToast("Não foi possível carregar seus pedidos.", "error");
    }
  }, [user, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const handleCopyTracking = async (code) => {
    await Clipboard.setStringAsync(code);
    showToast(`Código ${code} copiado!`, "info");
  };


  const statusOptions = ["preparing", "in_transit", "delivered", "rejected"];

  return (
    <View style={styles.container}>
      <Header title="Seus Pedidos" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Meus Pedidos</Text>
          <View style={styles.divider} />

          <View style={styles.tabsRow}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusTab,
                  activeTab === status && styles.statusTabActive,
                  status === "rejected" && { borderColor: "#e74c3c" },
                  status === "rejected" && activeTab === status && { backgroundColor: "#e74c3c" },
                ]}
                onPress={() => setActiveTab(status)}
              >
                {status === "preparing" && (
                  <Package
                    size={18}
                    color={activeTab === status ? Colors.background : Colors.primary}
                  />
                )}
                {status === "in_transit" && (
                  <Truck
                    size={18}
                    color={activeTab === status ? Colors.background : Colors.primary}
                  />
                )}
                {status === "delivered" && (
                  <CheckCircle
                    size={18}
                    color={activeTab === status ? Colors.background : Colors.primary}
                  />
                )}
                {status === "rejected" && (
                  <XCircle
                    size={18}
                    color={activeTab === status ? Colors.background : "#e74c3c"}
                  />
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
                  {order.date ? <Text style={styles.orderDateText}>{order.date}</Text> : null}
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Detalhes</Text>
                  <View style={styles.itemDivider} />

                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItem}>
                      <Image source={item.image} style={styles.orderItemImage} />
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

                  <Text style={styles.trackingDescription}>
                    O rastreamento da sua entrega é feito pela Velvet Log.
                  </Text>

                  <View style={styles.itemDivider} />

                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotalLabel}>Total Pago</Text>
                      <Text style={styles.orderTotalPrice}>
                        R$ {Number(order.total).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    <View style={styles.footerButtons}>
                      <Button
                        onPress={() => showToast("Seu pedido está sendo processado pela Velvet Log.", "info")}
                      >
                        Rastrear
                      </Button>
                      <TouchableOpacity
                        style={styles.infoBtn}
                        onPress={() => setSelectedOrder(order)}
                      >
                        <Info size={14} color={Colors.primary} />
                        <Text style={styles.infoBtnText}>Mais informações</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Navbar />

      <Modal visible={!!selectedOrder} transparent animationType="none">
        <OrderInfoSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 120 },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 16 },
  pageTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: Colors.primary, marginVertical: 5, opacity: 0.3 },
  tabsRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  statusTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusTabActive: { backgroundColor: Colors.primary },
  statusTabText: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  statusTabTextActive: { color: Colors.background },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: {
    textAlign: "center",
    color: Colors.secondary,
    fontFamily: Fonts.poppins,
    fontSize: 14 
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: "hidden",
    marginBottom: 15,
  },
  orderHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'column',
    gap: 3,
    padding: 12,
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trackingLabel: { fontFamily: Fonts.newsreader, fontSize: 18, color: '#D4AF37' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackingCode: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.background, textDecorationLine: 'underline' },
  orderDateText: { fontFamily: Fonts.poppins, fontSize: 10, color: Colors.background },
  orderItems: { padding: 12, gap: 10 },
  itemsTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: '#000' },
  itemDivider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.2, marginVertical: 5 },
  orderItem: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  orderItemImage: { width: 60, height: 60, borderRadius: 8 },
  orderItemInfo: { flex: 1, gap: 2 },
  orderItemName: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary },
  sizeRow: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontFamily: Fonts.poppins, fontSize: 13, color: '#666' },
  totalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  trackingDescription: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary, fontStyle: 'italic' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  orderTotalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  orderTotalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  footerButtons: { alignItems: 'flex-end', gap: 8 },
  infoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoBtnText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary, textDecorationLine: 'underline' },
});