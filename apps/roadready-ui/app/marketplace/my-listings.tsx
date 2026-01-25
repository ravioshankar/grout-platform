import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import { useThemedAlert } from '@/hooks/use-themed-alert';

interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  condition: string;
  status: string;
  created_at: string;
}

export default function MyListingsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showAlert } = useThemedAlert();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  const loadListings = async () => {
    try {
      const data = await apiClient.get('/api/v1/marketplace/my-listings');
      console.log('My listings response:', data);
      setListings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load listings:', error);
      showAlert('Error', error.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    showAlert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/v1/marketplace/listings/${id}`);
            setListings(listings.filter(l => l.id !== id));
            showAlert('Success', 'Listing deleted');
          } catch (error) {
            showAlert('Error', 'Failed to delete listing');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active';
    
    showAlert(
      'Update Status',
      `Mark this listing as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await apiClient.put(`/api/v1/marketplace/listings/${id}`, { status: newStatus });
              setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
              showAlert('Success', `Listing marked as ${newStatus}`);
            } catch (error: any) {
              showAlert('Error', error.message || 'Failed to update listing');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Listings</ThemedText>
        <TouchableOpacity onPress={() => router.push('/marketplace/create-listing' as any)} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading your listings...</ThemedText>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>No listings yet</ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>Create your first listing to get started</ThemedText>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: '#2196F3' }]}
              onPress={() => router.push('/marketplace/create-listing' as any)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <ThemedText style={styles.createButtonText}>Create Listing</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((listing) => (
            <View
              key={listing.id}
              style={[styles.listingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            >
              <TouchableOpacity
                style={styles.listingContent}
                onPress={() => router.push(`/marketplace/community-listing/${listing.id}` as any)}
              >
                <View style={styles.imageContainer}>
                  <Ionicons name="image-outline" size={48} color={colors.icon} />
                </View>
                <View style={styles.listingInfo}>
                  <ThemedText style={styles.listingTitle} numberOfLines={1}>{listing.title}</ThemedText>
                  <ThemedText style={[styles.listingCategory, { color: colors.icon }]}>{listing.category}</ThemedText>
                  <ThemedText style={styles.listingPrice}>
                    {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
                  </ThemedText>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: listing.status === 'active' ? '#4CAF50' : '#9E9E9E' }
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {listing.status === 'active' ? 'Active' : 'Sold'}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleStatus(listing.id, listing.status)}
                >
                  <Ionicons
                    name={listing.status === 'active' ? 'checkmark-circle' : 'refresh'}
                    size={24}
                    color={colors.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(listing.id)}
                >
                  <Ionicons name="trash" size={24} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  addButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
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
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  listingContent: {
    flex: 1,
    flexDirection: 'row',
  },
  imageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listingCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
