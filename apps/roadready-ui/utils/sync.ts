import { getTestResults, saveTestResult } from './storage';
import { apiClient } from './api-client';
import { TestResult } from '@/constants/types';
import { getSetting, saveSetting } from './database';

let isSyncing = false;

export async function syncTestRecords(): Promise<{ uploaded: number; downloaded: number; errors: string[] }> {
  if (isSyncing) {
    return { uploaded: 0, downloaded: 0, errors: ['Sync already in progress'] };
  }

  isSyncing = true;
  const result = { uploaded: 0, downloaded: 0, errors: [] as string[] };

  try {
    const authToken = await getSetting('auth_token');
    if (!authToken) {
      result.errors.push('Not authenticated');
      isSyncing = false;
      return result;
    }

    // Download from backend first
    try {
      const backendRecords = await apiClient.get<any[]>('/api/v1/test-records/');
      const lastSyncTime = await getSetting('last_sync_time');
      const lastSync = lastSyncTime ? parseInt(lastSyncTime) : 0;

      for (const record of backendRecords) {
        const recordTime = new Date(record.completed_at).getTime();
        if (recordTime > lastSync) {
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
          result.downloaded++;
        }
      }
    } catch (error: any) {
      result.errors.push(`Download failed: ${error.message}`);
    }

    // Upload local records to backend
    try {
      const localRecords = await getTestResults();
      const uploadedIds = await getSetting('uploaded_record_ids');
      const uploaded = uploadedIds ? JSON.parse(uploadedIds) : [];

      for (const record of localRecords) {
        if (!uploaded.includes(record.id) && !record.id.startsWith('backend_')) {
          try {
            await apiClient.post('/api/v1/test-records/', {
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
            uploaded.push(record.id);
            result.uploaded++;
          } catch (error: any) {
            result.errors.push(`Upload failed for ${record.id}: ${error.message}`);
          }
        }
      }

      await saveSetting('uploaded_record_ids', JSON.stringify(uploaded));
    } catch (error: any) {
      result.errors.push(`Upload failed: ${error.message}`);
    }

    await saveSetting('last_sync_time', Date.now().toString());
  } catch (error: any) {
    result.errors.push(`Sync failed: ${error.message}`);
  } finally {
    isSyncing = false;
  }

  return result;
}

export async function startAutoSync(intervalMinutes: number = 5) {
  await syncTestRecords();
  
  setInterval(async () => {
    const result = await syncTestRecords();
    if (result.errors.length > 0) {
      console.error('Auto-sync errors:', result.errors);
    }
  }, intervalMinutes * 60 * 1000);
}
