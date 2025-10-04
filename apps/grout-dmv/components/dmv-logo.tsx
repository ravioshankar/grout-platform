import { StyleSheet, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/theme-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function RoadReadyLogo({ size = 40 }: { size?: number }) {
  const { isDark } = useTheme();
  const bikePosition = useSharedValue(0);
  const lightCycle = useSharedValue(0);

  // Theme-aware colors
  const roadColor = isDark ? '#E5E7EB' : '#374151';
  const roadLineColor = isDark ? '#1F2937' : '#FBBF24';
  const trafficLightColor = isDark ? '#F3F4F6' : '#1F2937';
  const containerBg = isDark ? '#334155' : '#DBEAFE';
  const titleColor = isDark ? '#22C55E' : '#16A34A';
  const subtitleColor = isDark ? '#F9FAFB' : '#1F2937';
  const bikeBodyColor = isDark ? '#EF4444' : '#DC2626';
  const bikeWheelColor = isDark ? '#F3F4F6' : '#111827';
  const riderColor = isDark ? '#E5E7EB' : '#1F2937';

  useEffect(() => {
    bikePosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    lightCycle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(2, { duration: 800 }),
        withTiming(3, { duration: 2000 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedBikeStyle = useAnimatedStyle(() => {
    const translateX = interpolate(bikePosition.value, [0, 1], [0, size * 0.3]);
    return { transform: [{ translateX }] };
  });

  const animatedRedLight = useAnimatedStyle(() => {
    const opacity = interpolate(lightCycle.value, [0, 1, 2, 3], [0.3, 1, 0.3, 0.3]);
    return { opacity };
  });

  const animatedYellowLight = useAnimatedStyle(() => {
    const opacity = interpolate(lightCycle.value, [0, 1, 2, 3], [0.3, 0.3, 1, 0.3]);
    return { opacity };
  });

  const animatedGreenLight = useAnimatedStyle(() => {
    const opacity = interpolate(lightCycle.value, [0, 1, 2, 3], [0.3, 0.3, 0.3, 1]);
    return { opacity };
  });

  return (
    <View style={[styles.container, { width: size * 4, height: size }]}>
      <View style={[styles.logoScene, { 
        width: size * 1.2, 
        height: size,
        backgroundColor: containerBg
      }]}>
        {/* Road Base */}
        <View style={[styles.road, { 
          width: size * 1.2, 
          height: size * 0.3,
          bottom: 0,
          backgroundColor: roadColor
        }]}>
          <View style={[styles.roadLine, { 
            width: size * 0.8, 
            height: size * 0.04,
            backgroundColor: roadLineColor
          }]} />
        </View>
        
        {/* Traffic Light */}
        <View style={[styles.trafficLight, { 
          width: size * 0.25, 
          height: size * 0.7,
          right: size * 0.1,
          top: size * 0.05,
          borderRadius: size * 0.03,
          backgroundColor: trafficLightColor
        }]}>
          <Animated.View style={[styles.lightRed, animatedRedLight, { 
            width: size * 0.12, 
            height: size * 0.12,
            borderRadius: size * 0.06 
          }]} />
          <Animated.View style={[styles.lightYellow, animatedYellowLight, { 
            width: size * 0.12, 
            height: size * 0.12,
            borderRadius: size * 0.06 
          }]} />
          <Animated.View style={[styles.lightGreen, animatedGreenLight, { 
            width: size * 0.12, 
            height: size * 0.12,
            borderRadius: size * 0.06 
          }]} />
        </View>
        
        {/* Motorbike */}
        <Animated.View style={[styles.motorbike, animatedBikeStyle, { 
          width: size * 0.35, 
          height: size * 0.18,
          left: size * 0.15,
          bottom: size * 0.3 
        }]}>
          <View style={[styles.bikeBody, { 
            width: size * 0.25, 
            height: size * 0.08,
            borderRadius: size * 0.04,
            top: size * 0.05,
            backgroundColor: bikeBodyColor
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05,
            left: size * 0.02,
            bottom: 0,
            backgroundColor: bikeWheelColor
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05,
            right: size * 0.02,
            bottom: 0,
            backgroundColor: bikeWheelColor
          }]} />
          <View style={[styles.rider, { 
            width: size * 0.06, 
            height: size * 0.12,
            borderRadius: size * 0.03,
            left: size * 0.12,
            top: -size * 0.02,
            backgroundColor: riderColor
          }]} />
        </Animated.View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { 
          fontSize: size * 0.28,
          fontWeight: 'bold',
          color: titleColor
        }]}>
          RoadReady
        </Text>
        <Text style={[styles.subtitle, { 
          fontSize: size * 0.16,
          color: subtitleColor
        }]}>
          DMV Test Prep
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoScene: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  road: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  roadLine: {
    opacity: 0.9,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  trafficLight: {
    position: 'absolute',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 3,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  lightRed: {
    backgroundColor: '#EF4444',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#B91C1C',
  },
  lightYellow: {
    backgroundColor: '#FBBF24',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#D97706',
  },
  lightGreen: {
    backgroundColor: '#22C55E',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#15803D',
  },
  motorbike: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bikeBody: {
    position: 'absolute',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  bikeWheel: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 1,
  },
  rider: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  textContainer: {
    justifyContent: 'center',
    borderRadius: 8,

  },
  title: {
    lineHeight: 16,
    letterSpacing: 1,
  },
  subtitle: {
    borderRadius: 8,

    lineHeight: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },
});