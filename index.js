// index_fixed.js - 修复版 Aternos Minecraft 机器人
const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const https = require('https');

// ==================== 增强版 Web 保活服务器 ====================
class EnhancedWebServer {
  constructor() {
    this.app = express();
    this.PORT_OPTIONS = [process.env.PORT, 3000, 8080, 5000, 5001].filter(Boolean);
    this.CURRENT_PORT = null;

    // 保活统计
    this.keepAliveStats = {
      totalPings: 0,
      stealthPings: 0,
      userActivitySimulations: 0,
      lastActivity: null,
      uptime: 0
    };

    this.botStatus = {
      isOnline: false,
      serverOnline: false,
      lastActivity: null,
      error: null,
      playersNearby: 0,
      health: 20,
      position: null,
      connectionAttempts: 0,
      botName: 'MC2h698Welcome',
      serverVersion: '1.21.7'
    };

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    // 添加 CORS 支持
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    this.app.get('/', (req, res) => {
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
            <title>🤖 MC2h698Welcome - Aternos 机器人</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 1100px;
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
                .badge.warning {
                    background: #ff9800;
                }
                .badge.stealth {
                    background: #9C27B0;
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
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                .stat-item {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 5px;
                    text-align: center;
                }
                .stat-number {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #4CAF50;
                }
                .bot-name {
                    background: #2196F3;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 <span class="bot-name">MC2h698Welcome</span> - Aternos 机器人</h1>
                <p>修复版 - 针对 Minecraft 1.21.7 服务器优化</p>

                <div class="status-card">
                    <span class="badge ${this.botStatus.isOnline ? '' : 'offline'}">机器人状态</span>
                    <strong>${this.botStatus.isOnline ? '🟢 在线' : '🔴 离线'}</strong>
                </div>

                <div class="status-card">
                    <span class="badge ${this.botStatus.serverOnline ? '' : 'offline'}">服务器状态</span>
                    <strong>${this.botStatus.serverOnline ? '🟢 Aternos 服务器在线' : '🔴 Aternos 服务器离线'}</strong>
                </div>

                <div class="status-card">
                    <h3>📊 运行信息</h3>
                    <div class="bot-info">
                        <div class="info-item">
                            <strong>运行时间</strong><br>
                            ${hours}时 ${minutes}分 ${seconds}秒
                        </div>
                        <div class="info-item">
                            <strong>连接尝试</strong><br>
                            ${this.botStatus.connectionAttempts} 次
                        </div>
                        <div class="info-item">
                            <strong>附近玩家</strong><br>
                            ${this.botStatus.playersNearby} 人
                        </div>
                        <div class="info-item">
                            <strong>最后活动</strong><br>
                            ${this.botStatus.lastActivity || '无'}
                        </div>
                    </div>
                </div>

                <div class="status-card">
                    <span class="badge stealth">🕵️ 高级保活统计</span>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${this.keepAliveStats.totalPings}</div>
                            <div>总 Ping 次数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.keepAliveStats.stealthPings}</div>
                            <div>隐身 Ping</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.keepAliveStats.userActivitySimulations}</div>
                            <div>用户活动模拟</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${Math.round(process.uptime())}s</div>
                            <div>运行时间</div>
                        </div>
                    </div>
                </div>

                <div class="status-card">
                    <span class="badge warning">服务器信息</span>
                    <p><strong>Aternos 服务器: 2h698.aternos.me:46750</strong></p>
                    <p><strong>机器人名称: <span class="bot-name">MC2h698Welcome</span></strong></p>
                    <p><strong>服务器版本: 1.21.7 | 模式: 离线</strong></p>
                </div>

                ${this.botStatus.error ? `
                <div class="status-card">
                    <span class="badge offline">错误信息</span>
                    <p>${this.botStatus.error}</p>
                </div>
                ` : ''}

                <div class="status-card">
                    <h3>🔄 多重保活系统</h3>
                    <p><strong>策略 1:</strong> 每2秒隐身自 Ping (不显示日志)</p>
                    <p><strong>策略 2:</strong> 每30秒用户活动模拟</p>
                    <p><strong>策略 3:</strong> 每60秒常规保活</p>
                    <p>Web服务器运行在端口: ${this.CURRENT_PORT}</p>
                </div>

                <div class="footer" style="margin-top: 30px; text-align: center; opacity: 0.7;">
                    最后更新: ${new Date().toLocaleString('zh-CN')} | 保活策略: 增强版
                </div>
            </div>

            <script>
                // 自动刷新页面每30秒
                setTimeout(() => {
                    window.location.reload();
                }, 30000);
            </script>
        </body>
        </html>
      `);
    });

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: 'Fixed Aternos Minecraft Bot',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        botStatus: this.botStatus,
        keepAliveStats: this.keepAliveStats
      });
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        botStatus: this.botStatus,
        keepAliveStats: this.keepAliveStats
      });
    });

    // 轻量级 ping 端点 - 用于隐身保活
    this.app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });

    // 模拟用户活动端点
    this.app.get('/simulate-activity', (req, res) => {
      this.keepAliveStats.userActivitySimulations++;
      this.keepAliveStats.lastActivity = new Date().toISOString();
      res.json({ 
        simulated: true, 
        timestamp: new Date().toISOString(),
        count: this.keepAliveStats.userActivitySimulations
      });
    });

    this.app.post('/api/update', express.json(), (req, res) => {
      if (req.body) {
        this.botStatus = { ...this.botStatus, ...req.body };
      }
      res.json({ success: true, status: this.botStatus });
    });
  }

  updateBotStatus(newStatus) {
    this.botStatus = { ...this.botStatus, ...newStatus };
  }

  // 增强版保活策略
  setupEnhancedKeepAlive() {
    console.log('🚀 启动增强版保活策略...');

    // 策略 1: 每2秒隐身自 Ping (不显示日志)
    const stealthPing = () => {
      if (!this.CURRENT_PORT) return;

      const baseUrl = `http://localhost:${this.CURRENT_PORT}`;

      http.get(`${baseUrl}/ping`, (res) => {
        this.keepAliveStats.stealthPings++;
        this.keepAliveStats.totalPings++;
        // 不显示日志，完全隐身
      }).on('error', (err) => {
        // 即使错误也不显示，保持隐身
      });
    };

    // 策略 2: 每30秒用户活动模拟
    const simulateUserActivity = () => {
      if (!this.CURRENT_PORT) return;

      const baseUrl = `http://localhost:${this.CURRENT_PORT}`;

      console.log(`[${new Date().toLocaleTimeString()}] 👤 模拟用户活动...`);

      // 访问多个端点模拟真实用户行为
      const endpoints = ['/', '/health', '/api/status', '/simulate-activity'];

      endpoints.forEach(endpoint => {
        http.get(`${baseUrl}${endpoint}`, (res) => {
          this.keepAliveStats.totalPings++;
          if (endpoint === '/simulate-activity') {
            this.keepAliveStats.userActivitySimulations++;
          }
        }).on('error', (err) => {
          console.log(`⚠️ 活动模拟失败: ${err.message}`);
        });
      });
    };

    // 策略 3: 每60秒常规保活
    const regularKeepAlive = () => {
      if (!this.CURRENT_PORT) return;

      const baseUrl = `http://localhost:${this.CURRENT_PORT}`;

      console.log(`[${new Date().toLocaleTimeString()}] 🔄 执行常规保活...`);

      const endpoints = ['/', '/health', '/api/status'];

      endpoints.forEach(endpoint => {
        http.get(`${baseUrl}${endpoint}`, (res) => {
          this.keepAliveStats.totalPings++;
        }).on('error', (err) => {
          console.log(`⚠️ 常规保活失败: ${err.message}`);
        });
      });
    };

    // 启动所有保活策略
    setInterval(stealthPing, 2000); // 每2秒隐身Ping
    setInterval(simulateUserActivity, 30000); // 每30秒用户活动模拟
    setInterval(regularKeepAlive, 60000); // 每60秒常规保活

    // 立即启动一次
    setTimeout(stealthPing, 1000);
    setTimeout(simulateUserActivity, 5000);
    setTimeout(regularKeepAlive, 10000);

    console.log('✅ 增强版保活策略已启用');
    console.log('   🕵️  每2秒隐身自 Ping');
    console.log('   👤  每30秒用户活动模拟');
    console.log('   🔄  每60秒常规保活');
  }

  // 启动Web服务器
  async startServer(portIndex = 0) {
    return new Promise((resolve, reject) => {
      if (portIndex >= this.PORT_OPTIONS.length) {
        reject(new Error('所有端口都已被占用'));
        return;
      }

      const port = this.PORT_OPTIONS[portIndex];
      const server = this.app.listen(port, '0.0.0.0', () => {
        this.CURRENT_PORT = port;
        console.log(`🚀 修复版Web服务器已启动 - 端口: ${port}`);
        console.log(`📍 本地访问: http://localhost:${port}`);
        console.log(`🌐 外部访问: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
        resolve(server);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️ 端口 ${port} 被占用，尝试下一个...`);
          server.close();
          this.startServer(portIndex + 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }
}

// ==================== Aternos 服务器监控器 ====================
class AternosMonitor {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  async checkServerStatus(timeout = 8000) {
    const net = require('net');

    return new Promise((resolve) => {
      const socket = new net.Socket();
      let connected = false;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        connected = true;
        socket.destroy();
        resolve({ 
          success: true, 
          message: 'Aternos服务器在线' 
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ 
          success: false, 
          message: '连接超时' 
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({ 
          success: false, 
          message: `连接失败: ${err.message}` 
        });
      });

      socket.connect(this.port, this.host);
    });
  }
}

// ==================== 修复版 Minecraft 机器人 ====================
class FixedMinecraftBot {
  constructor(webServer) {
    this.webServer = webServer;
    this.monitor = new AternosMonitor('2h698.aternos.me', 46750);
    this.bot = null;
    this.isRunning = false;
    this.connectionAttempts = 0;
    this.maxAttempts = 10; // 增加最大尝试次数

    // 针对 1.21.7 服务器的版本列表
    this.versions = ['1.21.1', '1.21', '1.20.4', '1.20.1', '1.19.4'];
    this.currentVersionIndex = 0;

    // 连接状态跟踪
    this.connectionState = {
      isConnecting: false,
      lastConnectTime: null,
      lastDisconnectReason: null
    };
  }

  updateStatus(status) {
    this.webServer.updateBotStatus(status);
  }

  async checkServer() {
    try {
      console.log('🔍 检查服务器状态...');
      const result = await this.monitor.checkServerStatus();

      this.updateStatus({
        serverOnline: result.success,
        lastActivity: new Date().toLocaleString('zh-CN'),
        error: result.success ? null : result.message
      });

      return result.success;
    } catch (error) {
      console.log('❌ 检查服务器失败:', error.message);
      this.updateStatus({
        serverOnline: false,
        error: `检查失败: ${error.message}`
      });
      return false;
    }
  }

  // 创建机器人连接 - 修复版
  async connectToServer() {
    if (this.connectionState.isConnecting) {
      console.log('⚠️ 已有连接在进行中，跳过');
      return;
    }

    if (this.connectionAttempts >= this.maxAttempts) {
      console.log('❌ 达到最大连接尝试次数，等待重置...');
      this.updateStatus({
        error: '达到最大连接尝试次数，请检查服务器状态'
      });

      // 30分钟后重置尝试次数
      setTimeout(() => {
        this.connectionAttempts = 0;
        console.log('🔄 重置连接尝试次数，重新尝试连接...');
        this.connectToServer();
      }, 30 * 60 * 1000);

      return;
    }

    this.connectionState.isConnecting = true;
    this.connectionAttempts++;

    console.log(`🔄 连接尝试 ${this.connectionAttempts}/${this.maxAttempts}`);
    console.log(`🎮 使用版本: ${this.versions[this.currentVersionIndex]}`);

    this.updateStatus({
      connectionAttempts: this.connectionAttempts,
      error: null
    });

    // 先检查服务器状态
    const serverOnline = await this.checkServer();
    if (!serverOnline) {
      console.log('⏰ 服务器离线，30秒后重试...');
      this.connectionState.isConnecting = false;
      setTimeout(() => this.connectToServer(), 30000);
      return;
    }

    console.log('🚀 创建机器人连接...');

    try {
      // 修复连接配置
      this.bot = mineflayer.createBot({
        host: '2h698.aternos.me',
        port: 46750,
        username: 'MC2h698Welcome', // 固定机器人名称
        version: this.versions[this.currentVersionIndex],
        auth: 'offline',
        // 增强连接稳定性
        checkTimeoutInterval: 30000,
        connectTimeout: 30000,
        keepAlive: true,
        // 修复 socketClosed 问题
        closeTimeout: 30000,
        // 减少日志噪音
        hideErrors: false,
        logErrors: true
      });

      this.setupBotEvents();

      // 连接超时保护
      setTimeout(() => {
        if (this.bot && this.connectionState.isConnecting && !this.bot.player) {
          console.log('⏰ 连接超时，尝试下一版本...');
          this.connectionState.lastDisconnectReason = '连接超时';
          this.bot.end();
          this.tryNextVersion();
        }
      }, 25000);

    } catch (error) {
      console.log('❌ 创建机器人失败:', error.message);
      this.updateStatus({ error: error.message });
      this.connectionState.isConnecting = false;
      setTimeout(() => this.connectToServer(), 10000);
    }
  }

  // 尝试下一个版本
  tryNextVersion() {
    this.connectionState.isConnecting = false;
    this.currentVersionIndex = (this.currentVersionIndex + 1) % this.versions.length;
    console.log(`🔄 尝试版本: ${this.versions[this.currentVersionIndex]}`);
    setTimeout(() => this.connectToServer(), 5000);
  }

  // 设置机器人事件 - 修复版
  setupBotEvents() {
    const bot = this.bot;

    bot.on('login', () => {
      console.log('✅ 登录协议完成');
      this.connectionState.lastConnectTime = new Date();
    });

    bot.on('spawn', () => {
      console.log('🎉 成功进入服务器!');
      this.connectionState.isConnecting = false;
      this.updateStatus({
        isOnline: true,
        error: null,
        connectionAttempts: 0
      });

      // 防踢机制 - 更频繁的活动
      const antiAfkInterval = setInterval(() => {
        if (bot.entity) {
          // 轻微移动和视角变化
          bot.look(bot.entity.yaw + 0.2, bot.entity.pitch, false);
          // 偶尔跳跃
          if (Math.random() > 0.8) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 100);
          }
        }
      }, 30000); // 每30秒活动一次

      // 定期更新状态
      const statusInterval = setInterval(() => {
        if (bot.entity && bot.entity.position) {
          const pos = bot.entity.position;
          const players = Object.keys(bot.players || {}).filter(name => name !== bot.username).length;

          this.updateStatus({
            position: `X:${Math.round(pos.x)}, Y:${Math.round(pos.y)}, Z:${Math.round(pos.z)}`,
            playersNearby: players,
            health: bot.health || 20,
            lastActivity: new Date().toLocaleString('zh-CN')
          });
        }
      }, 20000); // 每20秒更新一次

      // 清理间隔
      bot.on('end', () => {
        clearInterval(antiAfkInterval);
        clearInterval(statusInterval);
      });
    });

    bot.on('message', (message) => {
      const msg = message.toString();
      if (msg.length < 100 && !msg.includes('joined the game') && !msg.includes('left the game')) {
        console.log('💬 服务器消息:', msg);
        this.updateStatus({
          lastActivity: `收到消息: ${msg.substring(0, 30)}...`
        });
      }
    });

    bot.on('error', (err) => {
      console.log('❌ 机器人错误:', err.message);
      this.updateStatus({
        isOnline: false,
        error: err.message
      });
      this.connectionState.isConnecting = false;

      // 协议版本错误，尝试下一个版本
      if (err.message.includes('version') || err.message.includes('protocol')) {
        this.tryNextVersion();
      } else {
        setTimeout(() => this.connectToServer(), 10000);
      }
    });

    bot.on('end', (reason) => {
      console.log(`🔌 连接断开: ${reason}`);
      this.connectionState.lastDisconnectReason = reason;
      this.updateStatus({
        isOnline: false,
        error: `连接断开: ${reason}`
      });
      this.connectionState.isConnecting = false;
      this.bot = null;

      // 根据断开原因调整重连延迟
      let delay = 5000;
      if (reason.includes('socketClosed') || reason.includes('timeout')) {
        delay = 10000; // 对于socket问题，等待更久
      }

      console.log(`🔄 ${delay/1000}秒后重新连接...`);
      setTimeout(() => this.connectToServer(), delay);
    });

    bot.on('kicked', (reason) => {
      console.log('🚫 被服务器踢出:', reason);
      this.updateStatus({
        error: `被踢出: ${reason}`
      });
    });
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🤖 启动修复版 Minecraft 机器人...');
    console.log(`🤖 机器人名称: MC2h698Welcome`);
    console.log(`🎮 目标服务器: 1.21.7`);

    this.connectToServer();
  }

  stop() {
    this.isRunning = false;
    if (this.bot) {
      this.bot.end();
    }
    console.log('🛑 机器人已停止');
  }
}

// ==================== 主程序 ====================
async function main() {
  console.log(`
🎮 修复版 Aternos Minecraft 机器人
===================================

修复内容:
✅ 固定机器人名称: MC2h698Welcome
✅ 针对 Minecraft 1.21.7 服务器优化
✅ 修复 socketClosed 连接断开问题
✅ 增强连接稳定性和自动重连

高级保活策略:
🕵️  每2秒隐身自 Ping (无日志)
👤  每30秒用户活动模拟  
🔁  每60秒常规保活

服务器配置:
📍 地址: 2h698.aternos.me:46750
🎮 版本: 1.21.7 (自动回退)
🤖 名称: MC2h698Welcome
🔧 模式: 离线

🚀 启动中...
  `);

  try {
    // 创建并启动增强版Web服务器
    const webServer = new EnhancedWebServer();
    await webServer.startServer();

    // 启动增强版保活策略
    webServer.setupEnhancedKeepAlive();

    // 创建并启动修复版机器人
    const minecraftBot = new FixedMinecraftBot(webServer);
    await minecraftBot.start();

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n🛑 收到关闭信号...');
      minecraftBot.stop();
      setTimeout(() => {
        console.log('👋 再见!');
        console.log('📊 最终统计:');
        console.log(`   总 Ping 次数: ${webServer.keepAliveStats.totalPings}`);
        console.log(`   隐身 Ping: ${webServer.keepAliveStats.stealthPings}`);
        console.log(`   用户活动模拟: ${webServer.keepAliveStats.userActivitySimulations}`);
        process.exit(0);
      }, 1000);
    });

  } catch (error) {
    console.error('💥 启动失败:', error);
    process.exit(1);
  }
}

// 启动程序
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedWebServer, AternosMonitor, FixedMinecraftBot };