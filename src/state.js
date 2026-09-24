function createState(config) {
  return {
    isOnline: false,
    serverOnline: false,
    connectionState: 'idle',
    connectionAttempts: 0,
    lastActivity: null,
    lastConnectTime: null,
    lastDisconnectReason: null,
    error: null,
    playersNearby: 0,
    health: 20,
    position: null,
    botName: config.mc.username,
    serverHost: config.mc.host,
    serverPort: config.mc.port,
    serverVersion: config.mc.version,
    currentVersion: config.mc.version
  };
}

function createStore(config) {
  let state = createState(config);
  return {
    get() {
      return { ...state };
    },
    update(patch) {
      state = { ...state, ...patch, lastActivity: patch.lastActivity ?? new Date().toISOString() };
      return { ...state };
    },
    reset() {
      state = createState(config);
      return { ...state };
    }
  };
}

module.exports = { createStore };
