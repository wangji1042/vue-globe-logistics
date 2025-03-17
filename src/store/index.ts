import { createPinia } from 'pinia';
import useAppStore from './modules/app/index';
import useGlobeStore from './modules/globe/index';

const pinia = createPinia();

export { useAppStore, useGlobeStore };
export default pinia;
