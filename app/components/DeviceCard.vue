<template>
    <el-card :body-style="{ padding: '25px' }" shadow="hover" style="height: 350px;">
        <template #header>
            <div class="clearfix">
                <span>{{ device.name }} ({{ device.id }})</span>
                <el-tag :type="statusTagType(device.status)" effect="dark" style="float: right">
                    {{ device.status }}
                </el-tag>
            </div>
        </template>

        <div class="info-item">
            <span class="label">最后在线</span>
            <span class="value">{{ formatTime(device.last_seen) }}</span>
        </div>

        <div v-if="device.telemetry">
            <div class="info-row">
                <div class="left">
                    <span class="icon">🌫</span>
                    <span class="label">空气湿度</span>
                </div>

                <div class="right progress-wrap">
                    <el-progress :percentage="device.telemetry.air_humidity" :stroke-width="8" :show-text="false"
                        :color="progressColor(device.telemetry.air_humidity)" />
                    <span class="percent">{{ device.telemetry.air_humidity }}%</span>
                </div>
            </div>

            <div class="info-row">
                <div class="left">
                    <span class="icon">🌱</span>
                    <span class="label">土壤湿度</span>
                </div>

                <div class="right progress-wrap">
                    <el-progress :percentage="device.telemetry.soil_humidity" :stroke-width="8" :show-text="false"
                        :color="progressColor(device.telemetry.soil_humidity)" />
                    <span class="percent">{{ device.telemetry.soil_humidity }}%</span>
                </div>
            </div>


            <div class="info-item">
                <span class="icon">🌡</span>
                <span class="label">温度</span>
                <span class="value">{{ device.telemetry.temperature }}°C</span>
            </div>

            <div class="info-item">
                <span class="icon">☀</span>
                <span class="label">光照</span>
                <span class="value">{{ device.telemetry.light_intensity }} lux</span>
            </div>

            <div class="info-item">
                <span class="icon">💧</span>
                <span class="label">上一次浇水</span>
                <span class="value">{{ formatTime(device.telemetry.auto_watering) }}</span>
            </div>
        </div>
    </el-card>
</template>

<script setup>
defineProps({
    device: {
        type: Object,
        required: true
    }
})

const formatTime = (timestamp) => {
    if (!timestamp) return '从未上线'
    return new Date(timestamp * 1000).toLocaleString()
}

const statusTagType = (status) =>
    status === 'online' ? 'success' : 'info'

const progressColor = (value) => {
    if (value < 30) return '#F56C6C'
    if (value < 70) return '#E6A23C'
    return '#67C23A'
}
</script>

<style scoped>
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #606266;
    font-size: 14px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.4;
}

.icon {
    width: 20px;
    text-align: center;
}

.right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 140px;
    justify-content: flex-end;
}

.label {
    color: #606266;
}

.value {
    margin-left: auto;
    color: #303133;
    font-weight: 500;
}

.progress {
    margin: 4px 0 12px 0;
}

.progress-wrap {
    padding-left: 20px;
    flex: 1;
}

.progress-wrap .el-progress {
    flex: 1;
}

.percent {
    width: 36px;
    text-align: right;
    font-size: 14px;
    color: #606266;
}
</style>
