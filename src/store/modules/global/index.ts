// src/store/global.ts
import { defineStore } from 'pinia';
import type { City } from '@/components/GlobalLogistics/useCities';

const useGlobalStore = defineStore('global', {
  state: () => ({
    showLines: true,
    selectedCities: [] as City[],
    flightLines: [] as { from: string; to: string }[]
  }),

  actions: {
    toggleLines() {
      this.showLines = !this.showLines;
    },
    addFlightLine(from: string, to: string) {
      this.flightLines.push({ from, to });
    },
    removeFlightLine(from: string, to: string) {
      const index = this.flightLines.findIndex(
        line => line.from === from && line.to === to
      );
      if (index !== -1) {
        this.flightLines.splice(index, 1);
      }
    }
  }
});

export default useGlobalStore;
