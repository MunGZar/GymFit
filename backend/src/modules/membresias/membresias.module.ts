import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiasController } from './membresias.controller';
import { MembresiasService } from './membresias.service';
import { Membresia } from './entities/membresia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membresia])],
  controllers: [MembresiasController],
  providers: [MembresiasService],
  exports: [TypeOrmModule, MembresiasService],
})
export class MembresiasModule {}
