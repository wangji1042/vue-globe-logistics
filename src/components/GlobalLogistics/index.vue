<!-- src/components/Global/index.vue -->
<template>
  <div ref="containerRef" class="global-container">
    <canvas ref="canvasRef"></canvas>

    <LoadingOverlay
      :show="isLoading"
      :progress="loadingProgress"
      :text="error || 'Loading...'"
    />

    <div class="performance-indicator" v-if="showPerformance">
      FPS: {{ fps }}
      <div :class="{ 'performance-warning': isLowPerformance }">
        {{ isLowPerformance ? 'Low Performance Mode' : 'Normal Performance' }}
      </div>
    </div>

    <div v-if="hoveredCity" class="city-tooltip" :style="tooltipStyle">
      {{ hoveredCity.name }}, {{ hoveredCity.country }}
    </div>

    <div class="control-panel" v-if="showPanel">
      <!-- Original control panel content -->
      <div class="options-section">
        <h4>Visual Options</h4>
        <div class="option-item">
          <label>Global Color</label>
          <input type="color" v-model="options.globalColor" />
        </div>
        <!-- Add more option controls -->
      </div>
    </div>

    <!-- 新增功能面板 -->
    <div class="advanced-panel" v-if="showAdvancedPanel">
      <div class="panel-section">
        <h3>Data Visualization</h3>
        <button @click="toggleHeatmap">Toggle Heatmap</button>
        <button @click="startTimelineAnimation">Start Timeline</button>
      </div>

      <div class="panel-section">
        <h3>Interaction Mode</h3>
        <select v-model="currentMode">
          <option v-for="mode in interactionModes" :key="mode">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="panel-section">
        <h3>Themes</h3>
        <select v-model="currentTheme">
          <option v-for="theme in availableThemes" :key="theme">
            {{ theme }}
          </option>
        </select>
      </div>

      <div class="panel-section">
        <h3>Data Import/Export</h3>
        <input type="file" @change="handleFileImport" accept=".json,.geojson" />
        <button @click="exportCurrentScene">Export Scene</button>
      </div>

      <div class="performance-metrics" v-if="showPerformanceMetrics">
        <div>FPS: {{ fps }}</div>
        <div>Memory: {{ memoryUsage }}MB</div>
        <div>Draw Calls: {{ drawCalls }}</div>
      </div>
    </div>

    <!-- 主题控制面板 -->
    <div class="theme-panel" v-if="showThemePanel">
      <h3>Theme Settings</h3>
      <div class="theme-selector">
        <label>Select Theme:</label>
        <select v-model="currentTheme">
          <option v-for="theme in availableThemes" :key="theme" :value="theme">
            {{ theme }}
          </option>
        </select>
      </div>

      <div class="theme-customization" v-if="showCustomization">
        <h4>Customize Theme</h4>
        <div class="color-picker">
          <label>Global Color:</label>
          <input
            type="color"
            v-model="customColors.global"
            @change="updateCustomTheme"
          />
        </div>
        <!-- 添加更多自定义选项 -->
      </div>
    </div>

    <!-- 性能监控面板 -->
    <PerformancePanel
      v-if="showPerformancePanel"
      :metrics="performanceMetrics"
      :is-monitoring="isMonitoring"
      :optimization-tips="optimizationTips"
      @toggle-monitoring="togglePerformanceMonitoring"
      @export-report="exportPerformanceReport"
    />

    <!-- 数据管理面板 -->
    <DataPanel
      v-if="showDataPanel"
      :current-data="globalData"
      @import="handleDataImport"
      @export="handleDataExport"
    />

    <!-- 交互控制面板 -->
    <InteractionPanel
      v-if="showInteractionPanel"
      v-model:mode="interactionMode"
      :measurement-points="measurementPoints"
      :measurement-distance="measurementDistance"
      :route-points="routePoints"
      :selected-objects="selectedObjects"
      :search-results="searchResults"
      @clear-measurement="clearMeasurement"
      @clear-route="clearRoute"
      @select-result="handleSearchResult"
    />

    <!-- 数据可视化面板 -->
    <VisualizationPanel
      v-if="showVisualizationPanel"
      v-model:mode="visualizationMode"
      :time-range="timeRange"
      :categories="categories"
      :is-playing="isTimeSeriesPlaying"
      @update:heatmap="updateHeatmap"
      @update:timeSeries="updateTimeSeries"
      @update:categories="updateCategories"
      @update:effects="updateEffects"
      @toggle-playback="toggleTimeSeriesPlayback"
    />

    <!-- 高级动画控制面板 -->
    <AnimationPanel
      v-if="showAnimationPanel"
      @update:global-rotation="updateGlobalRotation"
      @update:particles="updateParticles"
      @update:markers="updateMarkers"
      @update:lines="updateLines"
      @update:shadows="updateShadows"
      @update:lights="updateLights"
      @update:camera="updateCamera"
    />
  </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three';
