'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { asistenciasApi, Asistencia, RespuestaAcceso } from '@/lib/api';

export default function AccesoPage() {
  const [identificacion, setIdentificacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<RespuestaAcceso | null>(null);
  const [recientes, setRecientes] = useState<Asistencia[]>([]);

  const fetchRecientes = async () => {
    try {
      const data = await asistenciasApi.getHoy();
      setRecientes(data);
    } catch (error: any) {
      console.error('Error fetching asistencias', error);
    }
  };

  useEffect(() => {
    fetchRecientes();
  }, []);

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificacion.trim()) return;

    setLoading(true);
    setResultado(null);
    try {
      const res = await asistenciasApi.validarAcceso(identificacion);
      setResultado(res);
      // Reload recent assistances after validation
      await fetchRecientes();
    } catch (error: any) {
      console.error(error);
      setResultado({
        acceso: false,
        color: 'rojo',
        motivo: error.message || 'Error de conexión',
      });
    } finally {
      setLoading(false);
      setIdentificacion('');
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            Control de Acceso
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Valida el ingreso de socios escaneando o ingresando su ID.
          </p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Panel de Validación */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <form onSubmit={handleValidar} style={{ position: 'relative' }}>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ingresar ID / Identificación de Socio</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ej. 12345678" 
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                style={{ 
                  flex: 1, 
                  background: 'var(--surface-input)', 
                  border: '1px solid var(--surface-border)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  fontSize: '1.2rem',
                  outline: 'none',
                  letterSpacing: '2px'
                }} 
                autoFocus
              />
              <button 
                type="submit"
                disabled={loading || !identificacion.trim()}
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                  color: '#000', 
                  border: 'none', 
                  padding: '0 1.5rem', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  cursor: loading || !identificacion.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !identificacion.trim() ? 0.6 : 1,
                  boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)'
                }}>
                {loading ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </form>

          {/* Resultado de Validación */}
          {resultado && (
            <div style={{ 
              background: resultado.acceso ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)', 
              border: `2px solid ${resultado.acceso ? 'rgba(34, 197, 94, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`, 
              borderRadius: '16px', 
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {resultado.acceso ? <CheckCircle size={64} color="#4ade80" /> : <XCircle size={64} color="#f87171" />}
              <div>
                <h3 style={{ fontSize: '1.8rem', color: resultado.acceso ? '#4ade80' : '#f87171', marginBottom: '5px' }}>
                  {resultado.acceso ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                </h3>
                {resultado.socio && (
                  <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{resultado.socio.nombre}</p>
                )}
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                  {resultado.motivo}
                </p>
                {resultado.membresia && (
                  <p style={{ color: 'var(--text-faint)', marginTop: '5px' }}>
                    Plan {resultado.membresia.plan} - {resultado.acceso ? `Vence en ${resultado.membresia.dias_restantes} días` : 'Membresía Vencida'}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Últimos Ingresos */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--primary)" />
            Últimos Ingresos Registrados (Hoy)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '400px' }}>
            {recientes.length === 0 ? (
              <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '2rem 0' }}>No hay ingresos registrados hoy.</p>
            ) : (
              recientes.map(ingreso => (
                <div key={ingreso.id_asistencia} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--subtle-bg)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #4ade80'
                }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '1rem' }}>{ingreso.socio.usuario.nombre}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Socio - ID: {ingreso.socio.usuario.identificacion}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: '600' }}>
                      Permitido
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{formatTime(ingreso.fecha)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
