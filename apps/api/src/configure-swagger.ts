import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_EXTRA_MODELS } from './common/swagger/api-schemas';

/** OpenAPI UI at `/api/docs` (docs/requirements.md section 7, AGENTS.md). */
export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Listing Apartments API')
    .setDescription(
      'REST API for the Nawy listing-apartments take-home assignment. Contract: docs/requirements.md section 7.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [...SWAGGER_EXTRA_MODELS],
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
