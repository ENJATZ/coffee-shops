import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { configureApplication } from './app.factory';
import type { ApplicationConfiguration } from './config/configuration';
import type { EnvironmentVariables } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  configureApplication(app);
  const configService = app.get<
    ConfigService<ApplicationConfiguration & EnvironmentVariables, true>
  >(ConfigService);

  const port = configService.getOrThrow('port', { infer: true });
  const baseUrl = `http://localhost:${port}`;

  await app.listen(port);

  logger.log(`🚀 API Endpoint: ${baseUrl}/api/v1`);
  logger.log(`📖 Swagger UI: ${baseUrl}/docs`);
}

void bootstrap();
