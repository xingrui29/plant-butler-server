import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const deviceId = query.device_id as string
    const status = query.status as string | undefined

    const limit = Number(query.limit || 20)
    const offset = Number(query.offset || 0)

    if (!deviceId) {
        return { error: 'device_id required' }
    }

    const db = getDb()

    let sql = `
    SELECT
      id,
      device_id,
      command,
      params,
      status,
      created_at,
      executed_at
    FROM commands
    WHERE device_id = ?
  `
    const args: any[] = [deviceId]

    if (status) {
        sql += ` AND status = ?`
        args.push(status)
    }

    sql += `
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
    args.push(limit, offset)

    const list = db.prepare(sql).all(...args)

    return {
        list: list.map(row => ({
            ...row,
            params: row.params ? JSON.parse(row.params) : null
        })),
        limit,
        offset
    }
})
