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
        <div class="device-grid">
            <div v-for="device in devices" :key="device.id" class="device-item">
                <DeviceCard :device="device" />
            </div>
            <div class="device-item">
                <div class="add-card" @click="openAddDevice">
                    <el-icon size="40" class="add-icon"><Plus /></el-icon>
                    <span class="add-text">新增设备</span>
                </div>
            </div>
        </div>

        <!-- 新增设备对话框 -->
        <el-dialog v-model="addDeviceVisible" title="新增设备" width="440px" class="modern-dialog">
            <el-form :model="addDeviceForm" label-position="top" class="modern-form">
                <el-form-item label="所属用户">
                    <el-select v-model="addDeviceForm.user_id" placeholder="请选择用户" filterable style="width: 100%;">
                        <el-option
                            v-for="user in userList"
                            :key="user.id"
                            :label="user.username"
                            :value="user.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备名称">
                    <el-input v-model="addDeviceForm.name" placeholder="请输入设备名称" :prefix-icon="Monitor" />
                </el-form-item>
                <el-form-item label="设备密钥">
                    <div class="secret-input-row">
                        <el-input v-model="addDeviceForm.secret" placeholder="设备密钥" :prefix-icon="Key" />
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button class="footer-btn" @click="addDeviceVisible = false">取消</el-button>
                    <el-button type="primary" class="footer-btn primary" :loading="addingDevice" @click="addDevice">
                        创建
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Monitor, CircleCheck, CircleClose, Plus, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DeviceCard from '~/components/DeviceCard.vue'

const devices = ref([])
const userList = ref([])
const addDeviceVisible = ref(false)
const addingDevice = ref(false)
const addDeviceForm = ref({
    user_id: '',
    name: '',
    secret: ''
})

const onlineCount = computed(() => devices.value.filter(d => d.status === 'online').length)
const offlineCount = computed(() => devices.value.filter(d => d.status !== 'online').length)

const fetchData = async () => {
    devices.value = await $fetch('/api/devices')
}

const fetchUsers = async () => {
    try {
        const res = await $fetch('/api/users', { query: { page: 1, pageSize: 9999 } })
        userList.value = res.items
    } catch {
        userList.value = []
    }
}

const openAddDevice = async () => {
    const currentUserId = localStorage.getItem('userId') || ''
    addDeviceForm.value = { user_id: currentUserId, name: '', secret: '' }
    addDeviceVisible.value = true
    await fetchUsers()
}

const addDevice = async () => {
    const { user_id, name, secret } = addDeviceForm.value
    if (!user_id || !name || !secret) {
        ElMessage.warning('请填写所有必填项')
        return
    }

    addingDevice.value = true
    try {
        const res = await $fetch('/api/devices', {
            method: 'POST',
            body: { user_id, name, secret }
        })
        if (res.error) {
            ElMessage.error(res.error)
            return
        }
        ElMessage.success(`设备创建成功，ID: ${res.device_id}`)
        addDeviceVisible.value = false
        fetchData()
    } catch (err) {
        ElMessage.error(err?.data?.error || '创建设备失败')
    } finally {
        addingDevice.value = false
    }
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

/* 新增设备卡片 */
.add-card {
    height: 100%;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 2px dashed rgba(102, 126, 234, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-card:hover {
    border-color: rgba(102, 126, 234, 0.6);
    background: rgba(255, 255, 255, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.1);
}

.add-icon {
    color: #667eea;
    opacity: 0.5;
    transition: all 0.3s ease;
}

.add-card:hover .add-icon {
    opacity: 1;
    transform: scale(1.1);
}

.add-text {
    font-size: 15px;
    font-weight: 500;
    color: #8a8a9a;
    transition: color 0.3s ease;
}

.add-card:hover .add-text {
    color: #667eea;
}

/* 对话框样式 */
:deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-right: 0;
}

:deep(.el-dialog__title) {
    font-weight: 600;
    color: #1a1a2e;
}

:deep(.el-dialog__body) {
    padding: 24px;
}

.modern-form :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.modern-form :deep(.el-input__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.5);
}

.modern-form :deep(.el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.secret-input-row {
    display: flex;
    gap: 8px;
    width: 100%;
}

.secret-input-row .el-input {
    flex: 1;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.footer-btn {
    border-radius: 10px;
    font-weight: 500;
    min-width: 80px;
}

.footer-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}
</style>
