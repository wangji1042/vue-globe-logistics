<template>
  <GlobalLogistics
    :showPanel="false"
    :showPerformance="false"
    :options="{
      globalColor: '#1B1B1B',
      markerColor: '#FF0000',
      lineColor: '#00FF00',
      rotationSpeed: 0.002
    }"
    initialTheme="dark"
    :showThemePanel="false"
    :showCustomization="false"
    :showPerformancePanel="false"
    :showDataPanel="false"
    :showInteractionPanel="false"
    @data-imported="handleDataImported"
    @data-exported="handleDataExported"
    @object-selected="handleObjectSelected"
    @route-created="handleRouteCreated"
    @measurement-complete="handleMeasurement"
    :showVisualizationPanel="false"
    :initial-data="myData"
    @visualization-updated="handleUpdate"
    :showAnimationPanel="false"
    @animation-updated="handleAnimationUpdate"
  />
</template>

<script lang="ts" setup>
import GlobalLogistics from '@/components/GlobalLogistics/index.vue';

const handleDataImported = data => {
  console.log('Data imported:', data);
};

const handleDataExported = format => {
  console.log('Data exported as:', format);
};

const handleObjectSelected = objects => {
  console.log('Selected objects:', objects);
};

const handleRouteCreated = route => {
  console.log('New route created:', route);
};

const handleMeasurement = distance => {
  console.log('Measured distance:', distance);
};

const myData = {
  points: [
    {
      position: { x: 0, y: 0, z: 0 },
      value: 100,
      timestamp: Date.now(),
      category: 'A'
    }
    // ... more data points
  ]
};

const handleUpdate = visualizationState => {
  console.log('Visualization updated:', visualizationState);
};

const handleAnimationUpdate = state => {
  console.log('Animation state updated:', state);
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
