const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');

test('config loads with required Minecraft fields', () => {
  const config = loadConfig();
  assert.ok(config.mc.host);
  assert.ok(Number.isInteger(config.mc.port));
  assert.ok(config.mc.username);
  assert.ok(config.mc.versions.length > 0);
  assert.ok(config.web.port > 0);
});
