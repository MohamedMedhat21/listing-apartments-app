import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/configure-app';
import AppDataSource from '../../src/database/data-source';

/**
 * Ensures the test database's schema is current, then boots a real Nest
 * application (its own DataSource/connection) with the exact same global
 * prefix, pipes, and exception filter as production — so integration tests
 * exercise the real HTTP contract, not an approximation of it.
 */
export async function createTestApp(): Promise<INestApplication> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export function getDataSource(app: INestApplication): DataSource {
  return app.get(DataSource);
}
