import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../src/config/app-config.service';
import { createTestApp, getDataSource } from './helpers/test-app';
import { createUser, truncateAll } from './helpers/fixtures';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = getDataSource(app);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
  });

  describe('POST /api/v1/auth/login', () => {
    it('7.9: returns 200 with accessToken, expiresIn, and the user summary', async () => {
      const { user, password } = await createUser(dataSource, { email: 'login-ok@nawy.local' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        expiresIn: expect.any(Number),
        user: { id: user.id, email: user.email, role: user.role },
      });
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(response.body)).not.toContain(user.passwordHash);
    });

    it('BR-22: an unknown email and a wrong password produce byte-identical error bodies', async () => {
      const { user, password } = await createUser(dataSource, {
        email: 'login-wrongpw@nawy.local',
      });

      const unknownEmailResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@nawy.local', password })
        .expect(401);

      const wrongPasswordResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'definitely-wrong' })
        .expect(401);

      const normalize = (body: unknown): unknown =>
        typeof body === 'object' && body !== null ? { ...body, timestamp: undefined } : body;
      expect(normalize(unknownEmailResponse.body)).toEqual(normalize(wrongPasswordResponse.body));
    });

    it('BR-23: rejects an unknown body property with 400', async () => {
      const { user, password } = await createUser(dataSource);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password, rememberMe: true })
        .expect(400);

      expect(response.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    });

    it('400: rejects a malformed email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'whatever' })
        .expect(400);
    });

    // Isolated on its own app/throttler-storage instance, with AppConfigService
    // overridden so this one test exercises the real 5/min default (section 9)
    // regardless of the test-wide THROTTLE_LOGIN_LIMIT override (see
    // jest-integration.setup.ts) — @nestjs/config validates process.env once
    // per process, so a later `process.env` mutation wouldn't be picked up.
    it('rate limit: the 6th login attempt within the window returns 429', async () => {
      const realConfig = app.get(AppConfigService);
      const fiveLoginsPerMinuteConfig = {
        nodeEnv: realConfig.nodeEnv,
        isProduction: realConfig.isProduction,
        apiPort: realConfig.apiPort,
        database: realConfig.database,
        admin: realConfig.admin,
        jwt: realConfig.jwt,
        throttle: { ...realConfig.throttle, loginLimit: 5, loginTtlMs: 60_000 },
      } as unknown as AppConfigService;

      const rateLimitedApp = await createTestApp((builder) =>
        builder.overrideProvider(AppConfigService).useValue(fiveLoginsPerMinuteConfig),
      );

      try {
        await truncateAll(getDataSource(rateLimitedApp));
        const credentials = { email: 'rate-limited@nawy.local', password: 'wrong-password' };

        for (let attempt = 1; attempt <= 5; attempt += 1) {
          await request(rateLimitedApp.getHttpServer())
            .post('/api/v1/auth/login')
            .send(credentials)
            .expect(401);
        }

        const sixthAttempt = await request(rateLimitedApp.getHttpServer())
          .post('/api/v1/auth/login')
          .send(credentials)
          .expect(429);

        expect(sixthAttempt.body).toMatchObject({ statusCode: 429 });
      } finally {
        await rateLimitedApp.close();
      }
    }, 30_000);
  });

  describe('GET /api/v1/auth/me', () => {
    it('7.10: returns 200 with {id, email, role} for a valid token', async () => {
      const { user, password } = await createUser(dataSource, { email: 'me-ok@nawy.local' });
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ id: user.id, email: user.email, role: user.role });
      expect(JSON.stringify(response.body)).not.toContain(user.passwordHash);
    });

    it('BR-19: 401 with no Authorization header', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('BR-19: 401 with a malformed token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('BR-20/BR-19: 401 with an expired token', async () => {
      const { user } = await createUser(dataSource);
      const expiredToken = await jwtService.signAsync(
        { sub: user.id, role: user.role },
        { expiresIn: '1ms' },
      );
      await new Promise((resolve) => setTimeout(resolve, 50));

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
