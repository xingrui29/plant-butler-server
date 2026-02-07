<template>
    <div class="login-container">
        <el-card style="width: 400px; height: 300px;">
            <h2 style="text-align: center; padding-bottom: 10px;">
                {{ isRegister ? '📝 注册账号' : '🔐 登录系统' }}
            </h2>

            <el-form :model="form" @keyup.enter="handleSubmit">
                <el-form-item>
                    <el-input v-model="form.username" placeholder="用户名" clearable />
                </el-form-item>

                <el-form-item v-if="isRegister">
                    <el-input v-model="form.email" placeholder="邮箱" clearable />
                </el-form-item>

                <el-form-item>
                    <el-input v-model="form.password" type="password" placeholder="密码" show-password />
                </el-form-item>

                <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleSubmit">
                    {{ isRegister ? '注册' : '登录' }}
                </el-button>

                <div class="switch">
                    <span>
                        {{ isRegister ? '已有账号？' : '还没有账号？' }}
                    </span>
                    <el-button type="text" @click="toggleMode">
                        {{ isRegister ? '去登录' : '去注册' }}
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

definePageMeta({
    layout: 'empty'
})

const router = useRouter()
const isRegister = ref(false)
const loading = ref(false)

const form = ref({
    username: '',
    password: '',
    email: ''
})

const toggleMode = () => {
    isRegister.value = !isRegister.value
    form.value.password = ''
    form.value.email = ''
}

const handleSubmit = async () => {
    loading.value = true
    try {
        if (isRegister.value) {
            await $fetch('/api/register', {
                method: 'POST',
                body: {
                    username: form.value.username,
                    password: form.value.password,
                    email: form.value.email
                }
            })
            ElMessage.success('注册成功，请登录')
            isRegister.value = false
            form.value.password = ''
        } else {
            await $fetch('/api/login', {
                method: 'POST',
                body: {
                    username: form.value.username,
                    password: form.value.password
                }
            })
            ElMessage.success('登录成功')
            localStorage.setItem('username', form.value.username)
            router.push('/')
        }
    } catch (err) {
        ElMessage.error(err?.data?.error || '操作失败')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.switch {
    margin-top: 8px;
    text-align: center;
    color: #666;
}
</style>
