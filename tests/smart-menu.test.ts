import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { Server } from 'node:http';
import { parseRequest, parsePlans, SmartMenuError } from '../server/smart-menu/validation.js';
import { createSmartMenuHandler } from '../server/smart-menu/handler.js';
import { generateWithGemini } from '../server/smart-menu/provider.js';
import { createSampleMenus } from '../src/utils/smartMenuSamples.js';
import { smartMealToDraft, mealCost, conflictsWithPreferences } from '../shared/smartMenu.js';
import type { Preferences } from '../shared/smartMenu.js';
import { calculateLaborFee } from '../src/utils/pricing.js';
import app from '../server/app.js';

const p: Preferences = { goal: 'healthy', activity: 'moderate', guests: 2, mealsPerDay: 1, days: 1, planCount: 1, budget: 200000, budgetPeriod: 'meal', allergies: [], dislikes: [], diet: 'balanced', cuisine: 'vietnamese', maxMinutes: 45, specialNeeds: 'none' };
const fixture = (preferences = p) => ({ plans: createSampleMenus(preferences).plans });
async function endpoint(generate: Parameters<typeof createSmartMenuHandler>[0], run: (url: string) => Promise<void>) {
  const app = express(); app.use(express.json()); app.all('/api', createSmartMenuHandler(generate));
  const server = await new Promise<Server>((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  try { await run(`http://127.0.0.1:${(server.address() as { port: number }).port}/api`); }
  finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
}
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('accepts a menu without optional personal measurements', () => {
  const parsed = parseRequest({ action: 'generate', preferences: p });
  assert.equal(parsed.preferences.height, undefined);
  assert.equal(parsed.preferences.guests, 2);
});
test('rejects invalid input instead of coercing values or ignoring limits', () => {
  for (const value of [null, {}, { ...p, guests: '2' }, { ...p, guests: 0 }, { ...p, guests: 13 }, { ...p, budget: -1 }, { ...p, days: 2 }, { ...p, maxMinutes: Infinity }, { ...p, allergies: Array(16).fill('tôm') }]) {
    assert.throws(() => parseRequest({ action: 'generate', preferences: value }), SmartMenuError);
  }
});
test('blocks personalization for minors, pregnancy and medical diets', () => {
  for (const unsafe of [{ ...p, age: 17 }, { ...p, specialNeeds: 'pregnant' }, { ...p, specialNeeds: 'medical' }]) {
    assert.throws(() => parseRequest({ action: 'generate', preferences: unsafe }), (e: SmartMenuError) => e.status === 422);
  }
});
test('expands known allergen synonyms and screens vegetarian/vegan ingredients', () => {
  const dish = { name: 'Món thử', description: 'Bữa ăn', ingredients: ['Đậu hũ'] };
  assert.equal(conflictsWithPreferences(dish, { ...p, allergies: ['đậu nành'] }), true);
  assert.equal(conflictsWithPreferences({ ...dish, ingredients: ['Nước mắm'] }, { ...p, goal: 'vegetarian' }), true);
  assert.equal(conflictsWithPreferences({ ...dish, ingredients: ['Trứng gà'] }, { ...p, diet: 'vegan' }), true);
  assert.equal(conflictsWithPreferences({ ...dish, ingredients: ['Bông cải xanh'] }, p), false);
});
test('validates all 3 alternatives, 7 days and 3 meals/day without discarding requested targets', () => {
  const long = { ...p, planCount: 3 as const, days: 7 as const, mealsPerDay: 3, budgetPeriod: 'day' as const, budget: 450000 };
  const plans = parsePlans(fixture(long), long);
  assert.equal(plans.length, 3);
  assert.ok(plans.every((plan) => plan.days.length === 7 && plan.days.every((day) => day.meals.length === 3)));
});
test('rejects incomplete, over-budget, allergenic, rushed or extremely low-energy AI output', () => {
  assert.throws(() => parsePlans({ plans: [] }, p));
  for (const patch of [{ ingredientCost: 9999999 }, { minutes: 181 }, { kcal: 100 }, { ingredients: ['Tôm'] }]) {
    const raw = fixture(); Object.assign(raw.plans[0].days[0].meals[0].dishes[0], patch);
    assert.throws(() => parsePlans(raw, { ...p, allergies: ['tôm'] }));
  }
});
test('sample fallback stays labelled and cannot silently ignore budget or allergens', () => {
  const sample = createSampleMenus({ ...p, allergies: ['đậu nành'], diet: 'vegan' });
  assert.equal(sample.source, 'sample');
  assert.ok(sample.plans.every((plan) => plan.days.every((day) => day.meals.every((meal) => meal.dishes.every((dish) => !conflictsWithPreferences(dish, { ...p, allergies: ['đậu nành'], diet: 'vegan' }))))));
  assert.throws(() => createSampleMenus({ ...p, budget: 30000, guests: 12 }));
});
test('three-meal plans cannot market an extremely low-energy day', () => {
  const fullDay = { ...p, mealsPerDay: 3 };
  const raw = fixture(fullDay);
  for (const meal of raw.plans[0].days[0].meals) meal.dishes[0].kcal = 400;
  assert.throws(() => parsePlans(raw, fullDay));
});
test('booking transfer preserves portions, cost and existing pricing without placing an order', () => {
  const meal = fixture().plans[0].days[0].meals[0];
  const draft = smartMealToDraft(meal, 2, ['tôm'], 'sample');
  assert.equal(draft.guestCount, 2); assert.deepEqual(draft.allergies, ['tôm']);
  assert.equal(draft.status, undefined); assert.equal(draft.id, undefined);
  assert.equal(draft.items![0].quantity, 1);
  assert.equal(draft.items![0].dish.suggestedPortion, '2 người');
  assert.equal(draft.items!.reduce((sum, i) => sum + i.dish.estimatedCost * i.quantity, 0), mealCost(meal));
  assert.equal(draft.estimatedGroceryBudget, mealCost(meal));
  assert.ok(calculateLaborFee(2, draft.items!.map((i) => i.dish), 'cook_at_home').totalLaborFee > 0);
});
test('HTTP API success is generated through its provider dependency (mocked AI, no database)', async () => {
  await endpoint(async () => fixture(), async (url) => {
    const response = await post(url, { action: 'generate', preferences: p });
    assert.equal(response.status, 200); const data = await response.json();
    assert.equal(data.source, 'ai'); assert.equal(data.plans.length, 1);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});
test('HTTP replacement must be different and fit remaining meal budget', async () => {
  const old = fixture().plans[0].days[0].meals[0].dishes[0];
  const newDish = { ...old, name: 'Cơm rau củ với đậu gà', ingredientCost: 50000 };
  const body = { action: 'replace', preferences: p, replacement: { dishName: old.name, otherDishNames: [], maxIngredientCost: 70000 } };
  await endpoint(async () => ({ dish: newDish }), async (url) => { const r = await post(url, body); assert.equal(r.status, 200); assert.equal((await r.json()).dish.ingredientCost, 50000); });
  await endpoint(async () => ({ dish: old }), async (url) => { assert.equal((await post(url, body)).status, 502); });
  await endpoint(async () => ({ dish: { ...newDish, ingredientCost: 80000 } }), async (url) => { assert.equal((await post(url, body)).status, 502); });
});
test('HTTP rejects malformed requests and methods before invoking provider', async () => {
  await endpoint(async () => { assert.fail('Provider must not run'); }, async (url) => {
    assert.equal((await fetch(url)).status, 405);
    assert.equal((await post(url, {})).status, 400);
    assert.equal((await post(url, { action: 'generate', preferences: { ...p, age: 15 } })).status, 422);
  });
});
test('HTTP rate limiter rejects ninth valid request and supplies Retry-After', async () => {
  let calls = 0;
  await endpoint(async () => { calls++; return fixture(); }, async (url) => {
    for (let i = 0; i < 8; i++) assert.equal((await post(url, { action: 'generate', preferences: p })).status, 200);
    const blocked = await post(url, { action: 'generate', preferences: p });
    assert.equal(blocked.status, 429); assert.ok(blocked.headers.get('retry-after')); assert.equal(calls, 8);
  });
});
test('HTTP provider failures never turn into a fake AI response or leak details', async () => {
  await endpoint(async () => { throw new Error('private provider details'); }, async (url) => {
    const r = await post(url, { action: 'generate', preferences: p }); assert.equal(r.status, 502);
    const data = await r.json(); assert.equal(data.plans, undefined); assert.equal(data.error.includes('private'), false);
  });
});
test('missing real key is clearly reported without making a network call', async () => {
  const original = process.env.GEMINI_API_KEY; delete process.env.GEMINI_API_KEY;
  try {
    await endpoint(generateWithGemini, async (url) => { const r = await post(url, { action: 'generate', preferences: p }); assert.equal(r.status, 503); assert.equal((await r.json()).code, 'AI_NOT_CONFIGURED'); });
  } finally { if (original === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = original; }
});
test('Gemini SDK request/response adapter works with mocked HTTPS transport; measurements are omitted', async () => {
  const originalFetch = globalThis.fetch; const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only-not-a-real-key';
  globalThis.fetch = async (input, options) => {
    const request = input instanceof Request ? input : new Request(input, options);
    assert.equal(new URL(request.url).hostname, 'generativelanguage.googleapis.com');
    const payload = await request.json();
    const sent = JSON.parse(payload.contents[0].parts[0].text);
    assert.equal(sent.preferences.age, undefined); assert.equal(sent.preferences.height, undefined); assert.equal(sent.preferences.weight, undefined);
    assert.equal(sent.preferences.guests, 2);
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(fixture()) }] }, finishReason: 'STOP' }] }), { headers: { 'Content-Type': 'application/json' } });
  };
  try { assert.equal(parsePlans(await generateWithGemini({ ...p, age: 35, height: 165, weight: 60 }), p).length, 1); }
  finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; }
});

