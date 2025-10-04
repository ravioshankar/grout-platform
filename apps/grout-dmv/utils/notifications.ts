import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'dmv_notification_settings';

export interface NotificationSettings {
  dailyReminder: boolean;
  weeklyProgress: boolean;
  testReminder: boolean;
  reminderTime: string; // HH:MM format
}

const defaultSettings: NotificationSettings = {
  dailyReminder: true,
  weeklyProgress: true,
  testReminder: true,
  reminderTime: '19:00', // 7 PM
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : defaultSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultSettings;
  }
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    await scheduleNotifications(settings);
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

export const scheduleNotifications = async (settings: NotificationSettings): Promise<void> => {
  // Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const [hour, minute] = settings.reminderTime.split(':').map(Number);

  // Daily practice reminder
  if (settings.dailyReminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 DMV Practice Time!',
        body: 'Take a few minutes to practice for your DMV test today.',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // Weekly progress reminder
  if (settings.weeklyProgress) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Weekly Progress Check',
        body: 'See how you\'ve improved this week and identify areas to focus on.',
        sound: true,
      },
      trigger: {
        weekday: 1, // Monday
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // Test reminder (3 days after last practice)
  if (settings.testReminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Ready for the Real Test?',
        body: 'You\'ve been practicing well! Consider taking a full DMV test.',
        sound: true,
      },
      trigger: {
        seconds: 3 * 24 * 60 * 60, // 3 days
        repeats: false,
      },
    });
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};