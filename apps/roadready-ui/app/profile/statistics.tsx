import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { apiClient } from '@/utils/api-client';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function StatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsData, weakData] = await Promise.all([
        apiClient.get('/api/v1/statistics/'),
        apiClient.get('/api/v1/statistics/weak-areas?threshold=70')
      ]);
      setStats(statsData);
      setWeakAreas(weakData.weak_areas || []);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  if (!stats || stats.total_tests === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.center}>
          <Ionicons name="analytics-outline" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>No test data yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Take some tests to see your statistics</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: Colors[currentScheme].border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[currentScheme].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Statistics</ThemedText>
        <ThemedView style={styles.headerSpacer} />
      </ThemedView>
      
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />}
      >
        <ThemedView style={styles.content} backgroundColor="transparent">
        
        {/* Overview Stats */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Overview</ThemedText>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
              <ThemedText style={styles.statValue}>{stats.total_tests}</ThemedText>
              <ThemedText style={styles.statLabel}>Tests Taken</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color="#16A34A" />
              <ThemedText style={styles.statValue}>{stats.pass_rate}%</ThemedText>
              <ThemedText style={styles.statLabel}>Pass Rate</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#F59E0B" />
              <ThemedText style={styles.statValue}>{stats.current_streak}</ThemedText>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Active Profile */}
        {stats.active_profile && (
          <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedText type="subtitle">Active Profile</ThemedText>
            <ThemedView style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{stats.active_profile.profile_name}</ThemedText>
              <ThemedText style={styles.profileDetail}>{stats.active_profile.state} • {stats.active_profile.test_type}</ThemedText>
              <ThemedView style={styles.profileStats}>
                <ThemedView style={styles.profileStatItem}>
                  <ThemedText style={styles.profileStatValue}>{stats.active_profile.total_tests}</ThemedText>
                  <ThemedText style={styles.profileStatLabel}>Tests</ThemedText>
                </ThemedView>
                <ThemedView style={styles.profileStatItem}>
                  <ThemedText style={styles.profileStatValue}>{stats.active_profile.average_score}%</ThemedText>
                  <ThemedText style={styles.profileStatLabel}>Avg Score</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Activity Stats */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Activity</ThemedText>
          <ThemedView style={styles.activityGrid}>
            <ThemedView style={styles.activityItem}>
              <Ionicons name="calendar" size={24} color="#8B5CF6" />
              <ThemedText style={styles.activityValue}>{stats.tests_this_week}</ThemedText>
              <ThemedText style={styles.activityLabel}>This Week</ThemedText>
            </ThemedView>
            <ThemedView style={styles.activityItem}>
              <Ionicons name="calendar-outline" size={24} color="#EC4899" />
              <ThemedText style={styles.activityValue}>{stats.tests_this_month}</ThemedText>
              <ThemedText style={styles.activityLabel}>This Month</ThemedText>
            </ThemedView>
            <ThemedView style={styles.activityItem}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <ThemedText style={styles.activityValue}>{stats.longest_streak}</ThemedText>
              <ThemedText style={styles.activityLabel}>Best Streak</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Score Stats */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Scores</ThemedText>
          <ThemedView style={styles.scoreRow}>
            <ThemedView style={styles.scoreItem}>
              <ThemedText style={styles.scoreLabel}>Average</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: '#007AFF' }]}>{stats.average_score}%</ThemedText>
            </ThemedView>
            <ThemedView style={styles.scoreItem}>
              <ThemedText style={styles.scoreLabel}>Best</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: '#16A34A' }]}>{stats.best_score}%</ThemedText>
            </ThemedView>
            <ThemedView style={styles.scoreItem}>
              <ThemedText style={styles.scoreLabel}>Worst</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: '#DC2626' }]}>{stats.worst_score}%</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Trend */}
        {stats.recent_trend && (
          <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedText type="subtitle">Recent Trend</ThemedText>
            <ThemedView style={styles.trendContainer}>
              <Ionicons 
                name={stats.recent_trend === 'improving' ? 'trending-up' : stats.recent_trend === 'declining' ? 'trending-down' : 'remove'} 
                size={32} 
                color={stats.recent_trend === 'improving' ? '#16A34A' : stats.recent_trend === 'declining' ? '#DC2626' : '#F59E0B'} 
              />
              <ThemedText style={styles.trendText}>
                {stats.recent_trend === 'improving' ? 'You\'re improving!' : stats.recent_trend === 'declining' ? 'Keep practicing' : 'Stable performance'}
              </ThemedText>
              {stats.improvement_rate !== null && (
                <ThemedText style={styles.trendValue}>{stats.improvement_rate > 0 ? '+' : ''}{stats.improvement_rate}%</ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        )}

        {/* Category Performance */}
        {stats.category_performance && stats.category_performance.length > 0 && (
          <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedText type="subtitle">Category Performance</ThemedText>
            {stats.category_performance.map((cat: any) => (
              <ThemedView key={cat.category} style={styles.categoryItem}>
                <ThemedView style={styles.categoryHeader}>
                  <ThemedText style={styles.categoryName}>{cat.category}</ThemedText>
                  <ThemedText style={[styles.categoryScore, { color: cat.average_score >= 70 ? '#16A34A' : '#DC2626' }]}>
                    {cat.average_score}%
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.progressBar}>
                  <ThemedView style={[styles.progressFill, { width: `${cat.average_score}%`, backgroundColor: cat.average_score >= 70 ? '#16A34A' : '#DC2626' }]} />
                </ThemedView>
                <ThemedText style={styles.categoryAttempts}>{cat.total_attempts} attempts</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedText type="subtitle">Areas to Improve</ThemedText>
            {weakAreas.map((area: any) => (
              <ThemedView key={area.category} style={styles.weakItem}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                <ThemedView style={styles.weakContent}>
                  <ThemedText style={styles.weakCategory}>{area.category}</ThemedText>
                  <ThemedText style={styles.weakScore}>{area.average_score}% average</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Time Stats */}
        {stats.total_time_spent && (
          <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedText type="subtitle">Study Time</ThemedText>
            <ThemedView style={styles.timeGrid}>
              <ThemedView style={styles.timeItem}>
                <Ionicons name="time" size={24} color="#007AFF" />
                <ThemedText style={styles.timeValue}>{Math.round(stats.total_time_spent / 60)}</ThemedText>
                <ThemedText style={styles.timeLabel}>Total (min)</ThemedText>
              </ThemedView>
              <ThemedView style={styles.timeItem}>
                <Ionicons name="timer" size={24} color="#8B5CF6" />
                <ThemedText style={styles.timeValue}>{Math.round(stats.average_time_per_test / 60)}</ThemedText>
                <ThemedText style={styles.timeLabel}>Avg (min)</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Achievements */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Achievements</ThemedText>
          <ThemedView style={styles.achievementsGrid}>
            <ThemedView style={[styles.achievement, stats.total_tests >= 10 && styles.achievementUnlocked]}>
              <Ionicons name="trophy" size={32} color={stats.total_tests >= 10 ? '#FFD700' : '#999'} />
              <ThemedText style={styles.achievementText}>10 Tests</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.achievement, stats.best_score >= 90 && styles.achievementUnlocked]}>
              <Ionicons name="star" size={32} color={stats.best_score >= 90 ? '#FFD700' : '#999'} />
              <ThemedText style={styles.achievementText}>90% Score</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.achievement, stats.pass_rate >= 80 && styles.achievementUnlocked]}>
              <Ionicons name="ribbon" size={32} color={stats.pass_rate >= 80 ? '#FFD700' : '#999'} />
              <ThemedText style={styles.achievementText}>80% Pass</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.achievement, stats.total_tests >= 50 && styles.achievementUnlocked]}>
              <Ionicons name="medal" size={32} color={stats.total_tests >= 50 ? '#FFD700' : '#999'} />
              <ThemedText style={styles.achievementText}>50 Tests</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 32 },
  headerTitle: { fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 32, backgroundColor: 'transparent' },
  scrollContent: { flex: 1 },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: 'transparent' },
  card: { padding: 20, borderRadius: 16, gap: 16 },
  statsGrid: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  statItem: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, opacity: 0.7 },
  profileInfo: { gap: 8, backgroundColor: 'transparent' },
  profileName: { fontSize: 18, fontWeight: '600' },
  profileDetail: { fontSize: 14, opacity: 0.7 },
  profileStats: { flexDirection: 'row', gap: 24, marginTop: 8, backgroundColor: 'transparent' },
  profileStatItem: { alignItems: 'center', backgroundColor: 'transparent' },
  profileStatValue: { fontSize: 20, fontWeight: 'bold', color: '#16A34A' },
  profileStatLabel: { fontSize: 12, opacity: 0.7 },
  activityGrid: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  activityItem: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  activityValue: { fontSize: 22, fontWeight: 'bold' },
  activityLabel: { fontSize: 11, opacity: 0.7, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'transparent' },
  scoreItem: { alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  scoreLabel: { fontSize: 14, opacity: 0.7 },
  scoreValue: { fontSize: 28, fontWeight: 'bold' },
  trendContainer: { alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  trendText: { fontSize: 16, fontWeight: '600' },
  trendValue: { fontSize: 14, opacity: 0.7 },
  categoryItem: { gap: 8, backgroundColor: 'transparent' },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  categoryName: { fontSize: 16, fontWeight: '600' },
  categoryScore: { fontSize: 18, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  categoryAttempts: { fontSize: 12, opacity: 0.6 },
  weakItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8 },
  weakContent: { flex: 1, backgroundColor: 'transparent' },
  weakCategory: { fontSize: 16, fontWeight: '600', color: '#92400E' },
  weakScore: { fontSize: 14, opacity: 0.7, color: '#92400E' },
  timeGrid: { flexDirection: 'row', gap: 16, backgroundColor: 'transparent' },
  timeItem: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  timeContainer: { alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  timeValue: { fontSize: 28, fontWeight: 'bold' },
  timeLabel: { fontSize: 12, opacity: 0.7 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, backgroundColor: 'transparent' },
  achievement: { flex: 1, minWidth: '45%', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, backgroundColor: '#F3F4F6', opacity: 0.5 },
  achievementUnlocked: { opacity: 1, backgroundColor: '#FEF3C7' },
  achievementText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', opacity: 0.7 },
  emptySubtext: { fontSize: 14, opacity: 0.6, textAlign: 'center' },
});
