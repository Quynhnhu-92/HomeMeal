import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateLaborFee } from '../src/utils/pricing.js';
import type { Dish } from '../src/types/index.js';

test('PDF family single-meal prices do not add dish complexity fees', () => {
  for (const [guests, price] of [[3, 200000], [4, 200000], [5, 340000], [8, 340000], [9, 340000]]) {
    const fee = calculateLaborFee(guests, [{ complexity: 'complex' } as Dish], 'cook_at_home');
    assert.equal(fee.totalLaborFee, price);
    assert.equal(fee.complexityAdjustment, 0);
    assert.equal(fee.requiresQuotation, false);
  }
});

test('Unspecified sizes and special requests require an accepted quote', () => {
  for (const guests of [1, 2, 3.5, NaN]) assert.throws(() => calculateLaborFee(guests, [], 'cook_at_home'));
  for (const guests of [10, 20]) {
    const fee = calculateLaborFee(guests, [], 'cook_at_home');
    assert.deepEqual(fee, calculateLaborFee(guests, [], 'party_at_home'));
    assert.equal(fee.requiresQuotation, true);
  }
  const manyDishes = calculateLaborFee(4, Array(8).fill({ complexity: 'complex' }), 'cook_at_home');
  assert.equal(manyDishes.requiresQuotation, false);
  assert.equal(manyDishes.totalLaborFee, 200000);
  const special = calculateLaborFee(4, [], 'cook_at_home', true, 1);
  assert.equal(special.requiresQuotation, true);
  assert.equal(special.additionalServiceFee, 0);
});
