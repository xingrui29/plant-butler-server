import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const userId = query.id as string | undefined

    if (!userId) {
        return { error: '未登录' }
    }

    const status = query.status as string | undefined
    const limit = Number(query.limit || 20)
    const offset = Number(query.offset || 0)

    const db = getDb()

    let whereSql = `WHERE user_id = ?`
    const whereArgs: any[] = [userId]

    if (status) {
        whereSql += ` AND status = ?`
        whereArgs.push(status)
    }

    const listSql = `
        SELECT
        id,
        name,
        status,
        last_seen,
        location
        FROM devices
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `

    const list = db
        .prepare(listSql)
        .all(...whereArgs, limit, offset)

    const totalSql = `
        SELECT COUNT(*) as count
        FROM devices
        ${whereSql}
    `

    const total = db
        .prepare(totalSql)
        .get(...whereArgs).count

    return {
        list,
        total,
        limit,
        offset
    }
})
