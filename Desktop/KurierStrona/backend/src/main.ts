import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' });
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	const port = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3000;
	await app.listen(port);
}

bootstrap();
