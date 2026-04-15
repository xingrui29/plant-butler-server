<template>
    <div class="ai-chat-container">
        <div class="chat-wrapper">
            <!-- 顶部工具栏 -->
            <div class="chat-header">
                <h2 class="chat-title">AI 对话助手</h2>
                <el-button
                    type="primary"
                    :icon="RefreshRight"
                    @click="startNewChat"
                    :disabled="messages.length === 0"
                    class="new-chat-btn"
                >
                    新对话
                </el-button>
            </div>

            <!-- 消息列表 -->
            <div class="messages-container" ref="messagesContainer">
                <div v-if="messages.length === 0" class="empty-chat">
                    <div class="empty-icon">
                        <el-icon size="64"><ChatLineRound /></el-icon>
                    </div>
                    <h3>开始与AI对话</h3>
                    <p>输入你的问题，我将为你提供帮助</p>
                </div>

                <div v-for="(msg, index) in messages" :key="index" :class="['message-item', msg.role]">
                    <div class="message-avatar">
                        <el-icon v-if="msg.role === 'user'" size="20"><User /></el-icon>
                        <el-icon v-else size="20"><Service /></el-icon>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-role">
                            {{ msg.role === 'user' ? '你' : 'AI助手' }}
                        </div>
                        <div class="message-content" v-html="renderedContent(msg.content)"></div>
                    </div>
                </div>

                <!-- 加载状态 -->
                <div v-if="loading" class="message-item assistant">
                    <div class="message-avatar">
                        <el-icon size="20"><Service /></el-icon>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-role">AI助手</div>
                        <div class="loading-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->
            <div class="input-area">
                <el-input
                    v-model="userMessage"
                    type="textarea"
                    :rows="1"
                    autosize
                    placeholder="输入你的问题..."
                    @keydown.enter.prevent="sendMessage"
                    :disabled="loading"
                    class="message-input"
                />
                <el-button
                    type="primary"
                    @click="sendMessage"
                    :disabled="loading || !userMessage.trim()"
                    class="send-button"
                >
                    <el-icon><Promotion /></el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatLineRound, User, Service, Promotion, RefreshRight } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
})

const userMessage = ref('')
const messages = ref([])
const loading = ref(false)
const messagesContainer = ref(null)
const STORAGE_KEY = 'ai-chat-history'

// 从 localStorage 加载对话记录
const loadMessages = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            messages.value = JSON.parse(saved)
        } catch (e) {
            console.error('Failed to load chat history:', e)
        }
    }
}

// 保存对话记录到 localStorage
const saveMessages = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
}

// 开始新对话
const startNewChat = () => {
    messages.value = []
    localStorage.removeItem(STORAGE_KEY)
    ElMessage.success('已开始新对话')
}

const renderedContent = (content) => {
    return md.render(content)
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

const sendMessage = async () => {
    if (!userMessage.value.trim() || loading.value) return

    const message = userMessage.value.trim()
    userMessage.value = ''

    // 添加用户消息
    messages.value.push({ role: 'user', content: message })
    saveMessages()
    scrollToBottom()

    loading.value = true

    try {
        const response = await $fetch('/api/ai-chat', {
            method: 'POST',
            body: { message }
        })

        if (response.success) {
            messages.value.push({ role: 'assistant', content: response.content })
            saveMessages()
        } else {
            throw new Error('Failed to get response')
        }
    } catch (error) {
        console.error('AI chat error:', error)
        ElMessage.error('无法连接到AI服务，请确保Ollama正在运行')
    } finally {
        loading.value = false
        scrollToBottom()
    }
}

// 组件挂载时加载对话记录
onMounted(() => {
    loadMessages()
    scrollToBottom()
})

// 监听消息变化，自动保存
watch(messages, () => {
    saveMessages()
}, { deep: true })
</script>

<style scoped>
.ai-chat-container {
    height: 100%;
    display: flex;
    justify-content: center;
}

.chat-wrapper {
    width: 100%;
    max-width: 900px;
    height: calc(100vh - 118px);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 聊天头部 */
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.5);
}

.chat-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
}

.new-chat-btn {
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.new-chat-btn:hover {
    background: linear-gradient(135deg, #5a6fd6 0%, #6a4194 100%);
}

.new-chat-btn:disabled {
    background: #d0d0d0;
    cursor: not-allowed;
}

/* 消息列表容器 */
.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 空状态 */
.empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
}

.empty-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    opacity: 0.8;
}

.empty-chat h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
}

.empty-chat p {
    margin: 0;
    color: #8a8a9a;
    font-size: 14px;
}

/* 消息项 */
.message-item {
    display: flex;
    gap: 12px;
    max-width: 85%;
    animation: fadeIn 0.3s ease;
}

.message-item.user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.message-item.assistant {
    align-self: flex-start;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
}

.message-item.user .message-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-item.assistant .message-avatar {
    background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
}

.message-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.message-role {
    font-size: 12px;
    color: #8a8a9a;
    font-weight: 500;
}

.message-item.user .message-role {
    text-align: right;
}

.message-content {
    background: white;
    border-radius: 12px;
    padding: 12px 16px;
    line-height: 1.6;
    color: #1a1a2e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.message-item.user .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

/* Markdown样式 */
.message-content :deep(p) {
    margin: 0 0 8px;
}

.message-content :deep(p:last-child) {
    margin: 0;
}

.message-content :deep(code) {
    background: rgba(0, 0, 0, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
}

.message-item.user .message-content :deep(code) {
    background: rgba(255, 255, 255, 0.2);
}

.message-content :deep(pre) {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
    overflow-x: auto;
}

.message-content :deep(pre code) {
    background: none;
    padding: 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
}

.message-content :deep(li) {
    margin: 4px 0;
}

.message-content :deep(strong) {
    font-weight: 600;
}

.message-content :deep(a) {
    color: #667eea;
    text-decoration: underline;
}

.message-item.user .message-content :deep(a) {
    color: white;
}

/* 加载动画 */
.loading-dots {
    display: flex;
    gap: 4px;
    padding: 8px 0;
}

.dot {
    width: 8px;
    height: 8px;
    background: #67c23a;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
    animation-delay: 0s;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1.2);
        opacity: 1;
    }
}

/* 输入区域 */
.input-area {
    display: flex;
    gap: 12px;
    padding: 20px 24px 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.4);
}

.message-input {
    flex: 1;
}

.message-input :deep(textarea) {
    border-radius: 12px;
    resize: none;
}

.send-button {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.send-button:hover {
    background: linear-gradient(135deg, #5a6fd6 0%, #6a4194 100%);
    transform: scale(1.05);
}

.send-button:disabled {
    background: #d0d0d0;
    cursor: not-allowed;
    transform: none;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
    width: 6px;
}

.messages-container::-webkit-scrollbar-track {
    background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
}
</style>
