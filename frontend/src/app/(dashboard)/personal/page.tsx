"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, Search, Edit2, Trash2, X, Eye, EyeOff, RefreshCw, UserCheck, Users, Link as LinkIcon, Calendar, CheckCircle } from 'lucide-react';
import {
  usuariosApi, rolesApi, entrenadoresApi, sociosApi, authApi,
  type UsuarioCompleto, type Rol,
  type CreateUsuarioPayload, type UpdateUsuarioPayload, type Entrenador, type Asignacion, type SocioCompleto
} from '@/lib/api';
import { canPerform } from '@/lib/rbac';
import styles from '@/styles/pages/dashboard/dashboard.module.css';

const ROL_META: Record<string, { avatar: string; tag: string }> = {
  admin:         { avatar: styles.avatarPurple, tag: `${styles.tag} ${styles.tagPurple}` },
  entrenador:    { avatar: styles.avatarBlue,   tag: `${styles.tag} ${styles.tagBlue}`   },
  recepcionista: { avatar: styles.avatarCyan,   tag: `${styles.tag} ${styles.tagCyan}`   },
  socio:         { avatar: styles.avatarCyan,   tag: `${styles.tag} ${styles.tagCyan}`   },
};

const getRolMeta = (n: string) => ROL_META[n.toLowerCase()] ?? ROL_META['recepcionista'];
const iniciales  = (n: string) => n.trim().split(' ').slice(0,2).map(p=>p[0]?.toUpperCase()??'').join('');

type FormMode = 'crear' | 'editar';
interface FormState { nombre:string; identificacion:string; correo:string; password:string; telefono:string; id_rol:string; estado:boolean; }
const FORM_VACIO: FormState = { nombre:'', identificacion:'', correo:'', password:'', telefono:'', id_rol:'', estado:true };

