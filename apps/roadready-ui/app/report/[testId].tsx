import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { TestResult } from '@/constants/types';
import { getTestResults } from '@/utils/storage';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function ReportScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestResult();
  }, [testId]);

  const loadTestResult = async () => {
    try {
      const results = await getTestResults();
      const result = results.find(r => r.id === testId);
      setTestResult(result || null);
    } catch (error) {
      console.error('Failed to load test result:', error);
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  if (!testResult) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="Test Report" showLogo={false} />
        <ThemedView style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>Test result not found</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const passed = testResult.score >= 70;

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Test Report" showLogo={false} />
      <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.content}>

        {/* Score Card */}
        <ThemedView style={[styles.scoreCard, { backgroundColor: passed ? '#16A34A' : '#DC2626' }]}>
          <Ionicons name={passed ? 'checkmark-circle' : 'close-circle'} size={64} color="#FFF" />
          <ThemedText style={styles.scoreText}>{testResult.score}%</ThemedText>
          <ThemedText style={styles.statusText}>{passed ? 'PASSED' : 'FAILED'}</ThemedText>
          <ThemedText style={styles.scoreSubtext}>
            {testResult.correctAnswers} of {testResult.totalQuestions} correct
          </ThemedText>
        </ThemedView>

        {/* Stats Grid */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
              <ThemedText style={styles.statValue}>{testResult.correctAnswers}</ThemedText>
              <ThemedText style={styles.statLabel}>Correct</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
              <ThemedText style={styles.statValue}>{testResult.totalQuestions - testResult.correctAnswers}</ThemedText>
              <ThemedText style={styles.statLabel}>Incorrect</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <ThemedText style={styles.statValue}>{Math.floor(testResult.timeSpent / 60)}m</ThemedText>
              <ThemedText style={styles.statLabel}>Time Spent</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Test Details */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Test Details</ThemedText>
          <ThemedView style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <ThemedText style={styles.detailLabel}>State:</ThemedText>
            <ThemedText style={styles.detailValue}>{testResult.stateCode}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.detailRow}>
            <Ionicons name="folder" size={20} color="#F59E0B" />
            <ThemedText style={styles.detailLabel}>Category:</ThemedText>
            <ThemedText style={styles.detailValue}>{testResult.category}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.detailRow}>
            <Ionicons name="document-text" size={20} color="#8B5CF6" />
            <ThemedText style={styles.detailLabel}>Type:</ThemedText>
            <ThemedText style={styles.detailValue}>{testResult.testType}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#10B981" />
            <ThemedText style={styles.detailLabel}>Date:</ThemedText>
            <ThemedText style={styles.detailValue}>{new Date(testResult.completedAt).toLocaleDateString()}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Question Review */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedText type="subtitle">Question Review</ThemedText>
        </ThemedView>

        {testResult.questions.map((question, index) => (
          <ThemedView key={index} style={[styles.questionCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
            <ThemedView style={styles.questionHeader}>
              <ThemedView style={styles.questionNumberBadge}>
                <ThemedText style={styles.questionNumberText}>Q{index + 1}</ThemedText>
              </ThemedView>
              <Ionicons 
                name={testResult.isCorrect[index] ? 'checkmark-circle' : 'close-circle'} 
                size={28} 
                color={testResult.isCorrect[index] ? '#16A34A' : '#DC2626'} 
              />
            </ThemedView>
            
            <ThemedText style={styles.questionText}>{question.question}</ThemedText>
            
            <ThemedView style={styles.answerSection}>
              <ThemedView style={[
                styles.answerBox,
                { backgroundColor: testResult.isCorrect[index] ? '#DCFCE7' : '#FEE2E2' }
              ]}>
                <ThemedText style={[
                  styles.answerLabel,
                  { color: testResult.isCorrect[index] ? '#166534' : '#991B1B' }
                ]}>Your Answer:</ThemedText>
                <ThemedText style={[
                  styles.answerText,
                  { color: testResult.isCorrect[index] ? '#166534' : '#991B1B' }
                ]}>{question.options[testResult.userAnswers[index] || 0]}</ThemedText>
              </ThemedView>
              
              {!testResult.isCorrect[index] && (
                <ThemedView style={[styles.answerBox, { backgroundColor: '#DCFCE7' }]}>
                  <ThemedText style={[styles.answerLabel, { color: '#166534' }]}>Correct Answer:</ThemedText>
                  <ThemedText style={[styles.answerText, { color: '#166534' }]}>
                    {question.options[question.correctAnswer]}
                  </ThemedText>
                </ThemedView>
              )}
              
              {question.explanation && (
                <ThemedView style={[styles.explanationBox, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                  <Ionicons name="information-circle" size={16} color="#007AFF" />
                  <ThemedText style={styles.explanationText}>{question.explanation}</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 16, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: 'transparent' },
  card: { padding: 20, borderRadius: 12, gap: 16 },
  scoreCard: { alignItems: 'center', padding: 32, borderRadius: 16, gap: 8 },
  scoreText: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 56 },
  statusText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 2 },
  scoreSubtext: { fontSize: 15, color: '#FFFFFF', opacity: 0.95 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'transparent' },
  statItem: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, opacity: 0.7 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, backgroundColor: 'transparent' },
  detailLabel: { fontSize: 14, opacity: 0.7, flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600', flex: 2 },
  questionCard: { padding: 16, borderRadius: 12, gap: 12, marginBottom: 8 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  questionNumberBadge: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  questionNumberText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  questionText: { fontSize: 15, lineHeight: 22, marginVertical: 4 },
  answerSection: { gap: 12, backgroundColor: 'transparent' },
  answerBox: { padding: 12, borderRadius: 8, gap: 4 },
  answerLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  answerText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  explanationBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 8, alignItems: 'flex-start' },
  explanationText: { flex: 1, fontSize: 13, lineHeight: 19, opacity: 0.8 },
  emptyText: { fontSize: 18, fontWeight: '600', opacity: 0.7 },
});