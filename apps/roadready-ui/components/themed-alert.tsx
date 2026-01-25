import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function ThemedAlert({ visible, title, message, buttons = [{ text: 'OK' }], onDismiss }: ThemedAlertProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={[styles.alertBox, { backgroundColor: theme.cardBackground }]}>
            <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
            {message && <ThemedText style={styles.message}>{message}</ThemedText>}
            
            <ThemedView style={[styles.buttonContainer, { backgroundColor: 'transparent' }]}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    { borderTopColor: theme.border },
                    buttons.length > 1 && index > 0 && { borderLeftColor: theme.border, borderLeftWidth: 1 }
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelText,
                    button.style === 'destructive' && styles.destructiveText
                  ]}>
                    {button.text}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  cancelText: {
    fontWeight: '400',
  },
  destructiveText: {
    color: '#DC2626',
  },
});
