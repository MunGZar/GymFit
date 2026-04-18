import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles indica qué roles tienen acceso al endpoint.
 * Ejemplo: @Roles('admin', 'recepcionista')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
