<template>
    <div class="login-container">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="bg-circle bg-circle-1"></div>
            <div class="bg-circle bg-circle-2"></div>
            <div class="bg-circle bg-circle-3"></div>
        </div>

        <!-- 登录卡片 -->
        <div class="login-card">
            <div class="login-header">
                <div class="login-icon">
                    <el-icon size="32"><Monitor /></el-icon>
                </div>
                <h1 class="login-title">Plant Butler</h1>
                <p class="login-subtitle">智能植物管家管理系统</p>
            </div>

            <el-form :model="form" label-position="top" size="large" @keyup.enter="handleLogin">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" clearable :prefix-icon="User" />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
                        <span v-if="!loading">登 录</span>
                        <span v-else>登录中...</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'

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
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    position: relative;
    overflow: hidden;
}

/* 背景装饰圆 */
.bg-decoration {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
}

.bg-circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    left: -100px;
    animation: float 8s ease-in-out infinite;
}

.bg-circle-2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    right: -50px;
    animation: float 6s ease-in-out infinite reverse;
}

.bg-circle-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    right: 20%;
    animation: float 10s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
}

/* 登录卡片 - 毛玻璃效果 */
.login-card {
    width: 400px;
    padding: 48px 40px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        0 2px 8px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    position: relative;
    z-index: 1;
    animation: cardFadeIn 0.6s ease-out;
}

@keyframes cardFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 登录头部 */
.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.login-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.login-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
}

.login-subtitle {
    font-size: 14px;
    color: #4a4a6a;
    margin: 0;
}

/* 表单样式 */
:deep(.el-form-item__label) {
    font-weight: 500;
    color: #1a1a2e;
}

:deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.5);
}

:deep(.el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* 登录按钮 */
.login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.login-btn:active {
    transform: translateY(0);
}
</style>
