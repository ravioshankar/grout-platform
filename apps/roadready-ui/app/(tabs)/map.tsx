import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppHeader } from '@/components/app-header';
import { TripPlannerMap } from '@/components/trip-map/TripPlannerMap';
import {
  MOTORCYCLE_RIDER_POIS,
  RIDER_POI_KIND_LABEL,
} from '@/components/trip-map/motorcycle-rider-pois';
import type { TripStop, SavedTrip } from '@/components/trip-map/types';
import { fetchOsrmRoute } from '@/utils/osrm-route';
import { loadSavedTrips, saveTrip, deleteTrip } from '@/utils/trip-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

function newStop(lat: number, lng: number, index: number): TripStop {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    lat,
    lng,
    label: `Stop ${index + 1}`,
  };
}

export default function TripPlannerTab() {
  const { isDark } = useTheme();
  const scheme = isDark ? 'dark' : 'light';
  const [stops, setStops] = useState<TripStop[]>([]);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [routing, setRouting] = useState(false);
  const [tripName, setTripName] = useState('');
  const [saved, setSaved] = useState<SavedTrip[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const onMapPress = useCallback(
    (lat: number, lng: number) => {
      if (!addMode) return;
      setStops((prev) => [...prev, newStop(lat, lng, prev.length)]);
      setRoute(null);
    },
    [addMode]
  );

  useEffect(() => {
    void loadSavedTrips().then(setSaved);
  }, []);

  const clearAll = () => {
    setStops([]);
    setRoute(null);
    setAddMode(false);
  };

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
    setRoute(null);
  };

  const buildRoute = async () => {
    if (stops.length < 2) {
      Alert.alert('Add stops', 'Place at least two stops on the map, then build the route.');
      return;
    }
    setRouting(true);
    try {
      const line = await fetchOsrmRoute(stops.map((s) => ({ lat: s.lat, lng: s.lng })));
      if (line.length < 2) {
        Alert.alert('No route', 'Could not find a driving route between these points. Try nearby points on roads.');
        setRoute(null);
      } else {
        setRoute(line);
      }
    } catch (e) {
      Alert.alert('Routing error', e instanceof Error ? e.message : 'Try again later.');
      setRoute(null);
    } finally {
      setRouting(false);
    }
  };

  const persistTrip = async () => {
    const name = tripName.trim() || `Trip ${new Date().toLocaleDateString()}`;
    const trip: SavedTrip = {
      id: editingId || `trip_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      stops,
      route: route ?? undefined,
    };
    await saveTrip(trip);
    setTripName('');
    setEditingId(null);
    setSaved(await loadSavedTrips());
    Alert.alert('Saved', `Trip "${name}" saved on this device.`);
  };

  const loadTrip = (t: SavedTrip) => {
    setStops(t.stops);
    setRoute(t.route && t.route.length > 1 ? t.route : null);
    setTripName(t.name);
    setEditingId(t.id);
    setAddMode(false);
  };

  const removeSaved = async (id: string) => {
    await deleteTrip(id);
    setSaved(await loadSavedTrips());
    if (editingId === id) {
      setEditingId(null);
      setTripName('');
    }
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: Colors[scheme].background }]}>
      <AppHeader title="Trip planner" />
      <ThemedText style={[styles.sub, { color: Colors[scheme].text }]}>
        Basemaps + optional motorcycle POI overlay · OSRM demo routing · data stays on device
      </ThemedText>

      <View style={styles.mapBox}>
        <TripPlannerMap stops={stops} route={route} addMode={addMode} onMapPress={onMapPress} />
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelInner} keyboardShouldPersistTaps="handled">
        <ThemedView style={[styles.toolbar, { backgroundColor: Colors[scheme].cardBackground, borderColor: Colors[scheme].border }]}>
          <TouchableOpacity
            style={[styles.toolBtn, addMode && styles.toolBtnActive]}
            onPress={() => setAddMode((a) => !a)}
            activeOpacity={0.8}
          >
            <Ionicons name={addMode ? 'close' : 'add-circle-outline'} size={22} color={addMode ? '#fff' : '#16A34A'} />
            <ThemedText style={[styles.toolBtnText, addMode && styles.toolBtnTextOn]}>
              {addMode ? 'Done adding' : 'Add stop'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBtn} onPress={() => void buildRoute()} disabled={routing} activeOpacity={0.8}>
            {routing ? (
              <ActivityIndicator color="#16A34A" />
            ) : (
              <Ionicons name="navigate-outline" size={22} color="#16A34A" />
            )}
            <ThemedText style={styles.toolBtnText}>Route</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBtn} onPress={clearAll} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
            <ThemedText style={styles.toolBtnText}>Clear</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[scheme].cardBackground, borderColor: Colors[scheme].border }]}>
          <ThemedText type="subtitle">Motorcycle rider picks</ThemedText>
          <ThemedText style={styles.muted}>
            Enable the overlay in the map layers menu (top-right). Colored lines show an approximate ride corridor;
            dots mark a reference point. Orange = iconic road, green = scenic byway, purple = rally hub, blue =
            international. Lines are illustrative only — tap for details and verify routes locally.
          </ThemedText>
          {MOTORCYCLE_RIDER_POIS.map((p) => (
            <ThemedText key={p.id} style={[styles.poiListLine, { color: Colors[scheme].text }]}>
              <ThemedText type="defaultSemiBold">{RIDER_POI_KIND_LABEL[p.kind]}</ThemedText>
              {' · '}
              {p.name} — {p.region}
            </ThemedText>
          ))}
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[scheme].cardBackground, borderColor: Colors[scheme].border }]}>
          <ThemedText type="subtitle">Stops ({stops.length})</ThemedText>
          {stops.length === 0 ? (
            <ThemedText style={styles.muted}>Turn on Add stop, then tap the map to place waypoints.</ThemedText>
          ) : (
            stops.map((s, i) => (
              <ThemedView key={s.id} style={styles.stopRow}>
                <ThemedText style={{ flex: 1 }}>
                  {i + 1}. {s.label} — {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                </ThemedText>
                <TouchableOpacity onPress={() => removeStop(s.id)} hitSlop={10}>
                  <Ionicons name="close-circle" size={22} color="#DC2626" />
                </TouchableOpacity>
              </ThemedView>
            ))
          )}
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[scheme].cardBackground, borderColor: Colors[scheme].border }]}>
          <ThemedText type="subtitle">Save trip</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: Colors[scheme].text,
                borderColor: Colors[scheme].border,
                backgroundColor: Colors[scheme].background,
              },
            ]}
            placeholder="Trip name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={tripName}
            onChangeText={setTripName}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={() => void persistTrip()} activeOpacity={0.85}>
            <ThemedText style={styles.saveBtnText}>Save on device</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[scheme].cardBackground, borderColor: Colors[scheme].border }]}>
          <ThemedText type="subtitle">Saved trips</ThemedText>
          {saved.length === 0 ? (
            <ThemedText style={styles.muted}>No saved trips yet.</ThemedText>
          ) : (
            saved.map((t) => (
              <ThemedView key={t.id} style={styles.savedRow}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => loadTrip(t)}>
                  <ThemedText type="defaultSemiBold">{t.name}</ThemedText>
                  <ThemedText style={styles.muted}>
                    {t.stops.length} stops · {new Date(t.createdAt).toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => void removeSaved(t.id)}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              </ThemedView>
            ))
          )}
        </ThemedView>

        <ThemedText style={[styles.attrib, { color: Colors[scheme].text }]}>
          © OpenStreetMap & CARTO. Layer control: basemaps and optional motorcycle rider picks (curated ideas, not
          official guidance). OSRM demo routing — use your own servers for production.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sub: { fontSize: 12, opacity: 0.75, paddingHorizontal: 16, marginBottom: 8 },
  poiListLine: { fontSize: 12.5, marginTop: 8, lineHeight: 18, opacity: 0.92 },
  mapBox: { height: 320, marginHorizontal: 12, borderRadius: 12, overflow: 'hidden' },
  panel: { flex: 1 },
  panelInner: { padding: 12, paddingBottom: 32 },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  toolBtnActive: { backgroundColor: '#16A34A' },
  toolBtnText: { fontWeight: '600', color: '#166534', fontSize: 13 },
  toolBtnTextOn: { color: '#fff' },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  muted: { fontSize: 13, opacity: 0.75, marginTop: 6 },
  stopRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  attrib: { fontSize: 11, opacity: 0.65, marginTop: 8, lineHeight: 16 },
});
