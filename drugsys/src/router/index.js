import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import DashBoard from '../components/DashBoard.vue'
import { store } from '../router/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'DashBoard',
    component: DashBoard,
    meta: { requiresAuth: true }
  }
];

// const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home,
//     meta: { requiresAuth: true },
//     children: [
//       {
//         path: 'dashboard',
//         name: 'DashBoard',
//         component: DashBoard,
//         meta: { requiresAuth: true }
//       }
//     ]
//   },
//   {
//     path: '/login',
//     name: 'Login',
//     component: Login
//   }
// ];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: 'Login' });
    } else {
      store.isLoggedIn = true;
      next();
    }
  } else if (to.name === 'Login' && token) {
    // 如果已经登录且试图访问登录页面，则重定向到主页
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router