const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const configPath = path.join(ROOT, 'config.json');

function loadJsonConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`无法读取 config.json: ${error.message}`);
  }
}

function env(name, fallback) {
  return process.env[name] ?? fallback;
}

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function booleanEnv(name, fallback) {
  if (process.env[name] === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(process.env[name].toLowerCase());
}

function loadConfig() {
  const file = loadJsonConfig();
  const mc = file.mcServer || {};
  const web = file.webServer || {};

  const supportedVersions = Array.isArray(file.supportedVersions)
    ? file.supportedVersions.filter(Boolean)
    : [];

  const configuredVersion = env('MC_VERSION', mc.version || supportedVersions[0]);
  const versions = [...new Set([configuredVersion, ...supportedVersions].filter(Boolean))];

  const config = {
    mc: {
      host: env('MC_HOST', mc.host),
      port: numberEnv('MC_PORT', mc.port || 25565),
      username: env('MC_USERNAME', mc.username || 'AternosBot'),
      auth: env('MC_AUTH', mc.auth || 'offline'),
      version: configuredVersion,
      versions,
      connectTimeout: numberEnv('MC_CONNECT_TIMEOUT', 30000),
      checkTimeoutInterval: numberEnv('MC_CHECK_TIMEOUT', 30000),
      maxAttempts: numberEnv('MC_MAX_ATTEMPTS', 10),
      retryDelay: numberEnv('MC_RETRY_DELAY', 10000),
      serverCheckTimeout: numberEnv('MC_SERVER_CHECK_TIMEOUT', 8000)
    },
    web: {
      port: numberEnv('PORT', web.port || 3000),
      host: env('WEB_HOST', '0.0.0.0')
    },
    app: {
      logLevel: env('LOG_LEVEL', 'info'),
      healthInterval: numberEnv('HEALTH_INTERVAL', 0),
      autoReconnect: booleanEnv('AUTO_RECONNECT', true)
    }
  };

  if (!config.mc.host) throw new Error('MC_HOST/config.json mcServer.host 未配置');
  if (!config.mc.port || config.mc.port < 1 || config.mc.port > 65535) {
    throw new Error('Minecraft 端口无效');
  }
  if (!config.mc.username) throw new Error('Minecraft 用户名不能为空');
  if (!versions.length) throw new Error('至少需要一个 Minecraft 版本');

  return config;
}

module.exports = { loadConfig };
