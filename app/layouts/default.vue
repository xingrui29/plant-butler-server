<template>
    <div class="layout-container">
        <!-- 背景装饰 -->
        <div class="layout-bg"></div>

        <el-container class="main-container">
            <!-- 侧边栏 -->
            <el-aside width="220px" class="sidebar">
                <div class="sidebar-header">
                    <div class="logo-wrapper">
                        <div class="logo-icon">
                            <el-icon size="24"><Monitor /></el-icon>
                        </div>
                        <span class="logo-text">Plant Butler</span>
                    </div>
                </div>

                <el-menu
                    :default-active="activeMenu"
                    router
                    class="sidebar-menu"
                >
                    <el-menu-item index="/">
                        <el-icon><Monitor /></el-icon>
                        <span>设备概览</span>
                    </el-menu-item>
                    <el-menu-item index="/users">
                        <el-icon><User /></el-icon>
                        <span>用户管理</span>
                    </el-menu-item>
                    <el-menu-item index="/commands">
                        <el-icon><List /></el-icon>
                        <span>指令管理</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 主内容区 -->
            <el-container>
                <!-- 顶部导航 -->
                <el-header class="top-header">
                    <div class="header-left">
                        <h1 class="page-title">{{ pageTitle }}</h1>
                    </div>

                    <div class="header-right">
                        <el-dropdown trigger="click" class="user-dropdown">
                            <div class="user-info">
                                <el-avatar :size="36" class="user-avatar">
                                    {{ username.charAt(0).toUpperCase() }}
                                </el-avatar>
                                <span class="user-name">{{ username }}</span>
                                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="logout">
                                        <el-icon><SwitchButton /></el-icon>
                                        <span>退出登录</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-header>

                <!-- 页面内容 -->
                <el-main class="page-content">
                    <slot />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ArrowDown, Monitor, List, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const username = ref('')

const pageTitle = computed(() => {
    const titles = {
        '/': '设备概览',
        '/users': '用户管理',
        '/commands': '指令管理'
    }
    return titles[route.path] || '后台管理'
})

const logout = () => {
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    router.push('/login')
}

onMounted(() => {
    username.value = localStorage.getItem('username') || ''
})
</script>

<style scoped>
.layout-container {
    min-height: 100vh;
    position: relative;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.layout-bg {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(240, 147, 251, 0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
}

.main-container {
    position: relative;
    z-index: 1;
    height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.3px;
}

.sidebar-menu {
    border: none;
    background: transparent;
    padding: 12px 8px;
}

.sidebar-menu .el-menu-item {
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    margin: 4px 0;
    color: #4a4a6a;
    transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover {
    background: rgba(102, 126, 234, 0.08);
    color: #667eea;
}

.sidebar-menu .el-menu-item.is-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 顶部导航 */
.top-header {
    height: 70px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.page-title {
    font-size: 22px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
}

.user-dropdown {
    cursor: pointer;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.user-info:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

.dropdown-icon {
    color: #8a8a9a;
    transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
    transform: rotate(180deg);
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
}

/* 页面内容区 */
.page-content {
    padding: 24px;
    background: transparent;
    overflow-y: auto;
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(20px);
    padding: 8px;
}

:deep(.el-dropdown-menu__item) {
    border-radius: 8px;
}
</style>
