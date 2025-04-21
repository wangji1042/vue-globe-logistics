// src/components/Global/types/data.ts
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  coordinates: GeoPoint;
  population?: number;
  data?: Record<string, any>;
}

export interface FlightRoute {
  id: string;
  from: string; // City ID
  to: string; // City ID
  type?: string;
  data?: Record<string, any>;
}

export interface GlobalData {
  version: string;
  cities: City[];
  routes: FlightRoute[];
  metadata?: {
    name?: string;
    description?: string;
    created?: string;
    modified?: string;
    author?: string;
  };
}

export type DataFormat = 'json' | 'csv' | 'geojson' | 'kml';
