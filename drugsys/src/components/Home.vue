<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElHeader, ElCard, ElMain,
  ElAside, ElFooter, ElContainer, ElPagination, ElTag, ElMessageBox, 
  ElDialog, ElInput, ElInputNumber, ElMessage, ElImage} from 'element-plus';
import { useRouter } from 'vue-router/dist/vue-router';
import { store } from '../router/store';
import 'element-plus/dist/index.css';
import "../style.css";
import { fetchDrugs, addDrugStock, consumeDrugStock, editDrug, deleteDrug, newDrug } from '../api/api'; // 根据你的文件路径调整

interface Drug {
  id: number;
  drugName: string;
  used_by_factory: number;
  stock: number;
  drugSpecification: string;
  drugPrice: number;
  time: string;
}

// 初始化交互数据
const addInput = ref(0)
const consumeDrug = ref(0)
const editDrugName = ref('')
const editDrugSpecification = ref('')
const editDrugPrice = ref(0)
const newDrugName = ref('')
const newDrugSpecification = ref('')
const newDrugStock = ref(0)
const newDrugPrice = ref(0)
// 登录成功之后的当前用户名
const current_username = localStorage.getItem('username')

// 创建一个响应式变量来存储 num 的值,以区分新增药剂是万兴一厂还是渗滤液厂
const numValue = ref(0);

// 对话框的响应式开关
const addDialogVisible = ref(false)
const conDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const newDialogVisible = ref(false)
const editDialogVisible = ref(false)

// 定义 allDrugs 作为 ref
const allDrugs = ref<Drug[]>([]);
const w1_drugs = ref<Drug[]>([]);
const sly_drugs = ref<Drug[]>([]);

// Load the drugs data
const loadDrugs = async () => {
  // 获取所有药剂数据
  const drugs = await fetchDrugs();
  allDrugs.value = drugs; // 更新 allDrugs
  // 万兴一厂的数据
  w1_drugs.value = drugs.filter(drug => drug.used_by_factory === 1);
  // 渗滤液厂的数据
  sly_drugs.value = drugs.filter(drug => drug.used_by_factory === 0);
};

// 初始化时加载药剂数据
onMounted(async () => {
  await loadDrugs();
});

// 处理补充药剂
const handleAddStock = async (id, amount) => {
  if (amount <= 0 || amount > 100) {
    ElMessage({
        type: 'error',
        message: 'Please enter from 0 to 100！',
      })
    return;
  }

  await addDrugStock(id, amount);
  await loadDrugs(); // 重新加载药剂数据
  addDialogVisible.value = false;
  ElMessage({
        type: 'success',
        message: 'Add drug successfully!',
      })
};

// 处理消耗药剂
const handleConsumeStock = async (id, amount) => {
  const drug = w1_drugs.value.find(drug => drug.id === id) || sly_drugs.value.find(drug => drug.id === id);
  if (!drug) {
    ElMessage({
        type: 'error',
        message: '找不到对应id的药品',
      })
    return;
  }

  if (amount > drug.stock) {
    ElMessage({
        type: 'error',
        message: '药剂消耗数量大于库存数量！',
      })
    return;
  }

  if (amount <= 0 || amount > 100) {
    ElMessage({
        type: 'error',
        message: '请输入0到100之间的数字！',
      })
    return;
  }

  await consumeDrugStock(id, amount);
  await loadDrugs(); // 重新加载药剂数据
  conDialogVisible.value = false;
  ElMessage({
        type: 'success',
        message: 'Consume drug successfully!',
      })
};

// 处理编辑药剂
const handleEditDrug = async (id, editDrugName, editDrugSpecification, editDrugPrice) => {
  // 检查参数是否为空
  if (!id || !editDrugName || !editDrugSpecification || !editDrugPrice) {
    ElMessage({
      type: 'error',
      message: '所有字段都必须填写',
    });
    return;
  }
  if (editDrugPrice <= 0 || editDrugPrice > 10000) {
    ElMessage({
        type: 'error',
        message: '请输入0到10000之间的数字！',
      })
    return;
  }

  try {
    await editDrug(id, editDrugName, editDrugSpecification, editDrugPrice);
    await loadDrugs(); // 重新加载药剂数据
    editDialogVisible.value = false;
    ElMessage({
      type: 'success',
      message: 'Edit drug successfully!',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '编辑药剂失败',
    });
    console.error('编辑药剂失败：', error);
  }
};

