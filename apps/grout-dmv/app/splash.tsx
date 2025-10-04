import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/dmv-logo';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoSize = Math.min(width * 0.3, height * 0.15, 150);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <RoadReadyLogo size={logoSize} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});