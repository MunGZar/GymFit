"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import {
  Dumbbell, Plus, Search, RefreshCw, X, AlertCircle,
  Pencil, Trash2, CheckCircle, BookOpen, Filter,
} from 'lucide-react';
import { ejerciciosApi, type Ejercicio, type CreateEjercicioPayload } from '@/lib/api';
import { authApi } from '@/lib/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const GRUPOS_MUSCULARES = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Abdomen', 'Cuádriceps', 'Isquiotibiales', 'Glúteos',
  'Pantorrillas', 'Cardio', 'Funcional', 'Otro',
];

const grupoColor: Record<string, string> = {
  Pecho:          '#00f2ff',
  Espalda:        '#b026ff',
  Hombros:        '#ff9f43',
  Bíceps:         '#00d2d3',
  Tríceps:        '#ff6b81',
  Abdomen:        '#ffd32a',
  Cuádriceps:     '#0be881',
  Isquiotibiales: '#f8b739',
  Glúteos:        '#ff4d4d',
  Pantorrillas:   '#48dbfb',
  Cardio:         '#ff5e57',
  Funcional:      '#54a0ff',
  Otro:           '#8395a7',
};

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  color: '#fff',
  outline: 'none',
  fontSize: '0.9rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: '6px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');
  const [busqueda, setBusqueda]     = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');

  // Modales
  const [modalForm, setModalForm]     = useState(false);
  const [modalElim, setModalElim]     = useState(false);
  const [editando, setEditando]       = useState<Ejercicio | null>(null);
  const [eliminando, setEliminando]   = useState<Ejercicio | null>(null);

  // Form
  const [form, setForm] = useState<CreateEjercicioPayload>({
    nombre: '', descripcion: '', grupo_muscular: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const userLocal = authApi.getUsuarioLocal();
  const canManage = ['admin', 'entrenador'].includes(userLocal?.rol?.toLowerCase() ?? '');

  // ─── Datos ──────────────────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await ejerciciosApi.findAll();
      setEjercicios(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ─── Toast ───────────────────────────────────────────────────────────────

  function mostrarToast(msg: string, tipo: 'ok' | 'err') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Abrir modal crear / editar ───────────────────────────────────────────

  function abrirCrear() {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', grupo_muscular: '' });
    setModalForm(true);
  }

  function abrirEditar(ej: Ejercicio) {
    setEditando(ej);
    setForm({
      nombre:          ej.nombre,
      descripcion:     ej.descripcion ?? '',
      grupo_muscular:  ej.grupo_muscular ?? '',
    });
    setModalForm(true);
  }

  // ─── Guardar (crear o editar) ─────────────────────────────────────────────

  async function handleGuardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.nombre.trim()) return;
    setFormLoading(true);
    try {
      const payload: CreateEjercicioPayload = {
        nombre:         form.nombre.trim(),
        descripcion:    form.descripcion?.trim() || undefined,
        grupo_muscular: form.grupo_muscular?.trim() || undefined,
      };

      if (editando) {
        await ejerciciosApi.update(editando.id_ejercicio, payload);
        mostrarToast(`"${payload.nombre}" actualizado ✓`, 'ok');
      } else {
        await ejerciciosApi.create(payload);
        mostrarToast(`"${payload.nombre}" agregado al catálogo ✓`, 'ok');
      }

      setModalForm(false);
      await cargarDatos();
    } catch (err: unknown) {
      mostrarToast(err instanceof Error ? err.message : 'Error al guardar', 'err');
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Eliminar ─────────────────────────────────────────────────────────────

  function pedirEliminar(ej: Ejercicio) {
    setEliminando(ej);
    setModalElim(true);
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    setFormLoading(true);
    try {
      await ejerciciosApi.remove(eliminando.id_ejercicio);
      mostrarToast(`"${eliminando.nombre}" eliminado`, 'ok');
      setModalElim(false);
      setEliminando(null);
      await cargarDatos();
    } catch (err: unknown) {
      mostrarToast(err instanceof Error ? err.message : 'Error al eliminar', 'err');
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Filtros ─────────────────────────────────────────────────────────────

  const filtrados = ejercicios.filter(e =>
    (e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     (e.grupo_muscular?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
     (e.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)) &&
    (grupoFiltro === '' || e.grupo_muscular === grupoFiltro)
  );

  // Agrupar por grupo muscular para la vista de catálogo
  const porGrupo = filtrados.reduce<Record<string, Ejercicio[]>>((acc, ej) => {
    const g = ej.grupo_muscular ?? 'Sin grupo';
    if (!acc[g]) acc[g] = [];
    acc[g].push(ej);
    return acc;
  }, {});

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          background: toast.tipo === 'ok' ? 'rgba(0,200,120,0.18)' : 'rgba(255,60,60,0.18)',
          border: `1px solid ${toast.tipo === 'ok' ? 'rgba(0,200,120,0.5)' : 'rgba(255,60,60,0.5)'}`,
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '14px',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: '360px',
        }}>
          {toast.tipo === 'ok' ? <CheckCircle size={18} color="#00c878" /> : <AlertCircle size={18} color="#ff4757" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
            <BookOpen size={24} color="var(--primary)" /> Catálogo de Ejercicios
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Biblioteca de ejercicios disponibles para armar rutinas
          </p>
        </div>
        {canManage && (
          <button
            onClick={abrirCrear}
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}
          >
            <Plus size={16} /> Nuevo Ejercicio
          </button>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
          <input
            type="text" placeholder="Buscar ejercicio..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <select
            value={grupoFiltro} onChange={e => setGrupoFiltro(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: '170px' }}
          >
            <option value="">Todos los grupos</option>
            {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <button
          onClick={cargarDatos}
          title="Refrescar"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={cargando ? styles.spin : ''} />
        </button>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
          {filtrados.length} ejercicio{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: '12px', color: '#ff6b6b', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Contenido */}
      {cargando ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
          Cargando catálogo...
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
          No se encontraron ejercicios.{canManage && ' Agrega el primero con "Nuevo Ejercicio".'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(porGrupo).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, lista]) => {
            const color = grupoColor[grupo] ?? '#8395a7';
            return (
              <div key={grupo}>
                {/* Cabecera de grupo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color, letterSpacing: '0.04em' }}>
                    {grupo}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px' }}>
                    {lista.length}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: `${color}22` }} />
                </div>

                {/* Grid de cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {lista.map(ej => (
                    <div key={ej.id_ejercicio} className="glass" style={{ borderRadius: '14px', padding: '1.2rem 1.3rem', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: `3px solid ${color}55` }}>
                      {/* Nombre + acciones */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <Dumbbell size={16} color={color} style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>{ej.nombre}</span>
                        </div>
                        {canManage && (
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button
                              onClick={() => abrirEditar(ej)}
                              title="Editar"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '5px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => pedirEliminar(ej)}
                              title="Eliminar"
                              style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: 'rgba(255,100,100,0.8)', padding: '5px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Grupo muscular badge */}
                      <span style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '2px 9px', borderRadius: '20px', background: `${color}18`, color, border: `1px solid ${color}33`, fontWeight: 600 }}>
                        💪 {ej.grupo_muscular ?? 'Sin grupo'}
                      </span>

                      {/* Descripción */}
                      {ej.descripcion && (
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
                          {ej.descripcion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CREAR / EDITAR EJERCICIO
      ══════════════════════════════════════════════════════ */}
      {modalForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setModalForm(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '22px', padding: '2rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dumbbell size={18} color="var(--primary)" />
                {editando ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </h3>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  style={inputStyle}
                  placeholder="Ej: Press de banca"
                />
              </div>

              <div>
                <label style={labelStyle}>Grupo Muscular</label>
                <select
                  value={form.grupo_muscular ?? ''}
                  onChange={e => setForm(f => ({ ...f, grupo_muscular: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">— Sin grupo —</option>
                  {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Descripción / Instrucciones</label>
                <textarea
                  rows={3}
                  value={form.descripcion ?? ''}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Descripción del ejercicio, músculos trabajados, técnica..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalForm(false)}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !form.nombre.trim()}
                  style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', padding: '0.85rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: formLoading || !form.nombre.trim() ? 'not-allowed' : 'pointer', opacity: formLoading || !form.nombre.trim() ? 0.55 : 1 }}
                >
                  {formLoading ? 'Guardando...' : editando ? '✓ Guardar cambios' : '✓ Agregar al catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CONFIRMAR ELIMINAR
      ══════════════════════════════════════════════════════ */}
      {modalElim && eliminando && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setModalElim(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ¿Eliminar ejercicio?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#fff' }}>{eliminando.nombre}</strong> será eliminado del catálogo.
              Las rutinas que lo usen pueden verse afectadas.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setModalElim(false)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={formLoading}
                style={{ flex: 1, background: 'rgba(255,60,60,0.2)', border: '1px solid rgba(255,60,60,0.4)', color: '#ff6b6b', padding: '0.85rem', borderRadius: '10px', fontWeight: 700, cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.5 : 1 }}
              >
                {formLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
