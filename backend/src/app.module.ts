import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { SociosModule } from './modules/socios/socios.module';
import { EntrenadoresModule } from './modules/entrenadores/entrenadores.module';
import { PlanesModule } from './modules/planes/planes.module';
import { MembresiasModule } from './modules/membresias/membresias.module';
import { RutinasModule } from './modules/rutinas/rutinas.module';
import { EjerciciosModule } from './modules/ejercicios/ejercicios.module';
import { ClasesModule } from './modules/clases/clases.module';
import { InscripcionesModule } from './modules/inscripciones/inscripciones.module';
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { ProgresoModule } from './modules/progreso/progreso.module';
import { EquiposModule } from './modules/equipos/equipos.module';
import { MantenimientoModule } from './modules/mantenimiento/mantenimiento.module';
import { AsistenciasModule } from './modules/asistencias/asistencias.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    DatabaseModule,
    AuthModule,
    UsuariosModule,
    RolesModule,
    SociosModule,
    EntrenadoresModule,
    PlanesModule,
    MembresiasModule,
    RutinasModule,
    EjerciciosModule,
    ClasesModule,
    InscripcionesModule,
    EvaluacionesModule,
    ProgresoModule,
    EquiposModule,
    MantenimientoModule,
    AsistenciasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
