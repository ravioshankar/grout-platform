import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DMVLogo } from '@/components/dmv-logo';
import { TestResult } from '@/constants/types';
import { getTestResults } from '@/utils/storage';

export default function ReportScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    loadTestResult();
  }, [testId]);

  const loadTestResult = async () => {
    const results = await getTestResults();
    const result = results.find(r => r.id === testId);
    setTestResult(result || null);
  };

  if (!testResult) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Test result not found</ThemedText>
      </ThemedView>
    );
  }

  const passed = testResult.score >= 70;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <DMVLogo size={40} />
        <ThemedText type="title">Test Report</ThemedText>
      </ThemedView>

      <ThemedView style={styles.scoreCard}>
        <ThemedText type="subtitle">Overall Score</ThemedText>
        <ThemedText style={[styles.score, { color: passed ? 'green' : 'red' }]}>
          {testResult.score}%
        </ThemedText>
        <ThemedText style={[styles.status, { color: passed ? 'green' : 'red' }]}>
          {passed ? 'PASSED' : 'FAILED'}
        </ThemedText>
        <ThemedText>
          {testResult.correctAnswers}/{testResult.totalQuestions} correct
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.details}>
        <ThemedText type="subtitle">Test Details</ThemedText>
        <ThemedText>State: {testResult.stateCode}</ThemedText>
        <ThemedText>Category: {testResult.category}</ThemedText>
        <ThemedText>Type: {testResult.testType}</ThemedText>
        <ThemedText>Time Spent: {Math.floor(testResult.timeSpent / 60)}m {testResult.timeSpent % 60}s</ThemedText>
        <ThemedText>Date: {new Date(testResult.completedAt).toLocaleDateString()}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.questions}>
        <ThemedText type="subtitle">Question Review</ThemedText>
        {testResult.questions.map((question, index) => (
          <ThemedView key={index} style={styles.questionItem}>
            <ThemedText style={styles.questionNumber}>Q{index + 1}</ThemedText>
            <ThemedText style={styles.questionText}>{question.question}</ThemedText>
            
            <ThemedView style={styles.answers}>
              <ThemedText style={[
                styles.answer,
                testResult.isCorrect[index] ? styles.correctAnswer : styles.incorrectAnswer
              ]}>
                Your Answer: {question.options[testResult.userAnswers[index] || 0]}
              </ThemedText>
              
              {!testResult.isCorrect[index] && (
                <ThemedText style={styles.correctAnswer}>
                  Correct Answer: {question.options[question.correctAnswer]}
                </ThemedText>
              )}
              
              {question.explanation && (
                <ThemedText style={styles.explanation}>
                  {question.explanation}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  questions: {
    marginBottom: 20,
  },
  questionItem: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  answers: {
    gap: 8,
  },
  answer: {
    fontSize: 14,
    padding: 8,
    borderRadius: 4,
  },
  correctAnswer: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  incorrectAnswer: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  explanation: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
});