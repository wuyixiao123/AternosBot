// connectionTester.js - 连接测试工具
const mineflayer = require('mineflayer');
const net = require('net');

// 测试端口连通性
function testPortConnection(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let connected = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      connected = true;
      socket.destroy();
      resolve({ success: true, message: `✅ 端口 ${port} 可达` });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, message: `❌ 端口 ${port} 连接超时` });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ success: false, message: `❌ 端口 ${port} 连接失败: ${err.message}` });
    });

    socket.connect(port, host);
  });
}

// 测试Minecraft服务器状态
async function testMinecraftServer(host, port = 25565) {
  console.log(`🔍 测试服务器: ${host}:${port}`);

  // 1. 测试端口连通性
  const portTest = await testPortConnection(host, port);
  console.log(portTest.message);

  if (!portTest.success) {
    return { success: false, error: '端口不可达' };
  }

  // 2. 尝试获取服务器信息
  return new Promise((resolve) => {
    const socket = net.createConnection(port, host);
    let dataBuffer = Buffer.alloc(0);

    socket.setTimeout(5000);

    // 发送握手包
    const sendHandshake = () => {
      // 构建一个简单的握手包
      const packet = Buffer.alloc(5);
      packet.writeUInt8(0x00, 0); // 包ID
      packet.writeUInt8(0x04, 1); // 协议版本
      packet.writeUInt16BE(host.length, 2); // 主机名长度
      packet.write(host, 4); // 主机名
      packet.writeUInt16BE(port, 4 + host.length); // 端口
      packet.writeUInt8(0x01, 6 + host.length); // 下一步状态

      const length = Buffer.alloc(1);
      length.writeUInt8(packet.length, 0);

      socket.write(Buffer.concat([length, packet]));

      // 请求状态包
      const request = Buffer.from([0x01, 0x00]);
      socket.write(request);
    };

    socket.on('connect', () => {
      console.log('🔗 TCP连接建立，发送握手包...');
      sendHandshake();
    });

    socket.on('data', (data) => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
    });

    socket.on('timeout', () => {
      console.log('⏰ 服务器响应超时');
      socket.destroy();
      resolve({ success: false, error: '服务器响应超时' });
    });

    socket.on('error', (err) => {
      console.log('❌ 连接错误:', err.message);
      socket.destroy();
      resolve({ success: false, error: err.message });
    });

    socket.on('close', () => {
      if (dataBuffer.length > 0) {
        try {
          const jsonStr = dataBuffer.toString('utf8').split('\0')[0];
          const serverInfo = JSON.parse(jsonStr);
          console.log('✅ 服务器信息获取成功:', serverInfo.version);
          resolve({ success: true, serverInfo });
        } catch (e) {
          console.log('✅ 服务器响应正常，但无法解析信息');
          resolve({ success: true, serverInfo: null });
        }
      }
    });
  });
}

// 主测试函数
async function main() {
  const host = process.argv[2] || 'localhost';
  const port = parseInt(process.argv[3]) || 25565;

  console.log('🚀 开始服务器连接测试...\n');

  const result = await testMinecraftServer(host, port);

  console.log('\n📊 测试结果:');
  if (result.success) {
    console.log('✅ 服务器可达且运行正常');
    if (result.serverInfo) {
      console.log(`📋 服务器版本: ${result.serverInfo.version.name}`);
    }
  } else {
    console.log(`❌ 服务器连接失败: ${result.error}`);
    console.log('\n💡 建议检查:');
    console.log('1. 服务器是否正在运行');
    console.log('2. 服务器地址和端口是否正确');
    console.log('3. 防火墙设置');
    console.log('4. 服务器是否允许外部连接');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMinecraftServer, testPortConnection };