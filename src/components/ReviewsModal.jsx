import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { avaliacaoService } from "../services/api";

function StarRow({ nota, size = 16, interactive = false, onSelect }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={interactive ? () => onSelect?.(n) : undefined}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Star
            size={size}
            color={Colors.accent}
            fill={n <= nota ? Colors.accent : "transparent"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

StarRow.propTypes = {
  nota: PropTypes.number.isRequired,
  size: PropTypes.number,
  interactive: PropTypes.bool,
  onSelect: PropTypes.func,
};

function InitialsAvatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

InitialsAvatar.propTypes = { name: PropTypes.string };

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function ReviewsModal({ boloId, visible, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const userId = user?.id ?? user?.id_cliente;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => { if (g.dy > 60) onClose(); },
    })
  ).current;

  useEffect(() => {
    if (!visible || !boloId) return;
    setLoading(true);
    avaliacaoService.getByBolo(boloId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [visible, boloId]);

  const handleSubmit = async () => {
    if (!nota) { showToast("Selecione uma nota de 1 a 5 estrelas.", "warning"); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      await avaliacaoService.create(boloId, { nota, comentario, fk_Cliente_id_cliente: userId });
      showToast("Avaliação enviada!", "success");
      setNota(0);
      setComentario("");
      const updated = await avaliacaoService.getByBolo(boloId);
      setReviews(updated);
    } catch (err) {
      showToast(err.message || "Não foi possível enviar a avaliação.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const mediaNotas = reviews.length
    ? (reviews.reduce((s, r) => s + r.nota, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Avaliações</Text>
          {mediaNotas && (
            <View style={styles.mediaRow}>
              <Star size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.mediaText}>{mediaNotas}</Text>
              <Text style={styles.countText}>({reviews.length})</Text>
            </View>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id_avaliacao} style={styles.reviewCard}>
                <InitialsAvatar name={r.nome} />
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{r.nome}</Text>
                    <Text style={styles.reviewDate}>{formatDate(r.data_avaliacao)}</Text>
                  </View>
                  <StarRow nota={r.nota} size={13} />
                  {r.comentario ? (
                    <Text style={styles.reviewComment}>{r.comentario}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}

          <View style={styles.divider} />

          {user ? (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Deixe sua avaliação</Text>
              <View style={styles.starSelectRow}>
                <StarRow nota={nota} size={28} interactive onSelect={setNota} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Escreva um comentário (opcional)"
                placeholderTextColor={Colors.secondary}
                value={comentario}
                onChangeText={setComentario}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
              <TouchableOpacity
                style={[styles.submitBtn, (!nota || submitting) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!nota || submitting}
              >
                {submitting
                  ? <ActivityIndicator color={Colors.background} size="small" />
                  : <Text style={styles.submitText}>Enviar avaliação</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.loginHint}>Faça login para deixar uma avaliação.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

ReviewsModal.propTypes = {
  boloId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 100 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
    maxHeight: "85%",
  },
  handleArea: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.secondary, opacity: 0.4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, marginBottom: 4 },
  title: { fontFamily: Fonts.newsreader, fontSize: 22, color: Colors.primary },
  mediaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  mediaText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.accent },
  countText: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 16 },
  emptyText: { fontFamily: Fonts.newsreader, fontSize: 15, color: Colors.secondary, textAlign: "center", marginVertical: 24 },
  reviewCard: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.background },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewerName: { fontFamily: Fonts.newsreaderBold, fontSize: 15, color: Colors.primary },
  reviewDate: { fontFamily: Fonts.poppins, fontSize: 11, color: Colors.secondary },
  reviewComment: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.primary, lineHeight: 18, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.secondary, opacity: 0.2, marginVertical: 16 },
  formSection: { gap: 12 },
  formTitle: { fontFamily: Fonts.newsreader, fontSize: 18, color: Colors.primary },
  starSelectRow: { alignItems: "flex-start" },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.background },
  loginHint: { fontFamily: Fonts.poppins, fontSize: 13, color: Colors.secondary, textAlign: "center", marginVertical: 16 },
});
