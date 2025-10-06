import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { US_STATES } from '@/constants/states';
import { Question, QuestionCategory, TestResult } from '@/constants/types';
import { getRandomQuestions } from '@/constants/questions';
import { saveTestResult } from '@/utils/storage';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function TestScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const { state } = useLocalSearchParams<{ state: string }>();
  const selectedState = US_STATES.find(s => s.code === state);
  const questions = getRandomQuestions(state || 'CA', 10);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  // amazonq-ignore-next-line
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isCorrect, setIsCorrect] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [questionTimings, setQuestionTimings] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [pauseCount, setPauseCount] = useState(0);

  const handleTimeUp = useCallback(() => {
    Alert.alert('Time Up!', 'Your test time has expired.');
    finishTest();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleTimeUp]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);
    
    // Record timing
    const timing = Date.now() - questionStartTime;
    const newTimings = [...questionTimings];
    newTimings[currentQuestion] = timing;
    setQuestionTimings(newTimings);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer');
      return;
    }

    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (correct) {
      setScore(score + 1);
    }
    
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentQuestion] = correct;
    setIsCorrect(newIsCorrect);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    const result: TestResult = {
      id: `test_${Date.now()}`,
      stateCode: state || 'CA',
      score: Math.round((score / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers: score,
      category: 'road-signs',
      completedAt: new Date(),
      timeSpent,
      questions,
      userAnswers,
      isCorrect,
      testType: 'full-test',
    };
    
    try {
      await saveTestResult(result);
    } catch (error) {
      console.error('Error saving test results:', error);
    }
    
    setTestResult(result);
    setShowResult(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedState || questions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No questions available for {state}</ThemedText>
      </ThemedView>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= selectedState.passingScore;

    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Test Complete!</ThemedText>
        <ThemedText style={styles.result}>
          Score: {score}/{questions.length} ({percentage}%)
        </ThemedText>
        <ThemedText style={[styles.status, { color: passed ? 'green' : 'red' }]}>
          {passed ? 'PASSED' : 'FAILED'}
        </ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => testResult && router.push(`/report/${testResult.id}`)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.buttonText}>View Report</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#666', marginTop: 10 }]}
          onPress={() => router.push('/')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.buttonText}>Back to Dashboard</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const question = questions[currentQuestion];

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="DMV Test" showLogo={false} />
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">{selectedState.name} DMV Test</ThemedText>
        <ThemedText>Time: {formatTime(timeLeft)}</ThemedText>
        <ThemedText>Question {currentQuestion + 1} of {questions.length}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.questionContainer}>
        <ThemedText type="defaultSemiBold" style={styles.question}>
          {question.question}
        </ThemedText>

        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedAnswer === index && styles.selectedOption
            ]}
            onPress={() => handleAnswerSelect(index)}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <ThemedText style={styles.optionText}>{option}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <TouchableOpacity
        style={[styles.button, selectedAnswer === null && styles.disabledButton]}
        onPress={handleNextQuestion}
        disabled={selectedAnswer === null}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ThemedText style={styles.buttonText}>
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Test'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
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
    gap: 8,
  },
  questionContainer: {
    flex: 1,
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
  },
  optionText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  status: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
});