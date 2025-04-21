<!-- src/components/Global/AnimationPanel.vue -->
<template>
  <div class="animation-panel">
    <div class="panel-section">
      <h3>Animation Controls</h3>

      <!-- 全球旋转控制 -->
      <div class="control-group">
        <h4>Global Rotation</h4>
        <div class="control-item">
          <label>Auto Rotate</label>
          <input
            type="checkbox"
            v-model="globalRotation.enabled"
            @change="updateGlobalRotation"
          />
        </div>
        <div class="control-item">
          <label>Speed</label>
          <input
            type="range"
            v-model="globalRotation.speed"
            min="0"
            max="0.01"
            step="0.001"
            :disabled="!globalRotation.enabled"
            @input="updateGlobalRotation"
          />
        </div>
      </div>

      <!-- 粒子系统控制 -->
      <div class="control-group">
        <h4>Particle Effects</h4>
        <div class="control-item">
          <label>Enable Particles</label>
          <input
            type="checkbox"
            v-model="particles.enabled"
            @change="updateParticles"
          />
        </div>
        <template v-if="particles.enabled">
          <div class="control-item">
            <label>Density</label>
            <input
              type="range"
              v-model="particles.count"
              min="100"
              max="5000"
              step="100"
              @input="updateParticles"
            />
          </div>
          <div class="control-item">
            <label>Speed</label>
            <input
              type="range"
              v-model="particles.speed"
              min="0.1"
              max="2"
              step="0.1"
              @input="updateParticles"
            />
          </div>
        </template>
      </div>

      <!-- 标记动画控制 -->
      <div class="control-group">
        <h4>Marker Animations</h4>
        <div class="control-item">
          <label>Pulse Effect</label>
          <input
            type="checkbox"
            v-model="markers.pulse"
            @change="updateMarkers"
          />
        </div>
        <div class="control-item">
          <label>Pulse Speed</label>
          <input
            type="range"
            v-model="markers.pulseSpeed"
            min="0.5"
            max="2"
            step="0.1"
            :disabled="!markers.pulse"
            @input="updateMarkers"
          />
        </div>
      </div>

      <!-- 飞线动画控制 -->
      <div class="control-group">
        <h4>Flight Lines</h4>
        <div class="control-item">
          <label>Line Speed</label>
          <input
            type="range"
            v-model="lines.speed"
            min="0.5"
            max="2"
            step="0.1"
            @input="updateLines"
          />
        </div>
        <div class="control-item">
          <label>Arc Height</label>
          <input
            type="range"
            v-model="lines.arcFactor"
            min="0.1"
            max="0.5"
            step="0.1"
            @input="updateLines"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'update:global-rotation', options: any): void;
  (e: 'update:particles', options: any): void;
  (e: 'update:markers', options: any): void;
  (e: 'update:lines', options: any): void;
}>();

// 控制状态
const globalRotation = ref({
  enabled: true,
  speed: 0.001
});

const particles = ref({
  enabled: true,
  count: 1000,
  speed: 1
});

const markers = ref({
  pulse: true,
  pulseSpeed: 1
});

const lines = ref({
  speed: 1,
  arcFactor: 0.3
});

// 更新处理器
const updateGlobalRotation = () => {
  emit('update:global-rotation', globalRotation.value);
};

const updateParticles = () => {
  emit('update:particles', particles.value);
};

const updateMarkers = () => {
  emit('update:markers', markers.value);
};

const updateLines = () => {
  emit('update:lines', lines.value);
};

// 监听变化
watch(
  [globalRotation, particles, markers, lines],
  () => {
    updateGlobalRotation();
    updateParticles();
    updateMarkers();
    updateLines();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.animation-panel {
  background: var(--global-panel);
  padding: 15px;
  border-radius: 8px;
  color: var(--global-text);

  .panel-section {
    h3 {
      margin-bottom: 15px;
    }
  }

  .control-group {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    h4 {
      margin-bottom: 10px;
      color: var(--global-highlight);
    }
  }

  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;

    label {
      flex: 1;
      margin-right: 10px;
    }

    input[type='range'] {
      flex: 1;
    }

    input[type='checkbox'] {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
