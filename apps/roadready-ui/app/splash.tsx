import { useEffect } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { initDatabase, getSetting } from '@/utils/database';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 800 });
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    taglineY.value = withDelay(600, withSpring(0, { damping: 12 }));

    const checkAuth = async () => {
      await initDatabase();
      const authToken = await getSetting('auth_token');
      
      if (!authToken) {
        setTimeout(() => router.replace('/login'), 2500);
        return;
      }
      
      try {
        const { apiClient } = await import('@/utils/api-client');
        const userData = await apiClient.get<any>('/api/v1/auth/me');
        
        const { syncTestRecords } = await import('@/utils/sync');
        syncTestRecords().catch(err => console.error('Initial sync failed:', err));
        
        const profiles = await apiClient.get<any[]>('/api/v1/onboarding-profiles/');
        
        if (profiles.length > 0) {
          setTimeout(() => router.replace('/profile-selection'), 2500);
        } else {
          setTimeout(() => router.replace('/onboarding'), 2500);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setTimeout(() => router.replace('/login'), 2500);
      }
    };
    
    checkAuth();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const logoSize = Math.min(width * 0.3, height * 0.15, 140);

  return (
    <ThemedView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F0F9FF' }]}>
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <RoadReadyLogo size={logoSize} />
      </Animated.View>
      
      <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
        <Text style={[styles.tagline, { color: isDark ? '#94A3B8' : '#475569' }]}>Your Journey to Safe Driving</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#64748B' : '#64748B' }]}>Master the road, ace the test</Text>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  taglineContainer: { alignItems: 'center', gap: 8 },
  tagline: { fontSize: 20, fontWeight: '600', letterSpacing: 0.5 },
  subtitle: { fontSize: 14, letterSpacing: 0.3 },
});