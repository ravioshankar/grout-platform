import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  if (!message) return null;

  return (
    <ThemedView style={styles.banner}>
      <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
      <ThemedText style={styles.message}>{message}</ThemedText>
      {onDismiss && (
        <Ionicons name="close" size={20} color="#16A34A" onPress={onDismiss} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  message: {
    flex: 1,
    color: '#16A34A',
    fontSize: 14,
  },
});
