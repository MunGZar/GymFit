"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Users, Search, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { sociosApi, usuariosApi, type SocioCompleto, type UsuarioCompleto } from '@/lib/api';
import Link from 'next/link';

export default function SociosPage() {
  const [socios, setSocios] = useState<SocioCompleto[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<UsuarioCompleto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idUsuarioSel, setIdUsuarioSel] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargarSocios = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const [dataSocs, dataUsrs] = await Promise.all([
        sociosApi.findAll(),
        usuariosApi.findAll()
      ]);
      setSocios(dataSocs);
      // Filtrar usuarios con rol 'socio' que NO están ya en la lista de socios
      const idsSocioExistentes = new Set(dataSocs.map(s => s.usuario.id_usuario));
      const disponibles = dataUsrs.filter(u => 
        u.rol.nombre.toLowerCase() === 'socio' && !idsSocioExistentes.has(u.id_usuario)
      );
      setUsuariosDisponibles(disponibles);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuarioSel) return;
    setRegistrando(true);
    try {
      await sociosApi.create({ id_usuario: Number(idUsuarioSel) });
      setModalAbierto(false);
      setIdUsuarioSel('');
      cargarSocios();
      alert('Socio registrado correctamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegistrando(false);
    }
  };

  useEffect(() => { cargarSocios(); }, [cargarSocios]);

  const sociosFiltrados = socios.filter(s => 
    s.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.usuario.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Users size={24} color="var(--primary)" /> Gestión de Socios
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Administra los perfiles y estados de los miembros del gimnasio.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cargarSocios} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', cursor:'pointer' }}>
            <RefreshCw size={20} className={cargando ? styles.spin : ''} />
          </button>
          <button onClick={() => setModalAbierto(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Plus size={20} /> Nuevo Socio
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', padding:'1rem', borderRadius:'12px', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span><strong>Error:</strong> {error}</span>
          <button onClick={cargarSocios} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer', textDecoration:'underline', fontSize:'0.85rem' }}>Reintentar</button>
        </div>
      )}

      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} 
          />
        </div>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop:'10px' }}>Cargando socios...</p>
          </div>
        ) : sociosFiltrados.length === 0 ? (
          <p style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>No se encontraron socios registrados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>SOCIO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>IDENTIFICACIÓN</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.map(s => (
                <tr key={s.id_socio} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className={styles.memberInfo}>
                      <div className={`${styles.memberAvatar} ${styles.avatarCyan}`}>{s.usuario?.nombre?.substring(0,2).toUpperCase() || 'S'}</div>
                      <div>
                        <p className={styles.memberName}>{s.usuario?.nombre || 'Socio'}</p>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{s.usuario?.correo}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{s.usuario?.identificacion}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      background: s.usuario?.estado ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: s.usuario?.estado ? '#4ade80' : '#f87171'
                    }}>
                      {s.usuario?.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <Link href={`/socios/${s.id_socio}`} style={{ textDecoration:'none' }}>
                      <button style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>Ver Perfil / Evaluar</button>
                    </Link>
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

      {/* Modal Nuevo Socio */}
      {modalAbierto && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => setModalAbierto(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:700 }}>Completar Registro de Socio</h3>
            <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.6)', marginBottom:'1.5rem' }}>
              Selecciona un usuario con rol 'Socio' para activarlo en el sistema de gestión del gimnasio.
            </p>
            <form onSubmit={handleRegistrar} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Usuarios con rol 'Socio'</label>
                <select 
                  value={idUsuarioSel} 
                  onChange={e => setIdUsuarioSel(e.target.value)}
                  style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff', outline:'none' }}
                >
                  <option value="">Selecciona un usuario...</option>
                  {usuariosDisponibles.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} ({u.identificacion})
                    </option>
                  ))}
                </select>
                {usuariosDisponibles.length === 0 && (
                  <p style={{ fontSize:'0.75rem', color:'var(--secondary)', marginTop:'8px' }}>No hay usuarios con rol 'Socio' pendientes por registrar.</p>
                )}
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={() => setModalAbierto(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'0.8rem', borderRadius:'10px', cursor:'pointer' }}>Cancelar</button>
                <button 
                  type="submit" 
                  disabled={registrando || !idUsuarioSel} 
                  style={{ flex:1, background:'var(--primary)', border:'none', color:'#000', padding:'0.8rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', opacity:(registrando || !idUsuarioSel)?0.5:1 }}
                >
                  {registrando ? 'Registrando...' : 'Registrar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
