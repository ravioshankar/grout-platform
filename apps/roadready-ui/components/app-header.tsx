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
      backgroundColor: isDark ? '#111827' : '#FFF',
      borderBottomColor: isDark ? '#1F2937' : '#E5E7EB'
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
  header: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, borderBottomWidth: 1 },
  logoContainer: { height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
});