![https://img.shields.io/badge/License-MIT-yellow.svg](https://img.shields.io/badge/License-MIT-yellow.svg)
![https://img.shields.io/badge/node-%253E%253D14.0.0-brightgreen](https://img.shields.io/badge/node-%253E%253D14.0.0-brightgreen)
![https://img.shields.io/badge/mineflayer-4.3.0-blue](https://img.shields.io/badge/mineflayer-4.3.0-blue)
![https://img.shields.io/badge/PRs-welcome-brightgreen.svg](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)


My discord: https://discord.gg/Hv5VyTx3kH

可自由使用并编辑本项目   请勿将本项目用作任何商业用途

部分内容可再调试过程中被删除或更换实现方式(自己摸索吧),可自定义

请勿直接更改!请先提交issues或者先fork再请求
🚀 让您的 Aternos 服务器永不掉线！
一个专为 Aternos 免费服务器设计的智能 Minecraft 机器人，内置多重保活机制、Web 控制面板和自动重连，真正做到 24/7 全天候运行。


✨ 功能亮点

✅ 24/7 不间断运行 – 通过多层保活策略（隐身自Ping、用户模拟、外部API访问）防止 Replit / 服务器休眠
✅ Aternos 专用优化 – 完美适配 Aternos 免费服务器，自动检测在线状态，智能重连
✅ 固定机器人名称 – 您的机器人永远叫 MC2h698Welcome，在服务器内一目了然
✅ 自动版本回退 – 支持 1.16.5 ~ 1.21.7 版本，连接失败自动切换下一个兼容版本
✅ Web 实时监控面板 – 可视化查看机器人状态、玩家数量、生命值、位置和保活统计
✅ 多重保活策略

🕵️ 隐身自Ping – 每2秒访问 /ping，不留下日志痕迹
👤 用户活动模拟 – 每30秒模拟真实用户浏览行为
🔁 常规保活 – 每60秒访问主要端点
🌐 外部服务访问 – 每2分钟调用 GitHub API 等外部服务
✅ 自动重连 & 断线保护 – 网络波动或服务器重启后自动重连，永不掉队
✅ 防踢机制 – 定期轻微移动和跳跃，避免因 AFK 被踢出
✅ 轻量 & 易部署 – 单文件设计，一键启动，支持 Replit、VPS 或任何 Node.js 环境

🚀 快速开始

环境要求

Node.js 14.0+
npm 或 yarn
安装步骤

克隆仓库

bash

git clone https://github.com/wuyixiao123/aternos-bot.git

cd aternos-bot

安装依赖

bash

npm install

配置服务器信息

编辑 config.json 文件，修改开头的 host 和 port 为您自己的 Aternos 服务器地址。

启动机器人

bash

node index.js

打开浏览器访问 http://localhost:5000 查看 Web 控制面板。

⚙️ 配置说明

所有重要配置集中在文件开头的对象中，您可以根据需要修改：

参数	说明	默认值
host	Aternos 服务器地址	'2h698.aternos.me'
port	Aternos 服务器端口	46750
username	机器人名称	'MC2h698Welcome'
versions	尝试的 Minecraft 版本列表	['1.21.1','1.21','1.20.4','1.20.1','1.19.4']
auth	认证模式（离线服务器用 offline）	'offline'
webPort	Web 控制面板端口（自动选择）	5000、3000、8080 等
🧠 高级保活策略详解

该项目实现了 5 层保活机制，确保在 Replit 或 VPS 上长期运行：

策略	间隔	描述
隐身自Ping	2秒	访问 /ping 端点，控制台不输出任何日志，完全静默
用户活动模拟	30秒	模拟真实用户访问多个页面，产生浏览器式行为
常规保活	60秒	触发完整的健康检查和状态更新
外部API访问	2分钟	随机调用 GitHub、JSONPlaceholder 等外部服务，增加网络多样性
内存活动模拟	15秒	创建和释放小量内存，让系统认为进程一直活跃
通过这些组合，即使您的电脑关机、浏览器标签页关闭，机器人依然能在后台持续运行。

❓ 常见问题

Q: 为什么机器人一直连接不上？

A: 请确保您的 Aternos 服务器已手动启动（控制台点 Start），并等待状态变为 Online。同时检查 host 和 port 是否与 Aternos 面板上显示的完全一致。

Q: 机器人被服务器踢出怎么办？

A: 项目内置了防踢机制（自动移动和跳跃），但仍可能因某些插件规则被踢。如果频繁发生，可以尝试增加移动间隔或调整行为。

Q: 如何在 Replit 上使用？

A: 直接将此仓库导入 Replit，运行 npm install 后点击 Run 即可。Replit 自带的 Web 服务器会自动运行在分配的端口上。

Q: 免费 VPS 如何长期运行？

A: 推荐使用 PM2 进行进程管理：

bash
npm install -g pm2
pm2 start index_fixed.js --name aternos-bot
pm2 save
pm2 startup
🤝 贡献

欢迎任何形式的贡献！无论是 Bug 报告、新功能建议还是代码改进，请先开一个 Issue 讨论，然后提交 Pull Request。

📄 许可证

MIT © 2026 [wuyixiao123]

⭐ 支持项目

如果您觉得这个项目有用，请给一个 Star ⭐，让更多人看到！您的支持是我持续更新的动力。

某些功能可能不可用

