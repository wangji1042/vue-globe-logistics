// 城市标注点相关逻辑
// src/components/Globe/useCities.ts
import * as THREE from 'three';
import { ref } from 'vue';

// 城市数据类型
export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

// 默认城市数据
const defaultCities: City[] = [
  { name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China' },
  { name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'USA' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'UK' }
  // 可以添加更多城市
];

export function useCities(scene: THREE.Scene, radius: number = 50) {
  const cities = ref<City[]>(defaultCities);
  const cityMeshes = ref<THREE.Mesh[]>([]);

  // 将经纬度转换为3D坐标
  const latLongToVector3 = (
    lat: number,
    long: number,
    radius: number
  ): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  // 创建城市标记点
  const createCityMesh = () => {
    // 创建一个小球体作为标记
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    cities.value.forEach(city => {
      const position = latLongToVector3(city.latitude, city.longitude, radius);
      const cityMesh = new THREE.Mesh(geometry, material);
      cityMesh.position.copy(position);
      cityMesh.userData = city;
      scene.add(cityMesh);
      cityMeshes.value.push(cityMesh);
    });
  };

  // 添加新城市
  const addCity = (city: City) => {
    cities.value.push(city);
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const position = latLongToVector3(city.latitude, city.longitude, radius);
    const cityMesh = new THREE.Mesh(geometry, material);
    cityMesh.position.copy(position);
    cityMesh.userData = city;
    scene.add(cityMesh);
    cityMeshes.value.push(cityMesh);
  };

  // 清理资源
  const dispose = () => {
    cityMeshes.value.forEach(mesh => {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      scene.remove(mesh);
    });
    cityMeshes.value = [];
  };

  return {
    cities,
    cityMeshes,
    createCityMesh,
    addCity,
    dispose,
    latLongToVector3
  };
}
