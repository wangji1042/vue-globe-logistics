// src/components/Globe/types.ts
export interface GlobeOptions {
  globeColor: string;
  glowColor: string;
  markerColor: string;
  lineColor: string;
  lineWidth: number;
  markerSize: number;
  glowIntensity: number;
  rotationSpeed: number;
}

export const defaultOptions: GlobeOptions = {
  globeColor: '#1B1B1B',
  glowColor: '#000080',
  markerColor: '#FF4444',
  lineColor: '#00FF00',
  lineWidth: 2,
  markerSize: 0.5,
  glowIntensity: 1,
  rotationSpeed: 0.001
};
