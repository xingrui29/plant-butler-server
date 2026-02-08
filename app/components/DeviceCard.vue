<template>
    <el-card shadow="hover" style="height: 350px;">
        <template #header>
            <el-row justify="space-between" align="middle">
                <el-text strong>
                    {{ device.name }} ({{ device.id }})
                </el-text>
                <el-tag :type="statusTagType(device.status)" effect="dark">
                    {{ device.status }}
                </el-tag>
            </el-row>
        </template>

        <el-space direction="vertical" size="large" style="width: 100%;">
            <el-descriptions :column="1" size="small">
                <el-descriptions-item label="最后在线">
                    {{ formatTime(device.last_seen) }}
                </el-descriptions-item>
            </el-descriptions>

            <template v-if="device.telemetry">
                <ProgressRow icon="🌫" label="空气湿度" :value="device.telemetry.air_humidity" />

                <ProgressRow icon="🌱" label="土壤湿度" :value="device.telemetry.soil_humidity" />

                <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="🌡 温度">
                        {{ device.telemetry.temperature }} °C
                    </el-descriptions-item>

                    <el-descriptions-item label="☀ 光照">
                        {{ device.telemetry.light_intensity }} lux
                    </el-descriptions-item>

                    <el-descriptions-item label="💧 上一次浇水">
                        {{ formatTime(device.telemetry.auto_watering) }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-space>
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
</script>
