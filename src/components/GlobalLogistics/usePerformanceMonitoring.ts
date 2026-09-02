// src/components/Global/usePerformanceMonitoring.ts
import Stats from 'stats.js';
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

/** 性能指标 */
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

/** 性能监控器 */
export function usePerformanceMonitoring(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
) {
  // 创建性能统计器
  const stats = new Stats();
  const metrics = ref<PerformanceMetrics>({
    fps: 0,
    memory: { used: 0, total: 0 },
    drawCalls: 0,
    triangles: 0,
    textures: 0
  });

  // 监控状态
  const isMonitoring = ref(false);
  // 动画帧ID
  let animationFrameId: number;

  // 初始化性能面板
  const initStats = () => {
    // 显示性能面板
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    // 设置面板位置
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    stats.dom.style.left = '0px';
    // 添加到文档
    document.body.appendChild(stats.dom);
  };

  // 收集性能指标
  const collectMetrics = () => {
    // 获取渲染器信息
    const info = renderer.info;
    // 更新性能指标
    metrics.value = {
      fps: stats.fps,
      memory: {
        // 计算内存使用情况
        used: Math.round(performance.memory?.usedJSHeapSize / 1048576) || 0,
        total: Math.round(performance.memory?.totalJSHeapSize / 1048576) || 0
      },
      // 获取渲染调用次数
      drawCalls: info.render.calls,
      // 获取三角形数量
      triangles: info.render.triangles,
      // 获取纹理数量
      textures: info.memory.textures
    };
  };

  // 性能优化建议
  const getOptimizationTips = (): string[] => {
    // 性能优化建议
    const tips: string[] = [];

    // 检查FPS
    if (metrics.value.fps < 30) {
      tips.push('FPS较低，考虑减少场景复杂度');
    }
    // 检查DrawCalls
    if (metrics.value.drawCalls > 1000) {
      tips.push('DrawCalls过多，建议合并网格');
    }
    // 检查内存占用
    if (metrics.value.memory.used / metrics.value.memory.total > 0.8) {
      tips.push('内存占用较高，注意内存泄漏');
    }

    return tips;
  };

  // 自动优化
  const autoOptimize = () => {
    // 如果FPS低于30，进行优化
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
    // 如果已经监控，直接返回
    if (isMonitoring.value) return;

    // 设置监控状态
    isMonitoring.value = true;
    initStats();

    // 创建监控函数
    const monitor = () => {
      if (!isMonitoring.value) return;

      // 开始统计
      stats.begin();
      // 收集性能指标
      collectMetrics();
      // 自动优化
      autoOptimize();
      stats.end();

      // 请求下一帧
      animationFrameId = requestAnimationFrame(monitor);
    };

    monitor();
  };

  // 停止监控
  const stopMonitoring = () => {
    // 设置监控状态
    isMonitoring.value = false;
    // 取消动画帧
    cancelAnimationFrame(animationFrameId);
    // 移除性能面板
    if (stats.dom.parentNode) {
      stats.dom.parentNode.removeChild(stats.dom);
    }
  };

  // 导出性能报告
  const exportPerformanceReport = () => {
    // 创建性能报告
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

    // 创建Blob
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    // 创建URL
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    a.click();

    // 释放URL
    URL.revokeObjectURL(url);
  };

  return {
    // 性能指标
    metrics,
    // 监控状态
    isMonitoring,
    // 开始监控
    startMonitoring,
    // 停止监控
    stopMonitoring,
    // 导出性能报告
    exportPerformanceReport,
    // 获取性能优化建议
    getOptimizationTips
  };
}
