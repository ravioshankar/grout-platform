import { View, ScrollView, TouchableOpacity, StyleSheet, Share, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import { useThemedAlert } from '@/hooks/use-themed-alert';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location_city: string;
  location_state: string;
  seller_name: string;
  seller_contact: string;
  created_at: string;
}

export default function CommunityListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showAlert } = useThemedAlert();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await apiClient.get(`/api/v1/marketplace/listings/${id}`);
      setListing(data);
    } catch (error) {
      showAlert('Error', 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!listing) return;
    
    try {
      const response = await apiClient.post(`/api/v1/marketplace/listings/${id}/inquire`, {
        message: 'I am interested in this item',
      });
      showAlert(
        'Inquiry Sent', 
        `The seller will be notified. You can reach them at:\n\n${response.seller_contact}`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to send inquiry');
    }
  };

  const handleShare = async () => {
    if (!listing) return;
    
    try {
      const location = [listing.location_city, listing.location_state].filter(Boolean).join(', ');
      await Share.share({
        message: `${listing.title}\n\nPrice: ${listing.price === 0 ? 'Free' : `$${listing.price}`}\nCondition: ${listing.condition}\nLocation: ${location}\n\n${listing.description}\n\nContact: ${listing.seller_contact}`,
        title: listing.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleEmail = () => {
    if (!listing?.seller_contact) return;
    Linking.openURL(`mailto:${listing.seller_contact}?subject=Interested in: ${listing.title}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!listing) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Listing not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Listing Details</ThemedText>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={80} color={colors.icon} />
        </View>

        <ThemedText style={styles.listingTitle}>{listing.title}</ThemedText>
        <ThemedText style={[styles.listingPrice, { color: colors.tint }]}>
          {listing.price === 0 ? 'Free' : `$${Number(listing.price).toFixed(2)}`}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="pricetag" size={16} color={colors.icon} />
            <ThemedText style={[styles.metaText, { color: colors.icon }]}>{listing.category}</ThemedText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.icon} />
            <ThemedText style={[styles.metaText, { color: colors.icon }]}>{listing.condition}</ThemedText>
          </View>
          {(listing.location_city || listing.location_state) && (
            <View style={[styles.metaChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Ionicons name="location" size={16} color={colors.icon} />
              <ThemedText style={[styles.metaText, { color: colors.icon }]}>
                {[listing.location_city, listing.location_state].filter(Boolean).join(', ')}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={[styles.description, { color: colors.icon }]}>{listing.description}</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Seller</ThemedText>
          <View style={styles.sellerRow}>
            <View style={[styles.sellerAvatar, { backgroundColor: colors.tint + '20' }]}>
              <Ionicons name="person" size={24} color={colors.tint} />
            </View>
            <View style={styles.sellerInfo}>
              <ThemedText style={styles.sellerName}>{listing.seller_name}</ThemedText>
              <ThemedText style={[styles.postedDate, { color: colors.icon }]}>
                Posted {new Date(listing.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handleContact}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Contact</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleEmail}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Email</ThemedText>
          </TouchableOpacity>
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
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 4,
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
  listingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
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
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  postedDate: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
