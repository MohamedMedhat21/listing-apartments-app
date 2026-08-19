import { UserRole } from '@apartments/shared';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'admin@nawy.local',
    passwordHash: bcrypt.hashSync('correct-password', 4),
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    } as unknown as jest.Mocked<JwtService>;
    const configService = {
      jwt: { secret: 'test-secret', expiresInSeconds: 3600 },
    } as unknown as AppConfigService;
    service = new AuthService(usersRepository, jwtService, configService);
  });

  it('BR-21: login response never includes passwordHash', async () => {
    const user = makeUser({ passwordHash: bcrypt.hashSync('correct-password', 4) });
    usersRepository.findByEmail.mockResolvedValue(user);

    const result = await service.login({ email: user.email, password: 'correct-password' });

    expect(result).toEqual({
      accessToken: 'signed.jwt.token',
      expiresIn: 3600,
      user: { id: user.id, email: user.email, role: user.role },
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });

  it('lowercases and trims the email before lookup', async () => {
    const user = makeUser();
    usersRepository.findByEmail.mockResolvedValue(user);

    await service.login({ email: '  Admin@Nawy.LOCAL  ', password: 'correct-password' });

    expect(usersRepository.findByEmail).toHaveBeenCalledWith('admin@nawy.local');
  });

  it('BR-22: an unknown email throws UnauthorizedException with a fixed message', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@nawy.local', password: 'whatever' }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
  });

  it('BR-22: a wrong password throws the exact same UnauthorizedException as an unknown email', async () => {
    const user = makeUser({ passwordHash: bcrypt.hashSync('correct-password', 4) });
    usersRepository.findByEmail.mockResolvedValue(user);

    await expect(
      service.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
  });

  describe('getById', () => {
    it('BR-21: returns a user summary without passwordHash', async () => {
      const user = makeUser();
      usersRepository.findById.mockResolvedValue(user);

      const result = await service.getById(user.id);

      expect(result).toEqual({ id: user.id, email: user.email, role: user.role });
    });

    it('throws UnauthorizedException when the token no longer refers to an existing user', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.getById('missing-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
