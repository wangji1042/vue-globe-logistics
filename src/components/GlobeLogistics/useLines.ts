// 飞线相关逻辑
// src/components/Globe/useLines.ts
import * as THREE from 'three';
import { ref } from 'vue';
import type { City } from './useCities';

interface FlightLine {
  from: City;
  to: City;
  id: string;
}

export function useLines(
  scene: THREE.Scene,
  latLongToVector3: (lat: number, long: number, radius: number) => THREE.Vector3
) {
  const lines = ref<Map<string, THREE.Line>>(new Map());
  const animations = ref<Map<string, { progress: number }>>(new Map());

  // 创建曲线路径
  const createCurve = (start: THREE.Vector3, end: THREE.Vector3) => {
    const distance = start.distanceTo(end);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    const midHeight = distance * 0.2;
    mid.normalize().multiplyScalar(start.length() + midHeight);

    return new THREE.QuadraticBezierCurve3(start, mid, end);
  };

  // 添加飞线
  const addLine = (from: City, to: City) => {
    const id = `${from.name}-${to.name}`;

    const startPos = latLongToVector3(from.latitude, from.longitude, 50);
    const endPos = latLongToVector3(to.latitude, to.longitude, 50);

    const curve = createCurve(startPos, endPos);
    const points = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
    lines.value.set(id, line);

    // 添加动画状态
    animations.value.set(id, { progress: 0 });
  };

  // 更新飞线动画
  const updateLines = () => {
    animations.value.forEach((animation, id) => {
      const line = lines.value.get(id);
      if (line) {
        animation.progress = (animation.progress + 0.005) % 1;
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.6 * (1 - animation.progress);
      }
    });
  };

  // 清理资源
  const dispose = () => {
    lines.value.forEach(line => {
      line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
      scene.remove(line);
    });
    lines.value.clear();
    animations.value.clear();
  };

  return {
    lines,
    addLine,
    updateLines,
    dispose
  };
}
