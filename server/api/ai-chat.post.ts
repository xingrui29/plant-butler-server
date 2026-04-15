import { defineEventHandler, readBody, createError } from 'h3'
import ollama from 'ollama'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { message } = body

    if (!message) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Message is required'
        })
    }

    try {
        const response = await ollama.chat({
            model: 'qwen2.5:0.5b',
            messages: [{ role: 'user', content: message }]
        })

        return {
            success: true,
            content: response.message.content
        }
    } catch (error) {
        console.error('Ollama API error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to communicate with AI model'
        })
    }
})
