import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedAlert } from '@/components/themed-alert';
import { AppHeader } from '@/components/app-header';
import { getDailyChallengeQuestions } from '@/constants/questions';
import { Question, QuestionCategory, TestResult } from '@/constants/types';
import { saveTestResult } from '@/utils/storage';
import { updateStudyProgress, updateStudyStreak } from '@/utils/study-progress';
import { updateDailyGoalProgress } from '@/components/daily-goal';
import { getUserProfile } from '@/utils/database';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useThemedAlert } from '@/hooks/use-themed-alert';

export default function DailyChallengeScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const { alertConfig, showAlert, hideAlert } = useThemedAlert();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();
        const state = profile?.selectedState || 'CA';
        const qs = getDailyChallengeQuestions(state, 5);
        setQuestions(qs);
        setUserAnswers(new Array(qs.length).fill(null));
        setIsCorrect(new Array(qs.length).fill(false));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (questions.length === 0 || answeredQuestions.has(currentQuestion)) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    if (correct) setScore((s) => s + 1);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);

    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentQuestion] = correct;
    setIsCorrect(newIsCorrect);

    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion));

    if (!correct) {
      import('@/utils/database')
        .then(({ recordWrongAnswer }) => recordWrongAnswer(questions[currentQuestion]))
        .catch(() => {});
    }
  };

  const handleNextQuestion = async () => {
    if (questions.length === 0) return;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      return;
    }

    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const computedCorrect = questions.map((q, i) => {
      const ua = userAnswers[i];
      return ua !== null && ua !== undefined && ua === q.correctAnswer;
    });
    const finalCorrect = computedCorrect.filter(Boolean).length;
    const primaryCategory = (questions[0]?.category || 'road-signs') as QuestionCategory;

    const testResult: TestResult = {
      id: `daily_${new Date().toISOString().slice(0, 10)}_${Date.now()}`,
      stateCode: questions[0]?.stateCode || 'CA',
      score: Math.round((finalCorrect / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers: finalCorrect,
      category: primaryCategory,
      completedAt: new Date(),
      timeSpent,
      questions,
      userAnswers,
      isCorrect: computedCorrect,
      testType: 'practice',
    };

    try {
      await saveTestResult(testResult);
      await updateStudyProgress(questions[0]?.category || 'road-signs', questions.length);
      await updateStudyStreak();
      await updateDailyGoalProgress(questions.length);

      const { apiClient } = await import('@/utils/api-client');
      await apiClient.post('/api/v1/test-records/', {
        state_code: testResult.stateCode,
        test_type: 'practice',
        category: questions[0]?.category || 'road-signs',
        score: testResult.score,
        total_questions: testResult.totalQuestions,
        correct_answers: testResult.correctAnswers,
        time_spent: testResult.timeSpent,
        questions: JSON.stringify(testResult.questions),
        user_answers: JSON.stringify(testResult.userAnswers),
        is_correct: JSON.stringify(testResult.isCorrect),
      });
    } catch (e) {
      console.error('Daily challenge save:', e);
    }

    showAlert('Daily challenge complete!', `You scored ${finalCorrect}/${questions.length}.`, [
      { text: 'Home', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <ThemedText style={{ marginTop: 12 }}>{`Today's questions…`}</ThemedText>
      </ThemedView>
    );
  }

  if (questions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="Daily challenge" showLogo={false} />
        <ThemedView style={{ padding: 24 }}>
          <ThemedText>No questions for your state yet. Pick a state in onboarding.</ThemedText>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Go back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = answeredQuestions.has(currentQuestion);

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Daily challenge" showLogo={false} />
      <ThemedView style={[styles.header, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="subtitle">{new Date().toLocaleDateString()}</ThemedText>
        <ThemedText>Question {currentQuestion + 1} of {questions.length}</ThemedText>
        <ThemedText>Score: {score}/{answeredQuestions.size}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.questionContainer, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="defaultSemiBold" style={styles.question}>
          {question.question}
        </ThemedText>

        {question.options.map((option, index) => {
          let optionStyle = [styles.option, { backgroundColor: Colors[currentScheme].cardBackground }];
          if (isAnswered) {
            if (index === question.correctAnswer) optionStyle.push(styles.correctOption);
            else if (index === selectedAnswer && index !== question.correctAnswer) {
              optionStyle.push(styles.incorrectOption);
            }
          } else if (selectedAnswer === index) {
            optionStyle.push(styles.selectedOption);
          }
          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.optionText}>{option}</ThemedText>
            </TouchableOpacity>
          );
        })}

        {showExplanation && question.explanation && (
          <ThemedView style={[styles.explanationContainer, { backgroundColor: isDark ? '#374151' : '#FFFBEB' }]}>
            <ThemedText type="defaultSemiBold" style={styles.explanationTitle}>
              Explanation
            </ThemedText>
            <ThemedText style={styles.explanationText}>{question.explanation}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, !isAnswered && styles.disabledButton]}
          onPress={() => void handleNextQuestion()}
          disabled={!isAnswered}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.buttonText}>
            {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {alertConfig && (
        <ThemedAlert
          visible
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={hideAlert}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  questionContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  question: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  option: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: { borderColor: '#F59E0B' },
  correctOption: { borderColor: '#16A34A' },
  incorrectOption: { borderColor: '#DC2626' },
  optionText: { fontSize: 16 },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  explanationTitle: { fontSize: 16, marginBottom: 8, color: '#D97706' },
  explanationText: { fontSize: 14, lineHeight: 20 },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#9CA3AF' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
