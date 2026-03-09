<template>
    <div class="users-page">
        <!-- 页面卡片 -->
        <div class="page-card">
            <!-- 卡片头部 -->
            <div class="card-header">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon size="20"><User /></el-icon>
                    </div>
                    <span class="title-text">用户列表</span>
                </div>
                <div class="header-actions">
                    <el-button class="action-btn" @click="fetchUsers">
                        <el-icon><Refresh /></el-icon>
                        <span>刷新</span>
                    </el-button>
                    <el-button type="primary" class="action-btn primary" @click="openCreate">
                        <el-icon><Plus /></el-icon>
                        <span>新建用户</span>
                    </el-button>
                </div>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper" v-loading="loading">
                <el-table :data="users" style="width: 100%;" :header-cell-style="{ background: 'transparent' }">
                    <el-table-column prop="id" label="ID" width="80" align="center" />
                    <el-table-column prop="username" label="用户名" min-width="120">
                        <template #default="{ row }">
                            <div class="user-cell">
                                <el-avatar :size="32" class="user-avatar">
                                    {{ row.username.charAt(0).toUpperCase() }}
                                </el-avatar>
                                <span class="user-name">{{ row.username }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="email" label="邮箱" min-width="180" />
                    <el-table-column label="创建时间" min-width="160">
                        <template #default="{ row }">
                            <span class="time-text">{{ formatTime(row.created_at) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center">
                        <template #default="{ row }">
                            <el-button size="small" type="danger" text class="delete-btn" @click="deleteUser(row.id)">
                                <el-icon><Delete /></el-icon>
                                <span>删除</span>
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="total"
                    :page-size="pageSize"
                    v-model:current-page="page"
                    @current-change="fetchUsers"
                />
            </div>
        </div>

        <!-- 新建用户对话框 -->
        <el-dialog v-model="createVisible" title="新建用户" width="440px" class="modern-dialog">
            <el-form :model="createForm" label-position="top" class="modern-form">
                <el-form-item label="用户名">
                    <el-input v-model="createForm.username" placeholder="请输入用户名" :prefix-icon="User" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="createForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="createForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button class="footer-btn" @click="createVisible = false">取消</el-button>
                    <el-button type="primary" class="footer-btn primary" :loading="creating" @click="createUser">
                        创建
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Refresh, Delete, Lock, Message } from '@element-plus/icons-vue'

const users = ref([])
const loading = ref(false)

const page = ref(1)
const pageSize = 10
const total = ref(0)

const createVisible = ref(false)
const creating = ref(false)

const createForm = ref({
    username: '',
    email: '',
    password: ''
})

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await $fetch('/api/users', {
            query: {
                page: page.value,
                pageSize
            }
        })

        users.value = res.items
        total.value = res.total
    } catch (err) {
        ElMessage.error('获取用户失败')
    } finally {
        loading.value = false
    }
}

const deleteUser = async (id) => {
    await ElMessageBox.confirm('确认删除该用户？', '提示', {
        type: 'warning'
    })

    try {
        await $fetch(`/api/users/${id}`, {
            method: 'DELETE'
        })
        ElMessage.success('删除成功')
        fetchUsers()
    } catch {
        ElMessage.error('删除失败')
    }
}

const openCreate = () => {
    createForm.value = {
        username: '',
        email: '',
        password: ''
    }
    createVisible.value = true
}

const createUser = async () => {
    const { username, email, password } = createForm.value

    if (!username || !password) {
        ElMessage.warning('用户名和密码不能为空')
        return
    }

    creating.value = true
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: { username, email, password }
        })

        ElMessage.success('用户创建成功')
        createVisible.value = false
        fetchUsers()
    } catch (err) {
        ElMessage.error(err?.data?.error || '创建失败')
    } finally {
        creating.value = false
    }
}

const formatTime = (ts) =>
    new Date(ts * 1000).toLocaleString()

onMounted(fetchUsers)
</script>

<style scoped>
.users-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.title-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.title-text {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.table-wrapper {
    padding: 0 24px;
}

/* 表格样式 */
:deep(.el-table) {
    background: transparent;
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgba(102, 126, 234, 0.06);
}

:deep(.el-table th.el-table__cell) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    font-weight: 600;
    color: #4a4a6a;
}

:deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

:deep(.el-table::before) {
    display: none;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
}

.user-name {
    font-weight: 500;
    color: #1a1a2e;
}

.time-text {
    color: #8a8a9a;
    font-size: 13px;
}

.delete-btn {
    color: #f56c6c;
}

.delete-btn:hover {
    color: #f78989;
    background: rgba(245, 108, 108, 0.1);
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 20px 24px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 对话框样式 */
:deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-right: 0;
}

:deep(.el-dialog__title) {
    font-weight: 600;
    color: #1a1a2e;
}

:deep(.el-dialog__body) {
    padding: 24px;
}

.modern-form :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.modern-form :deep(.el-input__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.5);
}

.modern-form :deep(.el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.footer-btn {
    border-radius: 10px;
    font-weight: 500;
    min-width: 80px;
}

.footer-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}
</style>