// 处理删除药剂
const handleDeleteDrug = async (id) => {
  await deleteDrug(id);
  await loadDrugs(); // 重新加载药剂数据
  deleteDialogVisible.value = false;
  ElMessage({
        type: 'success',
        message: 'Delete drug successfully!',
      })
};

// 处理新增药剂
const handleNewDrug = async (newDrugName, newDrugSpecification, newDrugStock, newDrugPrice, num) => {
  // console.log(num.value)
  // 检查参数是否为空
  if (!newDrugName || !newDrugSpecification || !newDrugStock || !newDrugPrice) {
    ElMessage({
      type: 'error',
      message: '所有字段都必须填写',
    });
    return;
  }
  if (newDrugName.length <= 2 || newDrugName.length > 15) {
    ElMessage({
        type: 'error',
        message: '药剂名称应在3~15位！',
      })
    return;
  }
  if (newDrugSpecification.length <= 2 || newDrugSpecification.length > 20) {
    ElMessage({
        type: 'error',
        message: '药剂规格应在3~20位！',
      })
    return;
  }
  if (newDrugStock <= 0 || newDrugStock > 10000) {
    ElMessage({
        type: 'error',
        message: '请输入0到10000之间的数字！',
      })
    return;
  }
  if (newDrugPrice <= 0 || newDrugPrice > 10000) {
    ElMessage({
        type: 'error',
        message: '请输入0到10000之间的数字！',
      })
    return;
  }

  try {
    await newDrug(newDrugName, newDrugSpecification, newDrugStock, newDrugPrice, num);
    await loadDrugs(); // 重新加载药剂数据
    newDialogVisible.value = false;
    ElMessage({
      type: 'success',
      message: 'Create new drug successfully!',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '新增药剂失败',
    });
    console.error('新增药剂失败：', error);
  }
};

// 用于拿到当前id
const currentId = ref(null);

// 处理补充按钮显示对话框和拿到Id
const handleAddDialog = (id) => {
      currentId.value = id;
      addDialogVisible.value = true;
};

// 处理消耗按钮显示对话框和拿到Id
const handleConsumeDialog = (id) => {
      currentId.value = id;
      conDialogVisible.value = true;
};

// 处理编辑按钮显示对话框和拿到Id
const handleEditDialog = (id) => {
  // 查找对应id的药剂
  const drug = allDrugs.value.find(drug => drug.id === id);

  if (drug) {
    // 将药剂的属性值赋值给编辑变量
    editDrugName.value = drug.drugName;
    editDrugSpecification.value = drug.drugSpecification;
    editDrugPrice.value = drug.drugPrice;
  }

  currentId.value = id;
  editDialogVisible.value = true;
};

// 处理删除按钮显示对话框和拿到Id
const handleDeleteDialog = (id) => {
      currentId.value = id;
      deleteDialogVisible.value = true;
};

// 处理新增药剂按钮显示对话框和拿到Id
const handleNewDialog = (num: number) => {
  if (num !== 0 && num !== 1) {
    console.error('num必须为0或者1');
    return;
  }
  // 储存了num的取值
  numValue.value = num
  // console.log(numValue.value)
  newDialogVisible.value = true;
};

// 用于处理分页操作
const w1_currentPage = ref(1);
const w1_pageSize = ref(4);
const sly_currentPage = ref(1);
const sly_pageSize = ref(4);

const w1_currentPageData = computed(() => {
  const start = (w1_currentPage.value - 1) * w1_pageSize.value;
  const end = w1_currentPage.value * w1_pageSize.value;
  return w1_drugs.value.slice(start, end);
});

const sly_currentPageData = computed(() => {
  const start = (sly_currentPage.value - 1) * sly_pageSize.value;
  const end = sly_currentPage.value * sly_pageSize.value;
  return sly_drugs.value.slice(start, end);
});

const handleW1PageChange = (page) => {
  w1_currentPage.value = page;
};

const handleSlyPageChange = (page) => {
  sly_currentPage.value = page;
};

const router = useRouter();