import { ref, onMounted, onUnmounted, watch, computed, markRaw } from 'vue';
import { useGlobalStore } from '@/store/index';
import { useGlobal } from './useGlobal';
import { useCities, type City } from './useCities';
import { useLines } from './useLines';
import { useControls } from './useControls';
import { usePerformance } from './usePerformance';
import { useInteraction } from './useInteraction';
import { useAnimations } from './useAnimations';
import LoadingOverlay from './LoadingOverlay.vue';
import { defaultOptions, type GlobalOptions } from './types';
import { useTheme } from './useTheme';
import '@/styles/global-theme.scss';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import PerformancePanel from './PerformancePanel.vue';
import { useDataIO } from './useDataIO';
import DataPanel from './DataPanel.vue';
import type { DataFormat } from './types/data';
import { useAdvancedInteraction } from './useAdvancedInteraction';
import InteractionPanel from './InteractionPanel.vue';
import { useDataVisualization } from './useDataVisualization';
import VisualizationPanel from './VisualizationPanel.vue';
import { useAdvancedAnimation } from './useAdvancedAnimation';
import AnimationPanel from './AnimationPanel.vue';

const props = defineProps({
  showPanel: { type: Boolean, default: true },
  showPerformance: { type: Boolean, default: false },
  options: {
    type: Object as PropType<Partial<GlobalOptions>>,
    default: () => ({})
  },
  initialTheme: {
    type: String,
    default: 'dark'
  },
  showThemePanel: {
    type: Boolean,
    default: true
  },
  showCustomization: {
    type: Boolean,
    default: true
  },
  showPerformancePanel: {
    type: Boolean,
    default: true
  },
  showDataPanel: {
    type: Boolean,
    default: true
  },
  showInteractionPanel: {
    type: Boolean,
    default: true
  },
  showVisualizationPanel: {
    type: Boolean,
    default: true
  },
  showAnimationPanel: {
    type: Boolean,
    default: true
  }
});

// Merge default options with provided options
const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options
}));

const store = useGlobalStore();
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const isLoading = ref(true);
const error = ref<string | null>(null);
const isInitialized = ref(false); // Track initialization

const loadingProgress = ref(0);

// --- Refs for Three.js objects from useGlobal ---
const scene = ref<THREE.Scene | null>(null);
const camera = ref<THREE.PerspectiveCamera | null>(null);
const renderer = ref<THREE.WebGLRenderer | null>(null);
// const earthSphere = ref<THREE.Mesh | null>(null); // Let useGlobal manage its own earth ref if needed
const animationFrameId = ref<number>();

// --- Cleanup functions array ---
const cleanupFunctions: (() => void)[] = [];

// --- Add refs for texture/material/geometry if needed outside try block ---
// let earthGeometry: THREE.SphereGeometry | null = null;
// let earthMaterial: THREE.MeshPhongMaterial | null = null;
// let earthTexture: THREE.Texture | null = null;
const earth = ref<THREE.Mesh | null>(null); // Keep ref for the earth model

// 控制相关 (添加回来)
const controls = ref<{
  update: () => void;
  dispose: () => void;
} | null>(null);
let disposeControls: (() => void) | undefined;

