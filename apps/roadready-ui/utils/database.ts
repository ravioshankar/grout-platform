import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  try {
    if (db) return db;
    
    db = await SQLite.openDatabaseAsync('roadready.db');
    
    if (!db) {
      throw new Error('Failed to open database');
    }

    // Create all tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      selected_state TEXT NOT NULL,
      selected_test_type TEXT NOT NULL,
      theme TEXT DEFAULT 'auto',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      state_code TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      category TEXT NOT NULL,
      license_test_type TEXT,
      completed_at INTEGER NOT NULL,
      time_spent INTEGER NOT NULL,
      test_type TEXT NOT NULL,
      questions TEXT NOT NULL,
      user_answers TEXT NOT NULL,
      is_correct TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      category TEXT NOT NULL,
      state_code TEXT NOT NULL,
      explanation TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tasks TEXT NOT NULL,
      estimated_time INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      completed_tasks TEXT,
      updated_at INTEGER NOT NULL
    );
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    console.error('Database not initialized. Call initDatabase first.');
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const saveUserProfile = async (profile: { selectedState: string; selectedTestType: string; theme?: string }) => {
  try {
    const database = getDatabase();
    const now = Date.now();
    
    // Delete existing profile first
    await database.runAsync('DELETE FROM user_profile');
    
    await database.runAsync(
      'INSERT INTO user_profile (selected_state, selected_test_type, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [profile.selectedState, profile.selectedTestType, profile.theme || 'auto', now, now]
    );
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const updateUserTheme = async (theme: string) => {
  try {
    const database = getDatabase();
    const now = Date.now();
    
    // Check if profile exists
    const profile = await database.getFirstAsync<{ id: number }>('SELECT id FROM user_profile ORDER BY id DESC LIMIT 1');
    
    if (profile) {
      // Update existing profile
      await database.runAsync(
        'UPDATE user_profile SET theme = ?, updated_at = ? WHERE id = ?',
        [theme, now, profile.id]
      );
    } else {
      // Create new profile with default values
      await database.runAsync(
        'INSERT INTO user_profile (selected_state, selected_test_type, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        ['CA', 'class-c', theme, now, now]
      );
    }
  } catch (error) {
    console.error('Error updating user theme:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{
      id: number;
      selected_state: string;
      selected_test_type: string;
      theme: string;
      created_at: number;
      updated_at: number;
    }>('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1');
    
    return result ? {
      id: result.id.toString(),
      selectedState: result.selected_state,
      selectedTestType: result.selected_test_type,
      theme: result.theme || 'auto',
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    } : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const saveTestResult = async (result: any) => {
  try {
    const database = getDatabase();
    
    await database.runAsync(
      `INSERT INTO test_results (
        id, state_code, score, total_questions, correct_answers, category,
        license_test_type, completed_at, time_spent, test_type, questions,
        user_answers, is_correct
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.id,
        result.stateCode,
        result.score,
        result.totalQuestions,
        result.correctAnswers,
        result.category,
        result.licenseTestType || null,
        result.completedAt.getTime(),
        result.timeSpent,
        result.testType,
        JSON.stringify(result.questions),
        JSON.stringify(result.userAnswers),
        JSON.stringify(result.isCorrect),
      ]
    );
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

export const getTestResults = async (stateCode?: string) => {
  try {
    const database = getDatabase();
    let query = 'SELECT * FROM test_results';
    let params: any[] = [];
    
    if (stateCode) {
      query += ' WHERE state_code = ?';
      params.push(stateCode);
    }
    
    query += ' ORDER BY completed_at DESC';
    
    const results = await database.getAllAsync<any>(query, params);
    
    return results.map((r: any) => ({
      id: r.id,
      stateCode: r.state_code,
      score: r.score,
      totalQuestions: r.total_questions,
      correctAnswers: r.correct_answers,
      category: r.category,
      licenseTestType: r.license_test_type,
      completedAt: new Date(r.completed_at),
      timeSpent: r.time_spent,
      testType: r.test_type,
      questions: JSON.parse(r.questions),
      userAnswers: JSON.parse(r.user_answers),
      isCorrect: JSON.parse(r.is_correct),
    }));
  } catch (error) {
    console.error('Error getting test results:', error);
    return [];
  }
};

export const saveBookmark = async (question: any) => {
  const database = getDatabase();
  const now = Date.now();
  
  await database.runAsync(
    `INSERT OR REPLACE INTO bookmarks (
      id, question, options, correct_answer, category, state_code, explanation, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      question.id,
      question.question,
      JSON.stringify(question.options),
      question.correctAnswer,
      question.category,
      question.stateCode,
      question.explanation || null,
      now,
    ]
  );
};

export const getBookmarks = async () => {
  const database = getDatabase();
  const bookmarks = await database.getAllAsync<any>('SELECT * FROM bookmarks ORDER BY created_at DESC');
  
  return bookmarks.map((b: any) => ({
    id: b.id,
    question: b.question,
    options: JSON.parse(b.options),
    correctAnswer: b.correct_answer,
    category: b.category,
    stateCode: b.state_code,
    explanation: b.explanation,
  }));
};

export const removeBookmark = async (questionId: string) => {
  const database = getDatabase();
  await database.runAsync('DELETE FROM bookmarks WHERE id = ?', [questionId]);
};

export const saveSetting = async (key: string, value: string) => {
  try {
    const database = getDatabase();
    const now = Date.now();
    
    await database.runAsync(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
      [key, value, now]
    );
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return result?.value || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
};

export const getAllSettings = async (): Promise<Record<string, string>> => {
  try {
    const database = getDatabase();
    const results = await database.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM settings'
    );
    return results.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
};

export const runMigrations = async () => {
  try {
    const database = getDatabase();
    
    // Ensure settings table exists
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

export const clearAllData = async () => {
  const database = getDatabase();
  await database.execAsync(`
    DELETE FROM user_profile;
    DELETE FROM test_results;
    DELETE FROM bookmarks;
    DELETE FROM study_plan;
    DELETE FROM settings;
  `);
};
