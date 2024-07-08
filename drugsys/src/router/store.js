// store.js
// 创建一个全局状态来存储登录状态：
import { reactive } from 'vue';

export const store = reactive({
  isLoggedIn: false
});