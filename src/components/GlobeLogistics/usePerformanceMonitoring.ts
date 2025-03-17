// src/components/Globe/usePerformanceMonitoring.ts
import Stats from 'stats.js';
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
  };
  drawCalls: number;
  triangles: number;
  textures: number;
}

export function usePerformanceMonitoring(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
) {
  const stats = new Stats();
  const metrics = ref<PerformanceMetrics>({
    fps: 0,
    memory: { used: 0, total: 0 },
    drawCalls: 0,
    triangles: 0,
    textures: 0
  });

  const isMonitoring = ref(false);
  let animationFrameId: number;

  // 初始化性能面板
  const initStats = () => {
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    stats.dom.style.left = '0px';
    document.body.appendChild(stats.dom);
  };

  // 收集性能指标
  const collectMetrics = () => {
    const info = renderer.info;
    metrics.value = {
      fps: stats.fps,
      memory: {
        used: Math.round(performance.memory?.usedJSHeapSize / 1048576) || 0,
        total: Math.round(performance.memory?.totalJSHeapSize / 1048576) || 0
      },
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      textures: info.memory.textures
    };
  };

  // 性能优化建议
  const getOptimizationTips = (): string[] => {
    const tips: string[] = [];

    if (metrics.value.fps < 30) {
      tips.push('FPS较低，考虑减少场景复杂度');
    }
    if (metrics.value.drawCalls > 1000) {
      tips.push('DrawCalls过多，建议合并网格');
    }
    if (metrics.value.memory.used / metrics.value.memory.total > 0.8) {
      tips.push('内存占用较高，注意内存泄漏');
    }

    return tips;
  };

  // 自动优化
  const autoOptimize = () => {
    if (metrics.value.fps < 30) {
      // 降低分辨率
      renderer.setPixelRatio(Math.max(1, window.devicePixelRatio - 0.5));

      // 简化几何体
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry instanceof THREE.SphereGeometry) {
            const segments = Math.max(
              16,
              Math.floor(object.geometry.parameters.widthSegments * 0.75)
            );
            object.geometry = new THREE.SphereGeometry(
              object.geometry.parameters.radius,
              segments,
              segments
            );
          }
        }
      });
    }
  };

  // 开始监控
  const startMonitoring = () => {
    if (isMonitoring.value) return;

    isMonitoring.value = true;
    initStats();

    const monitor = () => {
      if (!isMonitoring.value) return;

      stats.begin();
      collectMetrics();
      autoOptimize();
      stats.end();

      animationFrameId = requestAnimationFrame(monitor);
    };

    monitor();
  };

  // 停止监控
  const stopMonitoring = () => {
    isMonitoring.value = false;
    cancelAnimationFrame(animationFrameId);
    if (stats.dom.parentNode) {
      stats.dom.parentNode.removeChild(stats.dom);
    }
  };

  // 导出性能报告
  const exportPerformanceReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: metrics.value,
      optimizationTips: getOptimizationTips(),
      sceneInfo: {
        objects: scene.children.length,
        materials: new Set(
          scene.children.map(child =>
            child instanceof THREE.Mesh ? child.material : null
          )
        ).size
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    exportPerformanceReport,
    getOptimizationTips
  };
}
