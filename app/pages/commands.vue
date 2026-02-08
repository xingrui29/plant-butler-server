<template>
    <el-card shadow="never">
        <el-space direction="vertical" size="large" style="width: 100%;">
            <el-form :inline="true" :model="query">
                <el-form-item label="设备 ID">
                    <el-input v-model="query.device_id" placeholder="0001" clearable />
                </el-form-item>

                <el-form-item label="指令">
                    <el-input v-model="query.command" placeholder="" clearable />
                </el-form-item>

                <el-form-item label="状态">
                    <el-select v-model="query.status" clearable style="width: 140px">
                        <el-option label="待执行" value="pending" />
                        <el-option label="执行中" value="running" />
                        <el-option label="已完成" value="done" />
                        <el-option label="失败" value="failed" />
                        <el-option label="超时" value="timeout" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="fetchList(true)">查询</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="70" />
                <el-table-column prop="device_id" label="设备" width="160" />
                <el-table-column prop="command" label="指令" width="160" />

                <el-table-column label="参数">
                    <template #default="{ row }">
                        <el-text size="small" type="info">
                            {{ row.params ? JSON.stringify(row.params) : '-' }}
                        </el-text>
                    </template>
                </el-table-column>

                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="statusType(row.status)">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatTime(row.created_at) }}
                    </template>
                </el-table-column>

                <el-table-column label="执行时间" width="180">
                    <template #default="{ row }">
                        {{ row.executed_at ? formatTime(row.executed_at) : '-' }}
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination layout="prev, pager, next" :page-size="query.limit" :current-page="page" :total="total"
                @current-change="onPageChange" />
        </el-space>
    </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const list = ref([])
const page = ref(1)
const total = ref(0)

const query = reactive({
    device_id: '',
    command: '',
    status: '',
    limit: 10,
    offset: 0
})

const fetchList = async (reset = false) => {
    if (reset) page.value = 1
    query.offset = (page.value - 1) * query.limit
    const res = await $fetch('/api/command/all', { params: query })
    list.value = res.list
    total.value = res.total
}

const onPageChange = (p) => {
    page.value = p
    fetchList()
}

const formatTime = (ts) =>
    new Date(ts * 1000).toLocaleString()

const statusType = (status) => {
    return {
        pending: 'info',
        running: 'warning',
        done: 'success',
        failed: 'danger',
        timeout: 'danger'
    }[status] || 'info'
}

onMounted(fetchList)
</script>
