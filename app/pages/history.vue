<template>
    <div class="history-page">
        <!-- 筛选器 -->
        <div class="filter-bar">
            <el-select
                v-model="selectedDevice"
                placeholder="请选择设备"
                size="large"
                class="device-select"
                @change="fetchHistory"
            >
                <el-option
                    v-for="device in devices"
                    :key="device.id"
                    :label="device.name || device.id"
                    :value="device.id"
                />
            </el-select>

            <el-select
                v-model="selectedDays"
                placeholder="选择天数"
                size="large"
                class="days-select"
                @change="fetchHistory"
            >
                <el-option label="最近 7 天" :value="7" />
                <el-option label="最近 14 天" :value="14" />
                <el-option label="最近 30 天" :value="30" />
                <el-option label="最近 60 天" :value="60" />
                <el-option label="最近 90 天" :value="90" />
            </el-select>

            <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="fetchHistory"
                class="refresh-btn"
            >
                <el-icon><Refresh /></el-icon>
                刷新
            </el-button>
        </div>

        <!-- 图表区域 -->
        <div v-if="selectedDevice && historyData" class="charts-container">
            <!-- 温度图表 -->
            <div class="chart-card">
                <h3 class="chart-title">
                    <el-icon><Sunny /></el-icon>
                    温度变化
                </h3>
                <div ref="temperatureChart" class="chart"></div>
            </div>

            <!-- 空气湿度图表 -->
            <div class="chart-card">
                <h3 class="chart-title">
                    <el-icon><Cloudy /></el-icon>
                    空气湿度变化
                </h3>
                <div ref="airHumidityChart" class="chart"></div>
            </div>

            <!-- 土壤湿度图表 -->
            <div class="chart-card">
                <h3 class="chart-title">
                    <el-icon><Operation /></el-icon>
                    土壤湿度变化
                </h3>
                <div ref="soilHumidityChart" class="chart"></div>
            </div>

            <!-- 光照强度图表 -->
            <div class="chart-card">
                <h3 class="chart-title">
                    <el-icon><Sunny /></el-icon>
                    光照强度变化
                </h3>
                <div ref="lightIntensityChart" class="chart"></div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!selectedDevice" class="empty-state">
            <div class="empty-icon">
                <el-icon size="64"><Monitor /></el-icon>
            </div>
            <h3>请选择设备</h3>
            <p>选择一个设备查看其历史数据</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Refresh, Sunny, Cloudy, Operation, Monitor, Document } from '@element-plus/icons-vue'

const devices = ref([])
const selectedDevice = ref('')
const selectedDays = ref(7)
const loading = ref(false)
const historyData = ref(null)

// 图表引用
const temperatureChart = ref(null)
const airHumidityChart = ref(null)
const soilHumidityChart = ref(null)
const lightIntensityChart = ref(null)

// 图表实例
let temperatureChartInstance = null
let airHumidityChartInstance = null
let soilHumidityChartInstance = null
let lightIntensityChartInstance = null

// 获取设备列表
const fetchDevices = async () => {
    try {
        devices.value = await $fetch('/api/devices')
    } catch (error) {
        console.error('获取设备列表失败:', error)
    }
}

// 获取历史数据
const fetchHistory = async () => {
    if (!selectedDevice.value) return

    // 清除之前的图表数据
    clearCharts()

    loading.value = true
    try {
        const result = await $fetch('/api/history', {
            query: {
                id: selectedDevice.value,
                days: selectedDays.value
            }
        })

        if (result.success) {
            historyData.value = result.data
            await nextTick()
            renderCharts()
        } else {
            historyData.value = []
        }
    } catch (error) {
        console.error('获取历史数据失败:', error)
        historyData.value = []
    } finally {
        loading.value = false
    }
}

// 格式化时间戳
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 通用图表配置
const createChartOption = (data, title, unit, color) => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(item => formatTimestamp(item.timestamp)),
            axisLine: {
                lineStyle: {
                    color: '#dcdfe6'
                }
            },
            axisLabel: {
                color: '#606266',
                rotate: data.length > 20 ? 45 : 0
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#dcdfe6'
                }
            },
            axisLabel: {
                color: '#606266',
                formatter: `{value} ${unit}`
            },
            splitLine: {
                lineStyle: {
                    color: '#f4f4f5'
                }
            }
        },
        series: [
            {
                name: title,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    width: 2,
                    color: color
                },
                itemStyle: {
                    color: color
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: color.replace(')', ', 0.3)').replace('rgb', 'rgba')
                            },
                            {
                                offset: 1,
                                color: color.replace(')', ', 0.05)').replace('rgb', 'rgba')
                            }
                        ]
                    }
                },
                data: data.map(item => item.temperature || item.air_humidity || item.soil_humidity || item.light_intensity)
            }
        ]
    }
}

