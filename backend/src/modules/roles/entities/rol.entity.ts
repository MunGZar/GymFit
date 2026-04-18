import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id_rol!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50, unique: true })
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  @IsString()
  @MaxLength(50)
  nombre!: string;

  
  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios!: Usuario[];
}
