// server/api/command.post.ts
import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../database/db'

const WATERING_DURATION = 5 // 默认浇水时长（秒）

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { deviceId, duration } = body

    if (!deviceId) {
        return { success: false, error: 'deviceId is required' }
    }

    const db = getDb()

    // 检查设备状态
    const device = db.prepare(`
        SELECT id, status FROM devices WHERE id = ?
    `).get(deviceId)

    if (!device) {
        return { success: false, error: 'Device not found' }
    }

    const now = Math.floor(Date.now() / 1000)
    const isOnline = device.status === 'online'

    // 插入浇水指令，根据设备状态设置初始状态
    const result = db.prepare(`
        INSERT INTO commands (device_id, command, params, status, created_at, executed_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        deviceId,
        'water',
        JSON.stringify({ duration: duration || WATERING_DURATION }),
        isOnline ? 'pending' : 'failed',
        now,
        isOnline ? null : now
    )

    return {
        success: true,
        commandId: result.lastInsertRowid,
        status: isOnline ? 'pending' : 'failed',
        message: isOnline ? '浇水指令已发送' : '设备离线，浇水指令记录为失败'
    }
})