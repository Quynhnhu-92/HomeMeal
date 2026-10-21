import 'dotenv/config';
import { Pool } from 'pg';

export function databaseOptions(connectionString = process.env.DATABASE_URL) {
  if (connectionString) {
    const url = new URL(connectionString);
    // Neon uses publicly trusted certificates. Keep certificate and hostname verification,
    // including when a copied provider URL uses sslmode=require or libpq compatibility.
    if (url.hostname.endsWith('.neon.tech')) {
      url.searchParams.set('sslmode', 'verify-full');
      connectionString = url.toString();
    }
  }
  return {
  connectionString,
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  };
}

export const pool = new Pool(databaseOptions());

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
}
