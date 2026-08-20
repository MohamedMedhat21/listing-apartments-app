import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { configureApp } from './configure-app';
import { configureSwagger } from './configure-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  configureApp(app);
  configureSwagger(app);

  const config = app.get(AppConfigService);
  await app.listen(config.apiPort);
}
bootstrap();
