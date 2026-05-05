import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../../src/components/Header';
import { Colors } from "../../src/constants/Colors";
import { AdmCardProduct } from '../../src/components/AdmCardProduct';
import { productService } from '../../src/services/api'; 

export default function Dashboard() {
  const [bolos, setBolos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarBolos = async () => {
    try {
      setLoading(true);
      const dados = await productService.getAll();
      setBolos(dados);
    } catch (error) {
      console.error("Erro ao buscar bolos do banco:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarBolos();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Gerenciar Produtos ({bolos.length})</Text>

          <View style={styles.cardList}>
            {bolos.map((bolo) => (
              <AdmCardProduct key={bolo.id} product={bolo} />
            ))}
          </View>
          
          {bolos.length === 0 && (
            <Text style={styles.emptyText}>Nenhum bolo encontrado no banco de dados.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background || "#fff" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { paddingHorizontal: 22, marginTop: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  cardList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});