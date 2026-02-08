<template>
    <el-row align="middle" justify="space-between">
        <el-space>
            <span>{{ icon }}</span>
            <el-text size="small" type="info">
                {{ label }}&nbsp;&nbsp;
            </el-text>
        </el-space>

        <el-space style="flex: 1; justify-content: flex-end;">
            <el-progress :percentage="value" :stroke-width="8" :show-text="false" :color="progressColor(value)"
                style="width: 120px;" />
            <el-text size="small" type="info">
                {{ value }}%
            </el-text>
        </el-space>
    </el-row>
</template>

<script setup>
defineProps({
    icon: String,
    label: String,
    value: Number
})

const progressColor = (value) => {
    if (value < 30) return '#F56C6C'
    if (value < 70) return '#E6A23C'
    return '#67C23A'
}
</script>
