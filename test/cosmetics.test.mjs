import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_CAR_PALETTE, CAR_SKINS, applyPaletteSwap, buildPaletteSwapTable, hexToRgb } from '../cosmetics.mjs';

test('buildPaletteSwapTable creates entries for every skin', () => {
  const table = buildPaletteSwapTable(BASE_CAR_PALETTE, CAR_SKINS);
  assert.equal(Object.keys(table).length, Object.keys(CAR_SKINS).length);
  assert.ok(table['midnight-cyan'].some(entry => entry.slot === 'body'));
});

test('applyPaletteSwap remaps matching pixels with palette colors', () => {
  const table = buildPaletteSwapTable(BASE_CAR_PALETTE, CAR_SKINS);
  const swap = table['forest-surge'];
  const baseBody = hexToRgb(BASE_CAR_PALETTE.body);
  const target = hexToRgb(CAR_SKINS['forest-surge'].palette.body);
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 0,
    baseBody.r, baseBody.g, baseBody.b, 255
  ]);
  applyPaletteSwap({ data: pixels }, swap, 0);
  assert.equal(pixels[4], target.r);
  assert.equal(pixels[5], target.g);
  assert.equal(pixels[6], target.b);
});
