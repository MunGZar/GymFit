"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { UserPlus, Search, Plus, UserCheck, RefreshCw } from 'lucide-react';
import { prospectosApi, type Prospecto } from '@/lib/api';

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [error, setError] = useState('');
  
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoProps, setNuevoProps] = useState({ nombre: '', telefono: '', interes: '', origen: '' });
  
  const [modalConvertir, setModalConvertir] = useState(false);
  const [prospectoSel, setProspectoSel] = useState<Prospecto | null>(null);
  const [convertirProps, setConvertirProps] = useState({ identificacion: '', correo: '', password: '' });
  
  const [registrando, setRegistrando] = useState(false);

  const cargarProspectos = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const data = await prospectosApi.findAll();
      setProspectos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProspectos(); }, [cargarProspectos]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrando(true);
    try {
      await prospectosApi.create(nuevoProps);
      setModalNuevo(false);
      setNuevoProps({ nombre: '', telefono: '', interes: '', origen: '' });
      cargarProspectos();
      alert('Prospecto registrado correctamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrando(false);
    }
  };

  const handleConvertir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectoSel) return;
    setRegistrando(true);
    try {
      await prospectosApi.convertir(prospectoSel.id_prospecto, convertirProps);
      setModalConvertir(false);
      setProspectoSel(null);
      setConvertirProps({ identificacion: '', correo: '', password: '' });
      cargarProspectos();
      alert('Prospecto convertido a socio exitosamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrando(false);
    }
  };

  const prospectosFiltrados = prospectos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          (p.telefono && p.telefono.includes(busqueda));
    const matchEstado = filtroEstado ? p.estado === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <UserPlus size={24} color="var(--primary)" />
            Gestión de Prospectos
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Haz seguimiento a posibles nuevos clientes y conviértelos en socios.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cargarProspectos} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', cursor:'pointer' }}>
            <RefreshCw size={20} className={cargando ? styles.spin : ''} />
          </button>
          <button onClick={() => setModalNuevo(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)' }}>
            <Plus size={20} />
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', padding:'1rem', borderRadius:'12px', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} 
          />
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
          <option value="">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Contactado">Contactado</option>
          <option value="Convertido">Convertido</option>
        </select>
      </div>

      {/* Table Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        {cargando ? (
           <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
             <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
             <p style={{ marginTop:'10px' }}>Cargando prospectos...</p>
           </div>
        ) : prospectosFiltrados.length === 0 ? (
           <p style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>No se encontraron prospectos.</p>
        ) : (
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
              {prospectosFiltrados.map(p => (
                <tr key={p.id_prospecto} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className={styles.memberInfo}>
                      <div className={`${styles.memberAvatar} ${styles.avatarCyan}`}>{p.nombre.substring(0,2).toUpperCase()}</div>
                      <div>
                        <p className={styles.memberName}>{p.nombre}</p>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{p.telefono || 'Sin teléfono'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>{p.interes || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{p.origen || '-'}</span></td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      background: p.estado === 'Convertido' ? 'rgba(34, 197, 94, 0.15)' : p.estado === 'Pendiente' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: p.estado === 'Convertido' ? '#4ade80' : p.estado === 'Pendiente' ? '#f87171' : '#facc15'
                    }}>
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {p.estado !== 'Convertido' && (
                      <button onClick={() => { setProspectoSel(p); setModalConvertir(true); }} style={{ 
                        background: 'rgba(0, 242, 255, 0.1)', border: '1px solid var(--primary)', color: '#fff', padding: '0.5rem 1rem',
                        borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem'
                      }}>
                        <UserCheck size={16} /> Convertir a Socio
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Modal Nuevo Prospecto */}
      {modalNuevo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalNuevo(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Registrar Nuevo Prospecto</h3>
            <form onSubmit={handleCrear} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Nombre Completo *</label>
                <input required type="text" value={nuevoProps.nombre} onChange={e=>setNuevoProps({...nuevoProps, nombre: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Teléfono</label>
                <input type="text" value={nuevoProps.telefono} onChange={e=>setNuevoProps({...nuevoProps, telefono: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Interés (Ej: Musculación, Clases)</label>
                <input type="text" value={nuevoProps.interes} onChange={e=>setNuevoProps({...nuevoProps, interes: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Origen (Ej: Instagram, Referido)</label>
                <input type="text" value={nuevoProps.origen} onChange={e=>setNuevoProps({...nuevoProps, origen: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalNuevo(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={registrando} style={{ flex:1, background:'var(--primary)', border:'none', color:'#000', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:registrando?0.5:1 }}>{registrando?'Guardando...':'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convertir a Socio */}
      {modalConvertir && prospectoSel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalConvertir(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Convertir {prospectoSel.nombre} a Socio</h3>
            <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.6)', marginBottom:'1.5rem' }}>
              Para completar el registro como socio, es necesario crear su cuenta de acceso al sistema.
            </p>
            <form onSubmit={handleConvertir} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Identificación (Cédula) *</label>
                <input required type="text" value={convertirProps.identificacion} onChange={e=>setConvertirProps({...convertirProps, identificacion: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Correo Electrónico *</label>
                <input required type="email" value={convertirProps.correo} onChange={e=>setConvertirProps({...convertirProps, correo: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Contraseña Temporal *</label>
                <input required type="password" value={convertirProps.password} onChange={e=>setConvertirProps({...convertirProps, password: e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalConvertir(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={registrando} style={{ flex:1, background:'var(--primary)', border:'none', color:'#000', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:registrando?0.5:1 }}>{registrando?'Convirtiendo...':'Convertir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
