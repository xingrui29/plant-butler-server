import { defineEventHandler, getRouterParam } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        return { success: false, error: '缺少用户ID' }
    }

    const db = getDb()
    db.prepare(`DELETE FROM users WHERE id = ?`).run(id)

    return { success: true }
})
