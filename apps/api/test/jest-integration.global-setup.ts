import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

const TEST_DATABASE = 'apartments_test';

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = Number(process.env.POSTGRES_PORT ?? 5432);
  const user = process.env.POSTGRES_USER ?? 'apartments';
  const password = process.env.POSTGRES_PASSWORD ?? '';
  const configuredDb = process.env.POSTGRES_DB ?? 'postgres';
  const maintenanceDb = configuredDb === TEST_DATABASE ? 'postgres' : configuredDb;

  const client = new Client({ host, port, user, password, database: maintenanceDb });

  try {
    await client.connect();
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      TEST_DATABASE,
    ]);

    if ((existing.rowCount ?? 0) === 0) {
      await client.query(`CREATE DATABASE ${TEST_DATABASE}`);
    }
  } finally {
    await client.end();
  }

  process.env.POSTGRES_DB = TEST_DATABASE;
  process.env.THROTTLE_LOGIN_LIMIT = '1000';
}
