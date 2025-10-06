import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { US_STATES } from '@/constants/states';
import { State, QuestionCategory } from '@/constants/types';
import { TEST_TYPES, TEST_CATEGORIES, TestType, getTestTypeById } from '@/constants/test-types';
import { getSetting } from '@/utils/database';

const TEST_MODES = [
  { id: 'full-test', title: 'Full DMV Test', description: 'Complete practice test with timer' },
  { id: 'practice', title: 'Practice Mode', description: 'Study with instant feedback' },
];

const CATEGORIES = [
  { id: 'road-signs', title: 'Road Signs', icon: '🚦' },
  { id: 'traffic-laws', title: 'Traffic Laws', icon: '⚖️' },
  { id: 'safe-driving', title: 'Safe Driving', icon: '🛡️' },
  { id: 'parking', title: 'Parking Rules', icon: '🅿️' },
  { id: 'right-of-way', title: 'Right of Way', icon: '🔄' },
  { id: 'emergency', title: 'Emergency', icon: '🚨' },
];

export default function SetupScreen() {
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedTestMode, setSelectedTestMode] = useState<string | null>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<TestType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>('standard');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const onboardingData = await getSetting('onboarding');
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        
        if (parsed.selectedState) {
          const state = US_STATES.find(s => s.code === parsed.selectedState);
          if (state) setSelectedState(state);
        }
        
        if (parsed.selectedTestType) {
          const testType = getTestTypeById(parsed.selectedTestType);
          if (testType) {
            setSelectedLicenseType(testType);
            setSelectedTestCategory(testType.category);
          }
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const filteredTestTypes = TEST_TYPES.filter(t => t.category === selectedTestCategory);

  const handleStart = () => {
    if (!selectedState || !selectedTestMode || !selectedLicenseType) {
      alert('Please select state, test mode, and license type');
      return;
    }

    if (selectedTestMode === 'practice' && !selectedCategory) {
      alert('Please select a practice category');
      return;
    }

    if (selectedTestMode === 'full-test') {
      router.push(`/test/${selectedState.code}?licenseType=${selectedLicenseType.id}`);
    } else if (selectedTestMode === 'practice' && selectedCategory) {
      router.push(`/practice/${selectedCategory}?licenseType=${selectedLicenseType.id}`);
    }
  };

  const canStart = selectedState && selectedTestMode && selectedLicenseType && 
    (selectedTestMode === 'full-test' || selectedCategory);

  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Setup Test" />
      <ThemedView style={styles.content}>

      {/* State Selection */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>1. Select Your State</ThemedText>
        <TouchableOpacity
          style={[
            styles.dropdown,
            selectedState && styles.selectedItem
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
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {US_STATES.map((state) => (
              <TouchableOpacity
                key={state.code}
                style={styles.dropdownItem}
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

      {/* License Type Selection */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>2. Select License Type</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {TEST_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedTestCategory === cat.id && styles.selectedChip
              ]}
              onPress={() => {
                setSelectedTestCategory(cat.id);
                setSelectedLicenseType(null);
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.chipIcon}>{cat.icon}</ThemedText>
              <ThemedText style={styles.chipText}>{cat.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView style={styles.licenseTypesList} showsVerticalScrollIndicator={false}>
          {filteredTestTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.licenseTypeItem,
                selectedLicenseType?.id === type.id && styles.selectedItem
              ]}
              onPress={() => setSelectedLicenseType(type)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.licenseIcon}>{type.icon}</ThemedText>
              <ThemedView style={styles.licenseInfo}>
                <ThemedText type="defaultSemiBold">{type.name}</ThemedText>
                <ThemedText style={styles.description}>{type.description}</ThemedText>
                {type.requiresCDL && (
                  <ThemedText style={styles.cdlBadge}>Requires CDL</ThemedText>
                )}
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Test Mode Selection */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>3. Choose Test Mode</ThemedText>
        {TEST_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.testTypeItem,
              selectedTestMode === mode.id && styles.selectedItem
            ]}
            onPress={() => {
              setSelectedTestMode(mode.id);
              setSelectedCategory(null);
            }}
            activeOpacity={0.7}
          >
            <ThemedText type="defaultSemiBold">{mode.title}</ThemedText>
            <ThemedText style={styles.description}>{mode.description}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Category Selection (only for practice mode) */}
      {selectedTestMode === 'practice' && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>4. Select Category</ThemedText>
          <ThemedView style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedItem
                ]}
                onPress={() => setSelectedCategory(category.id as QuestionCategory)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      )}

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, !canStart && styles.disabledButton]}
        onPress={handleStart}
        disabled={!canStart}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.startButtonText}>
          Start {selectedTestMode === 'full-test' ? 'Test' : 'Practice'}
        </ThemedText>
      </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 8,
    gap: 4,
  },
  selectedChip: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  licenseTypesList: {
    maxHeight: 200,
  },
  licenseTypeItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  licenseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  licenseInfo: {
    flex: 1,
  },
  testTypeItem: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  cdlBadge: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedItem: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  startButton: {
    backgroundColor: '#16A34A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
