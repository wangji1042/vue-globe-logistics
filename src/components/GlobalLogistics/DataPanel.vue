<!-- src/components/Global/DataPanel.vue -->
<template>
  <div class="data-panel">
    <div class="panel-header">
      <h3>Data Management</h3>
      <div class="format-selector">
        <select v-model="selectedFormat">
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="geojson">GeoJSON</option>
        </select>
      </div>
    </div>

    <div class="panel-content">
      <div class="import-section">
        <h4>Import Data</h4>
        <input
          type="file"
          @change="handleFileImport"
          :accept="acceptedFormats"
        />
        <div class="validation-message" v-if="validationMessage">
          {{ validationMessage }}
        </div>
      </div>

      <div class="export-section">
        <h4>Export Data</h4>
        <button @click="handleExport">
          Export as {{ selectedFormat.toUpperCase() }}
        </button>
      </div>

      <div class="data-summary" v-if="currentData">
        <h4>Current Data Summary</h4>
        <div class="summary-item">Cities: {{ currentData.cities.length }}</div>
        <div class="summary-item">Routes: {{ currentData.routes.length }}</div>
        <div class="summary-item">
          Last Modified: {{ formatDate(currentData.metadata?.modified) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { DataFormat, GlobalData } from './types/data';

const props = defineProps<{
  currentData: GlobalData;
}>();

const emit = defineEmits<{
  (e: 'import', data: File, format: DataFormat): void;
  (e: 'export', format: DataFormat): void;
}>();

const selectedFormat = ref<DataFormat>('json');
const validationMessage = ref('');

const acceptedFormats = computed(() => {
  const formats = {
    json: '.json',
    csv: '.csv',
    geojson: '.geojson'
  };
  return formats[selectedFormat.value];
});

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    emit('import', file, selectedFormat.value);
  }
};

const handleExport = () => {
  emit('export', selectedFormat.value);
};

const formatDate = (date?: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};
</script>

<style lang="scss" scoped>
.data-panel {
  background: var(--global-panel);
  padding: 15px;
  border-radius: 8px;
  color: var(--global-text);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      margin: 0;
    }
  }

  .panel-content {
    > div {
      margin-bottom: 20px;
    }
  }

  .format-selector {
    select {
      padding: 5px;
      border-radius: 4px;
      background: var(--global-background);
      color: var(--global-text);
    }
  }

  .import-section,
  .export-section {
    h4 {
      margin-bottom: 10px;
    }

    button {
      padding: 8px 16px;
      border-radius: 4px;
      background: var(--global-line);
      color: white;
      border: none;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .validation-message {
    margin-top: 8px;
    color: #ff4444;
    font-size: 0.9em;
  }

  .data-summary {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;

    .summary-item {
      margin: 5px 0;
      font-size: 0.9em;
      opacity: 0.8;
    }
  }
}
</style>
