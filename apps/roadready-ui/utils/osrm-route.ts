/**
 * Driving directions via the public OSRM demo server (OpenStreetMap data).
 * Fair-use limits apply; for production use your own OSRM or a commercial router.
 */
export type LatLng = { lat: number; lng: number };

export async function fetchOsrmRoute(stops: LatLng[]): Promise<[number, number][]> {
  if (stops.length < 2) return [];
  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed (${res.status})`);
  const data = (await res.json()) as {
    code: string;
    routes?: { geometry: { coordinates: [number, number][] } }[];
  };
  if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) {
    return [];
  }
  const line = data.routes[0].geometry.coordinates;
  return line.map(([lng, lat]) => [lat, lng] as [number, number]);
}
