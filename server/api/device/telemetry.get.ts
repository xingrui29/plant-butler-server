import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const deviceId = query.id as string | undefined

    const db = getDb()

    // 查询最近成功浇水的指令（status='done'）
    const lastWateringCmd = db.prepare(`
        SELECT executed_at
        FROM commands
        WHERE device_id = ? AND command = 'water' AND status = 'done'
        ORDER BY executed_at DESC
        LIMIT 1
    `).get(deviceId) as { executed_at: number | null } | undefined

    // 查询当前 telemetry 中的 auto_watering 时间
    const currentTelemetry = db.prepare(`
        SELECT auto_watering
        FROM telemetry
        WHERE device_id = ?
        ORDER BY id DESC
        LIMIT 1
    `).get(deviceId) as { auto_watering: number } | undefined

    // 如果有成功的浇水记录且时间更新，则更新 telemetry
    if (lastWateringCmd?.executed_at && currentTelemetry) {
        const cmdTime = lastWateringCmd.executed_at
        const telemetryTime = currentTelemetry.auto_watering || 0

        if (cmdTime > telemetryTime) {
            db.prepare(`
                UPDATE telemetry
                SET auto_watering = ?
                WHERE device_id = ? AND id = (
                    SELECT id FROM telemetry WHERE device_id = ? ORDER BY id DESC LIMIT 1
                )
            `).run(cmdTime, deviceId, deviceId)
        }
    }

    const row = db.prepare(`
        SELECT
        *
        FROM telemetry
        WHERE device_id = ?
        ORDER BY id DESC
        LIMIT 1
    `).get(deviceId)

    if (!row) {
        return { error: '没有数据'}
    }

    return {
        temperature: row.temperature,
        air_humidity: row.air_humidity,
        soil_humidity: row.soil_humidity,
        light_intensity: row.light_intensity,
        timestamp: row.timestamp,
        auto_watering: row.auto_watering
    }
})
