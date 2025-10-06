import { initIndexedDB, getAll, getOne, put, remove, clear } from './indexeddb';

let initialized = false;

export const initDatabase = async () => {
  try {
    await initIndexedDB();
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    initialized = true; // Mark as initialized to prevent blocking
  }
  return null;
};

export const getDatabase = () => {
  if (!initialized) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return null;
};

export const saveUserProfile = async (profile: { selectedState: string; selectedTestType: string; theme?: string }) => {
  const now = Date.now();
  const data = { ...profile, theme: profile.theme || 'auto', id: 1, created_at: now, updated_at: now };
  await put('user_profile', data);
};

export const updateUserTheme = async (theme: string) => {
  try {
    const profiles = await getAll<any>('user_profile');
    const now = Date.now();
    
    if (profiles.length > 0) {
      // Update existing profile
      const profile = profiles[profiles.length - 1];
      profile.theme = theme;
      profile.updated_at = now;
      await put('user_profile', profile);
    } else {
      // Create new profile with default values
      const newProfile = {
        id: 1,
        selectedState: 'CA',
        selectedTestType: 'class-c',
        theme,
        created_at: now,
        updated_at: now,
      };
      await put('user_profile', newProfile);
    }
  } catch (error) {
    console.error('Error updating user theme:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  const profiles = await getAll<any>('user_profile');
  if (profiles.length === 0) return null;
  const parsed = profiles[profiles.length - 1];
  return {
    id: parsed.id.toString(),
    selectedState: parsed.selectedState,
    selectedTestType: parsed.selectedTestType,
    theme: parsed.theme || 'auto',
    createdAt: new Date(parsed.created_at),
    updatedAt: new Date(parsed.updated_at),
  };
};

export const saveTestResult = async (result: any) => {
  await put('test_results', result);
};

export const getTestResults = async (stateCode?: string) => {
  const results = await getAll<any>('test_results');
  const filtered = stateCode ? results.filter(r => r.stateCode === stateCode) : results;
  return filtered.map((r: any) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
};

export const saveBookmark = async (question: any) => {
  await put('bookmarks', question);
};

export const getBookmarks = async () => {
  return await getAll<any>('bookmarks');
};

export const removeBookmark = async (questionId: string) => {
  await remove('bookmarks', questionId);
};

export const saveSetting = async (key: string, value: string) => {
  try {
    const now = Date.now();
    await put('settings', { key, value, updated_at: now });
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const result = await getOne<{ key: string; value: string }>('settings', key);
    return result?.value || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
};

export const getAllSettings = async (): Promise<Record<string, string>> => {
  try {
    const results = await getAll<{ key: string; value: string }>('settings');
    return results.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
};

export const runMigrations = async () => {
  try {
    // IndexedDB stores are created in initIndexedDB
    await initIndexedDB();
    console.log('Web migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Web migration error:', error);
    return false;
  }
};

export const clearAllData = async () => {
  await clear('user_profile');
  await clear('test_results');
  await clear('bookmarks');
  await clear('study_plan');
  await clear('settings');
};
