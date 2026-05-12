import React from 'react';
import Image from 'next/image';
import RegisterForm from '@/components/RegisterForm';
import styles from '@/styles/pages/auth/login.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GymFit | Registro de Usuario',
  description: 'Crea tu cuenta en el sistema administrativo de GymFit.',
};

const RegisterPage = () => {
  return (
    <div className={styles.wrapper}>
      <Image
        src="/assets/login-bg.png"
        alt="Gym Interior"
        fill
        className={styles.background}
        priority
      />
      <div className={styles.floatingElements}>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>
      <div className={styles.overlay} />
      <main className={styles.content} style={{ maxWidth: '520px' }}>
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;
