<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { ElButton, ElHeader, ElCard, ElMessageBox, ElMessage, ElImage} from 'element-plus';
  import { fetchData } from '../api/api';
  import EchartsRose from './EchartsRose.vue';
  import EchartsBar from './EchartsBar.vue';
  import EchartsStack from './EchartsStack.vue';
  import EchartsPie from './EchartsPie.vue';
  import { useRouter } from 'vue-router/dist/vue-router';
  import { store } from '../router/store';
  import 'element-plus/dist/index.css';
  import "../style.css";

  const current_username = localStorage.getItem('username')

  const router = useRouter();

  const group1 = ref([] as any[]);
  const group2 = ref([] as any[]);
  const group3 = ref([] as any[]);
  const group4 = ref([] as any[]);

  const toHome = () => {
    router.push('/');
  }

  interface Drug {
    id: number;
    drugName: string;
    used_by_factory: number;
    stock: number;
    date: string;
    isAdd: number;
  }

  // 定义 allDrugs 作为 ref
  const allDrugs = ref<Drug[]>([]);
  const w1_drugs = ref<Drug[]>([]);
  const sly_drugs = ref<Drug[]>([]);

  interface DrugItem {
    id: number;
    date: string;
    drugName: string;
    used_by_factory: number;
    isAdd: number;
    stock: number;
  }

  const mergeDuplicateDrugs = (group: DrugItem[]) => {
    const merged: { [key: string]: DrugItem } = {};

    group.forEach(item => {
      const key = `${item.date}-${item.drugName}`;
      if (!merged[key]) {
        merged[key] = { ...item }; // 创建副本以避免原始数据的修改
      } else {
        // 合并数据逻辑：相加数量
        merged[key].stock += item.stock;
      }
    });

    return Object.values(merged);
  };

// 在loadDrugs函数中调用mergeDuplicateDrugs处理group3数据
  const loadDrugs = async () => {
    fetchData().then(data => {
      group1.value = mergeDuplicateDrugs(data.group1); // used_by_factory=0, isAdd=0
      group2.value = mergeDuplicateDrugs(data.group2); // used_by_factory=0, isAdd=1
      group3.value = mergeDuplicateDrugs(data.group3);  // used_by_factory=1, isAdd=0
      group4.value = mergeDuplicateDrugs(data.group4); // used_by_factory=1, isAdd=1

      // 渲染数据到前端或其他操作
      console.log('Group 1:', group1);
      console.log('Group 2:', group2);
      console.log('Group 3:', group3);
      console.log('Group 4:', group4);

  }).catch(error => {
    console.error('Fetch data error:', error);
  });
};


  const logout = () => {
  ElMessageBox.confirm(
    '是否确认退出登录?',
    '退出登录',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: '退出登录成功！',
    })
    // 清空 localStorage 中的 token 和 username
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    // 设置登录状态为 false
    store.isLoggedIn = false;

    // 跳转至登录页
    router.push('/login');
  })
  .catch(() => {
    // 用户取消退出，什么也不做
  });
};

  onMounted(async () => {
    await loadDrugs();
    // console.log(group3.value)
  });
</script>


<template>
  <el-image class="background-img" src="/home.jpg"></el-image>
  <el-header class="el-header">
    <div class="header-content">
      <el-button class="toDashBoard" @click="toHome">Home</el-button>
      <h1 class="title">Drug Management System</h1>
      <span class="user-info">
        <!-- 用户信息区域，可以根据需要自定义 -->
        <!-- 显示当前用户的用户名 -->
        <span>Username：{{ current_username }}</span>
        <el-button class="logout-btn" round @click="logout">Log out</el-button>
        <!-- 设计一个退出登录的按钮,当点击时,清空localstorage,然后跳转回/login -->
      </span>
    </div>
  </el-header>

  <el-card class="dashboad-card">
    <!-- Stack E-charts -->
    <div class="dashboad-area-1">
      <span class="dashboad-chart-1">
        <EchartsStack :data="group1" chartWidth="100%" chartHeight="370px"/>
      </span>

      <!-- Rose E-charts -->
      <span class="dashboad-chart-2">
        <EchartsRose :data="group4" chartWidth="100%" chartHeight="370px"/>
      </span>
      <!-- <span class="dashboad-chart-3">area3</span> -->
    </div>

    <!-- Pie E-charts -->
    <div  v-if="group3" class="dashboad-area-2">
      <span class="dashboad-chart-3">
        <EchartsPie :data="group3" chartWidth="100%" chartHeight="370px"/>
      </span>
      
      <!-- Bar E-charts -->
      <span class="dashboad-chart-4">
        <EchartsBar :data="group2" chartWidth="100%" chartHeight="370px" />
      </span>
    </div>
  </el-card>
</template>
