import type { Request, Response } from 'express';
import { normalizeFood } from '../../shared/smartMenu.js';
import { generateWithGemini } from './provider.js';
import { parseRequest, parsePlans, parseDish, SmartMenuError } from './validation.js';

// Per-instance limits. Add Vercel Firewall rate limits for aggregate protection on serverless.
export function createSmartMenuHandler(generate = generateWithGemini) {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  const active = new Set<string>();
  let total = 0;
  let resetAt = Date.now() + 600000;
  return async (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).json({ error: 'Vui lòng gửi yêu cầu thực đơn bằng POST.', code: 'METHOD_NOT_ALLOWED' });
      return;
    }
    const key = req.ip || 'unknown';
    let started = false;
    try {
      const { preferences, action, replacement } = parseRequest(req.body);
      const now = Date.now();
      if (now >= resetAt) { total = 0; resetAt = now + 600000; }
      for (const [ip, item] of attempts) if (item.resetAt <= now) attempts.delete(ip);
      const item = attempts.get(key) || { count: 0, resetAt: now + 600000 };
      if (item.count >= 8 || total >= 80 || active.has(key) || active.size >= 4 || (!attempts.has(key) && attempts.size >= 5000)) {
        const retrySeconds = item.count >= 8 ? Math.ceil((item.resetAt - now) / 1000) : total >= 80 ? Math.ceil((resetAt - now) / 1000) : 60;
        res.set('Retry-After', String(Math.max(1, retrySeconds)));
        throw new SmartMenuError(429, 'RATE_LIMITED', 'Bạn đã gửi nhiều yêu cầu hoặc AI đang bận. Vui lòng chờ vài phút rồi thử lại.');
      }
      item.count++; total++; attempts.set(key, item); active.add(key); started = true;
      const raw = await generate(preferences, replacement);
      try {
        if (action === 'replace') {
          const dish = parseDish((raw as { dish?: unknown })?.dish, preferences, `smart-${crypto.randomUUID()}`, replacement!.maxIngredientCost);
          if ([replacement!.dishName, ...replacement!.otherDishNames].some((n) => normalizeFood(n) === normalizeFood(dish.name))) throw new Error('Duplicate dish');
          res.json({ source: 'ai', dish });
        } else {
          res.json({ source: 'ai', guests: preferences.guests, plans: parsePlans(raw, preferences) });
        }
      } catch {
        throw new SmartMenuError(502, 'AI_INVALID_RESULT', 'AI chưa tạo được thực đơn đáp ứng đầy đủ nguyên liệu, dinh dưỡng, thời gian và ngân sách. Vui lòng điều chỉnh lựa chọn hoặc thử lại.');
      }
    } catch (error) {
      const known = error instanceof SmartMenuError;
      res.status(known ? error.status : 502).json({ code: known ? error.code : 'AI_UNAVAILABLE', error: known ? error.message : 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.' });
    } finally {
      if (started) active.delete(key);
    }
  };
}
