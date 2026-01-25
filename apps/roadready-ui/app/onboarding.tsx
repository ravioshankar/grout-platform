import { useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { US_STATES } from '@/constants/states';
import { State } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { TEST_TYPES, TEST_CATEGORIES, TestType } from '@/constants/test-types';
import { saveSetting, getSetting } from '@/utils/database';
import { apiClient } from '@/utils/api-client';

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('standard');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedState || !selectedTestType) {
      return;
    }

    setLoading(true);
    try {
      const profiles = await apiClient.get<any[]>('/api/v1/onboarding-profiles/');
      const existingProfile = profiles.find(
        p => p.state === selectedState.code && p.test_type === selectedTestType.id
      );

      let profileId;
      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        const profile = await apiClient.post<any>('/api/v1/onboarding-profiles/', {
          profile_name: `${selectedState.name} - ${selectedTestType.name}`,
          state: selectedState.code,
          test_type: selectedTestType.id,
        });
        profileId = profile.id;
      }

      await apiClient.post(`/api/v1/onboarding-profiles/${profileId}/activate`, {});

      const { syncActiveProfileToLocal } = await import('@/utils/profile-sync');
      await syncActiveProfileToLocal();

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestTypes = TEST_TYPES.filter(t => t.category === selectedCategory);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <ThemedView style={styles.header}>
        <RoadReadyLogo size={80} />
        <ThemedText type="title" style={styles.welcomeText}>Welcome to RoadReady</ThemedText>
        <ThemedText style={styles.subtitle}>Let's get you ready for your DMV test</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* State Selection */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Select Your State</ThemedText>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { backgroundColor: Colors[currentScheme].cardBackground },
              selectedState && styles.selectedDropdown
            ]}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.dropdownText}>
              {selectedState ? `${selectedState.name} (${selectedState.code})` : 'Choose your state...'}
            </ThemedText>
            <ThemedText style={styles.dropdownArrow}>{showStateDropdown ? '▲' : '▼'}</ThemedText>
          </TouchableOpacity>
          
          {showStateDropdown && (
            <ScrollView style={[styles.dropdownList, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]} nestedScrollEnabled>
              {US_STATES.map((state) => (
                <TouchableOpacity
                  key={state.code}
                  style={[styles.dropdownItem, { borderBottomColor: Colors[currentScheme].border }]}
                  onPress={() => {
                    setSelectedState(state);
                    setShowStateDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText>{state.name} ({state.code})</ThemedText>
                  <ThemedText style={styles.passingScore}>Pass: {state.passingScore}%</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Test Category Selection */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Select Test Category</ThemedText>
          <ThemedView style={styles.categoryGrid}>
            {TEST_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border },
                  selectedCategory === cat.id && { borderColor: '#16A34A', backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#F0FDF4' }
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTestType(null);
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.categoryCardIcon}>{cat.icon}</ThemedText>
                <ThemedText style={styles.categoryCardText}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Test Type Selection */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Choose Your Test Type</ThemedText>
          {filteredTestTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.testTypeCard,
                { backgroundColor: Colors[currentScheme].cardBackground },
                selectedTestType?.id === type.id && styles.selectedCard
              ]}
              onPress={() => setSelectedTestType(type)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.testTypeIcon}>{type.icon}</ThemedText>
              <ThemedView style={styles.testTypeInfo}>
                <ThemedText type="defaultSemiBold" style={styles.testTypeTitle}>{type.name}</ThemedText>
                <ThemedText style={styles.testTypeDescription}>{type.description}</ThemedText>
                {type.requiresCDL && (
                  <ThemedText style={styles.cdlBadge}>Requires CDL</ThemedText>
                )}
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedState || !selectedTestType || loading) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedState || !selectedTestType || loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.continueButtonText}>Get Started</ThemedText>
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dropdown: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDropdown: {
    borderColor: '#16A34A',
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 16,
    opacity: 0.7,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passingScore: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  categoryCardIcon: {
    fontSize: 32,
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  testTypeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#16A34A',
  },
  testTypeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  testTypeInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  testTypeTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  testTypeDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  cdlBadge: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#16A34A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
