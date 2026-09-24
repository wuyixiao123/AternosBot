const test = require('node:test');
const assert = require('node:assert/strict');
const { ServerMonitor } = require('../src/monitor');

test('monitor reports connection failure cleanly', async () => {
  const monitor = new ServerMonitor({
    host: '127.0.0.1',
    port: 1,
    timeout: 100
  }, {});

  const result = await monitor.check();
  assert.equal(result.success, false);
  assert.equal(result.status, 'offline');
  assert.ok(result.message);
});
