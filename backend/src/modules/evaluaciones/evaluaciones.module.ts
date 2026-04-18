import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { Evaluacion } from './entities/evaluacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluacion])],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
  exports: [TypeOrmModule, EvaluacionesService],
})
export class EvaluacionesModule {}
