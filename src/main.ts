import { createApp } from 'vue';

import store from './store';
import './mock';
import App from './App.vue';
import '@/assets/style/global.less';
import '@/api/interceptor';

const app = createApp(App);

app.use(store);

app.mount('#app');
