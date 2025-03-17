<!-- src/components/Globe/index.vue -->
<template>
  <div
    class="globe-container"
    ref="containerRef"
    @mousemove="onMouseMove"
    @click="onMouseClick"
  >
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
          <label>Globe Color</label>
          <input type="color" v-model="options.globeColor" />
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
          <label>Globe Color:</label>
          <input
            type="color"
            v-model="customColors.globe"
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
      :current-data="globeData"
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
      @update:globe-rotation="updateGlobeRotation"
      @update:particles="updateParticles"
      @update:markers="updateMarkers"
      @update:lines="updateLines"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useGlobeStore } from '@/store/index';
import { useGlobe } from './useGlobe';
import { useCities, type City } from './useCities';
import { useLines } from './useLines';
import { useControls } from './useControls';
import { usePerformance } from './usePerformance';
import { useInteraction } from './useInteraction';
import { useAnimations } from './useAnimations';
import LoadingOverlay from './LoadingOverlay.vue';
import { defaultOptions, type GlobeOptions } from './types';
import { useTheme } from './useTheme';
import '@/styles/globe-theme.scss';
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
    type: Object as PropType<Partial<GlobeOptions>>,
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

const store = useGlobeStore();
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const fromCity = ref<City>();
const toCity = ref<City>();

let disposeGlobe: (() => void) | undefined;
let disposeCities: (() => void) | undefined;
let disposeLines: (() => void) | undefined;
let disposeControls: (() => void) | undefined;

const { currentTheme, getTheme, addTheme, switchTheme, availableThemes } =
  useTheme();

// 自定义主题数据
const customColors = ref({
  globe: '#2C3E50',
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
  switchTheme(props.initialTheme);
});

// 监听主题变化，更新三维场景
watch(currentTheme, () => {
  const theme = getTheme();
  // 更新三维场景的材质和颜色
  updateSceneMaterials(theme);
});

// 更新场景材质
const updateSceneMaterials = (theme: GlobeTheme) => {
  // 更新地球材质
  if (earth.value) {
    const material = earth.value.material as THREE.MeshPhongMaterial;
    material.color.setStyle(theme.colors.globe);
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

onMounted(async () => {
  if (!containerRef.value || !canvasRef.value) return;

  const {
    scene,
    camera,
    renderer,
    initGlobe,
    animate,
    dispose: globeDispose
  } = useGlobe(canvasRef.value);

  const {
    cities,
    createCityMesh,
    dispose: citiesDispose,
    latLongToVector3
  } = useCities(scene);

  const {
    addLine,
    updateLines,
    dispose: linesDispose
  } = useLines(scene, latLongToVector3);

  const {
    initControls,
    updateControls,
    dispose: controlsDispose
  } = useControls(camera, canvasRef.value);

  // 存储清理函数
  disposeGlobe = globeDispose;
  disposeCities = citiesDispose;
  disposeLines = linesDispose;
  disposeControls = controlsDispose;

  // 初始化
  await initGlobe();
  createCityMesh();
  initControls();

  const { fps, isLowPerformance, measurePerformance } = usePerformance(
    scene,
    renderer
  );
  const {
    selectedCity,
    hoveredCity,
    onMouseMove,
    onMouseClick,
    checkIntersection
  } = useInteraction(camera, containerRef.value!);
  const { animateCameraToPosition, animateMarker, animateLine } =
    useAnimations(camera);

  // 在场景初始化后设置性能监控

  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    exportPerformanceReport,
    getOptimizationTips
  } = usePerformanceMonitoring(renderer, scene);

  // 暴露性能指标和控制方法
  const togglePerformanceMonitoring = () => {
    if (isMonitoring.value) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // 自动开始监控
  startMonitoring();

  if (!containerRef.value || !canvasRef.value) return;

  // 初始化场景等

  const {
    currentMode,
    selectedObjects,
    measurementPoints,
    routePoints,
    searchResults,
    getMeasurementDistance,
    calculateRoute,
    setInteractionMode,
    init: initInteraction,
    dispose: disposeInteraction
  } = useAdvancedInteraction(scene, camera, renderer, containerRef.value);

  // 存储到组件实例
  interactionMode = currentMode;

  // 初始化交互系统
  initInteraction();

  // 清理函数
  onUnmounted(() => {
    disposeInteraction();
  });

  const {
    dataPoints,
    visualizationMode,
    currentTimestamp,
    createHeatmap,
    createTimeSeriesAnimation,
    createCategoryVisualization,
    createAdvancedEffects,
    updateVisibleDataPoints,
    dispose: disposeVisualization
  } = useDataVisualization(scene, renderer);

  // 初始化可视化
  const composer = createAdvancedEffects();

  // 清理函数
  onUnmounted(() => {
    disposeVisualization();
  });

  if (!containerRef.value || !canvasRef.value) return;

  const {
    animateCamera,
    createParticleSystem,
    createFlyLine,
    createCityMarker,
    createGlobeRotation,
    updateAnimations,
    dispose: disposeAnimation
  } = useAdvancedAnimation(scene, camera);

  // 初始化动画系统
  const globeRotation = createGlobeRotation(earth.value!);
  const particleSystem = createParticleSystem({
    count: 1000,
    size: 0.1,
    speed: 1,
    color: '#ffffff',
    opacity: 0.6
  });

  // 动画循环
  const clock = new THREE.Clock();

  // Enhanced animation loop
  const animationLoop = () => {
    requestAnimationFrame(animationLoop);
    measurePerformance();
    checkIntersection(cityMeshes.value);
    updateLines();
    controls.update();
    const delta = clock.getDelta();

    globeRotation.animate();
    updateAnimations(delta);
    updateVisibleDataPoints();
    composer.render();

    renderer.render(scene, camera);
  };

  animationLoop();

  // 清理函数
  onUnmounted(() => {
    disposeAnimation();
  });
});

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

const updateScene = (data: GlobeData) => {
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
const updateGlobeRotation = (options: any) => {
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
  disposeGlobe?.();
  disposeCities?.();
  disposeLines?.();
  disposeControls?.();
});
</script>

<style scoped>
.globe-container {
  background-color: var(--globe-background);
  color: var(--globe-text);
  font-family: var(--globe-font-primary);
}

.theme-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: var(--globe-panel-width);
  background-color: var(--globe-panel);
  padding: 15px;
  border-radius: 8px;

  h3,
  h4 {
    color: var(--globe-text);
    margin-bottom: 10px;
  }
}

.theme-selector {
  margin-bottom: 15px;

  select {
    width: 100%;
    padding: 5px;
    margin-top: 5px;
    background-color: var(--globe-background);
    color: var(--globe-text);
    border: 1px solid var(--globe-line);
  }
}

.theme-customization {
  .color-picker {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    label {
      flex: 1;
    }

    input {
      width: 50px;
      height: 25px;
      padding: 0;
      border: none;
    }
  }
}

canvas {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
}

.control-item {
  margin: 10px 0;
}

select,
button {
  margin: 5px;
  padding: 5px;
}
.performance-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}

.performance-warning {
  color: #ff4444;
}

.city-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  pointer-events: none;
}

.options-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.option-item {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
