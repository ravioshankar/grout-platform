import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { US_STATES } from '@/constants/states';
import { State } from '@/constants/types';
import { DMVLogo } from '@/components/dmv-logo';

export default function StatesScreen() {
  const handleStateSelect = (state: State) => {
    router.push(`/test/${state.code}`);
  };

  const renderState = ({ item }: { item: State }) => (
    <TouchableOpacity
      style={styles.stateItem}
      onPress={() => handleStateSelect(item)}
    >
      <ThemedView style={styles.stateContent}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.stateCode}>{item.code}</ThemedText>
        <ThemedText style={styles.passingScore}>
          Passing: {item.passingScore}%
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <DMVLogo size={40} />
      </ThemedView>
      <ThemedText type="title" style={styles.title}>
        Select Your State
      </ThemedText>
      <FlatList
        data={US_STATES}
        renderItem={renderState}
        keyExtractor={(item) => item.code}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  stateItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stateContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  stateCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  passingScore: {
    fontSize: 14,
    color: '#888',
  },
});