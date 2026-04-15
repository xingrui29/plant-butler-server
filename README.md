# Plant Butler Server

一个现代化的植物养护管理平台，提供设备监控、历史数据分析、用户管理和AI对话智能辅助等功能。

## 功能特性

- 📱 **设备管理** - 实时监控多个IoT设备状态，包括土壤湿度、温度、光照强度、空气湿度等
- 📊 **数据可视化** - 历史数据图表展示，支持多维度数据筛选
- 💧 **智能浇水** - 支持手动和自动浇水功能，记录浇水历史
- 👥 **用户管理** - 完整的用户注册、登录和管理功能
- 🤖 **AI对话助手** - 集成本地Ollama模型，提供智能问答服务
- 🎨 **现代化UI** - 基于Vue 3和Element Plus的响应式设计，支持毛玻璃效果

## 技术栈

### 前端
- **Nuxt 4** - Vue.js全栈框架
- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3 UI组件库
- **Tailwind CSS** - 实用优先的CSS框架
- **ECharts** - 数据可视化图表库
- **Markdown-it** - Markdown渲染引擎

### 后端
- **Nuxt Server** - 服务端API支持
- **Better SQLite3** - 轻量级数据库
- **Ollama** - 本地AI模型运行服务

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Ollama (用于AI功能)

### 安装依赖

```bash
npm install
```

### 配置 Ollama (AI功能)

1. 安装 Ollama: https://ollama.ai/download
2. 拉取模型:
```bash
ollama pull qwen2.5:0.5b
```
3. 启动 Ollama 服务:
```bash
ollama serve
```

### 初始化数据库

数据库会在首次运行时自动初始化，包含以下表：
- `users` - 用户信息
- `devices` - 设备信息
- `telemetry` - 设备遥测数据
- `commands` - 设备命令记录

### 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

默认管理员账号需要自行注册创建。

## API 文档

### 用户认证

#### 注册用户
```
POST /api/register
```
**参数:**
- `username` - 用户名
- `email` - 邮箱
- `password` - 密码

**返回:** `user` 对象

#### 用户登录
```
POST /api/login
```
**参数:**
- `username` - 用户名
- `password` - 密码

**返回:** `user` 对象

### 用户管理

#### 获取用户列表
```
GET /api/users?page=1&pageSize=10&offset=0
```
**返回:** `{ items, total }`

#### 创建用户
```
POST /api/users
```
**参数:**
- `username` - 用户名
- `email` - 邮箱
- `password` - 密码

#### 删除用户
```
DELETE /api/users/:id
```

### 设备管理

#### 获取设备列表
```
GET /api/devices?user_id=xxx
```
**返回:** 设备 `list` 数组

#### 创建设备
```
POST /api/devices
```
**参数:**
- `name` - 设备名称
- `user_id` - 所属用户ID
- `secret` - 设备密钥

**返回:** `device_id`

#### 获取设备详细信息
```
GET /api/device/list?user_id=xxx&status=online&limit=10&offset=0
```
**返回:** `{ list, total }`

#### 通过密钥获取设备ID
```
GET /api/device/secret?secret=xxx
```
**返回:** `{ id }`

### 数据管理

#### 获取设备最新遥测数据
```
GET /api/device/telemetry?id=xxx
```
**返回:**
- `soil_humidity` - 土壤湿度
- `temperature` - 温度
- `light_intensity` - 光照强度
- `air_humidity` - 空气湿度

#### 上传设备遥测数据
```
POST /api/telemetry/:deviceId
```
**参数:**
- `secret` - 设备密钥 (必填)
- `soil_humidity` - 土壤湿度
- `temperature` - 温度
- `light_intensity` - 光照强度
- `air_humidity` - 空气湿度
- `auto_watering` - 自动浇水标记 (0或1)

**返回:** `{ success: true }`

#### 获取历史数据
```
GET /api/history?id=xxx&days=7
```
**参数:**
- `id` - 设备ID
- `days` - 查询天数

**返回:** `{ data, count }`

