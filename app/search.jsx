import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';
import { products } from '../src/data/products';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { ProductCard } from '../src/components/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <View style={styles.searchInputRow}>
            <SearchIcon size={16} color={Colors.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar"
              placeholderTextColor={Colors.secondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

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
  content: { paddingHorizontal: 22, marginTop: 12 },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingHorizontal: 12,
    height: 40,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.primary,
  },
  resultsLabel: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyText: {
    fontFamily: Fonts.poppins,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