// 渲染图表
const renderCharts = () => {
    if (!historyData.value || historyData.value.length === 0) return

    const data = [...historyData.value].reverse() // 按时间正序排列

    // 温度图表
    if (temperatureChart.value) {
        if (temperatureChartInstance) {
            temperatureChartInstance.dispose()
        }
        temperatureChartInstance = echarts.init(temperatureChart.value)
        const tempData = data.map(item => item.temperature)
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => formatTimestamp(item.timestamp)),
                axisLabel: { color: '#606266', rotate: data.length > 20 ? 45 : 0 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#606266', formatter: '{value} °C' },
                splitLine: { lineStyle: { color: '#f4f4f5' } }
            },
            series: [{
                name: '温度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#ff6b6b' },
                itemStyle: { color: '#ff6b6b' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                            { offset: 1, color: 'rgba(255, 107, 107, 0.05)' }
                        ]
                    }
                },
                data: tempData
            }]
        }
        temperatureChartInstance.setOption(option)
    }

    // 空气湿度图表
    if (airHumidityChart.value) {
        if (airHumidityChartInstance) {
            airHumidityChartInstance.dispose()
        }
        airHumidityChartInstance = echarts.init(airHumidityChart.value)
        const airHumData = data.map(item => item.air_humidity)
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => formatTimestamp(item.timestamp)),
                axisLabel: { color: '#606266', rotate: data.length > 20 ? 45 : 0 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#606266', formatter: '{value} %' },
                splitLine: { lineStyle: { color: '#f4f4f5' } }
            },
            series: [{
                name: '空气湿度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#4ecdc4' },
                itemStyle: { color: '#4ecdc4' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
                            { offset: 1, color: 'rgba(78, 205, 196, 0.05)' }
                        ]
                    }
                },
                data: airHumData
            }]
        }
        airHumidityChartInstance.setOption(option)
    }

    // 土壤湿度图表
    if (soilHumidityChart.value) {
        if (soilHumidityChartInstance) {
            soilHumidityChartInstance.dispose()
        }
        soilHumidityChartInstance = echarts.init(soilHumidityChart.value)
        const soilHumData = data.map(item => item.soil_humidity)
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => formatTimestamp(item.timestamp)),
                axisLabel: { color: '#606266', rotate: data.length > 20 ? 45 : 0 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#606266', formatter: '{value} %' },
                splitLine: { lineStyle: { color: '#f4f4f5' } }
            },
            series: [{
                name: '土壤湿度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#95e1d3' },
                itemStyle: { color: '#95e1d3' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(149, 225, 211, 0.3)' },
                            { offset: 1, color: 'rgba(149, 225, 211, 0.05)' }
                        ]
                    }
                },
                data: soilHumData
            }]
        }
        soilHumidityChartInstance.setOption(option)
    }

    // 光照强度图表
    if (lightIntensityChart.value) {
        if (lightIntensityChartInstance) {
            lightIntensityChartInstance.dispose()
        }
        lightIntensityChartInstance = echarts.init(lightIntensityChart.value)
        const lightData = data.map(item => item.light_intensity)
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => formatTimestamp(item.timestamp)),
                axisLabel: { color: '#606266', rotate: data.length > 20 ? 45 : 0 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#606266', formatter: '{value}' },
                splitLine: { lineStyle: { color: '#f4f4f5' } }
            },
            series: [{
                name: '光照强度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#ffd93d' },
                itemStyle: { color: '#ffd93d' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(255, 217, 61, 0.3)' },
                            { offset: 1, color: 'rgba(255, 217, 61, 0.05)' }
                        ]
                    }
                },
                data: lightData
            }]
        }
        lightIntensityChartInstance.setOption(option)
    }
}

// 清除所有图表
const clearCharts = () => {
    if (temperatureChartInstance) {
        temperatureChartInstance.dispose()
        temperatureChartInstance = null
    }
    if (airHumidityChartInstance) {
        airHumidityChartInstance.dispose()
        airHumidityChartInstance = null
    }
    if (soilHumidityChartInstance) {
        soilHumidityChartInstance.dispose()
        soilHumidityChartInstance = null
    }
    if (lightIntensityChartInstance) {
        lightIntensityChartInstance.dispose()
        lightIntensityChartInstance = null
    }
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
    if (temperatureChartInstance) temperatureChartInstance.resize()
    if (airHumidityChartInstance) airHumidityChartInstance.resize()
    if (soilHumidityChartInstance) soilHumidityChartInstance.resize()
    if (lightIntensityChartInstance) lightIntensityChartInstance.resize()
}

onMounted(() => {
    fetchDevices()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (temperatureChartInstance) temperatureChartInstance.dispose()
    if (airHumidityChartInstance) airHumidityChartInstance.dispose()
    if (soilHumidityChartInstance) soilHumidityChartInstance.dispose()
    if (lightIntensityChartInstance) lightIntensityChartInstance.dispose()
})
</script>

<style scoped>
.history-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 筛选器 */
.filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 16px 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.device-select {
    flex: 1;
    min-width: 200px;
}

.days-select {
    width: 160px;
}

.refresh-btn {
    width: 100px;
}

/* 图表容器 */
.charts-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}

.chart-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.chart-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
}

.chart {
    width: 100%;
    height: 300px;
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

/* 响应式 */
@media (max-width: 768px) {
    .filter-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .device-select {
        width: 100%;
    }

    .days-select {
        width: 100%;
    }

    .refresh-btn {
        width: 100%;
    }
}
</style>
