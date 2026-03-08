// server/api/telemetry/[deviceId].post.ts
import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
  const deviceId = event.context.params?.deviceId as string
  const body = await readBody(event)

  const db = getDb()

  const secret = db.prepare(`
    SELECT secret FROM devices WHERE id = ?
  `).get(deviceId)?.secret

  if (body.secret !== secret) {
    return { error: 'Invalid secret' }
  }

  // 更新设备状态
  db.prepare(`
    UPDATE devices SET status = 'online', last_seen = ? WHERE id = ?
  `).run(Math.floor(Date.now() / 1000), deviceId)

  let auto_watering_time: number | null = null

  if (body.auto_watering === 1) {
    auto_watering_time = Math.floor(Date.now() / 1000)
  } else {
    const last = db.prepare(`
    SELECT auto_watering FROM telemetry
    WHERE device_id = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `).get(deviceId)

    auto_watering_time = last?.auto_watering ?? null
  }

  // 插入遥测数据
  db.prepare(`
    INSERT INTO telemetry (
      device_id, timestamp, soil_humidity, temperature,
      light_intensity, air_humidity, auto_watering
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    deviceId,
    Math.floor(Date.now() / 1000),
    body.soil_humidity || null,
    body.temperature || null,
    body.light_intensity || null,
    body.air_humidity || null,
    auto_watering_time
  )

  return { success: true }
})