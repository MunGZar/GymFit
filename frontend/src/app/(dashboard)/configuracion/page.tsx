"use client";
import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';
import { Settings, Building, Users, Palette, Save, Bell, Plus, Trash2, Edit3, Shield, X } from 'lucide-react';
import { usuariosApi } from '@/lib/api';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // States for forms and preferences
  const [gymData, setGymData] = useState({ 
    nombre: 'GymFit Center', 
    telefono: '+57 300 123 4567', 
    correo: 'soporte@gymfit.com', 
    direccion: 'Av. Principal 123, Ciudad', 
    mensaje: '¡Bienvenido a GymFit! Tu esfuerzo de hoy es tu éxito de mañana.' 
  });
  
  const [prefs, setPrefs] = useState({ 
    darkMode: true, 
    alertasVencimiento: true, 
    notificacionesEmail: false 
  });

  // User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', identificacion: '', correo: '', id_rol: 1, password: '' });

  useEffect(() => {
    // Load local configuration
    const savedGym = localStorage.getItem('gym_settings');
    if (savedGym) setGymData(JSON.parse(savedGym));
    
    const savedPrefs = localStorage.getItem('gym_prefs');
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, []);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      fetchUsuarios();
    }
  }, [activeTab]);

  const fetchUsuarios = () => {
    setLoadingUsers(true);
    usuariosApi.findAll()
      .then(res => setUsuarios(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingUsers(false));
  };

  // General Handlers
  const saveGymData = () => {
    localStorage.setItem('gym_settings', JSON.stringify(gymData));
    alert('Configuración guardada exitosamente');
  };

  const togglePref = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem('gym_prefs', JSON.stringify(newPrefs));
    
    if (key === 'darkMode') {
      if (newPrefs.darkMode) {
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
      }
    }
  };

  // User Handlers
  const openModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({ nombre: user.nombre, identificacion: user.identificacion, correo: user.correo, id_rol: user.rol?.id_rol || 1, password: '' });
    } else {
      setFormData({ nombre: '', identificacion: '', correo: '', id_rol: 1, password: '' });
    }
    setIsModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      if (editingUser) {
        await usuariosApi.update(editingUser.id_usuario, payload);
      } else {
        await usuariosApi.create(payload);
      }
      setIsModalOpen(false);
      fetchUsuarios();
    } catch (error) {
      alert('Error guardando usuario. Verifique los datos o si el documento/correo ya existen.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('¿Está seguro de desactivar este usuario?')) {
      try {
        await usuariosApi.remove(id);
        fetchUsuarios();
      } catch (error) {
        alert('Error al desactivar usuario');
      }
    }
  };

  return (
    <div className={styles.container} style={{ color: 'var(--text-main)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
          <Settings size={24} color="var(--primary)" />
          Configuración del Sistema
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Administra la información del gimnasio, usuarios del sistema y preferencias visuales.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div className="glass" style={{ width: '100%', maxWidth: '280px', borderRadius: '16px', overflow: 'hidden', padding: '1rem', flexShrink: 0 }}>
          <button onClick={() => setActiveTab('general')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '1rem', background: activeTab === 'general' ? 'var(--selection)' : 'transparent', border: 'none', color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'general' ? 600 : 400, transition: 'all 0.3s' }}>
            <Building size={18} /> Datos del Gimnasio
          </button>
          <button onClick={() => setActiveTab('usuarios')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '1rem', background: activeTab === 'usuarios' ? 'var(--selection)' : 'transparent', border: 'none', color: activeTab === 'usuarios' ? 'var(--primary)' : 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'usuarios' ? 600 : 400, transition: 'all 0.3s', marginTop: '0.5rem' }}>
            <Users size={18} /> Usuarios del Sistema
          </button>
          <button onClick={() => setActiveTab('apariencia')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '1rem', background: activeTab === 'apariencia' ? 'var(--selection)' : 'transparent', border: 'none', color: activeTab === 'apariencia' ? 'var(--primary)' : 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'apariencia' ? 600 : 400, transition: 'all 0.3s', marginTop: '0.5rem' }}>
            <Palette size={18} /> Preferencias
          </button>
        </div>

        {/* Content Area */}
        <div className="glass" style={{ flex: '1 1 400px', borderRadius: '16px', padding: '2rem', minHeight: '500px' }}>
          
          {activeTab === 'general' && (
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                <Building size={20} color="var(--primary)" /> Información General
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre del Gimnasio</label>
                  <input type="text" value={gymData.nombre} onChange={e => setGymData({...gymData, nombre: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Teléfono de Contacto</label>
                  <input type="text" value={gymData.telefono} onChange={e => setGymData({...gymData, telefono: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Correo de Soporte</label>
                  <input type="email" value={gymData.correo} onChange={e => setGymData({...gymData, correo: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dirección Física</label>
                  <input type="text" value={gymData.direccion} onChange={e => setGymData({...gymData, direccion: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mensaje de Bienvenida (App Socios)</label>
                  <textarea rows={3} value={gymData.mensaje} onChange={e => setGymData({...gymData, mensaje: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={saveGymData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                  <Shield size={20} color="var(--primary)" /> Usuarios del Sistema
                </h3>
                <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  <Plus size={18} /> Nuevo Usuario
                </button>
              </div>

              {loadingUsers ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)' }}>
                  <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--surface-border)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Nombre</th>
                        <th style={{ padding: '1rem' }}>Documento</th>
                        <th style={{ padding: '1rem' }}>Correo</th>
                        <th style={{ padding: '1rem' }}>Rol</th>
                        <th style={{ padding: '1rem' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.filter(u => u.estado !== false).map((u: any) => (
                        <tr key={u.id_usuario} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--selection)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {u.nombre?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                            {u.nombre}
                          </td>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{u.identificacion}</td>
                          <td style={{ padding: '1rem' }}>{u.correo}</td>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: u.rol?.nombre === 'admin' ? 'rgba(239,68,68,0.2)' : u.rol?.nombre === 'recepcionista' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)', color: u.rol?.nombre === 'admin' ? '#ef4444' : u.rol?.nombre === 'recepcionista' ? '#3b82f6' : '#a855f7' }}>
                              {u.rol?.nombre?.toUpperCase() || 'SOCIO'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => openModal(u)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Editar"><Edit3 size={18} /></button>
                              <button onClick={() => handleDeleteUser(u.id_usuario)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Eliminar"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {usuarios.filter(u => u.estado !== false).length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay usuarios activos registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                <Palette size={20} color="var(--primary)" /> Preferencias
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-input)', borderRadius: '12px', border: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>Modo Oscuro</h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>El sistema utiliza el modo oscuro por defecto para cuidar la visión.</p>
                  </div>
                  <div onClick={() => togglePref('darkMode')} style={{ width: '44px', height: '24px', background: prefs.darkMode ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: prefs.darkMode ? '#000' : '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: prefs.darkMode ? '22px' : '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-input)', borderRadius: '12px', border: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={16} /> Alertas de Vencimientos
                    </h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mostrar alertas visuales en el panel principal cuando una membresía está por vencer.</p>
                  </div>
                  <div onClick={() => togglePref('alertasVencimiento')} style={{ width: '44px', height: '24px', background: prefs.alertasVencimiento ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: prefs.alertasVencimiento ? '#000' : '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: prefs.alertasVencimiento ? '22px' : '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-input)', borderRadius: '12px', border: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={16} /> Notificaciones por Correo Semanales
                    </h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recibir reportes automáticos de ventas y membresías al cierre de la semana.</p>
                  </div>
                  <div onClick={() => togglePref('notificacionesEmail')} style={{ width: '44px', height: '24px', background: prefs.notificacionesEmail ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: prefs.notificacionesEmail ? '#000' : '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: prefs.notificacionesEmail ? '22px' : '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Usuario */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '2rem', position: 'relative', background: 'var(--surface)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', color: 'var(--text-main)' }}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Documento (Cédula)</label>
                <input required type="text" value={formData.identificacion} onChange={e => setFormData({...formData, identificacion: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
                <input required type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
              </div>
              
              {!editingUser && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contraseña</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rol del Sistema</label>
                <select value={formData.id_rol} onChange={e => setFormData({...formData, id_rol: Number(e.target.value)})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-input)', color: 'var(--text-main)' }}>
                  <option value={1} style={{ color: '#000' }}>Administrador</option>
                  <option value={2} style={{ color: '#000' }}>Entrenador</option>
                  <option value={3} style={{ color: '#000' }}>Recepcionista</option>
                </select>
              </div>

              <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
