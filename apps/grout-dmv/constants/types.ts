export interface State {
  code: string;
  name: string;
  passingScore: number;
}

export interface Question {
  id: string;
  stateCode: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  imageUrl?: string;
}

export type QuestionCategory = 
  | 'road-signs'
  | 'traffic-laws'
  | 'safe-driving'
  | 'parking'
  | 'right-of-way'
  | 'emergency';

export interface TestResult {
  id: string;
  stateCode: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  category: QuestionCategory;
  completedAt: Date;
  timeSpent: number;
  questions: Question[];
  userAnswers: (number | null)[];
  isCorrect: boolean[];
  testType: 'full-test' | 'practice';
}

export interface UserProgress {
  stateCode: string;
  totalTests: number;
  averageScore: number;
  weakAreas: QuestionCategory[];
  lastTestDate: Date;
}