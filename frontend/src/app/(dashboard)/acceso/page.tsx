import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { ShieldCheck, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AccesoPage() {
  const recientes = [
    { id: 1, name: 'Carlos Mendoza', time: '08:15 AM', status: 'Permitido', type: 'Socio' },
    { id: 2, name: 'Ana García', time: '08:10 AM', status: 'Denegado', type: 'Socio - Membresía Vencida' },
    { id: 3, name: 'Luis Ramírez', time: '07:55 AM', status: 'Permitido', type: 'Socio' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            Control de Acceso
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Valida el ingreso de socios escaneando o ingresando su ID.
          </p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Panel de Validación */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ position: 'relative' }}>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Ingresar ID de Socio</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ej. 12345678" 
                style={{ 
                  flex: 1, 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  color: '#fff',
                  fontSize: '1.2rem',
                  outline: 'none',
                  letterSpacing: '2px'
                }} 
                defaultValue="98765432"
              />
              <button style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                color: '#000', 
                border: 'none', 
                padding: '0 1.5rem', 
                borderRadius: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)'
              }}>
                Validar
              </button>
            </div>
          </div>

          {/* Resultado Simulado (Permitido) */}
          <div style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '2px solid rgba(34, 197, 94, 0.5)', 
            borderRadius: '16px', 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center'
          }}>
            <CheckCircle size={64} color="#4ade80" />
            <div>
              <h3 style={{ fontSize: '1.8rem', color: '#4ade80', marginBottom: '5px' }}>ACCESO PERMITIDO</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>María Torres</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>Plan Premium - Vence en 45 días</p>
            </div>
          </div>

        </div>

        {/* Últimos Ingresos */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--primary)" />
            Últimos Ingresos Registrados
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recientes.map(ingreso => (
              <div key={ingreso.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                borderLeft: `4px solid ${ingreso.status === 'Permitido' ? '#4ade80' : '#f87171'}`
              }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '1rem' }}>{ingreso.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{ingreso.type}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.9rem', color: ingreso.status === 'Permitido' ? '#4ade80' : '#f87171', fontWeight: '600' }}>
                    {ingreso.status}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{ingreso.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
