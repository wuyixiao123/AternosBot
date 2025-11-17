// aternosMonitor_complete.js
const net = require('net');

class AternosMonitor {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
    this.lastStatus = 'unknown';
  }

  extractHostAndPort(address) {
    const parts = address.split(':');
    return {
      host: parts[0],
      port: parts.length > 1 ? parseInt(parts[1]) : 25565
    };
  }

  // 检查服务器状态
  async checkServerStatus(timeout = 10000) {
    const { host, port } = this.extractHostAndPort(this.serverAddress);

    return new Promise((resolve) => {
      console.log(`🔍 检查服务器 ${host}:${port}...`);

      const socket = new net.Socket();
      let connected = false;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        connected = true;
        console.log('✅ 服务器端口可达');
        socket.destroy();
        resolve({ 
          success: true, 
          status: 'online', 
          host, 
          port,
          message: '服务器在线且端口可达'
        });
      });

      socket.on('timeout', () => {
        console.log('⏰ 连接超时');
        socket.destroy();
        resolve({ 
          success: false, 
          status: 'offline', 
          host, 
          port,
          message: '连接超时 - 服务器可能未启动'
        });
      });

      socket.on('error', (err) => {
        console.log('❌ 连接错误:', err.message);
        socket.destroy();
        resolve({ 
          success: false, 
          status: 'offline', 
          host, 
          port,
          message: `连接失败: ${err.message}`
        });
      });

      try {
        socket.connect(port, host);
      } catch (error) {
        resolve({ 
          success: false, 
          status: 'error', 
          host, 
          port,
          message: `连接异常: ${error.message}`
        });
      }
    });
  }

  // 为了兼容性，保留 getServerInfo 方法名
  async getServerInfo() {
    return this.checkServerStatus();
  }

  // 也保留 getServerInfoSimple 方法
  async getServerInfoSimple() {
    return this.checkServerStatus();
  }
}

// 测试函数
async function testServer() {
  const monitor = new AternosMonitor('2h698.aternos.me:46750');

  console.log('🚀 开始服务器连接测试...\n');

  const result = await monitor.checkServerStatus();

  console.log('\n📊 测试结果:');
  console.log(`📍 服务器: ${result.host}:${result.port}`);
  console.log(`🟢 状态: ${result.success ? '在线 ✅' : '离线 ❌'}`);
  console.log(`📝 信息: ${result.message}`);

  return result;
}

if (require.main === module) {
  testServer().catch(console.error);
}

module.exports = AternosMonitor;