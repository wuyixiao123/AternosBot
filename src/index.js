const { loadConfig } = require('./config');
const { createLogger } = require('./logger');
const { createStore } = require('./state');
const { ServerMonitor } = require('./monitor');
const { MinecraftBotManager } = require('./bot');
const { WebServer } = require('./web');

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.app.logLevel);
  const store = createStore(config);
  const monitor = new ServerMonitor({
    host: config.mc.host,
    port: config.mc.port,
    timeout: config.mc.serverCheckTimeout
  }, logger);
  const web = new WebServer(config, store, logger);
  const bot = new MinecraftBotManager(config, store, monitor, logger);

  await web.start();
  await bot.start();

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`收到 ${signal}，开始优雅退出...`);
    await bot.stop();
    await web.stop();
    logger.info('退出完成');
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    logger.error('未捕获异常:', error);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('未处理 Promise 拒绝:', reason);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error('启动失败:', error);
    process.exit(1);
  });
}

module.exports = { main };
