import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service';
import { LoginResponseDto, UserSummaryDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { toUserSummaryDto } from './mappers/user.mapper';
import { UsersRepository } from './users.repository';

// Not a real credential — a fixed bcrypt (cost 12) hash of an arbitrary
// string, compared against when no user matches the given email. This
// keeps "unknown email" and "wrong password" on the same code path and (as
// closely as bcrypt allows) the same timing, so BR-22 holds against a
// timing side-channel, not just against the response body.
const DUMMY_PASSWORD_HASH = '$2b$12$sur0WrMhdmWwN95eY1jduuUNgAQkmSvV42jjfc2.N10OfIf.sBAKu';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    // BR-22: identical error for an unknown email and a wrong password.
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: this.configService.jwt.expiresInSeconds,
      user: toUserSummaryDto(user),
    };
  }

  async getById(id: string): Promise<UserSummaryDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      // The token was valid, but no longer refers to an existing user.
      throw new UnauthorizedException();
    }
    return toUserSummaryDto(user);
  }
}
