import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
    return {
        name: 'plant-butler-server',
        version: '1.0.0',
        description: 'Powered By Nuxt 4',
        localTime: new Date().toLocaleString()
    }
})