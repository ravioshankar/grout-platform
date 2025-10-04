import AsyncStorage from '@react-native-async-storage/async-storage';

const STUDY_PLAN_KEY = 'dmv_study_plan';
const LAST_STUDY_KEY = 'dmv_last_study_date';

export const updateStudyProgress = async (category: string, questionsAnswered: number) => {
  try {
    // Update last study date
    const today = new Date().toDateString();
    await AsyncStorage.setItem(LAST_STUDY_KEY, today);
    
    // Load current study plan
    const studyPlanData = await AsyncStorage.getItem(STUDY_PLAN_KEY);
    if (!studyPlanData) return;
    
    const studyPlan = JSON.parse(studyPlanData);
    
    // Find the day that matches this category
    const dayIndex = studyPlan.findIndex((day: any) => day.category === category);
    if (dayIndex === -1) return;
    
    const day = studyPlan[dayIndex];
    
    // Auto-complete practice task if enough questions answered
    if (questionsAnswered >= 15 && day.completedTasks) {
      const practiceTaskIndex = day.tasks.findIndex((task: string) => 
        task.toLowerCase().includes('practice') && task.toLowerCase().includes('question')
      );
      
      if (practiceTaskIndex !== -1 && !day.completedTasks.includes(practiceTaskIndex)) {
        day.completedTasks.push(practiceTaskIndex);
        day.progress = Math.round((day.completedTasks.length / day.tasks.length) * 100);
        day.completed = day.progress === 100;
        
        // Save updated plan
        await AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(studyPlan));
      }
    }
  } catch (error) {
    console.error('Error updating study progress:', error);
  }
};

export const getStudyStreak = async (): Promise<number> => {
  try {
    const streak = await AsyncStorage.getItem('study_streak');
    return streak ? parseInt(streak) : 0;
  } catch (error) {
    console.error('Error getting study streak:', error);
    return 0;
  }
};

export const updateStudyStreak = async (): Promise<number> => {
  try {
    const lastStudyDate = await AsyncStorage.getItem(LAST_STUDY_KEY);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    let currentStreak = await getStudyStreak();
    
    if (lastStudyDate === yesterday) {
      // Continuing streak
      currentStreak += 1;
    } else if (lastStudyDate !== today) {
      // Starting new streak
      currentStreak = 1;
    }
    
    await AsyncStorage.setItem('study_streak', currentStreak.toString());
    await AsyncStorage.setItem(LAST_STUDY_KEY, today);
    
    return currentStreak;
  } catch (error) {
    console.error('Error updating study streak:', error);
    return 0;
  }
};