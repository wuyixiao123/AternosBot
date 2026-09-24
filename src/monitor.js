const net = require('net');

class ServerMonitor {
  constructor({ host, port, timeout = 8000 }, logger) {
    this.host = host;
    this.port = port;
    this.timeout = timeout;
    this.logger = logger;
  }

  check() {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(this.timeout);
      socket.once('connect', () => finish({
        success: true,
        status: 'online',
        host: this.host,
        port: this.port,
        message: '服务器端口可达'
      }));
      socket.once('timeout', () => finish({
        success: false,
        status: 'offline',
        host: this.host,
        port: this.port,
        message: '连接超时'
      }));
      socket.once('error', (error) => finish({
        success: false,
        status: 'offline',
        host: this.host,
        port: this.port,
        message: `连接失败: ${error.message}`
      }));

      try {
        socket.connect(this.port, this.host);
      } catch (error) {
        finish({
          success: false,
          status: 'error',
          host: this.host,
          port: this.port,
          message: `连接异常: ${error.message}`
        });
      }
    });
  }
}

module.exports = { ServerMonitor };
