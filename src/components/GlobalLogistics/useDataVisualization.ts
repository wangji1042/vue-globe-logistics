// src/components/Global/useDataVisualization.ts
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ref, computed as _computed, toRaw } from 'vue';
import { createNoise2D } from 'simplex-noise';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// 数据类型定义
interface DataPoint {
  position: THREE.Vector3;
  value: number;
  timestamp?: number;
  category?: string;
  metadata?: Record<string, any>;
  density?: number;
}

interface HeatmapOptions {
  radius: number;
  intensity: number;
  colorScale: string[];
  blur: number;
  sizeScale?: number;
  opacity?: number;
}

interface TimeSeriesOptions {
  startTime: number;
  endTime: number;
  speed: number;
  loop: boolean;
}

// 场景相关变量
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// 移除未使用的变量，添加下划线前缀
const _noise2D = (_x: number, _y: number): number => {
  return Math.random() * 2 - 1;
};

// 时间范围变量，添加下划线前缀
const _timeRange = ref({ start: 0, end: 100 });

// 独立的 createAdvancedEffects 函数，确保可以导出
export function _createAdvancedEffects(
  targetCamera?: THREE.Camera,
  targetRenderer?: THREE.WebGLRenderer
) {
  try {
    // 使用传入的参数或全局变量（确保至少有一个可用）
    const effectCamera = targetCamera || camera;
    const effectRenderer = targetRenderer || renderer;
    const effectScene = scene;

    if (!effectScene || !effectCamera || !effectRenderer) {
      console.error('无法初始化后效处理: 场景、相机或渲染器不可用');
      return null;
    }

    // 解除Vue响应式代理，获取原始对象
    const rawScene = toRaw(effectScene);
    const rawCamera = toRaw(effectCamera);
    const rawRenderer = toRaw(effectRenderer);

    // 创建后期处理效果
    const composer = new EffectComposer(rawRenderer);

    // 确保RenderPass使用场景和相机的原始对象
    const renderPass = new RenderPass(rawScene, rawCamera);
    composer.addPass(renderPass);

    // 添加辉光效果
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // 添加环境光遮蔽效果
    const ssaoPass = new SSAOPass(
      rawScene,
      rawCamera,
      window.innerWidth,
      window.innerHeight
    );
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);

    // 添加色调映射 - 使用自定义着色器替代ToneMapShader
    const toneMappingShader = {
      uniforms: {
        tDiffuse: { value: null },
        exposure: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float exposure;
        varying vec2 vUv;

        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);

          // 使用NeutralToneMapping的计算方式
          vec3 color = texel.rgb * exposure;

          // 中性色调映射
          float a = 0.1;
          float b = 0.50;
          float c = 0.1;
          float d = 0.5;
          float e = 0.02;
          color = (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d);

          gl_FragColor = vec4(color, texel.a);
        }
      `
    };

    const toneMappingPass = new ShaderPass(toneMappingShader);
    toneMappingPass.uniforms.exposure.value = 1.0;
    composer.addPass(toneMappingPass);

    // 添加色彩校正
    const colorCorrectionShader = {
      uniforms: {
        tDiffuse: { value: null },
        powRGB: { value: new THREE.Vector3(2, 2, 2) },
        mulRGB: { value: new THREE.Vector3(1, 1, 1) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 powRGB;
        uniform vec3 mulRGB;
        varying vec2 vUv;
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          gl_FragColor = vec4(
            mulRGB * pow(texel.rgb, powRGB),
            texel.a
          );
        }
      `
    };

    const colorCorrectionPass = new ShaderPass(colorCorrectionShader);
    composer.addPass(colorCorrectionPass);

    return composer;
  } catch (error) {
    console.error('创建后效处理时出现错误:', error);
    return null;
  }
}

export function useDataVisualization(
  scene: THREE.Scene,
  _renderer: THREE.WebGLRenderer
) {
  // 状态管理
  const dataPoints = ref<DataPoint[]>([]);
  const currentTimestamp = ref<number>(Date.now());
  const visualizationMode = ref<'heatmap' | 'timeSeries' | 'category'>(
    'heatmap'
  );

  // 创建噪声生成器
  const _noise2D = createNoise2D();

  // 根据时间戳计算时间范围
  const _timeRange = _computed(() => {
    // ... existing code ...
  });

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

    const _timeRange = endTime - startTime;
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

  // 更新热力图
  const updateHeatmap = (_points: DataPoint[], options?: HeatmapOptions) => {
    // 移除旧的热力图
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.name.startsWith('heatmap-')) {
        scene.remove(child);
      }
    });

    // 创建热力图
    const maxDensity = Math.max(..._points.map(point => point.density || 0));

    _points.forEach(point => {
      const { position, density = 0 } = point;
      // 根据密度计算颜色
      const colorScale = density / maxDensity;
      const color = new THREE.Color().setHSL(0.6 - colorScale * 0.6, 1, 0.5);

      // 创建热力点
      const radius = options?.sizeScale
        ? 0.2 + colorScale * options.sizeScale
        : 0.2 + colorScale * 0.8;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: options?.opacity || 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.name = `heatmap-${position.x}-${position.y}-${position.z}`;
      scene.add(mesh);
    });
  };

  // 更新时间序列可视化
  const updateTimeSeriesVisualization = (_points: DataPoint[]) => {
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.name.startsWith('timepoint-')) {
        scene.remove(child);
      }
    });

    _points.forEach(point => {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(point.position);
      mesh.name = `timepoint-${point.timestamp}`;
      scene.add(mesh);
    });
  };

  // 更新分类可视化
  const updateCategoryVisualization = (_points: DataPoint[]) => {
    categoryGroups.value.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.Object3D) {
          const point = _points.find(
            p =>
              p.position.equals((child as THREE.Mesh).position) &&
              p.category === group.name.replace('category-', '')
          );

          if (!point) {
            group.remove(child);
          }
        }
      });
    });
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
    updateVisibleDataPoints,
    dispose
  };
}

// 导出场景相关变量
export { scene, camera, renderer };
