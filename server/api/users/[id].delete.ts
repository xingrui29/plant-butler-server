import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const id = query.id
    const db = getDb()

    db.prepare(`DELETE FROM users WHERE id = ?`).run(id)

    return { success: true }
})
