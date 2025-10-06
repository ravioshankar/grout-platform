import { initDatabase, saveUserProfile, getUserProfile, clearAllData } from './database';

export interface UserProfile {
  id: string;
  selectedState: string;
  selectedTestType: string;
  createdAt: Date;
  updatedAt: Date;
}

let initialized = false;

const ensureInitialized = async () => {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
};

export const db = {
  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await ensureInitialized();
      await saveUserProfile(profile);
    } catch (error) {
      console.error('Failed to save user profile to database:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      await ensureInitialized();
      return await getUserProfile();
    } catch (error) {
      console.error('Failed to get user profile from database:', error);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await ensureInitialized();
      await clearAllData();
    } catch (error) {
      console.error('Failed to clear database:', error);
    }
  },
};
