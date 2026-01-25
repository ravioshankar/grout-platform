import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/utils/api-client';

export default function AchievementsScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_earned: 0, total_available: 0 });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await apiClient.get<any>('/api/v1/gamification/achievements');
      setAchievements(data.achievements);
      setStats({ total_earned: data.total_earned, total_available: data.total_available });
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Achievements" showBack onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        <ThemedView style={[styles.header, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="title">🏆 Achievements</ThemedText>
          <ThemedText style={styles.progress}>
            {stats.total_earned} / {stats.total_available} Unlocked
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.grid}>
          {achievements.map((achievement) => (
            <ThemedView
              key={achievement.type}
              style={[
                styles.achievementCard,
                { 
                  backgroundColor: Colors[currentScheme].cardBackground,
                  borderColor: achievement.earned ? '#16A34A' : Colors[currentScheme].border,
                  opacity: achievement.earned ? 1 : 0.5
                }
              ]}
            >
              <ThemedText style={styles.icon}>{achievement.icon}</ThemedText>
              <ThemedText style={styles.name}>{achievement.name}</ThemedText>
              <ThemedText style={styles.xp}>+{achievement.xp} XP</ThemedText>
              {achievement.earned && (
                <ThemedView style={styles.earnedBadge}>
                  <ThemedText style={styles.earnedText}>✓ Earned</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  header: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  progress: {
    fontSize: 16,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  achievementCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 40,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  xp: {
    fontSize: 12,
    opacity: 0.7,
  },
  earnedBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  earnedText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
