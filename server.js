const express = require('express');
const http = require('http');
const app = express();

// 端口配置 - 优先使用环境变量PORT，否则尝试多个端口
const PORT_OPTIONS = [process.env.PORT, 3000, 8080, 5001, 3001].filter(Boolean);
let CURRENT_PORT = null;

// 存储机器人状态
let botStatus = {
  isOnline: false,
  lastActivity: null,
  playersNearby: 0,
  health: 0,
  position: null
};

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 主页 - 显示机器人状态
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 Minecraft 机器人控制面板</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                min-height: 100vh;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 {
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .status-card {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 20px;
                margin: 15px 0;
            }
            .badge {
                display: inline-block;
                padding: 5px 12px;
                background: #4CAF50;
                border-radius: 20px;
                font-size: 0.8em;
                margin-right: 10px;
            }
            .badge.offline {
                background: #f44336;
            }
            .bot-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            .info-item {
                background: rgba(0, 0, 0, 0.2);
                padding: 10px;
                border-radius: 8px;
            }
            .port-info {
                background: #ff9800;
                color: black;
                padding: 5px 10px;
                border-radius: 5px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Minecraft 机器人控制面板</h1>
            <p>服务器运行状态监控 + 自动保活系统</p>

            <div class="status-card">
                <span class="badge ${botStatus.isOnline ? '' : 'offline'}">机器人状态</span>
                <strong>${botStatus.isOnline ? '🟢 在线' : '🔴 离线'}</strong>
                ${botStatus.lastActivity ? `<br><small>最后活动: ${new Date(botStatus.lastActivity).toLocaleString('zh-CN')}</small>` : ''}
            </div>

            <div class="status-card">
                <span class="badge">服务器信息</span>
                <strong>Web服务器运行在端口: <span class="port-info">${CURRENT_PORT}</span></strong>
                <p>如果此端口不是5000，请更新保活配置</p>
            </div>

            <div class="status-card">
                <h3>🤖 机器人信息</h3>
                <div class="bot-info">
                    <div class="info-item">
                        <strong>运行时间</strong><br>
                        ${hours}时 ${minutes}分 ${seconds}秒
                    </div>
                    <div class="info-item">
                        <strong>附近玩家</strong><br>
                        ${botStatus.playersNearby} 人
                    </div>
                    <div class="info-item">
                        <strong>生命值</strong><br>
                        ${botStatus.health}/20 ❤️
                    </div>
                    <div class="info-item">
                        <strong>位置</strong><br>
                        ${botStatus.position || '未知'}
                    </div>
                </div>
            </div>

            <div class="status-card">
                <span class="badge">保活系统</span>
                <strong>🔄 自动保活运行中</strong>
                <p>每4分钟自动激活服务器，防止Replit休眠</p>
                <p>当前保活端口: ${CURRENT_PORT}</p>
            </div>

            <div class="status-card">
                <h3>📡 可用端点</h3>
                <ul>
                    <li><a href="/" style="color: #a8d8ff;">/</a> - 控制面板</li>
                    <li><a href="/health" style="color: #a8d8ff;">/health</a> - 健康状态</li>
                    <li><a href="/api/bot-status" style="color: #a8d8ff;">/api/bot-status</a> - 机器人状态API</li>
                    <li><a href="/api/update-bot" style="color: #a8d8ff;">/api/update-bot</a> - 更新机器人状态</li>
                </ul>
            </div>

            <div class="footer" style="margin-top: 30px; text-align: center; opacity: 0.7;">
                服务器时间: ${new Date().toLocaleString('zh-CN')}
            </div>
        </div>
    </body>
    </html>
  `);
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'Minecraft Bot Web Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    port: CURRENT_PORT
  });
});

// 机器人状态API
app.get('/api/bot-status', (req, res) => {
  res.json({
    ...botStatus,
    serverUptime: process.uptime(),
    serverPort: CURRENT_PORT,
    timestamp: Date.now()
  });
});

// 更新机器人状态（从主程序调用）
app.post('/api/update-bot', express.json(), (req, res) => {
  if (req.body) {
    botStatus = { ...botStatus, ...req.body, lastActivity: Date.now() };
  }
  res.json({ success: true, status: botStatus });
});

// 获取当前机器人状态
app.get('/api/get-bot', (req, res) => {
  res.json(botStatus);
});

// ==================== 自动保活功能 ====================

function selfKeepAlive() {
  if (!CURRENT_PORT) {
    console.log('❌ 无法执行保活：服务器端口未确定');
    return;
  }

  const baseUrl = `http://localhost:${CURRENT_PORT}`;

  console.log(`[${new Date().toLocaleTimeString()}] 🔄 执行自动保活... (端口: ${CURRENT_PORT})`);

  const endpoints = ['/', '/health', '/api/bot-status'];

  endpoints.forEach(endpoint => {
    http.get(`${baseUrl}${endpoint}`, (res) => {
      console.log(`✅ 保活成功: ${endpoint}`);
    }).on('error', (err) => {
      console.log(`⚠️ 保活请求失败: ${endpoint} - ${err.message}`);
    });
  });
}

function setupKeepAlive() {
  const KEEP_ALIVE_INTERVAL = 4 * 60 * 1000; // 4分钟

  // 等待服务器启动后执行第一次保活
  if (CURRENT_PORT) {
    setTimeout(selfKeepAlive, 10000);
    setInterval(selfKeepAlive, KEEP_ALIVE_INTERVAL);
    console.log(`✅ 自动保活已启用 - 端口: ${CURRENT_PORT}, 每${KEEP_ALIVE_INTERVAL/60000}分钟执行一次`);
  } else {
    console.log('❌ 无法启用自动保活：服务器端口未确定');
  }
}

// ==================== 服务器启动（带端口自动选择） ====================

/**
 * 尝试启动服务器，如果端口被占用则自动尝试下一个端口
 */
function startServer(portIndex = 0) {
  return new Promise((resolve, reject) => {
    if (portIndex >= PORT_OPTIONS.length) {
      reject(new Error('所有端口都已被占用，无法启动服务器'));
      return;
    }

    const port = PORT_OPTIONS[portIndex];
    const server = app.listen(port, '0.0.0.0', () => {
      CURRENT_PORT = port;
      console.log(`🚀 Minecraft机器人Web服务器已启动`);
      console.log(`📍 端口: ${CURRENT_PORT}`);
      console.log(`🌐 本地访问: http://localhost:${CURRENT_PORT}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ 端口 ${port} 被占用，尝试下一个端口...`);
        server.close();
        // 递归尝试下一个端口
        startServer(portIndex + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * 主启动函数
 */
async function initialize() {
  try {
    console.log('🔄 正在启动Web服务器，尝试端口:', PORT_OPTIONS);
    await startServer();
    setupKeepAlive();

    process.on('SIGINT', () => {
      console.log('\n🛑 收到关闭信号，正在关闭服务器...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 收到终止信号，正在关闭服务器...');
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 服务器启动失败:', error.message);
    // 即使Web服务器启动失败，也不影响主程序运行
    console.log('⚠️ Web服务器启动失败，但Minecraft机器人主程序将继续运行');
  }
}

// 导出功能供其他文件使用
module.exports = {
  app,
  startServer,
  setupKeepAlive,
  selfKeepAlive,
  updateBotStatus: (status) => {
    botStatus = { ...botStatus, ...status, lastActivity: Date.now() };
  },
  getBotStatus: () => botStatus,
  getCurrentPort: () => CURRENT_PORT
};