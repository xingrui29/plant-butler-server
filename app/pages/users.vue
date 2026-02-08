<template>
    <el-card>
        <template #header>
            <el-row justify="space-between" align="middle">
                <el-text strong>用户管理</el-text>
                <el-space>
                    <el-button type="primary" @click="fetchUsers">刷新</el-button>
                    <el-button type="primary" @click="openCreate">新建用户</el-button>
                </el-space>
            </el-row>
        </template>

        <el-table :data="users" border style="width: 100%;" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />

            <el-table-column prop="username" label="用户名" />

            <el-table-column prop="email" label="邮箱" />

            <el-table-column label="创建时间">
                <template #default="{ row }">
                    {{ formatTime(row.created_at) }}
                </template>
            </el-table-column>

            <el-table-column label="操作" width="180">
                <template #default="{ row }">
                    <el-button size="small" type="danger" @click="deleteUser(row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-row justify="end" style="margin-top: 16px;">
            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                v-model:current-page="page" @current-change="fetchUsers" />
        </el-row>
    </el-card>

    <el-dialog v-model="createVisible" title="新建用户" width="400px">
        <el-form :model="createForm" label-position="top">
            <el-form-item label="用户名">
                <el-input v-model="createForm.username" />
            </el-form-item>

            <el-form-item label="邮箱">
                <el-input v-model="createForm.email" />
            </el-form-item>

            <el-form-item label="密码">
                <el-input v-model="createForm.password" type="password" show-password />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-space>
                <el-button @click="createVisible = false">
                    取消
                </el-button>
                <el-button type="primary" :loading="creating" @click="createUser">
                    创建
                </el-button>
            </el-space>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