// Cities 相关 (添加回来)
let disposeCities: (() => void) | undefined;
const { currentTheme, getTheme, addTheme, switchTheme, availableThemes } =
  useTheme();

// 自定义主题数据
const customColors = ref({
  global: '#2C3E50',
  marker: '#FF5252',
  line: '#4CAF50'
});

// 更新自定义主题
const updateCustomTheme = () => {
  addTheme('custom', {
    colors: {
      ...getTheme().colors,
      ...customColors.value
    }
  });
  switchTheme('custom');
};

// 初始化主题
onMounted(() => {
  isLoading.value = true;
  error.value = null;
  isInitialized.value = false;

  if (!containerRef.value || !canvasRef.value) {
    error.value = 'Container or Canvas not found!';
    isLoading.value = false;
    console.error(error.value);
    return;
  }

  const canvas = canvasRef.value;
  const container = containerRef.value;

  // --- Wrap initialization in an async function to handle texture loading ---
  const initializeScene = async () => {
    try {
      console.log('Initializing Inlined Earth test...');

      // --- Create Scene, Camera, Renderer (Inlined + markRaw) ---
      const _scene = markRaw(new THREE.Scene());
      _scene.background = new THREE.Color(0x111111); // Set background if desired
      scene.value = _scene;

      const _camera = markRaw(
        new THREE.PerspectiveCamera(
          45, // 增大视野角度
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        )
      );
      _camera.position.set(0, 0, 6); // 调整相机位置更近
      _camera.lookAt(0, 0, 0);
      camera.value = _camera;

      const _renderer = markRaw(
        new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      );
      _renderer.setSize(container.clientWidth, container.clientHeight);
      _renderer.setPixelRatio(window.devicePixelRatio);
      _renderer.setClearColor(0x000000, 0);
      renderer.value = _renderer;

      // --- Add Lights (Inlined + markRaw) ---
      const ambientLight = markRaw(new THREE.AmbientLight(0xffffff, 0.5));
      scene.value.add(ambientLight);
      const directionalLight = markRaw(new THREE.DirectionalLight(0xffffff, 1));
      directionalLight.position.set(5, 5, 5);
      scene.value.add(directionalLight);
      console.log('Lights added directly.');

      // --- Create Earth with Texture (Inlined + Deep markRaw) ---
      console.log('Creating Earth sphere with texture (Deep markRaw)...');

      // 1. Mark Geometry
      const geometry = markRaw(new THREE.SphereGeometry(2, 64, 64));

      // 2. Load and Mark Texture (using a simple loading manager locally)
      const loadingManager = new THREE.LoadingManager(); // Local manager
      loadingManager.onLoad = () => {
        console.log('Texture loaded.');
        isLoading.value = false;
      }; // Update loading state
      loadingManager.onError = url => {
        console.error(`Texture load error: ${url}`);
        error.value = `Texture load error: ${url}`;
        isLoading.value = false;
      };
      // Keep isLoading true until texture attempt completes
      // isLoading.value = true; // Already set at start of onMounted

      // Use the actual path to your earth texture
      const earthTexturePath = '/src/assets/images/earth.jpg'; // Adjust path as needed relative to public or use import

      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load(
          earthTexturePath, // Use correct path
          loadedTexture => {
            loadedTexture.minFilter = THREE.LinearFilter;
            loadedTexture.magFilter = THREE.LinearFilter;
            const markedTexture = markRaw(loadedTexture); // Mark Texture
            // earthTexture = markedTexture; // Assign if needed outside
            resolve(markedTexture);
          },
          undefined, // Progress callback (optional)
          err => {
            console.error('Texture loading Promise rejected:', err);
            reject(err); // Reject the promise on error
          }
        );
      });
      console.log('Texture Promise resolved.');

      // 3. Create and Mark Material
      const material = markRaw(
        new THREE.MeshPhongMaterial({
          map: texture, // Use marked texture
          shininess: 5
        })
      );
      // earthMaterial = material; // Assign if needed outside

      // 4. Create and Mark Mesh
      const earthMesh = markRaw(new THREE.Mesh(geometry, material));
      scene.value.add(earthMesh);
      earth.value = earthMesh; // Assign to component ref
      console.log('Earth mesh added directly to scene.');

      // --- Initialize Controls ---
      if (camera.value && canvasRef.value) {
        console.log('Initializing Controls...');
        // Pass component's camera.value and canvasRef.value
        const {
          // controls: ctrlInstance, // We might not need the raw instance if update/dispose are sufficient
          initControls,
          updateControls,
          dispose: ctrlDispose
        } = useControls(camera.value, canvasRef.value);

        // Ensure useControls internally uses markRaw(new OrbitControls(...))
        controls.value = { update: updateControls, dispose: ctrlDispose }; // Store the functions
        initControls(); // Configure controls
        disposeControls = ctrlDispose; // Save dispose function for onUnmounted
        cleanupFunctions.push(() => {
          // Add controls dispose to general cleanup
          if (disposeControls) {
            try {
              disposeControls();
              console.log('Controls disposed via cleanup.');
            } catch (e) {
              console.error('Error disposing controls', e);
            }
          }
        });
        console.log('Controls Initialized.');
      } else {
        console.error(
          'Cannot initialize Controls: Camera or Canvas Ref not available.'
        );
        error.value = '无法初始化控件'; // Set error state
      }

      // --- Initialize Cities ---
      if (scene.value && earth.value) {
        console.log('Initializing Cities...');
        const { createCityMesh, dispose: citiesDispose } = useCities(
          earth.value,
          2
        ); // 传入地球实例和半径

        createCityMesh();
        disposeCities = citiesDispose;

        cleanupFunctions.push(() => {
          if (disposeCities) {
            try {
              disposeCities();
              console.log('Cities disposed via cleanup.');
            } catch (e) {
              console.error('Error disposing cities', e);
            }
          }
        });
        console.log('Cities Initialized.');
      } else {
        console.error(
          'Cannot initialize Cities: Scene or Earth Ref not available.'
        );
        error.value = '无法初始化城市'; // Set error state
      }

      // --- Handle Resize ---
      const onWindowResize = () => {
        if (camera.value && renderer.value && container) {
          camera.value.aspect = container.clientWidth / container.clientHeight;
          camera.value.updateProjectionMatrix();
          renderer.value.setSize(container.clientWidth, container.clientHeight);
        }
      };
      window.addEventListener('resize', onWindowResize);
      cleanupFunctions.push(() =>
        window.removeEventListener('resize', onWindowResize)
      );

      // --- Animation Loop ---
      const animate = () => {
        animationFrameId.value = requestAnimationFrame(animate);

        if (earth.value) {
          // Rotate the earth
          earth.value.rotation.y += 0.001;
        }

        // Update controls IF/WHEN re-added
        if (controls.value?.update) {
          controls.value.update();
        }

        if (
          isInitialized.value &&
          renderer.value &&
          scene.value &&
          camera.value
        ) {
          console.log(
            'Camera Position:',
            camera.value.position.x,
            camera.value.position.y,
            camera.value.position.z
          ); // <-- 添加日志
          try {
            renderer.value.render(scene.value, camera.value);
          } catch (renderError) {
            console.error('渲染时出错 (Inlined Earth):', renderError);
            if (animationFrameId.value)
              cancelAnimationFrame(animationFrameId.value);
            error.value = `渲染出错: ${renderError}`;
            isInitialized.value = false;
          }
        } else if (!isInitialized.value) {
          console.warn(
            'Animation loop running before init complete or after error (Inlined Earth).'
          );
        }
      };

      isInitialized.value = true;
      // Loading state is handled by loadingManager now
      animate(); // Start the loop only after successful initialization
      console.log('Inlined Earth Initialized');
    } catch (initError) {
      console.error('初始化失败 (Inlined Earth):', initError);
      error.value = `初始化失败: ${initError}`;
      isLoading.value = false; // Ensure loading stops on error
    }
  };

  // --- Call the async initialization function ---
  initializeScene();
}); // End of onMounted

