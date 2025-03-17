// src/components/Globe/useInteraction.ts
import * as THREE from 'three';
import { ref } from 'vue';
import type { City } from './useCities';

export function useInteraction(camera: THREE.Camera, container: HTMLElement) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const selectedCity = ref<City | null>(null);
  const hoveredCity = ref<City | null>(null);

  const onMouseMove = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onMouseClick = () => {
    if (hoveredCity.value) {
      selectedCity.value = hoveredCity.value;
    }
  };

  const checkIntersection = (cityMeshes: THREE.Mesh[]) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cityMeshes);

    if (intersects.length > 0) {
      const cityMesh = intersects[0].object as THREE.Mesh;
      hoveredCity.value = cityMesh.userData as City;
    } else {
      hoveredCity.value = null;
    }
  };

  return {
    selectedCity,
    hoveredCity,
    onMouseMove,
    onMouseClick,
    checkIntersection
  };
}
