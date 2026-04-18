import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Clase } from '../../clases/entities/clase.entity';
import { AsignacionRutina } from '../../rutinas/entities/asignacion-rutina.entity';
import { Asignacion } from './asignacion.entity';

@Entity('entrenador')
export class Entrenador {
  @PrimaryGeneratedColumn({ name: 'id_entrenador' })
  id_entrenador!: number;

  @Column({ name: 'especialidad', type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  especialidad!: string | null;

  @Column({ name: 'experiencia', type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  experiencia!: number | null;

  
  @ManyToOne(() => Usuario, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @OneToMany(() => Clase, (c) => c.entrenador)
  clases!: Clase[];

  @OneToMany(() => Asignacion, (a) => a.entrenador)
  asignaciones!: Asignacion[];
}
