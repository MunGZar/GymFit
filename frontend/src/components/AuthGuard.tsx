"use client";

import React, { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Lee localStorage directamente — síncrono, sin esperar contexto
  const [verificado, setVerificado] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const usuario = authApi.getUsuarioLocal();
    if (usuario) {
      setAutenticado(true);
    } else {
      // No hay sesión → redirigir al login
      window.location.href = '/login';
    }
    setVerificado(true);
  }, []);

  if (!verificado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#050508', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,242,255,0.15)', borderTop: '3px solid #00f2ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: '0.88rem' }}>Cargando…</p>
      </div>
    );
  }

  if (!autenticado) return null;

  return <>{children}</>;
}
