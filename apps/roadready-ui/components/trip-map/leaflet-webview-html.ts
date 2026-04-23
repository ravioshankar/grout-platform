import { LEAFLET_MAP_CONTROLS_CSS } from './leaflet-map-controls';
import { MOTORCYCLE_RIDER_POIS } from './motorcycle-rider-pois';

const RIDER_POIS_JSON = JSON.stringify(MOTORCYCLE_RIDER_POIS);

/**
 * Self-contained Leaflet page for react-native-webview (iOS/Android).
 * Basemaps: Carto Voyager / Positron (strong place names) + OSM; routing via injectJavaScript.
 */
export const LEAFLET_TRIP_MAP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    ${LEAFLET_MAP_CONTROLS_CSS}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function () {
      var map = L.map('map', { zoomControl: true }).setView([39.8283, -98.5795], 4);
      var attrOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      var attrCarto = attrOsm + ' &copy; <a href="https://carto.com/attributions">CARTO</a>';
      var osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: attrOsm
      });
      var cartoVoyager = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 20, attribution: attrCarto, subdomains: 'abcd' }
      );
      var cartoPositron = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 20, attribution: attrCarto, subdomains: 'abcd' }
      );
      var baseLayers = {
        'Places & labels (Voyager)': cartoVoyager,
        'Light + names (Positron)': cartoPositron,
        'OpenStreetMap standard': osmStandard
      };
      cartoVoyager.addTo(map);

      var __pois = ${RIDER_POIS_JSON};
      var KIND_LABEL = {
        iconic_road: 'Iconic road',
        scenic_byway: 'Scenic byway',
        rally_town: 'Rally / hub',
        international: 'International'
      };
      function riderStyle(kind) {
        switch (kind) {
          case 'iconic_road':
            return { radius: 8, color: '#9a3412', fillColor: '#f97316', weight: 2, fillOpacity: 0.9 };
          case 'scenic_byway':
            return { radius: 7, color: '#047857', fillColor: '#34d399', weight: 2, fillOpacity: 0.9 };
          case 'rally_town':
            return { radius: 8, color: '#5b21b6', fillColor: '#c4b5fd', weight: 2, fillOpacity: 0.9 };
          case 'international':
            return { radius: 7, color: '#075985', fillColor: '#7dd3fc', weight: 2, fillOpacity: 0.9 };
          default:
            return { radius: 7, color: '#334155', fillColor: '#94a3b8', weight: 2, fillOpacity: 0.9 };
        }
      }
      function riderPolylineStyle(kind) {
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
      var riderPicks = L.layerGroup();
      __pois.forEach(function (p) {
        var pathNote =
          p.path && p.path.length >= 2
            ? '<span style="color:#94a3b8;font-size:11px;display:block;margin-top:8px">Shaded line: approximate corridor (not GPS survey).</span>'
            : '';
        var popup =
          '<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.45;min-width:200px;max-width:280px">' +
          '<strong style="font-size:14px;color:#0f172a">' +
          p.name +
          '</strong><br/>' +
          '<span style="color:#64748b">' +
          p.region +
          '</span><br/>' +
          '<span style="color:#15803d;font-weight:600;font-size:12px">' +
          (KIND_LABEL[p.kind] || '') +
          '</span><br/>' +
          '<span style="color:#475569;display:block;margin-top:6px">' +
          p.blurb +
          '</span>' +
          pathNote +
          '</div>';
        if (p.path && p.path.length >= 2) {
          var latlngs = p.path.map(function (c) {
            return [c.lat, c.lng];
          });
          L.polyline(latlngs, Object.assign({}, riderPolylineStyle(p.kind), { lineJoin: 'round', lineCap: 'round' }))
            .bindPopup(popup)
            .addTo(riderPicks);
        }
        var st = riderStyle(p.kind);
        L.circleMarker([p.lat, p.lng], st).bindPopup(popup).addTo(riderPicks);
      });
      var overlayLayers = {};
      overlayLayers['Motorcycle rider picks (' + __pois.length + ')'] = riderPicks;
      L.control.layers(baseLayers, overlayLayers, { collapsed: true }).setPosition('topright').addTo(map);

      var markersLayer = L.layerGroup().addTo(map);
      var routeLayer = L.layerGroup().addTo(map);
      var addMode = false;

      map.on('click', function (e) {
        if (addMode && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'tap',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        }
      });

      window.__tripSetAddMode = function (v) {
        addMode = !!v;
      };

      window.__tripRender = function (payload) {
        try {
          var data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
          markersLayer.clearLayers();
          routeLayer.clearLayers();
          var stops = data.stops || [];
          stops.forEach(function (s, i) {
            L.marker([s.lat, s.lng])
              .bindPopup(String(s.label || ('Stop ' + (i + 1))))
              .addTo(markersLayer);
          });
          var route = data.route;
          if (route && route.length > 1) {
            L.polyline(route, { color: '#16A34A', weight: 5, opacity: 0.9 }).addTo(routeLayer);
            try {
              map.fitBounds(L.latLngBounds(route), { padding: [24, 24], maxZoom: 14 });
            } catch (e) {}
          } else if (stops.length === 1) {
            map.setView([stops[0].lat, stops[0].lng], 12);
          } else if (stops.length > 1) {
            var b = stops.map(function (s) { return [s.lat, s.lng]; });
            try {
              map.fitBounds(L.latLngBounds(b), { padding: [40, 40], maxZoom: 14 });
            } catch (e2) {}
          }
        } catch (err) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(err) }));
          }
        }
      };
    })();
  </script>
</body>
</html>`;
