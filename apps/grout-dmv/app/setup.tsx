import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { US_STATES } from '@/constants/states';
import { State, QuestionCategory } from '@/constants/types';

const TEST_TYPES = [
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
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const handleStart = () => {
    if (!selectedState || !selectedTestType) {
      alert('Please select a state and test type');
      return;
    }

    if (selectedTestType === 'practice' && !selectedCategory) {
      alert('Please select a practice category');
      return;
    }

    if (selectedTestType === 'full-test') {
      router.push(`/test/${selectedState.code}`);
    } else if (selectedTestType === 'practice' && selectedCategory) {
      router.push(`/practice/${selectedCategory}`);
    }
  };

  const canStart = selectedState && selectedTestType && 
    (selectedTestType === 'full-test' || selectedCategory);

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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <ThemedText>{state.name} ({state.code})</ThemedText>
                <ThemedText style={styles.passingScore}>Pass: {state.passingScore}%</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ThemedView>

      {/* Test Type Selection */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>2. Choose Test Type</ThemedText>
        {TEST_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.testTypeItem,
              selectedTestType === type.id && styles.selectedItem
            ]}
            onPress={() => {
              setSelectedTestType(type.id);
              setSelectedCategory(null); // Reset category when test type changes
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <ThemedText type="defaultSemiBold">{type.title}</ThemedText>
            <ThemedText style={styles.description}>{type.description}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Category Selection (only for practice mode) */}
      {selectedTestType === 'practice' && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>3. Select Category</ThemedText>
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
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ThemedText style={styles.startButtonText}>
          Start {selectedTestType === 'full-test' ? 'Test' : 'Practice'}
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
  testTypeItem: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
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