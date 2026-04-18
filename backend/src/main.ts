import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints → /api/...
  app.setGlobalPrefix('api');

  // Habilitar CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Pipe global de validación — usa class-validator en todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true,           // convierte tipos automáticamente (string → number, etc.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 GymFit backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