// 监听主题变化，更新三维场景
watch(currentTheme, () => {
  const theme = getTheme();
  // 更新三维场景的材质和颜色
  updateSceneMaterials(theme);
});

// 更新场景材质
const updateSceneMaterials = (theme: GlobalTheme) => {
  // 更新地球材质
  if (earth.value) {
    const material = earth.value.material as THREE.MeshPhongMaterial;
    material.color.setStyle(theme.colors.global);
  }

  // 更新标记点材质
  cityMeshes.value.forEach(mesh => {
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.color.setStyle(theme.colors.marker);
  });

  // 更新飞线材质
  lines.value.forEach(line => {
    const material = line.material as THREE.LineBasicMaterial;
    material.color.setStyle(theme.colors.line);
  });
};

// 添加航线
const addFlightLine = () => {
  if (fromCity.value && toCity.value) {
    store.addFlightLine(fromCity.value.name, toCity.value.name);
  }
};

// 监听航线变化
watch(
  () => store.flightLines,
  newLines => {
    // 更新航线显示
  }
);

const { currentData, importData, exportData } = useDataIO();

const handleDataImport = async (file: File, format: DataFormat) => {
  const success = await importData(file, format);
  if (success) {
    // 更新场景
    updateScene(currentData.value);
  }
};

const handleDataExport = (format: DataFormat) => {
  exportData(format);
};

