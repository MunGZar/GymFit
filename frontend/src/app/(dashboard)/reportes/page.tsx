import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <BarChart3 size={24} color="#48dbfb" />
            Reportes y Análisis
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Métricas financieras e indicadores de asistencia (HU-21, HU-22).
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
            <option value="este_mes">Este Mes</option>
            <option value="mes_anterior">Mes Anterior</option>
            <option value="este_ano">Este Año</option>
          </select>
          <button style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            color: '#000', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '12px', 
            fontWeight: '700', 
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)'
          }}>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}><DollarSign size={24} /></div>
          <p className={styles.statLabel}>Ingresos por Membresías</p>
          <h3 className={styles.statValue}>$4.250.000</h3>
          <p className={styles.statTrend} style={{ color: '#4ade80' }}>↑ 12% vs mes anterior</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}><TrendingUp size={24} /></div>
          <p className={styles.statLabel}>Gastos Operativos</p>
          <h3 className={styles.statValue}>$1.100.000</h3>
          <p className={styles.statTrend} style={{ color: '#f87171' }}>↑ 5% vs mes anterior</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)' }}><Users size={24} /></div>
          <p className={styles.statLabel}>Asistencia Promedio Diaria</p>
          <h3 className={styles.statValue}>145</h3>
          <p className={styles.statTrend} style={{ color: '#4ade80' }}>↑ 8% vs mes anterior</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><Calendar size={24} /></div>
          <p className={styles.statLabel}>Nuevas Inscripciones</p>
          <h3 className={styles.statValue}>24</h3>
          <p className={styles.statTrend}>Mantenido vs mes anterior</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Reporte Financiero (Simulación) */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={20} color="#4ade80" /> Ingresos vs Egresos (HU-21)
          </h3>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', padding: '2rem', gap: '1rem', height: '250px' }}>
            {/* Simulación de gráfico de barras */}
            <div style={{ flex: 1, display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
              <div style={{ flex: 1, background: '#4ade80', height: '60%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, background: '#f87171', height: '30%', borderRadius: '4px 4px 0 0' }}></div>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
              <div style={{ flex: 1, background: '#4ade80', height: '80%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, background: '#f87171', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
              <div style={{ flex: 1, background: '#4ade80', height: '100%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, background: '#f87171', height: '35%', borderRadius: '4px 4px 0 0' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <span>Enero</span>
            <span>Febrero</span>
            <span>Marzo</span>
          </div>
        </div>

        {/* Reporte de Asistencia (Simulación) */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary)" /> Horarios Pico de Asistencia (HU-22)
          </h3>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', padding: '2rem 1rem', gap: '5px', height: '250px' }}>
            {/* Simulación de histograma */}
            {[20, 30, 80, 50, 40, 30, 20, 60, 90, 100, 70, 40].map((h, i) => (
              <div key={i} style={{ flex: 1, background: `rgba(0, 242, 255, ${h / 100})`, height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                {h > 80 && <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--primary)' }}>Pico</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <span>6:00 AM</span>
            <span>12:00 PM</span>
            <span>6:00 PM</span>
            <span>10:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
