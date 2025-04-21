// src/components/Global/usePerformance.ts
import * as THREE from 'three';
import { ref, watch } from 'vue';

export function usePerformance(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
) {
  const fps = ref(0);
  const isLowPerformance = ref(false);
  let frameCount = 0;
  let lastTime = performance.now();

  // 性能监控
  const measurePerformance = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      fps.value = frameCount;
      isLowPerformance.value = fps.value < 30;
      frameCount = 0;
      lastTime = currentTime;
    }
  };

  // 根据性能调整质量
  const adjustQuality = () => {
    if (isLowPerformance.value) {
      // 降低质量
      renderer.setPixelRatio(1);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry instanceof THREE.SphereGeometry) {
            const reduced = new THREE.SphereGeometry(
              object.geometry.parameters.radius,
              32, // 减少细分
              32
            );
            object.geometry.dispose();
            object.geometry = reduced;
          }
        }
      });
    }
  };

  // 实现对象池
  const linePool = new Map<string, THREE.Line>();

  const getLineFromPool = (id: string) => {
    if (linePool.has(id)) {
      return linePool.get(id);
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial()
    );
    linePool.set(id, line);
    return line;
  };

  // 监视性能变化
  watch(isLowPerformance, low => {
    if (low) {
      adjustQuality();
    }
  });

  return {
    fps,
    isLowPerformance,
    measurePerformance,
    getLineFromPool
  };
}
