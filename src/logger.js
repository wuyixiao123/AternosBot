const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function createLogger(level = 'info') {
  const threshold = LEVELS[level] ?? LEVELS.info;

  function write(name, args) {
    if (LEVELS[name] < threshold) return;
    const prefix = new Date().toISOString();
    const method = name === 'error' ? console.error : name === 'warn' ? console.warn : console.log;
    method(`[${prefix}] [${name.toUpperCase()}]`, ...args);
  }

  return {
    debug: (...args) => write('debug', args),
    info: (...args) => write('info', args),
    warn: (...args) => write('warn', args),
    error: (...args) => write('error', args)
  };
}

module.exports = { createLogger };
