"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/dashboard/layout.module.css';

import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Dumbbell, 
  Calendar, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell 
} from 'lucide-react';

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
          style={{ objectFit: 'cover', opacity: 0.15 }}
          priority
        />
        <div className={styles.overlay} />
      </div>

      {/* Sidebar Sidebar */}
      <aside className={`${styles.sidebar} glass`}>
        <div className={styles.logo}>
          <h2 className="animate-fade-in">GymFit</h2>
        </div>
        
        <nav className={styles.nav}>
          <ul>
            <li className={styles.active}>
              <LayoutDashboard size={20} className={styles.icon} /> Dashboard
            </li>
            <li>
              <Users size={20} className={styles.icon} /> Socios
            </li>
            <li>
              <CreditCard size={20} className={styles.icon} /> Membresías
            </li>
            <li>
              <Dumbbell size={20} className={styles.icon} /> Entrenadores
            </li>
            <li>
              <Calendar size={20} className={styles.icon} /> Clases
            </li>
            <li>
              <Package size={20} className={styles.icon} /> Inventario
            </li>
            <li>
              <BarChart3 size={20} className={styles.icon} /> Reportes
            </li>
            <li>
              <Settings size={20} className={styles.icon} /> Configuración
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <header className={styles.topBar}>
          <div className={styles.welcomeText}>
            <h1>Bienvenido, Admin</h1>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <Bell size={20} />
            </button>
            <div className={styles.avatar}></div>
          </div>
        </header>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
