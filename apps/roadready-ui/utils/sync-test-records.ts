import { getTestResults, saveTestResult } from './storage';
import { apiClient } from './api-client';
import { TestResult } from '@/constants/types';

interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

export async function syncTestRecordsToBackend(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };
  
  try {
    const localRecords = await getTestResults();
    
    for (const record of localRecords) {
      try {
        await apiClient.post('/test-records/', {
          state_code: record.stateCode,
          test_type: record.testType,
          category: record.category,
          score: record.score,
          total_questions: record.totalQuestions,
          correct_answers: record.correctAnswers,
          time_spent: record.timeSpent,
          questions: JSON.stringify(record.questions),
          user_answers: JSON.stringify(record.userAnswers),
          is_correct: JSON.stringify(record.isCorrect),
        });
        result.synced++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Failed to sync record ${record.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Failed to load local records: ${error.message}`);
  }
  
  return result;
}

export async function syncTestRecordsFromBackend(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };
  
  try {
    const backendRecords = await apiClient.get<any[]>('/test-records/');
    
    for (const record of backendRecords) {
      try {
        const testResult: TestResult = {
          id: `backend_${record.id}`,
          stateCode: record.state_code,
          score: record.score,
          totalQuestions: record.total_questions,
          correctAnswers: record.correct_answers,
          category: record.category,
          completedAt: new Date(record.completed_at),
          timeSpent: record.time_spent,
          questions: JSON.parse(record.questions),
          userAnswers: JSON.parse(record.user_answers),
          isCorrect: JSON.parse(record.is_correct),
          testType: record.test_type as 'full-test' | 'practice',
        };
        
        await saveTestResult(testResult);
        result.synced++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Failed to save record ${record.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Failed to fetch backend records: ${error.message}`);
  }
  
  return result;
}
