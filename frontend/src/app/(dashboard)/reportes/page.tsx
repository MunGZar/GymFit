import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { BarChart3 } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#48dbfb" />
          Reportes y Análisis
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
          Visualiza métricas financieras, estadísticas de uso y gráficas.
        </p>
      </div>

      <div className={styles.contentGrid}>
        <div className={`${styles.chartCard} glass`} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <BarChart3 size={48} color="rgba(255, 255, 255, 0.2)" />
          <h3 style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)' }}>Módulo en Construcción</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>La funcionalidad de Reportes estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  );
}
