/**
 * Scoped overrides for Leaflet controls. Parent must be `.trip-map-host` (web) or `#map` (WebView).
 */
export const LEAFLET_MAP_CONTROLS_CSS = `
.trip-map-host .leaflet-top.leaflet-right,
#map .leaflet-top.leaflet-right {
  margin-top: 10px;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Layer control (basemap picker) */
.trip-map-host .leaflet-control-layers,
#map .leaflet-control-layers {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.trip-map-host .leaflet-control-layers-toggle,
#map .leaflet-control-layers-toggle {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.94) !important;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 8px 24px rgba(15, 23, 42, 0.1);
  background-image: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.trip-map-host .leaflet-control-layers-toggle:hover,
#map .leaflet-control-layers-toggle:hover {
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.08),
    0 12px 28px rgba(15, 23, 42, 0.12);
}

.trip-map-host .leaflet-control-layers-toggle::before,
#map .leaflet-control-layers-toggle::before {
  content: "";
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: #334155;
  box-shadow:
    0 -7px 0 #334155,
    0 7px 0 #334155;
  opacity: 0.9;
}

.trip-map-host .leaflet-control-layers-expanded .leaflet-control-layers-toggle,
#map .leaflet-control-layers-expanded .leaflet-control-layers-toggle {
  display: none;
}

.trip-map-host .leaflet-control-layers-expanded,
#map .leaflet-control-layers-expanded {
  padding: 0;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 16px 40px rgba(15, 23, 42, 0.14);
  min-width: 216px;
  overflow: hidden;
}

.trip-map-host .leaflet-control-layers-list,
#map .leaflet-control-layers-list {
  padding: 10px 10px 12px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.trip-map-host .leaflet-control-layers-base::before,
#map .leaflet-control-layers-base::before {
  content: "Map style";
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
  padding: 4px 4px 8px;
}

.trip-map-host .leaflet-control-layers-base label,
#map .leaflet-control-layers-base label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin: 0 0 4px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.25;
  color: #0f172a;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.trip-map-host .leaflet-control-layers-base label:last-child,
#map .leaflet-control-layers-base label:last-child {
  margin-bottom: 0;
}

.trip-map-host .leaflet-control-layers-base label:hover,
#map .leaflet-control-layers-base label:hover {
  background: rgba(22, 163, 74, 0.06);
  border-color: rgba(22, 163, 74, 0.12);
}

.trip-map-host .leaflet-control-layers-base input.leaflet-control-layers-selector,
#map .leaflet-control-layers-base input.leaflet-control-layers-selector {
  accent-color: #16a34a;
  width: 16px;
  height: 16px;
  margin: 0;
  flex-shrink: 0;
}

.trip-map-host .leaflet-control-layers-base input:checked + span,
#map .leaflet-control-layers-base input:checked + span {
  font-weight: 600;
  color: #166534;
}

.trip-map-host .leaflet-control-layers-separator,
#map .leaflet-control-layers-separator {
  display: block;
  height: 1px;
  margin: 10px 8px;
  background: rgba(15, 23, 42, 0.08);
  border: 0;
}

.trip-map-host .leaflet-control-layers-overlays::before,
#map .leaflet-control-layers-overlays::before {
  content: "Overlays";
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
  padding: 2px 4px 8px;
}

.trip-map-host .leaflet-control-layers-overlays label,
#map .leaflet-control-layers-overlays label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin: 0 0 4px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.25;
  color: #0f172a;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.trip-map-host .leaflet-control-layers-overlays label:hover,
#map .leaflet-control-layers-overlays label:hover {
  background: rgba(22, 163, 74, 0.06);
  border-color: rgba(22, 163, 74, 0.12);
}

.trip-map-host .leaflet-control-layers-overlays input.leaflet-control-layers-selector,
#map .leaflet-control-layers-overlays input.leaflet-control-layers-selector {
  accent-color: #16a34a;
  width: 16px;
  height: 16px;
  margin: 0;
  flex-shrink: 0;
}

/* Zoom */
.trip-map-host .leaflet-control-zoom,
#map .leaflet-control-zoom {
  border: none !important;
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 8px 24px rgba(15, 23, 42, 0.1);
}

.trip-map-host .leaflet-control-zoom a,
#map .leaflet-control-zoom a {
  width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 20px;
  font-weight: 500;
  color: #334155 !important;
  background: rgba(255, 255, 255, 0.96) !important;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
}

.trip-map-host .leaflet-control-zoom a:last-child,
#map .leaflet-control-zoom a:last-child {
  border-bottom: none !important;
}

.trip-map-host .leaflet-control-zoom a:hover,
#map .leaflet-control-zoom a:hover {
  background: rgba(22, 163, 74, 0.08) !important;
  color: #166534 !important;
}

/* Attribution */
.trip-map-host .leaflet-control-attribution,
#map .leaflet-control-attribution {
  font-size: 10px;
  line-height: 1.4;
  color: #475569;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 5px 10px;
  margin: 8px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  max-width: calc(100% - 16px);
}

.trip-map-host .leaflet-control-attribution a,
#map .leaflet-control-attribution a {
  color: #15803d;
  text-decoration: none;
}

.trip-map-host .leaflet-control-attribution a:hover,
#map .leaflet-control-attribution a:hover {
  text-decoration: underline;
}
`;
