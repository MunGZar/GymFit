"use client";

/**
 * /perfil/page.tsx — HU-03: Gestión de Perfiles
 *
 * SRS cubierto:
 *   ✓ Edición de campos no críticos: nombre y teléfono
 *   ✓ Sección separada de cambio de contraseña
 *   ✓ Valida contraseña actual antes de permitir cambio
 *   ✓ Carga datos frescos desde GET /api/auth/perfil
 */

import React, { useEffect, useState } from 'react';
import { User, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi, perfilApi, type PerfilCompleto } from '@/lib/api';
import styles from '@/styles/pages/dashboard/dashboard.module.css';

function Alerta({ tipo, mensaje }: { tipo: 'ok' | 'err'; mensaje: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem',
      borderRadius: '10px',
      background: tipo === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${tipo === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      color: tipo === 'ok' ? '#4ade80' : '#f87171', fontSize: '0.85rem', lineHeight: 1.5,
    }} role="alert">
      {tipo === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {mensaje}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
  padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: 'rgba(255,255,255,0.45)', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
  color: '#000', border: 'none', padding: '0.8rem 1.6rem',
  borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
};
const btnSecondary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.6rem',
  borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
};

function iniciales(nombre: string) {
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

const ROL_COLOR: Record<string, string> = {
  admin: '#a855f7', entrenador: '#3b82f6', recepcionista: '#06b6d4', socio: '#06b6d4',
};

export default function PerfilPage() {
  const [perfil, setPerfil]         = useState<PerfilCompleto | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [nombre, setNombre]     = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [alertaDatos, setAlertaDatos] = useState<{ tipo: 'ok'|'err'; msg: string }|null>(null);

  const [passActual, setPassActual]   = useState('');
  const [passNueva, setPassNueva]     = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [verActual, setVerActual]     = useState(false);
  const [verNueva, setVerNueva]       = useState(false);
  const [verConfirm, setVerConfirm]   = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [alertaPass, setAlertaPass]   = useState<{ tipo: 'ok'|'err'; msg: string }|null>(null);

  // ── Carga: primero datos locales, luego refresca del servidor ─
  useEffect(() => {
    // Paso 1: pre-cargar con datos del localStorage para respuesta inmediata
    const local = authApi.getUsuarioLocal();
    if (local) {
      setNombre(local.nombre);
      // Construir un perfil parcial con lo que tenemos localmente
      setPerfil({
        id_usuario: local.id_usuario,
        nombre: local.nombre,
        correo: local.correo,
        identificacion: '',
        telefono: null,
        estado: true,
        rol: { id_rol: 0, nombre: local.rol },
      });
    }

    // Paso 2: obtener datos completos y frescos del servidor
    perfilApi.obtener()
      .then((data) => {
        setPerfil(data);
        setNombre(data.nombre);
        setTelefono(data.telefono ?? '');
        setErrorCarga('');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Error al cargar el perfil';
        // Si el token expiró, hacer logout
        if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
          authApi.logout();
          window.location.href = '/login';
          return;
        }
        // Si ya cargamos datos locales, no mostrar error — mostrar advertencia suave
        if (local) {
          setErrorCarga('⚠ Mostrando datos locales. No se pudo sincronizar con el servidor.');
        } else {
          setErrorCarga(msg);
        }
      })
      .finally(() => setCargando(false));
  }, []);

  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertaDatos(null);
    if (!nombre.trim()) return setAlertaDatos({ tipo: 'err', msg: 'El nombre no puede estar vacío.' });
    setGuardandoDatos(true);
    try {
      const actualizado = await perfilApi.actualizar({
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
      });
      setPerfil(actualizado);
      setNombre(actualizado.nombre);
      setTelefono(actualizado.telefono ?? '');
      setAlertaDatos({ tipo: 'ok', msg: 'Datos actualizados correctamente.' });
    } catch (err: unknown) {
      setAlertaDatos({ tipo: 'err', msg: err instanceof Error ? err.message : 'Error al guardar.' });
    } finally {
      setGuardandoDatos(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertaPass(null);
    if (!passActual) return setAlertaPass({ tipo: 'err', msg: 'Ingresa tu contraseña actual.' });
    if (passNueva.length < 8) return setAlertaPass({ tipo: 'err', msg: 'La nueva contraseña debe tener mínimo 8 caracteres.' });
    if (passNueva !== passConfirm) return setAlertaPass({ tipo: 'err', msg: 'Las contraseñas nuevas no coinciden.' });
    setGuardandoPass(true);
    try {
      const res = await perfilApi.cambiarPassword({ password_actual: passActual, password_nueva: passNueva });
      setAlertaPass({ tipo: 'ok', msg: res.mensaje });
      setPassActual(''); setPassNueva(''); setPassConfirm('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar la contraseña.';
      setAlertaPass({ tipo: 'err', msg: msg.toLowerCase().includes('actual') || msg.toLowerCase().includes('incorrecta')
        ? 'La contraseña actual no es correcta.' : msg });
    } finally {
      setGuardandoPass(false);
    }
  };

  // Render cargando (solo si no hay datos locales) 
  if (cargando && !perfil) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'300px', flexDirection:'column', gap:'1rem', color:'rgba(255,255,255,0.4)' }}>
        <RefreshCw size={24} style={{ animation:'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p>Cargando perfil…</p>
      </div>
    );
  }

 
  if (errorCarga && !perfil) {
    return (
      <div className={styles.container}>
        <Alerta tipo="err" mensaje={errorCarga} />
      </div>
    );
  }

  const rolNombre = perfil?.rol?.nombre ?? '';
  const rolColor  = ROL_COLOR[rolNombre.toLowerCase()] ?? '#06b6d4';

  return (
    <div className={styles.container} style={{ maxWidth: '760px' }}>

      {/* Advertencia suave si no pudo sincronizar */}
      {errorCarga && <Alerta tipo="err" mensaje={errorCarga} />}

      {/* Header avatar */}
      <div className="glass" style={{ borderRadius:'20px', padding:'2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg, ${rolColor}55, ${rolColor}22)`, border:`2px solid ${rolColor}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:700, color:rolColor }}>
          {iniciales(perfil?.nombre ?? 'U')}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{perfil?.nombre}</h2>
          <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.45)', marginBottom:'6px' }}>{perfil?.correo}</p>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ padding:'2px 12px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600, background:`${rolColor}22`, color:rolColor, border:`1px solid ${rolColor}44` }}>
              {rolNombre.charAt(0).toUpperCase()}{rolNombre.slice(1)}
            </span>
            <span style={{ padding:'2px 12px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600, background:'rgba(34,197,94,0.12)', color:'#4ade80' }}>Activo</span>
          </div>
        </div>
        {perfil?.identificacion && (
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', fontSize:'0.8rem', color:'rgba(255,255,255,0.35)' }}>
            <span>ID: {perfil.id_usuario}</span>
            <span>CC: {perfil.identificacion}</span>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }}>

        {/* Sección 1: Datos personales */}
        <div className="glass" style={{ borderRadius:'18px', padding:'1.75rem' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:'8px', marginBottom:'1.25rem' }}>
            <User size={18} color="var(--primary)" /> Datos personales
          </h3>
          <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.35)', marginBottom:'1.25rem' }}>
            Puedes editar tu nombre y teléfono. El correo e identificación solo pueden ser modificados por un administrador.
          </p>
          <form onSubmit={handleGuardarDatos} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} disabled={guardandoDatos} placeholder="Tu nombre completo" />
            </div>
            <div>
              <label style={labelStyle}><Phone size={12} style={{ display:'inline', marginRight:'4px' }} />Teléfono (opcional)</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} disabled={guardandoDatos} placeholder="Ej: 3001234567" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input type="email" value={perfil?.correo ?? ''} readOnly style={{ ...inputStyle, opacity:0.45, cursor:'not-allowed' }} />
              </div>
              <div>
                <label style={labelStyle}>Identificación</label>
                <input type="text" value={perfil?.identificacion ?? ''} readOnly style={{ ...inputStyle, opacity:0.45, cursor:'not-allowed' }} />
              </div>
            </div>
            {alertaDatos && <Alerta tipo={alertaDatos.tipo} mensaje={alertaDatos.msg} />}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" style={{ ...btnPrimary, opacity: guardandoDatos ? 0.7 : 1 }} disabled={guardandoDatos}>
                {guardandoDatos ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* Sección 2: Cambio de contraseña */}
        <div className="glass" style={{ borderRadius:'18px', padding:'1.75rem' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:'8px', marginBottom:'1.25rem' }}>
            <Lock size={18} color="var(--primary)" /> Cambiar contraseña
          </h3>
          <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.35)', marginBottom:'1.25rem' }}>
            Debes ingresar tu contraseña actual para poder establecer una nueva. Mínimo 8 caracteres.
          </p>
          <form onSubmit={handleCambiarPassword} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {[
              { label:'Contraseña actual *', val:passActual, set:setPassActual, ver:verActual, setVer:setVerActual, ph:'Tu contraseña actual' },
              { label:'Contraseña nueva * (mín. 8 caracteres)', val:passNueva, set:setPassNueva, ver:verNueva, setVer:setVerNueva, ph:'Nueva contraseña' },
              { label:'Confirmar contraseña nueva *', val:passConfirm, set:setPassConfirm, ver:verConfirm, setVer:setVerConfirm, ph:'Repite la nueva contraseña' },
            ].map(({ label, val, set, ver, setVer, ph }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position:'relative' }}>
                  <input type={ver ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                    placeholder={ph} style={{ ...inputStyle, paddingRight:'3rem' }} disabled={guardandoPass} />
                  <button type="button" onClick={() => setVer((p:boolean) => !p)}
                    style={{ position:'absolute', right:'0.9rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>
                    {ver ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            {passConfirm && passNueva !== passConfirm && (
              <p style={{ fontSize:'0.75rem', color:'#f87171', marginTop:'-8px' }}>Las contraseñas no coinciden</p>
            )}
            {alertaPass && <Alerta tipo={alertaPass.tipo} mensaje={alertaPass.msg} />}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px' }}>
              <button type="button" onClick={() => { setPassActual(''); setPassNueva(''); setPassConfirm(''); setAlertaPass(null); }} style={btnSecondary} disabled={guardandoPass}>Limpiar</button>
              <button type="submit" style={{ ...btnPrimary, opacity: guardandoPass ? 0.7 : 1 }} disabled={guardandoPass}>
                {guardandoPass ? 'Cambiando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
