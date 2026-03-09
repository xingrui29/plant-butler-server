<template>
    <div class="commands-page">
        <!-- 页面卡片 -->
        <div class="page-card">
            <!-- 查询表单 -->
            <div class="filter-section">
                <el-form :inline="true" :model="query" class="filter-form">
                    <el-form-item label="设备 ID">
                        <el-input v-model="query.device_id" placeholder="请输入" clearable class="filter-input" />
                    </el-form-item>
                    <el-form-item label="指令">
                        <el-input v-model="query.command" placeholder="请输入" clearable class="filter-input" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="query.status" clearable placeholder="全部" class="filter-select">
                            <el-option label="待执行" value="pending" />
                            <el-option label="执行中" value="running" />
                            <el-option label="已完成" value="done" />
                            <el-option label="失败" value="failed" />
                            <el-option label="超时" value="timeout" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="query-btn" @click="fetchList(true)">
                            <el-icon><Search /></el-icon>
                            <span>查询</span>
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper">
                <el-table :data="list" style="width: 100%;" :header-cell-style="{ background: 'transparent' }">
                    <el-table-column prop="id" label="ID" width="70" align="center" />
                    <el-table-column prop="device_id" label="设备" width="140">
                        <template #default="{ row }">
                            <div class="device-cell">
                                <el-icon class="device-icon"><Monitor /></el-icon>
                                <span>{{ row.device_id }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="command" label="指令" width="140">
                        <template #default="{ row }">
                            <el-tag effect="plain" class="command-tag">{{ row.command }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="参数" min-width="140">
                        <template #default="{ row }">
                            <span class="params-text">{{ row.params ? JSON.stringify(row.params) : '-' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="statusType(row.status)" effect="dark" class="status-tag">
                                {{ statusLabel(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" width="160">
                        <template #default="{ row }">
                            <span class="time-text">{{ formatTime(row.created_at) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="执行时间" width="160">
                        <template #default="{ row }">
                            <span class="time-text">{{ row.executed_at ? formatTime(row.executed_at) : '-' }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :page-size="query.limit"
                    :current-page="page"
                    :total="total"
                    @current-change="onPageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { Monitor, Search } from '@element-plus/icons-vue'

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

const statusLabel = (status) => {
    return {
        pending: '待执行',
        running: '执行中',
        done: '已完成',
        failed: '失败',
        timeout: '超时'
    }[status] || status
}

onMounted(fetchList)
</script>

<style scoped>
.commands-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.filter-section {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.filter-form :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 0;
}

.filter-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #4a4a6a;
}

.filter-input {
    width: 140px;
}

.filter-input :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.filter-input :deep(.el-input__wrapper:hover),
.filter-select :deep(.el-input__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.5);
}

.filter-input :deep(.el-input__wrapper.is-focus),
.filter-select :deep(.el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
    width: 120px;
}

.filter-select :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.query-btn {
    border-radius: 10px;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
}

.query-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.table-wrapper {
    padding: 0 24px;
}

/* 表格样式 */
:deep(.el-table) {
    background: transparent;
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgba(102, 126, 234, 0.06);
}

:deep(.el-table th.el-table__cell) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    font-weight: 600;
    color: #4a4a6a;
}

:deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

:deep(.el-table::before) {
    display: none;
}

.device-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.device-icon {
    color: #667eea;
}

.command-tag {
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 12px;
}

.params-text {
    font-size: 12px;
    color: #8a8a9a;
    font-family: 'SF Mono', Monaco, monospace;
}

.status-tag {
    border-radius: 8px;
    font-size: 12px;
}

.time-text {
    font-size: 13px;
    color: #8a8a9a;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 20px 24px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>