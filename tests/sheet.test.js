import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dismissed } from '../sheet.js';

test('dismissed is false when the sheet has not moved', () => {
  assert.equal(dismissed(0, 0, 600), false);
});

test('dismissed is true past 30% of the height', () => {
  assert.equal(dismissed(181, 0, 600), true);
});

test('dismissed is false at exactly 30% of the height', () => {
  assert.equal(dismissed(180, 0, 600), false);
});

test('dismissed is true for a fast downward flick', () => {
  assert.equal(dismissed(20, 0.6, 600), true);
});

test('dismissed is false for an upward drag whatever the velocity', () => {
  assert.equal(dismissed(-50, 2, 600), false);
});

test('dismissed is false at exactly the velocity threshold', () => {
  assert.equal(dismissed(10, 0.5, 600), false);
});
