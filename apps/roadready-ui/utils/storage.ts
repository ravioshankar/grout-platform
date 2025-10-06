import { TestResult } from '@/constants/types';
import { initDatabase, saveTestResult as dbSaveTestResult, getTestResults as dbGetTestResults, clearAllData } from './database';

let initialized = false;

const ensureInitialized = async () => {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
};

export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    await ensureInitialized();
    await dbSaveTestResult(result);
  } catch (error) {
    console.error('Error saving test result:', error);
  }
};

export const getTestResults = async (stateCode?: string): Promise<TestResult[]> => {
  try {
    await ensureInitialized();
    return await dbGetTestResults(stateCode);
  } catch (error) {
    console.error('Error getting test results:', error);
    return [];
  }
};

export const clearTestResults = async (): Promise<void> => {
  try {
    await ensureInitialized();
    await clearAllData();
  } catch (error) {
    console.error('Error clearing test results:', error);
  }
};