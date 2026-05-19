import { useLocalSearchParams, useRouter } from "expo-router";
import { Phone, User } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { useToast } from "../../src/contexts/ToastContext";
import { adminService } from "../../src/services/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function resolveImageUrl(imagem) {
  if (!imagem) return null;
  if (/^https?:\/\//i.test(imagem)) return imagem;
  if (imagem.startsWith("/")) return `${API_URL}${imagem}`;
  return null;
}

const STATUS_OPTIONS = ["Pendente", "Pago", "Enviado", "Entregue"];
const STATUS_LABEL = { Pendente: "Pendente", Pago: "Preparando", Enviado: "Enviado", Entregue: "Entregue" };
const STATUS_COLOR = { Pendente: "#f39c12", Pago: Colors.primary, Enviado: "#2980b9", Entregue: "#27ae60" };

export default function PedidoDetalhado() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadPedido = useCallback(async () => {
    try {
      const data = await adminService.getPedidoDetalhado(id);
      setPedido(data);
    } catch {
      showToast("Não foi possível carregar o pedido.", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadPedido(); }, [loadPedido]);

  const handleUpdateStatus = async (novoStatus) => {
    if (pedido.status_pedido === novoStatus) return;
    setUpdatingStatus(true);
    try {
      await adminService.updatePedidoStatus(id, novoStatus);
      setPedido((prev) => ({ ...prev, status_pedido: novoStatus }));
      showToast("Status atualizado com sucesso!", "success");
    } catch {
      showToast("Não foi possível atualizar o status.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const itensTotalValue = (pedido.itens || []).reduce(
    (sum, item) => sum + Number(item.preco_unitario) * item.quantidade,
    0
  );

  return (
    <View style={styles.container}>
      <Header title={`Pedido #${pedido.id_pedido}`} showBack />

      <View style={styles.statusBadgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[pedido.status_pedido] || "#999" }]}>
          <Text style={styles.statusBadgeText}>{STATUS_LABEL[pedido.status_pedido] || pedido.status_pedido}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <View style={styles.clienteRow}>
            <View style={styles.avatarCircle}>
              <User size={24} color={Colors.background} />
            </View>
            <Text style={styles.clienteName}>{pedido.nome_cliente}</Text>
            <View style={styles.clienteActions}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => pedido.telefone && Linking.openURL(`tel:${pedido.telefone}`)}
              >
                <Phone size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => pedido.telefone && Linking.openURL(`https://wa.me/55${pedido.telefone.replace(/\D/g, "")}`)}
              >
                <Text style={styles.whatsappIcon}>W</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Itens pedidos</Text>
          {(pedido.itens || []).map((item, i) => {
            const imageUrl = resolveImageUrl(item.imagem);
            return (
              <View key={i} style={styles.itemRow}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <View style={styles.itemSizeBadge}>
                    <Text style={styles.itemSizeBadgeText}>Tamanho: {item.tamanho}</Text>
                  </View>
                  <Text style={styles.itemDetail}>Quantidade: {item.quantidade}</Text>
                  <Text style={styles.itemTotalLabel}>Total</Text>
                  <Text style={styles.itemTotal}>
                    R$ {(Number(item.preco_unitario) * item.quantidade).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalhes de pagamento</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total dos produtos</Text>
            <Text style={styles.detailValue}>R$ {itensTotalValue.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total do frete</Text>
            <Text style={styles.detailValue}>
              R$ {Math.max(0, Number(pedido.valor_total) - itensTotalValue).toFixed(2).replace(".", ",")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cupom de desconto</Text>
            <Text style={[styles.detailValue, { color: "#27ae60" }]}>R$ 0,00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R$ {Number(pedido.valor_total).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        {pedido.logradouro ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Endereço de entrega</Text>
            <View style={styles.addressRow}>
              <Image
                source={require("../../src/assets/images/mapa_endereco.png")}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <Text style={styles.addressText}>
                {pedido.logradouro}, {pedido.numero}{"\n"}
                {pedido.bairro ? `${pedido.bairro} — ` : ""}{pedido.cidade}/{pedido.estado}{"\n"}
                CEP: {pedido.CEP}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pago via {pedido.metodo_pagamento}</Text>
            <View style={[styles.statusBadge, { backgroundColor: pedido.status_pedido === "Pago" || pedido.status_pedido === "Enviado" || pedido.status_pedido === "Entregue" ? "#27ae60" : "#f39c12" }]}>
              <Text style={styles.statusBadgeText}>
                {pedido.status_pedido === "Pendente" ? "Pendente" : "Pago"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Editar status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, pedido.status_pedido === s && styles.statusBtnActive]}
                onPress={() => handleUpdateStatus(s)}
                disabled={updatingStatus}
              >
                <Text style={[styles.statusBtnText, pedido.status_pedido === s && styles.statusBtnTextActive]}>
                  {STATUS_LABEL[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {updatingStatus && <ActivityIndicator color={Colors.primary} style={{ marginTop: 10 }} />}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusBadgeRow: { alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 8 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, elevation: 2, gap: 10 },
  cardTitle: { fontFamily: Fonts.newsreader, fontSize: 17, color: Colors.primary },
  clienteRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  clienteName: { flex: 1, fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.primary },
  clienteActions: { flexDirection: "row", gap: 8 },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  whatsappIcon: { fontFamily: Fonts.newsreaderBold, fontSize: 14, color: Colors.primary },
  itemRow: { flexDirection: "row", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemImagePlaceholder: { backgroundColor: "#e0d5cc" },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  itemSizeBadge: { backgroundColor: Colors.background, borderRadius: 6, borderWidth: 1, borderColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  itemSizeBadgeText: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.primary },
  itemDetail: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  itemTotalLabel: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary },
  itemTotal: { fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.primary },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary },
  detailValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.2 },
  totalLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  totalValue: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.primary },
  addressRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  mapImage: { width: 70, height: 70, borderRadius: 10 },
  addressText: { flex: 1, fontFamily: Fonts.poppins, fontSize: 13, color: "#555", lineHeight: 20 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  statusBadgeText: { fontFamily: Fonts.poppins, fontSize: 12, color: "#fff" },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  statusBtnActive: { backgroundColor: Colors.primary },
  statusBtnText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  statusBtnTextActive: { color: Colors.background },
});
