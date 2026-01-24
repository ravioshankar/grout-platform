import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/utils/api-client';

interface EmailVerificationBannerProps {
  emailVerified: boolean;
}

export function EmailVerificationBanner({ emailVerified }: EmailVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/send-verification', {});
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Failed to send verification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.banner}>
      <Ionicons name="mail-outline" size={20} color="#F59E0B" />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.message}>
          {sent ? 'Verification email sent!' : 'Please verify your email'}
        </ThemedText>
        {!sent && (
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <ThemedText style={styles.link}>Resend</ThemedText>
            )}
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: '#92400E',
    fontSize: 14,
  },
  link: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
});
