"use client";

/**
 * RegisterForm.tsx — HU-01: Registro de usuarios del sistema.
 *
 * SRS cubierto:
 *   ✓ Solicita: nombre, identificación, correo y rol (obligatorios)
 *   ✓ Error claro si el correo ya está registrado (409 backend)
 *   ✓ Error claro si la identificación ya está registrada (409)
 *   ✓ Permisos asignados automáticamente según el rol elegido
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { rolesApi, authApi, type Rol, type RegisterPayload } from '@/lib/api';
import styles from '@/styles/components/LoginForm.module.css';

// Descripción de permisos por rol — criterio SRS
const PERMISOS_ROL: Record<string, string> = {
  admin:         'Acceso total: usuarios, reportes, configuración y todos los módulos.',
  entrenador:    'Acceso a: rutinas, evaluaciones, progreso y clases asignadas.',
  recepcionista: 'Acceso a: socios, membresías, control de acceso y prospectos.',
  socio:         'Acceso a: su perfil, rutinas asignadas y progreso personal.',
};

export default function RegisterForm() {
  const { login } = useAuth();

  // Roles desde la API
  const [roles, setRoles]               = useState<Rol[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError]     = useState('');

  // Campos
  const [nombre, setNombre]             = useState('');
  const [identificacion, setId]         = useState('');
  const [correo, setCorreo]             = useState('');
  const [password, setPassword]         = useState('');
  const [telefono, setTelefono]         = useState('');
  const [idRol, setIdRol]               = useState('');

  // UI
  const [mostrarPass, setMostrarPass]   = useState(false);
  const [error, setError]               = useState('');
  const [cargando, setCargando]         = useState(false);

  // Carga roles desde GET /api/roles 
  useEffect(() => {
    let cancelado = false;
    setRolesLoading(true);
    setRolesError('');

    rolesApi.findAll()
      .then((data) => {
        if (cancelado) return;
        if (data.length === 0) {
          // Si no hay roles, intentar hacer seed automáticamente
          return rolesApi.seed().then((res) => {
            if (!cancelado) {
              setRoles(res.roles);
              setIdRol(res.roles[0]?.id_rol.toString() ?? '');
            }
          });
        }
        setRoles(data);
        setIdRol(data[0].id_rol.toString());
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        const msg = e instanceof Error ? e.message : '';
        // Error de red: backend apagado
        if (msg.includes('fetch') || msg.includes('Failed') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
          setRolesError('No se puede conectar al servidor. Asegúrate de que el backend esté corriendo en el puerto 3001.');
        } else {
          setRolesError('No se pudieron cargar los roles: ' + msg);
        }
      })
      .finally(() => { if (!cancelado) setRolesLoading(false); });

    return () => { cancelado = true; };
  }, []);

  const rolSeleccionado = roles.find((r) => r.id_rol.toString() === idRol);
  const permisosInfo = rolSeleccionado
    ? (PERMISOS_ROL[rolSeleccionado.nombre.toLowerCase()] ?? 'Permisos asignados según el rol.')
    : '';

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim())         return setError('El nombre es obligatorio.');
    if (!identificacion.trim()) return setError('La identificación es obligatoria.');
    if (!correo.trim())         return setError('El correo es obligatorio.');
    if (!/\S+@\S+\.\S+/.test(correo)) return setError('El correo no tiene formato válido.');
    if (password.length < 8)   return setError('La contraseña debe tener mínimo 8 caracteres.');
    if (!idRol)                 return setError('Selecciona un rol.');

    setCargando(true);
    try {
      const payload: RegisterPayload = {
        nombre:         nombre.trim(),
        identificacion: identificacion.trim(),
        correo:         correo.trim().toLowerCase(),
        password,
        telefono:       telefono.trim() || undefined,
        id_rol:         Number(idRol),
      };

      // Registra → guarda token en localStorage
      await authApi.register(payload);
      // Hace login para sincronizar el AuthContext y redirigir
      await login({ correo: payload.correo, password: payload.password });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el usuario.';
      if (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('email')) {
        setError('Este correo ya está registrado en el sistema.');
      } else if (msg.toLowerCase().includes('identificaci')) {
        setError('Esta identificación ya está registrada en el sistema.');
      } else if (msg.includes('fetch') || msg.includes('Failed') || msg.includes('Network')) {
        setError('No se puede conectar al servidor. Verifica que el backend esté activo.');
      } else {
        setError(msg);
      }
    } finally {
      setCargando(false);
    }
  };

  // Render 
  return (
    <div className={`${styles.container} glass`} style={{ maxWidth: '480px' }}>
      <header className={styles.header}>
        <h1 className={styles.title}>GymFit</h1>
        <p className={styles.subtitle}>Crear cuenta del sistema</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>

        {/* Nombre */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nombre">Nombre completo *</label>
          <input id="nombre" type="text" placeholder="Ej: Juan Pérez" className={styles.input}
            value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={cargando} autoComplete="name" autoFocus />
        </div>

        {/* Identificación */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="identificacion">Número de identificación *</label>
          <input id="identificacion" type="text" placeholder="Ej: 1234567890" className={styles.input}
            value={identificacion} onChange={(e) => setId(e.target.value)} disabled={cargando} />
        </div>

        {/* Correo */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="correo">Correo electrónico *</label>
          <input id="correo" type="email" placeholder="usuario@gymfit.com" className={styles.input}
            value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={cargando} autoComplete="email" />
        </div>

        {/* Contraseña */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Contraseña * (mín. 8 caracteres)</label>
          <div style={{ position: 'relative' }}>
            <input id="password" type={mostrarPass ? 'text' : 'password'} placeholder="••••••••"
              className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={cargando} autoComplete="new-password" style={{ paddingRight: '3rem' }} />
            <button type="button" onClick={() => setMostrarPass((p) => !p)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}
              aria-label={mostrarPass ? 'Ocultar' : 'Mostrar'}>
              {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Teléfono */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" type="tel" placeholder="Ej: 3001234567" className={styles.input}
            value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={cargando} autoComplete="tel" />
        </div>

        {/* Rol */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="id_rol">Rol del sistema * (define los permisos)</label>

          {rolesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.9rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Cargando roles…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : rolesError ? (
            <div>
              <div style={{ padding: '0.9rem 1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.82rem', lineHeight: 1.5 }}>
                ⚠ {rolesError}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
                Verifica que el backend esté corriendo: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>npm run start:dev</code> en la carpeta <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>backend/</code>
              </p>
            </div>
          ) : (
            <>
              <select id="id_rol" className={styles.input} value={idRol}
                onChange={(e) => setIdRol(e.target.value)} disabled={cargando} style={{ cursor: 'pointer' }}>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}
                  </option>
                ))}
              </select>
              {permisosInfo && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(0,242,255,0.65)', marginTop: '5px', marginLeft: '4px', lineHeight: 1.5 }}>
                  <strong>Permisos:</strong> {permisosInfo}
                </p>
              )}
            </>
          )}
        </div>

        {/* Error general */}
        {error && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#f87171', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={cargando || rolesLoading || !!rolesError}>
          {cargando ? 'Creando cuenta…' : 'Crear Cuenta'}
        </button>
      </form>

      <footer className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className={styles.link}>Iniciar sesión</Link>
      </footer>
    </div>
  );
}
