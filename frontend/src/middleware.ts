import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * El token JWT se almacena en localStorage (client-side).
 * El middleware corre en el servidor Edge y NO tiene acceso a localStorage,
 * por eso la protección de rutas se delega completamente al AuthGuard
 * (componente client-side en src/components/AuthGuard.tsx).
 *
 * Este middleware solo deja pasar todas las peticiones sin tocarlas.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],   // sin rutas → middleware nunca intercepta nada
};
