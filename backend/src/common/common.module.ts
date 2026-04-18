import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    // Aplicar JwtAuthGuard globalmente a todas las rutas
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Aplicar RolesGuard globalmente después del JWT
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [],
})
export class CommonModule {}
