import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

export type LearnModeState = 'off' | 'on-hint-only' | 'on-full';

interface LearnModeToggleProps {
  state: LearnModeState;
  onToggle?: (newState: LearnModeState) => void;
}

export function LearnModeToggle({ state, onToggle }: LearnModeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (state !== (state as any).prev) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <ThemedText type="body" style={styles.label}>
        Learn Mode
      </ThemedText>
      
      <View 
        style={[
          styles.toggleContainer,
          { backgroundColor: state === 'off' ? '#E5E7EB' : (state === 'on-hint-only' ? '#FCD34D' : '#22C55E') }
        ]}
      >
        <View style={styles.toggleHandle}>
          <ThemedText type="labelSmall" style={styles.handleText}>
            {state === 'off' ? 'Off' : state === 'on-hint-only' ? 'Hints Only' : 'Full Help'}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, !isAnimating && styles.buttonPulse]}
        onPress={() => onToggle?.(state === 'off' ? 'on-hint-only' : state === 'on-hint-only' ? 'on-full' : 'off')}
        activeOpacity={0.7}
      >
        <ThemedText type="labelSmall" style={styles.buttonText}>
          {state === 'off' ? 'Enable Hints' : state === 'on-hint-only' ? 'Show Full Help' : 'Hide Help'}
        </ThemedText>
      </TouchableOpacity>

      <ThemedText type="caption" style={styles.hintText}>
        Get help when stuck • Reveal explanations
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 100,
  },
  toggleHandle: {
    width: 40,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  handleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    minWidth: 100,
  },
  buttonPulse: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  hintText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 200,
  },
});
