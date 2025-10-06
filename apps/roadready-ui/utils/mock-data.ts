import { saveTestResult } from './storage';
import { getRandomQuestions } from '@/constants/questions';
import { TestResult, QuestionCategory } from '@/constants/types';

const categories: QuestionCategory[] = ['road-signs', 'traffic-laws', 'safe-driving', 'parking', 'right-of-way', 'emergency'];

export const insertMockData = async () => {
  const mockResults: TestResult[] = [];
  
  // Generate 10 mock test results
  for (let i = 0; i < 10; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const questions = getRandomQuestions('CA', 10);
    const correctAnswers = Math.floor(Math.random() * 5) + 5; // 5-10 correct
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    const userAnswers = questions.map(() => Math.floor(Math.random() * 4));
    const isCorrect = userAnswers.map((_, idx) => idx < correctAnswers);
    
    const daysAgo = Math.floor(Math.random() * 30);
    const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const result: TestResult = {
      id: `mock_${Date.now()}_${i}`,
      stateCode: 'CA',
      score,
      totalQuestions: questions.length,
      correctAnswers,
      category,
      completedAt,
      timeSpent: Math.floor(Math.random() * 600) + 300,
      questions,
      userAnswers,
      isCorrect,
      testType: Math.random() > 0.5 ? 'full-test' : 'practice',
    };
    
    mockResults.push(result);
  }
  
  // Save all mock results
  for (const result of mockResults) {
    await saveTestResult(result);
  }
  
  return mockResults.length;
};
