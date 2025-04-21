// src/components/Global/types/theme.ts
export interface GlobalTheme {
  name: string;
  colors: {
    background: string;
    global: string;
    marker: string;
    line: string;
    highlight: string;
    text: string;
    panel: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  animations: {
    rotationSpeed: number;
    lineSpeed: number;
    markerPulse: boolean;
    glowIntensity: number;
  };
  sizes: {
    markerSize: number;
    lineWidth: number;
    panelWidth: string;
  };
}

export const defaultThemes: Record<string, GlobalTheme> = {
  light: {
    name: 'Light Theme',
    colors: {
      background: '#FFFFFF',
      global: '#E8F4F8',
      marker: '#FF4444',
      line: '#2196F3',
      highlight: '#FFA726',
      text: '#333333',
      panel: 'rgba(255, 255, 255, 0.9)'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Helvetica, sans-serif'
    },
    animations: {
      rotationSpeed: 0.001,
      lineSpeed: 1,
      markerPulse: true,
      glowIntensity: 0.5
    },
    sizes: {
      markerSize: 0.5,
      lineWidth: 2,
      panelWidth: '300px'
    }
  },
  dark: {
    name: 'Dark Theme',
    colors: {
      background: '#1A1A1A',
      global: '#2C3E50',
      marker: '#FF5252',
      line: '#4CAF50',
      highlight: '#FFC107',
      text: '#FFFFFF',
      panel: 'rgba(0, 0, 0, 0.8)'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Helvetica, sans-serif'
    },
    animations: {
      rotationSpeed: 0.001,
      lineSpeed: 1,
      markerPulse: true,
      glowIntensity: 0.8
    },
    sizes: {
      markerSize: 0.5,
      lineWidth: 2,
      panelWidth: '300px'
    }
  }
};
