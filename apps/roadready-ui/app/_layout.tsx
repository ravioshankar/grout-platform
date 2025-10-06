import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as AppThemeProvider } from '@/contexts/theme-context';

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

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="setup" options={{ ...headerStyle, title: 'Setup Test' }} />
          <Stack.Screen name="test/[state]" options={{ ...headerStyle, title: 'DMV Test' }} />
          <Stack.Screen name="practice/[category]" options={{ ...headerStyle, title: 'Practice' }} />
          <Stack.Screen name="report/[testId]" options={{ ...headerStyle, title: 'Test Report' }} />
          <Stack.Screen name="progress" options={{ ...headerStyle, title: 'Progress' }} />
          <Stack.Screen name="bookmarks" options={{ ...headerStyle, title: 'Bookmarks' }} />
          <Stack.Screen name="study-plan" options={{ ...headerStyle, title: 'Study Plan' }} />
          <Stack.Screen name="privacy-policy" options={{ ...headerStyle, title: 'Privacy Policy' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
