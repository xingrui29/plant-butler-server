import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../database/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = Number(query.page || 1)
    const pageSize = Number(query.pageSize || 10)
    const offset = (page - 1) * pageSize

    const db = getDb()

    const items = db.prepare(`
    SELECT id, username, email, created_at
    FROM users
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `).all(pageSize, offset)

    const total = db.prepare(`
    SELECT COUNT(*) as count FROM users
  `).get().count

    return {
        items,
        total
    }
})
