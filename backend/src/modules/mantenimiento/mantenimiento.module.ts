import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientoController } from './mantenimiento.controller';
import { MantenimientoService } from './mantenimiento.service';
import { Mantenimiento } from './entities/mantenimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mantenimiento])],
  controllers: [MantenimientoController],
  providers: [MantenimientoService],
  exports: [TypeOrmModule, MantenimientoService],
})
export class MantenimientoModule {}
