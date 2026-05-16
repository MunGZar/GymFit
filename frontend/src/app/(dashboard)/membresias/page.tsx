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
      await planesApi.create({
        nombre: nuevoPlan.nombre,
        descripcion: nuevoPlan.descripcion,
        precio: parseFloat(nuevoPlan.precio),
        duracion_meses: parseInt(nuevoPlan.duracion_meses)
      });
      setModalPlan(false);
      setNuevoPlan({ nombre: '', descripcion: '', precio: '', duracion_meses: '1' });
      cargarDatos();
      alert('Plan creado correctamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrandoPlan(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <CreditCard size={24} color="var(--purple)" />
            Control de Membresías
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Administra los planes disponibles y las membresías asignadas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cargarDatos} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', cursor:'pointer' }}>
            <RefreshCw size={20} className={cargando ? styles.spin : ''} />
          </button>
          {esAdmin && (
            <button onClick={() => setModalPlan(true)} style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
        {planes.map((plan, index) => {
          const colors = ['#06b6d4', '#a855f7', '#3b82f6', '#ec4899'];
          const color = colors[index % colors.length];
          return (
            <div key={plan.id_plan} className="glass" style={{ padding: '2.5rem 2rem', borderRadius: '24px', border: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', color: color, marginBottom: '0.5rem' }}>{plan.nombre}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>${plan.precio}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>/ {plan.duracion_meses} mes(es)</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.9rem', flex: 1 }}>{plan.descripcion || 'Sin descripción.'}</p>
            </div>
          );
        })}
      </div>

      {/* Tabla Membresías Asignadas */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Membresías Asignadas</h3>
        <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>SOCIO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PLAN</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>VIGENCIA</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {membresias.map(m => (
                <tr key={m.id_membresia} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{m.socio?.usuario?.nombre || 'Socio'}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>{m.plan?.nombre || 'Plan'}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
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
                      <button onClick={() => handleCambiarEstado(m.id_membresia, m.estado)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'0.4rem 0.8rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.75rem' }}>
                        {m.estado === 'activa' ? 'Cancelar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {membresias.length === 0 && (
                <tr><td colSpan={5} style={{ padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>No hay membresías asignadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Plan */}
      {modalPlan && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalPlan(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Crear Nuevo Plan</h3>
            <form onSubmit={handleCrearPlan} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Nombre del Plan *</label>
                <input required type="text" value={nuevoPlan.nombre} onChange={e=>setNuevoPlan({...nuevoPlan, nombre: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Descripción</label>
                <input type="text" value={nuevoPlan.descripcion} onChange={e=>setNuevoPlan({...nuevoPlan, descripcion: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Precio ($) *</label>
                  <input required type="number" min="0" step="0.01" value={nuevoPlan.precio} onChange={e=>setNuevoPlan({...nuevoPlan, precio: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Duración (meses) *</label>
                  <input required type="number" min="1" value={nuevoPlan.duracion_meses} onChange={e=>setNuevoPlan({...nuevoPlan, duracion_meses: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalPlan(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={registrandoPlan} style={{ flex:1, background:'var(--primary)', border:'none', color:'#000', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:registrandoPlan?0.5:1 }}>Guardar Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Membresía */}
      {modalMembresia && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalMembresia(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Asignar Membresía</h3>
            <form onSubmit={handleAsignarMembresia} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Seleccionar Socio *</label>
                <select required value={nuevaMem.id_socio} onChange={e=>setNuevaMem({...nuevaMem, id_socio: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }}>
                  <option value="">Seleccione...</option>
                  {socios.map(s => <option key={s.id_socio} value={s.id_socio}>{s.usuario.nombre} ({s.usuario.identificacion})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Seleccionar Plan *</label>
                <select required value={nuevaMem.id_plan} onChange={e=>setNuevaMem({...nuevaMem, id_plan: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }}>
                  <option value="">Seleccione...</option>
                  {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre} - ${p.precio}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Fecha de Inicio *</label>
                <input required type="date" value={nuevaMem.fecha_inicio} onChange={e=>setNuevaMem({...nuevaMem, fecha_inicio: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalMembresia(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
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
