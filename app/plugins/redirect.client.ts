import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export default defineNuxtPlugin(() => {
    if (process.client) {
        const router = useRouter()

        router.beforeEach(async (to, from, next) => {
            const username = localStorage.getItem('username')
            if (to.path === '/login') {
                if (username) {
                    next('/')
                } else {
                    next()
                }
                return
            }

            if (!username) {
                ElMessage.warning('请先登录')
                console.log('redirect.client.ts: 未检测到username重定向到/login')
                next('/login')
                return
            }

            next()
        })
    }
})