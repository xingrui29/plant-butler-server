import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const deviceId = query.id as string | undefined

    const db = getDb()

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
        timestamp: row.timestamp
    }
})
