import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
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

export function DMVLogo({ size = 40 }: { size?: number }) {
  const bikePosition = useSharedValue(0);
  const lightCycle = useSharedValue(0);

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
    <View style={[styles.container, { width: size * 3.2, height: size }]}>
      <View style={[styles.logoScene, { width: size * 1.2, height: size }]}>
        {/* Road Base */}
        <View style={[styles.road, { 
          width: size * 1.2, 
          height: size * 0.3,
          bottom: 0 
        }]}>
          <View style={[styles.roadLine, { 
            width: size * 0.8, 
            height: size * 0.04 
          }]} />
        </View>
        
        {/* Traffic Light */}
        <View style={[styles.trafficLight, { 
          width: size * 0.25, 
          height: size * 0.7,
          right: size * 0.1,
          top: size * 0.05,
          borderRadius: size * 0.03 
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
            top: size * 0.05 
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05,
            left: size * 0.02,
            bottom: 0 
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05,
            right: size * 0.02,
            bottom: 0 
          }]} />
          <View style={[styles.rider, { 
            width: size * 0.06, 
            height: size * 0.12,
            borderRadius: size * 0.03,
            left: size * 0.12,
            top: -size * 0.02 
          }]} />
        </Animated.View>
      </View>
      
      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { 
          fontSize: size * 0.35,
          fontWeight: 'bold' 
        }]}>
          DMV
        </ThemedText>
        <ThemedText style={[styles.subtitle, { 
          fontSize: size * 0.18
        }]}>
          TEST PREP
        </ThemedText>
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
    backgroundColor: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  road: {
    position: 'absolute',
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  roadLine: {
    backgroundColor: '#FBBF24',
    opacity: 0.9,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  trafficLight: {
    position: 'absolute',
    backgroundColor: '#1F2937',
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
    backgroundColor: '#DC2626',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  bikeWheel: {
    position: 'absolute',
    backgroundColor: '#111827',
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
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#16A34A',
    lineHeight: 16,
    letterSpacing: 1,
  },
  subtitle: {
    lineHeight: 12,
    letterSpacing: 0.5,
  },
});