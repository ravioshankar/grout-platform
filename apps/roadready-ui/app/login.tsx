import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { ErrorBanner } from '@/components/error-banner';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { saveSetting } from '@/utils/database';
import { apiClient } from '@/utils/api-client';
import { getApiBaseUrl } from '@/utils/api-config';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await apiClient.post<{ access_token: string; refresh_token: string }>(
        '/api/v1/auth/login',
        { email, password },
        false
      );
      
      await saveSetting('auth_token', data.access_token);
      await saveSetting('refresh_token', data.refresh_token);
      await saveSetting('user_email', email);
      router.replace('/onboarding');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || error.toString() || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      const url = `${getApiBaseUrl()}/api/v1/auth/login/${provider}`;
      await Linking.openURL(url);
      setError('OAuth login requires web browser. Please use email/password for mobile.');
    } catch (error) {
      setError('OAuth not available on mobile. Please use email/password.');
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <ThemedView style={styles.header}>
        <RoadReadyLogo size={80} />
        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue your DMV prep</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <TextInput
          style={[styles.input, { 
            backgroundColor: Colors[currentScheme].cardBackground,
            color: Colors[currentScheme].text,
            borderColor: Colors[currentScheme].border
          }]}
          placeholder="Email"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: Colors[currentScheme].cardBackground,
            color: Colors[currentScheme].text,
            borderColor: Colors[currentScheme].border
          }]}
          placeholder="Password"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
          )}
        </TouchableOpacity>

        <ThemedView style={styles.divider}>
          <ThemedView style={[styles.dividerLine, { backgroundColor: Colors[currentScheme].border }]} />
          <ThemedText style={styles.dividerText}>OR</ThemedText>
          <ThemedView style={[styles.dividerLine, { backgroundColor: Colors[currentScheme].border }]} />
        </ThemedView>

        <TouchableOpacity
          style={[styles.oauthButton, { 
            backgroundColor: Colors[currentScheme].cardBackground,
            borderColor: Colors[currentScheme].border
          }]}
          onPress={() => handleOAuthLogin('google')}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <ThemedText style={styles.oauthButtonText}>Continue with Google</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthButton, { 
            backgroundColor: Colors[currentScheme].cardBackground,
            borderColor: Colors[currentScheme].border
          }]}
          onPress={() => handleOAuthLogin('facebook')}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          <ThemedText style={styles.oauthButtonText}>Continue with Facebook</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/signup')}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.linkText}>
            Don't have an account? <ThemedText type="link">Sign Up</ThemedText>
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/forgot-password')}
          activeOpacity={0.7}
        >
          <ThemedText type="link">Forgot Password?</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#16A34A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    opacity: 0.5,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
