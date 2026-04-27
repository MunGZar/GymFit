import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Users, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SociosPage() {
  const socios = [
    { id: 1, name: 'Carlos Mendoza', email: 'carlos.m@example.com', status: 'Activo', plan: 'Premium', joinDate: '2023-11-15', avatarClass: styles.avatarPurple, initials: 'CM' },
    { id: 2, name: 'Ana García', email: 'ana.g@example.com', status: 'Inactivo', plan: 'Básico', joinDate: '2024-01-10', avatarClass: styles.avatarCyan, initials: 'AG' },
    { id: 3, name: 'Luis Ramírez', email: 'luis.r@example.com', status: 'Activo', plan: 'VIP', joinDate: '2023-08-22', avatarClass: styles.avatarBlue, initials: 'LR' },
    { id: 4, name: 'María Torres', email: 'maria.t@example.com', status: 'Activo', plan: 'Premium', joinDate: '2024-02-05', avatarClass: styles.avatarPurple, initials: 'MT' },
    { id: 5, name: 'David Silva', email: 'david.s@example.com', status: 'Pendiente', plan: 'Básico', joinDate: '2024-04-18', avatarClass: styles.avatarCyan, initials: 'DS' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Users size={24} color="var(--primary)" />
            Gestión de Socios
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Administra los perfiles y estados de los miembros del gimnasio.
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
          Nuevo Socio
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o ID..." 
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
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Table/List Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>SOCIO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PLAN</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>FECHA INGRESO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {socios.map(socio => (
              <tr key={socio.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className={styles.memberInfo}>
                    <div className={`${styles.memberAvatar} ${socio.avatarClass}`}>{socio.initials}</div>
                    <div>
                      <p className={styles.memberName}>{socio.name}</p>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{socio.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`${styles.tag} ${socio.plan === 'VIP' ? styles.tagBlue : socio.plan === 'Premium' ? styles.tagPurple : styles.tagCyan}`}>
                    {socio.plan}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: socio.status === 'Activo' ? 'rgba(34, 197, 94, 0.15)' : socio.status === 'Inactivo' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: socio.status === 'Activo' ? '#4ade80' : socio.status === 'Inactivo' ? '#f87171' : '#facc15'
                  }}>
                    {socio.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  {socio.joinDate}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginRight: '10px' }}><Edit2 size={16} /></button>
                  <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
