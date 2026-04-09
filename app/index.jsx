import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Cake, CakeSlice, Cherry, Candy } from "lucide-react-native";
import { useNav } from "../src/contexts/NavContext";

// Importação de dados e constantes
import { products } from "../src/data/products";
import { Colors } from "../src/constants/Colors";
import { Fonts } from "../src/constants/Fonts";

// Importação de componentes
import { Header } from "../src/components/Header";
import { ProductCard } from "../src/components/ProductCard";

const { width } = Dimensions.get("window");

// Ajuste na estrutura dos ícones
const getCategoryIcon = (category) => {
  const iconProps = { size: 28, color: Colors.primary };
  switch (category) {
    case "Bolo":
      return <Cake {...iconProps} />;
    case "Choco":
      return <CakeSlice {...iconProps} />;
    case "Frutas":
      return <Cherry {...iconProps} />;
    case "Doces":
      return <Candy {...iconProps} />;
    default:
      return null;
  }
};

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  // Navbar sumindo no topo e aparecendo no scroll
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = currentOffset > lastOffset.current;

    if (currentOffset < 50) {
      setShowNav(false);
    }
    else if (isScrollingDown) {
      setShowNav(true);
    }
    else {
      setShowNav(false);
    }

    lastOffset.current = currentOffset;

  };

  const categories = ["Bolo", "Choco", "Frutas", "Doces"];

  const filteredProducts = selectedCategory
    ? products.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
      )
    : products;

  return (
    <View style={styles.mainContainer}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Carrossel de Ofertas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofertas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.offerCard}
              onPress={() => router.push("/product/1")}
              activeOpacity={0.8}
            >
              <View style={styles.offerContent}>
                <Text style={styles.offerSubtitle}>
                  Especiais{"\n"}Chocolatudos
                </Text>
                <Text style={styles.offerDiscount}>OFF 60%</Text>
                <View style={styles.offerButton}>
                  <Text style={styles.offerButtonText}>Ver</Text>
                </View>
              </View>
              <Image source={products[0].image} style={styles.offerImage} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.offerCard}
              onPress={() => router.push("/product/2")}
              activeOpacity={0.8}
            >
              <View style={styles.offerContent}>
                <Text style={styles.offerSubtitle}>
                  Especiais{"\n"}Frutudos
                </Text>
                <Text style={styles.offerDiscount}>OFF 60%</Text>
                <View style={styles.offerButton}>
                  <Text style={styles.offerButtonText}>Ver</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Categorias */}
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
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                {getCategoryIcon(cat)}
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grade de Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Só os melhores</Text>
          <View style={styles.gridContainer}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
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
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: "row",
    overflow: "hidden",
  },
  offerContent: { padding: 15, flex: 1, justifyContent: "center", gap: 4 },
  offerSubtitle: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.primary,
  },
  offerDiscount: {
    fontFamily: Fonts.newsreader,
    fontSize: 16,
    color: Colors.accent,
  },
  offerButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  offerButtonText: {
    fontFamily: Fonts.newsreaderBold,
    fontSize: 16,
    color: Colors.background,
  },
  offerImage: {
    width: 120,
    height: "120%",
    position: "absolute",
    right: -20,
    top: -10,
    borderRadius: 100,
  },
  categoriesRow: { flexDirection: "row", justifyContent: "space-between" },
  categoryButton: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    width: (width - 80) / 4,
  },
  categoryActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryText: {
    fontFamily: Fonts.newsreader,
    fontSize: 10,
    color: Colors.primary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
