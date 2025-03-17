<template>
  <div>3D地球物流可视化系统</div>
  <GlobeLogistics
    :showPanel="true"
    :showPerformance="true"
    :options="{
      globeColor: '#1B1B1B',
      markerColor: '#FF0000',
      lineColor: '#00FF00',
      rotationSpeed: 0.002
    }"
    initialTheme="dark"
    :showThemePanel="true"
    :showCustomization="true"
    :showPerformancePanel="true"
    :showDataPanel="true"
    :showInteractionPanel="true"
    @data-imported="handleDataImported"
    @data-exported="handleDataExported"
    @object-selected="handleObjectSelected"
    @route-created="handleRouteCreated"
    @measurement-complete="handleMeasurement"
    :showVisualizationPanel="true"
    :initial-data="myData"
    @visualization-updated="handleUpdate"
    :showAnimationPanel="true"
    @animation-updated="handleAnimationUpdate"
  />
</template>

<script lang="ts" setup>
import GlobeLogistics from '@/components/GlobeLogistics/index.vue';

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
