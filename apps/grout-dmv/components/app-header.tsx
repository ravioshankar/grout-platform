import { RoadReadyLogo } from '@/components/logo';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  showLogo?: boolean;
}

export function AppHeader({ title, showLogo = true }: AppHeaderProps) {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  
  return (
    <ThemedView style={[styles.header, { 
      backgroundColor: Colors[currentScheme].cardBackground,
      borderBottomColor: Colors[currentScheme].border
    }]}>
      {showLogo && (
        <ThemedView style={styles.logoContainer}>
          <RoadReadyLogo size={60} />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    height: 60,
    width: 60,
  },
  title: {
    marginTop: 8,
    color: '#b5b8bfff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});