const express = require('express');
const path = require('path');

class WebServer {
  constructor(config, store, logger) {
    this.config = config;
    this.store = store;
    this.logger = logger;
    this.app = express();
    this.server = null;
    this.startedAt = Date.now();
    this.setup();
  }

  setup() {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '32kb' }));

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        bot: this.store.get()
      });
    });

    this.app.get('/ping', (req, res) => res.status(200).send('pong'));

    this.app.use(express.static(path.join(__dirname, '..', 'public')));

    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.web.port, this.config.web.host, () => {
        this.logger.info(`Web 服务已启动: http://localhost:${this.config.web.port}`);
        resolve(this.server);
      });
      this.server.once('error', reject);
    });
  }

  async stop() {
    if (!this.server) return;
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
  }
}

module.exports = { WebServer };
