import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <ThemedView style={styles.banner}>
      <Ionicons name="alert-circle" size={20} color="#DC2626" />
      <ThemedText style={styles.message}>{message}</ThemedText>
      {onDismiss && (
        <Ionicons name="close" size={20} color="#DC2626" onPress={onDismiss} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  message: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
  },
});
