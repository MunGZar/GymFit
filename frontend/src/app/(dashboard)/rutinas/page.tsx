"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { ClipboardList, Plus, Search, Dumbbell, Send, Edit2, RefreshCw, X } from 'lucide-react';
import { rutinasApi, sociosApi, type Rutina, type SocioCompleto } from '@/lib/api';
import { authApi } from '@/lib/api';

export default function RutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [socios, setSocios] = useState<SocioCompleto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [nivelFiltro, setNivelFiltro] = useState('');

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  
  // Forms
  const [formRutina, setFormRutina] = useState({ nombre: '', descripcion: '', nivel: 'Básico', objetivo: '' });
  const [formAsignar, setFormAsignar] = useState({ id_rutina: '', id_socio: '', fecha: new Date().toISOString().split('T')[0] });
  const [formLoading, setFormLoading] = useState(false);

  const userLocal = authApi.getUsuarioLocal();
  const canCreate = userLocal?.rol?.toLowerCase() === 'admin' || userLocal?.rol?.toLowerCase() === 'entrenador';

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [r, s] = await Promise.all([
        rutinasApi.findAll(),
        sociosApi.findAll()
      ]);
      setRutinas(r);
      setSocios(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleCrearRutina = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await rutinasApi.create(formRutina);
      setModalCrear(false);
      setFormRutina({ nombre: '', descripcion: '', nivel: 'Básico', objetivo: '' });
      cargarDatos();
      alert('Rutina creada con éxito');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAsignarRutina = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await rutinasApi.asignar({
        id_rutina: Number(formAsignar.id_rutina),
        id_socio: Number(formAsignar.id_socio),
        fecha_asignacion: formAsignar.fecha
      });
      setModalAsignar(false);
      cargarDatos();
      alert('Rutina asignada correctamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredRutinas = rutinas.filter(r => 
    (r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (r.descripcion?.toLowerCase().includes(busqueda.toLowerCase()))) &&
    (nivelFiltro === '' || r.nivel === nivelFiltro)
  );

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <ClipboardList size={24} color="var(--primary)" /> Gestión de Rutinas
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Crea planes de entrenamiento y asígnalos a tus socios.</p>
        </div>
        
        {canCreate && (
          <button 
            onClick={() => setModalCrear(true)}
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Plus size={20} /> Crear Rutina
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar rutina..." 
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} 
          />
        </div>
        <select 
          value={nivelFiltro}
          onChange={e => setNivelFiltro(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none' }}
        >
          <option value="">Todos los niveles</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
        <button onClick={cargarDatos} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.7rem', borderRadius:'10px', color:'#fff', cursor:'pointer' }}>
          <RefreshCw size={18} className={cargando ? styles.spin : ''} />
        </button>
      </div>

      {cargando ? (
        <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>Cargando rutinas...</div>
      ) : filteredRutinas.length === 0 ? (
        <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>No se encontraron rutinas.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredRutinas.map(rutina => (
            <div key={rutina.id_rutina} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 242, 255, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{rutina.nombre}</h3>
                  <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)' }}>{rutina.nivel}</span>
                </div>
              </div>
              
              <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.7)', minHeight:'40px' }}>{rutina.descripcion || 'Sin descripción.'}</p>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>HU-11: Diseño Modular</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => { setFormAsignar({...formAsignar, id_rutina: String(rutina.id_rutina)}); setModalAsignar(true); }}
                    title="Asignar a Socio" 
                    style={{ background: 'rgba(0, 242, 255, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap:'5px', fontSize:'0.8rem', fontWeight:600 }}
                  >
                    <Send size={14} /> Asignar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear */}
      {modalCrear && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalCrear(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'500px', borderRadius:'20px', padding:'2.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontSize:'1.2rem', fontWeight:700 }}>Nueva Rutina</h3>
              <button onClick={() => setModalCrear(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleCrearRutina} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Nombre de la Rutina *</label>
                <input required value={formRutina.nombre} onChange={e=>setFormRutina({...formRutina, nombre:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }} placeholder="Ej: Full Body A" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Descripción</label>
                <textarea rows={3} value={formRutina.descripcion} onChange={e=>setFormRutina({...formRutina, descripcion:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', resize:'none' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Nivel</label>
                  <select value={formRutina.nivel} onChange={e=>setFormRutina({...formRutina, nivel:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }}>
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Objetivo</label>
                  <input value={formRutina.objetivo} onChange={e=>setFormRutina({...formRutina, objetivo:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }} placeholder="Ej: Fuerza" />
                </div>
              </div>
              <button disabled={formLoading} type="submit" style={{ marginTop:'1rem', background:'var(--primary)', color:'#000', padding:'1rem', borderRadius:'12px', border:'none', fontWeight:700, cursor:'pointer', opacity:formLoading?0.6:1 }}>
                {formLoading ? 'Guardando...' : 'Crear Rutina'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar */}
      {modalAsignar && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalAsignar(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem' }}>Asignar Rutina a Socio</h3>
            <form onSubmit={handleAsignarRutina} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Seleccionar Socio *</label>
                <select required value={formAsignar.id_socio} onChange={e=>setFormAsignar({...formAsignar, id_socio:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }}>
                  <option value="">Selecciona un socio...</option>
                  {socios.map(s => (
                    <option key={s.id_socio} value={s.id_socio}>{s.usuario.nombre} ({s.usuario.identificacion})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Fecha de Asignación</label>
                <input type="date" value={formAsignar.fecha} onChange={e=>setFormAsignar({...formAsignar, fecha:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalAsignar(false)} style={{ flex:1, padding:'0.8rem', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }}>Cancelar</button>
                <button disabled={formLoading || !formAsignar.id_socio} type="submit" style={{ flex:1, background:'var(--primary)', color:'#000', padding:'0.8rem', borderRadius:'10px', border:'none', fontWeight:700, cursor:'pointer' }}>
                  {formLoading ? 'Asignando...' : 'Confirmar'}
                </button>
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
