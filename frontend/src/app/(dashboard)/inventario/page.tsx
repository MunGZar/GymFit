'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Package, Search, Plus, Wrench, AlertTriangle, CheckCircle, Barcode, X } from 'lucide-react';
import { equiposApi, Equipo, mantenimientoApi } from '@/lib/api';

export default function InventarioPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Nuevo Equipo
  const [showNewModal, setShowNewModal] = useState(false);
  const [newEquipo, setNewEquipo] = useState({
    nombre: '',
    codigo_barras: '',
    tipo: 'Fuerza',
    estado: 'Operativo'
  });

  // Modal Mantenimiento
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [maintData, setMaintData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await equiposApi.findAll();
      setEquipos(data);
    } catch (error) {
      console.error('Error fetching equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await equiposApi.create({
        nombre: newEquipo.nombre,
        codigo_barras: newEquipo.codigo_barras,
        tipo: newEquipo.tipo,
        estado: newEquipo.estado,
        cantidad: 1
      });
      setShowNewModal(false);
      setNewEquipo({ nombre: '', codigo_barras: '', tipo: 'Fuerza', estado: 'Operativo' });
      fetchData();
    } catch (error) {
      console.error('Error creating equipo:', error);
      alert('Error al crear equipo');
    }
  };

  const handleCreateMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipo) return;
    try {
      await mantenimientoApi.create({
        id_equipo: selectedEquipo.id_equipo,
        fecha: maintData.fecha,
        descripcion: maintData.descripcion
      });
      // Optionally update status to 'Operativo' or 'En Mantenimiento'
      // If it was broken, maybe it's fixed now? But let's leave it simple.
      setShowMaintModal(false);
      setSelectedEquipo(null);
      setMaintData({ fecha: new Date().toISOString().split('T')[0], descripcion: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating mantenimiento:', error);
      alert('Error al registrar mantenimiento');
    }
  };

  const handleUpdateEstado = async (id: number, estado: string) => {
    try {
      await equiposApi.update(id, { estado });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Package size={24} color="#feca57" />
            Gestión de Inventario y Equipos
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Registra nuevos equipos, programa mantenimientos o da de baja material.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
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
          Nuevo Equipo
        </button>
      </div>

      {/* Alertas Fuera de Servicio (HU-19) */}
      {equipos.some(eq => eq.estado === 'Fuera de Servicio') && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <AlertTriangle size={24} color="#ef4444" />
          <div>
            <h4 style={{ color: '#ef4444', margin: 0, fontWeight: '700' }}>¡ALERTA DE SEGURIDAD!</h4>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: '5px 0 0 0', opacity: 0.8 }}>
              Hay equipos marcados como <b>Fuera de Servicio</b>. Por favor, asegúrese de que estén inhabilitados para evitar accidentes.
            </p>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--table-border)', background: 'var(--table-header-bg)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>EQUIPO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>ID / CÓDIGO BARRAS</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO OPERATIVO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>ÚLTIMO MANTENIMIENTO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando equipos...</td>
              </tr>
            ) : equipos.map(eq => {
              const ultMaint = eq.mantenimientos && eq.mantenimientos.length > 0
                ? eq.mantenimientos[eq.mantenimientos.length - 1].fecha
                : 'Sin registros';

              return (
                <tr key={eq.id_equipo} style={{ borderBottom: '1px solid var(--table-row-border)', transition: 'background 0.2s ease', background: eq.estado === 'Fuera de Servicio' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>{eq.nombre}</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{eq.tipo}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {eq.codigo_barras ? (
                      <><Barcode size={16} /> {eq.codigo_barras}</>
                    ) : (
                      <span style={{ color: 'var(--text-faint)' }}>Sin código</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: eq.estado === 'Operativo' || eq.estado === 'disponible' ? 'rgba(34, 197, 94, 0.15)' : eq.estado === 'En Mantenimiento' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: eq.estado === 'Operativo' || eq.estado === 'disponible' ? '#4ade80' : eq.estado === 'En Mantenimiento' ? '#facc15' : '#f87171'
                    }}>
                      {eq.estado === 'Operativo' || eq.estado === 'disponible' ? <CheckCircle size={14} /> : eq.estado === 'En Mantenimiento' ? <Wrench size={14} /> : <AlertTriangle size={14} />}
                      {eq.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-main)', fontSize: '0.9rem', opacity: 0.8 }}>
                    {ultMaint}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => { setSelectedEquipo(eq); setShowMaintModal(true); }}
                        title="Registrar Mantenimiento"
                        style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #facc15', color: '#facc15', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Wrench size={16} />
                      </button>
                      {eq.estado !== 'Fuera de Servicio' ? (
                        <button
                          onClick={() => handleUpdateEstado(eq.id_equipo, 'Fuera de Servicio')}
                          title="Dar de Baja (Marcar Fuera de Servicio)"
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #f87171', color: '#f87171', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <AlertTriangle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateEstado(eq.id_equipo, 'Operativo')}
                          title="Marcar como Operativo"
                          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #4ade80', color: '#4ade80', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Equipo */}
      {showNewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Catalogar Equipo Nuevo</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleCreateEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nombre del Equipo/Máquina</label>
                <input
                  type="text"
                  value={newEquipo.nombre}
                  onChange={e => setNewEquipo({ ...newEquipo, nombre: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID Único / Código de Barras </label>
                <input
                  type="text"
                  value={newEquipo.codigo_barras}
                  onChange={e => setNewEquipo({ ...newEquipo, codigo_barras: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Categoría</label>
                <select
                  value={newEquipo.tipo}
                  onChange={e => setNewEquipo({ ...newEquipo, tipo: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                >
                  <option value="Fuerza">Fuerza / Pesas</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Funcional">Funcional / Accesorios</option>
                </select>
              </div>

              <button type="submit" style={{ background: 'var(--primary)', color: 'var(--btn-gradient-text)', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
                Guardar Equipo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mantenimiento (HU-19) */}
      {showMaintModal && selectedEquipo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Registrar Mantenimiento</h3>
              <button onClick={() => setShowMaintModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleCreateMantenimiento} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Equipo: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedEquipo.nombre}</span></p>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fecha del Mantenimiento</label>
                <input
                  type="date"
                  value={maintData.fecha}
                  onChange={e => setMaintData({ ...maintData, fecha: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bitácora / Detalles de Reparación</label>
                <textarea
                  value={maintData.descripcion}
                  onChange={e => setMaintData({ ...maintData, descripcion: e.target.value })}
                  required
                  rows={4}
                  placeholder="Ej: Cambio de banda, engrase de poleas, revisión de motor..."
                  style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button type="submit" style={{ background: '#facc15', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
                Guardar Bitácora
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
