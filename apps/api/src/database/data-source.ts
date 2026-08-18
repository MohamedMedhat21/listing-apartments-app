import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { envSchema } from '../config/env.schema';
import { buildDataSourceOptions } from './typeorm.config';

// Runs outside Nest's DI container (the TypeORM CLI invokes this file
// directly for migration:generate/run/revert and for the seed script), so
// it loads and validates the root .env itself instead of going through
// AppConfigModule. Assumes it is invoked with cwd = apps/api, which is how
// every `npm run -w apps/api ...` script in package.json runs it.
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const env = envSchema.parse(process.env);

// The TypeORM CLI requires exactly one exported `DataSource` instance in
// this file, so this is a default export only (no additional named export).
const AppDataSource = new DataSource(
  buildDataSourceOptions({
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    logging: env.NODE_ENV === 'development',
  }),
);

export default AppDataSource;
