import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { UserPlus, Search, Plus, UserCheck } from 'lucide-react';

export default function ProspectosPage() {
  const prospectos = [
    { id: 1, name: 'Andrés López', phone: '555-0101', interest: 'Musculación', origin: 'Instagram', status: 'Pendiente', initials: 'AL', avatarClass: styles.avatarCyan },
    { id: 2, name: 'Carla Ruiz', phone: '555-0102', interest: 'Clases Grupales', origin: 'Referido', status: 'Contactado', initials: 'CR', avatarClass: styles.avatarPurple },
    { id: 3, name: 'Miguel Ángel', phone: '555-0103', interest: 'Pérdida de peso', origin: 'Presencial', status: 'Convertido', initials: 'MA', avatarClass: styles.avatarBlue },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <UserPlus size={24} color="var(--primary)" />
            Gestión de Prospectos
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Haz seguimiento a posibles nuevos clientes y conviértelos en socios.
          </p>
        </div>
        
        <button style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          color: '#000', 
          border: 'none', 
          padding: '0.8rem 1.5rem', 
          borderRadius: '12px', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)'
        }}>
          <Plus size={20} />
          Nuevo Prospecto
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            style={{ 
              width: '100%', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: '10px', 
              color: '#fff',
              outline: 'none'
            }} 
          />
        </div>
        <select style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
          <option value="">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Contactado">Contactado</option>
          <option value="Convertido">Convertido</option>
        </select>
      </div>

      {/* Table Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PROSPECTO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>INTERÉS</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ORIGEN</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {prospectos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className={styles.memberInfo}>
                    <div className={`${styles.memberAvatar} ${p.avatarClass}`}>{p.initials}</div>
                    <div>
                      <p className={styles.memberName}>{p.name}</p>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{p.phone}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  {p.interest}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{p.origin}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: p.status === 'Convertido' ? 'rgba(34, 197, 94, 0.15)' : p.status === 'Pendiente' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: p.status === 'Convertido' ? '#4ade80' : p.status === 'Pendiente' ? '#f87171' : '#facc15'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  {p.status !== 'Convertido' && (
                    <button style={{ 
                      background: 'rgba(0, 242, 255, 0.1)', 
                      border: '1px solid var(--primary)', 
                      color: '#fff', 
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.85rem'
                    }}>
                      <UserCheck size={16} /> Convertir a Socio
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
