import { randomBytes, randomUUID, createHash } from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';
import { pool, requireDatabaseUrl } from './db.js';
import { hashPassword, verifyPassword } from './passwords.js';
import { createSmartMenuHandler } from './smart-menu/handler.js';

type UserRole = 'customer' | 'cook' | 'admin';
type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: UserRole;
};
type AuthRequest = Request & { authUser?: AuthUser };

const SESSION_COOKIE = 'homemeal_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use((_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  });
  next();
});

function dbUnavailable(res: Response) {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ error: 'Database is not configured.' });
    return true;
  }
  return false;
}

function getCookie(req: Request, name: string) {
  const cookies = (req.headers.cookie || '').split(';');
  const entry = cookies.map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : undefined;
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

function sessionCookieOptions() {
  return { ...baseCookieOptions(), maxAge: SESSION_TTL_MS };
}

function assertSameOrigin(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }
  const originHeader = req.get('origin');
  if (!originHeader) {
    res.status(403).json({ error: 'Request origin is required.' });
    return;
  }

  let expectedOrigin: string;
  try {
    const deploymentOrigin = process.env.APP_ORIGIN ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
    expectedOrigin = deploymentOrigin
      ? new URL(deploymentOrigin).origin
      : `${req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`;
    if (process.env.NODE_ENV === 'production' && !deploymentOrigin) {
      res.status(503).json({ error: 'APP_ORIGIN must be configured in production.' });
      return;
    }
    if (new URL(originHeader).origin !== expectedOrigin) {
      res.status(403).json({ error: 'Cross-origin request rejected.' });
      return;
    }
  } catch {
    res.status(403).json({ error: 'Invalid request origin.' });
    return;
  }

  next();
}

async function createSession(userId: string, res: Response) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query('DELETE FROM auth_sessions WHERE expires_at <= NOW()');
  await pool.query(
    'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [tokenHash, userId, expiresAt],
  );
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

function mapUser(row: {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: UserRole;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone,
    address: row.address,
    role: row.role,
  };
}

async function authenticate(req: AuthRequest) {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token || token.length > 128) return undefined;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const result = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.phone, u.address, u.role
     FROM auth_sessions s
     JOIN app_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash],
  );
  if (!result.rowCount) return undefined;
  req.authUser = mapUser(result.rows[0]);
  return req.authUser;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function takeLoginAttempt(req: Request, email: string) {
  const now = Date.now();
  if (loginAttempts.size > 5_000) {
    for (const [attemptKey, value] of loginAttempts) {
      if (value.resetAt <= now) loginAttempts.delete(attemptKey);
      if (loginAttempts.size <= 4_000) break;
    }
  }
  const key = `${req.ip || 'unknown'}:${email}`;
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  if (loginAttempts.size > 5_000) {
    for (const [attemptKey, value] of loginAttempts) {
      if (value.resetAt <= now) loginAttempts.delete(attemptKey);
    }
  }
  return true;
}

const smartMenuHandler = createSmartMenuHandler();

