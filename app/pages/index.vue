<!-- app/pages/index.vue -->

<template>
    <el-row :gutter="20">
        <el-col :span="8" v-for="device in devices" :key="device.id">
            <DeviceCard :device="device" />
        </el-col>
    </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DeviceCard from '~/components/DeviceCard.vue'

const devices = ref([])

const fetchData = async () => {
    devices.value = await $fetch('/api/devices')
}

onMounted(() => {
    fetchData()
    setInterval(fetchData, 5000)
})
</script>
