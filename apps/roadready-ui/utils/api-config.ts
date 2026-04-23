import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Base URL for the RoadReady API (no trailing slash).
 * Set `EXPO_PUBLIC_API_URL` in `.env` for physical devices or staging (e.g. http://192.168.1.10:8888).
 */
export function getApiBaseUrl(): string {
  const envUrl = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL?.trim() : '';
  if (envUrl) return envUrl.replace(/\/$/, '');

  const extra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl?.trim();
  if (extra) return extra.replace(/\/$/, '');

  if (Platform.OS === 'android') return 'http://10.0.2.2:8888';
  return 'http://localhost:8888';
}
