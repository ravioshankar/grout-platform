import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedTrip } from '@/components/trip-map/types';

const STORAGE_KEY = 'roadready_saved_trips_v1';

export async function loadSavedTrips(): Promise<SavedTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTrip(trip: SavedTrip): Promise<void> {
  const all = await loadSavedTrips();
  const idx = all.findIndex((t) => t.id === trip.id);
  if (idx >= 0) all[idx] = trip;
  else all.unshift(trip);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)));
}

export async function deleteTrip(id: string): Promise<void> {
  const all = (await loadSavedTrips()).filter((t) => t.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
