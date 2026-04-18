import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Rutina } from './rutina.entity';
import { Ejercicio } from '../../ejercicios/entities/ejercicio.entity';

/**
 * Tabla intermedia: rutina_ejercicio
 * Reemplaza el @ManyToMany simple del código original.
 * Agrega atributos propios: series, repeticiones, descanso.
 * Relación: rutina (N) y ejercicio (N) con atributos adicionales.
 */
@Entity('rutina_ejercicio')
export class RutinaEjercicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'series', type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  series!: number | null;

  @Column({ name: 'repeticiones', type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones!: number | null;

  @Column({ name: 'descanso', type: 'integer', nullable: true, comment: 'Descanso en segundos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  descanso!: number | null;

  
  @ManyToOne(() => Rutina, (r) => r.rutina_ejercicios, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rutina' })
  rutina!: Rutina;

  @ManyToOne(() => Ejercicio, (e) => e.rutina_ejercicios, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_ejercicio' })
  ejercicio!: Ejercicio;
}
