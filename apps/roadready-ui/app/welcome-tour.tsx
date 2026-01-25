import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { saveSetting } from '@/utils/database';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'car-sport' as const,
    title: 'Master Your DMV Test',
    description: 'Practice with real DMV questions, track your progress, and ace your test with confidence.',
    color: '#4CAF50',
  },
  {
    icon: 'trophy' as const,
    title: 'Track Progress & Earn Rewards',
    description: 'Build streaks, earn XP, unlock achievements, and compete with yourself to stay motivated.',
    color: '#FF9500',
  },
  {
    icon: 'storefront' as const,
    title: 'Buy & Sell Safety Gear',
    description: 'Browse partner products or connect with the community to buy and sell driving essentials.',
    color: '#2196F3',
  },
];

export default function WelcomeTourScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await saveSetting('welcome_tour_completed', 'true');
    router.replace('/(tabs)');
  };

  const handleComplete = async () => {
    await saveSetting('welcome_tour_completed', 'true');
    router.replace('/(tabs)');
  };

  const slide = slides[currentIndex];

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <ThemedText style={[styles.skipText, { color: colors.icon }]}>Skip</ThemedText>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>

        <ThemedText style={styles.title}>{slide.title}</ThemedText>
        <ThemedText style={[styles.description, { color: colors.icon }]}>
          {slide.description}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? colors.tint : colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
