<!-- layouts/default.vue -->
<template>
    <el-container>
        <el-header class="header">
            <div class="header-left">
                🌱 智能浇水系统
            </div>

            <div class="header-right">
                <el-dropdown>
                    <el-button type="primary">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>{{ username }}&nbsp;</span>
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </el-button>
                    <div class="user-dropdown">

                    </div>

                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="logout">
                                退出系统
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-header>

        <el-container>
            <el-aside width="200px" class="aside">
                <el-menu :default-active="activeMenu" router class="menu">
                    <el-menu-item index="/">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>设备概览</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <el-main class="main">
                <slot />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
    User,
    ArrowDown,
    Monitor
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const username = ref('')

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
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    height: 60px;
}

.header-left {
    font-weight: bold;
}

.header-right {
    cursor: pointer;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    height: 100%;
    cursor: pointer;
    color: inherit;
    font-size: 14px;
}

.aside {
    border-right: 1px solid #eee;
    height: calc(100vh - 60px);
}

.menu {
    border-right: none;
}

.main {
    padding: 20px;
}
</style>