test('Gemini adapter handles upstream quota errors and malformed JSON without leaking provider details', async () => {
  const originalFetch = globalThis.fetch; const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only-not-a-real-key';
  try {
    for (const response of [
      new Response(JSON.stringify({ error: { code: 429, message: 'private upstream detail', status: 'RESOURCE_EXHAUSTED' } }), { status: 429 }),
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'broken json' }] } }] })),
    ]) {
      globalThis.fetch = async () => response;
      await assert.rejects(() => generateWithGemini(p), (e: SmartMenuError) => e.status === 502 && !e.message.includes('private'));
    }
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; }
});

test('real application mounts Smart Menu before database checks, preserves origin guard and handles JSON errors', async () => {
  const originalDb = process.env.DATABASE_URL; const originalOrigin = process.env.APP_ORIGIN; const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.DATABASE_URL; delete process.env.GEMINI_API_KEY; process.env.APP_ORIGIN = 'http://localhost:3000';
  const server = await new Promise<Server>((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  try {
    const body = JSON.stringify({ action: 'generate', preferences: p });
    const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' };
    const missing = await fetch(url + '?resource=smart-menu', { method: 'POST', headers, body });
    assert.equal(missing.status, 503); assert.equal((await missing.json()).code, 'AI_NOT_CONFIGURED');
    assert.equal((await fetch(url + '?resource=smart-menu', { method: 'POST', headers: { ...headers, Origin: 'https://example.invalid' }, body })).status, 403);
    const broken = await fetch(url + '?resource=smart-menu', { method: 'POST', headers, body: 'broken JSON' });
    assert.equal(broken.status, 400); assert.equal((await broken.json()).code, 'INVALID_INPUT');
    const auth = await fetch(url + '?resource=auth&action=me');
    assert.equal(auth.status, 503); assert.deepEqual(await auth.json(), { error: 'Database is not configured.' });
  } finally {
    server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve()));
    for (const [key, value] of [['DATABASE_URL', originalDb], ['APP_ORIGIN', originalOrigin], ['GEMINI_API_KEY', originalKey]] as const) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
