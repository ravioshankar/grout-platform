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

const API_BASE_URL = 'http://localhost:8000';

export default function ProfileScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  const stats = useMemo(() => {
    if (testResults.length === 0) return { totalTests: 0, averageScore: 0, bestScore: 0, testsPassedCount: 0 };
    const totalTests = testResults.length;
    const averageScore = Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / totalTests);
    const bestScore = Math.max(...testResults.map(r => r.score));
    const testsPassedCount = testResults.filter(r => r.score >= 70).length;
    return { totalTests, averageScore, bestScore, testsPassedCount };
  }, [testResults]);

  useEffect(() => {
    loadUserData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const authToken = await getSetting('auth_token');
      if (!authToken) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        await deleteSetting('auth_token');
        await deleteSetting('user_email');
        router.replace('/login');
        return;
      }

      const userData = await response.json();
      setUserEmail(userData.email || '');
      setUserName(userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.last_name || '');
      
      const avatar = await getSetting('user_avatar');
      setAvatarUri(avatar);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
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
    try {
      const authToken = await getSetting('auth_token');
      const names = userName.trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to save name:', error);
      Alert.alert('Error', 'Failed to save name');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await deleteSetting('auth_token');
            await deleteSetting('user_email');
            router.replace('/login');
          }
        }
      ]
    );
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

      {/* Profile Header */}
      <ThemedView style={[styles.profileHeader, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <ThemedView style={[styles.avatarPlaceholder, { backgroundColor: '#16A34A' }]}>
              <Ionicons name="person" size={40} color="white" />
            </ThemedView>
          )}
          <ThemedView style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </ThemedView>
        </TouchableOpacity>
        <ThemedView style={styles.profileInfo}>
          {isEditingName ? (
            <ThemedView style={styles.nameEditContainer}>
              <TextInput
                style={[styles.nameInput, { color: Colors[currentScheme].text, backgroundColor: Colors[currentScheme].background }]}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                <Ionicons name="checkmark" size={20} color="#16A34A" />
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} activeOpacity={0.7}>
              <ThemedView style={styles.nameContainer}>
                <ThemedText type="subtitle">{userName || 'Add your name'}</ThemedText>
                <Ionicons name="pencil" size={16} color="#999" style={styles.editIcon} />
              </ThemedView>
            </TouchableOpacity>
          )}
          <ThemedText style={styles.email}>{userEmail}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Stats Cards */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="document-text" size={24} color="#007AFF" />
          <ThemedText style={styles.statNumber}>{stats.totalTests}</ThemedText>
          <ThemedText style={styles.statLabel}>Tests Taken</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="trophy" size={24} color="#FF9500" />
          <ThemedText style={styles.statNumber}>{stats.bestScore}%</ThemedText>
          <ThemedText style={styles.statLabel}>Best Score</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="analytics" size={24} color="#34C759" />
          <ThemedText style={styles.statNumber}>{stats.averageScore}%</ThemedText>
          <ThemedText style={styles.statLabel}>Average Score</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="checkmark-circle" size={24} color="#30D158" />
          <ThemedText style={styles.statNumber}>{stats.testsPassedCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Tests Passed</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Recent Tests */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Tests</ThemedText>
        {testResults.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#999" />
            <ThemedText style={styles.emptyText}>No tests taken yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Start practicing to see your progress here</ThemedText>
          </ThemedView>
        ) : (
          testResults.slice(0, 5).map((result, index) => (
            <ThemedView key={result.id} style={[styles.testItem, { backgroundColor: Colors[currentScheme].cardBackground }]}>
              <ThemedView >
                <ThemedText type="defaultSemiBold">{result.testType === 'full-test' ? 'Full Test' : 'Practice'}</ThemedText>
                <ThemedText style={styles.testDetails}>
                  {result.stateCode} • {result.category} • {new Date(result.completedAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.scoreContainer}>
                <ThemedText style={[styles.score, { color: result.score >= 70 ? '#34C759' : '#FF3B30' }]}>
                  {result.score}%
                </ThemedText>
                <Ionicons 
                  name={result.score >= 70 ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={result.score >= 70 ? '#34C759' : '#FF3B30'} 
                />
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ThemedView>

      {/* Settings */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>
        
        <ThemedView style={[styles.settingItem, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="color-palette-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Theme</ThemedText>
          <ThemeToggle />
        </ThemedView>

        <TouchableOpacity 
          style={[styles.settingItem, styles.dangerItem, { backgroundColor: Colors[currentScheme].cardBackground }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <ThemedText style={[styles.settingText, { color: '#FF3B30' }]}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16A34A',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    padding: 8,
  },
  editIcon: {
    marginLeft: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testInfo: {
    flex: 1,
  },
  testDetails: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  dangerItem: {
    marginTop: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});