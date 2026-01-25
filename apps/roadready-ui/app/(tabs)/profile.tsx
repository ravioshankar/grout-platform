import { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { getTestResults, clearTestResults } from '@/utils/storage';
import { getUserProfile, getSetting, saveSetting, deleteSetting } from '@/utils/database';
import { TestResult } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from '@/utils/sync-service';
import { useTheme } from '@/contexts/theme-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { insertMockData } from '@/utils/mock-data';
import { runMigrations } from '@/utils/database';
import Constants from 'expo-constants';
import { apiClient } from '@/utils/api-client';

export default function ProfileScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userState, setUserState] = useState('');
  const [userTestType, setUserTestType] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [lastLogin, setLastLogin] = useState<string>('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  const stats = useMemo(() => {
    if (testResults.length === 0) return { 
      totalTests: 0, 
      averageScore: 0, 
      bestScore: 0, 
      testsPassedCount: 0,
      totalStudyTime: 0,
      passRate: 0,
      avgTimePerTest: 0,
      favoriteCategory: 'None'
    };
    const totalTests = testResults.length;
    const averageScore = Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / totalTests);
    const bestScore = Math.max(...testResults.map(r => r.score));
    const testsPassedCount = testResults.filter(r => r.score >= 70).length;
    const totalStudyTime = Math.round(testResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / 60);
    const passRate = Math.round((testsPassedCount / totalTests) * 100);
    const avgTimePerTest = totalTests > 0 ? Math.round(testResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalTests / 60) : 0;
    
    const categoryCount: Record<string, number> = {};
    testResults.forEach(r => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    const favoriteCategory = Object.keys(categoryCount).length > 0 
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'None';
    
    return { totalTests, averageScore, bestScore, testsPassedCount, totalStudyTime, passRate, avgTimePerTest, favoriteCategory };
  }, [testResults]);

  useEffect(() => {
    loadUserData();
    loadUserProfile();
    loadProfiles();
  }, []);

  const loadUserProfile = async () => {
    try {
      const authToken = await getSetting('auth_token');
      if (!authToken) {
        router.replace('/login');
        return;
      }

      const userData = await apiClient.get<any>('/api/v1/auth/me');
      setUserEmail(userData.email || '');
      setUserName(userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.last_name || '');
      setUserState(userData.state || '');
      setUserTestType(userData.test_type || '');
      
      const avatar = await getSetting('user_avatar');
      setAvatarUri(avatar);
      
      const completion = calculateProfileCompletion(userData, avatar);
      setProfileCompletion(completion);
      
      const lastLoginTime = await getSetting('last_login');
      if (lastLoginTime) {
        setLastLogin(new Date(lastLoginTime).toLocaleString());
      }
      await saveSetting('last_login', new Date().toISOString());
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const profilesData = await apiClient.get<any[]>('/api/v1/onboarding-profiles/');
      setProfiles(profilesData);
      const active = profilesData.find(p => p.is_active);
      setActiveProfile(active);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const handleSwitchProfile = async (profileId: number) => {
    try {
      await apiClient.post(`/api/v1/onboarding-profiles/${profileId}/activate`, {});
      const { syncActiveProfileToLocal } = await import('@/utils/profile-sync');
      await syncActiveProfileToLocal();
      await loadProfiles();
      await loadUserProfile();
      setShowProfileSwitcher(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch profile');
    }
  };

  const calculateProfileCompletion = (userData: any, avatar: string | null) => {
    let completed = 0;
    const fields = [
      userData.email,
      userData.first_name,
      userData.last_name,
      userData.state,
      userData.test_type,
      avatar
    ];
    fields.forEach(field => { if (field) completed++; });
    return Math.round((completed / fields.length) * 100);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      await saveSetting('user_avatar', result.assets[0].uri);
    }
  };

  const handleSaveName = async () => {
    if (isSavingName) return;
    
    setIsSavingName(true);
    try {
      const names = userName.trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      await apiClient.patch('/api/v1/auth/me', {
        first_name: firstName,
        last_name: lastName,
      });
      
      setIsEditingName(false);
      await loadUserProfile();
    } catch (error: any) {
      console.error('Failed to save name:', error);
      Alert.alert('Error', error.message || 'Failed to save name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout', {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await deleteSetting('auth_token');
      await deleteSetting('refresh_token');
      await deleteSetting('user_email');
      router.replace('/login');
    }
  };

  const loadUserData = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      const stateCode = profile?.selectedState;
      const results = await getTestResults(stateCode);
      setTestResults(results);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    await loadUserProfile();
    setRefreshing(false);
  }, [loadUserData]);



  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />
      }
    >
      <AppHeader title="My Profile" />
      <ThemedView style={styles.content}>

      {/* Profile Hero */}
      <ThemedView style={[styles.profileHero, { backgroundColor: '#16A34A' }]}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <ThemedView style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#16A34A" />
            </ThemedView>
          )}
          <ThemedView style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </ThemedView>
        </TouchableOpacity>
        
        {isEditingName ? (
          <ThemedView style={styles.nameEditContainer}>
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveName} style={styles.saveButton} disabled={isSavingName}>
              {isSavingName ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)} activeOpacity={0.7}>
            <ThemedView style={styles.heroNameContainer}>
              <ThemedText style={styles.heroName}>{userName || 'Add your name'}</ThemedText>
              <Ionicons name="pencil" size={18} color="rgba(255,255,255,0.8)" />
            </ThemedView>
          </TouchableOpacity>
        )}
        
        <ThemedText style={styles.heroEmail}>{userEmail}</ThemedText>
        
        <ThemedView style={styles.heroMetrics}>
          <ThemedView style={styles.heroMetricItem}>
            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            <ThemedText style={styles.heroMetricText}>{profileCompletion}% Complete</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Profile Switcher */}
      {profiles.length > 1 && activeProfile && (
        <ThemedView style={[styles.profileSwitcher, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <TouchableOpacity 
            style={styles.switcherButton}
            onPress={() => setShowProfileSwitcher(!showProfileSwitcher)}
            activeOpacity={0.7}
          >
            <ThemedView style={styles.switcherContent}>
              <Ionicons name="swap-horizontal" size={20} color="#16A34A" />
              <ThemedView style={styles.switcherText}>
                <ThemedText style={styles.switcherLabel}>Active Profile</ThemedText>
                <ThemedText type="defaultSemiBold">{activeProfile.profile_name}</ThemedText>
              </ThemedView>
            </ThemedView>
            <Ionicons name={showProfileSwitcher ? "chevron-up" : "chevron-down"} size={20} color={Colors[currentScheme].icon} />
          </TouchableOpacity>
          {showProfileSwitcher && (
            <ThemedView style={styles.profileList}>
              {profiles.map(profile => (
                <TouchableOpacity
                  key={profile.id}
                  style={[styles.profileOption, profile.is_active && styles.activeProfileOption]}
                  onPress={() => handleSwitchProfile(profile.id)}
                  disabled={profile.is_active}
                >
                  <ThemedText style={styles.profileOptionText}>{profile.profile_name}</ThemedText>
                  {profile.is_active && <Ionicons name="checkmark" size={20} color="#16A34A" />}
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      )}

      {/* Profile Details */}
      <ThemedView style={[styles.detailsCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedView style={styles.detailsHeader}>
          <ThemedText type="subtitle">Profile Details</ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile/edit-profile')} activeOpacity={0.7}>
            <Ionicons name="pencil" size={20} color="#16A34A" />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={styles.detailsRow}>
          <ThemedView style={styles.detailItemHorizontal}>
            <ThemedView style={[styles.detailIconBadge, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="location" size={20} color="#FF9500" />
            </ThemedView>
            <ThemedView style={styles.detailContentHorizontal}>
              <ThemedText style={styles.detailLabel}>State</ThemedText>
              <ThemedText style={styles.detailValue}>{userState || 'Not set'}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.detailItemHorizontal}>
            <ThemedView style={[styles.detailIconBadge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="car-sport" size={20} color="#16A34A" />
            </ThemedView>
            <ThemedView style={styles.detailContentHorizontal}>
              <ThemedText style={styles.detailLabel}>Test Type</ThemedText>
              <ThemedText style={styles.detailValue}>{userTestType || 'Not set'}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.detailsRow}>
          <ThemedView style={styles.detailItemHorizontal}>
            <ThemedView style={[styles.detailIconBadge, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="mail" size={20} color="#007AFF" />
            </ThemedView>
            <ThemedView style={styles.detailContentHorizontal}>
              <ThemedText style={styles.detailLabel}>Email</ThemedText>
              <ThemedText style={styles.detailValue}>{userEmail || 'Not set'}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          {lastLogin && (
            <ThemedView style={styles.detailItemHorizontal}>
              <ThemedView style={[styles.detailIconBadge, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="time" size={20} color="#E91E63" />
              </ThemedView>
              <ThemedView style={styles.detailContentHorizontal}>
                <ThemedText style={styles.detailLabel}>Last Login</ThemedText>
                <ThemedText style={styles.detailValue}>{lastLogin}</ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Quick Stats Grid */}
      <ThemedView style={[styles.quickStatsCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedView style={styles.quickStatsRow}>
          <ThemedView style={styles.quickStatItem}>
            <ThemedView style={[styles.quickStatIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="document-text" size={20} color="#007AFF" />
            </ThemedView>
            <ThemedText style={styles.quickStatValue}>{stats.totalTests}</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Tests</ThemedText>
          </ThemedView>
          <ThemedView style={styles.quickStatItem}>
            <ThemedView style={[styles.quickStatIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="trophy" size={20} color="#FF9500" />
            </ThemedView>
            <ThemedText style={styles.quickStatValue}>{stats.bestScore}%</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Best</ThemedText>
          </ThemedView>
          <ThemedView style={styles.quickStatItem}>
            <ThemedView style={[styles.quickStatIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="analytics" size={20} color="#34C759" />
            </ThemedView>
            <ThemedText style={styles.quickStatValue}>{stats.passRate}%</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Pass Rate</ThemedText>
          </ThemedView>
          <ThemedView style={styles.quickStatItem}>
            <ThemedView style={[styles.quickStatIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="time" size={20} color="#007AFF" />
            </ThemedView>
            <ThemedText style={styles.quickStatValue}>{stats.totalStudyTime}m</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Study</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Recent Tests */}
      {testResults.length > 0 && (
        <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText type="subtitle">Recent Tests</ThemedText>
            <TouchableOpacity onPress={() => router.push('/statistics')}>
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          {testResults.slice(0, 3).map((result) => (
            <ThemedView key={result.id} style={styles.recentTestItem}>
              <ThemedView style={[styles.testIconBadge, { backgroundColor: result.score >= 70 ? '#E8F5E9' : '#FFEBEE' }]}>
                <Ionicons 
                  name={result.score >= 70 ? "checkmark" : "close"} 
                  size={20} 
                  color={result.score >= 70 ? '#34C759' : '#FF3B30'} 
                />
              </ThemedView>
              <ThemedView style={styles.recentTestInfo}>
                <ThemedText style={styles.recentTestTitle}>{result.testType === 'full-test' ? 'Full Test' : 'Practice'}</ThemedText>
                <ThemedText style={styles.recentTestMeta}>
                  {result.category} • {new Date(result.completedAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
              <ThemedText style={[styles.recentTestScore, { color: result.score >= 70 ? '#34C759' : '#FF3B30' }]}>
                {result.score}%
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {/* Quick Actions */}
      <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile/statistics')}
            activeOpacity={0.7}
          >
            <ThemedView style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="analytics" size={24} color="#16A34A" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Statistics</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile/edit-profile')}
            activeOpacity={0.7}
          >
            <ThemedView style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="person" size={24} color="#007AFF" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Edit Profile</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile/sessions')}
            activeOpacity={0.7}
          >
            <ThemedView style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="phone-portrait" size={24} color="#FF9500" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Sessions</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile/change-password')}
            activeOpacity={0.7}
          >
            <ThemedView style={[styles.actionIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="lock-closed" size={24} color="#E91E63" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Password</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Settings */}
      <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Settings</ThemedText>
        
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingLeft}>
            <ThemedView style={[styles.settingIconBadge, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="color-palette" size={20} color="#007AFF" />
            </ThemedView>
            <ThemedText style={styles.settingLabel}>Theme</ThemedText>
          </ThemedView>
          <ThemeToggle />
        </ThemedView>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={20} color="#FFF" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, opacity: 0.7 },
  
  profileHero: { padding: 24, alignItems: 'center', gap: 12, marginBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatarContainer: { marginBottom: 8, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  heroNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' },
  heroName: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  heroEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  heroMetrics: { flexDirection: 'row', gap: 16, marginTop: 4, backgroundColor: 'transparent' },
  heroMetricItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  heroMetricText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  nameEditContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' },
  nameInput: { fontSize: 20, fontWeight: '600', color: '#FFF', padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', minWidth: 200, textAlign: 'center' },
  saveButton: { padding: 8 },
  
  card: { marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 16, gap: 16 },
  cardTitle: { marginBottom: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  viewAllText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  
  detailsCard: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, gap: 12 },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: 'transparent' },
  detailsRow: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  detailItemHorizontal: { flex: 1, alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.02)' },
  detailContentHorizontal: { alignItems: 'center', backgroundColor: 'transparent' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'transparent' },
  detailIconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailContent: { flex: 1, backgroundColor: 'transparent' },
  detailLabel: { fontSize: 12, opacity: 0.6, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  
  quickStatsCard: { marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 16 },
  quickStatsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'transparent' },
  quickStatItem: { alignItems: 'center', gap: 8, flex: 1, backgroundColor: 'transparent' },
  quickStatIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  quickStatValue: { fontSize: 20, fontWeight: 'bold' },
  quickStatLabel: { fontSize: 11, opacity: 0.7 },
  
  recentTestItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: 'transparent' },
  testIconBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  recentTestInfo: { flex: 1, backgroundColor: 'transparent' },
  recentTestTitle: { fontSize: 15, fontWeight: '600' },
  recentTestMeta: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  recentTestScore: { fontSize: 18, fontWeight: 'bold' },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, backgroundColor: 'transparent' },
  actionButton: { width: '48%', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.02)' },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '600' },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, backgroundColor: 'transparent' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' },
  settingIconBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF3B30', padding: 16, borderRadius: 12, marginTop: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  sectionTitle: { marginBottom: 0 },
  
  profileSwitcher: { marginHorizontal: 16, marginTop: 16, marginBottom: 16, borderRadius: 16 },
  switcherButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  switcherContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, backgroundColor: 'transparent' },
  switcherText: { flex: 1, backgroundColor: 'transparent' },
  switcherLabel: { fontSize: 12, opacity: 0.6 },
  profileList: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', backgroundColor: 'transparent' },
  profileOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  activeProfileOption: { opacity: 0.5 },
  profileOptionText: { fontSize: 14 },
});
