'use client';

// Photos on staff requests: thumbnails (tap to open) and a picker that uploads at once.
import { useRef, useState } from 'react';
import apiClient from '../../lib/api';

const label = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
const btn = (bg, fg = '#fff', border = 'none') => ({ padding: '9px 14px', borderRadius: 9, border, background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });

// Photos: pick (camera or gallery) → uploaded at once → shown as thumbnails; tap one to open it.
export function Photos({ urls = [], onOpen }) {
  if (!urls.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {urls.map(u => (
        <button key={u} type="button" onClick={() => onOpen(u)} style={{ padding: 0, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', background: '#f9fafb' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="Attached photo" style={{ width: 72, height: 72, objectFit: 'cover', display: 'block' }} />
        </button>
      ))}
    </div>
  );
}
export function PhotoPicker({ rid, value, onChange, max = 4 }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (files) => {
    const list = [...(files || [])].slice(0, max - value.length);
    if (!list.length) return;
    setBusy(true); setErr('');
    try { const r = await apiClient.uploadStaffRequestPhotos(rid, list); onChange([...value, ...(r.urls || [])].slice(0, max)); }
    catch (e) { setErr(e?.message || 'Could not upload the photo'); }
    finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div>
      <label style={label}>Photos (optional, up to {max})</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {value.map(u => (
          <div key={u} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="Photo to send" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter(x => x !== u))}
              style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 999, border: 'none', background: '#111827', color: '#fff', fontSize: 11, cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" disabled={busy} onClick={() => ref.current && ref.current.click()} style={{ ...btn('#fff', '#374151', '1.5px dashed #d1d5db'), height: 64, minWidth: 90 }}>
            {busy ? 'Uploading…' : '+ Add photo'}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e => pick(e.target.files)} />
      </div>
      {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>{err}</div>}
    </div>
  );
}

