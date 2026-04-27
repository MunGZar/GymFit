import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { User, Activity, Dumbbell, Calendar, ChevronLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function SocioProfilePage() {
  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/socios" style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
          <ChevronLeft size={20} /> Volver
        </Link>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          Perfil del Socio
        </h2>
      </div>

      {/* Main Profile Card */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          CM
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Carlos Mendoza</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>carlos.m@example.com | ID: 98765432</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Activo</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column: Stats & Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20} color="var(--primary)" /> Membresía Actual
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Plan:</span>
              <span style={{ fontWeight: 'bold', color: '#a855f7' }}>Premium</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Vencimiento:</span>
              <span style={{ fontWeight: 'bold' }}>15 Dic 2024</span>
            </div>
            <button style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', marginTop: '10px', cursor: 'pointer' }}>
              Renovar / Cambiar Plan
            </button>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Dumbbell size={20} color="var(--primary)" /> Entrenamiento
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Entrenador:</span>
              <span style={{ fontWeight: 'bold' }}>Roberto Carlos</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Rutina Activa:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Fuerza Nivel 2</span>
            </div>
          </div>

        </div>

        {/* Right Column: Evaluación Física */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--primary)" /> Evaluación Física y Progreso
            </h3>
            <button style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              Nueva Medición
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Peso</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>78 <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>kg</span></p>
              <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '5px' }}>↓ 2kg desde inicio</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Grasa Corporal</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>18 <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>%</span></p>
              <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '5px' }}>↓ 1.5% desde inicio</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Masa Muscular</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>42 <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>%</span></p>
              <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '5px' }}>↑ 1% desde inicio</p>
            </div>
          </div>

          {/* Simulated Chart Placeholder */}
          <div style={{ height: '200px', width: '100%', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: '10px' }}>
            <Activity size={32} />
            <p>Gráfico de Progreso (Simulación)</p>
          </div>

        </div>
      </div>
    </div>
  );
}
