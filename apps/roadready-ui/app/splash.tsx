import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { initDatabase, getSetting } from '@/utils/database';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    const checkAuth = async () => {
      await initDatabase();
      const authToken = await getSetting('auth_token');
      
      if (!authToken) {
        setTimeout(() => router.replace('/login'), 2000);
        return;
      }
      
      try {
        const { apiClient } = await import('@/utils/api-client');
        const userData = await apiClient.get<any>('/api/v1/auth/me');
        
        // Sync test records on initial load
        const { syncTestRecords } = await import('@/utils/sync');
        syncTestRecords().catch(err => console.error('Initial sync failed:', err));
        
        // Check if user has profiles
        const profiles = await apiClient.get<any[]>('/api/v1/onboarding-profiles/');
        
        if (profiles.length > 0) {
          // User has profiles, go to profile selection
          setTimeout(() => router.replace('/profile-selection'), 2000);
        } else {
          // No profiles, go to onboarding
          setTimeout(() => router.replace('/onboarding'), 2000);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setTimeout(() => router.replace('/login'), 2000);
      }
    };
    
    checkAuth();
  }, []);

  const logoSize = Math.min(width * 0.25, height * 0.12, 120);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <ThemedView style={styles.logoWrapper}>
        <RoadReadyLogo size={logoSize} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});