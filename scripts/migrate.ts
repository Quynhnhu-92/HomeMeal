import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pool, requireDatabaseUrl } from '../server/db.js';

try {
  requireDatabaseUrl();
  const schema = await readFile(resolve(process.cwd(), 'db/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Database schema is ready.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
