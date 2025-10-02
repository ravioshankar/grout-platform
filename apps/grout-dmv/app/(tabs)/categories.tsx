import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuestionCategory } from '@/constants/types';
import { DMVLogo } from '@/components/dmv-logo';

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
  const handleCategorySelect = (category: QuestionCategory) => {
    router.push(`/practice/${category}`);
  };

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item.id)}
    >
      <ThemedView style={styles.categoryContent}>
        <ThemedText style={styles.icon}>{item.icon}</ThemedText>
        <ThemedView style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {item.description}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.logoContainer}>
        <DMVLogo size={40} />
      </ThemedView>
      <ThemedText type="title" style={styles.header}>
        Practice by Category
      </ThemedText>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    color: '#666',
  },
});