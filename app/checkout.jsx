import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";
import {
  CheckCircle,
  MapPin,
  PencilLine,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddAddressModal } from "../src/components/AddAddressModal";
import { Button } from "../src/components/Button";
import { ConfirmDialog } from "../src/components/ConfirmDialog";
import { Header } from "../src/components/Header";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useAuth } from "../src/contexts/AuthContext";
import { useCart } from "../src/contexts/CartContext";
import { useNav } from "../src/contexts/NavContext";
import { useToast } from "../src/contexts/ToastContext";
import { addressService, orderService, paymentService } from "../src/services/api";
import { database } from "../src/services/database";

const getWeightMultiplier = (size) => {
  const parsed = Number.parseInt(size, 10);
  return Number.isNaN(parsed) ? 1 : parsed;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? user?.id_cliente;

  const { items: cart, total: totalValue, removeFromCart, appliedCoupon, updateItem, clearCart } = useCart();
  const { showToast } = useToast();

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showEditItem, setShowEditItem] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [itemOriginal, setItemOriginal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const pendingOrderRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const RETRIES = 4;
    const RETRY_DELAY_MS = 2500;

    const checkOrderStatus = async (orderId) => {
      for (let attempt = 0; attempt <= RETRIES; attempt++) {
        if (!isMountedRef.current) return;
        try {
          const orders = await orderService.getByClientId(userId);
          const order = orders.find((o) => o.id_pedido === orderId);
          if (order) {
            const s = (order.status_pedido || '').toLowerCase();
            if (s.includes('pago') || s.includes('paid') || s.includes('approved')) {
              if (isMountedRef.current) router.push('/payment-success');
              return;
            }
            if (s.includes('recusado') || s.includes('rejected') || s.includes('cancel')) {
              if (isMountedRef.current) showToast("Pagamento recusado ou cancelado. Tente novamente.", "error");
              return;
            }
          }
        } catch { /* falha silenciosa */ }
        if (attempt < RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
      if (isMountedRef.current) showToast("Pagamento em processamento. Acompanhe em Meus Pedidos.", "info");
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        const orderId = pendingOrderRef.current;
        if (orderId && userId) {
          pendingOrderRef.current = null;
          checkOrderStatus(orderId);
        }
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [userId]);

  const calcularFrete = (address) => {
    if (!address?.estado) return 0;
    const uf = address.estado.toUpperCase().trim();
    if (uf === "SP") return 20.0;
    if (["RJ", "MG", "PR", "ES", "MS", "GO"].includes(uf)) return 50.0;
    return 80.0;
  };

  const shipping = calcularFrete(selectedAddress);
  const discount = appliedCoupon ? Number(appliedCoupon.valor) : 0;
  const grandTotal = totalValue + shipping - discount;

  const loadAddress = async () => {
    setLoadingAddress(true);
    try {
      if (!userId) return;
      const data = await addressService.getByClientId(userId);
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setAddresses(list);
      if (list.length === 1) setSelectedAddress(list[0]);
    } catch {
      // falha silenciosa — endereços não carregados
    } finally {
      setLoadingAddress(false);
    }
  };

  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const dif = currentOffset - lastOffset.current;
    if (currentOffset <= 10) setShowNav(true);
    else if (dif > 0) setShowNav(false);
    else if (dif < 0) setShowNav(true);
    lastOffset.current = currentOffset;
  };

  useEffect(() => {
    loadAddress();
  }, [userId]);

  const handleFinishOrder = async () => {
    if (!selectedAddress) {
      showToast("Selecione um endereço para continuar.", "warning");
      return;
    }
    if (cart.length === 0) {
      showToast("Seu carrinho está vazio.", "warning");
      return;
    }

    setProcessing(true);
    try {
      const itens = cart.map((item) => ({
        id_bolo: item.id,
        quantidade: item.quantity,
        preco_unitario: item.price * getWeightMultiplier(item.size),
        tamanho: item.size || "Padrão",
      }));

      const orderData = {
        valor_total: grandTotal,
        metodo_pagamento: null,
        fk_Cliente_id_cliente: userId,
        fk_Endereco_id_endereco: selectedAddress?.id_endereco ?? null,
        cupom_codigo: appliedCoupon?.codigo ?? null,
        desconto_valor: appliedCoupon ? Number(appliedCoupon.valor) : 0,
        itens,
      };

      const backendResponse = await orderService.createOrder(orderData);
      const orderId = backendResponse.id_pedido;

      const successUrl = ExpoLinking.createURL("payment-success");
      const ordersUrl = ExpoLinking.createURL("orders");

      const paymentData = {
        items: [{ nome: "Valor total", quantidade: 1, preco_unitario: Number(grandTotal.toFixed(2)) }],
        id_pedido: orderId,
        metodo_pagamento: null,
        back_urls: { success: successUrl, failure: ordersUrl, pending: ordersUrl },
      };
      const paymentResponse = await paymentService.createPayment(paymentData);

      try {
        const localDate = new Date().toLocaleString("pt-BR");
        database.runSync(
          "INSERT OR REPLACE INTO orders (id, user_id, total, items, date, status) VALUES (?, ?, ?, ?, ?, ?)",
          [orderId, userId, grandTotal, JSON.stringify(cart), localDate, "pending_payment"],
        );
        const firstItemName = cart.length > 0 ? cart[0].name : "item";
        database.runSync(
          "INSERT OR IGNORE INTO notifications (user_id, title, message, status, date) VALUES (?, ?, ?, ?, ?)",
          [userId, `PEDIDO #${orderId} - PAGAMENTO`, `Pagamento iniciado para ${firstItemName}.`, "pending_payment", localDate],
        );
      } catch { /* falha silenciosa — pedido já criado, SQLite local é opcional */ }

      clearCart();
      const checkoutUrl = paymentResponse.sandbox_init_point ?? paymentResponse.init_point;
      if (checkoutUrl) {
        pendingOrderRef.current = orderId;
        Linking.openURL(checkoutUrl);
      }
    } catch (err) {
      showToast(err?.message || "Falha ao processar pedido. Tente novamente.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    const id = addressToDelete;
    setAddressToDelete(null);
    try {
      await addressService.delete(id, userId);
      if (selectedAddress?.id_endereco === id) setSelectedAddress(null);
      await loadAddress();
    } catch {
      showToast("Não foi possível excluir o endereço.", "error");
    }
  };

  return (
    <View style={styles.container}>
      <Header userName={user?.name ?? user?.nome} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Finalizar Pedido</Text>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <TouchableOpacity
              style={styles.plusIconCircle}
              onPress={() => { setAddressToEdit(null); setShowAddAddress(true); }}
            >
              <Plus size={18} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {loadingAddress ? (
            <Text style={styles.addressText}>Carregando...</Text>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MapPin size={24} color="#bfbfbf" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>Nenhum endereço cadastrado.{"\n"}Toque no "+" para adicionar.</Text>
            </View>
          ) : (
            <View style={{ width: "100%", gap: 10 }}>
              {addresses.map((item) => (
                <TouchableOpacity
                  key={item.id_endereco}
                  style={[styles.addressCard, selectedAddress?.id_endereco === item.id_endereco && styles.addressCardSelected]}
                  onPress={() => setSelectedAddress(item)}
                >
                  <Image source={require("../src/assets/images/mapa_endereco.png")} style={styles.mapImage} resizeMode="cover" />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{item.nome_endereco || "Casa"}</Text>
                    <Text style={styles.addressText}>{`${item.logradouro}, ${item.numero}\n${item.CEP}`}</Text>
                  </View>
                  <View style={styles.addressActions}>
                    {selectedAddress?.id_endereco === item.id_endereco && (
                      <CheckCircle size={20} color={Colors.primary} />
                    )}
                    <TouchableOpacity onPress={() => { setAddressToEdit(item); setShowAddAddress(true); }}>
                      <PencilLine size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAddressToDelete(item.id_endereco)}>
                      <Trash2 size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Itens</Text>
            <TouchableOpacity onPress={() => router.push("/search?from=checkout")} style={styles.plusIconCircle}>
              <Plus size={16} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={24} color="#bfbfbf" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>Carrinho vazio.</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={`${item.id}-${item.size}`} style={styles.orderItem}>
                <Image source={item.image} style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity onPress={() => { setItemToEdit({ ...item }); setItemOriginal(item); setShowEditItem(true); }}>
                        <PencilLine size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeFromCart(item.id, item.size)}>
                        <Trash2 size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.sizeRow}>
                    <Text style={styles.labelText}>Tamanho:</Text>
                    <View style={styles.sizeBadge}><Text style={styles.sizeText}>{item.size}</Text></View>
                  </View>
                  <Text style={styles.labelText}>Quantidade: {item.quantity}</Text>
                  <Text style={styles.itemTotalLabel}>Total</Text>
                  <Text style={styles.itemTotalPrice}>
                    R$ {(item.price * getWeightMultiplier(item.size) * item.quantity).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.paymentDetails}>
            <View style={styles.detailDivider} />
            <Text style={styles.detailSectionTitle}>Detalhes de pagamento</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total dos Produtos</Text>
              <Text style={styles.detailValue}>R$ {totalValue.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total do Frete</Text>
              <Text style={styles.detailValue}>
                {selectedAddress ? `R$ ${shipping.toFixed(2)}` : "Selecione um endereço"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cupom de Desconto</Text>
              <Text style={[styles.detailValue, { color: "#27ae60" }]}>- R$ {discount.toFixed(2)}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>R$ {grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Button fullWidth onPress={handleFinishOrder} disabled={processing}>
            {processing ? "Processando..." : "Finalizar"}
          </Button>
        </View>
      </ScrollView>

      <Modal visible={showEditItem} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#00000088", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 15 }}>Editar Item</Text>
            <Text style={{ marginBottom: 5 }}>Quantidade</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setItemToEdit({ ...itemToEdit, quantity: Math.max(1, itemToEdit.quantity - 1) })}
                style={styles.qtyButton}
              ><Text>-</Text></TouchableOpacity>
              <Text style={{ fontSize: 18 }}>{itemToEdit?.quantity}</Text>
              <TouchableOpacity
                onPress={() => setItemToEdit({ ...itemToEdit, quantity: itemToEdit.quantity + 1 })}
                style={styles.qtyButton}
              ><Text>+</Text></TouchableOpacity>
            </View>
            <Text style={{ marginBottom: 5 }}>Tamanho</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {["1Kg", "2Kg", "3Kg", "4Kg", "5Kg"].map((kg) => {
                const selected = itemToEdit?.size === kg;
                return (
                  <TouchableOpacity
                    key={kg}
                    onPress={() => setItemToEdit({ ...itemToEdit, size: kg })}
                    style={[styles.kgButton, selected && styles.kgButtonSelected]}
                  >
                    <Text style={{ color: selected ? "#FFF" : Colors.primary }}>{kg}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button fullWidth onPress={() => { updateItem(itemOriginal, itemToEdit); setShowEditItem(false); setItemToEdit(null); setItemOriginal(null); }} style={{ marginTop: 20 }}>
              Salvar alterações
            </Button>
            <TouchableOpacity onPress={() => { setShowEditItem(false); setItemToEdit(null); setItemOriginal(null); }} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: "center", color: "#999" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddAddress} animationType="slide" transparent>
        <AddAddressModal
          onClose={() => { setShowAddAddress(false); setAddressToEdit(null); }}
          user={user}
          addressData={addressToEdit}
          onSave={() => { loadAddress(); }}
        />
      </Modal>

      <ConfirmDialog
        visible={addressToDelete !== null}
        type="danger"
        title="Remover endereço?"
        message="Tem certeza que deseja remover este endereço?"
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteAddress}
        onCancel={() => setAddressToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 10 },
  pageTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.primary, textAlign: "center" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  sectionTitle: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary },
  mapImage: { width: 70, height: "100%", borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  addressCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, padding: 7, marginBottom: 10 },
  addressCardSelected: { backgroundColor: "#f0e0cc", borderWidth: 2, borderColor: Colors.secondary },
  addressInfo: { flex: 1 },
  addressName: { fontFamily: Fonts.newsreaderBold, fontSize: 20, color: Colors.primary },
  addressText: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary, lineHeight: 18 },
  addressActions: { alignItems: "center", justifyContent: "center", gap: 15, paddingLeft: 10 },
  orderItem: { flexDirection: "row", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.secondary, padding: 8, marginBottom: 10 },
  plusIconCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  orderItemImage: { width: 95, height: "100%", borderRadius: 12 },
  orderItemInfo: { flex: 1, gap: 4 },
  itemHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderItemName: { fontFamily: Fonts.newsreader, fontSize: 20, color: Colors.primary, flex: 1, marginBottom: 2 },
  qtyButton: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  kgButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  kgButtonSelected: { backgroundColor: Colors.primary },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  sizeBadge: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 },
  sizeText: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary },
  labelText: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary },
  itemTotalLabel: { fontFamily: Fonts.newsreader, fontSize: 12, color: Colors.secondary },
  itemTotalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.secondary },
  paymentMethodCentered: { flexDirection: "row", gap: 15, justifyContent: "center", marginVertical: 10 },
  paymentOption: { width: 80, height: 70, borderRadius: 10, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center", gap: 5 },
  paymentOptionActive: { backgroundColor: Colors.primary },
  paymentText: { fontFamily: Fonts.newsreader, fontSize: 12, color: Colors.primary },
  paymentDetails: { gap: 8, marginTop: 10 },
  detailDivider: { height: 2, backgroundColor: Colors.secondary, opacity: 0.3 },
  detailSectionTitle: { fontFamily: Fonts.poppins, fontSize: 15, color: Colors.secondary, marginBottom: 5 },
  detailLabel: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary },
  detailValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  grandTotalLabel: { fontFamily: Fonts.poppins, fontSize: 17, color: Colors.secondary },
  grandTotalValue: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.secondary },
  emptyContainer: { padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#bfbfbf", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: Fonts.newsreader, fontSize: 14, color: "#888", textAlign: "center" },
});
