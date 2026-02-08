import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../database/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id } = body

    if (!id) {
        return { error: 'id & status required' }
    }

    const db = getDb()

    const info = db.prepare(`
    UPDATE commands
    SET status = 'done'
    WHERE id = ?
  `).run(id)

    if (info.changes === 0) {
        return { error: 'command not found' }
    }

    return { success: true }
})
