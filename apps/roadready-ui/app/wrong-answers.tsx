import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { Question } from '@/constants/types';
import { getWrongAnswers, removeWrongAnswer, clearWrongAnswers } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function WrongAnswersScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [items, setItems] = useState<Question[]>([]);

  const load = useCallback(async () => {
    const rows = await getWrongAnswers();
    setItems(rows as Question[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRemove = async (id: string) => {
    await removeWrongAnswer(id);
    await load();
  };

  const onClearAll = () => {
    Alert.alert('Clear all', 'Remove every saved missed question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearWrongAnswers();
          await load();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Question }) => (
    <ThemedView
      style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground, borderColor: Colors[currentScheme].border }]}
    >
      <ThemedText type="defaultSemiBold" style={styles.qText}>
        {item.question}
      </ThemedText>
      <ThemedText style={styles.meta}>
        {item.category} · {item.stateCode}
      </ThemedText>
      {item.explanation ? (
        <ThemedText style={styles.explain}>{item.explanation}</ThemedText>
      ) : null}
      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push(`/practice/${item.category}` as any)}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.secondaryBtnText}>Practice category</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void onRemove(item.id)} hitSlop={12}>
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <AppHeader title="Missed questions" showLogo={false} />
      {items.length > 0 ? (
        <TouchableOpacity style={styles.clearTop} onPress={onClearAll}>
          <ThemedText style={styles.clearText}>Clear all</ThemedText>
        </TouchableOpacity>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(q) => q.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Nothing here yet
            </ThemedText>
            <ThemedText style={styles.emptySub}>
              Questions you miss in practice or tests show up here for review.
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  clearTop: { alignSelf: 'flex-end', marginRight: 16, marginBottom: 4 },
  clearText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  qText: { marginBottom: 8 },
  meta: { fontSize: 12, opacity: 0.75, marginBottom: 8 },
  explain: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  secondaryBtnText: { color: '#166534', fontWeight: '600', fontSize: 14 },
  empty: { padding: 40, alignItems: 'center' },
  emptyTitle: { marginTop: 16, textAlign: 'center' },
  emptySub: { marginTop: 8, textAlign: 'center', opacity: 0.8 },
});
