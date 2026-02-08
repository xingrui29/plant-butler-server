import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../database/db'

const PENDING_TIMEOUT = 30 * 1000      // 30 秒
const RUNNING_TIMEOUT = 2 * 60 * 1000  // 2 分钟

export default defineEventHandler(async (event) => {
    const { device_id } = getQuery(event)
    if (!device_id) {
        return { error: 'device_id required' }
    }

    const db = getDb()
    const now = Date.now()

    db.prepare(`
    UPDATE commands
    SET status = 'timeout'
    WHERE device_id = ?
      AND status = 'pending'
      AND (? - created_at) > ?
  `).run(device_id, now, PENDING_TIMEOUT)

    db.prepare(`
    UPDATE commands
    SET status = 'timeout'
    WHERE device_id = ?
      AND status = 'running'
      AND (? - executed_at) > ?
  `).run(device_id, now, RUNNING_TIMEOUT)

    const cmd = db.prepare(`
    SELECT * FROM commands
    WHERE device_id = ?
      AND status = 'pending'
    ORDER BY created_at ASC
    LIMIT 1
  `).get(device_id)

    if (!cmd) {
        return { command: null }
    }

    db.prepare(`
    UPDATE commands
    SET status = 'running',
        executed_at = ?
    WHERE id = ?
  `).run(now, cmd.id)

    return {
        id: cmd.id,
        command: cmd.command,
        params: cmd.params ? JSON.parse(cmd.params) : null
    }
})