#### 获取浇水记录
```
GET /api/watering-records/:deviceId
```
**返回:** 合并的手动和自动浇水记录

### 命令管理

#### 发送设备命令
```
POST /api/command
```
**参数:**
- `deviceId` - 设备ID
- `command` - 命令类型 (如 'water' 等)
- `duration` - 详细参数 (可选)

**返回:** `{ success: true }`

#### 获取待处理命令
```
GET /api/command
```
**返回:** 待执行的命令列表

#### 获取所有命令
```
GET /api/command/all
```

#### 命令回调
```
POST /api/command/callback
```
**参数:**
- `commandId` - 命令ID
- `status` - 执行状态

### AI 对话

#### 发送消息给AI
```
POST /api/ai-chat
```
**参数:**
- `message` - 用户消息

**返回:** `{ success: true, content: "AI回复内容" }`

**依赖:** 本地Ollama服务需运行 `qwen2.5:0.5b` 模型

### 系统

#### 获取系统信息
```
GET /api/info
```
**返回:** 系统彩蛋信息

## 项目结构

```
plant-butler-server/
├── app/                    # 前端应用
│   ├── components/         # Vue组件
│   │   ├── DeviceCard.vue
│   │   └── ProgressRow.vue
│   ├── layouts/           # 布局组件
│   │   ├── default.vue
│   │   └── empty.vue
│   ├── pages/             # 页面
│   │   ├── index.vue      # 设备概览
│   │   ├── history.vue    # 历史数据
│   │   ├── ai.vue         # AI对话
│   │   ├── users.vue      # 用户管理
│   │   ├── commands.vue   # 指令管理
│   │   └── login.vue      # 登录页
│   ├── plugins/           # 插件
│   └── app.vue            # 根组件
├── server/                # 服务端
│   ├── api/              # API路由
│   │   ├── ai-chat.post.ts
│   │   ├── device/
│   │   ├── command/
│   │   ├── telemetry/
│   │   ├── watering-records/
│   │   └── ...
│   ├── database/         # 数据库
│   │   ├── db.ts        # 数据库连接
│   │   └── init.ts      # 初始化脚本
│   ├── middleware/       # 中间件
│   │   ├── cors.ts
│   │   └── logger.server.ts
│   └── plugins/         # 服务端插件
├── nuxt.config.ts       # Nuxt配置
└── package.json         # 项目依赖
```

## 数据库模型

### users
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名 |
| email | TEXT | 邮箱 |
| password | TEXT | 密码哈希 |
| created_at | INTEGER | 创建时间戳 |

### devices
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 设备名称 |
| user_id | INTEGER | 所属用户ID |
| secret | TEXT | 设备密钥 |
| status | TEXT | 在线状态 |
| last_seen | INTEGER | 最后上线时间 |

### telemetry
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| device_id | INTEGER | 设备ID |
| timestamp | INTEGER | 时间戳 |
| soil_humidity | REAL | 土壤湿度 |
| temperature | REAL | 温度 |
| light_intensity | REAL | 光照强度 |
| air_humidity | REAL | 空气湿度 |
| auto_watering | INTEGER | 自动浇水时间戳 |

### commands
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| device_id | INTEGER | 设备ID |
| command | TEXT | 命令类型 |
| status | TEXT | 执行状态 |
| created_at | INTEGER | 创建时间戳 |

## 开发说明

### 设备接入流程

1. **创建设备**: 通过 API 创建设备，获得 `device_id` 和 `secret`
2. **上报数据**: 定时调用 `/api/telemetry/:deviceId` 上传传感器数据
3. **获取命令**: 设备定期轮询 `/api/command` 获取待执行的命令
4. **命令回调**: 执行命令后调用 `/api/command/callback` 更新命令状态

### 安全说明

- 所有API请求应包含有效的设备密钥或用户认证
- 密码使用哈希存储
- CORS中间件允许跨域请求（开发环境）

### 环境变量

默认配置在 `nuxt.config.ts`:
- 开发服务器: `0.0.0.0:3000`
