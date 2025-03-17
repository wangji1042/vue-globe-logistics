<!-- src/components/Globe/PerformancePanel.vue -->
<template>
  <div class="performance-panel" :class="{ 'is-warning': hasWarnings }">
    <div class="panel-header">
      <h3>Performance Monitor</h3>
      <div class="controls">
        <button @click="toggleMonitoring">
          {{ isMonitoring ? 'Stop' : 'Start' }} Monitoring
        </button>
        <button @click="exportPerformanceReport">Export Report</button>
      </div>
    </div>

    <div class="metrics">
      <div class="metric-item">
        <span class="label">FPS:</span>
        <span class="value" :class="getFPSClass">
          {{ metrics?.fps }}
        </span>
      </div>

      <div class="metric-item">
        <span class="label">Memory:</span>
        <span class="value">
          {{ metrics?.memory.used }}MB / {{ metrics?.memory.total }}MB
        </span>
      </div>

      <div class="metric-item">
        <span class="label">Draw Calls:</span>
        <span class="value">
          {{ metrics?.drawCalls }}
        </span>
      </div>

      <div class="metric-item">
        <span class="label">Triangles:</span>
        <span class="value">
          {{ metrics?.triangles }}
        </span>
      </div>
    </div>

    <div class="optimization-tips" v-if="optimizationTips?.length">
      <h4>Optimization Tips:</h4>
      <ul>
        <li v-for="(tip, index) in optimizationTips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  metrics: {
    fps: number;
    memory: {
      used: number;
      total: number;
    };
    drawCalls: number;
    triangles: number;
  };
  isMonitoring: boolean;
  optimizationTips: string[];
}>();

const emit = defineEmits<{
  (e: 'toggle-monitoring'): void;
  (e: 'export-report'): void;
}>();

const hasWarnings = computed(() => props.optimizationTips?.length > 0);

const getFPSClass = computed(() => {
  if (props.metrics?.fps < 30) return 'warning';
  if (props.metrics?.fps < 45) return 'moderate';
  return 'good';
});

const toggleMonitoring = () => emit('toggle-monitoring');
const exportPerformanceReport = () => emit('export-report');
</script>

<style lang="scss" scoped>
.performance-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  background: var(--globe-panel);
  padding: 15px;
  border-radius: 8px;
  min-width: 250px;

  &.is-warning {
    border: 1px solid #ff4444;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  h3 {
    margin: 0;
    color: var(--globe-text);
  }
}

.controls {
  display: flex;
  gap: 8px;

  button {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--globe-line);
    background: transparent;
    color: var(--globe-text);
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.metrics {
  .metric-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .label {
      color: var(--globe-text);
      opacity: 0.8;
    }

    .value {
      font-family: monospace;

      &.warning {
        color: #ff4444;
      }
      &.moderate {
        color: #ffa726;
      }
      &.good {
        color: #4caf50;
      }
    }
  }
}

.optimization-tips {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h4 {
    margin: 0 0 10px;
    color: var(--globe-text);
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: #ff4444;
    font-size: 0.9em;
  }
}
</style>
