import React from 'react';
import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import styles from '@/styles/pages/auth/login.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GymFit | Portál Administrativo',
  description: 'Sistema centralizado de administración y control para gimnasios.',
};

const LoginPage = () => {
  return (
    <div className={styles.wrapper}>
      {/* Background Image */}
      <Image
        src="/login-bg.png"
        alt="Gym Interior"
        fill
        className={styles.background}
        priority
      />
      
      {/* Colored Glowing Blobs for Atmosphere */}
      <div className={styles.floatingElements}>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      <div className={styles.overlay} />

      {/* Main Content */}
      <main className={styles.content}>
        <LoginForm />
      </main>
    </div>
  );
};

export default LoginPage;
