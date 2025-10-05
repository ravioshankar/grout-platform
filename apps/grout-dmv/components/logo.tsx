import { useTheme } from '@/contexts/theme-context';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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

  const animatedBorderStyle = useAnimatedStyle(() => {
    const colors = ['#EF4444', '#FBBF24', '#22C55E'];
    const colorIndex = Math.floor(lightCycle.value) % 3;
    return {
      borderTopColor: lightCycle.value < 1 ? '#EF4444' : lightCycle.value < 2 ? '#FBBF24' : '#22C55E',
      borderRightColor: lightCycle.value < 1 ? '#FBBF24' : lightCycle.value < 2 ? '#22C55E' : '#EF4444',
      borderBottomColor: lightCycle.value < 1 ? '#22C55E' : lightCycle.value < 2 ? '#EF4444' : '#FBBF24',
      borderLeftColor: lightCycle.value < 1 ? '#EF4444' : lightCycle.value < 2 ? '#FBBF24' : '#22C55E',
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.trafficBorder, animatedBorderStyle]}>
        <View style={styles.logoWrapper}>
              <View style={[styles.logoScene, { 
                width: size, 
                height: size,
                backgroundColor: containerBg
              }]}>
        {/* Road Base */}
        <View style={[styles.road, { 
          width: size, 
          height: size * 0.25,
          bottom: 0,
          backgroundColor: roadColor
        }]}>
          <View style={[styles.roadLine, { 
            width: size * 0.7, 
            height: Math.max(size * 0.03, 2),
            backgroundColor: roadLineColor
          }]} />
        </View>
        
        {/* Traffic Light */}
        <View style={[styles.trafficLight, { 
          width: size * 0.2, 
          height: size * 0.6,
          right: size * 0.08,
          top: size * 0.1,
          borderRadius: Math.max(size * 0.02, 2),
          backgroundColor: trafficLightColor
        }]}>
          <Animated.View style={[styles.lightRed, animatedRedLight, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05 
          }]} />
          <Animated.View style={[styles.lightYellow, animatedYellowLight, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05 
          }]} />
          <Animated.View style={[styles.lightGreen, animatedGreenLight, { 
            width: size * 0.1, 
            height: size * 0.1,
            borderRadius: size * 0.05 
          }]} />
        </View>
        
        {/* Motorbike */}
        <Animated.View style={[styles.motorbike, animatedBikeStyle, { 
          width: size * 0.3, 
          height: size * 0.15,
          left: size * 0.1,
          bottom: size * 0.25 
        }]}>
          <View style={[styles.bikeBody, { 
            width: size * 0.2, 
            height: size * 0.06,
            borderRadius: size * 0.03,
            top: size * 0.04,
            backgroundColor: bikeBodyColor
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.08, 
            height: size * 0.08,
            borderRadius: size * 0.04,
            left: size * 0.015,
            bottom: 0,
            backgroundColor: bikeWheelColor
          }]} />
          <View style={[styles.bikeWheel, { 
            width: size * 0.08, 
            height: size * 0.08,
            borderRadius: size * 0.04,
            right: size * 0.015,
            bottom: 0,
            backgroundColor: bikeWheelColor
          }]} />
          <View style={[styles.rider, { 
            width: size * 0.05, 
            height: size * 0.1,
            borderRadius: size * 0.025,
            left: size * 0.1,
            top: -size * 0.015,
            backgroundColor: riderColor
          }]} />
        </Animated.View>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.title, { 
                  fontSize: Math.max(size * 0.22, 16),
                  fontWeight: 'bold',
                  // color: titleColor
                }]}>
                  RoadReady
                </Text>
              </View>
        </View>
      </Animated.View>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trafficBorder: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 4,
  },
  logoWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  logoScene: {
    position: 'relative',
    borderRadius: 6,
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
    alignItems: 'center',
  },
  title: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 2,
  },
});