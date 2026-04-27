"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
  Bell,
  Menu,
  UserPlus,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/acceso', label: 'Control Acceso', icon: ShieldCheck },
    { path: '/socios', label: 'Socios', icon: Users },
    { path: '/prospectos', label: 'Prospectos', icon: UserPlus },
    { path: '/membresias', label: 'Membresías', icon: CreditCard },
    { path: '/rutinas', label: 'Rutinas', icon: ClipboardList },
    { path: '/personal', label: 'Personal', icon: Dumbbell },
    { path: '/clases', label: 'Clases', icon: Calendar },
    { path: '/inventario', label: 'Inventario', icon: Package },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

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

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''} glass`}>
        <div className={styles.logo}>
          <h2 className="animate-fade-in">GymFit</h2>
        </div>
        
        <nav className={styles.nav}>
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
              return (
                <li 
                  key={item.path}
                  className={isActive ? styles.active : ''}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon size={20} className={styles.icon} /> {item.label}
                </li>
              );
            })}
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
          <div className={styles.topBarLeft}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className={styles.welcomeText}>
              <h1>Bienvenido, Admin</h1>
            </div>
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