app.all('/api', assertSameOrigin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Smart Menu is public and does not read or write the authentication database.
  if (req.query.resource === 'smart-menu') {
    await smartMenuHandler(req, res);
    return;
  }
  if (dbUnavailable(res)) return;

  const resource = getString(req.query.resource, 32);
  const action = getString(req.query.action, 32) || getString(req.body?.action, 32);

  try {
    if (resource === 'auth' && req.method === 'GET' && action === 'me') {
      const user = await authenticate(req);
      if (!user && getCookie(req, SESSION_COOKIE)) res.clearCookie(SESSION_COOKIE, baseCookieOptions());
      res.json({ user: user || null });
      return;
    }

    if (resource === 'auth' && req.method === 'POST' && action === 'register') {
      const name = getString(req.body?.name, 100);
      const email = getString(req.body?.email, 254).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const phone = getString(req.body?.phone, 32);
      const address = getString(req.body?.address, 300);
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Enter a valid name and email.' });
        return;
      }
      if (password.length < 12 || password.length > 128) {
        res.status(400).json({ error: 'Password must be between 12 and 128 characters.' });
        return;
      }

      const passwordHash = await hashPassword(password);
      const userId = randomUUID();
      const result = await pool.query(
        `INSERT INTO app_users (id, email, full_name, phone, address, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6, 'customer')
         RETURNING id, email, full_name, phone, address, role`,
        [userId, email, name, phone, address, passwordHash],
      );
      const user = mapUser(result.rows[0]);
      await createSession(user.id, res);
      res.status(201).json({ user });
      return;
    }

    if (resource === 'auth' && req.method === 'POST' && action === 'login') {
      const email = getString(req.body?.email, 254).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (password.length > 128) {
        res.status(400).json({ error: 'Password must be no longer than 128 characters.' });
        return;
      }
      if (!takeLoginAttempt(req, email)) {
        res.status(429).json({ error: 'Too many sign-in attempts. Try again later.' });
        return;
      }

      const result = await pool.query(
        `SELECT id, email, full_name, phone, address, role, password_hash
         FROM app_users WHERE email = $1`,
        [email],
      );
      const row = result.rows[0];
      const verified = row
        ? await verifyPassword(password, row.password_hash)
        : (await hashPassword(password || randomBytes(16).toString('hex')), false);
      if (!row || !verified) {
        res.status(401).json({ error: 'Email or password is incorrect.' });
        return;
      }

      const user = mapUser(row);
      await createSession(user.id, res);
      res.json({ user });
      return;
    }

    if (resource === 'auth' && req.method === 'POST' && action === 'logout') {
      const token = getCookie(req, SESSION_COOKIE);
      if (token && token.length <= 128) {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [tokenHash]);
      }
      res.clearCookie(SESSION_COOKIE, baseCookieOptions());
      res.json({ ok: true });
      return;
    }

    if (resource === 'auth' && req.method === 'PATCH' && action === 'profile') {
      const user = await authenticate(req);
      if (!user) { res.status(401).json({ error: 'Vui lòng đăng nhập.' }); return; }
      if (!isObject(req.body) || Object.keys(req.body).some((key) => !['name', 'phone', 'address'].includes(key)) ||
          typeof req.body.name !== 'string' || req.body.name.trim().length < 2 || req.body.name.length > 100 ||
          typeof req.body.phone !== 'string' || req.body.phone.length > 32 || typeof req.body.address !== 'string' || req.body.address.length > 300) {
        res.status(400).json({ error: 'Thông tin hồ sơ không hợp lệ. Không thể thay đổi quyền qua hồ sơ cá nhân.' }); return;
      }
      const result = await pool.query('UPDATE app_users SET full_name = $1, phone = $2, address = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, full_name, phone, address, role', [req.body.name.trim(), req.body.phone.trim(), req.body.address.trim(), user.id]);
      res.json({ user: mapUser(result.rows[0]) }); return;
    }

    if (resource === 'cook' && req.method === 'GET' && action === 'portal') {
      const user = await authenticate(req);
      if (!user) {
        res.status(401).json({ error: 'Please sign in.' });
        return;
      }
      if (user.role !== 'cook') {
        res.status(403).json({ error: 'Cook access required.' });
        return;
      }
      res.json({ user });
      return;
    }

    if (resource === 'admin/users' && req.method === 'GET') {
      const user = await authenticate(req);
      if (!user) {
        res.status(401).json({ error: 'Please sign in.' });
        return;
      }
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Administrator access required.' });
        return;
      }
      const result = await pool.query(
        'SELECT id, email, full_name, phone, role, created_at FROM app_users ORDER BY created_at DESC LIMIT 500',
      );
      res.json({ users: result.rows });
      return;
    }

    if (resource === 'admin/users' && req.method === 'PATCH') {
      const user = await authenticate(req);
      if (!user) {
        res.status(401).json({ error: 'Please sign in.' });
        return;
      }
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Administrator access required.' });
        return;
      }

      const targetId = getString(req.body?.userId, 64);
      const newRole = getString(req.body?.role, 16) as UserRole;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId) || !['customer', 'cook', 'admin'].includes(newRole)) {
        res.status(400).json({ error: 'A valid user ID and role are required.' });
        return;
      }
      if (targetId === user.id && newRole !== 'admin') {
        res.status(409).json({ error: 'You cannot remove your own administrator role.' });
        return;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1, $2)', [2784, 1]);
        const adminRows = await client.query("SELECT id FROM app_users WHERE role = 'admin' ORDER BY id FOR UPDATE");
        if (!adminRows.rows.some((row) => row.id === user.id)) {
          await client.query('ROLLBACK');
          res.status(403).json({ error: 'Administrator access required.' });
          return;
        }
        const target = await client.query('SELECT id, role FROM app_users WHERE id = $1 FOR UPDATE', [targetId]);
        if (!target.rowCount) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: 'User not found.' });
          return;
        }
        if (target.rows[0].role === 'admin' && newRole !== 'admin' && (adminRows.rowCount ?? adminRows.rows.length) <= 1) {
          await client.query('ROLLBACK');
          res.status(409).json({ error: 'The last administrator cannot be demoted.' });
          return;
        }
        const updated = await client.query(
          'UPDATE app_users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING id, email, full_name, role',
          [targetId, newRole],
        );
        await client.query('COMMIT');
        res.json({ user: updated.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return;
    }

    res.status(404).json({ error: 'API route not found.' });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (req.query.resource === 'smart-menu') {
    // Body-parser errors can carry the original body. Do not log health preferences.
    const status = isObject(error) && error.status === 413 ? 413 : 400;
    res.status(status).json({ code: 'INVALID_INPUT', error: status === 413 ? 'Yêu cầu quá dài. Vui lòng rút ngắn danh sách nguyên liệu.' : 'Dữ liệu yêu cầu thực đơn không hợp lệ. Vui lòng kiểm tra lại.' });
    return;
  }
  if (isObject(error) && error.code === '23505') {
    res.status(409).json({ error: 'Email is already registered.' });
    return;
  }
  if (isObject(error) && (error.status === 400 || error.status === 413)) {
    res.status(error.status).json({ error: error.status === 413 ? 'Yêu cầu quá dài.' : 'Dữ liệu yêu cầu không hợp lệ.' });
    return;
  }
  // Never log raw database details or parser errors (which can include emails/passwords).
  console.error('HomeMeal API request failed.');
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

export default app;