export default function PersonalPage() {
  const [tab, setTab]             = useState<'usuarios' | 'asignaciones'>('usuarios');
  const [usuarios, setUsuarios]   = useState<UsuarioCompleto[]>([]);
  const [roles, setRoles]         = useState<Rol[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [sociosList, setSociosList] = useState<SocioCompleto[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');

  // Estados para Usuarios
  const [busqueda, setBusqueda]   = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [modalAbierto, setModalAbierto]       = useState(false);
  const [modalMode, setModalMode]             = useState<FormMode>('crear');
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioCompleto | null>(null);
  const [form, setForm]                       = useState<FormState>(FORM_VACIO);
  const [formError, setFormError]             = useState('');
  const [formLoading, setFormLoading]         = useState(false);
  const [mostrarPass, setMostrarPass]         = useState(false);

  // Estados para Asignaciones
  const [idEntrenadorSel, setIdEntrenadorSel] = useState('');
  const [idSocioSel, setIdSocioSel] = useState('');
  const [modalAsignar, setModalAsignar] = useState(false);
  const [asignacionesCargando, setAsignacionesCargando] = useState(false);
  const [asignacionesList, setAsignacionesList] = useState<Asignacion[]>([]);

  const cargarDatos = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const [usrs, rols, entrs, socs] = await Promise.all([
        usuariosApi.findAll(), 
        rolesApi.findAll(),
        entrenadoresApi.findAll(),
        sociosApi.findAll()
      ]);
      setUsuarios(usrs); 
      setRoles(rols);
      setEntrenadores(entrs);
      setSociosList(socs);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error al cargar datos.'); }
    finally { setCargando(false); }
  }, []);

  const cargarAsignaciones = useCallback(async (id: number) => {
    setAsignacionesCargando(true);
    try {
      const data = await entrenadoresApi.findAsignaciones(id);
      setAsignacionesList(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setAsignacionesCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    if (idEntrenadorSel) {
      cargarAsignaciones(Number(idEntrenadorSel));
    } else {
      setAsignacionesList([]);
    }
  }, [idEntrenadorSel, cargarAsignaciones]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const t = busqueda.toLowerCase();
    return (!t || u.nombre.toLowerCase().includes(t) || u.correo.toLowerCase().includes(t) || u.identificacion.toLowerCase().includes(t))
      && (!filtroRol || u.rol.nombre.toLowerCase() === filtroRol.toLowerCase());
  });

  const abrirCrear = () => { setModalMode('crear'); setUsuarioEditando(null); setForm({...FORM_VACIO, id_rol: roles.find(r=>r.nombre==='recepcionista')?.id_rol.toString()??''}); setFormError(''); setMostrarPass(false); setModalAbierto(true); };
  const abrirEditar = (u: UsuarioCompleto) => { setModalMode('editar'); setUsuarioEditando(u); setForm({ nombre:u.nombre, identificacion:u.identificacion, correo:u.correo, password:'', telefono:u.telefono??'', id_rol:u.rol.id_rol.toString(), estado:u.estado }); setFormError(''); setMostrarPass(false); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setFormError(''); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type==='checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!form.nombre.trim())         return setFormError('El nombre es obligatorio.');
    if (!form.identificacion.trim()) return setFormError('La identificación es obligatoria.');
    if (!form.correo.trim())         return setFormError('El correo es obligatorio.');
    if (modalMode==='crear' && form.password.length < 8) return setFormError('La contraseña debe tener mínimo 8 caracteres.');
    if (!form.id_rol)                return setFormError('Selecciona un rol.');
    setFormLoading(true);
    try {
      if (modalMode === 'crear') {
        const payload: CreateUsuarioPayload = { nombre:form.nombre.trim(), identificacion:form.identificacion.trim(), correo:form.correo.trim().toLowerCase(), password:form.password, telefono:form.telefono.trim()||undefined, id_rol:Number(form.id_rol) };
        const nuevo = await usuariosApi.create(payload);
        setUsuarios(prev => [...prev, nuevo as UsuarioCompleto]);
      } else if (usuarioEditando) {
        const payload: UpdateUsuarioPayload = { nombre:form.nombre.trim(), identificacion:form.identificacion.trim(), correo:form.correo.trim().toLowerCase(), telefono:form.telefono.trim()||undefined, id_rol:Number(form.id_rol), estado:form.estado, ...(form.password?{password:form.password}:{}) };
        const actualizado = await usuariosApi.update(usuarioEditando.id_usuario, payload);
        setUsuarios(prev => prev.map(u => u.id_usuario===usuarioEditando.id_usuario ? actualizado as UsuarioCompleto : u));
      }
      cerrarModal();
      cargarDatos();
    } catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Error al guardar.'); }
    finally { setFormLoading(false); }
  };

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEntrenadorSel) return alert('Por favor selecciona un entrenador.');
    if (!idSocioSel)      return alert('Por favor selecciona un socio.');
    
    setFormLoading(true);
    try {
      await entrenadoresApi.asignar({
        id_entrenador: Number(idEntrenadorSel),
        id_socio: Number(idSocioSel),
        fecha_asignacion: new Date().toISOString().split('T')[0]
      });
      setModalAsignar(false);
      cargarAsignaciones(Number(idEntrenadorSel));
      // Pequeño feedback visual
      alert('Socio asignado correctamente');
    } catch (err: any) {
      alert(err.message || 'Error al asignar el socio.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDesactivar = async (u: UsuarioCompleto) => {
    if (!confirm(`¿Desactivar a ${u.nombre}? Su cuenta quedará inactiva.`)) return;
    try {
      await usuariosApi.remove(u.id_usuario);
      setUsuarios(prev => prev.map(x => x.id_usuario===u.id_usuario ? {...x, estado:false} : x));
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al desactivar.'); }
  };

  const handleReactivar = async (u: UsuarioCompleto) => {
    if (!confirm(`¿Reactivar la cuenta de ${u.nombre}?`)) return;
    try {
      const actualizado = await usuariosApi.reactivar(u.id_usuario);
      setUsuarios(prev => prev.map(x => x.id_usuario===u.id_usuario ? actualizado as UsuarioCompleto : x));
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al reactivar.'); }
  };

  const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none' };
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.04em' };

  return (
    <div className={styles.container}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'0.4rem' }}>
            <Shield size={22} color="var(--primary)" /> Gestión de Personal
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem' }}>Administra los usuarios, roles y asignaciones del gimnasio.</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={cargarDatos} title="Recargar" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.7rem', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center' }}><RefreshCw size={16}/></button>
          {tab === 'usuarios' && (
            <button onClick={abrirCrear} style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))', color:'#000', border:'none', padding:'0.75rem 1.4rem', borderRadius:'12px', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'0.9rem' }}><Plus size={18}/> Nuevo Usuario</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.5rem' }}>
        <button onClick={() => setTab('usuarios')} style={{ background:'transparent', border:'none', borderBottom:tab==='usuarios'?'2px solid var(--primary)':'none', color:tab==='usuarios'?'#fff':'rgba(255,255,255,0.5)', padding:'0.5rem 1rem', cursor:'pointer', fontWeight:600 }}>Usuarios</button>
        <button onClick={() => setTab('asignaciones')} style={{ background:'transparent', border:'none', borderBottom:tab==='asignaciones'?'2px solid var(--primary)':'none', color:tab==='asignaciones'?'#fff':'rgba(255,255,255,0.5)', padding:'0.5rem 1rem', cursor:'pointer', fontWeight:600 }}>Asignación de Entrenadores (HU-08)</button>
      </div>

      {tab === 'usuarios' ? (
        <>
          <div className="glass" style={{ padding:'1rem 1.5rem', borderRadius:'16px', display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1rem' }}>
            <div style={{ position:'relative', flex:1, minWidth:'220px', maxWidth:'400px' }}>
              <Search size={16} style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)' }}/>
              <input type="text" placeholder="Buscar por nombre, email o ID…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{ ...inputStyle, paddingLeft:'2.5rem' }}/>
            </div>
            <select value={filtroRol} onChange={e=>setFiltroRol(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:'170px' }}>
              <option value="">Todos los roles</option>
              {roles.map(r => <option key={r.id_rol} value={r.nombre}>{r.nombre.charAt(0).toUpperCase()+r.nombre.slice(1)}</option>)}
            </select>
          </div>

          <div className="glass" style={{ borderRadius:'16px', overflow:'hidden', padding:0 }}>
            {cargando ? (
              <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
                <RefreshCw size={20} style={{ animation:'spin 1s linear infinite', marginBottom:'0.5rem' }}/><p>Cargando usuarios…</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}><Shield size={32} style={{ marginBottom:'0.5rem', opacity:0.3 }}/><p>No se encontraron usuarios.</p></div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)' }}>
                    {['USUARIO','IDENTIFICACIÓN','ROL','TELÉFONO','ESTADO','ACCIONES'].map(h=>(
                      <th key={h} style={{ padding:'1rem 1.25rem', color:'rgba(255,255,255,0.4)', fontWeight:600, fontSize:'0.78rem', letterSpacing:'0.05em', textAlign:h==='ACCIONES'?'right':'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => {
                    const meta = getRolMeta(u.rol.nombre);
                    return (
                      <tr key={u.id_usuario} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', opacity: u.estado ? 1 : 0.65 }}>
                        <td style={{ padding:'0.9rem 1.25rem' }}>
                          <div className={styles.memberInfo}>
                            <div className={`${styles.memberAvatar} ${meta.avatar}`}>{iniciales(u.nombre)}</div>
                            <div><p className={styles.memberName}>{u.nombre}</p><span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)' }}>{u.correo}</span></div>
                          </div>
                        </td>
                        <td style={{ padding:'0.9rem 1.25rem', fontSize:'0.85rem', color:'rgba(255,255,255,0.6)' }}>{u.identificacion}</td>
                        <td style={{ padding:'0.9rem 1.25rem' }}><span className={meta.tag}>{u.rol.nombre.charAt(0).toUpperCase()+u.rol.nombre.slice(1)}</span></td>
                        <td style={{ padding:'0.9rem 1.25rem', fontSize:'0.85rem', color:'rgba(255,255,255,0.5)' }}>{u.telefono??'—'}</td>
                        <td style={{ padding:'0.9rem 1.25rem' }}>
                          <span style={{ display:'inline-block', padding:'0.25rem 0.75rem', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600, background:u.estado?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', color:u.estado?'#4ade80':'#f87171' }}>
                            {u.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding:'0.9rem 1.25rem', textAlign:'right' }}>
                          <button onClick={()=>abrirEditar(u)} title="Editar" style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', padding:'4px 6px' }}><Edit2 size={15}/></button>
                          {u.estado ? (
                            <button onClick={()=>handleDesactivar(u)} title="Desactivar" style={{ background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', padding:'4px 6px' }}><Trash2 size={15}/></button>
                          ) : (
                            <button onClick={()=>handleReactivar(u)} title="Reactivar" style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'8px', color:'#4ade80', cursor:'pointer', padding:'4px 10px', fontSize:'0.75rem', fontWeight:600 }}><UserCheck size={13}/> Reactivar</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'2rem' }}>
          <div className="glass" style={{ padding:'1.5rem', borderRadius:'16px', height:'fit-content' }}>
            <h3 style={{ fontSize:'1rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'8px' }}><Users size={18} color="var(--primary)"/> Seleccionar Entrenador</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              {entrenadores.map(e => (
                <button 
                  key={e.id_entrenador} 
                  onClick={() => setIdEntrenadorSel(e.id_entrenador.toString())}
                  style={{ 
                    width:'100%', padding:'1rem', borderRadius:'12px', textAlign:'left', cursor:'pointer',
                    background: idEntrenadorSel === e.id_entrenador.toString() ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: idEntrenadorSel === e.id_entrenador.toString() ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', display:'flex', alignItems:'center', gap:'10px'
                  }}
                >
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--primary)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem' }}>{iniciales(e.usuario.nombre)}</div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{e.usuario.nombre}</p>
                    <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)' }}>{e.especialidad || 'Sin especialidad'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding:'1.5rem', borderRadius:'16px' }}>
            {!idEntrenadorSel ? (
              <div style={{ height:'300px', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', flexDirection:'column', gap:'10px' }}>
                <Users size={48} style={{ opacity:0.2 }}/>
                <p>Selecciona un entrenador para ver sus socios asignados.</p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                  <h3 style={{ fontSize:'1.1rem' }}>Socios asignados a {entrenadores.find(e=>e.id_entrenador.toString()===idEntrenadorSel)?.usuario.nombre}</h3>
                  <button onClick={() => { setIdSocioSel(''); setModalAsignar(true); }} style={{ background:'var(--primary)', color:'#000', border:'none', padding:'0.5rem 1rem', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>+ Asignar Socio</button>
                </div>
                
                {asignacionesCargando ? <p>Cargando asignaciones…</p> : asignacionesList.length === 0 ? (
                  <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', padding:'2rem' }}>Este entrenador no tiene socios asignados.</p>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem' }}>
                    {asignacionesList.map(a => (
                      <div key={a.id_asignacion} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'1rem', display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}><Users size={20}/></div>
                        <div>
                          <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{a.socio.usuario.nombre}</p>
                          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)' }}>Desde: {a.fecha_asignacion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {modalAbierto && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={() => cerrarModal()}>
          <div className="glass" style={{ width:'100%', maxWidth:'520px', borderRadius:'20px', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem' }}>{modalMode==='crear'?'Nuevo Usuario':'Editar Usuario'}</h3>
            <form onSubmit={handleGuardar} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div><label style={labelStyle}>Nombre *</label><input name="nombre" value={form.nombre} onChange={handleFormChange} style={inputStyle}/></div>
              <div><label style={labelStyle}>Identificación *</label><input name="identificacion" value={form.identificacion} onChange={handleFormChange} style={inputStyle}/></div>
              <div><label style={labelStyle}>Correo *</label><input name="correo" value={form.correo} onChange={handleFormChange} style={inputStyle}/></div>
              <div><label style={labelStyle}>Password</label><input name="password" type="password" value={form.password} onChange={handleFormChange} style={inputStyle}/></div>
              <div><label style={labelStyle}>Rol *</label>
                <select name="id_rol" value={form.id_rol} onChange={handleFormChange} style={inputStyle}>
                  {roles.map(r=><option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                </select>
              </div>
              {formError && <p style={{ color:'#f87171', fontSize:'0.8rem' }}>{formError}</p>}
              <button type="submit" disabled={formLoading} style={{ background:'var(--primary)', color:'#000', padding:'1rem', borderRadius:'12px', border:'none', fontWeight:700, cursor:'pointer' }}>{formLoading?'...':'Guardar'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar (HU-08) */}
      {modalAsignar && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={()=>setModalAsignar(false)}>
          <div className="glass" style={{ width:'100%', maxWidth:'400px', borderRadius:'20px', padding:'2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem' }}>Asignar Entrenador</h3>
            <form onSubmit={handleAsignar} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={labelStyle}>Entrenador</label>
                <select value={idEntrenadorSel} onChange={e=>setIdEntrenadorSel(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  {entrenadores.map(e=><option key={e.id_entrenador} value={e.id_entrenador}>{e.usuario.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Socio</label>
                <select value={idSocioSel} onChange={e=>setIdSocioSel(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  {sociosList.filter(s=>s.activo).map(s=>(
                    <option key={s.id_socio} value={s.id_socio}>
                      {s.usuario.nombre} ({s.usuario.identificacion})
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)' }}><Calendar size={12}/> Se registrará con fecha de hoy.</p>
              <button type="submit" disabled={formLoading} style={{ background:'var(--primary)', color:'#000', padding:'1rem', borderRadius:'12px', border:'none', fontWeight:700, cursor:'pointer', opacity: formLoading ? 0.6 : 1 }}>
                {formLoading ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
