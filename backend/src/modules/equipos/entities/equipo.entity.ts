import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Mantenimiento } from '../../mantenimiento/entities/mantenimiento.entity';

@Entity('equipo')
export class Equipo {
  @PrimaryGeneratedColumn({ name: 'id_equipo' })
  id_equipo!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'disponible' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado!: string;

  @Column({ name: 'ubicacion', type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ubicacion!: string | null;

  
  @OneToMany(() => Mantenimiento, (m) => m.equipo)
  mantenimientos!: Mantenimiento[];
}
