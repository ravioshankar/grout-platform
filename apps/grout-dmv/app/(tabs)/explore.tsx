import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const features = [
    {
      id: 'simulator',
      title: 'DMV Simulator',
      description: 'Experience real DMV office scenarios',
      icon: 'car-sport',
      color: '#FF6B35',
      action: () => Alert.alert('Coming Soon', 'DMV Simulator will be available in the next update!')
    },
    {
      id: 'ai-tutor',
      title: 'AI Study Buddy',
      description: 'Get personalized study recommendations',
      icon: 'chatbubble-ellipses',
      color: '#4CAF50',
      action: () => Alert.alert('AI Tutor', 'Your AI study buddy analyzes your performance and suggests focus areas!')
    },
    {
      id: 'challenges',
      title: 'Daily Challenges',
      description: 'Complete daily driving challenges',
      icon: 'trophy',
      color: '#FF9800',
      action: () => Alert.alert('Daily Challenge', 'Today: Master parking rules in 5 questions!')
    },
    {
      id: 'community',
      title: 'Study Groups',
      description: 'Join local study communities',
      icon: 'people',
      color: '#9C27B0',
      action: () => Alert.alert('Study Groups', 'Connect with 1,247 learners in your area!')
    }
  ];

  const drivingTips = [
    {
      title: 'Parallel Parking Made Easy',
      tip: 'Use the side mirrors to align with the car in front, then turn the wheel when the cars align.',
      category: 'Parking',
      difficulty: 'Medium'
    },
    {
      title: 'Highway Merging',
      tip: 'Match the speed of traffic before merging. Use your mirrors and check blind spots.',
      category: 'Highway',
      difficulty: 'Hard'
    },
    {
      title: '3-Second Rule',
      tip: 'Keep 3 seconds distance behind the car ahead. Count "one-thousand-one" to measure.',
      category: 'Safety',
      difficulty: 'Easy'
    },
    {
      title: 'Night Driving',
      tip: 'Use low beams in traffic, high beams on empty roads. Clean your windshield regularly.',
      category: 'Night',
      difficulty: 'Medium'
    }
  ];

  const quickStats = [
    { label: 'Success Rate', value: '94%', icon: 'checkmark-circle', color: '#4CAF50' },
    { label: 'Avg. Study Time', value: '2.5h', icon: 'time', color: '#FF9800' },
    { label: 'Questions Solved', value: '1,247', icon: 'library', color: '#2196F3' },
    { label: 'Streak Days', value: '12', icon: 'flame', color: '#FF5722' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <AppHeader title="Explore" />

      {/* Quick Stats */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Your Journey</ThemedText>
        <ThemedView style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <ThemedView key={index} style={[styles.statCard]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <ThemedText style={[styles.statValue, { color: stat.color }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { opacity: 0.7 }]}>{stat.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Interactive Features */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Interactive Features</ThemedText>
        <ThemedView style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { borderLeftColor: feature.color}]}
              onPress={feature.action}
              activeOpacity={0.7}
            >
              <ThemedView style={styles.featureHeader}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                <ThemedView style={styles.featureInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                    {feature.title}
                  </ThemedText>
                  <ThemedText style={[styles.featureDescription, { opacity: 0.7 }]}>
                    {feature.description}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <Ionicons name="chevron-forward" size={16} color={isDark ? '#9CA3AF' : '#666'} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Driving Tips */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Pro Driving Tips</ThemedText>
        {drivingTips.map((tip, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tipCard,
              { backgroundColor: Colors[currentScheme].cardBackground },
              selectedTip === index && styles.selectedTipCard
            ]}
            onPress={() => setSelectedTip(selectedTip === index ? null : index)}
            activeOpacity={0.7}
          >
            <ThemedView style={styles.tipHeader}>
              <ThemedView style={styles.tipInfo}>
                <ThemedText type="defaultSemiBold" style={styles.tipTitle}>
                  {tip.title}
                </ThemedText>
                <ThemedView style={styles.tipMeta}>
                  <ThemedText style={[styles.tipCategory, { backgroundColor: getDifficultyColor(tip.difficulty) }]}>
                    {tip.category}
                  </ThemedText>
                  <ThemedText style={[styles.tipDifficulty, { color: getDifficultyColor(tip.difficulty) }]}>
                    {tip.difficulty}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <Ionicons 
                name={selectedTip === index ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={isDark ? '#9CA3AF' : '#666'} 
              />
            </ThemedView>
            {selectedTip === index && (
              <ThemedView style={[styles.tipContent, { borderTopColor: isDark ? '#374151' : '#f0f0f0' }]}>
                <ThemedText style={styles.tipText}>{tip.tip}</ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/setup')}
            activeOpacity={0.7}
          >
            <Ionicons name="flash" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Quick Test</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => router.push('/study-plan')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Study Plan</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
  },
  tipCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTipCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipCategory: {
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  tipDifficulty: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
