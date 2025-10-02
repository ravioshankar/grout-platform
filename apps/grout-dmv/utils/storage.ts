import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestResult } from '@/constants/types';

const STORAGE_KEYS = {
  TEST_RESULTS: 'dmv_test_results',
};

export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    const existingResults = await getTestResults();
    const updatedResults = [...existingResults, result];
    await AsyncStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(updatedResults));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
};

export const getTestResults = async (): Promise<TestResult[]> => {
  try {
    const results = await AsyncStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error getting test results:', error);
    return [];
  }
};

export const clearTestResults = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TEST_RESULTS);
  } catch (error) {
    console.error('Error clearing test results:', error);
  }
};