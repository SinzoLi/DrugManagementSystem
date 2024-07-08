// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store } from '../src/router/store';

const app = createApp(App);

app.config.globalProperties.$store = store;

app.use(router);
app.mount('#app');

// 在应用启动时检查localStorage
const token = localStorage.getItem('token');
if (token) {
  store.isLoggedIn = true;
}