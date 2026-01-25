import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export function useThemedAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
  };
}
