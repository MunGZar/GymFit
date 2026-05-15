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
        observaciones: `Registro periódico: ${formMed.medidas}`,
        fecha: formMed.fecha
      });

      alert('Medición registrada con éxito');
      setModalMedicion(false);
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (cargando) return <div className={styles.container}><p>Cargando perfil...</p></div>;
  if (error || !socio) return <div className={styles.container}><p>Error: {error || 'Socio no encontrado'}</p></div>;

  const historial = comparativa?.historial_progreso || [];
  const ultimoProgreso = historial.length > 0 ? historial[historial.length - 1] : null;
  const evalInicial = comparativa?.evaluacion_inicial;

  const diffPeso = (ultimoProgreso?.peso && evalInicial?.peso) 
    ? (ultimoProgreso.peso - evalInicial.peso).toFixed(1) 
    : '0';

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
            <span style={{ background: socio.activo ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: socio.activo ? '#4ade80' : '#f87171', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
              {socio.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid} style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              <Activity size={20} color="var(--primary)" /> Última Evaluación (HU-09)
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

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--primary)" /> Progreso Comparativo (HU-10)
            </h3>
            {canEdit && (
              <button onClick={() => setModalMedicion(true)} style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
                <Plus size={14}/> Nueva Medición
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Peso Actual</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>{ultimoProgreso?.peso || '—'} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>kg</span></p>
              <p style={{ fontSize: '0.75rem', color: Number(diffPeso) <= 0 ? '#4ade80' : '#f87171', marginTop: '5px' }}>
                {Number(diffPeso) <= 0 ? '↓' : '↑'} {Math.abs(Number(diffPeso))}kg desde inicio
              </p>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {comparativa?.historial_progreso.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.9rem', textAlign:'center', padding:'2rem' }}>Aún no hay registros de progreso.</p>
            ) : (
              <>
                {/* Gráfica simple de peso */}
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:'120px', padding:'0 1rem', marginBottom:'2rem', background:'rgba(255,255,255,0.01)', borderRadius:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                  {comparativa?.historial_progreso.slice(-10).map((p, idx) => {
                    const validWeights = comparativa.historial_progreso.map(x => x.peso || 0);
                    const maxWeight = Math.max(...validWeights, 1) || 100;
                    const height = ((p.peso || 0) / maxWeight) * 100;
                    return (
                      <div key={p.id_progreso} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'30px' }}>
                        <div style={{ width:'100%', height:`${height}%`, background:'linear-gradient(to top, var(--secondary), var(--primary))', borderRadius:'4px 4px 0 0', opacity: 0.3 + (idx * 0.07) }}></div>
                        <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.4)' }}>{p.fecha.split('-')[2]}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {comparativa?.historial_progreso.slice().reverse().map(p => (
                    <div key={p.id_progreso} style={{ display:'flex', justifyContent:'space-between', padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize:'0.9rem' }}>{p.fecha}</span>
                      <span style={{ fontWeight:700, color:'var(--primary)' }}>{p.peso} kg</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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
