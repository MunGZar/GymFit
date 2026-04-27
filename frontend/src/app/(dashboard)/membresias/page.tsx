import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { CreditCard, Check, Plus } from 'lucide-react';

export default function MembresiasPage() {
  const plans = [
    { name: 'Básico', price: '$80.000', period: 'mes', color: '#06b6d4', features: ['Acceso área de pesas', 'Horario restringido (6am-4pm)', '1 clase grupal semanal'] },
    { name: 'Premium', price: '$120.000', period: 'mes', color: '#a855f7', features: ['Acceso todas las áreas', 'Horario ilimitado', 'Clases grupales ilimitadas', '1 Evaluación física al mes'], popular: true },
    { name: 'VIP Anual', price: '$1.000.000', period: 'año', color: '#3b82f6', features: ['Todos los beneficios Premium', '2 meses gratis', 'Casillero personal asignado', 'Toalla diaria', 'Invitado fin de semana'] },
  ];

  const membresiasAsignadas = [
    { id: 1, socio: 'Carlos Mendoza', plan: 'Premium', startDate: '2023-11-15', endDate: '2024-12-15', status: 'Activa' },
    { id: 2, socio: 'Ana García', plan: 'Básico', startDate: '2024-01-10', endDate: '2024-02-10', status: 'Vencida' },
    { id: 3, socio: 'Luis Ramírez', plan: 'VIP Anual', startDate: '2023-08-22', endDate: '2024-08-22', status: 'Renovada' },
    { id: 4, socio: 'David Silva', plan: 'Básico', startDate: '2024-04-18', endDate: '2024-05-18', status: 'Cancelada' },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <CreditCard size={24} color="var(--purple)" />
            Control de Membresías
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Administra los planes disponibles y visualiza los ingresos.
          </p>
        </div>
        
        <button style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          color: '#fff', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '0.8rem 1.5rem', 
          borderRadius: '12px', 
          fontWeight: '600', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <Plus size={20} />
          Crear Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map((plan, index) => (
          <div key={index} className="glass" style={{ 
            padding: '2.5rem 2rem', 
            borderRadius: '24px', 
            position: 'relative',
            border: plan.popular ? `1px solid ${plan.color}` : '1px solid rgba(255,255,255,0.1)',
            transform: plan.popular ? 'scale(1.05)' : 'none',
            zIndex: plan.popular ? 10 : 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                MÁS POPULAR
              </div>
            )}
            
            <h3 style={{ fontSize: '1.5rem', color: plan.color, marginBottom: '0.5rem' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>{plan.price}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>/{plan.period}</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                  <div style={{ background: `rgba(${parseInt(plan.color.slice(1,3), 16)}, ${parseInt(plan.color.slice(3,5), 16)}, ${parseInt(plan.color.slice(5,7), 16)}, 0.2)`, borderRadius: '50%', padding: '2px', color: plan.color, marginTop: '2px' }}>
                    <Check size={14} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              border: 'none', 
              background: plan.popular ? plan.color : 'rgba(255,255,255,0.05)', 
              color: '#fff', 
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              Editar Plan
            </button>
          </div>
        ))}
      </div>

      {/* Historial de Membresías Asignadas */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Membresías Asignadas (Control de Estados)</h3>
        <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>SOCIO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PLAN</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>VIGENCIA</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {membresiasAsignadas.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{m.socio}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>{m.plan}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    {m.startDate} - {m.endDate}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: '600',
                      background: m.status === 'Activa' || m.status === 'Renovada' ? 'rgba(34, 197, 94, 0.15)' : m.status === 'Vencida' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: m.status === 'Activa' || m.status === 'Renovada' ? '#4ade80' : m.status === 'Vencida' ? '#f87171' : '#facc15'
                    }}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
