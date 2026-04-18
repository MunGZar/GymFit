import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

@Entity('prospecto')
export class Prospecto {
  @PrimaryGeneratedColumn({ name: 'id_prospecto' })
  id_prospecto!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre del prospecto es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono!: string | null;

  @Column({ name: 'interes', type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  interes!: string | null;

  @Column({ name: 'origen', type: 'varchar', length: 30, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  origen!: string | null;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamptz' })
  fecha_registro!: Date;
}
