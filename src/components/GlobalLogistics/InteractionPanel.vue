<!-- src/components/Global/InteractionPanel.vue -->
<template>
  <div class="interaction-panel">
    <div class="mode-selector">
      <h3>Interaction Mode</h3>
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

    <!-- 模式特定控制 -->
    <div class="mode-controls">
      <!-- 测量工具 -->
      <div v-if="currentMode === 'measure'" class="measure-controls">
        <h4>Measurement</h4>
        <div class="measurement-info">
          <p>Points: {{ measurementPoints.length }}</p>
          <p>Distance: {{ formatDistance(measurementDistance) }}</p>
        </div>
        <button @click="clearMeasurement">Clear</button>
      </div>

      <!-- 路线规划 -->
      <div v-if="currentMode === 'route'" class="route-controls">
        <h4>Route Planning</h4>
        <div class="route-points">
          <div v-for="(point, index) in routePoints" :key="index">
            {{ point.name }}
          </div>
        </div>
        <button @click="clearRoute">Clear Route</button>
      </div>

      <!-- 搜索功能 -->
      <div class="search-controls">
        <h4>Search</h4>
        <input type="text" v-model="searchTerm" placeholder="Search..." />
        <div class="search-results" v-if="searchResults?.length">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="search-result"
            @click="selectSearchResult(result)"
          >
            {{ result.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 选中对象信息 -->
    <div v-if="selectedObjects?.length" class="selection-info">
      <h4>Selected Objects</h4>
      <div
        v-for="object in selectedObjects"
        :key="object.id"
        class="selected-object"
      >
        {{ object.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { InteractionMode } from './useAdvancedInteraction';

const props = defineProps<{
  currentMode: InteractionMode;
  measurementPoints: THREE.Vector3[];
  measurementDistance: number;
  routePoints: any[];
  selectedObjects: THREE.Object3D[];
  searchResults: THREE.Object3D[];
}>();

const emit = defineEmits<{
  (e: 'update:mode', mode: InteractionMode): void;
  (e: 'clear-measurement'): void;
  (e: 'clear-route'): void;
  (e: 'select-result', result: THREE.Object3D): void;
}>();

const modes: InteractionMode[] = ['view', 'select', 'measure', 'route', 'area'];

const formatMode = (mode: InteractionMode) => {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const formatDistance = (distance: number) => {
  return `${distance.toFixed(2)} units`;
};

const setMode = (mode: InteractionMode) => {
  emit('update:mode', mode);
};

const clearMeasurement = () => {
  emit('clear-measurement');
};

const clearRoute = () => {
  emit('clear-route');
};

const selectSearchResult = (result: THREE.Object3D) => {
  emit('select-result', result);
};
</script>

<style lang="scss" scoped>
.interaction-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--global-panel);
  padding: 15px;
  border-radius: 8px;
  width: 300px;
  color: var(--global-text);

  .mode-selector {
    margin-bottom: 20px;

    h3 {
      margin-bottom: 10px;
    }

    .mode-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      button {
        padding: 8px;
        border: 1px solid var(--global-line);
        background: transparent;
        color: var(--global-text);
        border-radius: 4px;
        cursor: pointer;

        &.active {
          background: var(--global-line);
        }

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .mode-controls {
    > div {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .measurement-info {
    margin: 10px 0;
    font-family: monospace;
  }

  .route-points {
    margin: 10px 0;
    max-height: 150px;
    overflow-y: auto;

    > div {
      padding: 5px;
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 5px;
      border-radius: 4px;
    }
  }

  .search-controls {
    input {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--global-text);
      border-radius: 4px;
      margin-top: 5px;
    }

    .search-results {
      margin-top: 10px;
      max-height: 200px;
      overflow-y: auto;

      .search-result {
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .selection-info {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .selected-object {
      padding: 5px;
      margin: 5px 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  }
}
</style>
