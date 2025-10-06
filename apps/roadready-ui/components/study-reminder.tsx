import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface StudyReminderProps {
  onStartStudy: () => void;
}

const REMINDER_KEY = 'dmv_study_reminder';
const LAST_STUDY_KEY = 'dmv_last_study_date';

export function StudyReminder({ onStartStudy }: StudyReminderProps) {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [showReminder, setShowReminder] = useState(false);
  const [daysSinceLastStudy, setDaysSinceLastStudy] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    checkStudyReminder();
  }, []);

  const checkStudyReminder = async () => {
    try {
      const lastStudyDate = await AsyncStorage.getItem(LAST_STUDY_KEY);
      const today = new Date().toDateString();
      
      if (lastStudyDate) {
        const lastDate = new Date(lastStudyDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setDaysSinceLastStudy(diffDays);
        
        if (diffDays >= 1) {
          setShowReminder(true);
        }
      } else {
        setShowReminder(true);
        setDaysSinceLastStudy(0);
      }
      
      // Load current streak
      const streak = await AsyncStorage.getItem('study_streak');
      setCurrentStreak(streak ? parseInt(streak) : 0);
    } catch (error) {
      console.error('Error checking study reminder:', error);
    }
  };

  const reminderMessage = useMemo(() => {
    if (daysSinceLastStudy === 0) {
      return "Ready to start your DMV prep journey?";
    } else if (daysSinceLastStudy === 1) {
      return "Don't break your streak! Study today.";
    } else {
      return `It's been ${daysSinceLastStudy} days since your last study session.`;
    }
  }, [daysSinceLastStudy]);

  const reminderIcon = useMemo(() => {
    if (daysSinceLastStudy <= 1) return 'flame';
    if (daysSinceLastStudy <= 3) return 'time';
    return 'warning';
  }, [daysSinceLastStudy]);

  const reminderColor = useMemo(() => {
    if (daysSinceLastStudy <= 1) return '#4CAF50';
    if (daysSinceLastStudy <= 3) return '#FF9800';
    return '#F44336';
  }, [daysSinceLastStudy]);

  const markStudyComplete = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(LAST_STUDY_KEY, today);
      
      // Update streak
      const newStreak = currentStreak + 1;
      await AsyncStorage.setItem('study_streak', newStreak.toString());
      setCurrentStreak(newStreak);
      
      setShowReminder(false);
      onStartStudy();
    } catch (error) {
      console.error('Error marking study complete:', error);
    }
  };

  const dismissReminder = () => {
    setShowReminder(false);
  };

  if (!showReminder) {
    return null;
  }



  return (
    <ThemedView style={[styles.reminderCard, { borderLeftColor: reminderColor, backgroundColor: Colors[currentScheme].cardBackground }]}>
      <ThemedView style={styles.reminderHeader}>
        <Ionicons name={reminderIcon} size={24} color={reminderColor} />
        <ThemedView style={styles.reminderInfo}>
          <ThemedText type="defaultSemiBold" style={styles.reminderTitle}>
            Study Reminder
          </ThemedText>
          <ThemedText style={styles.reminderMessage}>
            {reminderMessage}
          </ThemedText>
          {currentStreak > 0 && (
            <ThemedText style={styles.streakText}>
              🔥 Current streak: {currentStreak} days
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.reminderActions}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={dismissReminder}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.dismissText}>Later</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.studyButton, { backgroundColor: reminderColor }]}
          onPress={markStudyComplete}
          activeOpacity={0.7}
        >
          <Ionicons name="book" size={16} color="white" />
          <ThemedText style={styles.studyButtonText}>Study Now</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  streakText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontWeight: '600',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  dismissText: {
    color: '#666',
    fontWeight: '600',
  },
  studyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  studyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});