import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Shared between `main.ts` and every integration test's app bootstrap, so
 * tests exercise the exact same global prefix, validation, and error
 * shaping as production instead of a hand-rolled approximation of it.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
}
