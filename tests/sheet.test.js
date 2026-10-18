import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dismissed, velocityOf } from '../sheet.js';

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

test('velocityOf is the speed over the last 100 ms of moves', () => {
  const moves = [{ dy: 0, t: 0 }, { dy: 10, t: 150 }, { dy: 60, t: 200 }];
  assert.equal(velocityOf(moves, 200), 1);
});

test('velocityOf is 0 after a pause of more than 100 ms', () => {
  const moves = [{ dy: 0, t: 0 }, { dy: 80, t: 50 }];
  assert.equal(velocityOf(moves, 151), 0);
  assert.equal(velocityOf(moves, 150), 1.6);
});

test('velocityOf is 0 with no move or one move', () => {
  assert.equal(velocityOf([], 10), 0);
  assert.equal(velocityOf([{ dy: 5, t: 10 }], 10), 0);
});
