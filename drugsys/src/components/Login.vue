<template>
  <div class="container">
    <el-image class="background-img" src="/login.jpg"></el-image>
    <div class="login_dialog">
      <el-form :model="loginForm" class="login-form">
        <div class="login_title">Drug Management System</div>
        <el-form-item prop="username">
          <span class="form-label">Username:</span>
          <el-input v-model="loginForm.username"
          :suffix-icon="User" placeholder="Please enter" min="5" max="15"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <span class="form-label">Password:</span>
          <el-input v-model="loginForm.password"
          placeholder="Please enter" show-password :suffix-icon="Key" min="5" max="15"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="loginBtn" type="primary" size="large" round @click="handleLogin">Log in</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted  } from 'vue';
import { User, Key } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router/dist/vue-router';
import { login } from '../api/api.js'
import { store } from '../router/store'
import { ElButton, ElInput, ElMessage, ElImage, ElForm, ElFormItem} from 'element-plus';
import 'element-plus/dist/index.css';

const loginForm = ref({
  username: '',
  password: ''
});

const router = useRouter();

const handleLogin = async () => {
  // Validate username and password
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage({
      message: '请输入用户名和密码!',
      type: 'error'
    });
    return;
  }

  if (
    loginForm.value.username.length < 5 ||
    loginForm.value.username.length > 15 ||
    loginForm.value.password.length < 5 ||
    loginForm.value.password.length > 15
  ) {
    ElMessage({
      message: '用户名和密码长度应在5到15位之间!',
      type: 'error'
    });
    return;
  }

  try {
    const response = await login(loginForm.value.username, loginForm.value.password);
    if (response.success) {
      ElMessage({
        message: 'Log in successfully',
        type: 'success'
      });
      localStorage.setItem('username', loginForm.value.username);
      localStorage.setItem('token', response.token);
      store.isLoggedIn = true;
      router.push('/');
    } else {
      ElMessage({
        message: 'Invalid username or password!',
        type: 'error'
      });
    }
  } catch (error) {
    ElMessage({
      message: 'Invalid username or password!',
      type: 'error'
    });
  }
};

// Load stored login information if available
onMounted(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    store.isLoggedIn = true;
    router.push('/');
  }
});

</script>

<style scoped>
body, html {
  margin: 0;
  height: 100%;
  width: 100%;
}

.login_title {
  font-size: 30px;
  color: white;
  margin-bottom: 20px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: relative;
}

.background-img {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover; /* This makes the image cover the entire background */
  z-index: -1; /* This places the image behind the content */
}

.login_dialog {
  position: relative;
  height: 350px;
  width: 450px;
  background-color: rgba(128, 128, 128, 0.5); /* Transparent gray background */
  border-radius: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Add some shadow for better visibility */
}

.login-form {
  width: 80%;
  padding: 20px;
  text-align: center;
}

.form-label {
  color: white;
  font-size: 20px;
  margin-right: 10px;
}

.loginBtn{
  width: 50%;
  margin-left: 25%;
  font-size: 20px;
}
</style>


