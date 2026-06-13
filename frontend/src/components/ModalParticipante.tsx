"use client";
import React, { useState } from 'react';
import { X, KeyRound, User, Mail, Lock, Phone, CheckCircle2, ChevronRight, Loader2, Hash } from 'lucide-react';
import { codigosParticipanteApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ReactDOM } from 'react';

interface Props { onClose: () => void; }
type Step = 'codigo' | 'formulario' | 'exito';

function SkeletonField() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ height: '14px', width: '35%', borderRadius: '6px', background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ height: '46px', width: '100%', borderRadius: '10px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    </div>
  );
}

export default function ModalParticipante({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('codigo');
  const [skeletonVisible, setSkeletonVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [form, setForm] = useState({ nombre: '', identificacion: '', correo: '', password: '', confirmar: '', telefono: '' });
  const [errorForm, setErrorForm] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const handleValidarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) { setErrorCodigo('Ingresa el código de participante.'); return; }
    setLoadingCodigo(true); setErrorCodigo('');
    setTimeout(() => {
      setLoadingCodigo(false); setSkeletonVisible(true);
      setTimeout(() => { setSkeletonVisible(false); setStep('formulario'); }, 1200);
    }, 600);
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmar) { setErrorForm('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 6) { setErrorForm('Mínimo 6 caracteres.'); return; }
    setLoadingForm(true); setErrorForm('');
    try {
      await codigosParticipanteApi.registrarConCodigo({
        codigo: codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        identificacion: form.identificacion.trim(),
        correo: form.correo.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono.trim() || undefined,
      });
      setStep('exito');
    } catch (err: unknown) {
      setErrorForm(err instanceof Error ? err.message : 'Error al registrar.');
    } finally { setLoadingForm(false); }
  };

  const inp: React.CSSProperties = { padding: '12px 14px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '0.95rem', width: '100%', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '2px' };
  const fw: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' };
  const ico: React.CSSProperties = { position: 'absolute', bottom: '13px', left: '12px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' };

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes fadeInScale{from{opacity:0;transform:scale(0.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes successPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}.part-inp:focus{border-color:var(--primary)!important;box-shadow:0 0 0 3px rgba(0,242,255,.12)!important;background:rgba(0,242,255,.04)!important}`}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:900 }} />
      <div className="glass" style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:910, width:'100%', maxWidth:'480px', borderRadius:'20px', padding:'2rem', animation:'fadeInScale 0.4s cubic-bezier(0.16,1,0.3,1)', background:'var(--surface, rgba(10,10,20,0.95))', boxShadow:'0 30px 80px rgba(0,0,0,0.5)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:38, height:38, borderRadius:'10px', background:'linear-gradient(135deg, var(--primary), var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center' }}><KeyRound size={20} color="#000" /></div>
            <div>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'var(--text-main)' }}>Agregar Participante</h2>
              <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-muted)' }}>{step==='codigo'?'Paso 1 — Código de acceso':step==='formulario'?'Paso 2 — Tus datos':'¡Registro exitoso!'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}><X size={20} /></button>
        </div>

        {step==='codigo' && !skeletonVisible && (
          <form onSubmit={handleValidarCodigo} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
            <div style={{ padding:'1rem', borderRadius:'12px', background:'rgba(0,242,255,0.06)', border:'1px solid rgba(0,242,255,0.15)', fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:1.6 }}>
               Solicita tu <strong style={{ color:'var(--primary)' }}>código de participante</strong> al administrador del gimnasio para poder registrarte.
            </div>
            <div style={fw}>
              <label style={lbl}>Código de Participante</label>
              <div style={{ position:'relative' }}>
                <Hash size={16} style={{ ...ico, bottom:'15px' }} />
                <input className="part-inp" type="text" placeholder="Ej: GYM-A1B2C3" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} maxLength={16} style={{ ...inp, textTransform:'uppercase', letterSpacing:'2px', fontWeight:700 }} autoFocus />
              </div>
            </div>
            {errorCodigo && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'0.6rem 0.9rem', fontSize:'0.84rem', color:'#f87171' }}>{errorCodigo}</div>}
            <button type="submit" disabled={loadingCodigo} style={{ padding:'13px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg, var(--primary), var(--secondary))', color:'#000', fontWeight:700, fontSize:'0.95rem', cursor:loadingCodigo?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loadingCodigo?0.7:1, transition:'all 0.3s' }}>
              {loadingCodigo?<><Loader2 size={18} style={{animation:'spin 1s linear infinite'}} />Verificando…</>:<><ChevronRight size={18} />Continuar</>}
            </button>
          </form>
        )}

        {skeletonVisible && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
            {[...Array(5)].map((_,i)=><SkeletonField key={i} />)}
            <div style={{ height:'46px', borderRadius:'10px', background:'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
          </div>
        )}

        {step==='formulario' && (
          <form onSubmit={handleRegistro} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ padding:'0.6rem 1rem', borderRadius:'8px', background:'rgba(0,242,255,0.07)', border:'1px solid rgba(0,242,255,0.2)', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.84rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span style={{ color:'var(--text-muted)' }}>Código válido:</span>
              <span style={{ color:'var(--primary)', fontWeight:700, letterSpacing:'1px' }}>{codigo}</span>
            </div>
            <div style={fw}><label style={lbl}>Nombre Completo *</label><div style={{position:'relative'}}><User size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" required type="text" placeholder="jose muñoz" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={inp} /></div></div>
            <div style={fw}><label style={lbl}>Número de Documento *</label><div style={{position:'relative'}}><Hash size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" required type="text" placeholder="2112211" value={form.identificacion} onChange={e=>setForm({...form,identificacion:e.target.value})} style={inp} /></div></div>
            <div style={fw}><label style={lbl}>Correo Electrónico *</label><div style={{position:'relative'}}><Mail size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" required type="email" placeholder="jose@correo.com" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} style={inp} /></div></div>
            <div style={fw}><label style={lbl}>Teléfono (opcional)</label><div style={{position:'relative'}}><Phone size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" type="tel" placeholder="+57 3232310187" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} style={inp} /></div></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
              <div style={fw}><label style={lbl}>Contraseña *</label><div style={{position:'relative'}}><Lock size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" required type="password" placeholder="••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={inp} minLength={6} /></div></div>
              <div style={fw}><label style={lbl}>Confirmar *</label><div style={{position:'relative'}}><Lock size={15} style={{...ico,bottom:'14px'}} /><input className="part-inp" required type="password" placeholder="••••••" value={form.confirmar} onChange={e=>setForm({...form,confirmar:e.target.value})} style={inp} minLength={6} /></div></div>
            </div>
            {errorForm && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'0.6rem 0.9rem', fontSize:'0.84rem', color:'#f87171' }}>{errorForm}</div>}
            <div style={{ display:'flex', gap:'0.8rem', marginTop:'0.3rem' }}>
              <button type="button" onClick={()=>setStep('codigo')} style={{ flex:'0 0 auto', padding:'12px 16px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem' }}>← Atrás</button>
              <button type="submit" disabled={loadingForm} style={{ flex:1, padding:'13px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg, var(--primary), var(--secondary))', color:'#000', fontWeight:700, fontSize:'0.95rem', cursor:loadingForm?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loadingForm?0.7:1, transition:'all 0.3s' }}>
                {loadingForm?<><Loader2 size={18} style={{animation:'spin 1s linear infinite'}} />Registrando…</>:'✓ Registrarme como Participante'}
              </button>
            </div>
          </form>
        )}

        {step==='exito' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', padding:'1rem 0' }}>
            <div style={{ animation:'successPop 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(0,242,255,0.3)' }}><CheckCircle2 size={42} color="#000" /></div>
            </div>
            <div style={{ textAlign:'center' }}>
              <h3 style={{ margin:'0 0 8px', fontSize:'1.3rem', fontWeight:700, color:'var(--text-main)' }}>¡Registro Exitoso!</h3>
              <p style={{ margin:0, color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.6 }}>Tu cuenta ha sido creada. Ya puedes acceder al panel de GymFit como participante.</p>
            </div>
            <button onClick={()=>{onClose();router.push('/dashboard');}} style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg, var(--primary), var(--secondary))', color:'#000', fontWeight:700, fontSize:'1rem', cursor:'pointer' }}>Ir al Panel →</button>
          </div>
        )}
      </div>
    </>
  );
}
