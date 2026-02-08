<template>
    <el-container style="height: 100vh;">
        <el-main class="login-wrapper">
            <el-card shadow="always" style="width: 360px;">
                <el-text size="large" tag="h2" style="display: block; text-align: center; margin-bottom: 20px;">
                    后台管理系统
                </el-text>

                <el-form :model="form" label-position="top" size="large" @keyup.enter="handleLogin">
                    <el-form-item label="用户名">
                        <el-input v-model="form.username" placeholder="请输入用户名" clearable />
                    </el-form-item>

                    <el-form-item label="密码">
                        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleLogin">
                            登录
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

definePageMeta({
    layout: 'empty'
})

const router = useRouter()
const loading = ref(false)

const form = ref({
    username: '',
    password: ''
})

const handleLogin = async () => {
    if (!form.value.username || !form.value.password) {
        ElMessage.warning('请输入用户名和密码')
        return
    }

    loading.value = true
    try {
        await $fetch('/api/login', {
            method: 'POST',
            body: form.value
        })

        ElMessage.success('登录成功')
        localStorage.setItem('username', form.value.username)
        router.push('/')
    } catch (err) {
        ElMessage.error(err?.data?.error || '登录失败')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
