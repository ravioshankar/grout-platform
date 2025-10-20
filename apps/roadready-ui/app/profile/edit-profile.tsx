import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { getSetting } from '@/utils/database';
import { US_STATES } from '@/constants/states';
import { TEST_TYPES } from '@/constants/test-types';
import { apiClient } from '@/utils/api-client';

export default function EditProfileScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [testType, setTestType] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showTestTypeDropdown, setShowTestTypeDropdown] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiClient.get<any>('/api/v1/auth/me');
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setState(data.state || '');
      setTestType(data.test_type || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch('/api/v1/auth/me', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        state: state || null,
        test_type: testType || null,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  const selectedState = US_STATES.find(s => s.code === state);
  const selectedTestType = TEST_TYPES.find(t => t.id === testType);

  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Edit Profile" showLogo={false} />
      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>First Name *</ThemedText>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              color: Colors[currentScheme].text,
              borderColor: Colors[currentScheme].border
            }]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>Last Name</ThemedText>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              color: Colors[currentScheme].text,
              borderColor: Colors[currentScheme].border
            }]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>State</ThemedText>
          <TouchableOpacity
            style={[styles.dropdown, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              borderColor: Colors[currentScheme].border
            }]}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
            activeOpacity={0.7}
          >
            <ThemedText>{selectedState ? `${selectedState.name} (${selectedState.code})` : 'Select state'}</ThemedText>
            <Ionicons name={showStateDropdown ? "chevron-up" : "chevron-down"} size={20} color={Colors[currentScheme].icon} />
          </TouchableOpacity>
          {showStateDropdown && (
            <ScrollView style={[styles.dropdownList, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              borderColor: Colors[currentScheme].border
            }]} nestedScrollEnabled>
              {US_STATES.map((s) => (
                <TouchableOpacity
                  key={s.code}
                  style={[styles.dropdownItem, { borderBottomColor: Colors[currentScheme].border }]}
                  onPress={() => {
                    setState(s.code);
                    setShowStateDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText>{s.name} ({s.code})</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.label}>Test Type</ThemedText>
          <TouchableOpacity
            style={[styles.dropdown, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              borderColor: Colors[currentScheme].border
            }]}
            onPress={() => setShowTestTypeDropdown(!showTestTypeDropdown)}
            activeOpacity={0.7}
          >
            <ThemedText>{selectedTestType ? selectedTestType.name : 'Select test type'}</ThemedText>
            <Ionicons name={showTestTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color={Colors[currentScheme].icon} />
          </TouchableOpacity>
          {showTestTypeDropdown && (
            <ScrollView style={[styles.dropdownList, { 
              backgroundColor: Colors[currentScheme].cardBackground,
              borderColor: Colors[currentScheme].border
            }]} nestedScrollEnabled>
              {TEST_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.dropdownItem, { borderBottomColor: Colors[currentScheme].border }]}
                  onPress={() => {
                    setTestType(t.id);
                    setShowTestTypeDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText>{t.icon} {t.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  saveButton: {
    backgroundColor: '#16A34A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
