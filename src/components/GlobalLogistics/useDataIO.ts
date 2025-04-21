// src/components/Global/useDataIO.ts
import { ref } from 'vue';
import type { GlobalData, DataFormat, City, FlightRoute } from './types/data';

export function useDataIO() {
  const currentData = ref<GlobalData>({
    version: '1.0',
    cities: [],
    routes: [],
    metadata: {
      created: new Date().toISOString()
    }
  });

  // 数据验证
  const validateData = (data: any): boolean => {
    try {
      // 基本结构验证
      if (!data.cities || !Array.isArray(data.cities)) {
        throw new Error('Invalid cities data');
      }
      if (!data.routes || !Array.isArray(data.routes)) {
        throw new Error('Invalid routes data');
      }

      // 城市数据验证
      data.cities.forEach((city: City) => {
        if (!city.id || !city.name || !city.coordinates) {
          throw new Error(`Invalid city data: ${JSON.stringify(city)}`);
        }
        if (!isValidCoordinates(city.coordinates)) {
          throw new Error(`Invalid coordinates for city: ${city.name}`);
        }
      });

      // 路线数据验证
      data.routes.forEach((route: FlightRoute) => {
        if (!route.id || !route.from || !route.to) {
          throw new Error(`Invalid route data: ${JSON.stringify(route)}`);
        }
        // 验证引用的城市是否存在
        if (!data.cities.find(c => c.id === route.from)) {
          throw new Error(`Source city not found: ${route.from}`);
        }
        if (!data.cities.find(c => c.id === route.to)) {
          throw new Error(`Destination city not found: ${route.to}`);
        }
      });

      return true;
    } catch (error) {
      console.error('Data validation failed:', error);
      return false;
    }
  };

  // 坐标验证
  const isValidCoordinates = (coords: GeoPoint): boolean => {
    return (
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  };

  // 导入数据
  const importData = async (
    file: File,
    format: DataFormat
  ): Promise<boolean> => {
    try {
      const content = await file.text();
      let data: GlobalData;

      switch (format) {
        case 'json':
          data = JSON.parse(content);
          break;
        case 'csv':
          data = parseCSV(content);
          break;
        case 'geojson':
          data = parseGeoJSON(content);
          break;
        case 'kml':
          data = parseKML(content);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      if (validateData(data)) {
        currentData.value = {
          ...data,
          metadata: {
            ...data.metadata,
            modified: new Date().toISOString()
          }
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  // CSV解析
  const parseCSV = (content: string): GlobalData => {
    const lines = content.split('\n');
    const cities: City[] = [];
    const routes: FlightRoute[] = [];

    // 解析城市数据
    let isRoutesSection = false;
    lines.forEach(line => {
      if (line.trim() === 'ROUTES') {
        isRoutesSection = true;
        return;
      }

      const columns = line.split(',').map(col => col.trim());
      if (!isRoutesSection) {
        // 解析城市
        if (columns.length >= 4) {
          cities.push({
            id: columns[0],
            name: columns[1],
            country: columns[2],
            coordinates: {
              latitude: parseFloat(columns[3]),
              longitude: parseFloat(columns[4])
            }
          });
        }
      } else {
        // 解析路线
        if (columns.length >= 3) {
          routes.push({
            id: `${columns[0]}-${columns[1]}`,
            from: columns[0],
            to: columns[1],
            type: columns[2]
          });
        }
      }
    });

    return {
      version: '1.0',
      cities,
      routes,
      metadata: {
        created: new Date().toISOString()
      }
    };
  };

  // GeoJSON解析
  const parseGeoJSON = (content: string): GlobalData => {
    const geojson = JSON.parse(content);
    const cities: City[] = [];
    const routes: FlightRoute[] = [];

    if (geojson.type === 'FeatureCollection') {
      geojson.features.forEach((feature: any) => {
        if (feature.geometry.type === 'Point') {
          cities.push({
            id: feature.properties.id || `city-${cities.length}`,
            name: feature.properties.name,
            country: feature.properties.country,
            coordinates: {
              longitude: feature.geometry.coordinates[0],
              latitude: feature.geometry.coordinates[1]
            }
          });
        } else if (feature.geometry.type === 'LineString') {
          routes.push({
            id: feature.properties.id || `route-${routes.length}`,
            from: feature.properties.from,
            to: feature.properties.to,
            type: feature.properties.type
          });
        }
      });
    }

    return {
      version: '1.0',
      cities,
      routes,
      metadata: {
        created: new Date().toISOString()
      }
    };
  };

  // 导出数据
  const exportData = async (format: DataFormat = 'json'): Promise<string> => {
    let content: string;
    const fileName = `global-data-${new Date().toISOString()}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(currentData.value, null, 2);
        download(`${fileName}.json`, content);
        break;
      case 'csv':
        content = convertToCSV(currentData.value);
        download(`${fileName}.csv`, content);
        break;
      case 'geojson':
        content = convertToGeoJSON(currentData.value);
        download(`${fileName}.geojson`, content);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return content;
  };

  // 下载文件
  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 转换为CSV
  const convertToCSV = (data: GlobalData): string => {
    let csv = 'ID,Name,Country,Latitude,Longitude\n';

    // 添加城市数据
    data.cities.forEach(city => {
      csv +=
        `${city.id},${city.name},${city.country},` +
        `${city.coordinates.latitude},${city.coordinates.longitude}\n`;
    });

    // 添加路线数据
    csv += '\nROUTES\n';
    csv += 'From,To,Type\n';
    data.routes.forEach(route => {
      csv += `${route.from},${route.to},${route.type || ''}\n`;
    });

    return csv;
  };

  // 转换为GeoJSON
  const convertToGeoJSON = (data: GlobalData): string => {
    const features = [
      // 添加城市点
      ...data.cities.map(city => ({
        type: 'Feature',
        properties: {
          id: city.id,
          name: city.name,
          country: city.country
        },
        geometry: {
          type: 'Point',
          coordinates: [city.coordinates.longitude, city.coordinates.latitude]
        }
      })),
      // 添加路线线段
      ...data.routes.map(route => {
        const fromCity = data.cities.find(c => c.id === route.from);
        const toCity = data.cities.find(c => c.id === route.to);
        return {
          type: 'Feature',
          properties: {
            id: route.id,
            from: route.from,
            to: route.to,
            type: route.type
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [fromCity!.coordinates.longitude, fromCity!.coordinates.latitude],
              [toCity!.coordinates.longitude, toCity!.coordinates.latitude]
            ]
          }
        };
      })
    ];

    return JSON.stringify(
      {
        type: 'FeatureCollection',
        features
      },
      null,
      2
    );
  };

  return {
    currentData,
    importData,
    exportData,
    validateData
  };
}
