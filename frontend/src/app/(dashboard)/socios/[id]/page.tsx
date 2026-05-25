"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { User, Activity, Dumbbell, Calendar, ChevronLeft, CreditCard, Plus, Save, TrendingUp, History, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  sociosApi, evaluacionesApi, progresoApi, authApi, rutinasApi,
  type SocioCompleto, type Evaluacion, type ComparativaProgreso, type AsignacionRutina 
} from '@/lib/api';
import { canPerform, hasPermission } from '@/lib/rbac';

export default function SocioProfilePage() {
  const { id } = useParams();
  const [socio, setSocio] = useState<SocioCompleto | null>(null);
  const [comparativa, setComparativa] = useState<ComparativaProgreso | null>(null);
  const [rutinasAsignadas, setRutinasAsignadas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Selector de métrica para el gráfico de progreso (HU-10)
  const [metricaProgreso, setMetricaProgreso] = useState<'peso' | 'grasa'>('peso');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Formulario nueva medición
  const [modalMedicion, setModalMedicion] = useState(false);
  const [formMed, setFormMed] = useState({ peso: '', grasa: '', medidas: '', fecha: new Date().toISOString().split('T')[0] });
  const [formLoading, setFormLoading] = useState(false);

  const [userLocal, setUserLocal] = useState<any>(null);

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    try {
      setUserLocal(authApi.getUsuarioLocal());
      const [s, c, r] = await Promise.all([
        sociosApi.findOne(Number(id)),
        progresoApi.getComparativa(Number(id)),
        rutinasApi.findAsignacionesBySocio(Number(id))
      ]);
      setSocio(s);
      setComparativa(c);
      setRutinasAsignadas(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleGuardarMedicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFormLoading(true);
    try {
      // Registrar como evaluación (HU-09) y progreso (HU-10)
      await evaluacionesApi.create({
        id_socio: Number(id),
        peso: Number(formMed.peso),
        grasa: Number(formMed.grasa) || null,
        medidas: formMed.medidas || null,
        fecha: formMed.fecha
      });
      
      // También registrar en progreso para el historial comparativo
      await progresoApi.create({
        id_socio: Number(id),
        peso: Number(formMed.peso),
        observaciones: `Pecho, cintura, etc: ${formMed.medidas}`,
        fecha: formMed.fecha
      });

      alert('Medición registrada con éxito');
      setModalMedicion(false);
      setFormMed({ peso: '', grasa: '', medidas: '', fecha: new Date().toISOString().split('T')[0] });
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (cargando) return <div className={styles.container}><p>Cargando perfil...</p></div>;
  if (error || !socio) return <div className={styles.container}><p>Error: {error || 'Socio no encontrado'}</p></div>;

  // Preparar datos ordenados cronológicamente para el gráfico interactivo (HU-10)
  const evaluacionesHistorial = socio.evaluaciones
    ? [...socio.evaluaciones].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    : [];

  const progresosHistorial = comparativa?.historial_progreso
    ? [...comparativa.historial_progreso].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    : [];

  // Mapear los datos según la métrica seleccionada
  let datosGrafico: { fecha: string; value: number }[] = [];
  if (metricaProgreso === 'peso') {
    datosGrafico = progresosHistorial.map(p => ({
      fecha: p.fecha,
      value: Number(p.peso)
    }));
  } else {
    datosGrafico = evaluacionesHistorial
      .filter(e => e.grasa !== null && e.grasa !== undefined)
      .map(e => ({
        fecha: e.fecha,
        value: Number(e.grasa)
      }));
  }

  // Cálculos estadísticos rápidos para la métrica activa
  const totalPuntos = datosGrafico.length;
  const valorInicial = totalPuntos > 0 ? datosGrafico[0].value : null;
  const valorActual = totalPuntos > 0 ? datosGrafico[totalPuntos - 1].value : null;
  const valores = datosGrafico.map(d => d.value);
  const valorMin = totalPuntos > 0 ? Math.min(...valores) : null;
  const valorMax = totalPuntos > 0 ? Math.max(...valores) : null;
  
  const diferenciaTotal = (valorActual !== null && valorInicial !== null)
    ? (valorActual - valorInicial).toFixed(1)
    : '0.0';

  // Configuración del SVG del gráfico (HU-10)
  const svgWidth = 550;
  const svgHeight = 220;
  const svgPaddingLeft = 40;
  const svgPaddingRight = 30;
  const svgPaddingTop = 30;
  const svgPaddingBottom = 45;

  const chartWidth = svgWidth - svgPaddingLeft - svgPaddingRight;
  const chartHeight = svgHeight - svgPaddingTop - svgPaddingBottom;

  const yMin = valorMin !== null ? Math.max(0, valorMin - 2) : 0;
  const yMax = valorMax !== null ? valorMax + 2 : 100;
  const yRange = yMax - yMin || 1;

  const puntosSVG = datosGrafico.map((d, index) => {
    const x = svgPaddingLeft + (index * chartWidth) / (totalPuntos - 1 || 1);
    const y = svgPaddingTop + chartHeight - ((d.value - yMin) / yRange) * chartHeight;
    return { x, y, fecha: d.fecha, value: d.value };
  });

  const pathD = puntosSVG.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = puntosSVG.length > 0
    ? `${pathD} L ${puntosSVG[puntosSVG.length - 1].x} ${svgPaddingTop + chartHeight} L ${puntosSVG[0].x} ${svgPaddingTop + chartHeight} Z`
    : '';

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = yMin + ratio * yRange;
    const y = svgPaddingTop + chartHeight - ratio * chartHeight;
    return { y, label: val.toFixed(1) };
  });

  const evalInicial = comparativa?.evaluacion_inicial;
  const isAdmin = userLocal?.rol?.toLowerCase() === 'admin';
  const isAssignedTrainer = socio?.asignaciones_entrenador.some(
    a => a.entrenador.usuario.id_usuario === userLocal?.id_usuario
  );
  const canEdit = isAdmin || isAssignedTrainer;

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/socios" style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
          <ChevronLeft size={20} /> Volver
        </Link>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Perfil del Socio</h2>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', marginBottom:'1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color:'#000' }}>
          {socio.usuario?.nombre?.substring(0,2).toUpperCase() || 'S'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>{socio.usuario?.nombre || 'Socio'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>{socio.usuario?.correo || 'Sin correo'} | ID: {socio.usuario?.identificacion || '—'}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: socio.usuario?.estado ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: socio.usuario?.estado ? '#4ade80' : '#f87171', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
              {socio.usuario?.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid} style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card Plan de Membresía (HU-06) */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20} color="var(--primary)" /> Plan de Membresía
            </h3>
            {(() => {
              const membresiaActiva = socio.membresias?.find(m => m.estado === 'activa' || m.estado === 'renovada');
              
              if (membresiaActiva) {
                const hoy = new Date();
                hoy.setHours(0,0,0,0);
                const fin = new Date(membresiaActiva.fecha_fin);
                fin.setHours(0,0,0,0);
                const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                const esCritico = diasRestantes <= 5;
                
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {membresiaActiva.plan?.nombre}
                      </span>
                      <span style={{ 
                        background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '20px', textTransform: 'uppercase'
                      }}>
                        {membresiaActiva.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Precio:</span>
                        <span style={{ fontWeight: 600 }}>${membresiaActiva.plan?.precio} COP</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Duración:</span>
                        <span style={{ fontWeight: 600 }}>{membresiaActiva.plan?.duracion_meses} mes(es)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Vence:</span>
                        <span style={{ fontWeight: 600, color: esCritico ? '#f87171' : '#fff' }}>{membresiaActiva.fecha_fin}</span>
                      </div>
                    </div>
                    
                    <div style={{
                      marginTop: '15px', padding: '10px', borderRadius: '10px', background: esCritico ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                      border: esCritico ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'center', fontSize: '0.8rem', color: esCritico ? '#f87171' : 'rgba(255,255,255,0.5)', fontWeight: 600
                    }}>
                      {diasRestantes <= 0 ? '⚠️ Membresía vence hoy' : `Quedan ${diasRestantes} días de vigencia`}
                    </div>
                  </div>
                );
              }

              const ultHistorial = socio.membresias && socio.membresias.length > 0 ? socio.membresias[0] : null;

              return (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', fontWeight: 600, marginBottom: '15px' }}>
                    Sin membresía activa
                  </div>
                  {ultHistorial && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>
                      Último plan: {ultHistorial.plan?.nombre} (Estado: {ultHistorial.estado}, Venció: {ultHistorial.fecha_fin})
                    </p>
                  )}
                  {isAdmin && (
                    <Link href="/membresias">
                      <button style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', padding: '0.6rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Asignar Plan Ahora
                      </button>
                    </Link>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Dumbbell size={20} color="var(--primary)" /> Asignación
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Entrenador:</span>
              <span style={{ fontWeight: 'bold' }}>{socio.asignaciones_entrenador[0]?.entrenador?.usuario?.nombre || 'No asignado'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Fecha de Inicio:</span>
              <span style={{ fontWeight: 'bold' }}>{socio.asignaciones_entrenador[0]?.fecha_asignacion || '—'}</span>
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} color="var(--primary)" /> Rutinas Asignadas
            </h3>
            {rutinasAsignadas.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                {rutinasAsignadas.map(ra => (
                  <div key={ra.id_asignacion_rutina} style={{ padding:'0.8rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{ra.rutina.nombre}</p>
                    <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>Asignada: {ra.fecha_asignacion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'1rem' }}>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', marginBottom:'10px' }}>Sin rutinas activas.</p>
                <Link href="/rutinas">
                  <button style={{ background:'rgba(0, 242, 255, 0.1)', color:'var(--primary)', border:'1px solid var(--primary)', padding:'0.4rem 0.8rem', borderRadius:'6px', fontSize:'0.75rem', cursor:'pointer' }}>Asignar una</button>
                </Link>
              </div>
            )}
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--primary)" /> Última Evaluación
            </h3>
            {evalInicial ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Peso Inicial:</span>
                  <span style={{ fontWeight: 'bold' }}>{evalInicial.peso} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Grasa:</span>
                  <span style={{ fontWeight: 'bold' }}>{evalInicial.grasa || '—'} %</span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginTop:'10px' }}>Fecha: {evalInicial.fecha}</p>
              </>
            ) : (
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.9rem' }}>Sin evaluaciones registradas.</p>
            )}
          </div>
        </div>

        {/* Panel del Gráfico Interactivo de Progreso (HU-10) */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <TrendingUp size={20} color="var(--primary)" /> Progreso Físico Interactivo
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Monitorea el avance corporal a lo largo del tiempo</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="glass" style={{ display: 'flex', padding: '2px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                  onClick={() => setMetricaProgreso('peso')}
                  style={{
                    background: metricaProgreso === 'peso' ? 'var(--primary)' : 'transparent',
                    color: metricaProgreso === 'peso' ? '#000' : '#fff',
                    border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
                  }}
                >
                  Peso (kg)
                </button>
                <button 
                  onClick={() => setMetricaProgreso('grasa')}
                  style={{
                    background: metricaProgreso === 'grasa' ? 'var(--primary)' : 'transparent',
                    color: metricaProgreso === 'grasa' ? '#000' : '#fff',
                    border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
                  }}
                >
                  Grasa (%)
                </button>
              </div>
              
              {canEdit && (
                <button onClick={() => setModalMedicion(true)} style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight: 700 }}>
                  <Plus size={14}/> Nueva Medida
                </button>
              )}
            </div>
          </div>

          {/* Estadísticas rápidas superiores de la métrica */}
          {totalPuntos > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Medición Inicial</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0 0' }}>{valorInicial} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{metricaProgreso === 'peso' ? 'kg' : '%'}</span></p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Medición Actual</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0 0' }}>{valorActual} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{metricaProgreso === 'peso' ? 'kg' : '%'}</span></p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Variación Total</p>
                <p style={{ 
                  fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0 0', 
                  color: Number(diferenciaTotal) <= 0 ? '#4ade80' : '#f87171' 
                }}>
                  {Number(diferenciaTotal) <= 0 ? '↓' : '↑'} {Math.abs(Number(diferenciaTotal))} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{metricaProgreso === 'peso' ? 'kg' : '%'}</span>
                </p>
              </div>
            </div>
          )}

          {/* Gráfico SVG interactivo */}
          <div className="glass" style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {totalPuntos === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.9rem', textAlign:'center' }}>No hay registros de {metricaProgreso} para este socio.</p>
            ) : totalPuntos === 1 ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{valorActual} {metricaProgreso === 'peso' ? 'kg' : '%'}</p>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginTop: '5px' }}>Se requiere registrar al menos una medición adicional para trazar la gráfica.</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gradientPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.0"/>
                    </linearGradient>
                    <linearGradient id="gradientGrasa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {gridLines.map((line, idx) => (
                    <g key={idx} opacity="0.15">
                      <line x1={svgPaddingLeft} y1={line.y} x2={svgWidth - svgPaddingRight} y2={line.y} stroke="#fff" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={svgPaddingLeft - 10} y={line.y + 4} fill="#fff" fontSize="9" textAnchor="end" fontWeight="600">{line.label}</text>
                    </g>
                  ))}

                  {/* Area fill path */}
                  <path d={areaD} fill={metricaProgreso === 'peso' ? 'url(#gradientPeso)' : 'url(#gradientGrasa)'} />

                  {/* Trend line path */}
                  <path d={pathD} fill="none" stroke={metricaProgreso === 'peso' ? '#00f2ff' : '#a855f7'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interactive points & guide triggers */}
                  {puntosSVG.map((p, idx) => {
                    const showLabel = totalPuntos <= 6 || idx === 0 || idx === totalPuntos - 1 || (totalPuntos > 6 && idx === Math.floor(totalPuntos / 2));
                    return (
                      <g key={idx}>
                        {showLabel && (
                          <text x={p.x} y={svgHeight - 15} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="600">
                            {p.fecha}
                          </text>
                        )}
                        {/* Hover transparent circular target */}
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="15" 
                          fill="transparent" 
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* Visual dot */}
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill={metricaProgreso === 'peso' ? '#00f2ff' : '#a855f7'} 
                          stroke="#111" 
                          strokeWidth="1.5" 
                          style={{ transition: 'all 0.2s ease', transformOrigin: `${p.x}px ${p.y}px`, transform: hoveredPoint?.fecha === p.fecha ? 'scale(1.5)' : 'none' }}
                        />
                      </g>
                    );
                  })}

                  {/* Hover vertical line and tooltip */}
                  {hoveredPoint && (
                    <g>
                      <line x1={hoveredPoint.x} y1={svgPaddingTop} x2={hoveredPoint.x} y2={svgPaddingTop + chartHeight} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill={metricaProgreso === 'peso' ? '#00f2ff' : '#a855f7'} opacity="0.3" />
                      <foreignObject x={Math.min(svgWidth - 140, Math.max(10, hoveredPoint.x - 65))} y={Math.max(5, hoveredPoint.y - 55)} width="130" height="48">
                        <div style={{ background: '#111', border: `1px solid ${metricaProgreso === 'peso' ? '#00f2ff' : '#a855f7'}`, borderRadius: '8px', padding: '4px 8px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
                          <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{hoveredPoint.fecha}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                            {hoveredPoint.value} {metricaProgreso === 'peso' ? 'kg' : '%'}
                          </p>
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </svg>
              </div>
            )}
          </div>
          
          {/* Historial tabular inferior */}
          {totalPuntos > 0 && (
            <div style={{ marginTop: '1.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {datosGrafico.slice().reverse().map((d, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{d.fecha}</span>
                    <span style={{ fontWeight: 700, color: metricaProgreso === 'peso' ? '#00f2ff' : '#a855f7' }}>
                      {d.value} {metricaProgreso === 'peso' ? 'kg' : '%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {!socio.asignaciones_entrenador.length && isAdmin && (
        <div style={{ marginTop:'2rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', padding:'1.5rem', borderRadius:'16px', textAlign:'center' }}>
          <p style={{ color:'#f87171', fontWeight:600 }}>Este socio no tiene un entrenador asignado.</p>
          <Link href="/personal">
            <button style={{ marginTop:'10px', background:'var(--primary)', color:'#000', border:'none', padding:'0.5rem 1.5rem', borderRadius:'8px', fontWeight:700, cursor:'pointer' }}>Asignar uno ahora</button>
          </Link>
        </div>
      )}

      {/* Modal Nueva Medición */}
      {modalMedicion && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={e=>{ if(e.target===e.currentTarget) setModalMedicion(false); }}>
          <div className="glass" style={{ width:'100%', maxWidth:'450px', borderRadius:'20px', padding:'2rem' }}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'10px' }}><Activity size={20} color="var(--primary)"/> Nueva Evaluación Física</h3>
            <form onSubmit={handleGuardarMedicion} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div><label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginBottom:'5px' }}>Peso (kg) *</label><input type="number" step="0.1" value={formMed.peso} onChange={e=>setFormMed({...formMed, peso:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }} required/></div>
              <div><label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginBottom:'5px' }}>Grasa (%)</label><input type="number" step="0.1" value={formMed.grasa} onChange={e=>setFormMed({...formMed, grasa:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }}/></div>
              <div><label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginBottom:'5px' }}>Medidas Corporales / Observaciones</label><input value={formMed.medidas} onChange={e=>setFormMed({...formMed, medidas:e.target.value})} placeholder="Pecho, cintura, etc." style={{ width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }}/></div>
              <div><label style={{ display:'block', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginBottom:'5px' }}>Fecha</label><input type="date" value={formMed.fecha} onChange={e=>setFormMed({...formMed, fecha:e.target.value})} style={{ width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'10px', color:'#fff' }}/></div>
              
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" onClick={()=>setModalMedicion(false)} style={{ flex:1, padding:'1rem', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" disabled={formLoading} style={{ flex:2, padding:'1rem', borderRadius:'12px', background:'linear-gradient(135deg, var(--primary), var(--secondary))', border:'none', color:'#000', fontWeight:700, cursor:'pointer' }}>{formLoading ? 'Guardando...' : 'Guardar Evaluación'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
