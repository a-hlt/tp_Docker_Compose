const test = require('node:test');
const assert = require('node:assert');
const { validateTask } = require('./utils');

test('validateTask - Title should not be empty, null, or undefined', () => {
  // Test null
  const resNull = validateTask(null);
  assert.strictEqual(resNull.valid, false);
  assert.strictEqual(resNull.error, 'Le titre est obligatoire.');

  // Test undefined
  const resUndefined = validateTask(undefined);
  assert.strictEqual(resUndefined.valid, false);
  assert.strictEqual(resUndefined.error, 'Le titre est obligatoire.');

  // Test empty string
  const resEmpty = validateTask('');
  assert.strictEqual(resEmpty.valid, false);
  assert.strictEqual(resEmpty.error, 'Le titre ne peut pas être vide ou contenir uniquement des espaces.');

  // Test spaces-only string
  const resSpaces = validateTask('   ');
  assert.strictEqual(resSpaces.valid, false);
  assert.strictEqual(resSpaces.error, 'Le titre ne peut pas être vide ou contenir uniquement des espaces.');
});

test('validateTask - Title should not exceed 100 characters', () => {
  const longTitle = 'a'.repeat(101);
  const resLong = validateTask(longTitle);
  assert.strictEqual(resLong.valid, false);
  assert.strictEqual(resLong.error, 'Le titre ne peut pas dépasser 100 caractères.');
});

test('validateTask - Should accept valid titles', () => {
  const resOk = validateTask('Faire le TP Docker Compose');
  assert.strictEqual(resOk.valid, true);
  assert.strictEqual(resOk.error, null);
});
