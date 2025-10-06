import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { getQuestionsByCategory } from '@/constants/questions';
import { Question, QuestionCategory, TestResult } from '@/constants/types';
import { saveTestResult } from '@/utils/storage';
import { updateStudyProgress, updateStudyStreak } from '@/utils/study-progress';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function PracticeScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const { category } = useLocalSearchParams<{ category: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Default to California for practice
  const questions = getQuestionsByCategory('CA', category || 'road-signs');
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isCorrect, setIsCorrect] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [questionTimings, setQuestionTimings] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions.has(currentQuestion)) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    if (correct) {
      setScore(score + 1);
    }
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);
    
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentQuestion] = correct;
    setIsCorrect(newIsCorrect);
    
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
    
    // Record timing
    const timing = Date.now() - questionStartTime;
    const newTimings = [...questionTimings];
    newTimings[currentQuestion] = timing;
    setQuestionTimings(newTimings);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);
      
      // Calculate final score from isCorrect array
      const finalScore = isCorrect.filter(Boolean).length;
      
      const testResult: TestResult = {
        id: `practice_${Date.now()}`,
        stateCode: 'CA',
        score: Math.round((finalScore / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: finalScore,
        category: category as QuestionCategory || 'road-signs',
        completedAt: new Date(),
        timeSpent,
        questions,
        userAnswers,
        isCorrect,
        testType: 'practice',
      };
      
      try {
        await saveTestResult(testResult);
        await updateStudyProgress(category as string, questions.length);
        await updateStudyStreak();
        
        const { updateDailyGoalProgress } = await import('@/components/daily-goal');
        await updateDailyGoalProgress(questions.length);
      } catch (error) {
        console.error('Error saving practice results:', error);
      }
      
      Alert.alert(
        'Practice Complete!',
        `You scored ${finalScore}/${questions.length}`,
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (questions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No questions available for this category</ThemedText>
      </ThemedView>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = answeredQuestions.has(currentQuestion);

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Practice" showLogo={false} />
      <ThemedView style={[styles.header, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="subtitle">Practice: {category}</ThemedText>
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
            if (index === question.correctAnswer) {
              optionStyle.push(styles.correctOption);
            } else if (index === selectedAnswer && index !== question.correctAnswer) {
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
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <ThemedText style={styles.optionText}>{option}</ThemedText>
            </TouchableOpacity>
          );
        })}

        {showExplanation && question.explanation && (
          <ThemedView style={[styles.explanationContainer, { backgroundColor: isDark ? '#374151' : '#FFFBEB' }]}>
            <ThemedText type="defaultSemiBold" style={styles.explanationTitle}>
              Explanation:
            </ThemedText>
            <ThemedText style={styles.explanationText}>
              {question.explanation}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.buttonText}>Previous</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !isAnswered && styles.disabledButton]}
          onPress={handleNextQuestion}
          disabled={!isAnswered}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.buttonText}>
            {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#F59E0B',
  },
  correctOption: {
    borderColor: '#16A34A',
  },
  incorrectOption: {
    borderColor: '#DC2626',
  },
  optionText: {
    fontSize: 16,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  explanationTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#D97706',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});