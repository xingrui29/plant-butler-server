import { defineEventHandler } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const id = Number(event.context.params.id)
    const db = getDb()

    db.prepare(`DELETE FROM users WHERE id = ?`).run(id)

    return { success: true }
})
