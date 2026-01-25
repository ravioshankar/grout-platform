import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplace-categories';

interface PartnerProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  supplier_name: string;
}

export default function PartnerStoreScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const data = await apiClient.get('/api/v1/marketplace/partner-products', params);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Partner Store</ThemedText>
      </View>

      <View style={[styles.categoryContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.categoryWrapper}>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.categoryChip,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                selectedCategory === cat.name && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Ionicons
                name={cat.icon as any}
                size={isSmallScreen ? 14 : 16}
                color={selectedCategory === cat.name ? '#fff' : colors.text}
              />
              <Text style={[styles.categoryText, { color: selectedCategory === cat.name ? '#fff' : colors.text }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        ) : products.length === 0 ? (
          <ThemedText style={styles.emptyText}>No products available</ThemedText>
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.productCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => router.push(`/marketplace/partner-product/${product.id}` as any)}
              >
                <View style={styles.imageContainer}>
                  <Ionicons name="image-outline" size={48} color={colors.icon} />
                </View>
                <ThemedText style={styles.productName} numberOfLines={2}>{product.name}</ThemedText>
                <ThemedText style={[styles.supplierName, { color: colors.icon }]}>{product.supplier_name}</ThemedText>
                <ThemedText style={[styles.productPrice, { color: colors.tint }]}>${Number(product.price).toFixed(2)}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 10,
    paddingVertical: isSmallScreen ? 5 : 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: isSmallScreen ? 3 : 4,
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  imageContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 12,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
