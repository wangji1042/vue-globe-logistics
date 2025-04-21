import { createPinia } from 'pinia';
import useAppStore from './modules/app/index';
import useGlobalStore from './modules/global/index';

const pinia = createPinia();

export { useAppStore, useGlobalStore };
export default pinia;
