import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dismissed, velocityOf, bindSheetDrag } from '../sheet.js';

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

// A layer with just enough DOM for bindSheetDrag: listeners, a sheet with style, a grab and a veil.
const fakeLayer = () => {
  const listeners = {};
  const style = () => ({ transition: '', transform: '', opacity: '' });
  const grab = { matches: true };
  const sheet = { style: style(), offsetHeight: 600, setPointerCapture() {}, querySelector: (selector) => parts[selector] ?? null };
  const veil = { style: style() };
  const parts = { '.sheet': sheet, '.sheet-veil': veil, '.sheet-grab': grab };
  const layer = {
    querySelector: (selector) => parts[selector] ?? null,
    addEventListener: (type, fn) => { listeners[type] = fn; },
    removeEventListener: (type) => { delete listeners[type]; },
  };
  const target = { closest: (selector) => (selector.includes('.sheet-grab') ? target : null) };
  const fire = (type, extra = {}) => listeners[type]?.({ pointerId: 1, pointerType: 'touch', clientY: 0, timeStamp: 0, target, ...extra });
  return { layer, sheet, veil, grab, listeners, fire };
};

const withDisplay = (display, run) => {
  const saved = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ display });
  try { run(); } finally { globalThis.getComputedStyle = saved; }
};

test('lostpointercapture snaps the sheet back like pointercancel and never closes it', () => {
  withDisplay('block', () => {
    const { layer, sheet, veil, fire } = fakeLayer();
    let closed = 0;
    bindSheetDrag(layer, { close: () => { closed += 1; } });
    fire('pointerdown');
    fire('pointermove', { clientY: 500, timeStamp: 10 });
    assert.equal(sheet.style.transform, 'translateY(500px)');
    fire('lostpointercapture', { clientY: 500, timeStamp: 20 });
    assert.equal(sheet.style.transform, '');
    assert.equal(sheet.style.transition, '');
    assert.equal(veil.style.opacity, '');
    assert.equal(closed, 0);
    fire('pointerdown');
    fire('pointermove', { clientY: 20, timeStamp: 30 });
    assert.equal(sheet.style.transform, 'translateY(20px)');
  });
});

test('no drag starts when the grab is not displayed', () => {
  withDisplay('none', () => {
    const { layer, sheet, fire } = fakeLayer();
    bindSheetDrag(layer, { close() {} });
    fire('pointerdown');
    fire('pointermove', { clientY: 300, timeStamp: 10 });
    assert.equal(sheet.style.transform, '');
    assert.equal(sheet.style.transition, '');
  });
});

test('unbinding in the middle of a drag clears the drag and the inline styles', () => {
  withDisplay('block', () => {
    const { layer, sheet, listeners, fire } = fakeLayer();
    const unbind = bindSheetDrag(layer, { close() {} });
    fire('pointerdown');
    fire('pointermove', { clientY: 200, timeStamp: 10 });
    unbind();
    assert.equal(sheet.style.transform, '');
    assert.deepEqual(Object.keys(listeners), []);
    const again = bindSheetDrag(layer, { close() {} });
    fire('pointerdown');
    assert.equal(sheet.style.transition, 'none');
    again();
  });
});
