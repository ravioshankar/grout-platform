import { useState } from 'react';
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
import { saveSetting } from '@/utils/database';

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('standard');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const handleContinue = async () => {
    if (!selectedState || !selectedTestType) {
      return;
    }

    try {
      const onboardingData = {
        completed: true,
        selectedState: selectedState.code,
        selectedTestType: selectedTestType.id,
        completedAt: new Date().toISOString(),
      };
      await saveSetting('onboarding', JSON.stringify(onboardingData));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {TEST_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: Colors[currentScheme].cardBackground },
                  selectedCategory === cat.id && styles.selectedChip
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTestType(null);
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.chipIcon}>{cat.icon}</ThemedText>
                <ThemedText style={styles.chipText}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Test Type Selection */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Choose Your Test Type</ThemedText>
          <ScrollView style={styles.testTypesList} showsVerticalScrollIndicator={false}>
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
          </ScrollView>
        </ThemedView>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedState || !selectedTestType) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedState || !selectedTestType}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.continueButtonText}>Get Started</ThemedText>
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
  },
  section: {
    marginBottom: 32,
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
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
    gap: 6,
  },
  selectedChip: {
    borderColor: '#16A34A',
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testTypesList: {
    maxHeight: 300,
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
