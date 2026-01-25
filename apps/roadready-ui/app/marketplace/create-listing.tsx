import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { apiClient } from '@/utils/api-client';
import { useThemedAlert } from '@/hooks/use-themed-alert';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplace-categories';

const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

export default function CreateListingScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showAlert } = useThemedAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(MARKETPLACE_CATEGORIES[1].name); // Default to first non-All category
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState(conditions[0]);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (price && isNaN(parseFloat(price))) newErrors.price = 'Invalid price';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showAlert('Error', 'Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const listing = await apiClient.post('/api/v1/marketplace/listings', {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price) || 0,
        condition,
        location: location.trim(),
      });
      router.replace(`/marketplace/community-listing/${listing.id}` as any);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Listing</ThemedText>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <ThemedText style={[styles.postButton, { color: colors.tint }, submitting && { opacity: 0.5 }]}>Post</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Title *</ThemedText>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: colors.cardBackground, color: colors.text, borderColor: errors.title ? '#DC2626' : colors.border }
            ]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder="What are you selling?"
            placeholderTextColor={colors.icon}
            maxLength={100}
          />
          {errors.title && <ThemedText style={styles.errorText}>{errors.title}</ThemedText>}
          <ThemedText style={[styles.charCount, { color: colors.icon }]}>{title.length}/100</ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Description *</ThemedText>
          <TextInput
            style={[
              styles.textArea, 
              { backgroundColor: colors.cardBackground, color: colors.text, borderColor: errors.description ? '#DC2626' : colors.border }
            ]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            placeholder="Describe your item in detail"
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          {errors.description && <ThemedText style={styles.errorText}>{errors.description}</ThemedText>}
          <ThemedText style={[styles.charCount, { color: colors.icon }]}>{description.length}/500</ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Category *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {MARKETPLACE_CATEGORIES.filter(cat => cat.name !== 'All').map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.chip,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  category === cat.name && { backgroundColor: colors.tint, borderColor: colors.tint },
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <ThemedText style={[styles.chipText, { color: category === cat.name ? '#fff' : colors.text }]}>
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Price ($ or Free) *</ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceSymbol}>$</ThemedText>
            <TextInput
              style={[
                styles.priceInput, 
                { backgroundColor: colors.cardBackground, color: colors.text, borderColor: errors.price ? '#DC2626' : colors.border }
              ]}
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
              placeholder="0.00 (or leave empty for free)"
              placeholderTextColor={colors.icon}
              keyboardType="decimal-pad"
            />
          </View>
          {errors.price && <ThemedText style={styles.errorText}>{errors.price}</ThemedText>}
          <ThemedText style={[styles.hint, { color: colors.icon }]}>Leave empty or enter 0 for free items</ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Condition *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {conditions.map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.chip,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  condition === cond && { backgroundColor: colors.tint, borderColor: colors.tint },
                ]}
                onPress={() => setCondition(cond)}
              >
                <ThemedText style={[styles.chipText, { color: condition === cond ? '#fff' : colors.text }]}>
                  {cond}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Location *</ThemedText>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: colors.cardBackground, color: colors.text, borderColor: errors.location ? '#DC2626' : colors.border }
            ]}
            value={location}
            onChangeText={(text) => {
              setLocation(text);
              if (errors.location) setErrors({ ...errors, location: '' });
            }}
            placeholder="City, State (e.g., San Francisco, CA)"
            placeholderTextColor={colors.icon}
          />
          {errors.location && <ThemedText style={styles.errorText}>{errors.location}</ThemedText>}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={20} color={colors.tint} />
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            Your email will be shared with interested buyers. Transactions happen outside the app.
          </ThemedText>
        </View>
      </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
