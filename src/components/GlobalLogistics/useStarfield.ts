import * as THREE from 'three';
import { markRaw } from 'vue';

export interface StarfieldOptions {
  count?: number;
  radius?: number;
  size?: number;
}

export function useStarfield(options: StarfieldOptions = {}) {
  const { count = 4000, radius = 90, size = 0.6 } = options;

  const createStarfield = (): THREE.Points => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const brightness = 0.5 + Math.random() * 0.5;
      const tint = Math.random();
      if (tint < 0.65) {
        color.setRGB(brightness, brightness, brightness);
      } else if (tint < 0.85) {
        color.setRGB(brightness * 0.75, brightness * 0.88, brightness);
      } else {
        color.setRGB(brightness, brightness * 0.92, brightness * 0.75);
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = markRaw(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = markRaw(
      new THREE.PointsMaterial({
        size,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );

    const starfield = markRaw(new THREE.Points(geometry, material));
    starfield.renderOrder = -1;
    return starfield;
  };

  const dispose = (starfield: THREE.Points) => {
    starfield.geometry.dispose();
    if (starfield.material instanceof THREE.Material) {
      starfield.material.dispose();
    }
  };

  return { createStarfield, dispose };
}
