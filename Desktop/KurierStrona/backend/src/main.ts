import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes will be under /api/*
  app.setGlobalPrefix('api');

  // CORS: comma-separated origins in CORS_ORIGIN. If unset, allow all origins.
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // IMPORTANT on Render: use PORT, bind to 0.0.0.0
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
