const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../src/state');

const config = {
  mc: {
    host: 'localhost',
    port: 25565,
    username: 'TestBot',
    version: '1.21.1'
  }
};

test('state store updates without replacing unrelated fields', () => {
  const store = createStore(config);
  const before = store.get();
  const after = store.update({ isOnline: true, health: 18 });

  assert.equal(after.isOnline, true);
  assert.equal(after.health, 18);
  assert.equal(after.botName, before.botName);
  assert.ok(after.lastActivity);
});
