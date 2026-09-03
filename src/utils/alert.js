// src/utils/alert.js
import { Alert, Platform } from 'react-native';

export const confirmDialog = (title, message, onConfirm, confirmText = 'Confirmar') => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined' && window.confirm(fullMessage)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};

export const notifyAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined') {
      window.alert(fullMessage);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};
