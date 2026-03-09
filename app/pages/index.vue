<template>
    <div class="device-overview">
        <!-- 页面头部统计 -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon total">
                    <el-icon size="24"><Monitor /></el-icon>
                </div>
                <div class="stat-info">
                    <span class="stat-value">{{ devices.length }}</span>
                    <span class="stat-label">设备总数</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon online">
                    <el-icon size="24"><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                    <span class="stat-value">{{ onlineCount }}</span>
                    <span class="stat-label">在线设备</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon offline">
                    <el-icon size="24"><CircleClose /></el-icon>
                </div>
                <div class="stat-info">
                    <span class="stat-value">{{ offlineCount }}</span>
                    <span class="stat-label">离线设备</span>
                </div>
            </div>
        </div>

        <!-- 设备网格 -->
        <div v-if="devices.length > 0" class="device-grid">
            <div v-for="device in devices" :key="device.id" class="device-item">
                <DeviceCard :device="device" />
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <div class="empty-icon">
                <el-icon size="64"><Monitor /></el-icon>
            </div>
            <h3>暂无设备</h3>
            <p>等待设备连接到系统</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Monitor, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import DeviceCard from '~/components/DeviceCard.vue'

const devices = ref([])

const onlineCount = computed(() => devices.value.filter(d => d.status === 'online').length)
const offlineCount = computed(() => devices.value.filter(d => d.status !== 'online').length)

const fetchData = async () => {
    devices.value = await $fetch('/api/devices')
}

onMounted(() => {
    fetchData()
    setInterval(fetchData, 5000)
})
</script>

<style scoped>
.device-overview {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 统计卡片 */
.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.stat-icon.total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.stat-icon.online {
    background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
    box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
}

.stat-icon.offline {
    background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
    box-shadow: 0 4px 16px rgba(144, 147, 153, 0.3);
}

.stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1;
}

.stat-label {
    font-size: 13px;
    color: #8a8a9a;
}

/* 设备网格 */
.device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
}

.device-item {
    min-height: 380px;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.empty-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
}

.empty-state p {
    margin: 0;
    color: #8a8a9a;
    font-size: 14px;
}
</style>
