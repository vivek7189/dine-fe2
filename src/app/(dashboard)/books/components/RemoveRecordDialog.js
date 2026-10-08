'use client';

// Two-step "remove" for staff money records (advances, bonuses) — asked by MFC: an advance or bonus
// must never disappear by one accidental click. Step 1 shows exactly what goes (staff, amount, the
// effect on pay) and needs a reason; step 2 is a final red confirm. Nothing is erased on the server:
// the record is kept as "Removed" (who / when / why) and can be restored from "Show removed".

import { useState } from 'react';

export default function RemoveRecordDialog({ title, rows = [], effect, onConfirm, onClose }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true); setError('');
    try { await onConfirm(reason.trim()); }
    catch (e) { setError(e?.message || 'Could not remove.'); setBusy(false); }
  };

  return (
    <div onClick={busy ? undefined : onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{title}</div>
        <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
              <span style={{ color: '#6b7280' }}>{k}</span><b style={{ color: '#111827' }}>{v}</b>
            </div>
          ))}
        </div>
        {effect && <div style={{ marginTop: 10, fontSize: 13, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px' }}>{effect}</div>}

        {step === 1 ? (
          <>
            <label style={{ display: 'block', marginTop: 12, fontSize: 12, fontWeight: 700, color: '#374151' }}>Why is it being removed? <span style={{ color: '#b91c1c' }}>*</span>
              <input autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. entered by mistake, duplicate" maxLength={300}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={onClose} style={btn('#fff', '#374151', '#e5e7eb')}>Keep it</button>
              <button disabled={!reason.trim()} onClick={() => setStep(2)} style={{ ...btn('#fff', '#b91c1c', '#fecaca'), opacity: reason.trim() ? 1 : 0.5, cursor: reason.trim() ? 'pointer' : 'not-allowed' }}>Continue</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginTop: 12, fontSize: 13, color: '#111827' }}>
              Are you sure? Reason: <i>{reason.trim()}</i>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>It is kept as &quot;Removed&quot; and can be restored from &quot;Show removed&quot;.</div>
            </div>
            {error && <div style={{ marginTop: 8, fontSize: 12, color: '#b91c1c' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button disabled={busy} onClick={() => setStep(1)} style={btn('#fff', '#374151', '#e5e7eb')}>Back</button>
              <button disabled={busy} onClick={confirm} style={btn('#dc2626', '#fff', '#dc2626')}>{busy ? 'Removing…' : 'Yes, remove'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const btn = (bg, color, border) => ({ padding: '8px 14px', borderRadius: 8, border: `1px solid ${border}`, background: bg, color, fontWeight: 700, cursor: 'pointer', fontSize: 13 });
