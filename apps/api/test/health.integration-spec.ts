import { INestApplication } from '@nestjs/common';
import { HealthCheckError } from '@nestjs/terminus';
import request from 'supertest';
import { DatabaseHealthIndicator } from '../src/health/database.health-indicator';
import { createTestApp } from './helpers/test-app';

describe('GET /health (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('7.11: returns 200 with database status up when PostgreSQL is reachable', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' } },
      details: { database: { status: 'up' } },
    });
  });

  it('7.11: returns 503 when the database health indicator fails', async () => {
    const unhealthyApp = await createTestApp((builder) =>
      builder.overrideProvider(DatabaseHealthIndicator).useValue({
        pingCheck: async () => {
          throw new HealthCheckError('database check failed', {
            database: { status: 'down' },
          });
        },
      }),
    );

    try {
      const response = await request(unhealthyApp.getHttpServer()).get('/health').expect(503);

      expect(response.body).toMatchObject({
        status: 'error',
        error: { database: { status: 'down' } },
      });
    } finally {
      await unhealthyApp.close();
    }
  });
});
