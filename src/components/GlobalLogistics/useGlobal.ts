// 地球相关逻辑
// src/components/Global/useGlobal.ts
import * as THREE from 'three';
import { ref, markRaw } from 'vue';
import earthTexture from '@/assets/images/earth.jpg';

// import { useGlobal } from './useGlobal';

export function useGlobal(canvas: HTMLCanvasElement) {
  const scene = markRaw(new THREE.Scene());
  const camera = markRaw(
    new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );
  const renderer = markRaw(
    new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
  );

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
  const earth = ref<THREE.Mesh | null>(null);

  // 初始化地球
  const initGlobal = async () => {
    try {
      isLoading.value = true;

      // 设置相机位置
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // 设置渲染器
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // 添加平行光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // 创建地球
      const geometry = new THREE.SphereGeometry(2, 64, 64);
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load(
          earthTexture,
          texture => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          },
          undefined,
          error => {
            console.error('Error loading texture:', error);
            reject(error);
          }
        );
      });

      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 5
      });

      earth.value = new THREE.Mesh(geometry, material);
      if (earth.value) {
        earth.value = markRaw(earth.value);
      }
      scene.add(earth.value);

      // 添加窗口大小变化监听
      window.addEventListener('resize', onWindowResize);

      isLoading.value = false;
    } catch (err) {
      console.error('Error in initGlobal:', err);
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
      earth.value.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
  };

  // 清理函数
  const dispose = () => {
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
    if (earth.value) {
      earth.value.geometry.dispose();
      if (earth.value.material instanceof THREE.Material) {
        earth.value.material.dispose();
      }
    }
  };

  return {
    scene,
    camera,
    renderer,
    earth,
    initGlobal,
    animate,
    dispose,
    isLoading,
    loadingProgress,
    error
  };
}
