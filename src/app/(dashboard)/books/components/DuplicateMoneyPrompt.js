'use client';

// "Looks like ADV-0017 (₹2,000 on 8 Oct). Record another one anyway?" — shown when the server finds an
// advance / bonus of the same amount for the same person in the last few days (409 POSSIBLE_DUPLICATE).
import { RefTag } from '../../../../components/requests/RepairTicket';

export default function DuplicateMoneyPrompt({ matches = [], what = 'advance', fmt, onConfirm, onCancel, saving }) {
  if (!matches.length) return null;
  const day = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
  return (
    <div role="alert" style={{ marginTop: 12, border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e' }}>Possible duplicate — the same amount was already recorded for this person:</div>
      <div style={{ display: 'grid', gap: 4, margin: '8px 0' }}>
        {matches.map(m => (
          <div key={m.id} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <RefTag refNo={m.refNo} /> <b>{fmt(m.amount)}</b> · {day(m.createdAt)}{m.reason ? ` · ${m.reason}` : ''}{m.status ? ` · ${m.status}` : ''}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>No — it’s the same, don’t add</button>
        <button type="button" disabled={saving} onClick={onConfirm} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#92400e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : `Yes — record another ${what}`}</button>
      </div>
    </div>
  );
}
