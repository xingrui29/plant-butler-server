## 运行命令
```bash
npm install
npm run dev
```

## 接口详情(/api/*)
|接口名称|请求方式|描述|参数|返回结果|
|---|---|---|---|---|
| info | GET | 获取系统信息 | 无 | 彩蛋 |
| users | GET | 获取指定分页的用户列表(管理员用) | page, pageSize, offset | items, total |
| users | POST | 新增用户(管理员用) | username, email, password | 无 |
| users/[id] | DELETE | 删除用户(管理员用) | 无 | 无 |
| login | POST | 登录 | username, password | user |
| register | POST | 注册 | username, email, password | user |
| devices | GET | 获取每个设备的最新数据 | user_id(可选) | device列表 |
| devices | POST | 新增设备 | name, user_id, secret(这个参数的默认值就是secret一样的,先填上) | device_id |
| device/list | GET | 获取所有设备列表 | user_id, status, limit, offset | list, total |
| device/telemetry | GET | 获取指定设备的最新一条数据 | id | soil_humidity, temperature, light_intensity, air_humidity |
| history | GET | 获取指定设备的历史X天的数据 | id, days | data, count |
| telemetry/[deviceId] | POST | 添加设备数据 | secret(值就是secret必填), soil_humidity, temperature, light_intensity, air_humidity, autu_watering | 无 |
| command | POST | 添加设备命令 | deviceId, command, duration(这个会放一些详细参数, 目前可以不填) | 无 |
| secret | GET | 通过secret获取设备id | secret | id |