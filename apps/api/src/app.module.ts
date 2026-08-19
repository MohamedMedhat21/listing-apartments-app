import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthModule } from './auth/auth.module';
import { AppConfigService } from './config/app-config.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { DevelopersModule } from './modules/developers/developers.module';
import { ProjectsModule } from './modules/projects/projects.module';

// The login route is the only one with its own (stricter) named throttler;
// scoping it here by request path keeps every other controller free of
// rate-limiting decorators, now and as new modules are added.
const LOGIN_PATH = '/api/v1/auth/login';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.throttle.ttlMs,
            limit: configService.throttle.limit,
          },
          {
            name: 'login',
            ttl: configService.throttle.loginTtlMs,
            limit: configService.throttle.loginLimit,
            skipIf: (context) => {
              const request = context.switchToHttp().getRequest<Request>();
              return !(request.method === 'POST' && request.path === LOGIN_PATH);
            },
          },
        ],
      }),
      inject: [AppConfigService],
    }),
    AuthModule,
    ApartmentsModule,
    ProjectsModule,
    DevelopersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
