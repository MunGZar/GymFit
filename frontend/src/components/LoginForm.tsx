"use client";

import React, { useState } from 'react';
import styles from '@/styles/components/LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // In a real app, this would call an API
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
            required
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
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Iniciar Sesión
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
