'use client';

// "When do customers pay online?" — rules for the QR / online ordering page, shared by Customer App
// settings and Admin → Payment Settings. Saved in customerAppSettings.paymentSettings:
//   onlinePayMode: 'required' (pay first — order placed only after payment) | 'optional' (customer chooses)
//   onlinePayOrderTypes: ['dine_in','takeaway','delivery'] — where online payment is used
// The server applies the same rules (utils/onlinePayRules.js). Defaults = pay first, every order type.

const TYPES = [['dine_in', 'Dine-in (table QR)'], ['takeaway', 'Takeaway / pickup'], ['delivery', 'Delivery']];

export default function OnlinePayRules({ mode, orderTypes, onChange, gatewayName = 'online payment' }) {
  const m = mode === 'optional' ? 'optional' : 'required';
  const types = Array.isArray(orderTypes) && orderTypes.length ? orderTypes : TYPES.map(t => t[0]);
  const toggleType = (k) => {
    const next = types.includes(k) ? types.filter(t => t !== k) : [...types, k];
    if (!next.length) return; // at least one order type
    onChange({ onlinePayOrderTypes: TYPES.map(t => t[0]).filter(t => next.includes(t)) });
  };
  const card = (on) => ({
    textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', background: on ? '#eff6ff' : '#fff',
    border: on ? '2px solid #2563eb' : '1px solid #e5e7eb', flex: 1, minWidth: 0,
  });
  return (
    <div data-testid="online-pay-rules" style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>When do customers pay with {gatewayName}?</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>For orders from your QR code / online ordering page.</div>
      </div>

      <div role="radiogroup" aria-label="Online payment" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" role="radio" aria-checked={m === 'required'} onClick={() => onChange({ onlinePayMode: 'required' })} style={card(m === 'required')}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Pay first (required)</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>The order reaches you only after the payment succeeds.</div>
        </button>
        <button type="button" role="radio" aria-checked={m === 'optional'} onClick={() => onChange({ onlinePayMode: 'optional' })} style={card(m === 'optional')}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Customer chooses</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Pay online now, or pay at the counter / on delivery.</div>
        </button>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Use online payment for</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TYPES.map(([k, t]) => {
            const on = types.includes(k);
            return (
              <button key={k} type="button" role="checkbox" aria-checked={on} onClick={() => toggleType(k)}
                style={{ padding: '8px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151', border: on ? '1px solid #111827' : '1px solid #d1d5db' }}>
                {on ? '✓ ' : ''}{t}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          {m === 'required'
            ? `Orders of these types must be paid online first. Other order types are placed without online payment.`
            : `For these order types customers see "Pay online now" or "${types.length === 1 && types[0] === 'delivery' ? 'Cash on delivery' : 'Pay at counter'}".`}
        </div>
      </div>
    </div>
  );
}
