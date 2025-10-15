import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { saveSetting } from '@/utils/database';

const API_BASE_URL = 'http://localhost:8000';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Login failed' }));
        Alert.alert('Error', data.message || 'Login failed');
        return;
      }

      const data = await response.json();
      
      if (data.access_token) {
        await saveSetting('auth_token', data.access_token);
        await saveSetting('refresh_token', data.refresh_token);
        await saveSetting('user_email', email);
        router.replace('/onboarding');
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
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

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/signup')}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.linkText}>
            Don't have an account? <ThemedText type="link">Sign Up</ThemedText>
          </ThemedText>
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
});
