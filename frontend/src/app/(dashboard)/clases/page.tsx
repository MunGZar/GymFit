import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

export default function ClasesPage() {
  const classesToday = [
    { time: '06:00 AM', name: 'Spinning Intense', trainer: 'María T.', room: 'Sala 1', capacity: '20/25', color: '#ef4444' },
    { time: '08:00 AM', name: 'Yoga Vinyasa', trainer: 'Luis R.', room: 'Zen Room', capacity: '12/15', color: '#10b981' },
    { time: '10:00 AM', name: 'CrossFit WOD', trainer: 'Carlos M.', room: 'Box Central', capacity: '18/20', color: '#f59e0b' },
    { time: '05:00 PM', name: 'Zumba Master', trainer: 'Ana G.', room: 'Sala 2', capacity: '28/30', color: '#8b5cf6' },
    { time: '07:00 PM', name: 'Funcional', trainer: 'Carlos M.', room: 'Área Libre', capacity: '15/20', color: '#3b82f6' },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Calendar size={24} color="#ff6b6b" />
            Calendario de Clases
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Clases programadas para el día de hoy.
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
          Agendar Clase
        </button>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {classesToday.map((cls, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1.5rem', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `4px solid ${cls.color}`,
              gap: '2rem'
            }}>
              <div style={{ minWidth: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{cls.time}</span>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>{cls.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Instructor: {cls.trainer}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', minWidth: '120px' }}>
                <MapPin size={16} color={cls.color} />
                <span style={{ fontSize: '0.9rem' }}>{cls.room}</span>
              </div>

              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {cls.capacity}
                </span>
              </div>
              
              <div>
                <button style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  background: 'transparent', 
                  color: '#fff', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
