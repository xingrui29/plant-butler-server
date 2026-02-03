// server/middleware/logger.server.ts
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
    let body
    try {
        body = await readBody(event)
    } catch { }

    console.log(
        new Date().toLocaleString(),
        event.method,
        event.node.req.url,
        body ? `Body: ${JSON.stringify(body)}` : ''
    )
})
