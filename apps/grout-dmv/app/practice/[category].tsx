import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getQuestionsByCategory } from '@/constants/questions';
import { Question, QuestionCategory, TestResult } from '@/constants/types';
import { saveTestResult } from '@/utils/storage';

export default function PracticeScreen() {
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
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);
      
      const testResult: TestResult = {
        id: `practice_${Date.now()}`,
        stateCode: 'CA',
        score: Math.round((score / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: score,
        category: category as QuestionCategory || 'road-signs',
        completedAt: new Date(),
        timeSpent,
        questions,
        userAnswers,
        isCorrect,
        testType: 'practice',
      };
      
      await saveTestResult(testResult);
      
      Alert.alert(
        'Practice Complete!',
        `You scored ${score}/${questions.length}`,
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
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Practice: {category}</ThemedText>
        <ThemedText>Question {currentQuestion + 1} of {questions.length}</ThemedText>
        <ThemedText>Score: {score}/{answeredQuestions.size}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.questionContainer}>
        <ThemedText type="defaultSemiBold" style={styles.question}>
          {question.question}
        </ThemedText>

        {question.options.map((option, index) => {
          let optionStyle = [styles.option];
          
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
            >
              <ThemedText style={styles.optionText}>{option}</ThemedText>
            </TouchableOpacity>
          );
        })}

        {showExplanation && question.explanation && (
          <ThemedView style={styles.explanationContainer}>
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
        >
          <ThemedText style={styles.buttonText}>Previous</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !isAnswered && styles.disabledButton]}
          onPress={handleNextQuestion}
          disabled={!isAnswered}
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
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  explanationTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#E65100',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007AFF',
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
});