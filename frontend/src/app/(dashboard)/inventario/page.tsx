import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Package, Search, Plus, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

export default function InventarioPage() {
  const equipos = [
    { id: 1, name: 'Cinta de Correr Pro 2000', category: 'Cardio', status: 'Operativo', lastMaint: '15 Mar 2024', nextMaint: '15 Sep 2024' },
    { id: 2, name: 'Prensa de Piernas Inclinada', category: 'Fuerza', status: 'En Mantenimiento', lastMaint: '10 Abr 2024', nextMaint: '15 Abr 2024' },
    { id: 3, name: 'Bicicleta Estática Spin', category: 'Cardio', status: 'Operativo', lastMaint: '01 Feb 2024', nextMaint: '01 Ago 2024' },
    { id: 4, name: 'Máquina Eliptica E-300', category: 'Cardio', status: 'Fuera de Servicio', lastMaint: '12 Ene 2024', nextMaint: '-' },
  ];

  const cafeteria = [
    { id: 1, name: 'Agua Mineral 500ml', category: 'Bebidas', stock: 45, minStock: 20, price: '$2.500', status: 'Suficiente' },
    { id: 2, name: 'Proteína Whey (Scoop)', category: 'Suplementos', stock: 8, minStock: 15, price: '$5.000', status: 'Bajo Stock' },
    { id: 3, name: 'Barra Energética Avena', category: 'Snacks', stock: 0, minStock: 10, price: '$3.500', status: 'Agotado' },
    { id: 4, name: 'Bebida Isotónica', category: 'Bebidas', stock: 22, minStock: 15, price: '$4.000', status: 'Suficiente' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Package size={24} color="#feca57" />
            Gestión de Inventario y Equipos
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Registra nuevos equipos, programa mantenimientos o da de baja material.
          </p>
        </div>
        
        <button style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          color: '#000', 
          border: 'none', 
          padding: '0.8rem 1.5rem', 
          borderRadius: '12px', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0, 242, 255, 0.2)'
        }}>
          <Plus size={20} />
          Nuevo Equipo
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            placeholder="Buscar equipo o máquina..." 
            style={{ 
              width: '100%', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: '10px', 
              color: '#fff',
              outline: 'none'
            }} 
          />
        </div>
        <select style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none' }}>
          <option value="">Todos los Estados</option>
          <option value="Operativo">Operativo</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Fuera de Servicio">Fuera de Servicio</option>
        </select>
      </div>

      {/* Table Area */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>EQUIPO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO OPERATIVO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ÚLTIMO MANTENIMIENTO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PRÓXIMO</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map(eq => (
              <tr key={eq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{eq.name}</p>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{eq.category}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: eq.status === 'Operativo' ? 'rgba(34, 197, 94, 0.15)' : eq.status === 'En Mantenimiento' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: eq.status === 'Operativo' ? '#4ade80' : eq.status === 'En Mantenimiento' ? '#facc15' : '#f87171'
                  }}>
                    {eq.status === 'Operativo' ? <CheckCircle size={14} /> : eq.status === 'En Mantenimiento' ? <Wrench size={14} /> : <AlertTriangle size={14} />}
                    {eq.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  {eq.lastMaint}
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  {eq.nextMaint}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button title="Registrar Mantenimiento" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #facc15', color: '#facc15', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Wrench size={16} />
                    </button>
                    <button title="Dar de Baja" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #f87171', color: '#f87171', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <AlertTriangle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cafeteria Inventory Area */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Inventario de Cafetería y Suplementos
        </h3>
        <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PRODUCTO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>PRECIO VENTA</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>STOCK ACTUAL</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cafeteria.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>{prod.name}</p>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{prod.category}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                    {prod.price}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: prod.stock <= prod.minStock ? '#f87171' : '#fff' }}>
                      {prod.stock}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginLeft: '5px' }}>
                      / min {prod.minStock}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: '600',
                      background: prod.status === 'Suficiente' ? 'rgba(34, 197, 94, 0.15)' : prod.status === 'Bajo Stock' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: prod.status === 'Suficiente' ? '#4ade80' : prod.status === 'Bajo Stock' ? '#facc15' : '#f87171'
                    }}>
                      {prod.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'rgba(0, 242, 255, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                      <Plus size={14} /> Reabastecer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
