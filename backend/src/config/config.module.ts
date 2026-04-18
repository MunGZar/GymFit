import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,      // disponible en todos los módulos sin reimportar
      envFilePath: '.env', // lee el archivo .env en la raíz del proyecto
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
