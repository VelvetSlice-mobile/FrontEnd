import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CreditCard,
  Plus,
  QrCode,
  Trash2,
  MapPin,
  PencilLine,
  ShoppingBag,
} from "lucide-react-native";

// Contextos e Serviços
import { useAuth } from "../src/contexts/AuthContext";
import { useCart } from "../src/contexts/CartContext";
import { database } from "../src/services/database";
import { addressService } from "../src/services/api";

// Componentes e Constantes
import { Header } from "../src/components/Header";
import { Button } from "../src/components/Button";
import { AddAddressModal } from "../src/components/AddAddressModal";
import { AddCardModal } from "../src/components/AddCardModal";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { useNav } from "../src/contexts/NavContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items: cart,
    total: totalValue,
    clearCart,
    removeFromCart,
  } = useCart();

  // Estados
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cards, setCards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showEditItem, setShowEditItem] = useState(false);
  const { updateItem } = useCart();
  const [itemOriginal, setItemOriginal] = useState(null);

  // Valores para o resumo (Mantendo suas variáveis de cálculo)
  const shipping = 80.0;
  const discount = 20.0;
  const grandTotal = totalValue + shipping - discount;

  // Carregar Endereços (Sua lógica de correção)
  const loadAddress = async () => {
    setLoadingAddress(true);
    try {
      // Usando ID 1 como padrão conforme seu código anterior
      const data = await addressService.getByClientId(1);
      setAddresses(Array.isArray(data) ? data : data ? [data] : []);
    } catch (error) {
      console.log("Erro ao carregar endereços:", error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const dif = currentOffset - lastOffset.current;

    if (currentOffset <= 10) {
      setShowNav(true);
    } else if (dif > 0) {
      setShowNav(false);
    } else if (dif < 0) {
      setShowNav(true);
    }

    lastOffset.current = currentOffset;
  };

  useEffect(() => {
    loadAddress();
  }, []);

  // Lógica de Finalização (Lógica do Miguel com salvamento no SQLite)
  const handleFinishOrder = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para finalizar o pedido.");
      return;
    }

    if (paymentMethod === "card" && cards.length === 0) {
      Alert.alert("Atenção", "Adicione um cartão para continuar.");
      setShowAddCard(true);
      return;
    }

    const orderData = {
      user_id: user.id,
      total: grandTotal,
      items: JSON.stringify(cart),
      date: new Date().toLocaleString("pt-BR"),
      status: "preparing",
    };

    try {
      // 1. Inserir Pedido
      database.runSync(
        "INSERT INTO orders (user_id, total, items, date, status) VALUES (?, ?, ?, ?, ?)",
        [
          orderData.user_id,
          orderData.total,
          orderData.items,
          orderData.date,
          orderData.status,
        ],
      );

      const lastOrder = database.getFirstSync(
        "SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        [user.id],
      );
      const orderId = lastOrder ? lastOrder.id : "0000";

      // 2. Inserir Notificação
      const firstItemName = cart.length > 0 ? cart[0].name : "item";
      const notificationMsg =
        cart.length > 1
          ? `Seu pedido de ${firstItemName} e outros itens foi recebido.`
          : `Seu pedido de ${firstItemName} foi recebido.`;

      database.runSync(
        "INSERT INTO notifications (user_id, title, message, status, date) VALUES (?, ?, ?, ?, ?)",
        [
          user.id,
          `PEDIDO #${orderId} REALIZADO`,
          notificationMsg,
          "preparing",
          orderData.date,
        ],
      );

      // 3. Integração com Backend (Opcional)
      try {
        await fetch("http://192.168.1.10:3000/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderData, id: orderId }),
        });
      } catch (e) {
        console.log("Backend offline, salvando localmente.");
      }

      clearCart();
      router.push("/payment-success");
    } catch (dbError) {
      console.error(dbError);
      Alert.alert("Erro", "Falha ao processar pedido no banco local.");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressService.delete(id);
      Alert.alert("Sucesso", "Endereço removido.");
      loadAddress();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o endereço.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Finalizar Pedido" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Comprar</Text>

          {/* SEÇÃO ENDEREÇO */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <TouchableOpacity
              style={styles.plusIconCircle}
              onPress={() => {
                setAddressToEdit(null);
                setShowAddAddress(true);
              }}
            >
              <Plus size={18} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {loadingAddress ? (
            <Text style={styles.addressText}>Carregando...</Text>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MapPin size={24} color="#bfbfbf" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>
                Nenhum endereço cadastrado.{"\n"}Toque no "+" para adicionar.
              </Text>
            </View>
          ) : (
            <View style={{ width: "100%", gap: 10 }}>
              {addresses.map((item) => (
                <View key={item.id_endereco} style={styles.addressCard}>
                  <Image
                    source={require("../src/assets/images/mapa_endereco.png")}
                    style={styles.mapImage}
                    resizeMode="cover"
                  />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>
                      {item.nome_endereco || "Casa"}
                    </Text>
                    <Text style={styles.addressText}>
                      {`${item.logradouro}, ${item.numero}\n${item.CEP}`}
                    </Text>
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setAddressToEdit(item);
                        setShowAddAddress(true);
                      }}
                    >
                      <PencilLine size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(item.id_endereco)}
                    >
                      <Trash2 size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* SEÇÃO ITENS */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Itens</Text>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={styles.plusIconCircle}
            >
              <Plus size={16} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag
                size={24}
                color="#bfbfbf"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.emptyText}>Carrinho vazio.</Text>
            </View>
          ) : (
            cart.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Image source={item.image} style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.orderItemName}>{item.name}</Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                      }}
                    >
                      {/* ✏️ CANETINHA */}
                      <TouchableOpacity
                        onPress={() => {
                          setItemToEdit({ ...item }); // cópia editável
                          setItemOriginal(item); // 🔥 ESSENCIAL
                          setShowEditItem(true);
                        }}
                      >
                        <PencilLine size={18} color={Colors.primary} />
                      </TouchableOpacity>

                      {/* 🗑 LIXEIRA */}
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id, item.size)}
                      >
                        <Trash2 size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.sizeRow}>
                    <Text style={styles.labelText}>Tamanho:</Text>
                    <View style={styles.sizeBadge}>
                      <Text style={styles.sizeText}>{item.size}</Text>
                    </View>
                  </View>

                  <Text style={styles.labelText}>
                    Quantidade: {item.quantity}
                  </Text>

                  <Text style={styles.itemTotalLabel}>Total</Text>

                  <Text style={styles.itemTotalPrice}>
                    R${" "}
                    {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* MÉTODO DE PAGAMENTO */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Método de pagamento</Text>
          </View>

          <View style={styles.paymentMethodCentered}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "card" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <CreditCard
                size={24}
                color={paymentMethod === "card" ? "#FFF" : Colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "pix" && styles.paymentOptionActive,
              ]}
              onPress={() => {
                setPaymentMethod("pix");
                router.push("/pix-payment"); // ou o nome da sua tela
              }}
            >
              <QrCode
                size={24}
                color={paymentMethod === "pix" ? "#FFF" : Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {paymentMethod === "card" && (
            <View style={{ gap: 10, marginTop: 5 }}>
              {cards.length === 0 ? (
                <TouchableOpacity
                  style={styles.emptyContainer}
                  onPress={() => {
                    setCardToEdit(null);
                    setShowAddCard(true);
                  }}
                >
                  <CreditCard
                    size={24}
                    color="#bfbfbf"
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.emptyText}>Cadastre um cartão.</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.savedCardsHeader}>
                    <Text style={styles.savedCardsLabel}>Cartões salvos</Text>
                    <TouchableOpacity
                      style={styles.plusIconCircle}
                      onPress={() => {
                        setCardToEdit(null);
                        setShowAddCard(true);
                      }}
                    >
                      <Plus size={18} color={Colors.primary} strokeWidth={3} />
                    </TouchableOpacity>
                  </View>

                  {cards.map((card, index) => {
                    const isSelected = selectedCard === index;

                    return (
                      <TouchableOpacity
                        key={card.id || index}
                        style={[
                          styles.cardOption,
                          isSelected && styles.cardOptionSelected,
                        ]}
                        onPress={() => setSelectedCard(index)}
                      >
                        <CreditCard
                          size={24}
                          color={isSelected ? "#FFF" : Colors.primary}
                        />

                        <View style={styles.cardInfo}>
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && { color: "#FFF" },
                            ]}
                          >
                            {card.type === "credit"
                              ? "Cartão de crédito"
                              : card.type === "debit"
                                ? "Cartão de débito"
                                : "Tipo desconhecido"}
                          </Text>

                          <Text
                            style={{
                              fontSize: 14,
                              color: Colors.secondary,
                              marginTop: 2,
                            }}
                          >
                            **** **** **** {card.cardNumber?.slice(-4)}
                          </Text>
                        </View>

                        {/* ✏️ EDITAR */}
                        <TouchableOpacity
                          onPress={() => {
                            setCardToEdit(card);
                            setShowAddCard(true);
                          }}
                        >
                          <PencilLine
                            size={20}
                            color={isSelected ? "#FFF" : Colors.primary}
                          />
                        </TouchableOpacity>

                        {/* 🗑 EXCLUIR */}
                        <TouchableOpacity
                          onPress={() =>
                            setCards(cards.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2
                            size={20}
                            color={isSelected ? "#FFF" : "#e74c3c"}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </View>
          )}

          {/* DETALHES DE PAGAMENTO */}

          <View style={styles.paymentDetails}>
            <View style={styles.detailDivider} />
            <Text style={styles.sectionTitle}>Detalhes de pagamento</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total dos Produtos</Text>
              <Text style={styles.detailValue}>R$ {totalValue.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total do Frete</Text>
              <Text style={styles.detailValue}>R$ {shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cupom de Desconto</Text>
              <Text style={[styles.detailValue, { color: "#27ae60" }]}>
                - R$ {discount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                R$ {grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <Button fullWidth onPress={handleFinishOrder}>
            Finalizar
          </Button>
        </View>
      </ScrollView>

      {/* MODAIS */}
      <Modal visible={showAddCard} animationType="slide" transparent={true}>
        <AddCardModal
          cardData={cardToEdit}
          onClose={() => {
            setShowAddCard(false);
            setCardToEdit(null);
          }}
          onSave={(data) => {
            const newCard = {
              ...data,
              id: cardToEdit ? cardToEdit.id : Math.random().toString(),
              cardNumber: data.number,

              type:
                data.selectedType === "debito" || data.selectedType === "debit"
                  ? "debit"
                  : "credit",
            };
            if (cardToEdit) {
              setCards(
                cards.map((c) => (c.id === cardToEdit.id ? newCard : c)),
              );
            } else {
              setCards([...cards, newCard]);
            }

            setCardToEdit(null);
            setShowAddCard(false);
          }}
        />
      </Modal>
      <Modal visible={showEditItem} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000088",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 15 }}>Editar Item</Text>

            {/* 🔢 QUANTIDADE */}
            <Text style={{ marginBottom: 5 }}>Quantidade</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() =>
                  setItemToEdit({
                    ...itemToEdit,
                    quantity: Math.max(1, itemToEdit.quantity - 1),
                  })
                }
                style={styles.qtyButton}
              >
                <Text>-</Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 18 }}>{itemToEdit?.quantity}</Text>

              <TouchableOpacity
                onPress={() =>
                  setItemToEdit({
                    ...itemToEdit,
                    quantity: itemToEdit.quantity + 1,
                  })
                }
                style={styles.qtyButton}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>

            {/* ⚖️ TAMANHO (KG) */}
            <Text style={{ marginBottom: 5 }}>Tamanho</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {["1Kg", "2Kg", "3Kg", "4Kg", "5Kg"].map((kg) => {
                const selected = itemToEdit?.size === kg;

                return (
                  <TouchableOpacity
                    key={kg}
                    onPress={() =>
                      setItemToEdit({
                        ...itemToEdit,
                        size: kg,
                      })
                    }
                    style={[
                      styles.kgButton,
                      selected && styles.kgButtonSelected,
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? "#FFF" : Colors.primary,
                      }}
                    >
                      {kg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 💾 SALVAR */}
            <Button
              fullWidth
              onPress={() => {
                updateItem(itemOriginal, itemToEdit);

                setShowEditItem(false);
                setItemToEdit(null);
                setItemOriginal(null);
              }}
              style={{ marginTop: 20 }}
            >
              Salvar alterações
            </Button>

            <TouchableOpacity
              onPress={() => {
                setShowEditItem(false);
                setItemToEdit(null);
                setItemOriginal(null);
              }}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "#999" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddAddress} animationType="slide" transparent={true}>
        <AddAddressModal
          onClose={() => {
            setShowAddAddress(false);
            setAddressToEdit(null);
          }}
          addressData={addressToEdit}
          onSave={() => {
            loadAddress();
            setAddressToEdit(null);
            setShowAddAddress(false);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 12, gap: 10 },
  pageTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 24,
    color: Colors.black,
    textAlign: "center",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 20,
    color: Colors.black,
  },
  mapImage: {
    width: 70,
    height: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 7,
    marginBottom: 10,
  },
  addressInfo: { flex: 1 },
  addressName: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 20,
    color: Colors.primary,
  },
  addressText: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary,
    lineHeight: 18,
  },
  addressActions: {
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    paddingLeft: 10,
  },
  orderItem: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    padding: 8,
    marginBottom: 10,
  },
  plusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  orderItemImage: { width: 95, height: "100%", borderRadius: 12 },
  orderItemInfo: { flex: 1, gap: 4 },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderItemName: {
    fontFamily: Fonts.newsreader,
    fontSize: 20,
    color: Colors.primary,
    flex: 1,
    marginBottom: 2,
  },
  qtyButton: {
    width: 35,
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  kgButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  kgButtonSelected: {
    backgroundColor: Colors.primary,
  },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  sizeBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  sizeText: {
    fontFamily: Fonts.newsreader,
    fontSize: 14,
    color: Colors.primary,
  },
  labelText: {
    fontFamily: Fonts.newsreader,
    fontSize: 15,
    color: Colors.primary,
  },
  itemTotalLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 12,
    color: Colors.secondary,
  },
  itemTotalPrice: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 18,
    color: Colors.secondary,
  },
  paymentMethodCentered: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    marginVertical: 10,
  },
  paymentOption: {
    width: 65,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionActive: { backgroundColor: Colors.primary },
  cardOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 15,
    marginBottom: 10,
  },
  cardOptionSelected: { backgroundColor: "#4A2B19", borderColor: "#4A2B19" },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: "#4A2B19" },
  savedCardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  savedCardsLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  paymentDetails: { gap: 8, marginTop: 10 },
  detailDivider: { height: 2, backgroundColor: Colors.secondary, opacity: 0.3 },
  sectionTitle: {
    fontFamily: Fonts.poppins,
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 5,
  },
  detailLabel: {
    fontFamily: Fonts.poppins,
    fontSize: 13,
    color: Colors.secondary,
  },
  detailValue: {
    fontFamily: Fonts.poppins,
    fontSize: 13,
    color: Colors.primary,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  grandTotalLabel: {
    fontFamily: Fonts.poppins,
    fontSize: 17,
    color: Colors.secondary,
  },
  grandTotalValue: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 18,
    color: Colors.secondary,
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: Fonts.newsreader,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
