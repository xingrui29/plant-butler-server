<template>
    <div class="device-card" :class="{ 'device-offline': device.status !== 'online' }">
        <!-- 卡片头部 -->
        <div class="card-header">
            <div class="device-info">
                <div class="device-icon">
                    <el-icon size="20"><Monitor /></el-icon>
                </div>
                <div class="device-name">
                    <h3>{{ device.name }}</h3>
                    <div class="device-meta">
                        <span class="device-id">ID: {{ device.id }}</span>
                        <span v-if="device.owner_name" class="device-owner">
                            <el-icon><User /></el-icon>
                            {{ device.owner_name }}
                        </span>
                    </div>
                </div>
            </div>
            <el-tag :type="statusTagType(device.status)" effect="dark" class="status-tag">
                {{ device.status === 'online' ? '在线' : '离线' }}
            </el-tag>
        </div>

        <!-- 最后在线时间 -->
        <div class="last-seen">
            <el-icon><Clock /></el-icon>
            <span>最后在线: {{ formatTime(device.last_seen) }}</span>
        </div>

        <!-- 传感器数据 -->
        <div v-if="device.telemetry" class="telemetry-grid">
            <div class="sensor-item">
                <div class="sensor-icon humidity">🌫</div>
                <div class="sensor-data">
                    <span class="sensor-label">空气湿度</span>
                    <div class="sensor-value-row">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: formatNumber(device.telemetry.air_humidity) + '%', background: progressColor(device.telemetry.air_humidity) }"></div>
                        </div>
                        <span class="sensor-value">{{ formatNumber(device.telemetry.air_humidity) }}%</span>
                    </div>
                </div>
            </div>

            <div class="sensor-item">
                <div class="sensor-icon soil">🌱</div>
                <div class="sensor-data">
                    <span class="sensor-label">土壤湿度</span>
                    <div class="sensor-value-row">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: formatNumber(device.telemetry.soil_humidity) + '%', background: progressColor(device.telemetry.soil_humidity) }"></div>
                        </div>
                        <span class="sensor-value">{{ formatNumber(device.telemetry.soil_humidity) }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详细数据 -->
        <div v-if="device.telemetry" class="detail-grid">
            <div class="detail-item full-width">
                <span class="detail-icon">🌡</span>
                <div class="detail-info">
                    <span class="detail-label">温度</span>
                    <span class="detail-value">{{ formatNumber(device.telemetry.temperature) }}°C</span>
                </div>
            </div>

            <div class="detail-item full-width">
                <span class="detail-icon">☀</span>
                <div class="detail-info">
                    <span class="detail-label">光照</span>
                    <span class="detail-value">{{ formatNumber(device.telemetry.light_intensity) }} lux</span>
                </div>
            </div>

            <div class="detail-item full-width">
                <span class="detail-icon">💧</span>
                <div class="detail-info">
                    <span class="detail-label">上次浇水</span>
                    <span class="detail-value">{{ formatTime(device.telemetry.auto_watering) }}</span>
                </div>
            </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else class="no-data">
            <el-icon size="32"><Warning /></el-icon>
            <span>暂无传感器数据</span>
        </div>

        <!-- 浇水按钮 -->
        <div class="water-action">
            <el-button
                type="primary"
                class="water-btn"
                :disabled="watering"
                :loading="watering"
                @click="handleWater"
            >
                💧 {{ device.status === 'online' ? '浇水' : '设备离线' }}
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Monitor, Clock, Warning, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    device: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['refresh'])

const watering = ref(false)

const formatNumber = (value) => {
    if (value == null) return '--'
    return Number(value).toFixed(2)
}

const formatTime = (timestamp) => {
    if (!timestamp) return '从未上线'
    return new Date(timestamp * 1000).toLocaleString()
}

const statusTagType = (status) =>
    status === 'online' ? 'success' : 'info'

const progressColor = (value) => {
    if (value < 30) return 'linear-gradient(90deg, #f56c6c, #f78989)'
    if (value < 70) return 'linear-gradient(90deg, #e6a23c, #f0c78a)'
    return 'linear-gradient(90deg, #67c23a, #95d475)'
}

const handleWater = async () => {
    if (props.device.status !== 'online') {
        // 设备离线时，仍然发送指令但记录为失败
        watering.value = true
        try {
            const res = await $fetch('/api/command', {
                method: 'POST',
                body: { deviceId: props.device.id }
            })
            ElMessage.warning(res.message || '设备离线，浇水指令记录为失败')
        } catch (e) {
            ElMessage.error('发送指令失败')
        } finally {
            watering.value = false
        }
        emit('refresh')
        return
    }

    watering.value = true
    try {
        const res = await $fetch('/api/command', {
            method: 'POST',
            body: { deviceId: props.device.id }
        })
        ElMessage.success('浇水指令已发送')
    } catch (e) {
        ElMessage.error('发送指令失败')
    } finally {
        watering.value = false
    }
    emit('refresh')
}
</script>

<style scoped>
.device-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 20px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    transition: all 0.4s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.device-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
}

.device-card.device-offline {
    opacity: 0.7;
}

/* 卡片头部 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.device-info {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.device-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.device-name h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
}

.device-id {
    font-size: 12px;
    color: #8a8a9a;
}

.device-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.device-owner {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #667eea;
    background: rgba(102, 126, 234, 0.08);
    padding: 2px 8px;
    border-radius: 10px;
}

.status-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 6px;
    border-radius: 20px;
    font-size: 12px;
}

.status-dot {
    font-size: 10px;
}

/* 最后在线时间 */
.last-seen {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8a8a9a;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
}

/* 传感器网格 */
.telemetry-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sensor-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
}

.sensor-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border-radius: 10px;
    flex-shrink: 0;
}

.sensor-icon.humidity {
    background: rgba(64, 158, 255, 0.1);
}

.sensor-icon.soil {
    background: rgba(103, 194, 58, 0.1);
}

.sensor-data {
    flex: 1;
    min-width: 0;
}

.sensor-label {
    font-size: 12px;
    color: #8a8a9a;
    display: block;
    margin-bottom: 6px;
}

.sensor-value-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.sensor-value {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    min-width: 45px;
    text-align: right;
}

/* 详细数据网格 */
.detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: auto;
}

.detail-item {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
}

.detail-item.full-width {
    grid-column: span 2;
}

.detail-icon {
    font-size: 20px;
}

.detail-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.detail-label {
    font-size: 11px;
    color: #8a8a9a;
}

.detail-value {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a2e;
}

/* 无数据状态 */
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #8a8a9a;
    font-size: 13px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
}

/* 浇水按钮 */
.water-action {
    margin-top: auto;
    padding-top: 12px;
}

.water-btn {
    width: 100%;
    border-radius: 12px;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
}

.water-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.water-btn:disabled {
    background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
    box-shadow: none;
}
</style>
