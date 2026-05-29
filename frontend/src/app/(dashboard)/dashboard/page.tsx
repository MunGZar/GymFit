"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { authApi, sociosApi, entrenadoresApi, progresoApi, membresiasApi, reportesApi, type SocioCompleto, type Asignacion, type Progreso, type Membresia } from '@/lib/api';
import { canPerform } from '@/lib/rbac';
import { Users, CreditCard, BarChart3, TrendingDown, Calendar, Dumbbell, UserCheck, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function WeightLineChart({ data }: { data: Progreso[] }) {
  if (!data || data.length === 0) return null;
  const width = 300;
  const height = 110;
  const paddingX = 25;
  const paddingY = 30;

  const weights = data.map(d => Number(d.peso || 0));
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const range = Math.max(1, maxWeight - minWeight);

  const getX = (index: number) => {
    if (data.length === 1) return width / 2;
    return paddingX + (index * ((width - paddingX * 2) / (data.length - 1)));
  };
  const getY = (weight: number) => height - paddingY - (((weight - minWeight) / range) * (height - paddingY * 2));

  const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(Number(d.peso || 0))}`).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', marginTop: '0.5rem' }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {data.length > 1 && (
        <path 
          d={`${pathData} L ${getX(data.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`} 
          fill="url(#lineGradient)" 
        />
      )}
      
      <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--surface-border)" strokeWidth="1" />
      
      {data.length > 1 && (
        <path d={pathData} fill="none" stroke="var(--primary)" strokeWidth="3" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,242,255,0.3))' }} />
      )}
      
      {data.map((d, i) => {
        const x = getX(i);
        const y = getY(Number(d.peso || 0));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="var(--chart-dot-fill)" stroke="var(--primary)" strokeWidth="2" style={{ transition: 'all 0.3s' }} />
            <text x={x} y={y - 12} fill="var(--text-main)" fontSize="11" textAnchor="middle" fontWeight="bold">
              {d.peso}
            </text>
            <text x={x} y={height - 10} fill="var(--text-faint)" fontSize="9" textAnchor="middle">
              {new Date(d.fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('');

  const [misAsignaciones, setMisAsignaciones] = useState<Asignacion[]>([]);
  const [miPerfilSocio, setMiPerfilSocio] = useState<SocioCompleto | null>(null);
  const [miProgreso, setMiProgreso] = useState<Progreso[]>([]);
  const [membresiasVencer, setMembresiasVencer] = useState<Membresia[]>([]);
  const [totalSociosCount, setTotalSociosCount] = useState<number | null>(null);
  const [activasCount, setActivasCount] = useState<number | null>(null);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [asistenciasStats, setAsistenciasStats] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const localUser = authApi.getUsuarioLocal();
    if (localUser) {
      setUser(localUser);
      setRole(localUser.rol || '');
    }
  }, []);

  useEffect(() => {
    const cargarDatosRol = async () => {
      if (!user) return;
      setCargando(true);
      try {
        if (role === 'admin' || role === 'recepcionista') {
          const [todasMems, todosSocs, genReport, asisReport] = await Promise.all([
            membresiasApi.findAll(),
            sociosApi.findAll(),
            reportesApi.getGeneral().catch(() => null),
            reportesApi.getAsistencias().catch(() => null)
          ]);
          
          if (genReport) setGeneralStats(genReport);
          if (asisReport) setAsistenciasStats(asisReport);

          setTotalSociosCount(genReport ? genReport.socios.total : todosSocs.length);
          
          const activas = todasMems.filter(m => m.estado === 'activa' || m.estado === 'renovada');
          setActivasCount(genReport ? genReport.socios.membresias_activas : activas.length);

          const hoy = new Date();
          const sieteDiasMas = new Date();
          sieteDiasMas.setDate(hoy.getDate() + 7);

          const filtradas = todasMems.filter(m => {
            if (m.estado !== 'activa' && m.estado !== 'renovada') return false;
            const fechaFin = new Date(m.fecha_fin);
            return fechaFin <= sieteDiasMas;
          }).sort((a, b) => new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime());

          setMembresiasVencer(filtradas);
        } else if (role === 'entrenador') {
          const todosTrainers = await entrenadoresApi.findAll();
          const yo = todosTrainers.find(t => t.usuario?.id_usuario === user.id_usuario);
          if (yo) {
            const asigs = await entrenadoresApi.findAsignaciones(yo.id_entrenador);
            setMisAsignaciones(asigs || []);
          }
        } else if (role === 'socio') {
          const yo = await sociosApi.getMiPerfil();
          if (yo) {
            setMiPerfilSocio(yo);
            const data = await progresoApi.getComparativa(yo.id_socio);
            setMiProgreso(data?.historial_progreso || []);
          }
        }
      } catch (e) {
        console.error("Error cargando datos del dashboard:", e);
      } finally {
        setCargando(false);
      }
    };

    if (user) {
      cargarDatosRol();
    }
  }, [role, user?.id_usuario]);

  const canSeeMetrics = canPerform(role, 'view_reports');

  const membresiasCriticas = membresiasVencer.filter(m => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fin = new Date(m.fecha_fin);
    fin.setHours(0,0,0,0);
    const dias = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 3;
  });

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Hola, {user?.nombre || 'Usuario'} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {role === 'admin' && 'Tienes control total del sistema administrativo.'}
            {role === 'recepcionista' && 'Gestiona los ingresos y socios del día de hoy.'}
            {role === 'entrenador' && 'Revisa tus clases programadas y el progreso de tus socios.'}
            {role === 'socio' && '¡Es un buen día para entrenar! Revisa tu rutina.'}
          </p>
        </div>
        {role === 'socio' && miPerfilSocio && (() => {
          const membresiaActiva = miPerfilSocio.membresias?.find(m => m.estado === 'activa' || m.estado === 'renovada');
          return (
            <div className="glass" style={{ padding:'0.5rem 1rem', borderRadius:'12px', border:'1px solid var(--surface-border)', textAlign: 'right' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Membresía Activa</span>
              <p style={{ color:'var(--primary)', fontWeight:700, margin: '2px 0' }}>
                {membresiaActiva ? membresiaActiva.plan?.nombre.toUpperCase() : 'SIN PLAN ACTIVO'}
              </p>
              {membresiaActiva && (
                <span style={{ fontSize:'0.7rem', color:'var(--text-faint)', display: 'block' }}>
                  Vence: {membresiaActiva.fecha_fin}
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {canSeeMetrics && membresiasCriticas.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(234, 179, 8, 0.08))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '1.2rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)',
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(239, 68, 68, 0.5)'
          }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#ef4444' }}>¡Alerta de Vencimiento de Membresía!</h4>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.8 }}>
              Hay <strong>{membresiasCriticas.length}</strong> membresía(s) de socios que vencerán en los próximos 3 días. Por favor, toma acción para su renovación.
            </p>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('vencimientos-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: 'var(--btn-secondary-bg)',
              border: '1px solid var(--btn-secondary-border)',
              color: 'var(--btn-secondary-text)',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            Ver Detalles
          </button>
        </div>
      )}

      {canSeeMetrics && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.blueIcon}`}><Users size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>Total Socios</p>
              <h2 className={styles.cardValue}>{totalSociosCount !== null ? totalSociosCount : '...'}</h2>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.purpleIcon}`}><CreditCard size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>Membresías Activas</p>
              <h2 className={styles.cardValue}>{activasCount !== null ? activasCount : '...'}</h2>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.cyanIcon}`}><BarChart3 size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}><p className={styles.cardLabel}>Ingresos del Mes</p><h2 className={styles.cardValue}>
              {generalStats?.finanzas?.ingresos_mes !== undefined ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(generalStats.finanzas.ingresos_mes) : '...'}
            </h2></div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.indigoIcon}`}><TrendingDown size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}><p className={styles.cardLabel}>Tasa de Deserción</p><h2 className={styles.cardValue}>
              {generalStats?.socios ? Math.round((generalStats.socios.membresias_vencidas_mes / (generalStats.socios.membresias_activas + generalStats.socios.membresias_vencidas_mes || 1)) * 100) : 0}%
            </h2></div>
          </div>
        </div>
      )}

      {role === 'socio' && (
        <div className={styles.statsGrid} style={{ gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.blueIcon}`}><TrendingUp size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>Último Peso</p>
              <h2 className={styles.cardValue}>{miProgreso.length > 0 ? (miProgreso[miProgreso.length - 1].peso || '--') : '--'} kg</h2>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.cyanIcon}`}><BarChart3 size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>Cambio Total</p>
              <h2 className={styles.cardValue}>
                {miProgreso.length > 1 && miProgreso[0].peso && miProgreso[miProgreso.length-1].peso 
                  ? (Number(miProgreso[miProgreso.length-1].peso) - Number(miProgreso[0].peso)).toFixed(1) 
                  : '--'} kg
              </h2>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.cardHeader}><div className={`${styles.cardIcon} ${styles.purpleIcon}`}><Dumbbell size={22} color="#fff" /></div></div>
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>Mediciones Registradas</p>
              <h2 className={styles.cardValue}>{miProgreso.length}</h2>
            </div>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        {role === 'entrenador' ? (
          <div className={`${styles.chartCard} glass`} style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 className={styles.sectionTitle}>Mis Socios Asignados</h3>
              <Link href="/socios" style={{ color:'var(--primary)', fontSize:'0.85rem', textDecoration:'none' }}>Ver todos</Link>
            </div>
            {cargando ? <p>Cargando asignaciones...</p> : (
              <div className={styles.memberList}>
                {misAsignaciones.length === 0 ? <p style={{ color:'var(--text-faint)', padding:'1rem' }}>No tienes socios asignados aún.</p> : 
                  misAsignaciones.map(a => (
                    <div key={a.id_asignacion} className={styles.memberItem} style={{ borderBottom:'1px solid var(--table-row-border)', paddingBottom:'0.8rem' }}>
                      <div className={styles.memberInfo}>
                        <div className={`${styles.memberAvatar} ${styles.avatarCyan}`}>{a.socio.usuario?.nombre?.substring(0,2).toUpperCase() || 'S'}</div>
                        <div>
                          <p className={styles.memberName}>{a.socio.usuario?.nombre || 'Socio'}</p>
                          <span style={{ fontSize:'0.8rem', color:'var(--text-faint)' }}>Asignado el: {new Date(a.fecha_asignacion).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link href={`/socios/${a.socio.id_socio}`}>
                        <button style={{ background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', color:'var(--primary)', cursor:'pointer', display:'flex', padding:'4px', borderRadius:'8px' }}><ChevronRight size={20}/></button>
                      </Link>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        ) : role === 'socio' ? (
          <div className={`${styles.chartCard} glass`} style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 className={styles.sectionTitle}>Mis Rutinas</h3>
              <Link href="/rutinas" style={{ color:'var(--primary)', fontSize:'0.85rem', textDecoration:'none' }}>Ver todas</Link>
            </div>
            {cargando ? <p style={{ color:'var(--text-faint)', padding:'1rem' }}>Cargando rutinas...</p> : (
              <div className={styles.memberList}>
                {(!miPerfilSocio?.asignaciones_rutina || miPerfilSocio.asignaciones_rutina.length === 0) ? (
                  <p style={{ color:'var(--text-faint)', padding:'1rem' }}>No tienes rutinas asignadas aún.</p>
                ) : (
                  miPerfilSocio.asignaciones_rutina.slice(0, 4).map((a: any) => (
                    <div key={a.id_asignacion} className={styles.memberItem} style={{ borderBottom:'1px solid var(--table-row-border)', paddingBottom:'0.8rem' }}>
                      <div className={styles.memberInfo}>
                        <div className={`${styles.memberAvatar} ${styles.avatarPurple}`}><Dumbbell size={18}/></div>
                        <div>
                          <p className={styles.memberName}>{a.rutina?.nombre || 'Rutina'}</p>
                          <span style={{ fontSize:'0.8rem', color:'var(--text-faint)' }}>{a.rutina?.nivel || 'General'}</span>
                        </div>
                      </div>
                      <Link href={`/rutinas`}>
                        <button style={{ background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', color:'var(--primary)', cursor:'pointer', display:'flex', padding:'4px', borderRadius:'8px' }}><ChevronRight size={20}/></button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`${styles.chartCard} glass`}>
            <h3 className={styles.sectionTitle}>Asistencia General Semanal</h3>
            <div className={styles.barChart}>
              {(() => {
                const diasMap = asistenciasStats?.por_dia_semana || {};
                const max = Math.max(1, ...Object.values(diasMap).map(Number));
                return [
                  { label: 'Lun', key: 'Lunes' }, { label: 'Mar', key: 'Martes' }, 
                  { label: 'Mié', key: 'Miércoles' }, { label: 'Jue', key: 'Jueves' },
                  { label: 'Vie', key: 'Viernes' }, { label: 'Sáb', key: 'Sábado' }, 
                  { label: 'Dom', key: 'Domingo' }
                ].map(d => {
                  const val = diasMap[d.key] || 0;
                  const pct = Math.max(5, (val / max) * 100);
                  return (
                    <div key={d.label} className={styles.barGroup}>
                      <div className={styles.bar} style={{ height: `${pct}%` }}></div>
                      <span className={styles.barLabel}>{d.label}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {canSeeMetrics ? (
          <div id="vencimientos-section" className={`${styles.expiringCard} glass`}>
            <h3 className={styles.sectionTitle}>Membresías por Vencer</h3>
            <div className={styles.memberList}>
              {cargando ? (
                <p style={{ color:'var(--text-faint)', padding:'1rem', textAlign:'center' }}>Cargando membresías...</p>
              ) : membresiasVencer.length === 0 ? (
                <p style={{ color:'var(--text-faint)', padding:'1rem', textAlign:'center', fontSize:'0.9rem' }}>No hay membresías por vencer próximamente.</p>
              ) : (
                membresiasVencer.map(m => {
                  const hoy = new Date();
                  hoy.setHours(0,0,0,0);
                  const fin = new Date(m.fecha_fin);
                  fin.setHours(0,0,0,0);
                  const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                  const esCritico = diasRestantes <= 3;
                  
                  return (
                    <div key={m.id_membresia} className={styles.memberItem}>
                      <div className={styles.memberInfo}>
                        <div className={`${styles.memberAvatar} ${esCritico ? styles.avatarPurple : styles.avatarCyan}`}>
                          {m.socio?.usuario?.nombre?.substring(0,2).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className={styles.memberName}>{m.socio?.usuario?.nombre || 'Socio'}</p>
                          <span className={`${styles.tag} ${esCritico ? styles.tagPurple : styles.tagCyan}`}>
                            {m.plan?.nombre || 'Membresía'}
                          </span>
                        </div>
                      </div>
                      <span className={styles.timeLeft} style={{ color: esCritico ? '#ef4444' : '#eab308' }}>
                        {diasRestantes <= 0 ? 'Vence hoy' : `${diasRestantes}d`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className={`${styles.expiringCard} glass`} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <h3 className={styles.sectionTitle}>{role === 'socio' ? 'Mi Resumen' : 'Accesos Rápidos'}</h3>
            
            {role === 'socio' && miProgreso.length > 0 ? (
              <div style={{ background:'var(--subtle-bg-deeper)', border:'1px solid var(--surface-border)', padding:'1rem', borderRadius:'12px' }}>
                <p style={{ fontSize:'0.9rem', marginBottom:'0.5rem', color:'var(--text-muted)' }}>Progreso de Peso</p>
                <WeightLineChart data={miProgreso.slice(-5)} />
                <p style={{ fontSize:'0.75rem', marginTop:'1rem', textAlign:'center', color:'var(--text-faint)' }}>Últimas mediciones</p>
              </div>
            ) : null}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Link href="/clases" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding:'1rem', background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', borderRadius:'12px', textAlign:'center', cursor:'pointer', height: '100%' }}>
                  <Calendar size={20} color="var(--primary)" style={{ margin:'0 auto 8px' }}/>
                  <p style={{ fontSize:'0.75rem', margin: 0 }}>Clases</p>
                </div>
              </Link>
              <Link href="/rutinas" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding:'1rem', background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', borderRadius:'12px', textAlign:'center', cursor:'pointer', height: '100%' }}>
                  <Dumbbell size={20} color="var(--secondary)" style={{ margin:'0 auto 8px' }}/>
                  <p style={{ fontSize:'0.75rem', margin: 0 }}>Rutinas</p>
                </div>
              </Link>
              {role === 'entrenador' && (
                <Link href="/socios" style={{ textDecoration: 'none', color: 'inherit', gridColumn:'span 2' }}>
                  <div style={{ padding:'1rem', background:'var(--btn-secondary-bg)', border:'1px solid var(--btn-secondary-border)', borderRadius:'12px', textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', height: '100%' }}>
                    <UserCheck size={20} color="var(--primary)"/>
                    <p style={{ fontSize:'0.75rem', margin: 0 }}>Evaluar Próximo Socio</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
