import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export function SetupPromptCard() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
        <Ionicons name="settings" size={24} color="#fff" />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Complete Your Setup</ThemedText>
        <ThemedText style={[styles.description, { color: colors.icon }]}>
          Select your state and test type to start practicing
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/onboarding')}
      >
        <ThemedText style={styles.buttonText}>Set Up</ThemedText>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
