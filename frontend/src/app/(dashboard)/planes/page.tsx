'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { CreditCard, Edit, Trash2, Plus, X } from 'lucide-react';
import { planesApi, type Plan } from '@/lib/api';

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    duracion_meses: '1'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await planesApi.findAll();
      setPlanes(data);
    } catch (error) {
      console.error('Error fetching planes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewModal = () => {
    setEditingPlan(null);
    setFormData({ nombre: '', precio: '', descripcion: '', duracion_meses: '1' });
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      nombre: plan.nombre,
      precio: plan.precio.toString(),
      descripcion: plan.descripcion || '',
      duracion_meses: plan.duracion_meses.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta membresía/plan? Esta acción puede afectar a los socios inscritos en él.')) return;
    try {
      await planesApi.remove(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error eliminando el plan: ' + (error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        duracion_meses: parseInt(formData.duracion_meses, 10)
      };

      if (editingPlan) {
        await planesApi.update(editingPlan.id_plan, payload);
      } else {
        await planesApi.create(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error guardando el plan: ' + (error as Error).message);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <CreditCard size={24} color="#feca57" />
            Gestión de Membresías (Planes)
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Configura y administra los planes que ofreces a los socios.
          </p>
        </div>
        
        <button 
          onClick={openNewModal}
          style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            color: 'var(--btn-gradient-text)', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '12px', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 5px 15px var(--alert-glow)'
          }}>
          <Plus size={20} />
          Nuevo Plan
        </button>
      </div>

      {/* Grid de Planes */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Cargando planes...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {planes.map(plan => (
            <div key={plan.id_plan} className="glass" style={{ 
              borderRadius: '16px', 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              borderTop: `4px solid var(--primary)`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>{plan.nombre}</h3>
                <span style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  color: '#4ade80', 
                  padding: '4px 8px', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600 
                }}>
                  {plan.duracion_meses} Mes{plan.duracion_meses > 1 ? 'es' : ''}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px' }}>
                {plan.descripcion || 'Sin descripción'}
              </p>
              <h2 style={{ fontSize: '2rem', margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                ${Number(plan.precio).toLocaleString('es-CO')}
              </h2>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => openEditModal(plan)}
                  style={{ flex: 1, background: 'var(--subtle-bg)', border: 'none', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}
                >
                  <Edit size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(plan.id_plan)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.8rem', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>{editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nombre de la Membresía</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ej: Básico, Premium, VIP..."
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Precio (COP)</label>
                <input 
                  type="number" 
                  value={formData.precio}
                  onChange={e => setFormData({...formData, precio: e.target.value})}
                  required
                  placeholder="Ej: 50000"
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Duración (Meses)</label>
                <input 
                  type="number" 
                  value={formData.duracion_meses}
                  onChange={e => setFormData({...formData, duracion_meses: e.target.value})}
                  required
                  min="1"
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Descripción / Beneficios</label>
                <textarea 
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  placeholder="Ej: Acceso a todas las zonas, incluye spa."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button type="submit" style={{ background: 'var(--primary)', color: 'var(--btn-gradient-text)', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
