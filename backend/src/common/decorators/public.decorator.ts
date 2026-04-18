import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public()  marca un endpoint como público (sin autenticación JWT).
 * El JwtAuthGuard global revisa esta metadata antes de validar el token.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
