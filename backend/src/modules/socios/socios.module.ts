import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SociosController } from './socios.controller';
import { SociosService } from './socios.service';
import { Socio } from './entities/socio.entity';
import { Prospecto } from './entities/prospecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Socio, Prospecto])],
  controllers: [SociosController],
  providers: [SociosService],
  exports: [TypeOrmModule, SociosService],
})
export class SociosModule {}
