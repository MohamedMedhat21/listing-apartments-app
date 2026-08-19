import { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/configure-app';
import AppDataSource from '../../src/database/data-source';

/**
 * Ensures the test database's schema is current, then boots a real Nest
 * application (its own DataSource/connection) with the exact same global
 * prefix, pipes, and exception filter as production — so integration tests
 * exercise the real HTTP contract, not an approximation of it.
 *
 * `configure` can override providers on the TestingModuleBuilder (e.g. to
 * vary a config value for one test) — needed because @nestjs/config reads
 * and validates `process.env` exactly once per process, so mutating
 * `process.env` between tests has no effect on later app instances.
 */
export async function createTestApp(
  configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<INestApplication> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();

  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (configure) {
    builder = configure(builder);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export function getDataSource(app: INestApplication): DataSource {
  return app.get(DataSource);
}
