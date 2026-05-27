"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import {
  ClipboardList, Plus, Search, Dumbbell, Send, RefreshCw, X,
  ChevronDown, ChevronUp, Timer, RotateCcw, Target, Trash2,
  PlusCircle, AlertCircle, BookOpen, Pencil, CheckCircle,
} from 'lucide-react';
import {
  rutinasApi, ejerciciosApi, sociosApi,
  type Rutina, type Ejercicio, type SocioCompleto,
  type RutinaEjercicioItem,
} from '@/lib/api';
import { authApi } from '@/lib/api';

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface EjercicioEnForm {
  id_ejercicio: number;
  nombre: string;
  series: string;
  repeticiones: string;
  descanso: string;
  observaciones: string;
}

const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];

const nivelColor: Record<string, string> = {
  Básico: '#00f2ff',
  Intermedio: '#b026ff',
  Avanzado: '#ff4757',
};

const GRUPOS_MUSCULARES = [
  'Todos', 'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Abdomen', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 'Cardio', 'Otro',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDescanso(seg: number | null): string {
  if (!seg) return '—';
  if (seg < 60) return `${seg}s`;
  return `${Math.floor(seg / 60)}min ${seg % 60 > 0 ? `${seg % 60}s` : ''}`.trim();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RutinasPage() {
  const [rutinas, setRutinas]       = useState<Rutina[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [socios, setSocios]         = useState<SocioCompleto[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');
  const [busqueda, setBusqueda]     = useState('');
  const [nivelFiltro, setNivelFiltro] = useState('');

  // Cards expandidas
  const [expandida, setExpandida] = useState<number | null>(null);

  // Modales
  const [modalCrear, setModalCrear]           = useState(false);
  const [modalAsignar, setModalAsignar]       = useState(false);
  const [modalCatalogo, setModalCatalogo]     = useState(false); // catálogo sobre rutina existente
  const [rutinaEditando, setRutinaEditando]   = useState<Rutina | null>(null);

  // Form crear rutina
  const [formRutina, setFormRutina] = useState({
    nombre: '', descripcion: '', nivel: 'Básico', objetivo: '',
  });
  const [ejerciciosForm, setEjerciciosForm] = useState<EjercicioEnForm[]>([]);
  const [ejercicioSelId, setEjercicioSelId] = useState('');

  // Estado catálogo modal
  const [catalogoBusqueda, setCatalogoBusqueda]   = useState('');
  const [catalogoGrupo, setCatalogoGrupo]         = useState('Todos');
  const [catalogoAgregando, setCatalogoAgregando] = useState<number | null>(null);

  // Form asignar
  const [formAsignar, setFormAsignar] = useState({
    id_rutina: '',
    id_socio: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const userLocal = authApi.getUsuarioLocal();
  const canCreate = ['admin', 'entrenador'].includes(userLocal?.rol?.toLowerCase() ?? '');

  // ─── Datos ────────────────────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [r, e, s] = await Promise.all([
        rutinasApi.findAll(),
        ejerciciosApi.findAll(),
        sociosApi.findAll(),
      ]);
      setRutinas(r);
      setEjercicios(e);
      setSocios(s);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(msg);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ─── Toast ────────────────────────────────────────────────────────────────

  function mostrarToast(msg: string, tipo: 'ok' | 'err') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Ejercicios en el form de creación ───────────────────────────────────

  function agregarEjercicio() {
    const id = Number(ejercicioSelId);
    if (!id) return;
    const ej = ejercicios.find(e => e.id_ejercicio === id);
    if (!ej) return;
    if (ejerciciosForm.some(e => e.id_ejercicio === id)) {
      mostrarToast('Ese ejercicio ya está en la rutina.', 'err');
      return;
    }
    setEjerciciosForm(prev => [
      ...prev,
      { id_ejercicio: id, nombre: ej.nombre, series: '3', repeticiones: '12', descanso: '60', observaciones: '' },
    ]);
    setEjercicioSelId('');
  }

  function quitarEjercicio(idx: number) {
    setEjerciciosForm(prev => prev.filter((_, i) => i !== idx));
  }

  function actualizarEj(idx: number, campo: keyof EjercicioEnForm, valor: string) {
    setEjerciciosForm(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: valor } : e));
  }

  // ─── Crear rutina ─────────────────────────────────────────────────────────

  async function handleCrearRutina(ev: React.FormEvent) {
    ev.preventDefault();
    if (!formRutina.nombre.trim()) return;
    setFormLoading(true);
    try {
      await rutinasApi.create({
        nombre:      formRutina.nombre.trim(),
        descripcion: formRutina.descripcion.trim() || undefined,
        nivel:       formRutina.nivel || undefined,
        objetivo:    formRutina.objetivo.trim() || undefined,
        ejercicios:  ejerciciosForm.map(e => ({
          id_ejercicio: e.id_ejercicio,
          series:       e.series       ? Number(e.series)       : undefined,
          repeticiones: e.repeticiones ? Number(e.repeticiones) : undefined,
          descanso:     e.descanso     ? Number(e.descanso)     : undefined,
          observaciones: e.observaciones || undefined,
        })),
      });
      setModalCrear(false);
      resetFormCrear();
      await cargarDatos();
      mostrarToast('Rutina creada correctamente ✓', 'ok');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear rutina';
      mostrarToast(msg, 'err');
    } finally {
      setFormLoading(false);
    }
  }

  function resetFormCrear() {
    setFormRutina({ nombre: '', descripcion: '', nivel: 'Básico', objetivo: '' });
    setEjerciciosForm([]);
    setEjercicioSelId('');
  }

  // ─── Catálogo: agregar ejercicio a rutina existente ───────────────────────

  function abrirCatalogo(rutina: Rutina) {
    setRutinaEditando(rutina);
    setCatalogoBusqueda('');
    setCatalogoGrupo('Todos');
    setModalCatalogo(true);
  }

  async function agregarDesdesCatalogo(ejercicio: Ejercicio) {
    if (!rutinaEditando) return;
    // Verificar si ya está en la rutina
    const yaEsta = rutinaEditando.rutina_ejercicios?.some(
      re => re.ejercicio.id_ejercicio === ejercicio.id_ejercicio
    );
    if (yaEsta) {
      mostrarToast(`"${ejercicio.nombre}" ya está en esta rutina.`, 'err');
      return;
    }
    setCatalogoAgregando(ejercicio.id_ejercicio);
    try {
      await rutinasApi.agregarEjercicio(rutinaEditando.id_rutina, {
        id_ejercicio: ejercicio.id_ejercicio,
        series: 3,
        repeticiones: 12,
        descanso: 60,
      });
      // Recargar rutinas para actualizar la lista de ejercicios
      const rutinasActualizadas = await rutinasApi.findAll();
      setRutinas(rutinasActualizadas);
      // Actualizar rutinaEditando
      const rutinaActualizada = rutinasActualizadas.find(r => r.id_rutina === rutinaEditando.id_rutina);
      if (rutinaActualizada) setRutinaEditando(rutinaActualizada);
      mostrarToast(`"${ejercicio.nombre}" agregado a la rutina ✓`, 'ok');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar ejercicio';
      mostrarToast(msg, 'err');
    } finally {
      setCatalogoAgregando(null);
    }
  }

  async function quitarEjercicioDeRutina(rutina: Rutina, reId: number, nombre: string) {
    try {
      await rutinasApi.quitarEjercicio(rutina.id_rutina, reId);
      const rutinasActualizadas = await rutinasApi.findAll();
      setRutinas(rutinasActualizadas);
      if (rutinaEditando?.id_rutina === rutina.id_rutina) {
        const actualizada = rutinasActualizadas.find(r => r.id_rutina === rutina.id_rutina);
        if (actualizada) setRutinaEditando(actualizada);
      }
      mostrarToast(`"${nombre}" quitado de la rutina ✓`, 'ok');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al quitar ejercicio';
      mostrarToast(msg, 'err');
    }
  }

  // ─── Asignar rutina ───────────────────────────────────────────────────────

  async function handleAsignar(ev: React.FormEvent) {
    ev.preventDefault();
    setFormLoading(true);
    try {
      await rutinasApi.asignar({
        id_rutina:        Number(formAsignar.id_rutina),
        id_socio:         Number(formAsignar.id_socio),
        fecha_asignacion: formAsignar.fecha,
      });
      setModalAsignar(false);
      setFormAsignar({ id_rutina: '', id_socio: '', fecha: new Date().toISOString().split('T')[0] });
      mostrarToast('Rutina asignada correctamente ✓', 'ok');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al asignar';
      mostrarToast(msg, 'err');
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Filtros ──────────────────────────────────────────────────────────────

  const filtradas = rutinas.filter(r =>
    (r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     (r.descripcion?.toLowerCase().includes(busqueda.toLowerCase()))) &&
    (nivelFiltro === '' || r.nivel === nivelFiltro)
  );

  const ejerciciosCatalogoBusq = ejercicios.filter(e =>
    (e.nombre.toLowerCase().includes(catalogoBusqueda.toLowerCase()) ||
     (e.grupo_muscular?.toLowerCase().includes(catalogoBusqueda.toLowerCase()))) &&
    (catalogoGrupo === 'Todos' || e.grupo_muscular === catalogoGrupo)
  );

  // ─── Estilos compartidos ──────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '0.75rem 1rem', borderRadius: '10px',
    color: '#fff', outline: 'none', fontSize: '0.9rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.45)', marginBottom: '6px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

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
          {toast.tipo === 'ok'
            ? <span style={{ fontSize: '1.2rem' }}>✅</span>
            : <AlertCircle size={20} color="#ff4757" />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
            <ClipboardList size={24} color="var(--primary)" /> Gestión de Rutinas
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Crea planes de entrenamiento · agrega ejercicios del catálogo · asigna a socios
          </p>
        </div>

        {canCreate && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModalAsignar(true)}
              style={{ background: 'rgba(176,38,255,0.15)', color: '#b026ff', border: '1px solid #b026ff', padding: '0.75rem 1.2rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              <Send size={16} /> Asignar a Socio
            </button>
            <button
              onClick={() => { resetFormCrear(); setModalCrear(true); }}
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.75rem 1.2rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              <Plus size={16} /> Nueva Rutina
            </button>
          </div>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
          <input
            type="text" placeholder="Buscar rutina..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
          />
        </div>
        <select
          value={nivelFiltro} onChange={e => setNivelFiltro(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}
        >
          <option value="">Todos los niveles</option>
          {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button
          onClick={cargarDatos}
          title="Refrescar"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={cargando ? styles.spin : ''} />
        </button>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>{filtradas.length} rutina(s)</span>
      </div>

      {/* Error global */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: '12px', color: '#ff6b6b', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Grid de rutinas */}
      {cargando ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
          Cargando rutinas...
        </div>
      ) : filtradas.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
          No se encontraron rutinas. {canCreate && 'Crea la primera con el botón "Nueva Rutina".'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filtradas.map(rutina => {
            const abierta = expandida === rutina.id_rutina;
            const numEj   = rutina.rutina_ejercicios?.length ?? 0;
            const nivel   = rutina.nivel ?? 'Sin nivel';

            return (
              <div key={rutina.id_rutina} className="glass" style={{ borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header card */}
                <div style={{ padding: '1.4rem 1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(0,242,255,0.1)', borderRadius: '12px', color: 'var(--primary)', flexShrink: 0 }}>
                    <Dumbbell size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rutina.nombre}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px', background: `${nivelColor[nivel] ?? '#888'}22`, color: nivelColor[nivel] ?? '#aaa', border: `1px solid ${nivelColor[nivel] ?? '#888'}44`, fontWeight: 700 }}>
                        {nivel}
                      </span>
                      {rutina.objetivo && (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Target size={11} /> {rutina.objetivo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {rutina.descripcion && (
                  <p style={{ padding: '0 1.5rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    {rutina.descripcion}
                  </p>
                )}

                {/* Footer card */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setExpandida(abierta ? null : rutina.id_rutina)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: 0 }}
                  >
                    {abierta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {numEj} ejercicio{numEj !== 1 ? 's' : ''}
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {canCreate && (
                      <>
                        <button
                          onClick={() => abrirCatalogo(rutina)}
                          title="Gestionar ejercicios de esta rutina"
                          style={{ background: 'rgba(0,242,255,0.08)', border: '1px solid rgba(0,242,255,0.25)', color: 'var(--primary)', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <BookOpen size={13} /> Catálogo
                        </button>
                        <button
                          onClick={() => {
                            setFormAsignar(f => ({ ...f, id_rutina: String(rutina.id_rutina) }));
                            setModalAsignar(true);
                          }}
                          style={{ background: 'rgba(176,38,255,0.1)', border: '1px solid rgba(176,38,255,0.3)', color: '#b026ff', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <Send size={13} /> Asignar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Detalle de ejercicios (expandible) */}
                {abierta && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {numEj === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '0.5rem' }}>
                        Sin ejercicios. {canCreate && <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => abrirCatalogo(rutina)}>Agregar desde catálogo →</span>}
                      </p>
                    ) : (
                      rutina.rutina_ejercicios!.map((re, idx) => (
                        <div key={re.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                              {idx + 1}. {re.ejercicio.nombre}
                            </span>
                            {canCreate && (
                              <button
                                onClick={() => quitarEjercicioDeRutina(rutina, re.id, re.ejercicio.nombre)}
                                title="Quitar de la rutina"
                                style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.6)', cursor: 'pointer', padding: '2px' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          {re.ejercicio.grupo_muscular && (
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                              💪 {re.ejercicio.grupo_muscular}
                            </span>
                          )}
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <RotateCcw size={12} color="var(--primary)" />
                              {re.series ?? '—'} series × {re.repeticiones ?? '—'} reps
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Timer size={12} color="#b026ff" />
                              Descanso: {fmtDescanso(re.descanso)}
                            </span>
                          </div>
                          {re.observaciones && (
                            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px', fontStyle: 'italic' }}>
                              📝 {re.observaciones}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: CATÁLOGO DE EJERCICIOS → agregar a rutina existente
      ══════════════════════════════════════════════════════════════════════ */}
      {modalCatalogo && rutinaEditando && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}
          onClick={() => setModalCatalogo(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '760px', borderRadius: '22px', padding: '2rem', marginTop: '1rem', marginBottom: '1rem' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Título */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" /> Catálogo de Ejercicios
              </h3>
              <button onClick={() => setModalCatalogo(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem' }}>
              Rutina: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{rutinaEditando.nombre}</span>
              {' '}· {rutinaEditando.rutina_ejercicios?.length ?? 0} ejercicio(s) actuales
            </p>

            {/* Barra de búsqueda catálogo */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type="text" placeholder="Buscar ejercicio..."
                  value={catalogoBusqueda} onChange={e => setCatalogoBusqueda(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                />
              </div>
              <select
                value={catalogoGrupo} onChange={e => setCatalogoGrupo(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: '150px', fontSize: '0.85rem' }}
              >
                {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Ejercicios en la rutina (actuales) */}
            {rutinaEditando.rutina_ejercicios && rutinaEditando.rutina_ejercicios.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  En esta rutina
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {rutinaEditando.rutina_ejercicios.map(re => (
                    <div key={re.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,242,255,0.08)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '20px', padding: '4px 10px 4px 8px', fontSize: '0.78rem', color: 'var(--primary)' }}>
                      <CheckCircle size={12} />
                      <span>{re.ejercicio.nombre}</span>
                      <button
                        onClick={() => quitarEjercicioDeRutina(rutinaEditando, re.id, re.ejercicio.nombre)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.7)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        title="Quitar"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid catálogo */}
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Catálogo ({ejerciciosCatalogoBusq.length} ejercicio{ejerciciosCatalogoBusq.length !== 1 ? 's' : ''})
            </p>

            {ejerciciosCatalogoBusq.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem', fontSize: '0.85rem' }}>
                No se encontraron ejercicios con ese filtro.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {ejerciciosCatalogoBusq.map(ej => {
                  const enRutina = rutinaEditando.rutina_ejercicios?.some(
                    re => re.ejercicio.id_ejercicio === ej.id_ejercicio
                  );
                  const agregando = catalogoAgregando === ej.id_ejercicio;

                  return (
                    <div
                      key={ej.id_ejercicio}
                      style={{
                        background: enRutina ? 'rgba(0,242,255,0.06)' : 'rgba(0,0,0,0.25)',
                        border: enRutina ? '1px solid rgba(0,242,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: enRutina ? 'var(--primary)' : '#fff', lineHeight: 1.3 }}>
                          {ej.nombre}
                        </span>
                        {enRutina && <CheckCircle size={14} color="var(--primary)" style={{ flexShrink: 0 }} />}
                      </div>
                      {ej.grupo_muscular && (
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: '10px', alignSelf: 'flex-start' }}>
                          💪 {ej.grupo_muscular}
                        </span>
                      )}
                      {ej.descripcion && (
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4, marginTop: '2px' }}>
                          {ej.descripcion.length > 60 ? ej.descripcion.slice(0, 60) + '…' : ej.descripcion}
                        </p>
                      )}
                      <button
                        onClick={() => enRutina
                          ? quitarEjercicioDeRutina(
                              rutinaEditando,
                              rutinaEditando.rutina_ejercicios!.find(re => re.ejercicio.id_ejercicio === ej.id_ejercicio)!.id,
                              ej.nombre
                            )
                          : agregarDesdesCatalogo(ej)
                        }
                        disabled={agregando}
                        style={{
                          marginTop: '4px',
                          padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none',
                          background: enRutina ? 'rgba(255,80,80,0.12)' : 'rgba(0,242,255,0.12)',
                          color: enRutina ? '#ff6b6b' : 'var(--primary)',
                          cursor: agregando ? 'not-allowed' : 'pointer',
                          fontWeight: 700, fontSize: '0.78rem',
                          display: 'flex', alignItems: 'center', gap: '5px',
                          opacity: agregando ? 0.5 : 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        {agregando
                          ? 'Agregando...'
                          : enRutina
                            ? <><Trash2 size={12} /> Quitar</>
                            : <><PlusCircle size={12} /> Agregar</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: CREAR RUTINA
      ══════════════════════════════════════════════════════════════════════ */}
      {modalCrear && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}
          onClick={() => setModalCrear(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '680px', borderRadius: '22px', padding: '2rem', marginTop: '1rem', marginBottom: '1rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} color="var(--primary)" /> Nueva Rutina
              </h3>
              <button onClick={() => setModalCrear(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCrearRutina} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Nombre de la Rutina *</label>
                <input
                  required value={formRutina.nombre}
                  onChange={e => setFormRutina(f => ({ ...f, nombre: e.target.value }))}
                  style={inputStyle} placeholder="Ej: Full Body A"
                />
              </div>
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  rows={2} value={formRutina.descripcion}
                  onChange={e => setFormRutina(f => ({ ...f, descripcion: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Descripción general..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nivel</label>
                  <select value={formRutina.nivel} onChange={e => setFormRutina(f => ({ ...f, nivel: e.target.value }))} style={inputStyle}>
                    {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Objetivo</label>
                  <input value={formRutina.objetivo} onChange={e => setFormRutina(f => ({ ...f, objetivo: e.target.value }))} style={inputStyle} placeholder="Ej: Fuerza, Resistencia..." />
                </div>
              </div>

              {/* Sección Ejercicios */}
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,242,255,0.06)', padding: '0.85rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dumbbell size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ejercicios de la Rutina</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{ejerciciosForm.length} agregado(s)</span>
                </div>

                <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={ejercicioSelId} onChange={e => setEjercicioSelId(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      <option value="">— Seleccionar ejercicio del catálogo —</option>
                      {ejercicios.map(e => (
                        <option key={e.id_ejercicio} value={e.id_ejercicio}>
                          {e.nombre}{e.grupo_muscular ? ` (${e.grupo_muscular})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button" onClick={agregarEjercicio} disabled={!ejercicioSelId}
                      style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '0.75rem 1rem', borderRadius: '10px', cursor: ejercicioSelId ? 'pointer' : 'not-allowed', opacity: ejercicioSelId ? 1 : 0.45, display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}
                    >
                      <PlusCircle size={16} /> Agregar
                    </button>
                  </div>

                  {ejerciciosForm.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', padding: '0.5rem' }}>
                      Selecciona ejercicios del catálogo y configura series, repeticiones y descanso.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ejerciciosForm.map((ej, idx) => (
                        <div key={ej.id_ejercicio} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{idx + 1}. {ej.nombre}</span>
                            <button type="button" onClick={() => quitarEjercicio(idx)} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.7)', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                            <div>
                              <label style={labelStyle}>Series</label>
                              <input type="number" min={1} value={ej.series} onChange={e => actualizarEj(idx, 'series', e.target.value)} style={inputStyle} placeholder="3" />
                            </div>
                            <div>
                              <label style={labelStyle}>Repeticiones</label>
                              <input type="number" min={1} value={ej.repeticiones} onChange={e => actualizarEj(idx, 'repeticiones', e.target.value)} style={inputStyle} placeholder="12" />
                            </div>
                            <div>
                              <label style={labelStyle}>Descanso (seg)</label>
                              <input type="number" min={0} value={ej.descanso} onChange={e => actualizarEj(idx, 'descanso', e.target.value)} style={inputStyle} placeholder="60" />
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Observaciones técnicas</label>
                            <input value={ej.observaciones} onChange={e => actualizarEj(idx, 'observaciones', e.target.value)} style={inputStyle} placeholder="Ej: Mantener espalda recta..." />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={formLoading} type="submit"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.6 : 1, fontSize: '0.95rem' }}
              >
                {formLoading ? 'Guardando...' : '✓ Crear Rutina'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ASIGNAR RUTINA A SOCIO
      ══════════════════════════════════════════════════════════════════════ */}
      {modalAsignar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setModalAsignar(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '460px', borderRadius: '22px', padding: '2rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#b026ff" /> Asignar Rutina a Socio
              </h3>
              <button onClick={() => setModalAsignar(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAsignar} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Rutina *</label>
                <select required value={formAsignar.id_rutina} onChange={e => setFormAsignar(f => ({ ...f, id_rutina: e.target.value }))} style={inputStyle}>
                  <option value="">Seleccionar rutina...</option>
                  {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Socio *</label>
                <select required value={formAsignar.id_socio} onChange={e => setFormAsignar(f => ({ ...f, id_socio: e.target.value }))} style={inputStyle}>
                  <option value="">Seleccionar socio...</option>
                  {socios.map(s => (
                    <option key={s.id_socio} value={s.id_socio}>
                      {s.usuario.nombre} — {s.usuario.identificacion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fecha de Asignación *</label>
                <input required type="date" value={formAsignar.fecha} onChange={e => setFormAsignar(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalAsignar(false)} style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  disabled={formLoading || !formAsignar.id_socio || !formAsignar.id_rutina} type="submit"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #b026ff, var(--primary))', color: '#fff', padding: '0.85rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (formLoading || !formAsignar.id_socio || !formAsignar.id_rutina) ? 0.5 : 1 }}
                >
                  {formLoading ? 'Asignando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