const updateScene = (data: GlobalData) => {
  // 更新城市标记
  updateCityMarkers(data.cities);
  // 更新航线
  updateFlightRoutes(data.routes);
};

// 处理交互事件
const handleSearchResult = (result: THREE.Object3D) => {
  // 实现搜索结果处理
};

const clearMeasurement = () => {
  // 实现清除测量
};

const clearRoute = () => {
  // 实现清除路线
};

// 动画控制处理器
const updateGlobalRotation = (options: any) => {
  // 实现全球旋转更新
};

const updateParticles = (options: any) => {
  // 实现粒子系统更新
};

const updateMarkers = (options: any) => {
  // 实现标记动画更新
};

const updateLines = (options: any) => {
  // 实现飞线动画更新
};

onUnmounted(() => {
  console.log('组件卸载 (Inlined Earth)，执行清理...');
  isInitialized.value = false;
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);

  // Dispose Three.js objects created locally
  if (earth.value) {
    const mesh = earth.value;
    mesh.geometry?.dispose();
    if (mesh.material instanceof THREE.MeshPhongMaterial) {
      // Check type
      mesh.material.map?.dispose(); // Dispose texture
      mesh.material.dispose();
    }
    scene.value?.remove(mesh); // Remove from scene
    console.log('Earth mesh disposed.');
  }
  // Dispose lights?
  scene.value?.traverse(object => {
    if (object instanceof THREE.Light) {
      scene.value?.remove(object);
      // Lights don't have a standard dispose method like geometry/material
    }
  });

  renderer.value?.dispose();
  console.log('Renderer disposed.');

  // Call other cleanup functions (like resize listener)
  cleanupFunctions.forEach((cleanup, index) => {
    try {
      cleanup();
    } catch (e) {
      console.error(`Cleanup func #${index + 1} error:`, e);
    }
  });
  cleanupFunctions.length = 0;

  scene.value = null;
  camera.value = null;
  renderer.value = null;
  earth.value = null; // Clear earth ref

  console.log('清理完成 (Inlined Earth)。');
});
</script>

<style scoped>
/* Minimal styles */
.global-container {
  /* position: fixed; */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* overflow: hidden; */
  /* background-color: #1a1a1a; */
}

#container {
  width: 100%;
  height: 100%;
  position: absolute;
}

canvas {
  display: block; /* 确保canvas没有额外间距 */
  width: 100%;
  height: 100%;
  margin: 0; /* 添加外边距为0 */
  padding: 0; /* 添加内边距为0 */
}
.loading-overlay-minimal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 1.5em;
  z-index: 10;
}
</style>
