import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.schema';

// Typed wrapper around ConfigService so the rest of the app never touches
// raw `process.env` or an untyped `.get(...)` call.
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  get nodeEnv(): EnvConfig['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get apiPort(): number {
    return this.configService.get('API_PORT', { infer: true });
  }

  get database(): {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  } {
    return {
      host: this.configService.get('POSTGRES_HOST', { infer: true }),
      port: this.configService.get('POSTGRES_PORT', { infer: true }),
      database: this.configService.get('POSTGRES_DB', { infer: true }),
      username: this.configService.get('POSTGRES_USER', { infer: true }),
      password: this.configService.get('POSTGRES_PASSWORD', { infer: true }),
    };
  }

  get admin(): { email: string; password: string } {
    return {
      email: this.configService.get('ADMIN_EMAIL', { infer: true }),
      password: this.configService.get('ADMIN_PASSWORD', { infer: true }),
    };
  }
}
