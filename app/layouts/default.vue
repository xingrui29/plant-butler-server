<template>
    <div style="height: 100vh; width: 100vw; overflow: hidden;">
        <el-container style="height: 100%;">
            <el-header height="60px" style="overflow: hidden;">
                <el-row justify="space-between" align="middle" style="height: 100%;">
                    <el-text strong size="large">
                        后台管理系统
                    </el-text>

                    <el-dropdown>
                        <el-button type="primary">
                            <el-icon>
                                <User />
                            </el-icon>
                            <span>{{ username }}</span>
                            <el-icon>
                                <ArrowDown />
                            </el-icon>
                        </el-button>

                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="logout">
                                    退出系统
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-row>
            </el-header>

            <el-container style="overflow: hidden; height: 100%;">
                <el-aside width="150px">
                    <el-menu :default-active="activeMenu" router>
                        <el-menu-item index="/">
                            <el-icon>
                                <Monitor />
                            </el-icon>
                            <span>设备概览</span>
                        </el-menu-item>
                        <el-menu-item index="/users">
                            <el-icon>
                                <User />
                            </el-icon>
                            <span>用户管理</span>
                        </el-menu-item>
                        <el-menu-item index="/commands">
                            <el-icon>
                                <Monitor />
                            </el-icon>
                            <span>指令管理</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>

                <el-main style="overflow-y: auto;">
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
import { User, ArrowDown, Monitor } from '@element-plus/icons-vue'

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
.el-header {
    border-bottom: 1px solid var(--el-border-color);
}

.el-aside {
    border-right: 1px solid var(--el-border-color);
}
</style>
