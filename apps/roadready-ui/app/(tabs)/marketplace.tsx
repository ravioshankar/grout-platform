import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { RoadReadyLogo } from '@/components/logo';

export default function MarketplaceScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <RoadReadyLogo size={32} />
        <ThemedText style={styles.headerTitle}>Marketplace</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => router.push('/marketplace/partner-store' as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
            <Ionicons name="storefront" size={32} color="#fff" />
          </View>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Partner Store</ThemedText>
            <ThemedText style={[styles.cardDescription, { color: colors.icon }]}>
              Browse safety gear and accessories from trusted partners
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => router.push('/marketplace/community' as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
            <Ionicons name="people" size={32} color="#fff" />
          </View>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Community Marketplace</ThemedText>
            <ThemedText style={[styles.cardDescription, { color: colors.icon }]}>
              Buy and sell items with other learners
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
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
    gap: 12,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
});
