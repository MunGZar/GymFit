"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { KeyRound, RefreshCw, Copy, CheckCheck, Clock, CheckCircle2, XCircle, Loader2, Hash, Shield } from 'lucide-react';
import { codigosParticipanteApi, CodigoParticipante } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function SkeletonRow() {
  const sh: React.CSSProperties = {
    background: 'linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.12) 50%,rgba(255,255,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '6px',
  };
  return (
    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
      {[110, 90, 80, 70, 70].map((w, i) => (
        <td key={i} style={{ padding: '1rem' }}>
          <div style={{ ...sh, height: 18, width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ParticipantesPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [codigos, setCodigos] = useState<CodigoParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [ultimoCodigo, setUltimoCodigo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario && usuario.rol !== 'admin') router.push('/dashboard');
  }, [usuario, router]);

  const fetchCodigos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await codigosParticipanteApi.listar();
      setCodigos(Array.isArray(data) ? data : []);
    } catch {
      setCodigos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodigos(); }, [fetchCodigos]);

  const generarCodigo = async () => {
    setGenerando(true);
    setError('');
    try {
      const res = await codigosParticipanteApi.generar();
      setUltimoCodigo(res.codigo);
      await fetchCodigos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generando código');
    } finally {
      setGenerando(false);
    }
  };

  const copiar = () => {
    navigator.clipboard.writeText(ultimoCodigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const usados = codigos.filter(c => c.usado).length;
  const disponibles = codigos.filter(c => !c.usado).length;

  const stats = [
    { label: 'Total Generados', value: codigos.length, icon: <Hash size={20} />, color: 'var(--primary)' },
    { label: 'Disponibles', value: disponibles, icon: <Clock size={20} />, color: '#22c55e' },
    { label: 'Usados', value: usados, icon: <CheckCircle2 size={20} />, color: '#a855f7' },
  ];

  return (
    <div className={styles.container} style={{ color: 'var(--text-main)' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .gen-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
          <Shield size={24} color="var(--primary)" />
          Gestión de Participantes
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Genera códigos de acceso único para que los participantes puedan registrarse en el sistema.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="glass" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {loading ? '–' : s.value}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Generar código */}
      <div className="glass" style={{ borderRadius: '16px', padding: '1.8rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <KeyRound size={18} color="var(--primary)" /> Generar Nuevo Código
        </h3>
        <p style={{ margin: '0 0 1.2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Cada código es de uso único. Compártelo con el participante para que pueda registrarse desde la pantalla de login.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#f87171' }}>
            {error}
          </div>
        )}

        {ultimoCodigo && (
          <div style={{ background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Último código generado — compártelo con el participante</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--primary)', fontFamily: 'monospace' }}>
                {ultimoCodigo}
              </div>
            </div>
            <button
              onClick={copiar}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(0,242,255,0.3)', background: copiado ? 'rgba(0,242,255,0.15)' : 'transparent', color: copiado ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.3s' }}
            >
              {copiado ? <><CheckCheck size={16} />¡Copiado!</> : <><Copy size={16} />Copiar</>}
            </button>
          </div>
        )}

        <button
          className="gen-btn"
          onClick={generarCodigo}
          disabled={generando}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: generando ? 'not-allowed' : 'pointer', opacity: generando ? 0.7 : 1, transition: 'all 0.3s' }}
        >
          {generando
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Generando…</>
            : <><KeyRound size={18} />Generar Código</>}
        </button>
      </div>

      {/* Tabla historial */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--primary)" /> Historial de Códigos
          </h3>
          <button
            onClick={fetchCodigos}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Actualizar
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Código', 'Estado', 'Fecha Creación', 'Fecha Uso', 'Creado por'].map(h => (
                  <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                : codigos.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <KeyRound size={32} color="var(--text-muted)" />
                          <span>No hay códigos generados aún.</span>
                          <span style={{ fontSize: '0.82rem' }}>Haz clic en "Generar Código" para crear el primero.</span>
                        </div>
                      </td>
                    </tr>
                  )
                  : codigos.map(c => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s', cursor: 'default' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '2px', color: c.usado ? 'var(--text-muted)' : 'var(--primary)', fontSize: '0.95rem' }}>
                        {c.codigo}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {c.usado
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0.3rem 0.7rem', borderRadius: '20px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', fontSize: '0.8rem', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />Usado
                          </span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0.3rem 0.7rem', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
                            <XCircle size={13} />Disponible
                          </span>}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(c.fecha_creacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {c.fecha_uso ? new Date(c.fecha_uso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {c.creado_por?.nombre ?? 'Admin'}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
