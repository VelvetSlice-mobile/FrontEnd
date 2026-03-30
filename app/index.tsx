import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Cake, CakeSlice, Cherry, Candy } from 'lucide-react-native';
import { products } from '../src/data/products';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Navbar } from '../src/components/Navbar';
import { Header } from '../src/components/Header';
import { ProductCard } from '../src/components/ProductCard';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Bolo: <Cake size={28} color={Colors.primary} />,
  Choco: <CakeSlice size={28} color={Colors.primary} />,
  Frutas: <Cherry size={28} color={Colors.primary} />,
  Doces: <Candy size={28} color={Colors.primary} />,
};

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['Bolo', 'Choco', 'Frutas', 'Doces'];

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : products;

  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Offers Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofertas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.filter(p => p.price < 50).map((product) => ( 
              <TouchableOpacity
                key={product.id}
                style={styles.offerCard}
                onPress={() => router.push(`/product/${product.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.offerInnerContent}>
                  <View style={styles.offerTextSection}>
                    <Text style={styles.offerSubtitle}>Especiais{'\n'}{product.name}s</Text>
                    <Text style={styles.offerDiscount}>OFF 60%</Text>
                    <View style={styles.offerButton}>
                      <Text style={styles.offerButtonText}>Ver</Text>
                    </View>
                  </View>
                  
                  <Image 
                    source={product.image} 
                    style={styles.offerImage} 
                    resizeMode="cover" 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryActive,
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {CATEGORY_ICONS[cat]}
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Só os melhores</Text>
          <View style={styles.gridContainer}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  section: { paddingHorizontal: 22, marginTop: 20 },
  sectionTitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 10,
  },
offerCard: {
    backgroundColor: Colors.background,
    width: 280,
    height: 150,
    borderRadius: 15,
    marginRight: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 0, 
    overflow: 'visible', 
  },
  offerInnerContent: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primary, 
    backgroundColor: Colors.background,
  },
  offerTextSection: { 
    padding: 15,
    width: '60%',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'transparent', 
  },
  offerSubtitle: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.primary },
  offerDiscount: { fontFamily: Fonts.newsreader, fontSize: 16, color: Colors.accent },
  offerButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  offerButtonText: { fontFamily: Fonts.newsreaderBold, fontSize: 16, color: Colors.background },
  offerImage: {
    width: 140,
    height: '100%',
    position: 'absolute',
    right: 0, 
    top: 0,
    zIndex: 1,
    borderLeftWidth: 6,
    borderLeftColor: Colors.primary, 
    borderTopLeftRadius: 200,
    borderBottomLeftRadius: 100,
    elevation: 5,
    borderColor: Colors.primary, 

  },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryButton: {
    backgroundColor: Colors.background,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    width: (width - 80) / 4,
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  categoryText: { fontFamily: Fonts.newsreader, fontSize: 10, color: Colors.primary },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
