import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bienvenido al Dashboard</h1>
        <p className={styles.subtitle}>Aquí tienes un resumen de la actividad de hoy en GymFit.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <h3>Socios Activos</h3>
          <p className={styles.statNumber}>3</p>
          <span className={styles.trend}>+1% este mes</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <h3>Ingresos Hoy</h3>
          <p className={styles.statNumber}>$250.000</p>
          <span className={styles.trend}>Estable</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <h3>Clases Programadas</h3>
          <p className={styles.statNumber}>12</p>
          <span className={styles.trend}>Próxima: Crossfit 10:00 AM</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <h3>Check-ins</h3>
          <p className={styles.statNumber}>45</p>
          <span className={styles.trend}>Pico a las 8:00 AM</span>
        </div>
      </div>

      <section className={styles.mainContent}>
        <div className={`${styles.tableWrapper} glass`}>
          <h2 className={styles.sectionTitle}>Últimos Registros</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Socio</th>
                <th>Hora</th>
                <th>Acceso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Perez</td>
                <td>08:15 AM</td>
                <td>Entrada Principal</td>
                <td><span className={styles.statusActive}>Permitido</span></td>
              </tr>
              <tr>
                <td>Maria Garcia</td>
                <td>08:22 AM</td>
                <td>Entrada Principal</td>
                <td><span className={styles.statusActive}>Permitido</span></td>
              </tr>
              <tr>
                <td>Carlos Ruiz</td>
                <td>08:45 AM</td>
                <td>Entrada Principal</td>
                <td><span className={styles.statusActive}>Permitido</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
