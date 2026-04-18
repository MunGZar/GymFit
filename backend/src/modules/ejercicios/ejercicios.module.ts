import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjerciciosController } from './ejercicios.controller';
import { EjerciciosService } from './ejercicios.service';
import { Ejercicio } from './entities/ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ejercicio])],
  controllers: [EjerciciosController],
  providers: [EjerciciosService],
  exports: [TypeOrmModule, EjerciciosService],
})
export class EjerciciosModule {}
