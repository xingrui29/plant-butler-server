import { defineEventHandler, readBody, createError } from 'h3'
import { getDb } from '../database/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, email, password } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: '用户名和密码不能为空'
        })
    }

    const db = getDb()

    const exists = db
        .prepare('SELECT id FROM users WHERE username = ?')
        .get(username)

    if (exists) {
        throw createError({
            statusCode: 409,
            statusMessage: '用户名已存在'
        })
    }

    const createdAt = Math.floor(Date.now() / 1000)

    db.prepare(`
    INSERT INTO users (username, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(username, email, password, createdAt)

    return { success: true }
})
