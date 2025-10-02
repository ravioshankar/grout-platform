import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DMVLogo } from '@/components/dmv-logo';
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
      <ThemedView style={styles.header}>
        <DMVLogo size={50} />
        <ThemedText type="title" style={styles.title}>Get Started</ThemedText>
      </ThemedView>

      {/* State Selection */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>1. Select Your State</ThemedText>
        <TouchableOpacity
          style={[
            styles.dropdown,
            selectedState && styles.selectedItem
          ]}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
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
      >
        <ThemedText style={styles.startButtonText}>
          Start {selectedTestType === 'full-test' ? 'Test' : 'Practice'}
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginTop: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  dropdown: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#666',
  },
  dropdownList: {
    maxHeight: 200,
    backgroundColor: '#fff',
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
    color: '#666',
  },
  testTypeItem: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  description: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#f5f5f5',
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
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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