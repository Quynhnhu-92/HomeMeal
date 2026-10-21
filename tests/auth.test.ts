import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import type { Server } from 'node:http';

test('real PostgreSQL authentication and authorization integration', async (t) => {
  const value = process.env.HOMEMEAL_TEST_DATABASE_URL;
  assert.ok(value, 'Run bash scripts/test-auth.sh, or set a disposable HOMEMEAL_TEST_DATABASE_URL. Production is never a test target.');
  const url = new URL(value);
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) && /^\/homemeal_test_[a-z0-9_]+$/.test(url.pathname), 'Only a named local test database is allowed.');
  process.env.DATABASE_URL = value;
  process.env.NODE_ENV = 'test';
  const { default: app } = await import('../server/app.js');
  const { pool, databaseOptions } = await import('../server/db.js');
  const server = await new Promise<Server>((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  process.env.APP_ORIGIN = base;
  const password = randomBytes(24).toString('base64url');
  const nonce = randomBytes(5).toString('hex');
  const email = `customer-${nonce}@example.invalid`;
  const adminEmail = `admin-${nonce}@example.invalid`;
  const jars: Record<string, string> = {};
  let customerId = '';
  let adminId = '';
  async function request(actor: string, resource: string, action?: string, body?: Record<string, unknown>, method = body ? 'POST' : 'GET', origin = base) {
    const response = await fetch(`${base}/api?resource=${resource}${action ? '&action=' + action : ''}`, {
      method, headers: { 'Content-Type': 'application/json', Origin: origin, ...(jars[actor] ? { Cookie: jars[actor] } : {}) }, body: body ? JSON.stringify(body) : undefined,
    });
    const cookie = response.headers.getSetCookie()[0];
    if (cookie) jars[actor] = cookie.split(';')[0];
    return { status: response.status, body: await response.json(), cookie };
  }
  try {
    await t.test('schema migration runs twice against the isolated database', async () => {
      for (let i = 0; i < 2; i++) execFileSync(process.execPath, ['--import', 'tsx', 'scripts/migrate.ts'], { env: { ...process.env, DATABASE_URL: value }, stdio: 'pipe' });
      const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
      assert.ok(tables.rows.some((r) => r.tablename === 'app_users'));
      assert.ok(tables.rows.some((r) => r.tablename === 'auth_sessions'));
    });
    await t.test('anonymous endpoints and origin checks reject unauthorized requests', async () => {
      assert.equal((await request('anon', 'auth', 'me')).body.user, null);
      assert.equal((await request('anon', 'admin/users')).status, 401);
      assert.equal((await request('anon', 'cook', 'portal')).status, 401);
      assert.equal((await request('anon', 'auth', 'register', {}, 'POST', 'https://example.invalid')).status, 403);
      assert.equal((await request('anon', 'auth', 'register', { name: 'X', email: 'bad', password: 'short' })).status, 400);
    });
    await t.test('registration persists a real customer, ignores requested admin role, and hashes secrets', async () => {
      const r = await request('customer', 'auth', 'register', { name: 'Khách kiểm thử', email, password, role: 'admin' });
      assert.equal(r.status, 201); assert.equal(r.body.user.role, 'customer'); customerId = r.body.user.id;
      assert.match(r.cookie!, /HttpOnly/i); assert.match(r.cookie!, /SameSite=Lax/i);
      const saved = await pool.query('SELECT password_hash FROM app_users WHERE id=$1', [customerId]);
      assert.match(saved.rows[0].password_hash, /^scrypt\$/); assert.notEqual(saved.rows[0].password_hash, password);
      const session = await pool.query('SELECT token_hash FROM auth_sessions WHERE user_id=$1', [customerId]);
      assert.equal(session.rows[0].token_hash.length, 64); assert.notEqual(session.rows[0].token_hash, jars.customer.split('=')[1]);
      assert.equal((await request('anon', 'auth', 'register', { name: 'Trùng email', email: email.toUpperCase(), password })).status, 409);
    });
    await t.test('customer cannot escalate via profile, headers or admin endpoint', async () => {
      assert.equal((await request('customer', 'admin/users')).status, 403);
      assert.equal((await request('customer', 'cook', 'portal')).status, 403);
      assert.equal((await request('customer', 'admin/users', undefined, { userId: customerId, role: 'admin' }, 'PATCH')).status, 403);
      assert.equal((await request('customer', 'auth', 'profile', { name: 'Khách kiểm thử', phone: '', address: '', role: 'admin' }, 'PATCH')).status, 400);
      const forged = await fetch(base + '/api?resource=admin/users', { headers: { Cookie: 'homemeal_session=forged', 'X-Role': 'admin' } });
      assert.equal(forged.status, 401);
    });
    await t.test('profile updates name/contact in PostgreSQL and survives session restoration', async () => {
      const r = await request('customer', 'auth', 'profile', { name: 'Khách đã sửa', phone: '0900000000', address: 'Địa chỉ kiểm thử' }, 'PATCH');
      assert.equal(r.status, 200); assert.equal(r.body.user.role, 'customer');
      assert.equal((await request('customer', 'auth', 'me')).body.user.address, 'Địa chỉ kiểm thử');
    });
    await t.test('logout revokes the real session; incorrect and correct password logins differ', async () => {
      const oldCookie = jars.customer;
      assert.equal((await request('customer', 'auth', 'logout', {})).status, 200);
      jars.stale = oldCookie; assert.equal((await request('stale', 'auth', 'me')).body.user, null);
      assert.equal((await request('customer', 'auth', 'login', { email, password: 'incorrect' })).status, 401);
      assert.equal((await request('customer', 'auth', 'login', { email, password })).status, 200);
    });
    await t.test('seed admin uses the real script and refuses a second initial admin', async () => {
      const env = { ...process.env, DATABASE_URL: value, INITIAL_ADMIN_EMAIL: adminEmail, INITIAL_ADMIN_PASSWORD: password, INITIAL_ADMIN_NAME: 'Admin kiểm thử' };
      execFileSync(process.execPath, ['--import', 'tsx', 'scripts/seed-admin.ts'], { env, stdio: 'pipe' });
      assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/seed-admin.ts'], { env, stdio: 'pipe' }));
      const r = await request('admin', 'auth', 'login', { email: adminEmail, password });
      assert.equal(r.status, 200); assert.equal(r.body.user.role, 'admin'); adminId = r.body.user.id;
    });
    await t.test('admin lists accounts, grants/revokes Cook; existing sessions use current database role', async () => {
      assert.equal((await request('admin', 'admin/users')).status, 200);
      assert.equal((await request('admin', 'admin/users', undefined, { userId: customerId, role: 'cook' }, 'PATCH')).status, 200);
      assert.equal((await request('customer', 'cook', 'portal')).status, 200);
      assert.equal((await request('customer', 'auth', 'me')).body.user.role, 'cook');
      assert.equal((await request('customer', 'admin/users')).status, 403);
      assert.equal((await request('admin', 'admin/users', undefined, { userId: customerId, role: 'customer' }, 'PATCH')).status, 200);
      assert.equal((await request('customer', 'cook', 'portal')).status, 403);
      assert.equal((await request('admin', 'admin/users', undefined, { userId: 'bad', role: 'admin' }, 'PATCH')).status, 400);
      assert.equal((await request('admin', 'admin/users', undefined, { userId: adminId, role: 'customer' }, 'PATCH')).status, 409);
    });
    await t.test('expired sessions are refused and cleared', async () => {
      await pool.query("UPDATE auth_sessions SET expires_at=NOW()-INTERVAL '1 second' WHERE user_id=$1", [customerId]);
      const r = await request('customer', 'auth', 'me'); assert.equal(r.body.user, null); assert.match(r.cookie!, /Expires=/i);
      assert.equal((await request('customer', 'auth', 'login', { email, password })).status, 200);
    });
    await t.test('concurrent admin demotions cannot remove all administrators', async () => {
      assert.equal((await request('admin', 'admin/users', undefined, { userId: customerId, role: 'admin' }, 'PATCH')).status, 200);
      const result = await Promise.all([
        request('admin', 'admin/users', undefined, { userId: customerId, role: 'customer' }, 'PATCH'),
        request('customer', 'admin/users', undefined, { userId: adminId, role: 'customer' }, 'PATCH'),
      ]);
      assert.equal(result.filter((r) => r.status === 200).length, 1);
      assert.equal(Number((await pool.query("SELECT COUNT(*) FROM app_users WHERE role='admin'")).rows[0].count), 1);
    });
    await t.test('production session cookies are Secure and Neon configuration keeps TLS verification', async () => {
      process.env.NODE_ENV = 'production';
      try { assert.match((await request('customer', 'auth', 'login', { email, password })).cookie!, /Secure/i); }
      finally { process.env.NODE_ENV = 'test'; }
      const options = databaseOptions('postgresql://config_test@example.neon.tech/test?sslmode=disable');
      assert.equal(new URL(options.connectionString!).searchParams.get('sslmode'), 'verify-full');
    });
    await t.test('login attempts are rate limited', async () => {
      for (let i = 0; i < 8; i++) assert.equal((await request('anon', 'auth', 'login', { email: 'missing@example.invalid', password: 'incorrect' })).status, 401);
      assert.equal((await request('anon', 'auth', 'login', { email: 'missing@example.invalid', password: 'incorrect' })).status, 429);
    });
  } finally {
    await pool.end(); server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
