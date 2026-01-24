import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { isDark } = useTheme();
  const currentScheme = isDark ? 'dark' : 'light';
  
  const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
  const hasExplicitBackground = flatStyle && 'backgroundColor' in flatStyle;
  
  const backgroundColor = hasExplicitBackground ? 
    flatStyle.backgroundColor :
    (lightColor || darkColor ? 
      useThemeColor({ light: lightColor, dark: darkColor }, 'background') :
      Colors[currentScheme].background);

  return (
    <View 
      style={[
        { 
          backgroundColor,
          transition: 'background-color 0.3s ease',
        }, 
        style
      ]} 
      {...otherProps} 
    />
  );
}
