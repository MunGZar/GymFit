import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


import { Rol }              from '../modules/roles/entities/rol.entity';
import { Usuario }          from '../modules/usuarios/entities/usuario.entity';
import { Prospecto }        from '../modules/socios/entities/prospecto.entity';
import { Socio }            from '../modules/socios/entities/socio.entity';
import { Entrenador }       from '../modules/entrenadores/entities/entrenador.entity';
import { Asignacion }       from '../modules/entrenadores/entities/asignacion.entity';
import { Plan }             from '../modules/planes/entities/plan.entity';
import { Membresia }        from '../modules/membresias/entities/membresia.entity';
import { Ejercicio }        from '../modules/ejercicios/entities/ejercicio.entity';
import { Rutina }           from '../modules/rutinas/entities/rutina.entity';
import { RutinaEjercicio }  from '../modules/rutinas/entities/rutina-ejercicio.entity';
import { AsignacionRutina } from '../modules/rutinas/entities/asignacion-rutina.entity';
import { Clase }            from '../modules/clases/entities/clase.entity';
import { Inscripcion }      from '../modules/inscripciones/entities/inscripcion.entity';
import { Evaluacion }       from '../modules/evaluaciones/entities/evaluacion.entity';
import { Progreso }         from '../modules/progreso/entities/progreso.entity';
import { Asistencia }       from '../modules/asistencias/entities/asistencia.entity';
import { Equipo }           from '../modules/equipos/entities/equipo.entity';
import { Mantenimiento }    from '../modules/mantenimiento/entities/mantenimiento.entity';

const ENTITIES = [
  Rol, Usuario, Prospecto, Socio,
  Entrenador, Asignacion,
  Plan, Membresia,
  Ejercicio, Rutina, RutinaEjercicio, AsignacionRutina,
  Clase, Inscripcion,
  Evaluacion, Progreso, Asistencia,
  Equipo, Mantenimiento,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST',     'localhost'),
        port:     config.get<number>('DB_PORT',     5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME',     'gymfit'),
        entities: ENTITIES,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
