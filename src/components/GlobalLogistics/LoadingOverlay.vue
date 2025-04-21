<!-- src/components/Global/LoadingOverlay.vue -->
<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text">{{ text }}</div>
      <div class="loading-progress" v-if="progress !== null">
        {{ Math.round(progress * 100) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  text?: string;
  progress?: number | null;
}>();
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
