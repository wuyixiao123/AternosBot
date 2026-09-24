# AternosBot

一个基于 Node.js + Mineflayer 的 Minecraft Bot，支持 Aternos 服务器连接检测、自动重连和 Web 状态面板。

## 重构版

当前版本已经从旧的单文件结构重构为模块化结构：

- `src/config.js`：统一配置与环境变量
- `src/state.js`：统一运行状态
- `src/monitor.js`：Minecraft TCP 可达性检测
- `src/bot.js`：Mineflayer 生命周期、版本切换、自动重连
- `src/web.js`：Express API 和静态面板
- `src/logger.js`：统一日志
- `public/index.html`：独立 Web 面板

## 主要改进

1. 删除重复的 `server.js` / `sever.js` Web 服务。
2. 删除重复的连接测试和重复 Aternos Monitor 实现。
3. 所有服务器地址、端口、用户名、版本集中管理。
4. 自动重连改为单一调度器，避免多个 `setTimeout/setInterval` 同时抢占连接。
5. 增加连接超时保护和版本自动切换。
6. 增加优雅退出，退出时会关闭 Bot 和 HTTP Server。
7. Web 页面与后端代码分离。
8. 移除未使用的 `node-fetch` 和旧测试代码依赖。
9. 保留普通 HTTP 健康检查，但不再通过高频/模拟用户请求制造流量。

> TCP 检测只能说明目标端口可达，并不等于 Minecraft 完整状态查询成功。

## 安装

```bash
npm install
npm start
```

## 配置

优先使用环境变量覆盖 `config.json`：

```bash
MC_HOST=2h698.aternos.me
MC_PORT=46750
MC_USERNAME=MC2h698Welcome
MC_AUTH=offline
MC_VERSION=1.21.10
AUTO_RECONNECT=true
PORT=3000
```

完整变量见 `.env.example`。

## Web API

- `GET /`：控制面板
- `GET /health`：健康检查
- `GET /api/status`：Bot 当前状态
- `GET /ping`：简单连通性检查
- `POST /api/update`：更新状态（建议仅在可信网络使用）

## 注意

Aternos 的服务器休眠、排队和访问限制由 Aternos 平台控制，Bot 的自动重连不能保证服务器永久运行。

## License

MIT
