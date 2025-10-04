import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { QuestionCategory } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface CategoryItem {
  id: QuestionCategory;
  title: string;
  description: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'road-signs',
    title: 'Road Signs',
    description: 'Traffic signs, signals, and road markings',
    icon: '🚦',
  },
  {
    id: 'traffic-laws',
    title: 'Traffic Laws',
    description: 'Speed limits, right of way, and regulations',
    icon: '⚖️',
  },
  {
    id: 'safe-driving',
    title: 'Safe Driving',
    description: 'Defensive driving and safety practices',
    icon: '🛡️',
  },
  {
    id: 'parking',
    title: 'Parking Rules',
    description: 'Parking regulations and restrictions',
    icon: '🅿️',
  },
  {
    id: 'right-of-way',
    title: 'Right of Way',
    description: 'Intersection rules and priority',
    icon: '🔄',
  },
  {
    id: 'emergency',
    title: 'Emergency Situations',
    description: 'Handling emergencies and breakdowns',
    icon: '🚨',
  },
];

export default function CategoriesScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  
  const handleCategorySelect = (category: QuestionCategory) => {
    router.push(`/practice/${category}`);
  };

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.7}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      <ThemedView style={[styles.categoryContent, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: isDark ? '#374151' : '#e9ecef' }]}>
        <ThemedText style={styles.icon}>{item.icon}</ThemedText>
        <ThemedView style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.description, { opacity: 0.7 }]}>
            {item.description}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Practice by Category" />
      <ThemedView style={styles.content}>
        <TouchableOpacity
          style={styles.fullTestButton}
          onPress={() => router.push('/setup')}
          activeOpacity={0.7}
        >
          <ThemedView style={styles.fullTestContent}>
            <ThemedText style={styles.fullTestIcon}>📝</ThemedText>
            <ThemedView style={styles.textContainer}>
              <ThemedText type="defaultSemiBold" style={styles.fullTestTitle}>
                Full DMV Test
              </ThemedText>
              <ThemedText style={styles.fullTestDescription}>
                Complete practice test with timer
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
        
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
  },
  categoryItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  fullTestButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#15803D',
  },
  fullTestContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullTestIcon: {
    fontSize: 36,
    marginRight: 20,
  },
  fullTestTitle: {
    fontSize: 20,
    marginBottom: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fullTestDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});