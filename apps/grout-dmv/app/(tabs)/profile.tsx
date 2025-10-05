import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { getTestResults, clearTestResults } from '@/utils/storage';
import { TestResult } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from '@/utils/sync-service';
import { useTheme } from '@/contexts/theme-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    testsPassedCount: 0
  });
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const { theme, setTheme, isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    loadUserData();
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    const count = await syncService.getUnsyncedCount();
    setUnsyncedCount(count);
  };

  const handleManualSync = async () => {
    const result = await syncService.performSync();
    await loadSyncStatus();
    Alert.alert('Sync Complete', `${result.synced} items synced, ${result.failed} failed`);
  };

  const loadUserData = async () => {
    const results = await getTestResults();
    setTestResults(results);
    
    if (results.length > 0) {
      const totalTests = results.length;
      const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests);
      const bestScore = Math.max(...results.map(r => r.score));
      const testsPassedCount = results.filter(r => r.score >= 70).length;
      
      setStats({ totalTests, averageScore, bestScore, testsPassedCount });
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your test results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearTestResults();
            setTestResults([]);
            setStats({ totalTests: 0, averageScore: 0, bestScore: 0, testsPassedCount: 0 });
          }
        }
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'Auto', onPress: () => setTheme('auto') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getThemeDisplayText = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Auto';
      default: return 'Auto';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <AppHeader title="My Profile" />
      <ThemedView style={styles.content}>

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
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: Colors[currentScheme].cardBackground }]}
          onPress={() => router.push('/progress')}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="analytics-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Learning Progress</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: Colors[currentScheme].cardBackground }]}
          onPress={() => router.push('/bookmarks')}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="bookmark-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Bookmarked Questions</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <ThemedView style={[styles.settingItem, { backgroundColor: Colors[currentScheme].cardBackground }]}>
          <Ionicons name="color-palette-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Theme</ThemedText>
          <ThemeToggle />
        </ThemedView>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleThemeChange}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Advanced Theme</ThemedText>
          <ThemedText style={styles.themeValue}>{getThemeDisplayText()}</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Notifications</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Help & Support</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/privacy-policy')}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Privacy Policy</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleManualSync}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="sync-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>Sync Data</ThemedText>
          {unsyncedCount > 0 && (
            <ThemedView style={styles.badge}>
              <ThemedText style={styles.badgeText}>{unsyncedCount}</ThemedText>
            </ThemedView>
          )}
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.settingText}>About</ThemedText>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {testResults.length > 0 && (
          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleClearData}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            <ThemedText style={[styles.settingText, { color: '#FF3B30' }]}>Clear All Data</ThemedText>
          </TouchableOpacity>
        )}
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
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  themeValue: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 8,
  },
});