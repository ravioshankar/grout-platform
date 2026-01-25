import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/utils/api-client';

export default function ChangePasswordScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    if (!newPassword) return { strength: 0, label: '', color: '#E5E7EB' };
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;
    
    if (strength <= 2) return { strength: 33, label: 'Weak', color: '#EF4444' };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: '#F59E0B' };
    return { strength: 100, label: 'Strong', color: '#10B981' };
  };

  const strength = passwordStrength();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      
      <ScrollView style={styles.scrollContent}>
        <ThemedView style={styles.content} backgroundColor="transparent">
        <ThemedView style={[styles.infoCard, { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }]}>
          <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
          <ThemedText style={[styles.infoText, { color: isDark ? '#BFDBFE' : '#1E40AF' }]}>Choose a strong password to keep your account secure</ThemedText>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>Current Password</ThemedText>
          <ThemedView style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { 
                backgroundColor: Colors[currentScheme].cardBackground,
                color: Colors[currentScheme].text,
                borderColor: Colors[currentScheme].border
              }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrent(!showCurrent)}
              activeOpacity={0.7}
            >
              <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color={Colors[currentScheme].icon} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>New Password</ThemedText>
          <ThemedView style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { 
                backgroundColor: Colors[currentScheme].cardBackground,
                color: Colors[currentScheme].text,
                borderColor: Colors[currentScheme].border
              }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNew(!showNew)}
              activeOpacity={0.7}
            >
              <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color={Colors[currentScheme].icon} />
            </TouchableOpacity>
          </ThemedView>
          {newPassword.length > 0 && (
            <ThemedView style={styles.strengthContainer}>
              <ThemedView style={styles.strengthBar}>
                <ThemedView style={[styles.strengthFill, { width: `${strength.strength}%`, backgroundColor: strength.color }]} />
              </ThemedView>
              <ThemedText style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</ThemedText>
            </ThemedView>
          )}
          <ThemedText style={styles.hint}>Minimum 8 characters, mix of letters, numbers & symbols</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>Confirm New Password</ThemedText>
          <ThemedView style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { 
                backgroundColor: Colors[currentScheme].cardBackground,
                color: Colors[currentScheme].text,
                borderColor: Colors[currentScheme].border
              }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirm(!showConfirm)}
              activeOpacity={0.7}
            >
              <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={Colors[currentScheme].icon} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Change Password</ThemedText>
          )}
        </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 32 },
  headerTitle: { fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 32, backgroundColor: 'transparent' },
  scrollContent: { flex: 1 },
  content: { padding: 20, gap: 20 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  section: { gap: 8, backgroundColor: 'transparent' },
  label: { fontSize: 14, fontWeight: '600' },
  passwordContainer: { position: 'relative' },
  passwordInput: { padding: 16, paddingRight: 50, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  eyeIcon: { position: 'absolute', right: 16, top: 16 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, backgroundColor: 'transparent' },
  strengthBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 3 },
  strengthLabel: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  saveButton: { backgroundColor: '#16A34A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
