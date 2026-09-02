import type { App } from 'vue';
import GlobeLogistics from './GlobalLogistics/index.vue';

export { GlobeLogistics };

export default {
  install: (app: App) => {
    app.component('GlobeLogistics', GlobeLogistics);
  }
};
