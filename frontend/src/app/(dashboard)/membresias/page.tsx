"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { CreditCard, Plus, RefreshCw } from 'lucide-react';
import { membresiasApi, planesApi, sociosApi, authApi, type Membresia, type Plan, type SocioCompleto } from '@/lib/api';

export default function MembresiasPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [socios, setSocios] = useState<SocioCompleto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);

  const [modalPlan, setModalPlan] = useState(false);
  const [nuevoPlan, setNuevoPlan] = useState({ nombre: '', descripcion: '', precio: '', duracion_meses: '1' });
  const [registrandoPlan, setRegistrandoPlan] = useState(false);

  const [modalMembresia, setModalMembresia] = useState(false);
  const [nuevaMem, setNuevaMem] = useState({ id_socio: '', id_plan: '', fecha_inicio: new Date().toISOString().split('T')[0] });
  const [registrandoMem, setRegistrandoMem] = useState(false);

  const calcularFechaFin = (fechaInicio: string, duracionMeses: number) => {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + duracionMeses);
    return fecha.toISOString().split('T')[0];
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const user = authApi.getUsuarioLocal();
      setEsAdmin(user?.rol === 'admin');

      const [dataPlanes, dataMembresias, dataSocios] = await Promise.all([
        planesApi.findAll(),
        membresiasApi.findAll(),
        sociosApi.findAll()
      ]);
      setPlanes(dataPlanes);
      setMembresias(dataMembresias);
      setSocios(dataSocios.filter(s => s.usuario?.estado));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleCrearPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrandoPlan(true);
    try {
      if ((nuevoPlan as any).id_plan) {
        // Actualizar plan existente
        await planesApi.update((nuevoPlan as any).id_plan, {
          nombre: nuevoPlan.nombre,
          descripcion: nuevoPlan.descripcion,
          precio: parseFloat(nuevoPlan.precio),
          duracion_meses: parseInt(nuevoPlan.duracion_meses),
          activo: true
        });
        alert('Plan actualizado correctamente');
      } else {
        // Crear nuevo plan
        await planesApi.create({
          nombre: nuevoPlan.nombre,
          descripcion: nuevoPlan.descripcion,
          precio: parseFloat(nuevoPlan.precio),
          duracion_meses: parseInt(nuevoPlan.duracion_meses)
        });
        alert('Plan creado correctamente');
      }
      setModalPlan(false);
      setNuevoPlan({ nombre: '', descripcion: '', precio: '', duracion_meses: '1' });
      cargarDatos();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrandoPlan(false);
    }
  };

  const handleEliminarPlan = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este plan? Esto podría afectar reportes de membresías pasadas.')) return;
    try {
      await planesApi.remove(id);
      cargarDatos();
      alert('Plan eliminado correctamente');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const abrirModalEditarPlan = (plan: Plan) => {
    setNuevoPlan({
      ...plan,
      precio: plan.precio.toString(),
      duracion_meses: plan.duracion_meses.toString(),
      descripcion: plan.descripcion || ''
    } as any);
    setModalPlan(true);
  };

  const handleAsignarMembresia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaMem.id_socio || !nuevaMem.id_plan) return;
    setRegistrandoMem(true);
    try {
      const planSelec = planes.find(p => p.id_plan === parseInt(nuevaMem.id_plan));
      if (!planSelec) throw new Error('Plan inválido');
      
      const fechaFin = calcularFechaFin(nuevaMem.fecha_inicio, planSelec.duracion_meses);
      
      await membresiasApi.create({
        id_socio: parseInt(nuevaMem.id_socio),
        id_plan: parseInt(nuevaMem.id_plan),
        fecha_inicio: nuevaMem.fecha_inicio,
        fecha_fin: fechaFin
      });
      setModalMembresia(false);
      setNuevaMem({ id_socio: '', id_plan: '', fecha_inicio: new Date().toISOString().split('T')[0] });
      cargarDatos();
      alert('Membresía asignada correctamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrandoMem(false);
    }
  };

  const handleCambiarEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activa' ? 'cancelada' : 'activa';
    if (!confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;
    try {
      await membresiasApi.updateStatus(id, nuevoEstado);
      cargarDatos();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <CreditCard size={24} color="var(--purple)" />
            Control de Membresías
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Administra los planes disponibles y las membresías asignadas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cargarDatos} style={{ background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--btn-secondary-text)', cursor:'pointer' }}>
            <RefreshCw size={20} className={cargando ? styles.spin : ''} />
          </button>
          {esAdmin && (
            <button onClick={() => { setNuevoPlan({ nombre: '', descripcion: '', precio: '', duracion_meses: '1' } as any); setModalPlan(true); }} style={{ background: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Plus size={20} /> Crear Plan
            </button>
          )}
          <button onClick={() => setModalMembresia(true)} style={{ background: 'linear-gradient(135deg, var(--purple), var(--secondary))', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(168, 85, 247, 0.2)' }}>
            <Plus size={20} /> Asignar Membresía
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', padding:'1rem', borderRadius:'12px', marginBottom:'1.5rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Planes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {planes.filter(p => p.activo !== false).map((plan, index) => {
          const colors = ['#06b6d4', '#a855f7', '#3b82f6', '#ec4899'];
          const color = colors[index % colors.length];
          return (
            <div key={plan.id_plan} className="glass" style={{ padding: '2.5rem 2rem', borderRadius: '24px', border: `1px solid var(--surface-border)`, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {esAdmin && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => abrirModalEditarPlan(plan)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>✎</button>
                  <button onClick={() => handleEliminarPlan(plan.id_plan)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '5px' }}>✖</button>
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', color: color, marginBottom: '0.5rem' }}>{plan.nombre}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>${Number(plan.precio).toLocaleString('es-CO')}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>/ {plan.duracion_meses} mes(es)</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', flex: 1 }}>{plan.descripcion || 'Sin descripción.'}</p>
            </div>
          );
        })}
      </div>

      {/* Tabla Membresías Asignadas */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Membresías Asignadas</h3>
        <div className="glass" style={{ padding: '0', borderRadius: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--table-border)', background: 'var(--table-header-bg)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>SOCIO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>PLAN</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>VIGENCIA</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--table-header-text)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {membresias.map(m => (
                <tr key={m.id_membresia} style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{m.socio?.usuario?.nombre || 'Socio'}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                    {m.plan?.nombre || 'Plan'} 
                    {m.plan?.activo === false && <span style={{color: '#f87171', fontSize: '0.8rem'}}> (Eliminado)</span>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-faint)' }}>
                    {m.fecha_inicio} al {m.fecha_fin}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      background: m.estado === 'activa' || m.estado === 'renovada' ? 'rgba(34, 197, 94, 0.15)' : m.estado === 'vencida' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: m.estado === 'activa' || m.estado === 'renovada' ? '#4ade80' : m.estado === 'vencida' ? '#f87171' : '#facc15'
                    }}>
                      {m.estado.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {esAdmin && (
                      <button onClick={() => handleCambiarEstado(m.id_membresia, m.estado)} style={{ background:'transparent', border:'1px solid var(--btn-secondary-border)', color:'var(--text-main)', padding:'0.4rem 0.8rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.75rem' }}>
                        {m.estado === 'activa' ? 'Cancelar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {membresias.length === 0 && (
                <tr><td colSpan={5} style={{ padding:'2rem', textAlign:'center', color:'var(--text-faint)' }}>No hay membresías asignadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Plan */}
      {modalPlan && (
        <div style={{ position:'fixed', inset:0, background:'var(--modal-overlay)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalPlan(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>{(nuevoPlan as any).id_plan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h3>
            <form onSubmit={handleCrearPlan} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Nombre del Plan *</label>
                <input required type="text" value={nuevoPlan.nombre} onChange={e=>setNuevoPlan({...nuevoPlan, nombre: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Descripción</label>
                <input type="text" value={nuevoPlan.descripcion} onChange={e=>setNuevoPlan({...nuevoPlan, descripcion: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Precio ($) *</label>
                  <input required type="number" min="0" step="0.01" value={nuevoPlan.precio} onChange={e=>setNuevoPlan({...nuevoPlan, precio: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Duración (meses) *</label>
                  <input required type="number" min="1" value={nuevoPlan.duracion_meses} onChange={e=>setNuevoPlan({...nuevoPlan, duracion_meses: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalPlan(false)} style={{ flex:1, background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', color:'var(--btn-secondary-text)', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={registrandoPlan} style={{ flex:1, background:'var(--primary)', border:'none', color:'#000', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:registrandoPlan?0.5:1 }}>Guardar Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Membresía */}
      {modalMembresia && (
        <div style={{ position:'fixed', inset:0, background:'var(--modal-overlay)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalMembresia(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Asignar Membresía</h3>
            <form onSubmit={handleAsignarMembresia} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Seleccionar Socio *</label>
                <select required value={nuevaMem.id_socio} onChange={e=>setNuevaMem({...nuevaMem, id_socio: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }}>
                  <option value="">Seleccione...</option>
                  {socios.map(s => <option key={s.id_socio} value={s.id_socio}>{s.usuario.nombre} ({s.usuario.identificacion})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Seleccionar Plan *</label>
                <select required value={nuevaMem.id_plan} onChange={e=>setNuevaMem({...nuevaMem, id_plan: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }}>
                  <option value="">Seleccione...</option>
                  {planes.filter(p => p.activo !== false).map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre} - ${p.precio}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'8px' }}>Fecha de Inicio *</label>
                <input required type="date" value={nuevaMem.fecha_inicio} onChange={e=>setNuevaMem({...nuevaMem, fecha_inicio: e.target.value})} style={{ width:'100%', background:'var(--surface-input)', border:'1px solid var(--surface-border)', padding:'0.8rem', borderRadius:'10px', color:'var(--text-main)', outline:'none' }} />
              </div>
              
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalMembresia(false)} style={{ flex:1, background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', color:'var(--btn-secondary-text)', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={registrandoMem} style={{ flex:1, background:'var(--purple)', border:'none', color:'#fff', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:registrandoMem?0.5:1 }}>Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
