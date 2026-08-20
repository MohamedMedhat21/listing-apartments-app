import { UserRole } from '@apartments/shared';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RolesGuard } from './roles.guard';

function makeContext(user: AuthenticatedUser | undefined): ExecutionContext {
  return {
    getHandler: () => (): void => undefined,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  function makeGuard(requiredRoles: string[] | undefined): { guard: RolesGuard } {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;
    return { guard: new RolesGuard(reflector) };
  }

  it('BR-19: allows a request when no @Roles(...) metadata is present on the route', () => {
    const { guard } = makeGuard(undefined);

    expect(guard.canActivate(makeContext({ id: 'u1', role: UserRole.ADMIN }))).toBe(true);
  });

  it('BR-19: allows a request whose user role is in the required roles', () => {
    const { guard } = makeGuard([UserRole.ADMIN]);

    expect(guard.canActivate(makeContext({ id: 'u1', role: UserRole.ADMIN }))).toBe(true);
  });

  it('BR-19: denies (403 via the guard returning false) a request whose role is not required', () => {
    const { guard } = makeGuard([UserRole.ADMIN]);

    expect(guard.canActivate(makeContext({ id: 'u1', role: 'GUEST' as UserRole }))).toBe(false);
  });

  it('BR-19: denies a request with no user on it at all (JwtAuthGuard did not run first)', () => {
    const { guard } = makeGuard([UserRole.ADMIN]);

    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });
});
