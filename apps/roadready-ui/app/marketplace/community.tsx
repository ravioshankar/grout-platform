import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import { useThemedAlert } from '@/hooks/use-themed-alert';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplace-categories';

interface Listing {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  condition: string;
  seller_name: string;
  created_at: string;
}

export default function CommunityMarketplaceScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showAlert } = useThemedAlert();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high'>('recent');

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

  const loadListings = async () => {
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const data = await apiClient.get('/api/v1/marketplace/listings', params);
      setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
      showAlert('Error', 'Failed to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const filteredListings = listings
    .filter(listing =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Community</ThemedText>
        <TouchableOpacity onPress={() => router.push('/marketplace/my-listings' as any)} style={styles.myListingsButton}>
          <Ionicons name="list" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search listings..."
          placeholderTextColor={colors.icon}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
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
              <ThemedText style={[styles.categoryText, { color: selectedCategory === cat.name ? '#fff' : colors.text }]}>
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading listings...</ThemedText>
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No listings found' : 'No listings yet'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
              {searchQuery ? 'Try a different search' : 'Be the first to post something!'}
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.statsBar}>
              <ThemedText style={[styles.statsText, { color: colors.icon }]}>
                {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
              </ThemedText>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'recent' && { backgroundColor: colors.border }]}
                  onPress={() => setSortBy('recent')}
                >
                  <Ionicons name="time" size={16} color={colors.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'price_low' && { backgroundColor: colors.border }]}
                  onPress={() => setSortBy('price_low')}
                >
                  <Ionicons name="arrow-up" size={16} color={colors.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'price_high' && { backgroundColor: colors.border }]}
                  onPress={() => setSortBy('price_high')}
                >
                  <Ionicons name="arrow-down" size={16} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.grid}>
              {filteredListings.map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={[styles.listingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => router.push(`/marketplace/community-listing/${listing.id}` as any)}
                >
                  <View style={styles.imageContainer}>
                    <Ionicons name="image-outline" size={48} color={colors.icon} />
                  </View>
                  <ThemedText style={styles.listingTitle} numberOfLines={2}>{listing.title}</ThemedText>
                  <ThemedText style={[styles.listingCategory, { color: colors.icon }]}>{listing.category}</ThemedText>
                  <ThemedText style={[styles.listingPrice, { color: colors.tint }]}>
                    {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
                  </ThemedText>
                  <ThemedText style={[styles.listingCondition, { color: colors.icon }]} numberOfLines={1}>
                    {listing.condition}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/marketplace/create-listing' as any)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  myListingsButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  imageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  listingContent: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  listingCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listingCondition: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
