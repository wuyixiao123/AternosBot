const mineflayer = require('mineflayer');

class MinecraftBotManager {
  constructor(config, store, monitor, logger) {
    this.config = config;
    this.store = store;
    this.monitor = monitor;
    this.logger = logger;
    this.bot = null;
    this.running = false;
    this.connecting = false;
    this.versionIndex = 0;
    this.retryTimer = null;
    this.connectionTimer = null;
    this.statusTimer = null;
    this.attemptsSinceSuccess = 0;
  }

  get currentVersion() {
    return this.config.mc.versions[this.versionIndex % this.config.mc.versions.length];
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.logger.info(`启动 Minecraft Bot: ${this.config.mc.username}`);
    await this.connect();
  }

  async connect() {
    if (!this.running || this.connecting || this.bot) return;

    this.connecting = true;
    this.attemptsSinceSuccess += 1;
    const attempt = this.attemptsSinceSuccess;
    const version = this.currentVersion;

    this.store.update({
      connectionState: 'checking',
      connectionAttempts: attempt,
      currentVersion: version,
      error: null
    });

    const server = await this.monitor.check();
    if (!this.running) return this.finishConnecting();

    if (!server.success) {
      this.store.update({ serverOnline: false, connectionState: 'waiting', error: server.message });
      this.logger.warn(`服务器不可达: ${server.message}`);
      this.scheduleReconnect(this.config.mc.retryDelay);
      return;
    }

    this.store.update({ serverOnline: true, connectionState: 'connecting' });
    this.logger.info(`连接尝试 #${attempt}，Minecraft ${version}`);

    try {
      this.bot = mineflayer.createBot({
        host: this.config.mc.host,
        port: this.config.mc.port,
        username: this.config.mc.username,
        version,
        auth: this.config.mc.auth,
        checkTimeoutInterval: this.config.mc.checkTimeoutInterval,
        connectTimeout: this.config.mc.connectTimeout,
        keepAlive: true,
        closeTimeout: 30000,
        hideErrors: false,
        logErrors: true
      });

      this.bindEvents(this.bot);
      this.connectionTimer = setTimeout(() => {
        if (this.bot && this.connecting && !this.bot.player) {
          this.logger.warn(`连接 ${version} 超时，切换版本`);
          this.endBot('connection timeout');
          this.nextVersion();
          this.scheduleReconnect(3000);
        }
      }, this.config.mc.connectTimeout);
    } catch (error) {
      this.logger.error('创建 Bot 失败:', error);
      this.store.update({ connectionState: 'error', error: error.message });
      this.finishConnecting();
      this.scheduleReconnect(this.config.mc.retryDelay);
    }
  }

  bindEvents(bot) {
    bot.once('spawn', () => {
      clearTimeout(this.connectionTimer);
      this.connecting = false;
      this.attemptsSinceSuccess = 0;
      this.store.update({
        isOnline: true,
        serverOnline: true,
        connectionState: 'online',
        connectionAttempts: 0,
        currentVersion: bot.version || this.currentVersion,
        lastConnectTime: new Date().toISOString(),
        error: null
      });
      this.logger.info(`Bot 已进入服务器: ${bot.username}`);
      this.startStatusPolling();
    });

    bot.on('login', () => this.logger.info('Minecraft 登录协议完成'));

    bot.on('message', (message) => {
      const text = message.toString().trim();
      if (text && text.length <= 120) {
        this.logger.info(`服务器消息: ${text}`);
      }
    });

    bot.on('health', () => this.updateEntityStatus());

    bot.on('kicked', (reason) => {
      const text = typeof reason === 'string' ? reason : JSON.stringify(reason);
      this.logger.warn(`Bot 被服务器踢出: ${text}`);
      this.store.update({ error: `被踢出: ${text}` });
    });

    bot.on('error', (error) => {
      this.logger.error(`Bot 错误: ${error.message}`);
      this.store.update({ isOnline: false, connectionState: 'error', error: error.message });
      if (/version|protocol|unsupported/i.test(error.message)) {
        this.nextVersion();
      }
    });

    bot.on('end', (reason) => {
      clearTimeout(this.connectionTimer);
      this.stopStatusPolling();
      this.bot = null;
      this.connecting = false;
      const text = reason ? String(reason) : 'connection ended';
      this.store.update({
        isOnline: false,
        connectionState: this.running ? 'waiting' : 'stopped',
        lastDisconnectReason: text,
        error: this.running ? `连接断开: ${text}` : null
      });
      this.logger.warn(`连接断开: ${text}`);
      if (this.running && this.config.app.autoReconnect) {
        this.scheduleReconnect(this.retryDelay(text));
      }
    });
  }

  updateEntityStatus() {
    if (!this.bot?.entity) return;
    const pos = this.bot.entity.position;
    const players = Object.keys(this.bot.players || {})
      .filter(name => name !== this.bot.username).length;
    this.store.update({
      position: pos ? `X:${Math.round(pos.x)}, Y:${Math.round(pos.y)}, Z:${Math.round(pos.z)}` : null,
      playersNearby: players,
      health: Number.isFinite(this.bot.health) ? this.bot.health : 20
    });
  }

  startStatusPolling() {
    this.stopStatusPolling();
    this.statusTimer = setInterval(() => this.updateEntityStatus(), 15000);
    this.updateEntityStatus();
  }

  stopStatusPolling() {
    if (this.statusTimer) clearInterval(this.statusTimer);
    this.statusTimer = null;
  }

  retryDelay(reason = '') {
    if (/timeout|socketClosed/i.test(reason)) return Math.max(this.config.mc.retryDelay, 15000);
    return this.config.mc.retryDelay;
  }

  scheduleReconnect(delay) {
    if (!this.running || !this.config.app.autoReconnect || this.retryTimer) {
      this.finishConnecting();
      return;
    }
    this.finishConnecting();
    this.retryTimer = setTimeout(async () => {
      this.retryTimer = null;
      await this.connect();
    }, delay);
    this.logger.info(`将在 ${Math.round(delay / 1000)} 秒后重试`);
  }

  nextVersion() {
    this.versionIndex = (this.versionIndex + 1) % this.config.mc.versions.length;
    this.store.update({ currentVersion: this.currentVersion });
    this.logger.info(`切换到 Minecraft ${this.currentVersion}`);
  }

  finishConnecting() {
    this.connecting = false;
  }

  endBot(reason) {
    if (!this.bot) return;
    try {
      this.bot.end(reason);
    } catch (error) {
      this.logger.warn(`关闭 Bot 时发生错误: ${error.message}`);
    }
    this.bot = null;
  }

  async stop() {
    this.running = false;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.connectionTimer) clearTimeout(this.connectionTimer);
    this.stopStatusPolling();
    this.endBot('process shutdown');
    this.connecting = false;
    this.store.update({ isOnline: false, connectionState: 'stopped' });
    this.logger.info('Minecraft Bot 已停止');
  }
}

module.exports = { MinecraftBotManager };
