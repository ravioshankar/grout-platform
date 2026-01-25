import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadReadyLogo } from '@/components/logo';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/utils/api-client';
import { activateProfile } from '@/utils/profile-sync';

interface Profile {
  id: number;
  profile_name: string;
  state: string;
  test_type: string;
  is_active: boolean;
}

export default function ProfileSelectionScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await apiClient.get<Profile[]>('/api/v1/onboarding-profiles/');
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: number) => {
    setActivating(profileId);
    try {
      await activateProfile(profileId);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to activate profile:', error);
    } finally {
      setActivating(null);
    }
  };

  const handleCreateNew = () => {
    router.push('/onboarding');
  };

  const handleDeleteProfile = (profileId: number, isActive: boolean) => {
    if (isActive) {
      Alert.alert('Cannot Delete', 'Cannot delete active profile');
      return;
    }
    Alert.alert('Delete Profile', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/v1/onboarding-profiles/${profileId}`);
            setProfiles(profiles.filter(p => p.id !== profileId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete profile');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <ThemedView style={styles.header}>
        <RoadReadyLogo size={80} />
        <ThemedText type="title" style={styles.title}>Welcome Back!</ThemedText>
        <ThemedText style={styles.subtitle}>Select a profile or create a new one</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {profiles.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Your Profiles</ThemedText>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  { backgroundColor: Colors[currentScheme].cardBackground },
                  profile.is_active && styles.activeProfile
                ]}
                onPress={() => handleSelectProfile(profile.id)}
                disabled={activating !== null}
                activeOpacity={0.7}
              >
                <ThemedView style={styles.profileInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.profileName}>
                    {profile.profile_name}
                  </ThemedText>
                  <ThemedText style={styles.profileDetails}>
                    {profile.state} • {profile.test_type}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.profileActions}>
                  {!profile.is_active && (
                    <TouchableOpacity onPress={() => handleDeleteProfile(profile.id, profile.is_active)}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                  {activating === profile.id ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : profile.is_active ? (
                    <ThemedView style={styles.activeBadge}>
                      <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
                    </ThemedView>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={Colors[currentScheme].icon} />
                  )}
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNew}
          disabled={activating !== null}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <ThemedText style={styles.createButtonText}>Create New Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeProfile: {
    borderColor: '#16A34A',
  },
  profileInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  profileName: {
    fontSize: 16,
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 13,
    opacity: 0.7,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  activeBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  createButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
