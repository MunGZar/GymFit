import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Shield, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function PersonalPage() {
  const staff = [
    { id: 1, name: 'Admin Principal', email: 'admin@gymfit.com', role: 'Administrador', status: 'Activo', initials: 'AP', avatarClass: styles.avatarPurple },
    { id: 2, name: 'Laura Gómez', email: 'laura.recepcion@gymfit.com', role: 'Recepcionista', status: 'Activo', initials: 'LG', avatarClass: styles.avatarCyan },
    { id: 3, name: 'Roberto Carlos', email: 'roberto.entrenador@gymfit.com', role: 'Entrenador', status: 'Activo', initials: 'RC', avatarClass: styles.avatarBlue },
    { id: 4, name: 'Sofía Reyes', email: 'sofia.entrenador@gymfit.com', role: 'Entrenador', status: 'Inactivo', initials: 'SR', avatarClass: styles.avatarBlue },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Shield size={24} color="var(--primary)" />
            Gestión de Personal / Usuarios
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Administra los roles y accesos del equipo de trabajo.
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
          Nuevo Usuario
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
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
          <option value="">Todos los Roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Recepcionista">Recepcionista</option>
          <option value="Entrenador">Entrenador</option>
        </select>
      </div>

      {/* Table Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>USUARIO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ROL</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className={styles.memberInfo}>
                    <div className={`${styles.memberAvatar} ${user.avatarClass}`}>{user.initials}</div>
                    <div>
                      <p className={styles.memberName}>{user.name}</p>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`${styles.tag} ${user.role === 'Administrador' ? styles.tagPurple : user.role === 'Entrenador' ? styles.tagBlue : styles.tagCyan}`}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: user.status === 'Activo' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: user.status === 'Activo' ? '#4ade80' : '#f87171'
                  }}>
                    {user.status}
                  </span>
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
