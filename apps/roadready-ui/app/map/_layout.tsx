import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: '🗺️ Map Explorer' }} />
      <Stack.Screen name="view-point" options={{ title: 'View Point' }} />
    </Stack>
  );
}
