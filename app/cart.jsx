import { useRouter } from "expo-router";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Header } from "../src/components/Header";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useAuth } from "../src/contexts/AuthContext";
import { useCart } from "../src/contexts/CartContext";
import { useNav } from "../src/contexts/NavContext";
import { useToast } from "../src/contexts/ToastContext";
import { cupomService } from "../src/services/api";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, total, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState(appliedCoupon?.codigo || "");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const { setShowNav } = useNav();
  const lastOffset = useRef(0);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = currentOffset > lastOffset.current;
    if (currentOffset < 50) setShowNav(false);
    else if (isScrollingDown) setShowNav(true);
    else setShowNav(false);
    lastOffset.current = currentOffset;
  };

  const handleCheckout = () => {
    if (!user) {
      showToast("Faça login ou crie sua conta para continuar.", "warning");
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    try {
      const data = await cupomService.validate(couponInput.trim());
      applyCoupon(data);
      showToast(`Cupom aplicado! Desconto de R$ ${Number(data.valor).toFixed(2).replace(".", ",")}`, "success");
    } catch (error) {
      showToast(error.message || "Cupom inválido ou não encontrado.", "error");
      removeCoupon();
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    removeCoupon();
  };

  return (
    <View style={styles.container}>
      <Header userName={user?.name ?? user?.nome} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Meu Carrinho</Text>

          {!items || items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
              <Button style={{ marginTop: 20 }} onPress={() => router.push("/")}>
                Ver produtos
              </Button>
            </View>
          ) : (
            <>
              {items.map((item) => {
                const weightMultiplier = Number.parseInt(item.size) || 1;
                const itemSubtotal = item.price * weightMultiplier * item.quantity;
                return (
                  <View key={`${item.id}-${item.size}`} style={styles.cartCard}>
                    <Image source={item.image} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category || "Confeitaria"}</Text>
                      <View style={styles.sizeRow}>
                        <Text style={styles.sizeLabel}>Tamanho:</Text>
                        <View style={styles.sizeBadge}>
                          <Text style={styles.sizeText}>{item.size}</Text>
                        </View>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.subTotalLabel}>Sub total</Text>
                        <Text style={styles.itemPrice}>
                          R$ {itemSubtotal.toFixed(2).replace(".", ",")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.quantityColumn}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          style={styles.qtyButton}
                        >
                          <Plus size={14} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => { if (item.quantity > 1) updateQuantity(item.id, item.size, item.quantity - 1); }}
                          style={styles.qtyButtonDark}
                        >
                          <Minus size={14} color={Colors.background} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.id, item.size)} style={{ marginTop: 10 }}>
                        <Trash2 size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Digite o cupom..."
                  placeholderTextColor={Colors.secondary}
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                  editable={!appliedCoupon}
                />
                {appliedCoupon ? (
                  <TouchableOpacity style={[styles.couponButton, { backgroundColor: "#e74c3c" }]} onPress={handleRemoveCoupon}>
                    <Text style={styles.couponButtonText}>Remover</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.couponButton} onPress={handleApplyCoupon} disabled={loadingCoupon}>
                    {loadingCoupon
                      ? <ActivityIndicator color={Colors.background} size="small" />
                      : <Text style={styles.couponButtonText}>Inserir</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>

              {appliedCoupon && (
                <Text style={styles.couponApplied}>
                  ✓ Cupom "{appliedCoupon.codigo}" — R$ {Number(appliedCoupon.valor).toFixed(2).replace(".", ",")} de desconto
                </Text>
              )}

              <View style={styles.bottomRow}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total do pedido</Text>
                  {appliedCoupon ? (
                    <>
                      <Text style={styles.totalPriceStrike}>
                        R$ {total.toFixed(2).replace(".", ",")}
                      </Text>
                      <Text style={styles.totalPrice}>
                        R$ {Math.max(0, total - Number(appliedCoupon.valor)).toFixed(2).replace(".", ",")}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.totalPrice}>
                      R$ {total.toFixed(2).replace(".", ",")}
                    </Text>
                  )}
                </View>
                <Button onPress={handleCheckout}>Ir para pagamento</Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 130 },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 12 },
  pageTitle: { fontFamily: Fonts.newsreader, fontSize: 24, color: Colors.black, textAlign: "center", marginBottom: 10 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontFamily: Fonts.poppins, fontSize: 16, color: Colors.secondary, textAlign: "center" },
  cartCard: { flexDirection: "row", backgroundColor: Colors.background, borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
  itemImage: { width: 90, height: 110, borderRadius: 8 },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontFamily: Fonts.newsreader, fontSize: 22, color: Colors.primary },
  itemCategory: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sizeLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  sizeBadge: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  sizeText: { fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary },
  priceContainer: { marginTop: 4 },
  subTotalLabel: { fontFamily: Fonts.poppins, fontSize: 10, color: Colors.secondary },
  itemPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.primary },
  quantityColumn: { alignItems: "center", justifyContent: "space-between" },
  quantityControl: { alignItems: "center", gap: 6 },
  qtyButton: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 4, padding: 2 },
  qtyButtonDark: { backgroundColor: Colors.primary, borderRadius: 4, padding: 2 },
  qtyText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  couponRow: { flexDirection: "row", backgroundColor: Colors.background, borderRadius: 12, gap: 10, alignItems: "center", paddingLeft: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", marginTop: 10 },
  couponInput: { flex: 1, fontFamily: Fonts.newsreader, fontSize: 14, color: Colors.primary, height: 44 },
  couponButton: { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, minWidth: 80, alignItems: "center" },
  couponButtonText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.background },
  couponApplied: { fontFamily: Fonts.poppins, fontSize: 13, color: "#27ae60", textAlign: "center" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  totalContainer: { gap: 2 },
  totalLabel: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  totalPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 22, color: Colors.primary },
  totalPriceStrike: { fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.secondary, textDecorationLine: "line-through" },
});
