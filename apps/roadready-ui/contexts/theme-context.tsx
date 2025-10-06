import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Animated } from 'react-native';
import { initDatabase, saveSetting, getSetting } from '@/utils/database';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [themeTransition] = useState(new Animated.Value(0));
  const systemScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'auto' && systemScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      await initDatabase();
      const savedTheme = await getSetting('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      // Smooth transition animation
      Animated.timing(themeTransition, {
        toValue: isDark ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setThemeState(newTheme);
      await saveSetting('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      <Animated.View style={{ flex: 1, opacity: themeTransition.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) }}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}