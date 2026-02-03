## 运行命令
```bash
npm install
npm run dev
```

## 接口详情
- /api/login：post方法，参数：username、password
- /api/register：post方法，参数：username、password、email
- /api/devices：get方法，无参数
- /api/devices：post方法，参数：user_id、name、secret（默认为secret字符串，直接传入即可）
- /api/history：get方法，参数：id、days（表示获取过去几天的数据）
- /api/command：post方法，参数deviceId、command、duration。此方法还在开发中。。。
- /api/telemetry/[deviceId]：post方法，参数：secret、soil_humidity、temperature、light_intensity、air_humidity、auto_watering
