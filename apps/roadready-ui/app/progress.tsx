import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { getTestResults } from '@/utils/storage';
import { TestResult, QuestionCategory } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<QuestionCategory, { total: number; passed: number; avgScore: number }>>({} as any);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const results = await getTestResults();
      setTestResults(results);
      
      // Calculate category-wise stats
      const stats: Record<string, { total: number; passed: number; scores: number[] }> = {};
      
      results.forEach(result => {
        if (!stats[result.category]) {
          stats[result.category] = { total: 0, passed: 0, scores: [] };
        }
        stats[result.category].total++;
        stats[result.category].scores.push(result.score);
        if (result.score >= 70) {
          stats[result.category].passed++;
        }
      });

      const categoryStats: Record<QuestionCategory, { total: number; passed: number; avgScore: number }> = {} as any;
      Object.entries(stats).forEach(([category, data]) => {
        categoryStats[category as QuestionCategory] = {
          total: data.total,
          passed: data.passed,
          avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length) : 0
        };
      });

      setCategoryStats(categoryStats);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '#34C759';
    if (score >= 70) return '#FF9500';
    return '#FF3B30';
  };

  const categories = [
    { id: 'road-signs', title: 'Road Signs', icon: '🚦' },
    { id: 'traffic-laws', title: 'Traffic Laws', icon: '⚖️' },
    { id: 'safe-driving', title: 'Safe Driving', icon: '🛡️' },
    { id: 'parking', title: 'Parking Rules', icon: '🅿️' },
    { id: 'right-of-way', title: 'Right of Way', icon: '🔄' },
    { id: 'emergency', title: 'Emergency', icon: '🚨' },
  ];

  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Progress" />
      <ThemedView style={styles.content}>


      {/* Overall Progress */}
      <ThemedView style={styles.overallCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Overall Progress</ThemedText>
        <ThemedView style={styles.progressStats}>
          <ThemedView style={styles.progressItem}>
            <ThemedText style={styles.progressNumber}>{testResults.length}</ThemedText>
            <ThemedText style={styles.progressLabel}>Total Tests</ThemedText>
          </ThemedView>
          <ThemedView style={styles.progressItem}>
            <ThemedText style={styles.progressNumber}>
              {testResults.length > 0 ? Math.round(testResults.filter(r => r.score >= 70).length / testResults.length * 100) : 0}%
            </ThemedText>
            <ThemedText style={styles.progressLabel}>Pass Rate</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Category Progress */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Category Progress</ThemedText>
        {categories.map(category => {
          const stats = categoryStats[category.id as QuestionCategory];
          const avgScore = stats?.avgScore || 0;
          const progressWidth = (avgScore / 100) * (width - 80);
          
          return (
            <ThemedView key={category.id} style={[styles.categoryCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
              <ThemedView style={styles.categoryHeader}>
                <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                <ThemedView style={styles.categoryInfo}>
                  <ThemedText type="defaultSemiBold">{category.title}</ThemedText>
                  <ThemedText style={styles.categoryStats}>
                    {stats ? `${stats.total} tests • ${stats.passed} passed` : 'No tests taken'}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.categoryScore, { color: getProgressColor(avgScore) }]}>
                  {avgScore}%
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.progressBarContainer}>
                <ThemedView style={styles.progressBarBg}>
                  <ThemedView 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: progressWidth,
                        backgroundColor: getProgressColor(avgScore)
                      }
                    ]} 
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          );
        })}
      </ThemedView>

      {/* Weak Areas */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Areas to Improve</ThemedText>
        {Object.entries(categoryStats)
          .filter(([_, stats]) => stats.avgScore < 70)
          .sort(([_, a], [__, b]) => a.avgScore - b.avgScore)
          .slice(0, 3)
          .map(([categoryId, stats]) => {
            const category = categories.find(c => c.id === categoryId);
            return (
              <ThemedView key={categoryId} style={[styles.weakAreaItem, { backgroundColor: isDark ? '#374151' : '#fff3e0' }]}>
                <Ionicons name="warning" size={20} color="#FF9500" />
                <ThemedView style={styles.weakAreaInfo}>
                  <ThemedText type="defaultSemiBold">{category?.title}</ThemedText>
                  <ThemedText style={styles.weakAreaScore}>Average: {stats.avgScore}%</ThemedText>
                </ThemedView>
              </ThemedView>
            );
          })}
        
        {Object.entries(categoryStats).filter(([_, stats]) => stats.avgScore < 70).length === 0 && (
          <ThemedView style={styles.noWeakAreas}>
            <Ionicons name="checkmark-circle" size={32} color="#34C759" />
            <ThemedText style={styles.noWeakAreasText}>Great job! No weak areas found.</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },
  overallCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryStats: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  categoryScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  weakAreaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  weakAreaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  weakAreaScore: {
    fontSize: 12,
    color: '#e65100',
    marginTop: 2,
  },
  noWeakAreas: {
    alignItems: 'center',
    padding: 20,
  },
  noWeakAreasText: {
    marginTop: 8,
    color: '#34C759',
    fontWeight: '600',
  },
});