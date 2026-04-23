import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { getSetting, saveSetting } from '@/utils/database';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { EXAM_TARGET_DATE_KEY, parseExamYmd } from '@/utils/exam-date';

export default function ExamSettingsScreen() {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const v = await getSetting(EXAM_TARGET_DATE_KEY);
      setSaved(v);
      if (v) setValue(v);
    })();
  }, []);

  const onSave = async () => {
    const dt = parseExamYmd(value);
    if (!dt) {
      return;
    }
    const iso = value.trim();
    await saveSetting(EXAM_TARGET_DATE_KEY, iso);
    setSaved(iso);
    router.back();
  };

  const onClear = async () => {
    const { deleteSetting } = await import('@/utils/database');
    await deleteSetting(EXAM_TARGET_DATE_KEY);
    setValue('');
    setSaved(null);
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[currentScheme].background }]}>
      <AppHeader title="Exam date" showLogo={false} />
      <ThemedView style={[styles.card, { backgroundColor: Colors[currentScheme].cardBackground }]}>
        <ThemedText style={styles.label}>Target exam date (YYYY-MM-DD)</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[currentScheme].background,
              color: Colors[currentScheme].text,
              borderColor: Colors[currentScheme].border,
            },
          ]}
          placeholder="2026-06-15"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {saved ? (
          <ThemedText style={styles.hint}>Saved: {saved}</ThemedText>
        ) : (
          <ThemedText style={styles.hint}>Shown on Home as a countdown when set.</ThemedText>
        )}
        <TouchableOpacity style={styles.primary} onPress={() => void onSave()} activeOpacity={0.8}>
          <ThemedText style={styles.primaryText}>Save</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => void onClear()} activeOpacity={0.8}>
          <ThemedText style={styles.secondaryText}>Clear exam date</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, padding: 20, borderRadius: 12 },
  label: { marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: { fontSize: 13, opacity: 0.75, marginBottom: 16 },
  primary: {
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondary: { padding: 12, alignItems: 'center' },
  secondaryText: { color: '#DC2626', fontWeight: '600' },
});
