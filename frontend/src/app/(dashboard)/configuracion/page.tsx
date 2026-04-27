import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="#c8d6e5" />
          Configuración
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
          Ajustes del sistema, usuarios administradores y preferencias.
        </p>
      </div>

      <div className={styles.contentGrid}>
        <div className={`${styles.chartCard} glass`} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <Settings size={48} color="rgba(255, 255, 255, 0.2)" />
          <h3 style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)' }}>Módulo en Construcción</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>La funcionalidad de Configuración estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  );
}
