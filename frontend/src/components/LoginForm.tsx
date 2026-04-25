"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/components/LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Login attempt:', { email, password });
    
    // Simular un pequeño retraso para el efecto de "carga"
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redireccionar al dashboard
    router.push('/dashboard');
  };

  return (
    <div className={`${styles.container} glass`}>
      <header className={styles.header}>
        <h1 className={styles.title}>GymFit</h1>
        <p className={styles.subtitle}>Inicio de Sesión</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="user@gymfit.com"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <footer className={styles.footer}>
        ¿Olvidaste tu contraseña?
        <a href="#" className={styles.link}>Recuperar</a>
      </footer>
    </div>
  );
};

export default LoginForm;
