import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export const configureApplication = (
  app: INestApplication,
): INestApplication => {
  app.use(helmet());
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: () =>
        new BadRequestException({
          error: {
            code: 'INVALID_QUERY_PARAMETERS',
            message: 'One or more query parameters are invalid',
          },
        }),
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Coffee Shops API')
    .setDescription('Return coffee shops near a specific location.')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  return app;
};
