import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool, requireDatabaseUrl } from '../server/db.js';
import { hashPassword } from '../server/passwords.js';

let client: PoolClient | undefined;

try {
  requireDatabaseUrl();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || 'HomeMeal Admin';
  if (!email || !password || password.length < 12 || password.length > 128) {
    throw new Error('Set INITIAL_ADMIN_EMAIL and a 12–128 character INITIAL_ADMIN_PASSWORD first.');
  }

  client = await pool.connect();
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock($1, $2)', [2784, 1]);
  const existingAdmin = await client.query("SELECT 1 FROM app_users WHERE role = 'admin' LIMIT 1");
  if (existingAdmin.rowCount) throw new Error('An administrator already exists; refusing to seed another.');

  const passwordHash = await hashPassword(password);
  await client.query(
    `INSERT INTO app_users (id, email, full_name, password_hash, role)
     VALUES ($1, $2, $3, $4, 'admin')`,
    [randomUUID(), email, name, passwordHash],
  );
  await client.query('COMMIT');
  console.log(`Initial administrator created for ${email}.`);
} catch (error) {
  if (client) await client.query('ROLLBACK').catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
