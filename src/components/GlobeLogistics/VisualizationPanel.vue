<!-- src/components/Globe/VisualizationPanel.vue -->
<template>
  <div class="visualization-panel">
    <div class="mode-selector">
      <h3>Visualization Mode</h3>
      <div class="mode-buttons">
        <button
          v-for="mode in modes"
          :key="mode"
          :class="{ active: currentMode === mode }"
          @click="setMode(mode)"
        >
          {{ formatMode(mode) }}
        </button>
      </div>
    </div>

    <!-- 热力图控制 -->
    <div v-if="currentMode === 'heatmap'" class="control-section">
      <h4>Heatmap Settings</h4>
      <div class="control-item">
        <label>Radius</label>
        <input type="range" v-model="heatmapOptions.radius" min="5" max="50" />
      </div>
      <div class="control-item">
        <label>Intensity</label>
        <input
          type="range"
          v-model="heatmapOptions.intensity"
          min="0"
          max="1"
          step="0.1"
        />
      </div>
      <div class="control-item">
        <label>Blur</label>
        <input
          type="range"
          v-model="heatmapOptions.blur"
          min="0"
          max="2"
          step="0.1"
        />
      </div>
    </div>

    <!-- 时间序列控制 -->
    <div v-if="currentMode === 'timeSeries'" class="control-section">
      <h4>Time Series</h4>
      <div class="time-controls">
        <button @click="togglePlayback">
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        <input
          type="range"
          v-model="currentTime"
          :min="timeRange.start"
          :max="timeRange.end"
        />
        <div class="time-display">
          {{ formatTime(currentTime) }}
        </div>
      </div>
      <div class="control-item">
        <label>Speed</label>
        <input
          type="range"
          v-model="timeSeriesOptions.speed"
          min="0.1"
          max="5"
          step="0.1"
        />
      </div>
    </div>

    <!-- 分类展示控制 -->
    <div v-if="currentMode === 'category'" class="control-section">
      <h4>Categories</h4>
      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category"
          class="category-item"
          :style="{ borderColor: getCategoryColor(category) }"
        >
          <label>
            <input
              type="checkbox"
              v-model="visibleCategories"
              :value="category"
            />
            {{ category }}
          </label>
        </div>
      </div>
    </div>

    <!-- 视觉效果控制 -->
    <div class="control-section">
      <h4>Visual Effects</h4>
      <div class="control-item">
        <label>
          <input type="checkbox" v-model="effectsOptions.bloom" />
          Bloom Effect
        </label>
      </div>
      <div class="control-item">
        <label>
          <input type="checkbox" v-model="effectsOptions.ssao" />
          Ambient Occlusion
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  currentMode: 'heatmap' | 'timeSeries' | 'category';
  timeRange: { start: number; end: number };
  categories: string[];
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:mode', mode: string): void;
  (e: 'update:heatmap', options: any): void;
  (e: 'update:timeSeries', options: any): void;
  (e: 'update:categories', categories: string[]): void;
  (e: 'update:effects', options: any): void;
  (e: 'toggle-playback'): void;
}>();

const modes = ['heatmap', 'timeSeries', 'category'];

const heatmapOptions = ref({
  radius: 20,
  intensity: 0.7,
  blur: 0.8
});

const timeSeriesOptions = ref({
  speed: 1,
  loop: true
});

const visibleCategories = ref<string[]>([]);
const effectsOptions = ref({
  bloom: true,
  ssao: false
});

const currentTime = ref(props.timeRange?.start);

const formatMode = (mode: string) => {
  return mode.replace(/([A-Z])/g, ' $1').trim();
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const togglePlayback = () => {
  emit('toggle-playback');
};

const getCategoryColor = (category: string) => {
  // 使用与主要可视化相同的颜色生成逻辑
  return '#ffffff'; // 临时返回值
};

// 监听选项变化
watch(
  heatmapOptions,
  newOptions => {
    emit('update:heatmap', newOptions);
  },
  { deep: true }
);

watch(
  timeSeriesOptions,
  newOptions => {
    emit('update:timeSeries', newOptions);
  },
  { deep: true }
);

watch(visibleCategories, newCategories => {
  emit('update:categories', newCategories);
});

watch(
  effectsOptions,
  newOptions => {
    emit('update:effects', newOptions);
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.visualization-panel {
  background: var(--globe-panel);
  padding: 15px;
  border-radius: 8px;
  color: var(--globe-text);

  .mode-selector {
    margin-bottom: 20px;
  }

  .control-section {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }
  }

  .control-item {
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    label {
      margin-right: 10px;
    }

    input[type='range'] {
      flex: 1;
    }
  }

  .time-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;

    input[type='range'] {
      flex: 1;
    }

    .time-display {
      font-family: monospace;
      min-width: 100px;
    }
  }

  .category-list {
    max-height: 200px;
    overflow-y: auto;

    .category-item {
      padding: 5px;
      margin: 5px 0;
      border-left: 3px solid;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
