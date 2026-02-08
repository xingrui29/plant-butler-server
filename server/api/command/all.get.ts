import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const deviceId = query.device_id as string | undefined
    const status = query.status as string | undefined
    const command = query.command as string | undefined

    const limit = Number(query.limit || 20)
    const offset = Number(query.offset || 0)

    const db = getDb()

    let whereSql = `WHERE 1 = 1`
    const whereArgs: any[] = []

    if (deviceId) {
        whereSql += ` AND device_id = ?`
        whereArgs.push(deviceId)
    }

    if (status) {
        whereSql += ` AND status = ?`
        whereArgs.push(status)
    }

    if (command) {
        whereSql += ` AND command LIKE ?`
        whereArgs.push(`%${command}%`)
    }

    const totalSql = `
    SELECT COUNT(*) as count
    FROM commands
    ${whereSql}
  `

    const total = db.prepare(totalSql).get(...whereArgs).count

    const listSql = `
    SELECT
      id,
      device_id,
      command,
      params,
      status,
      created_at,
      executed_at
    FROM commands
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `

    const list = db
        .prepare(listSql)
        .all(...whereArgs, limit, offset)

    return {
        list: list.map(row => ({
            ...row,
            params: row.params ? JSON.parse(row.params) : null
        })),
        total,
        limit,
        offset
    }
})
