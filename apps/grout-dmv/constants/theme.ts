/**
 * Traffic Signal Inspired Theme for DMV App
 * Using classic traffic light colors: Red (Stop), Yellow (Caution), Green (Go)
 */

import { Platform } from 'react-native';

// Traffic Signal Colors
const trafficRed = '#DC2626';    // Stop/Error
const trafficYellow = '#F59E0B'; // Caution/Warning
const trafficGreen = '#16A34A';  // Go/Success

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    tint: trafficGreen,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: trafficGreen,
    link: '#1976D2',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#F9FAFB',
    background: '#0F172A',
    cardBackground: '#1E293B',
    tint: trafficGreen,
    icon: '#CBD5E1',
    tabIconDefault: '#64748B',
    tabIconSelected: trafficGreen,
    link: '#60A5FA',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Traffic Signal Theme Palette
export const AppColors = {
  // Primary traffic signal colors
  stop: trafficRed,        // Red - Errors, failures, danger
  caution: trafficYellow,  // Yellow - Warnings, pending, attention
  go: trafficGreen,        // Green - Success, pass, proceed
  
  // Supporting colors
  primary: trafficGreen,   // Main brand color (Go/Success)
  secondary: trafficYellow, // Secondary actions (Caution)
  accent: trafficRed,      // Accent for important actions (Stop)
  error: trafficRed,       // Error states
  warning: trafficYellow,  // Warning states
  success: trafficGreen,   // Success states
  
  // UI colors
  surface: '#FFFFFF',      // Card backgrounds
  background: '#F8FAFC',   // App background
  border: '#E5E7EB',       // Borders
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Text colors
  text: {
    primary: '#1F2937',     // Main text (dark gray)
    secondary: '#6B7280',   // Secondary text (medium gray)
    disabled: '#9CA3AF',    // Disabled text (light gray)
    inverse: '#FFFFFF',     // White text for dark backgrounds
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
