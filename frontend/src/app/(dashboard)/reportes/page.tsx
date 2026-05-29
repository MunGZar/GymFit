'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, FileText } from 'lucide-react';
import { reportesApi } from '@/lib/api';

export default function ReportesPage() {
  const [dataGeneral, setDataGeneral] = useState<any>(null);
  const [dataMembresias, setDataMembresias] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      reportesApi.getGeneral(),
      reportesApi.getMembresias()
    ])
      .then(([general, membresias]) => {
        setDataGeneral(general);
        setDataMembresias(membresias);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!dataMembresias) return;

    // Crear CSV
    const headers = ['ID', 'Socio', 'Plan', 'Precio', 'Inicio', 'Fin', 'Estado'];
    const rows = dataMembresias.detalle.map((m: any) => [
      m.id_membresia,
      `"${m.socio}"`,
      `"${m.plan}"`,
      m.precio,
      m.fecha_inicio,
      m.fecha_fin,
      m.estado
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any[]) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_membresias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (cargando) {
    return <div className={styles.container} style={{ padding: '2rem', color: 'var(--text-main)' }}>Cargando reportes...</div>;
  }

  const activas = dataGeneral?.socios?.membresias_activas || 0;
  const vencidas = dataGeneral?.socios?.membresias_vencidas_mes || 0;
  const totalMembresias = activas + vencidas || 1; // Para evitar división por 0
  const pctActivas = Math.round((activas / totalMembresias) * 100);
  const pctVencidas = 100 - pctActivas;

  const ingresosMes = dataGeneral?.finanzas?.ingresos_mes || 0;
  const asistenciasMes = dataGeneral?.actividad?.asistencias_mes || 0;

  return (
    <div className={styles.container}>
      {/* Estilos para impresión PDF */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .glass { background: white !important; border: 1px solid #ccc !important; color: black !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          h2, h3, p, span { color: black !important; }
        }
      `}</style>

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <BarChart3 size={24} color="var(--primary)" className="no-print" />
            Reportes y Análisis Gerencial
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Estadísticas de asistencia y ventas.
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            border: '1px solid #4ade80',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Download size={18} /> Exportar Excel
          </button>
          <button onClick={handleExportPDF} style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#000',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '10px', borderRadius: '50%' }}><DollarSign size={24} /></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Ingresos del Mes</p>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>${ingresosMes.toLocaleString('es-CO')}</h3>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '50%' }}><Users size={24} /></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Asistencias Totales</p>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>{asistenciasMes}</h3>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '10px', borderRadius: '50%' }}><Calendar size={24} /></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Inscripciones del Mes</p>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>{dataGeneral?.actividad?.inscripciones_mes || 0}</h3>
        </div>
      </div>

      <div className={styles.contentGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Gráfico Membresías (HU-21) */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: 0 }}>
            Membresías Activas vs Vencidas
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Distribución actual del estado de los socios.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
            {/* Gráfico circular con CSS */}
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(#4ade80 0% ${pctActivas}%, #f87171 ${pctActivas}% 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ width: '110px', height: '110px', background: 'var(--body-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>{totalMembresias}</span>
              </div>
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '15px', height: '15px', borderRadius: '4px', background: '#4ade80' }}></div>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Activas</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{activas} ({pctActivas}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '15px', height: '15px', borderRadius: '4px', background: '#f87171' }}></div>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Vencidas</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{vencidas} ({pctVencidas}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Socios */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: 0 }}>
            Detalle de Ventas Recientes
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Últimas membresías adquiridas.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
            {dataMembresias?.detalle?.slice(0, 5).map((m: any) => (
              <div key={m.id_membresia} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--subtle-bg)', borderRadius: '8px' }}>
                <div>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{m.socio}</p>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>{m.plan}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#4ade80', fontWeight: 600, margin: 0 }}>${Number(m.precio).toLocaleString('es-CO')}</p>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>{new Date(m.fecha_inicio).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(!dataMembresias?.detalle || dataMembresias.detalle.length === 0) && (
              <p style={{ color: 'var(--text-faint)' }}>No hay datos de ventas disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