const logout = () => {
  ElMessageBox.confirm(
    'Are you sure to log out?',
    'Log out',
    {
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: 'Log out successfully！',
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
  });
};

watch(addDialogVisible, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    addInput.value = 0;
  }
});

watch(conDialogVisible, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    consumeDrug.value = 0;
  }
});

watch(editDialogVisible, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    editDrugName.value = '';
    editDrugSpecification.value = '';
    editDrugPrice.value = 0;
  }
});

watch(newDialogVisible, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    newDrugName.value = '';
    newDrugSpecification.value = '';
    newDrugStock.value = 0;
    newDrugPrice.value = 0;
  }
});

// to the DashBoard page
const toDashBoard = () => {
  router.push('/dashboard');
}

</script>

<template>
    <div>
    <el-container>
      <el-image class="background-img" src="/home.jpg"></el-image>
      <el-header class="el-header">
        <div class="header-content">
          <el-button class="toDashBoard" @click="toDashBoard">DashBoard</el-button>
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

      <!-- 万兴一厂 -->
      <el-container>
          <el-aside width="200px" class="el-aside1">
            W1
          </el-aside>
      <el-container>

      <el-card style="max-width: 100%; background-color: rgba(255, 255, 255, 0.5)">
        <el-main>
          <el-table :data="w1_currentPageData" style="width: 100%; background-color: rgba(255, 255, 255, 0.5)" stripe>
            <el-table-column fixed prop="drugName" label="Name" width="120" />
            <el-table-column prop="drugSpecification" label="Specification" width="120" />
            <el-table-column prop="stock" label="Stock" width="120" />
            <el-table-column prop="drugPrice" label="Price" width="120" />
            <el-table-column prop="time" label="Date" width="418" />
   
            <el-table-column fixed="right" label="Operations" width="200">
              <!-- 拿到对应的id插槽 -->
              <template #default="scope">
                <el-button round type="success" size="small" @click="handleAddDialog(scope.row.id)">
                  Add
                </el-button>
                <el-button round type="info" size="small" @click="handleConsumeDialog(scope.row.id)">
                  Consume
                </el-button>
              </template>
            </el-table-column>

            <el-table-column label="Status" width="128">
              <template #default="{ row }">
                <!-- 当库存量小于25时,则显示缺货 -->
                <el-tag
                  :type="row.stock <= 25 ? 'warning' : 'success'"
                  effect="light"
                  round>
                  {{ row.stock <= 25 ? 'Out of stock' : 'Sufficient' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column fixed="right" label="Manage" width="200">
              <!-- 拿到对应的id插槽 -->
              <template #default="scope">
                <el-button type="primary" size="small" round @click="handleEditDialog(scope.row.id)">Edit</el-button>
                <el-button type="danger" size="small" round @click="handleDeleteDialog(scope.row.id)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination background layout="prev, pager, next"
               :page-size="w1_pageSize" :total="w1_drugs.length"
               @current-change="handleW1PageChange"/>
          </div>
        </el-main>
      </el-card>

          <el-footer class="el-footer">
              <el-button type="primary" @click="handleNewDialog(1)">New drug</el-button>
          </el-footer>

        </el-container>
      </el-container>

      <!-- 渗滤液厂 -->
      <el-container>
        <el-aside width="200px" class="el-aside2">SLY</el-aside>
      <el-container>

      <el-card style="max-width: 100%; background-color: rgba(255, 255, 255, 0.5)">
        <el-main>
          <el-table :data="sly_currentPageData" style="width: 100%; background-color: rgba(255, 255, 255, 0.5)" stripe>
            <el-table-column fixed prop="drugName" label="Name" width="120" />
            <el-table-column prop="drugSpecification" label="Specification" width="120" />
            <el-table-column prop="stock" label="Stock" width="120" />
            <el-table-column prop="drugPrice" label="Price" width="120" />
            <el-table-column prop="time" label="Date" width="418" />

            <el-table-column fixed="right" label="Operations" width="200">
              <template #default="scope">
                <el-button round type="success" size="small" @click="handleAddDialog(scope.row.id)">
                  Add
                </el-button>
                <el-button round type="info" size="small" @click="handleConsumeDialog(scope.row.id)">
                  Consume
                </el-button>
              </template>
            </el-table-column>

            <el-table-column label="Status" width="128">
              <template #default="{ row }">
                <el-tag
                  :type="row.stock <= 25 ? 'warning' : 'success'"
                  effect="light"
                  round>
                  {{ row.stock <= 25 ? 'Out of stock' : 'Sufficient' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column fixed="right" label="Mange" width="200">
              <template #default="scope">
                <el-button type="primary" size="small" round @click="handleEditDialog(scope.row.id)">Edit</el-button>
                <el-button type="danger" size="small" round @click="handleDeleteDialog(scope.row.id)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination background layout="prev, pager, next"
               :page-size="sly_pageSize" :total="sly_drugs.length"
               @current-change="handleSlyPageChange"/>
          </div>
        </el-main>
      </el-card>

          <el-footer class="el-footer">
            <el-footer class="el-footer">
              <el-button type="primary" @click="handleNewDialog(0)">New drug</el-button>
          </el-footer>
          </el-footer>
        </el-container>
      </el-container>

    </el-container>

    <!-- 补充对话框 -->
    <el-dialog
    v-model="addDialogVisible"
    title="Add drug"
    width="500"
    center
    :close-on-click-modal="false"
    destroy-on-close>
      <span style="margin-right: 50px;margin-left: 25px;">Add stock：</span>
      <el-input-number
      v-model="addInput"
      style="width: 240px"
      placeholder="Please enter"
      clearable/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="currentId !== null && handleAddStock(currentId, addInput)">
            Yes
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 消耗对话框 -->
    <el-dialog
    v-model="conDialogVisible"
    title="Consume drug"
    width="500"
    center
    :close-on-click-modal="false"
    :destroy-on-close="false">
      <span style="margin-right: 50px;margin-left: 25px;">Consume drug：</span>
      <el-input-number
      v-model="consumeDrug"
      style="width: 240px"
      placeholder="Please enter"
      clearable/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="conDialogVisible = false">cancel</el-button>
          <el-button type="primary" @click="currentId !== null && handleConsumeStock(currentId, consumeDrug)">
            Yes
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除对话框 -->
    <el-dialog
    v-model="deleteDialogVisible"
    title="Delete drug"
    width="500"
    center
    :close-on-click-modal="false"
    :destroy-on-close="false">
      <span>Are you sure to delete this drug?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">cancel</el-button>
          <el-button type="danger" @click="currentId !== null && handleDeleteDrug(currentId)">
            Yes
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增药剂对话框 -->
    <el-dialog
    v-model="newDialogVisible"
    title="New drug"
    width="500"
    center
    :close-on-click-modal="false"
    destroy-on-close>
      <div>
        <span style="margin-right: 95px;margin-left: 25px;">Name：</span>
        <el-input
        v-model="newDrugName"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <div style="margin-top: 8px;">
        <span style="margin-right: 50px;margin-left: 25px;">Specification：</span>
        <el-input
        v-model="newDrugSpecification"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <div style="margin-top: 8px;">
        <span style="margin-right: 99px;margin-left: 25px;">Stock：</span>
        <el-input
        v-model="newDrugStock"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <div style="margin-top: 8px;">
        <span style="margin-right: 102px;margin-left: 25px;">Price：</span>
        <el-input
        v-model="newDrugPrice"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="newDialogVisible = false">cancel</el-button>
          <el-button type="primary" @click="handleNewDrug(newDrugName, newDrugSpecification, newDrugStock, newDrugPrice, numValue)">
            Yes
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
    v-model="editDialogVisible"
    title="Edit drug"
    width="500"
    center
    :close-on-click-modal="false"
    destroy-on-close>
      <div>
        <span style="margin-right: 95px;margin-left: 25px;">Name：</span>
        <el-input
        v-model="editDrugName"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <div style="margin-top: 8px;">
        <span style="margin-right: 50px;margin-left: 25px;">Specification：</span>
        <el-input
        v-model="editDrugSpecification"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <div style="margin-top: 8px;">
        <span style="margin-right: 102px;margin-left: 25px;">Price：</span>
        <el-input
        v-model="editDrugPrice"
        style="width: 240px"
        placeholder="Please enter"
        clearable/>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="currentId !== null && handleEditDrug(currentId, editDrugName, editDrugSpecification, editDrugPrice)">
            Yes
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>