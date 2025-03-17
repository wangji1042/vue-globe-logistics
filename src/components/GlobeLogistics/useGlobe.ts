// 地球相关逻辑
// src/components/Globe/useGlobe.ts
import * as THREE from 'three';
import { ref } from 'vue';

import earth_map from '@/assets/images/earth_map.jpg';

interface LoadingManager {
  onProgress: (url: string, loaded: number, total: number) => void;
  onError: (url: string) => void;
}

export function useGlobe(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  const isLoading = ref(true);
  const loadingProgress = ref(0);
  const error = ref<string | null>(null);

  // 创建加载管理器
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (url, loaded, total) => {
    loadingProgress.value = loaded / total;
  };
  loadingManager.onError = url => {
    error.value = `Failed to load resource: ${url}`;
  };
  loadingManager.onLoad = () => {
    isLoading.value = false;
  };

  // 地球对象引用
  const earth = ref<THREE.Mesh>();

  // 初始化地球
  const initGlobe = async () => {
    try {
      // 设置渲染器
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // 设置相机位置
      camera.position.z = 200;

      // 创建地球
      const geometry = new THREE.SphereGeometry(50, 64, 64);

      // 加载地球贴图
      const textureLoader = new THREE.TextureLoader();
      const texture = await textureLoader.loadAsync(earth_map);

      const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.5
      });

      earth.value = new THREE.Mesh(geometry, material);
      scene.add(earth.value);

      // 添加环境光和平行光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      // 监听窗口尺寸变化
      window.addEventListener('resize', onWindowResize);
      // 使用加载管理器创建纹理加载器
      const textureLoader2 = new THREE.TextureLoader(loadingManager);

      // 错误处理
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // 异步加载所有纹理
      const [earthTexture, bumpMap, specMap] = await Promise.all([
        textureLoader2.loadAsync('/earth-map.jpg'),
        textureLoader2.loadAsync('/earth-bump.jpg'),
        textureLoader2.loadAsync('/earth-spec.jpg')
      ]).catch(err => {
        throw new Error(`Failed to load textures: ${err.message}`);
      });

      // ... 其余代码 ...
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
      isLoading.value = false;
      throw err;
    }
  };

  // 处理窗口尺寸变化
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);

    if (earth.value) {
      // 地球自转
      earth.value.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
  };

  // 清理函数
  const dispose = () => {
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
    // 清理几何体和材质
    earth.value?.geometry.dispose();
    if (earth.value?.material instanceof THREE.Material) {
      earth.value.material.dispose();
    }
  };

  return {
    scene,
    camera,
    renderer,
    earth,
    initGlobe,
    animate,
    dispose,
    isLoading,
    loadingProgress,
    error
  };
}
