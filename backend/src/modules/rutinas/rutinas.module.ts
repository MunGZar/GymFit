import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';
import { Rutina } from './entities/rutina.entity';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { AsignacionRutina } from './entities/asignacion-rutina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rutina, RutinaEjercicio, AsignacionRutina])],
  controllers: [RutinasController],
  providers: [RutinasService],
  exports: [TypeOrmModule, RutinasService],
})
export class RutinasModule {}
