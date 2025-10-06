import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface StudyPlanDay {
  day: number;
  title: string;
  category: string;
  tasks: string[];
  estimatedTime: number;
  completed: boolean;
  progress: number;
  completedTasks?: number[];
}

const STUDY_PLAN_KEY = 'dmv_study_plan';

export default function StudyPlanScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [studyPlan, setStudyPlan] = useState<StudyPlanDay[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    try {
      const saved = await AsyncStorage.getItem(STUDY_PLAN_KEY);
      if (saved) {
        try {
          const plan = JSON.parse(saved);
          setStudyPlan(plan);
          calculateProgress(plan);
        } catch (parseError) {
          console.error('Error parsing study plan data:', parseError);
          const defaultPlan = generateStudyPlan();
          setStudyPlan(defaultPlan);
          await AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(defaultPlan));
        }
      } else {
        const defaultPlan = generateStudyPlan();
        setStudyPlan(defaultPlan);
        await AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(defaultPlan));
      }
    } catch (error) {
      console.error('Error loading study plan:', error);
    }
  };

  const generateStudyPlan = (): StudyPlanDay[] => [
    {
      day: 1,
      title: 'Road Signs Basics',
      category: 'road-signs',
      tasks: [
        'Study warning signs (yellow diamonds)',
        'Learn regulatory signs (red/white)',
        'Practice 20 road sign questions',
        'Review explanations for wrong answers'
      ],
      estimatedTime: 45,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 2,
      title: 'Traffic Laws Foundation',
      category: 'traffic-laws',
      tasks: [
        'Speed limits in different zones',
        'Right-of-way rules',
        'Practice 25 traffic law questions',
        'Take notes on weak areas'
      ],
      estimatedTime: 60,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 3,
      title: 'Safe Driving Practices',
      category: 'safe-driving',
      tasks: [
        'Following distance rules',
        'Defensive driving techniques',
        'Weather driving conditions',
        'Practice 20 safety questions'
      ],
      estimatedTime: 50,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 4,
      title: 'Parking & Maneuvering',
      category: 'parking',
      tasks: [
        'Parallel parking rules',
        'Parking restrictions',
        'Hill parking procedures',
        'Practice 15 parking questions'
      ],
      estimatedTime: 40,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 5,
      title: 'Right-of-Way Mastery',
      category: 'right-of-way',
      tasks: [
        'Intersection priorities',
        'Pedestrian right-of-way',
        'Emergency vehicle rules',
        'Practice 20 right-of-way questions'
      ],
      estimatedTime: 45,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 6,
      title: 'Emergency Situations',
      category: 'emergency',
      tasks: [
        'Vehicle breakdown procedures',
        'Accident protocols',
        'Emergency equipment',
        'Practice 15 emergency questions'
      ],
      estimatedTime: 35,
      completed: false,
      progress: 0,
      completedTasks: []
    },
    {
      day: 7,
      title: 'Final Review & Mock Test',
      category: 'review',
      tasks: [
        'Review all weak areas',
        'Take full practice test',
        'Analyze results',
        'Final preparation tips'
      ],
      estimatedTime: 90,
      completed: false,
      progress: 0,
      completedTasks: []
    }
  ];

  const calculateProgress = (plan: StudyPlanDay[]) => {
    const totalDays = plan.length;
    const completedDays = plan.filter(day => day.completed).length;
    const progress = Math.round((completedDays / totalDays) * 100);
    setOverallProgress(progress);
    
    // Find current day
    const nextDay = plan.find(day => !day.completed);
    setCurrentDay(nextDay ? nextDay.day : totalDays);
  };

  const markTaskComplete = async (dayIndex: number, taskIndex: number) => {
    const updatedPlan = [...studyPlan];
    const day = updatedPlan[dayIndex];
    
    // Mark specific task as complete
    if (!day.completedTasks) {
      day.completedTasks = [];
    }
    
    if (day.completedTasks.includes(taskIndex)) {
      // Unmark task
      day.completedTasks = day.completedTasks.filter(t => t !== taskIndex);
    } else {
      // Mark task complete
      day.completedTasks.push(taskIndex);
    }
    
    // Update progress based on completed tasks
    day.progress = Math.round((day.completedTasks.length / day.tasks.length) * 100);
    day.completed = day.progress === 100;
    
    setStudyPlan(updatedPlan);
    calculateProgress(updatedPlan);
    
    try {
      await AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(updatedPlan));
    } catch (error) {
      console.error('Error saving study plan:', error);
    }
  };

  const startDayPractice = (day: StudyPlanDay) => {
    // Navigate to practice for the day's category
    if (day.category === 'review') {
      // For review day, go to setup for full test
      router.push('/setup');
    } else {
      // For specific categories, go to practice
      router.push(`/practice/${day.category}`);
    }
  };

  const resetStudyPlan = () => {
    Alert.alert(
      'Reset Study Plan',
      'This will reset your entire study plan progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const newPlan = generateStudyPlan();
            setStudyPlan(newPlan);
            setOverallProgress(0);
            setCurrentDay(1);
            try {
              await AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(newPlan));
            } catch (error) {
              console.error('Error resetting study plan:', error);
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'road-signs': return 'warning';
      case 'traffic-laws': return 'document-text';
      case 'safe-driving': return 'shield-checkmark';
      case 'parking': return 'car';
      case 'right-of-way': return 'swap-horizontal';
      case 'emergency': return 'medical';
      case 'review': return 'checkmark-circle';
      default: return 'book';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'road-signs': return '#FF9800';
      case 'traffic-laws': return '#2196F3';
      case 'safe-driving': return '#4CAF50';
      case 'parking': return '#9C27B0';
      case 'right-of-way': return '#FF5722';
      case 'emergency': return '#F44336';
      case 'review': return '#607D8B';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Study Plan" showLogo={false} />


      {/* Progress Overview */}
      <ThemedView style={[styles.progressSection, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedView style={styles.progressHeader}>
          <ThemedText type="subtitle">Overall Progress</ThemedText>
          <TouchableOpacity onPress={resetStudyPlan} style={styles.resetButton}>
            <Ionicons name="refresh" size={16} color="#666" />
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={styles.progressBarContainer}>
          <ThemedView style={styles.progressBar}>
            <ThemedView 
              style={[styles.progressFill, { width: `${overallProgress}%` }]} 
            />
          </ThemedView>
          <ThemedText style={styles.progressText}>{overallProgress}%</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{studyPlan.filter(d => d.completed).length}</ThemedText>
            <ThemedText style={styles.statLabel}>Days Completed</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{studyPlan.reduce((sum, d) => sum + d.estimatedTime, 0)}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Minutes</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{7 - studyPlan.filter(d => d.completed).length}</ThemedText>
            <ThemedText style={styles.statLabel}>Days Left</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Study Plan Days */}
      <ThemedView style={styles.planSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Daily Study Plan</ThemedText>
        
        {studyPlan.map((day, dayIndex) => (
          <ThemedView key={day.day} style={[
            styles.dayCard,
            { backgroundColor: Colors[currentScheme].cardBackground },
            day.completed && styles.completedDayCard,
            day.day === currentDay && styles.currentDayCard
          ]}>
            <ThemedView style={styles.dayHeader}>
              <ThemedView style={styles.dayInfo}>
                <ThemedView style={styles.dayTitleRow}>
                  <Ionicons 
                    name={getCategoryIcon(day.category)} 
                    size={20} 
                    color={getCategoryColor(day.category)} 
                  />
                  <ThemedText type="defaultSemiBold" style={styles.dayTitle}>
                    Day {day.day}: {day.title}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.dayMeta}>
                  <ThemedText style={styles.dayTime}>
                    <Ionicons name="time" size={12} color="#666" /> {day.estimatedTime} min
                  </ThemedText>
                  <ThemedText style={[styles.dayCategory, { color: getCategoryColor(day.category) }]}>
                    {day.category.replace('-', ' ').toUpperCase()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.dayStatus}>
                {day.completed ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                ) : (
                  <ThemedView style={styles.progressCircle}>
                    <ThemedText style={styles.progressPercent}>{day.progress}%</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>

            {/* Tasks */}
            <ThemedView style={styles.tasksContainer}>
              {day.tasks.map((task, taskIndex) => {
                const isCompleted = day.completedTasks?.includes(taskIndex) || false;
                return (
                  <TouchableOpacity
                    key={taskIndex}
                    style={styles.taskItem}
                    onPress={() => markTaskComplete(dayIndex, taskIndex)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={isCompleted ? "#4CAF50" : "#ccc"} 
                    />
                    <ThemedText style={[
                      styles.taskText,
                      isCompleted && styles.completedTaskText
                    ]}>
                      {task}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>

            {day.day === currentDay && !day.completed && (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startDayPractice(day)}
              >
                <Ionicons name="play" size={16} color="white" />
                <ThemedText style={styles.startButtonText}>Start Day {day.day}</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    opacity: 0.7,
    fontSize: 14,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  planSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dayCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedDayCard: {
    borderColor: '#4CAF50',
  },
  currentDayCard: {
    borderColor: '#FF9800',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 16,
    flex: 1,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  dayCategory: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dayStatus: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  tasksContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  startButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});