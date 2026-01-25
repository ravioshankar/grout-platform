import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import { useThemedAlert } from '@/hooks/use-themed-alert';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  supplier_name: string;
  supplier_website: string;
  supplier_phone: string;
}

export default function PartnerProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showAlert } = useThemedAlert();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await apiClient.get(`/api/v1/marketplace/partner-products/${id}`);
      setProduct(data);
    } catch (error) {
      showAlert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (method: 'website' | 'phone') => {
    if (!product) return;

    try {
      await apiClient.post(`/api/v1/marketplace/partner-products/${id}/track-lead`, { contact_method: method });
      
      if (method === 'website' && product.supplier_website) {
        Linking.openURL(product.supplier_website);
      } else if (method === 'phone' && product.supplier_phone) {
        Linking.openURL(`tel:${product.supplier_phone}`);
      }
    } catch (error) {
      console.error('Failed to track lead:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Product not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={80} color={colors.icon} />
        </View>

        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={styles.productPrice}>${Number(product.price).toFixed(2)}</ThemedText>
        <ThemedText style={[styles.category, { color: colors.icon }]}>{product.category}</ThemedText>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={[styles.description, { color: colors.icon }]}>{product.description}</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Supplier</ThemedText>
          <ThemedText style={styles.supplierName}>{product.supplier_name}</ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          {product.supplier_website && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleContact('website')}
            >
              <Ionicons name="globe" size={20} color="#fff" />
              <ThemedText style={styles.buttonText}>Visit Website</ThemedText>
            </TouchableOpacity>
          )}
          {product.supplier_phone && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2196F3' }]}
              onPress={() => handleContact('phone')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <ThemedText style={styles.buttonText}>Call Supplier</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
  },
  imageContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  supplierName: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
