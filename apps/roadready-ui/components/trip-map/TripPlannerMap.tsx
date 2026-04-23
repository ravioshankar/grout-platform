/**
 * iOS / Android: Leaflet inside WebView + OSM tiles (no Leaflet in Metro native graph).
 */
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_TRIP_MAP_HTML } from './leaflet-webview-html';
import type { TripMapProps } from './types';

export function TripPlannerMap({ stops, route, addMode, onMapPress }: TripMapProps) {
  const webRef = useRef<WebView>(null);

  const sync = useCallback(() => {
    const w = webRef.current;
    if (!w) return;
    const payload = { stops, route: route && route.length > 1 ? route : [] };
    const embedded = JSON.stringify(payload);
    w.injectJavaScript(`
      try {
        window.__tripSetAddMode && window.__tripSetAddMode(${addMode ? 'true' : 'false'});
        window.__tripRender && window.__tripRender(${embedded});
      } catch (e) {}
      true;
    `);
  }, [stops, route, addMode]);

  useEffect(() => {
    const t = setTimeout(sync, 300);
    return () => clearTimeout(t);
  }, [sync]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        style={styles.web}
        source={{ html: LEAFLET_TRIP_MAP_HTML }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={sync}
        onMessage={(ev) => {
          try {
            const msg = JSON.parse(ev.nativeEvent.data) as { type?: string; lat?: number; lng?: number };
            if (msg.type === 'tap' && typeof msg.lat === 'number' && typeof msg.lng === 'number') {
              onMapPress(msg.lat, msg.lng);
            }
          } catch {
            /* ignore */
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 280 },
  web: { flex: 1, backgroundColor: '#E5E7EB' },
});
