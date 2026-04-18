import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgresoController } from './progreso.controller';
import { ProgresoService } from './progreso.service';
import { Progreso } from './entities/progreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progreso])],
  controllers: [ProgresoController],
  providers: [ProgresoService],
  exports: [TypeOrmModule, ProgresoService],
})
export class ProgresoModule {}
