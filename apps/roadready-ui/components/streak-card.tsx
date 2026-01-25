import { StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
}

export function StreakCard({ currentStreak, longestStreak, totalXP, level }: StreakCardProps) {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].cardBackground }]}>
      <ThemedView style={styles.row}>
        <ThemedView style={styles.stat}>
          <ThemedView style={[styles.iconBadge, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="flame" size={24} color="#FF9500" />
          </ThemedView>
          <ThemedText style={styles.value}>{currentStreak}</ThemedText>
          <ThemedText style={styles.label}>Day Streak</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stat}>
          <ThemedView style={[styles.iconBadge, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="trophy" size={24} color="#007AFF" />
          </ThemedView>
          <ThemedText style={styles.value}>{longestStreak}</ThemedText>
          <ThemedText style={styles.label}>Best Streak</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stat}>
          <ThemedView style={[styles.iconBadge, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="star" size={24} color="#16A34A" />
          </ThemedView>
          <ThemedText style={styles.value}>{totalXP}</ThemedText>
          <ThemedText style={styles.label}>Total XP</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stat}>
          <ThemedView style={[styles.iconBadge, { backgroundColor: '#FCE4EC' }]}>
            <ThemedText style={styles.levelText}>{level}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.value}>Level</ThemedText>
          <ThemedText style={styles.label}>{level}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  stat: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    opacity: 0.7,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
});
