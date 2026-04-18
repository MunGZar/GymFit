import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './estrategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Login ────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // 1. Buscar el usuario por correo (con relación al rol)
    const usuario = await this.usuariosRepo.findOne({
      where: { correo: dto.correo },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.estado) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    // 2. Verificar la contraseña con bcrypt
    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generar el token JWT
    const payload: JwtPayload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario:  usuario.id_usuario,
        nombre:      usuario.nombre,
        correo:      usuario.correo,
        rol:         usuario.rol.nombre,
      },
    };
  }

  // ─── Perfil del usuario autenticado ───────────────────────
  async perfil(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // No retornar el campo password
    delete (usuario as any).password;
    return usuario;
  }
}
