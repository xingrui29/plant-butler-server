// server/api/info.get.ts

export default defineEventHandler(() => {
    return {
        name: 'plant-butler-server',
        version: '1.0.0',
        description: 'powered by Nuxt 4',
        localTime: new Date().toLocaleString()
    }
})