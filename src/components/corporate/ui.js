'use client';
// Corporate Meal — shared UI primitives (DineOpen red theme). Keeps every page rich + consistent.
import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { FaTimes, FaSpinner, FaInbox, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { C, S } from '../../corporate/theme';
export { statusPill } from '../../corporate/theme';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
      <div>
        <h1 style={S.h1}>{title}</h1>
        {subtitle && <p style={S.sub}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, style, pad = true }) {
  return <div style={{ ...S.card, ...(pad ? S.cardPad : {}), ...style }}>{children}</div>;
}

export function StatCard({ label, value, sub, icon: Icon, tone = 'primary' }) {
  const tones = { primary: [C.primary, C.primarySoft], green: [C.green, C.greenSoft], amber: [C.amber, C.amberSoft], blue: [C.blue, C.blueSoft] };
  const [color, bg] = tones[tone] || tones.primary;
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {Icon && <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={19} color={color} /></div>}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>{sub}</div>}
      </div>
    </Card>
  );
}

export function Button({ children, variant = 'primary', loading, disabled, style, ...rest }) {
  const base = variant === 'ghost' ? S.btnGhost : variant === 'danger' ? S.btnDanger : S.btnPrimary;
  const off = disabled || loading;
  return (
    <button {...rest} disabled={off} style={{ ...base, opacity: off ? 0.6 : 1, cursor: off ? 'not-allowed' : 'pointer', ...style }}>
      {loading && <FaSpinner size={13} style={{ animation: 'spin 0.9s linear infinite' }} />}
      {children}
    </button>
  );
}

export function Field({ label, hint, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={S.label}>{label}{required && <span style={{ color: C.primary }}> *</span>}</label>}
      {children}
      {hint && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export function TextInput(props) { return <input {...props} style={{ ...S.input, ...(props.style || {}) }} />; }
export function Select({ children, ...props }) { return <select {...props} style={{ ...S.input, ...(props.style || {}) }}>{children}</select>; }

export function Modal({ open, onClose, title, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: C.radius, width: '100%', maxWidth: width, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: C.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={S.h2}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: C.surface2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={13} color={C.muted} /></button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = FaInbox, title, subtitle, action }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Icon size={22} color={C.faint} /></div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{subtitle}</div>}
      {action}
    </Card>
  );
}

export function Loader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><FaSpinner size={22} color={C.primary} style={{ animation: 'spin 0.9s linear infinite' }} /></div>;
}

// ── Toast ──
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, msg) => {
    const id = `${type}-${msg}-${toasts.length}-${performance.now()}`;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, [toasts.length]);
  const api = { success: (m) => push('success', m), error: (m) => push('error', m) };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 15px', borderRadius: 11, background: '#fff', border: `1px solid ${t.type === 'error' ? C.primaryBorder : C.greenBorder}`, boxShadow: C.shadowLg, fontSize: 13.5, fontWeight: 600, color: C.ink, maxWidth: 360 }}>
            {t.type === 'error' ? <FaExclamationCircle color={C.primary} /> : <FaCheckCircle color={C.green} />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() { return useContext(ToastCtx) || { success: () => {}, error: () => {} }; }
