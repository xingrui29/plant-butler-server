// server/api/watering-records/[deviceId].get.ts
import { defineEventHandler } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler((event) => {
  const deviceId = event.context.params?.deviceId

  if (!deviceId) {
    return {
      success: false,
      error: 'Missing required path parameter: deviceId'
    }
  }

  const db = getDb()

  try {
    // 合并查询：手动浇水（来自commands表）+ 自动浇水（来自telemetry表）
    const records = db
      .prepare(`
        SELECT
          'manual' as type,
          device_id,
          created_at as timestamp,
          status
        FROM commands
        WHERE device_id = ?
          AND command = 'water'

        UNION ALL

        SELECT
          'auto' as type,
          device_id,
          auto_watering as timestamp,
          'done' as status
        FROM telemetry
        WHERE device_id = ?
          AND auto_watering IS NOT NULL

        ORDER BY timestamp DESC
        LIMIT 5
      `)
      .all(deviceId, deviceId)

    return {
      success: true,
      device_id: deviceId,
      count: records.length,
      data: records
    }
  } catch (err) {
    console.error('Fetch watering records error:', err)
    return {
      success: false,
      error: 'Failed to fetch watering records'
    }
  }
})