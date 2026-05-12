"use client";

/**
 * /personal/page.tsx — HU-01: Gestión de usuarios del sistema.
 * + Botón "Reactivar" explícito para usuarios inactivos (pendiente menor)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, Search, Edit2, Trash2, X, Eye, EyeOff, RefreshCw, UserCheck } from 'lucide-react';
import {
  usuariosApi, rolesApi,
  type UsuarioCompleto, type Rol,
  type CreateUsuarioPayload, type UpdateUsuarioPayload,
} from '@/lib/api';
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
  const [usuarios, setUsuarios]   = useState<UsuarioCompleto[]>([]);
  const [roles, setRoles]         = useState<Rol[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');
  const [busqueda, setBusqueda]   = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const [modalAbierto, setModalAbierto]       = useState(false);
  const [modalMode, setModalMode]             = useState<FormMode>('crear');
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioCompleto | null>(null);
  const [form, setForm]         = useState<FormState>(FORM_VACIO);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const [usrs, rols] = await Promise.all([usuariosApi.findAll(), rolesApi.findAll()]);
      setUsuarios(usrs); setRoles(rols);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error al cargar usuarios.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const t = busqueda.toLowerCase();
    return (!t || u.nombre.toLowerCase().includes(t) || u.correo.toLowerCase().includes(t) || u.identificacion.toLowerCase().includes(t))
      && (!filtroRol || u.rol.nombre.toLowerCase() === filtroRol.toLowerCase());
  });

  const abrirCrear = () => { setModalMode('crear'); setUsuarioEditando(null); setForm({...FORM_VACIO, id_rol: roles[0]?.id_rol.toString()??''}); setFormError(''); setMostrarPass(false); setModalAbierto(true); };
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
    } catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Error al guardar.'); }
    finally { setFormLoading(false); }
  };

  const handleDesactivar = async (u: UsuarioCompleto) => {
    if (!confirm(`¿Desactivar a ${u.nombre}? Su cuenta quedará inactiva.`)) return;
    try {
      await usuariosApi.remove(u.id_usuario);
      setUsuarios(prev => prev.map(x => x.id_usuario===u.id_usuario ? {...x, estado:false} : x));
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al desactivar.'); }
  };

  // HU-01 pendiente menor: reactivar usuario inactivo con un clic explícito
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
            <Shield size={22} color="var(--primary)" /> Gestión de Personal / Usuarios
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem' }}>Administra los usuarios, roles y permisos del sistema.</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={cargarDatos} title="Recargar" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.7rem', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center' }}><RefreshCw size={16}/></button>
          <button onClick={abrirCrear} style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))', color:'#000', border:'none', padding:'0.75rem 1.4rem', borderRadius:'12px', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'0.9rem' }}><Plus size={18}/> Nuevo Usuario</button>
        </div>
      </div>

      {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', padding:'1rem 1.25rem', color:'#f87171', fontSize:'0.9rem' }}>{error}</div>}

      <div className="glass" style={{ padding:'1rem 1.5rem', borderRadius:'16px', display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'220px', maxWidth:'400px' }}>
          <Search size={16} style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)' }}/>
          <input type="text" placeholder="Buscar por nombre, email o ID…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{ ...inputStyle, paddingLeft:'2.5rem' }}/>
        </div>
        <select value={filtroRol} onChange={e=>setFiltroRol(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:'170px' }}>
          <option value="">Todos los roles</option>
          {roles.map(r => <option key={r.id_rol} value={r.nombre}>{r.nombre.charAt(0).toUpperCase()+r.nombre.slice(1)}</option>)}
        </select>
        <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.35)', marginLeft:'auto' }}>{usuariosFiltrados.length} usuario{usuariosFiltrados.length!==1?'s':''}</span>
      </div>

      <div className="glass" style={{ borderRadius:'16px', overflow:'hidden', padding:0 }}>
        {cargando ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
            <RefreshCw size={20} style={{ animation:'spin 1s linear infinite', marginBottom:'0.5rem' }}/><p>Cargando usuarios…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
                        /* Desactivar — solo si está activo */
                        <button onClick={()=>handleDesactivar(u)} title="Desactivar usuario" style={{ background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', padding:'4px 6px' }}><Trash2 size={15}/></button>
                      ) : (
                        /* Reactivar explícito — HU-01 pendiente menor */
                        <button
                          onClick={()=>handleReactivar(u)}
                          title="Reactivar usuario"
                          style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'8px', color:'#4ade80', cursor:'pointer', padding:'4px 10px', fontSize:'0.75rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'4px' }}
                        >
                          <UserCheck size={13}/> Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e=>{ if(e.target===e.currentTarget) cerrarModal(); }}>
          <div className="glass" style={{ width:'100%', maxWidth:'520px', borderRadius:'20px', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', gap:'8px' }}>
                <Shield size={20} color="var(--primary)"/>
                {modalMode==='crear' ? 'Nuevo Usuario' : `Editar: ${usuarioEditando?.nombre}`}
              </h3>
              <button onClick={cerrarModal} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleGuardar} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div><label style={labelStyle}>Nombre completo *</label><input name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="Ej: Juan Pérez" style={inputStyle} disabled={formLoading}/></div>
              <div><label style={labelStyle}>Número de identificación *</label><input name="identificacion" value={form.identificacion} onChange={handleFormChange} placeholder="Ej: 1234567890" style={inputStyle} disabled={formLoading}/></div>
              <div><label style={labelStyle}>Correo electrónico *</label><input name="correo" type="email" value={form.correo} onChange={handleFormChange} placeholder="usuario@gymfit.com" style={inputStyle} disabled={formLoading}/></div>
              <div>
                <label style={labelStyle}>{modalMode==='crear'?'Contraseña *':'Nueva contraseña (vacío = no cambiar)'}</label>
                <div style={{ position:'relative' }}>
                  <input name="password" type={mostrarPass?'text':'password'} value={form.password} onChange={handleFormChange} placeholder={modalMode==='crear'?'Mínimo 8 caracteres':'••••••••'} style={{ ...inputStyle, paddingRight:'3rem' }} disabled={formLoading}/>
                  <button type="button" onClick={()=>setMostrarPass(p=>!p)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>
                    {mostrarPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div><label style={labelStyle}>Teléfono (opcional)</label><input name="telefono" value={form.telefono} onChange={handleFormChange} placeholder="Ej: 3001234567" style={inputStyle} disabled={formLoading}/></div>
              <div>
                <label style={labelStyle}>Rol del sistema * (define los permisos)</label>
                <select name="id_rol" value={form.id_rol} onChange={handleFormChange} style={inputStyle} disabled={formLoading}>
                  <option value="">Selecciona un rol…</option>
                  {roles.map(r=><option key={r.id_rol} value={r.id_rol}>{r.nombre.charAt(0).toUpperCase()+r.nombre.slice(1)}</option>)}
                </select>
                {form.id_rol && <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginTop:'4px', marginLeft:'4px' }}>Los permisos se asignan automáticamente según el rol seleccionado.</p>}
              </div>
              {modalMode==='editar' && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <input id="estado" name="estado" type="checkbox" checked={form.estado} onChange={handleFormChange} style={{ width:'16px', height:'16px', cursor:'pointer', accentColor:'var(--primary)' }} disabled={formLoading}/>
                  <label htmlFor="estado" style={{ ...labelStyle, marginBottom:0, cursor:'pointer' }}>Usuario activo</label>
                </div>
              )}
              {formError && <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'0.75rem 1rem', fontSize:'0.85rem', color:'#f87171' }}>{formError}</div>}
              <div style={{ display:'flex', gap:'10px', marginTop:'0.5rem' }}>
                <button type="button" onClick={cerrarModal} disabled={formLoading} style={{ flex:1, padding:'0.85rem', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>Cancelar</button>
                <button type="submit" disabled={formLoading} style={{ flex:2, padding:'0.85rem', borderRadius:'12px', background:'linear-gradient(135deg, var(--primary), var(--secondary))', border:'none', color:'#000', fontWeight:700, cursor:'pointer', fontSize:'0.9rem', opacity:formLoading?0.7:1 }}>
                  {formLoading ? (modalMode==='crear'?'Creando…':'Guardando…') : (modalMode==='crear'?'Crear Usuario':'Guardar Cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
