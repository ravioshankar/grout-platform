import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ThemeProvider as AppThemeProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/utils/database';

const headerStyle = {
  headerStyle: {
    backgroundColor: '#4CAF50',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 0,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  headerBackTitleVisible: false,
};

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(err => {
        console.error('Failed to init database:', err);
        setDbReady(true); // Continue anyway
      });
  }, []);

  if (!dbReady) return null;

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="welcome-tour" options={{ headerShown: false }} />
          <Stack.Screen name="profile-selection" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="setup" options={{ ...headerStyle, title: 'Setup Test' }} />
          <Stack.Screen name="test/[state]" options={{ ...headerStyle, title: 'DMV Test' }} />
          <Stack.Screen name="practice/[category]" options={{ ...headerStyle, title: 'Practice' }} />
          <Stack.Screen name="report/[testId]" options={{ ...headerStyle, title: 'Test Report' }} />
          <Stack.Screen name="progress" options={{ ...headerStyle, title: 'Progress' }} />
          <Stack.Screen name="bookmarks" options={{ ...headerStyle, title: 'Bookmarks' }} />
          <Stack.Screen name="daily-challenge" options={{ ...headerStyle, title: 'Daily challenge' }} />
          <Stack.Screen name="wrong-answers" options={{ ...headerStyle, title: 'Missed questions' }} />
          <Stack.Screen name="exam-settings" options={{ ...headerStyle, title: 'Exam date' }} />
          <Stack.Screen name="study-plan" options={{ ...headerStyle, title: 'Study Plan' }} />
          <Stack.Screen name="privacy-policy" options={{ ...headerStyle, title: 'Privacy Policy' }} />
          <Stack.Screen name="profile/edit-profile" options={{ ...headerStyle, title: 'Edit Profile' }} />
          <Stack.Screen name="profile/change-password" options={{ ...headerStyle, title: 'Change Password' }} />
          <Stack.Screen name="profile/sessions" options={{ ...headerStyle, title: 'Active Sessions' }} />
          <Stack.Screen name="profile/statistics" options={{ ...headerStyle, title: 'Statistics' }} />
          <Stack.Screen name="profile/achievements" options={{ ...headerStyle, title: 'Achievements' }} />
          <Stack.Screen name="marketplace/partner-store" options={{ headerShown: false }} />
          <Stack.Screen name="marketplace/partner-product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="marketplace/community" options={{ headerShown: false }} />
          <Stack.Screen name="marketplace/community-listing/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="marketplace/create-listing" options={{ headerShown: false }} />
          <Stack.Screen name="marketplace/my-listings" options={{ headerShown: false }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
