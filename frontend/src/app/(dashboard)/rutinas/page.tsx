import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { ClipboardList, Plus, Search, Dumbbell, Send, Edit2 } from 'lucide-react';

export default function RutinasPage() {
  const rutinas = [
    { id: 1, name: 'Hipertrofia Principiantes', level: 'Básico', duration: '4 Semanas', category: 'Fuerza', assignees: 12 },
    { id: 2, name: 'Pérdida de Peso Express', level: 'Intermedio', duration: '6 Semanas', category: 'Cardio', assignees: 8 },
    { id: 3, name: 'Fuerza Máxima (Powerlifting)', level: 'Avanzado', duration: '8 Semanas', category: 'Fuerza', assignees: 3 },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <ClipboardList size={24} color="var(--primary)" />
            Gestión de Rutinas
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Crea planes de entrenamiento y asígnalos a tus socios.
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
          Crear Rutina
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar rutina..." 
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
          <option value="">Nivel</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>

      {/* Grid Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {rutinas.map(rutina => (
          <div key={rutina.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 242, 255, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
                  <Dumbbell size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{rutina.name}</h3>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'rgba(255,255,255,0.7)' }}>
                {rutina.level}
              </span>
              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'rgba(255,255,255,0.7)' }}>
                {rutina.duration}
              </span>
              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'rgba(255,255,255,0.7)' }}>
                {rutina.category}
              </span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                Asignada a {rutina.assignees} socios
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button title="Editar Rutina" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={16} />
                </button>
                <button title="Asignar a Socio" style={{ background: 'rgba(0, 242, 255, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
