"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/dashboard/layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className={styles.wrapper}>
      {/* Background Image */}
      <div className={styles.backgroundContainer}>
        <Image
          src="/assets/login-bg.png"
          alt="Gym Background"
          fill
          style={{ objectFit: 'cover', opacity: 0.2 }}
          priority
        />
        <div className={styles.overlay} />
      </div>

      {/* Navigation Sidebar (Placeholder for now) */}
      <aside className={`${styles.sidebar} glass`}>
        <div className={styles.logo}>
          <h2>GymFit</h2>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li className={styles.active}>Dashboard</li>
            <li>Socios</li>
            <li>Membresías</li>
            <li>Clases</li>
            <li>Reportes</li>
          </ul>
        </nav>
        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
