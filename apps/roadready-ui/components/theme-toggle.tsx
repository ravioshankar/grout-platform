import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const systemScheme = useColorScheme();
  
  const isDark = theme === 'dark' || (theme === 'auto' && systemScheme === 'dark');
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme} activeOpacity={0.7}>
      <ThemedView style={[styles.toggle, isDark && styles.toggleDark]}>
        <ThemedView style={[styles.slider, isDark && styles.sliderDark]}>
          <Ionicons 
            name={isDark ? 'moon' : 'sunny'} 
            size={16} 
            color={isDark ? '#FFF' : '#F59E0B'} 
          />
        </ThemedView>
      </ThemedView>
      <ThemedText style={styles.label}>
        {isDark ? 'Dark' : 'Light'} Mode
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleDark: {
    backgroundColor: '#374151',
  },
  slider: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderDark: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});