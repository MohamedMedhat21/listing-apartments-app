import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createUser } from './fixtures';

/** Creates a real ADMIN user and logs in through the real endpoint, so
 * "success" paths in write-endpoint tests exercise the whole auth flow
 * rather than a hand-crafted token. */
export async function loginAsAdmin(app: INestApplication, dataSource: DataSource): Promise<string> {
  const { user, password } = await createUser(dataSource);
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: user.email, password })
    .expect(200);
  return response.body.accessToken as string;
}

/** Signs a token with an arbitrary role, bypassing real user creation. Only
 * `UserRole.ADMIN` exists as a real, seedable role (see
 * packages/shared/src/enums/user-role.enum.ts), so this is the only way to
 * exercise BR-19's "valid token, wrong role" 403 path. */
export function signTokenWithRole(app: INestApplication, role: string): Promise<string> {
  const jwtService = app.get(JwtService);
  return jwtService.signAsync({ sub: '00000000-0000-4000-8000-000000000000', role });
}
