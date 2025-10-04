import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface DailyGoalProps {
  onGoalComplete?: () => void;
}

const DAILY_GOAL_KEY = 'dmv_daily_goal';
const GOAL_DATE_KEY = 'dmv_goal_date';

export function DailyGoal({ onGoalComplete }: DailyGoalProps) {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [dailyGoal] = useState(20); // Daily goal of 20 questions
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const today = new Date().toDateString();
      const goalDate = await AsyncStorage.getItem(GOAL_DATE_KEY);
      
      if (goalDate === today) {
        const progress = await AsyncStorage.getItem(DAILY_GOAL_KEY);
        const answered = progress ? parseInt(progress) : 0;
        setQuestionsAnswered(answered);
        setIsCompleted(answered >= dailyGoal);
      } else {
        // New day, reset progress
        setQuestionsAnswered(0);
        setIsCompleted(false);
        await AsyncStorage.setItem(GOAL_DATE_KEY, today);
        await AsyncStorage.setItem(DAILY_GOAL_KEY, '0');
      }
    } catch (error) {
      console.error('Error loading daily progress:', error);
    }
  };

  const updateProgress = async (newQuestions: number) => {
    try {
      const total = questionsAnswered + newQuestions;
      setQuestionsAnswered(total);
      
      const completed = total >= dailyGoal;
      setIsCompleted(completed);
      
      await AsyncStorage.setItem(DAILY_GOAL_KEY, total.toString());
      
      if (completed && !isCompleted && onGoalComplete) {
        onGoalComplete();
      }
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  };

  const getProgressPercentage = () => {
    return Math.min((questionsAnswered / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 75) return '#8BC34A';
    if (percentage >= 50) return '#FF9800';
    return '#FF5722';
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].cardBackground }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <Ionicons name="target" size={20} color={getProgressColor()} />
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Daily Goal
          </ThemedText>
        </ThemedView>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </ThemedView>
      
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView 
            style={[
              styles.progressFill, 
              { 
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </ThemedView>
        <ThemedText style={styles.progressText}>
          {questionsAnswered}/{dailyGoal}
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.subtitle}>
        {isCompleted 
          ? '🎉 Goal completed! Great job!' 
          : `${dailyGoal - questionsAnswered} questions to go`
        }
      </ThemedText>
    </ThemedView>
  );
}

// Export function to update progress from other components
export const updateDailyGoalProgress = async (questionsAnswered: number) => {
  try {
    const today = new Date().toDateString();
    const goalDate = await AsyncStorage.getItem(GOAL_DATE_KEY);
    
    if (goalDate === today) {
      const currentProgress = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      const current = currentProgress ? parseInt(currentProgress) : 0;
      const newTotal = current + questionsAnswered;
      await AsyncStorage.setItem(DAILY_GOAL_KEY, newTotal.toString());
    }
  } catch (error) {
    console.error('Error updating daily goal progress:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});