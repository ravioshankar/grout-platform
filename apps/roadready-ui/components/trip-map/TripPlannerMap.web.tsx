/**
 * Web-only: Leaflet + OpenStreetMap on a real DOM container (RN Web View refs often lack _nativeNode).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LEAFLET_MAP_CONTROLS_CSS } from './leaflet-map-controls';
import {
  MOTORCYCLE_RIDER_POIS,
  RIDER_POI_KIND_LABEL,
  type MotorcycleRiderPoi,
  type RiderPoiKind,
} from './motorcycle-rider-pois';
import type { TripMapProps } from './types';

function riderPopupHtml(p: MotorcycleRiderPoi) {
  return (
    `<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.45;min-width:200px;max-width:280px">` +
    `<strong style="font-size:14px;color:#0f172a">${p.name}</strong><br/>` +
    `<span style="color:#64748b">${p.region}</span><br/>` +
    `<span style="color:#15803d;font-weight:600;font-size:12px">${RIDER_POI_KIND_LABEL[p.kind]}</span><br/>` +
    `<span style="color:#475569;display:block;margin-top:6px">${p.blurb}</span>` +
    (p.path && p.path.length >= 2
      ? `<span style="color:#94a3b8;font-size:11px;display:block;margin-top:8px">Shaded line: approximate corridor (not GPS survey).</span>`
      : '') +
    `</div>`
  );
}

function riderPolylineStyle(kind: RiderPoiKind) {
  switch (kind) {
    case 'iconic_road':
      return { color: '#ea580c', weight: 4, opacity: 0.85 };
    case 'scenic_byway':
      return { color: '#10b981', weight: 4, opacity: 0.8 };
    case 'rally_town':
      return { color: '#8b5cf6', weight: 4, opacity: 0.82 };
    case 'international':
      return { color: '#0ea5e9', weight: 4, opacity: 0.82 };
    default:
      return { color: '#64748b', weight: 3, opacity: 0.75 };
  }
}

function riderMarkerStyle(kind: RiderPoiKind) {
  switch (kind) {
    case 'iconic_road':
      return { radius: 8, color: '#9a3412', fillColor: '#f97316', weight: 2 };
    case 'scenic_byway':
      return { radius: 7, color: '#047857', fillColor: '#34d399', weight: 2 };
    case 'rally_town':
      return { radius: 8, color: '#5b21b6', fillColor: '#c4b5fd', weight: 2 };
    case 'international':
      return { radius: 7, color: '#075985', fillColor: '#7dd3fc', weight: 2 };
    default:
      return { radius: 7, color: '#334155', fillColor: '#94a3b8', weight: 2 };
  }
}

export function TripPlannerMap({ stops, route, addMode, onMapPress }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const redraw = useCallback(() => {
    if (!ready || !mapRef.current || !markersRef.current || !routeRef.current) return;
    const map = mapRef.current;
    const markersLayer = markersRef.current;
    const routeLayer = routeRef.current;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    stops.forEach((s, i) => {
      L.circleMarker([s.lat, s.lng], {
        radius: 9,
        color: '#15803d',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.95,
      })
        .bindPopup(String(s.label || `Stop ${i + 1}`))
        .addTo(markersLayer);
    });

    const r = route && route.length > 1 ? route : [];
    if (r.length > 1) {
      L.polyline(r, { color: '#16A34A', weight: 5, opacity: 0.9 }).addTo(routeLayer);
      try {
        map.fitBounds(L.latLngBounds(r), { padding: [24, 24], maxZoom: 14 });
      } catch {
        /* ignore */
      }
    } else if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 12);
    } else if (stops.length > 1) {
      const b = stops.map((s) => [s.lat, s.lng] as [number, number]);
      try {
        map.fitBounds(L.latLngBounds(b), { padding: [40, 40], maxZoom: 14 });
      } catch {
        /* ignore */
      }
    }
    setTimeout(() => map.invalidateSize(), 50);
  }, [ready, stops, route]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, { zoomControl: true }).setView([39.8283, -98.5795], 4);

    const attrOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    const attrCarto = `${attrOsm} &copy; <a href="https://carto.com/attributions">CARTO</a>`;

    const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attrOsm,
    });

    const cartoVoyager = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution: attrCarto,
        subdomains: 'abcd',
      }
    );

    const cartoPositron = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution: attrCarto,
        subdomains: 'abcd',
      }
    );

    const baseLayers: Record<string, L.TileLayer> = {
      'Places & labels (Voyager)': cartoVoyager,
      'Light + names (Positron)': cartoPositron,
      'OpenStreetMap standard': osmStandard,
    };

    cartoVoyager.addTo(map);

    const riderPicks = L.layerGroup();
    for (const p of MOTORCYCLE_RIDER_POIS) {
      const popup = riderPopupHtml(p);
      if (p.path && p.path.length >= 2) {
        const latlngs = p.path.map((c) => [c.lat, c.lng] as [number, number]);
        L.polyline(latlngs, {
          ...riderPolylineStyle(p.kind),
          lineJoin: 'round',
          lineCap: 'round',
        })
          .bindPopup(popup)
          .addTo(riderPicks);
      }
      const st = riderMarkerStyle(p.kind);
      L.circleMarker([p.lat, p.lng], { ...st, fillOpacity: 0.9 }).bindPopup(popup).addTo(riderPicks);
    }

    const overlayLayers: Record<string, L.LayerGroup> = {
      [`Motorcycle rider picks (${MOTORCYCLE_RIDER_POIS.length})`]: riderPicks,
    };

    L.control
      .layers(baseLayers, overlayLayers, { collapsed: true })
      .setPosition('topright')
      .addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    routeRef.current = L.layerGroup().addTo(map);
    if (!cancelled) setReady(true);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t = window.setTimeout(() => map.invalidateSize(), 200);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      routeRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    const handler = (e: L.LeafletMouseEvent) => {
      if (addMode) onMapPress(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [ready, addMode, onMapPress]);

  const hostStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: 280,
    flex: 1,
    position: 'relative',
    zIndex: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#E5E7EB',
  };

  const mapRootStyle: CSSProperties = {
    flex: 1,
    width: '100%',
    minHeight: 0,
    position: 'relative',
  };

  return (
    <div className="trip-map-host" style={hostStyle}>
      <style>{LEAFLET_MAP_CONTROLS_CSS}</style>
      <div ref={containerRef} style={mapRootStyle} />
    </div>
  );
}
