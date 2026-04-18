import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';

/**
 * Decorador @UsuarioActual  inyecta el usuario autenticado desde el request.
 * Ejemplo: getProfile(@UsuarioActual() usuario: Usuario)
 */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Usuario => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as Usuario;
  },
);
