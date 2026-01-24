import { apiClient } from './api-client';
import { saveSetting, getSetting } from './database';

export interface ActiveProfile {
  id: number;
  profile_name: string;
  state: string;
  test_type: string;
}

export async function syncActiveProfileToLocal(): Promise<void> {
  try {
    const response = await apiClient.get<any>('/api/v1/onboarding-profiles/active');
    
    if (response && response.profile === null) {
      await saveSetting('onboarding', JSON.stringify({ completed: false }));
      return;
    }
    
    const activeProfile = response.profile ? response : response;
    
    if (activeProfile && activeProfile.id) {
      const onboardingData = {
        completed: true,
        selectedState: activeProfile.state,
        selectedTestType: activeProfile.test_type,
        profileId: activeProfile.id,
        profileName: activeProfile.profile_name,
      };
      await saveSetting('onboarding', JSON.stringify(onboardingData));
    } else {
      await saveSetting('onboarding', JSON.stringify({ completed: false }));
    }
  } catch (error) {
    console.error('Failed to sync active profile:', error);
    throw error;
  }
}

export async function activateProfile(profileId: number): Promise<void> {
  try {
    await apiClient.post(`/api/v1/onboarding-profiles/${profileId}/activate`, {});
    await syncActiveProfileToLocal();
  } catch (error) {
    console.error('Failed to activate profile:', error);
    throw error;
  }
}

export async function getLocalProfile(): Promise<any | null> {
  try {
    const onboardingData = await getSetting('onboarding');
    return onboardingData ? JSON.parse(onboardingData) : null;
  } catch (error) {
    console.error('Failed to get local profile:', error);
    return null;
  }
}
