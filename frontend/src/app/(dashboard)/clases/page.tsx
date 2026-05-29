"use client";

/**
 * clases/page.tsx — HU-14 (Creación de Clases) y HU-15 (Inscripción a Clases)
 *
 * Funcionalidades y Criterios de Aceptación cubiertos:
 *   ✓ Programación de clases por Admin/Entrenador con aforo, horario e instructor (HU-14)
 *   ✓ Reserva de cupo en tiempo real por el socio (HU-15)
 *   ✓ Validación estricta de membresía activa antes de permitir inscripción (HU-15)
 *   ✓ Descuento automático de cupo disponible tras reserva y liberación al cancelar (HU-15)
 *   ✓ Listado dinámico desde backend y consulta de participantes para personal
 *   ✓ Diseño Glassmorphic interactivo con transiciones de primer nivel
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, MapPin, Plus, RefreshCw, Users, Trash2, CheckCircle2, AlertTriangle, Shield, User, FileText } from 'lucide-react';
import { clasesApi, inscripcionesApi, entrenadoresApi, sociosApi, authApi, type Clase, type Inscripcion, type SocioCompleto, type Entrenador } from '@/lib/api';
import { canPerform } from '@/lib/rbac';
import styles from '@/styles/pages/dashboard/dashboard.module.css';

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  // Rol del usuario actual
  const [role, setRole] = useState<string>('');
  const [userLocal, setUserLocal] = useState<any>(null);
  
  // Datos específicos del socio logueado (HU-15)
  const [miPerfilSocio, setMiPerfilSocio] = useState<SocioCompleto | null>(null);
  const [misInscripciones, setMisInscripciones] = useState<Inscripcion[]>([]);
  
  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombre: '', horario: '', cupo: '20', id_entrenador: '' });
  
  const [modalInscribirAdmin, setModalInscribirAdmin] = useState(false);
  const [formInscribirAdmin, setFormInscribirAdmin] = useState({ id_socio: '', id_clase: '' });

  const [modalDetalles, setModalDetalles] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState<Clase | null>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string, tipo: 'ok' | 'err') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const user = authApi.getUsuarioLocal();
      setUserLocal(user);
      const rolStr = user?.rol?.toLowerCase() || '';
      setRole(rolStr);

      // Cargar clases generales
      const dataClases = await clasesApi.findAll();
      setClases(dataClases);

      // Cargar info según rol
      if (rolStr === 'admin' || rolStr === 'recepcionista' || rolStr === 'entrenador') {
        const [dataEntrenadores, dataSocios] = await Promise.all([
          entrenadoresApi.findAll(),
          sociosApi.findAll()
        ]);
        setEntrenadores(dataEntrenadores);
        setSocios(dataSocios.filter(s => s.usuario?.estado));
      }

      if (rolStr === 'socio') {
        // Cargar perfil socio (incluye membresías) para validar membresía activa
        const miPerfil = await sociosApi.getMiPerfil();
        setMiPerfilSocio(miPerfil);

        if (miPerfil) {
          // Cargar clases en las que está inscrito el socio
          const misInsc = await inscripcionesApi.findBySocio(miPerfil.id_socio);
          setMisInscripciones(misInsc);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar clases');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearClase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCrear.nombre.trim() || !formCrear.horario || !formCrear.cupo || !formCrear.id_entrenador) {
      showToast('Por favor completa todos los campos obligatorios', 'err');
      return;
    }
    setActionLoading(true);
    try {
      await clasesApi.create({
        nombre: formCrear.nombre.trim(),
        horario: new Date(formCrear.horario).toISOString(),
        cupo: parseInt(formCrear.cupo),
        id_entrenador: parseInt(formCrear.id_entrenador)
      });
      setModalCrear(false);
      setFormCrear({ nombre: '', horario: '', cupo: '20', id_entrenador: '' });
      cargarDatos();
      showToast('Clase programada exitosamente ✓', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al crear la clase', 'err');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReservarCupo = async (clase: Clase) => {
    if (!miPerfilSocio) return;
    
    // VALIDACIÓN ESTRICTA DE MEMBRESÍA ACTIVA (HU-15)
    const membresiaActiva = miPerfilSocio.membresias?.find(
      m => m.estado === 'activa' || m.estado === 'renovada'
    );

    if (!membresiaActiva) {
      showToast('No puedes inscribirte: Necesitas una membresía activa o renovada', 'err');
      return;
    }

    // Validar si hay cupo disponible
    const cupoInscrito = clase.inscripciones?.length || 0;
    if (cupoInscrito >= clase.cupo) {
      showToast('No hay cupos disponibles para esta clase', 'err');
      return;
    }

    setActionLoading(true);
    try {
      await inscripcionesApi.create({
        id_socio: miPerfilSocio.id_socio,
        id_clase: clase.id_clase
      });
      cargarDatos();
      showToast('¡Cupo reservado con éxito!', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al reservar cupo', 'err');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelarReserva = async (idInscripcion: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu reservación en esta clase? El cupo se liberará.')) return;
    setActionLoading(true);
    try {
      await inscripcionesApi.remove(idInscripcion);
      cargarDatos();
      showToast('Reservación cancelada y cupo liberado', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al cancelar la reservación', 'err');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInscribirSocioAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInscribirAdmin.id_clase || !formInscribirAdmin.id_socio) {
      showToast('Por favor selecciona el socio y la clase', 'err');
      return;
    }
    setActionLoading(true);
    try {
      await inscripcionesApi.create({
        id_socio: parseInt(formInscribirAdmin.id_socio),
        id_clase: parseInt(formInscribirAdmin.id_clase)
      });
      setModalInscribirAdmin(false);
      setFormInscribirAdmin({ id_socio: '', id_clase: '' });
      cargarDatos();
      showToast('Socio inscrito manualmente con éxito ✓', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al inscribir al socio', 'err');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminarClase = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la clase "${nombre}"? Se cancelarán todas las reservas.`)) return;
    setActionLoading(true);
    try {
      await clasesApi.remove(id);
      cargarDatos();
      showToast('Clase eliminada del cronograma', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar la clase', 'err');
    } finally {
      setActionLoading(false);
    }
  };

  const verParticipantes = async (clase: Clase) => {
    setClaseSeleccionada(clase);
    setModalDetalles(true);
    setCargandoParticipantes(true);
    try {
      const data = await inscripcionesApi.findByClase(clase.id_clase);
      setParticipantes(data || []);
    } catch (err: any) {
      showToast('No se pudieron obtener los participantes', 'err');
    } finally {
      setCargandoParticipantes(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatearHora = (fechaStr: string) => {
    const d = new Date(fechaStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const checkInscrito = (idClase: number) => {
    const encontrada = misInscripciones.find(i => i.clase.id_clase === idClase);
    return encontrada || null;
  };

  const isAdminOrTrainer = role === 'admin' || role === 'entrenador';
  const isAdminOrRecepcion = role === 'admin' || role === 'recepcionista';
  const hasActivePlan = miPerfilSocio?.membresias?.some(m => m.estado === 'activa' || m.estado === 'renovada');

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1100,
          background: toast.tipo === 'ok' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 600, animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
            <Calendar size={24} color="var(--primary)" />
            Calendario de Clases Grupales
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Programación y control de reservas en tiempo real.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cargarDatos} className="glass" style={{ padding: '0.8rem', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={20} className={cargando ? styles.spin : ''} />
          </button>
          
          {isAdminOrTrainer && (
            <button onClick={() => {
              if (entrenadores.length === 0) {
                showToast('Primero crea usuarios con rol de Entrenador', 'err');
                return;
              }
              setFormCrear(f => ({ ...f, id_entrenador: entrenadores[0]?.id_entrenador?.toString() || '' }));
              setModalCrear(true);
            }} style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none',
              padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}>
              <Plus size={20} />
              Programar Clase
            </button>
          )}

          {isAdminOrRecepcion && (
            <button onClick={() => {
              if (socios.length === 0 || clases.length === 0) {
                showToast('Se requiere tener clases y socios registrados', 'err');
                return;
              }
              setFormInscribirAdmin({ id_socio: socios[0]?.id_socio?.toString() || '', id_clase: clases[0]?.id_clase?.toString() || '' });
              setModalInscribirAdmin(true);
            }} style={{ 
              background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}>
              <Users size={18} />
              Inscribir Socio
            </button>
          )}
        </div>
      </div>

      {/* Banner de alerta de membresía para Socios */}
      {role === 'socio' && !hasActivePlan && !cargando && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center'
        }}>
          <AlertTriangle size={24} color="#f87171" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#f87171', margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>No tienes una membresía activa</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '0.85rem' }}>
              Para poder reservar tu cupo en clases grupales, debes tener un plan vinculado y activo. Por favor, acércate a la recepción o ponte en contacto con administración.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', color: '#f87171', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {/* Clases Schedule */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
        {cargando ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem', color: 'rgba(255,255,255,0.4)' }}>
            <RefreshCw size={24} className={styles.spin} />
            <p>Cargando cronograma...</p>
          </div>
        ) : clases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.4)' }}>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No hay clases programadas</p>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>{isAdminOrTrainer ? 'Presiona "Programar Clase" para agendar la primera.' : 'Vuelve más tarde para ver el cronograma.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {clases.map((cls) => {
              const inscritosCount = cls.inscripciones?.length || 0;
              const cuposDisponibles = cls.cupo - inscritosCount;
              const esLleno = cuposDisponibles <= 0;
              const esMitad = cuposDisponibles <= cls.cupo / 2;

              // Check if current socio is already enrolled in this class
              const miInscripcion = role === 'socio' ? checkInscrito(cls.id_clase) : null;

              return (
                <div key={cls.id_clase} style={{ 
                  display: 'flex', alignItems: 'center', padding: '1.25rem 1.5rem', 
                  background: 'rgba(255,255,255,0.02)', borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: `4px solid ${miInscripcion ? 'var(--primary)' : esLleno ? '#ef4444' : '#10b981'}`,
                  gap: '1.5rem', flexWrap: 'wrap', transition: 'all 0.2s'
                }}>
                  {/* Hora y Fecha */}
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                      <Clock size={15} color="var(--primary)" />
                      <span>{formatearHora(cls.horario)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                      <span>{formatearFecha(cls.horario)}</span>
                    </div>
                  </div>

                  {/* Nombre y Entrenador */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700, margin: 0 }}>{cls.nombre}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={12} /> Instructor: {cls.entrenador?.usuario?.nombre || 'General'}
                    </p>
                  </div>

                  {/* Aforo y Disponibilidad */}
                  <div style={{ minWidth: '130px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                      background: esLleno ? 'rgba(239, 68, 68, 0.12)' : esMitad ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: esLleno ? '#f87171' : esMitad ? '#fbbf24' : '#34d399'
                    }}>
                      <Users size={12} />
                      Cupo: {inscritosCount}/{cls.cupo}
                    </span>
                    <p style={{ margin: '4px 0 0 5px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {esLleno ? 'Agotado 🚫' : `Quedan ${cuposDisponibles} libres`}
                    </p>
                  </div>

                  {/* Botones de acción dinámicos */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {role === 'socio' ? (
                      miInscripcion ? (
                        <button 
                          onClick={() => handleCancelarReserva(miInscripcion.id_inscripcion)}
                          disabled={actionLoading}
                          style={{
                            background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700
                          }}
                        >
                          Cancelar Reserva
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReservarCupo(cls)}
                          disabled={actionLoading || esLleno || !hasActivePlan}
                          style={{
                            background: esLleno || !hasActivePlan ? 'rgba(255,255,255,0.03)' : 'var(--primary)',
                            color: esLleno || !hasActivePlan ? 'rgba(255,255,255,0.2)' : '#000',
                            border: esLleno || !hasActivePlan ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            padding: '0.5rem 1rem', borderRadius: '8px', cursor: esLleno || !hasActivePlan ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem', fontWeight: 700
                          }}
                        >
                          Reservar Cupo
                        </button>
                      )
                    ) : (
                      <>
                        <button 
                          onClick={() => verParticipantes(cls)}
                          style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          Ver Lista
                        </button>
                        
                        {role === 'admin' && (
                          <button 
                            onClick={() => handleEliminarClase(cls.id_clase, cls.nombre)}
                            disabled={actionLoading}
                            style={{ 
                              padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)',
                              background: 'transparent', color: '#f87171', cursor: 'pointer'
                            }}
                            title="Eliminar Clase"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Programar Clase (HU-14) */}
      {modalCrear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalCrear(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', borderRadius: '20px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
              Programar Nueva Clase
            </h3>
            <form onSubmit={handleCrearClase} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Nombre de la Clase *</label>
                <input required type="text" placeholder="Ej: Spinning Pro, Zumba, CrossFit" value={formCrear.nombre} onChange={e=>setFormCrear({...formCrear, nombre: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Horario (Fecha y Hora) *</label>
                <input required type="datetime-local" value={formCrear.horario} onChange={e=>setFormCrear({...formCrear, horario: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Cupo Máximo *</label>
                  <input required type="number" min="1" value={formCrear.cupo} onChange={e=>setFormCrear({...formCrear, cupo: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Instructor / Entrenador *</label>
                  <select value={formCrear.id_entrenador} onChange={e=>setFormCrear({...formCrear, id_entrenador: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                    {entrenadores.map(ent => (
                      <option key={ent.id_entrenador} value={ent.id_entrenador}>{ent.usuario?.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalCrear(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '10px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, background: 'var(--primary)', border: 'none', color: '#000', padding: '0.8rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                  {actionLoading ? 'Programando...' : 'Programar Clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inscribir Socio Manualmente (HU-15 por Recepcionista) */}
      {modalInscribirAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalInscribirAdmin(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', borderRadius: '20px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" />
              Inscribir Socio a Clase
            </h3>
            <form onSubmit={handleInscribirSocioAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Seleccionar Socio *</label>
                <select value={formInscribirAdmin.id_socio} onChange={e=>setFormInscribirAdmin({...formInscribirAdmin, id_socio: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                  {socios.map(s => (
                    <option key={s.id_socio} value={s.id_socio}>{s.usuario?.nombre} ({s.usuario?.identificacion})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Seleccionar Clase Grupal *</label>
                <select value={formInscribirAdmin.id_clase} onChange={e=>setFormInscribirAdmin({...formInscribirAdmin, id_clase: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                  {clases.map(c => (
                    <option key={c.id_clase} value={c.id_clase}>{c.nombre} - {formatearHora(c.horario)} ({formatearFecha(c.horario)})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalInscribirAdmin(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '10px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', color: '#000', padding: '0.8rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                  {actionLoading ? 'Registrando...' : 'Inscribir Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lista de Participantes */}
      {modalDetalles && claseSeleccionada && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalDetalles(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{claseSeleccionada.nombre}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} /> {formatearHora(claseSeleccionada.horario)} | {formatearFecha(claseSeleccionada.horario)}
            </p>

            <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
              Socios Inscritos ({participantes.length} / {claseSeleccionada.cupo})
            </h4>

            {cargandoParticipantes ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.4)' }}>
                <RefreshCw size={20} className={styles.spin} />
              </div>
            ) : participantes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.3)' }}>
                <Users size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
                <p>No hay socios reservados en esta clase aún.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                {participantes.map((part) => (
                  <div key={part.id_inscripcion} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {part.socio?.usuario?.nombre?.substring(0, 2).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0 }}>{part.socio?.usuario?.nombre}</p>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Cédula: {part.socio?.usuario?.identificacion}</span>
                      </div>
                    </div>
                    {role === 'admin' && (
                      <button 
                        onClick={() => {
                          if (confirm(`¿Remover a ${part.socio?.usuario?.nombre} de esta clase?`)) {
                            handleCancelarReserva(part.id_inscripcion);
                            setModalDetalles(false);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        title="Remover Inscripción"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setModalDetalles(false)} style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Animation CSS */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
