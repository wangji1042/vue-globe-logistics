// 控制器相关逻辑
// src/components/Global/useControls.ts
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Camera } from 'three';
import { markRaw } from 'vue';

export function useControls(camera: Camera, domElement: HTMLElement) {
  const controls = markRaw(new OrbitControls(camera, domElement));

  // 配置控制器
  const initControls = () => {
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 3; // 减小最小距离
    controls.maxDistance = 10; // 减小最大距离
    controls.enablePan = false;
  };

  // 更新控制器
  const updateControls = () => {
    controls.update();
  };

  // 清理资源
  const dispose = () => {
    controls.dispose();
  };

  return {
    controls,
    initControls,
    updateControls,
    dispose
  };
}
