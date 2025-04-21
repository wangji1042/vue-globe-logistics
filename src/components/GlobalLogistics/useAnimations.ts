// src/components/Global/useAnimations.ts
import * as THREE from 'three';
import { gsap } from 'gsap';

export function useAnimations(camera: THREE.Camera) {
  // 相机动画
  const animateCameraToPosition = (
    targetPosition: THREE.Vector3,
    duration: number = 1
  ) => {
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut'
    });
  };

  // 标记点动画
  const animateMarker = (marker: THREE.Mesh) => {
    gsap.to(marker.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  };

  // 飞线动画
  const animateLine = (line: THREE.Line) => {
    const material = line.material as THREE.LineBasicMaterial;
    gsap.to(material, {
      opacity: 0.8,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'none'
    });
  };

  return {
    animateCameraToPosition,
    animateMarker,
    animateLine
  };
}
