import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { products } from "../src/data/products";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";
import { Navbar } from "../src/components/Navbar";
import { Header } from "../src/components/Header";
import { ProductCard } from "../src/components/ProductCard";
import { useLocalSearchParams } from 'expo-router';

export default function SearchPage() {
  const params = useLocalSearchParams();
  const [query, setQuery] = useState((params.q as string) || '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); 
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <Header
        value={query}
        onChangeText={(text: string) => setQuery(text)}
        autoFocus={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
        <Text style={styles.resultsLabel}>Resultados: </Text>

        <View style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {filtered.length === 0 && (
          <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
        )}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 22, marginTop: 20 },
  resultsLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyText: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: 40,
  },
});
