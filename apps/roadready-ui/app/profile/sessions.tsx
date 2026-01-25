import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/utils/api-client';

export default function SessionsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await apiClient.get('/api/v1/sessions/');
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleRevoke = (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      Alert.alert('Cannot Revoke', 'You cannot revoke your current session');
      return;
    }

    Alert.alert(
      'Revoke Session',
      'Are you sure you want to logout this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/v1/sessions/${sessionId}`);
              setSessions(sessions.filter(s => s.session_id !== sessionId));
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke session');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
    
      
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />}
      >
        <ThemedView style={styles.content} backgroundColor="transparent">
        <ThemedText style={styles.description}>
          Manage devices where you're logged in. Revoke access to any suspicious sessions.
        </ThemedText>

        {sessions.length === 0 ? (
          <ThemedView style={styles.center}>
            <Ionicons name="phone-portrait-outline" size={64} color="#999" />
            <ThemedText style={styles.emptyText}>No active sessions</ThemedText>
          </ThemedView>
        ) : (
          sessions.map((session) => (
            <ThemedView 
              key={session.session_id} 
              style={[styles.sessionCard, { backgroundColor: Colors[currentScheme].cardBackground }]}
            >
              <ThemedView style={styles.sessionHeader}>
                <Ionicons 
                  name={session.user_agent?.includes('Mobile') ? 'phone-portrait' : 'desktop'} 
                  size={32} 
                  color={session.is_current ? '#16A34A' : '#007AFF'} 
                />
                <ThemedView style={styles.sessionInfo}>
                  <ThemedText style={styles.sessionDevice}>
                    {session.user_agent || 'Unknown Device'}
                    {session.is_current && <ThemedText style={styles.currentBadge}> (Current)</ThemedText>}
                  </ThemedText>
                  <ThemedText style={styles.sessionDetail}>
                    <Ionicons name="location" size={12} /> {session.ip_address || 'Unknown IP'}
                  </ThemedText>
                  <ThemedText style={styles.sessionDetail}>
                    <Ionicons name="time" size={12} /> Last active: {new Date(session.last_activity).toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.sessionDetail}>
                    <Ionicons name="calendar" size={12} /> Expires: {new Date(session.expires_at).toLocaleString()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {!session.is_current && (
                <TouchableOpacity 
                  style={styles.revokeButton}
                  onPress={() => handleRevoke(session.session_id, session.is_current)}
                >
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                  <ThemedText style={styles.revokeText}>Revoke</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          ))
        )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 32 },
  headerTitle: { fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 32, backgroundColor: 'transparent' },
  scrollContent: { flex: 1 },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 40, backgroundColor: 'transparent' },
  description: { fontSize: 14, opacity: 0.7, marginBottom: 8 },
  sessionCard: { padding: 16, borderRadius: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  sessionHeader: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  sessionInfo: { flex: 1, gap: 6, backgroundColor: 'transparent' },
  sessionDevice: { fontSize: 16, fontWeight: '600' },
  currentBadge: { color: '#16A34A', fontSize: 14, fontWeight: '700' },
  sessionDetail: { fontSize: 13, opacity: 0.7 },
  revokeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, marginTop: 4 },
  revokeText: { color: '#DC2626', fontWeight: '600' },
  emptyText: { fontSize: 16, opacity: 0.7 },
});
