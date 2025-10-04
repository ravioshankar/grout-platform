import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { Question } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'dmv_bookmarked_questions';

export default function BookmarksScreen() {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (bookmarks) {
        try {
          setBookmarkedQuestions(JSON.parse(bookmarks));
        } catch (parseError) {
          console.error('Error parsing bookmarks JSON:', parseError);
          setBookmarkedQuestions([]);
        }
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const removeBookmark = async (questionId: string) => {
    try {
      const updatedBookmarks = bookmarkedQuestions.filter(q => q.id !== questionId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      setBookmarkedQuestions(updatedBookmarks);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const clearAllBookmarks = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure you want to remove all bookmarked questions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(BOOKMARKS_KEY);
              setBookmarkedQuestions([]);
            } catch (error) {
              console.error('Error clearing bookmarks:', error);
            }
          }
        }
      ]
    );
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <ThemedView style={styles.questionCard}>
      <ThemedView style={styles.questionHeader}>
        <ThemedText style={styles.categoryBadge}>{item.category}</ThemedText>
        <TouchableOpacity
          onPress={() => removeBookmark(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="bookmark" size={20} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedText type="defaultSemiBold" style={styles.question}>
        {item.question}
      </ThemedText>
      
      <ThemedView style={styles.optionsContainer}>
        {item.options.map((option, index) => (
          <ThemedView 
            key={index} 
            style={[
              styles.option,
              index === item.correctAnswer && styles.correctOption
            ]}
          >
            <ThemedText style={styles.optionText}>
              {String.fromCharCode(65 + index)}. {option}
            </ThemedText>
            {index === item.correctAnswer && (
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            )}
          </ThemedView>
        ))}
      </ThemedView>
      
      {item.explanation && (
        <ThemedView style={styles.explanationContainer}>
          <ThemedText style={styles.explanationTitle}>Explanation:</ThemedText>
          <ThemedText style={styles.explanationText}>{item.explanation}</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Bookmarks" />
      <ThemedView style={styles.content}>

      {bookmarkedQuestions.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllBookmarks}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
        </TouchableOpacity>
      )}

      {bookmarkedQuestions.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>No Bookmarks Yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Bookmark questions during practice to review them later
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={bookmarkedQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      </ThemedView>
    </ThemedView>
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 16,
    gap: 4,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  question: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#34C759',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  explanationContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  explanationTitle: {
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
});