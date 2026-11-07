'use client';

// "When do customers pay online?" — rules for the QR / online ordering page, shared by Customer App
// settings and Admin → Payment Settings. Saved as customerAppSettings.paymentSettings.onlinePay:
//   { dine_in, takeaway, delivery: 'off' | 'optional' | 'required', defaultChoice: 'online' | 'later', requireAbove }
// The server applies the same rules (utils/onlinePayRules.js) and returns them normalised.

const TYPES = [['dine_in', 'Dine-in (table QR)'], ['takeaway', 'Takeaway / pickup'], ['delivery', 'Delivery']];
const RULES = [['off', 'Off'], ['optional', 'Customer chooses'], ['required', 'Pay first']];
const RULE_HELP = {
  off: 'No online payment — placed as now, paid at the counter / on delivery.',
  optional: 'Customer picks: pay online now, or pay later.',
  required: 'The order reaches you only after the payment succeeds.',
};

// Older saves (mode + types) → per-type rules, same as the server.
export function toOnlinePay(ps) {
  const p = ps || {};
  if (p.onlinePay && typeof p.onlinePay === 'object') return { dine_in: 'off', takeaway: 'off', delivery: 'off', defaultChoice: 'online', requireAbove: 0, ...p.onlinePay };
  const mode = p.onlinePayMode === 'optional' ? 'optional' : 'required';
  const types = Array.isArray(p.onlinePayOrderTypes) && p.onlinePayOrderTypes.length ? p.onlinePayOrderTypes : TYPES.map(t => t[0]);
  const out = { defaultChoice: 'online', requireAbove: 0 };
  for (const [k] of TYPES) out[k] = types.includes(k) ? mode : 'off';
  return out;
}

// ps = customerAppSettings.paymentSettings (new onlinePay or the older mode/types fields).
export default function OnlinePayRules({ ps, onChange, gatewayName = 'online payment', currency = '₹' }) {
  const v = toOnlinePay(ps);
  const set = (patch) => onChange({ onlinePay: { ...v, ...patch } });
  const anyOptional = TYPES.some(([k]) => v[k] === 'optional');
  const allOff = TYPES.every(([k]) => v[k] === 'off');

  const seg = (on, i, n) => ({
    flex: 1, padding: '8px 6px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
    background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151',
    border: '1px solid ' + (on ? '#111827' : '#d1d5db'), marginLeft: i ? -1 : 0,
    borderRadius: i === 0 ? '8px 0 0 8px' : i === n - 1 ? '0 8px 8px 0' : 0,
  });

  return (
    <div data-testid="online-pay-rules" style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>When do customers pay with {gatewayName}?</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>For orders from your QR code / online ordering page. Set it for each kind of order.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TYPES.map(([k, label]) => (
          <div key={k}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 150 }}>{label}</div>
              <div role="radiogroup" aria-label={`Online payment for ${label}`} style={{ display: 'flex', flex: '1 1 300px', maxWidth: 420 }}>
                {RULES.map(([r, t], i) => (
                  <button key={r} type="button" role="radio" aria-checked={v[k] === r} onClick={() => set({ [k]: r })} style={seg(v[k] === r, i, RULES.length)}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4, marginLeft: 0 }}>{RULE_HELP[v[k]]}</div>
          </div>
        ))}
        {allOff && <div style={{ fontSize: 12, color: '#b45309' }}>All off — customers will not be asked to pay online. (Saving with everything off keeps &quot;Customer chooses&quot;; switch {gatewayName} off above to stop online payment.)</div>}
      </div>

      {anyOptional && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>When the customer can choose, start with</div>
          <div role="radiogroup" aria-label="Pre-selected payment choice" style={{ display: 'flex', maxWidth: 320 }}>
            {[['online', 'Pay online now'], ['later', 'Pay later']].map(([c, t], i) => (
              <button key={c} type="button" role="radio" aria-checked={v.defaultChoice === c} onClick={() => set({ defaultChoice: c })} style={seg(v.defaultChoice === c, i, 2)}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {anyOptional && (
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Pay first for big orders <span style={{ fontWeight: 400, color: '#6b7280' }}>(optional)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#374151' }}>When the bill is</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 8px', background: '#fff' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{currency}</span>
              <input type="number" min={0} step="1" inputMode="numeric" aria-label="Pay first above amount"
                value={v.requireAbove ? v.requireAbove : ''} placeholder="0"
                onChange={(e) => { const n = Number(e.target.value); set({ requireAbove: Number.isFinite(n) && n > 0 ? n : 0 }); }}
                style={{ width: 90, border: 'none', outline: 'none', padding: '8px 4px', fontSize: 13, background: 'transparent' }} />
            </span>
            <span style={{ fontSize: 13, color: '#374151' }}>or more, it must be paid online first.</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4 }}>Empty or 0 = never. Applies to order types set to &quot;Customer chooses&quot;.</div>
        </label>
      )}
    </div>
  );
}
