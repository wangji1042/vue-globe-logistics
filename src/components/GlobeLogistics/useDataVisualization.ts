// src/components/Globe/useDataVisualization.ts
import * as THREE from 'three';
import { ref, computed } from 'vue';
import { createNoise2D } from 'simplex-noise';

// 数据类型定义
interface DataPoint {
  position: THREE.Vector3;
  value: number;
  timestamp?: number;
  category?: string;
  metadata?: Record<string, any>;
}

interface HeatmapOptions {
  radius: number;
  intensity: number;
  colorScale: string[];
  blur: number;
}

interface TimeSeriesOptions {
  startTime: number;
  endTime: number;
  speed: number;
  loop: boolean;
}

export function useDataVisualization(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
) {
  // 状态管理
  const dataPoints = ref<DataPoint[]>([]);
  const currentTimestamp = ref<number>(Date.now());
  const visualizationMode = ref<'heatmap' | 'timeSeries' | 'category'>(
    'heatmap'
  );

  // 创建噪声生成器
  const noise2D = createNoise2D();

  // 热力图实现
  const createHeatmap = (options: HeatmapOptions) => {
    const {
      radius = 10,
      intensity = 1.0,
      colorScale = ['#0000ff', '#00ff00', '#ffff00', '#ff0000'],
      blur = 0.8
    } = options;

    // 创建热力图纹理
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 绘制热力图
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);

    dataPoints.value.forEach(point => {
      // 将3D坐标转换为2D UV坐标
      const uv = getSphericalUV(point.position);
      const x = uv.x * size;
      const y = uv.y * size;

      // 创建径向渐变
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      // 根据数值设置颜色
      const colorIndex = Math.floor(
        (point.value / getMaxValue()) * (colorScale.length - 1)
      );
      const color = colorScale[colorIndex];

      gradient.addColorStop(0, `${color}ff`);
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.globalAlpha = intensity;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });

    // 应用模糊效果
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(canvas, 0, 0);
    }

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  };

  // 时间序列动画
  const createTimeSeriesAnimation = (options: TimeSeriesOptions) => {
    const { startTime, endTime, speed = 1, loop = true } = options;

    const timeRange = endTime - startTime;
    let animationFrame: number;

    const animate = () => {
      currentTimestamp.value += speed * 1000; // 每帧增加的时间（毫秒）

      if (currentTimestamp.value > endTime) {
        if (loop) {
          currentTimestamp.value = startTime;
        } else {
          cancelAnimationFrame(animationFrame);
          return;
        }
      }

      // 更新可见数据点
      updateVisibleDataPoints();

      animationFrame = requestAnimationFrame(animate);
    };

    return {
      start: () => {
        currentTimestamp.value = startTime;
        animate();
      },
      stop: () => {
        cancelAnimationFrame(animationFrame);
      },
      setSpeed: (newSpeed: number) => {
        options.speed = newSpeed;
      }
    };
  };

  // 数据分类展示
  const categoryGroups = ref(new Map<string, THREE.Group>());

  const createCategoryVisualization = () => {
    // 清理现有分类组
    categoryGroups.value.forEach(group => {
      scene.remove(group);
      group.clear();
    });
    categoryGroups.value.clear();

    // 按类别分组数据
    const categories = new Map<string, DataPoint[]>();
    dataPoints.value.forEach(point => {
      const category = point.category || 'default';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(point);
    });

    // 为每个类别创建视觉效果
    categories.forEach((points, category) => {
      const group = new THREE.Group();
      group.name = `category-${category}`;

      // 创建类别特定的材质
      const material = new THREE.MeshPhongMaterial({
        color: getCategoryColor(category),
        transparent: true,
        opacity: 0.8
      });

      // 为每个数据点创建可视化
      points.forEach(point => {
        const geometry = new THREE.SphereGeometry(
          0.5 * Math.sqrt(point.value),
          16,
          16
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(point.position);
        group.add(mesh);
      });

      scene.add(group);
      categoryGroups.value.set(category, group);
    });
  };

  // 高级视觉效果
  const createAdvancedEffects = () => {
    // 添加后期处理效果
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 添加发光效果
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // 添加环境光遮蔽
    const ssaoPass = new THREE.SSAOPass(scene, camera);
    composer.addPass(ssaoPass);

    return composer;
  };

  // 辅助函数
  const getSphericalUV = (position: THREE.Vector3): THREE.Vector2 => {
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(position);

    return new THREE.Vector2(
      spherical.theta / (2 * Math.PI),
      spherical.phi / Math.PI
    );
  };

  const getMaxValue = () => {
    return Math.max(...dataPoints.value.map(p => p.value));
  };

  const getCategoryColor = (category: string): string => {
    // 使用确定性哈希生成颜色
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = new THREE.Color();
    color.setHSL((hash & 0xff) / 255, 0.8, 0.6);

    return `#${color.getHexString()}`;
  };

  // 数据更新和动画
  const updateVisibleDataPoints = () => {
    const visiblePoints = dataPoints.value.filter(point => {
      if (!point.timestamp) return true;
      return Math.abs(point.timestamp - currentTimestamp.value) < 1000;
    });

    // 更新可视化
    switch (visualizationMode.value) {
      case 'heatmap':
        updateHeatmap(visiblePoints);
        break;
      case 'timeSeries':
        updateTimeSeriesVisualization(visiblePoints);
        break;
      case 'category':
        updateCategoryVisualization(visiblePoints);
        break;
    }
  };

  // 清理函数
  const dispose = () => {
    categoryGroups.value.forEach(group => {
      scene.remove(group);
      group.clear();
    });
    categoryGroups.value.clear();
  };

  return {
    dataPoints,
    visualizationMode,
    currentTimestamp,
    createHeatmap,
    createTimeSeriesAnimation,
    createCategoryVisualization,
    createAdvancedEffects,
    updateVisibleDataPoints,
    dispose
  };
}
