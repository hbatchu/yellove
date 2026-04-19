import 'reflect-metadata';
import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/v1');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Nutrio backend running on http://localhost:${port}/api/v1`);
}
bootstrap();
