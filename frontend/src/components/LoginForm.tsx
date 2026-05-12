"use client";

/**
 * LoginForm.tsx — HU-02: Inicio de sesión.
 * Conectado al endpoint real POST /api/auth/login.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/components/LoginForm.module.css';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const { login } = useAuth();

  const [correo, setCorreo]         = useState('');
  const [password, setPassword]     = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ correo: correo.trim().toLowerCase(), password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} glass`}>
      <header className={styles.header}>
        <h1 className={styles.title}>GymFit</h1>
        <p className={styles.subtitle}>Inicio de Sesión</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            placeholder="usuario@gymfit.com"
            className={styles.input}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={mostrarPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setMostrarPass((p) => !p)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}
              aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#f87171' }}>
            {error}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
        </button>
      </form>

      <footer className={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/register" className={styles.link}>Crear cuenta</Link>
      </footer>
    </div>
  );
};

export default LoginForm;
