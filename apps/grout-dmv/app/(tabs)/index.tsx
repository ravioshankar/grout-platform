import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { StudyReminder } from '@/components/study-reminder';
import { DailyGoal } from '@/components/daily-goal';
import { getTestResults } from '@/utils/storage';
import { TestResult } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { initDatabase, runMigrations } from '@/utils/database';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [stats, setStats] = useState({ totalTests: 0, averageScore: 0, bestScore: 0, passRate: 0 });
  const [recentTest, setRecentTest] = useState<TestResult | null>(null);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      // Run migrations to ensure all tables exist
      await runMigrations();
      loadDashboardData();
    };
    init();
  }, []);

  const loadDashboardData = async () => {
    try {
      const results = await getTestResults();
      if (results.length > 0) {
        const totalTests = results.length;
        const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests);
        const bestScore = Math.max(...results.map(r => r.score));
        const passRate = Math.round(results.filter(r => r.score >= 70).length / totalTests * 100);
        const recent = results[results.length - 1];
        
        setStats({ totalTests, averageScore, bestScore, passRate });
        setRecentTest(recent);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    { id: 'practice', title: 'Quick Practice', icon: 'book', color: '#F59E0B', route: '/categories' },
    { id: 'test', title: 'Full Test', icon: 'document-text', color: '#16A34A', route: '/setup' },
    { id: 'progress', title: 'My Progress', icon: 'analytics', color: '#F59E0B', route: '/progress' },
    { id: 'bookmarks', title: 'Bookmarks', icon: 'bookmark', color: '#DC2626', route: '/bookmarks' }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]} showsVerticalScrollIndicator={false}>
      <AppHeader title="Home" />

      {/* Study Reminder */}
      <StudyReminder onStartStudy={() => router.push('/study-plan')} />

      {/* Daily Goal */}
      <DailyGoal onGoalComplete={() => console.log('Daily goal completed!')} />

      {/* Stats Overview */}
      {stats.totalTests > 0 && (
        <ThemedView style={[styles.statsSection, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Progress</ThemedText>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <ThemedText style={styles.statNumber}>{stats.bestScore}%</ThemedText>
              <ThemedText style={styles.statLabel}>Best Score</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
              <Ionicons name="trending-up" size={24} color="#16A34A" />
              <ThemedText style={styles.statNumber}>{stats.passRate}%</ThemedText>
              <ThemedText style={styles.statLabel}>Pass Rate</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
              <Ionicons name="document-text" size={24} color="#DC2626" />
              <ThemedText style={styles.statNumber}>{stats.totalTests}</ThemedText>
              <ThemedText style={styles.statLabel}>Tests Taken</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {/* Quick Actions */}
      <ThemedView style={[styles.actionsSection, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderLeftColor: action.color, backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
              <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Recent Activity */}
      {recentTest && (
        <ThemedView style={[styles.recentSection, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
          <ThemedView style={[styles.recentCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
            <ThemedView style={styles.recentHeader}>
              <ThemedView>
                <ThemedText type="defaultSemiBold">{recentTest.testType === 'full-test' ? 'Full Test' : 'Practice'}</ThemedText>
                <ThemedText style={styles.recentDate}>{new Date(recentTest.completedAt).toLocaleDateString()}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.scoreContainer}>
                <ThemedText style={[styles.recentScore, { color: recentTest.score >= 70 ? '#16A34A' : '#DC2626' }]}>
                  {recentTest.score}%
                </ThemedText>
                <Ionicons 
                  name={recentTest.score >= 70 ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={recentTest.score >= 70 ? '#16A34A' : '#DC2626'} 
                />
              </ThemedView>
            </ThemedView>
            <TouchableOpacity
              style={styles.viewReportButton}
              onPress={() => router.push(`/report/${recentTest.id}`)}
              activeOpacity={0.7}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <ThemedText type="link" style={styles.viewReportText}>View Report</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={Colors[currentScheme].link} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}

      {/* Getting Started */}
      {stats.totalTests === 0 && (
        <ThemedView style={[styles.gettingStartedSection, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Getting Started</ThemedText>
          <ThemedView style={[styles.stepCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
            <ThemedView style={[styles.stepNumber, { backgroundColor: '#16A34A' }]}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Take a Practice Test</ThemedText>
              <ThemedText style={styles.stepDescription}>Start with category practice to learn the basics</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[styles.stepCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
            <ThemedView style={[styles.stepNumber, { backgroundColor: '#F59E0B' }]}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Review Your Progress</ThemedText>
              <ThemedText style={styles.stepDescription}>Track weak areas and improve systematically</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[styles.stepCard, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}>
            <ThemedView style={[styles.stepNumber, { backgroundColor: '#DC2626' }]}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Take Full Tests</ThemedText>
              <ThemedText style={styles.stepDescription}>Simulate real DMV test conditions</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => router.push(stats.totalTests === 0 ? '/setup' : '/categories')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ThemedText style={styles.ctaButtonText}>
          {stats.totalTests === 0 ? 'Start Your First Test' : 'Continue Practicing'}
        </ThemedText>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  statsSection: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    minHeight: 100,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  recentCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewReportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gettingStartedSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: '#16A34A',
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: 40,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
