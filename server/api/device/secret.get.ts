import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const secret = query.secret as string | undefined

    const db = getDb()

    const row = db.prepare(`
        SELECT
        id
        FROM devices
        WHERE secret = ?
        ORDER BY id DESC
        LIMIT 1
    `).get(secret)

    if (!row) {
        return { error: '设备未注册'}
    }

    return {
        id: row.id
    }
})
