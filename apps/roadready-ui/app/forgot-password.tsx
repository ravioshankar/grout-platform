import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { ErrorBanner } from '@/components/error-banner';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/utils/api-client';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/request-password-reset', { email }, false);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <RoadReadyLogo size={80} />
          <Ionicons name="checkmark-circle" size={64} color="#16A34A" style={styles.successIcon} />
          <ThemedText type="title" style={styles.title}>Check Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            We've sent password reset instructions to {email}
          </ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
            <ThemedText style={styles.buttonText}>Back to Login</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <RoadReadyLogo size={80} />
        <ThemedText type="title" style={styles.title}>Forgot Password?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your email and we'll send you instructions to reset your password
        </ThemedText>

        <ThemedView style={styles.form}>
          <ErrorBanner message={error} onDismiss={() => setError('')} />
          <TextInput
            style={[styles.input, { color: Colors[currentScheme].text, backgroundColor: Colors[currentScheme].cardBackground }]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Send Reset Link</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="link">Back to Login</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 8,
  },
  successIcon: {
    marginTop: 24,
  },
});
