"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from '@/styles/pages/dashboard/layout.module.css';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Calendar,
  Package, BarChart3, Settings, LogOut, Bell, Menu,
  UserPlus, ClipboardList, ShieldCheck, UserCircle,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/acceso',        label: 'Control Acceso', icon: ShieldCheck },
  { path: '/socios',        label: 'Socios',         icon: Users },
  { path: '/prospectos',    label: 'Prospectos',     icon: UserPlus },
  { path: '/membresias',    label: 'Membresías',     icon: CreditCard },
  { path: '/rutinas',       label: 'Rutinas',        icon: ClipboardList },
  { path: '/personal',      label: 'Personal',       icon: Dumbbell },
  { path: '/clases',        label: 'Clases',         icon: Calendar },
  { path: '/inventario',    label: 'Inventario',     icon: Package },
  { path: '/reportes',      label: 'Reportes',       icon: BarChart3 },
  { path: '/configuracion', label: 'Configuración',  icon: Settings },
];

function iniciales(nombre: string) {
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.backgroundContainer}>
        <Image src="/assets/login-bg.png" alt="Gym Background" fill
          style={{ objectFit: 'cover', opacity: 0.15 }} priority />
        <div className={styles.overlay} />
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''} glass`}>
        <div className={styles.logo}><h2>GymFit</h2></div>

        <nav className={styles.nav}>
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
              return (
                <li key={item.path} className={isActive ? styles.active : ''}
                  onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }}>
                  <Icon size={20} className={styles.icon} />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          {/* Enlace al perfil propio — HU-03 */}
          <button
            onClick={() => { router.push('/perfil'); setIsMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '0.6rem 0.5rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '4px' }}
          >
            <UserCircle size={20} />
            <span>Mi perfil</span>
          </button>

          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className={styles.welcomeText}>
              <h1>Bienvenido, {usuario?.nombre ?? 'Admin'}</h1>
            </div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn}><Bell size={20} /></button>

            {/* Avatar clickeable → navega a /perfil */}
            <button
              onClick={() => router.push('/perfil')}
              title={`${usuario?.nombre ?? ''} — Ver perfil`}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(0,242,255,0.4)',
                background: 'linear-gradient(135deg, rgba(0,242,255,0.2), rgba(176,38,255,0.2))',
                color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {iniciales(usuario?.nombre ?? 'U')}
            </button>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
