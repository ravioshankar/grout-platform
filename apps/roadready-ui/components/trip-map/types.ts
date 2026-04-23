export interface TripStop {
  id: string;
  lat: number;
  lng: number;
  label?: string;
}

export interface SavedTrip {
  id: string;
  name: string;
  createdAt: string;
  stops: TripStop[];
  /** [lat, lng][] along the driving route */
  route?: [number, number][];
}

export interface TripMapProps {
  stops: TripStop[];
  /** [lat, lng][] polyline for the route between stops */
  route?: [number, number][] | null;
  addMode: boolean;
  onMapPress: (lat: number, lng: number) => void;
}
