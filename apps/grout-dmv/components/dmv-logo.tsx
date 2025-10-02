import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function DMVLogo({ size = 40 }: { size?: number }) {
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { width: size * 2.5, height: size }]}>
      <View style={[styles.shield, { 
        width: size, 
        height: size, 
        borderColor: primaryColor,
        borderRadius: size * 0.15 
      }]}>
        <View style={[styles.groutPattern, { width: size * 0.6, height: size * 0.6 }]}>
          <View style={[styles.groutLine, styles.horizontalLine, { backgroundColor: primaryColor }]} />
          <View style={[styles.groutLine, styles.verticalLine, { backgroundColor: primaryColor }]} />
          <View style={[styles.groutDot, { backgroundColor: primaryColor }]} />
        </View>
      </View>
      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { 
          fontSize: size * 0.35, 
          color: primaryColor,
          fontWeight: 'bold' 
        }]}>
          DMV
        </ThemedText>
        <ThemedText style={[styles.subtitle, { 
          fontSize: size * 0.2, 
          color: textColor 
        }]}>
          TEST PREP
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shield: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  groutPattern: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groutLine: {
    position: 'absolute',
  },
  horizontalLine: {
    width: '80%',
    height: 2,
    top: '30%',
  },
  verticalLine: {
    width: 2,
    height: '80%',
    left: '30%',
  },
  groutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    lineHeight: 16,
    letterSpacing: 1,
  },
  subtitle: {
    lineHeight: 12,
    letterSpacing: 0.5,
  },
});