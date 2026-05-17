import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../src/components/Header";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { adminService } from "../../src/services/api";

const STATUS_OPTIONS = ["Pendente", "Pago", "Enviado", "Entregue"];

export default function PedidoDetalhado() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadPedido = useCallback(async () => {
    try {
      const data = await adminService.getPedidoDetalhado(id);
      setPedido(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o pedido.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadPedido(); }, [loadPedido]);

  const handleUpdateStatus = async (novoStatus) => {
    setUpdatingStatus(true);
    try {
      await adminService.updatePedidoStatus(id, novoStatus);
      setPedido((prev) => ({ ...prev, status_pedido: novoStatus }));
      Alert.alert("Sucesso", `Status atualizado para "${novoStatus}".`);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o status.");
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

  const desconto = pedido.valor_total < (pedido.valor_total + 20) ? 0 : 20;
  const frete = 80;

  return (
    <View style={styles.container}>
      <Header title={`Pedido #${pedido.id_pedido}`} showBack />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <Text style={styles.clienteName}>{pedido.nome_cliente}</Text>
          <Text style={styles.clienteInfo}>{pedido.telefone}</Text>
          <Text style={styles.clienteInfo}>{pedido.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Itens pedidos</Text>
          {(pedido.itens || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemDetail}>Tamanho: {item.tamanho} | Qtd: {item.quantidade}</Text>
              </View>
              <Text style={styles.itemPrice}>
                R$ {(Number(item.preco_unitario) * item.quantidade).toFixed(2).replace(".", ",")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalhes de pagamento</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total dos produtos</Text>
            <Text style={styles.detailValue}>R$ {(Number(pedido.valor_total) - frete + desconto).toFixed(2).replace(".", ",")}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total do frete</Text>
            <Text style={styles.detailValue}>R$ {frete.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R$ {Number(pedido.valor_total).toFixed(2).replace(".", ",")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pagamento</Text>
            <View style={[styles.badge, { backgroundColor: pedido.status_pedido === "Pago" ? "#27ae60" : "#f39c12" }]}>
              <Text style={styles.badgeText}>{pedido.metodo_pagamento}</Text>
            </View>
          </View>
        </View>

        {pedido.logradouro && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Endereço de entrega</Text>
            <Text style={styles.addressText}>
              {pedido.logradouro}, {pedido.numero}{"\n"}
              {pedido.bairro} — {pedido.cidade}/{pedido.estado}{"\n"}
              CEP: {pedido.CEP}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Atualizar status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, pedido.status_pedido === s && styles.statusBtnActive]}
                onPress={() => handleUpdateStatus(s)}
                disabled={updatingStatus || pedido.status_pedido === s}
              >
                <Text style={[styles.statusBtnText, pedido.status_pedido === s && styles.statusBtnTextActive]}>
                  {s}
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
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, elevation: 2, gap: 8 },
  cardTitle: { fontFamily: Fonts.newsreader, fontSize: 17, color: Colors.primary, marginBottom: 4 },
  clienteName: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.primary },
  clienteInfo: { fontFamily: Fonts.poppins, fontSize: 13, color: "#555" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.primary },
  itemDetail: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.secondary },
  itemPrice: { fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.primary },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary },
  detailValue: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.2, marginVertical: 4 },
  totalLabel: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  totalValue: { fontFamily: Fonts.newsreaderBold, fontSize: 18, color: Colors.primary },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: Fonts.poppins, fontSize: 11, color: "#fff" },
  addressText: { fontFamily: Fonts.poppins, fontSize: 13, color: "#555", lineHeight: 20 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  statusBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  statusBtnActive: { backgroundColor: Colors.primary },
  statusBtnText: { fontFamily: Fonts.poppins, fontSize: 12, color: Colors.primary },
  statusBtnTextActive: { color: Colors.background },
});
