import { TestResult, QuestionCategory } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TestSubmission {
  id: string;
  userId?: string;
  deviceId: string;
  testResult: TestResult;
  metadata: TestMetadata;
  analytics: TestAnalytics;
  submittedAt: Date;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
}

export interface TestMetadata {
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: {
    model?: string;
    os?: string;
    screenSize?: string;
  };
  sessionId: string;
  testDuration: number;
  pauseCount: number;
  hintsUsed: number;
}

export interface TestAnalytics {
  questionTimings: number[];
  answerChanges: number[];
  difficultyRating?: number;
  userFeedback?: string;
  struggledQuestions: string[];
  confidenceScores: number[];
  categoryPerformance: CategoryPerformance[];
}

export interface CategoryPerformance {
  category: QuestionCategory;
  score: number;
  timeSpent: number;
  questionsCount: number;
  averageConfidence: number;
}

export interface DatabaseResponse {
  success: boolean;
  id?: string;
  error?: string;
  timestamp: Date;
}

const SUBMISSIONS_KEY = 'dmv_test_submissions';
const SYNC_CONFIG_KEY = 'dmv_sync_config';
const API_BASE_URL = 'https://your-api-endpoint.com/api';

interface SyncConfig {
  lastSyncTime: Date;
  syncInterval: number; // minutes
  autoSync: boolean;
}

export const submitTestResult = async (
  testResult: TestResult,
  metadata: TestMetadata,
  analytics: TestAnalytics
): Promise<DatabaseResponse> => {
  try {
    const submission: TestSubmission = {
      id: `submission_${Date.now()}`,
      deviceId: await getDeviceId(),
      testResult,
      metadata,
      analytics,
      submittedAt: new Date(),
      synced: false,
      syncAttempts: 0,
    };

    // Store locally
    const submissions = await getSubmissions();
    submissions.push(submission);
    await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

    // Try immediate sync
    await syncWithBackend();

    return {
      success: true,
      id: submission.id,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
};

export const getSubmissions = async (): Promise<TestSubmission[]> => {
  try {
    const data = await AsyncStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const syncWithBackend = async (): Promise<{ synced: number; failed: number }> => {
  try {
    const submissions = await getSubmissions();
    const unsyncedSubmissions = submissions.filter(s => !s.synced);
    
    let synced = 0;
    let failed = 0;

    for (const submission of unsyncedSubmissions) {
      try {
        const response = await fetch(`${API_BASE_URL}/test-results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
        });

        if (response.ok) {
          submission.synced = true;
          synced++;
        } else {
          submission.syncAttempts++;
          submission.lastSyncAttempt = new Date();
          failed++;
        }
      } catch (error) {
        submission.syncAttempts++;
        submission.lastSyncAttempt = new Date();
        failed++;
      }
    }

    // Update local storage
    await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    
    // Update sync config
    const syncConfig: SyncConfig = {
      lastSyncTime: new Date(),
      syncInterval: 30, // 30 minutes
      autoSync: true,
    };
    await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));

    return { synced, failed };
  } catch (error) {
    return { synced: 0, failed: 0 };
  }
};

export const getUnsyncedCount = async (): Promise<number> => {
  try {
    const submissions = await getSubmissions();
    return submissions.filter(s => !s.synced).length;
  } catch (error) {
    console.error('Error getting unsynced count:', error);
    return 0;
  }
};

export const clearSyncedData = async (): Promise<void> => {
  try {
    const submissions = await getSubmissions();
    const unsyncedSubmissions = submissions.filter(s => !s.synced);
    await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(unsyncedSubmissions));
  } catch (error) {
    console.error('Error clearing synced data:', error);
  }
};

export const initPeriodicSync = (): NodeJS.Timeout => {
  return setInterval(async () => {
    const config = await getSyncConfig();
    if (config.autoSync) {
      await syncWithBackend();
    }
  }, 30 * 60 * 1000); // 30 minutes
};

const getSyncConfig = async (): Promise<SyncConfig> => {
  try {
    const config = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
    if (config) {
      try {
        return JSON.parse(config);
      } catch (parseError) {
        console.error('Error parsing sync config:', parseError);
      }
    }
    return {
      lastSyncTime: new Date(0),
      syncInterval: 30,
      autoSync: true,
    };
  } catch (error) {
    console.error('Error loading sync config:', error);
    return {
      lastSyncTime: new Date(0),
      syncInterval: 30,
      autoSync: true,
    };
  }
};

const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    return `fallback_${Date.now()}`;
  }
};