import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppConfigService } from './config/app-config.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Shared between `main.ts` and every integration test's app bootstrap, so
 * tests exercise the exact same global prefix, validation, security headers,
 * CORS, and error shaping as production instead of a hand-rolled approximation.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(AppConfigService);

  // CSP is disabled so Swagger UI at `/api/docs` can load its inline assets.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  // docs/requirements.md section 7.11: `/health` sits outside the versioned prefix.
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
}
