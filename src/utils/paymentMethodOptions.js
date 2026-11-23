// The payment methods a restaurant takes money with — exactly what the POS billing buttons show
// (dashboard OrderSummary): the restaurant's own list (posSettings.paymentMethods, enabled ones), else
// Cash + UPI + Card unless hidden. Used wherever money is received outside billing (Receive Payment,
// Mark Paid) so those never show a different, hard-coded list.
export function posPaymentMethodOptions(posSettings) {
  const ps = posSettings || {};
  if (Array.isArray(ps.paymentMethods)) {
    const list = ps.paymentMethods.filter(m => m && m.id && m.enabled).map(m => ({ id: m.id, label: m.label || m.id }));
    if (list.length) return list;
  }
  return [
    { id: 'cash', label: 'Cash' },
    ...(!ps.hideUPI ? [{ id: 'upi', label: 'UPI' }] : []),
    ...(!ps.hideCard ? [{ id: 'card', label: 'Card' }] : []),
  ];
}

// Names for stored method ids (old records, or a method later switched off in POS settings).
const METHOD_NAMES = { cash: 'Cash', card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', petty_cash: 'Petty cash', 'm-pesa': 'M-PESA', mpesa: 'M-PESA', cheque: 'Cheque', credit: 'Credit' };
export function paymentMethodLabel(id, list) {
  const m = (list || []).find(x => x && (x.id === id || x.value === id));
  if (m) return m.label;
  return METHOD_NAMES[id] || String(id || '').replace(/[_-]+/g, ' ');
}

// Money paid or received away from the POS bill (Books expenses, booking payments): the POS
// methods (M-PESA in Kenya, UPI in India …) + Bank Transfer, and the record's own method kept
// when it is not in the list any more, so editing an old record never loses it.
export function moneyMethodOptions(posSettings, current) {
  const list = posPaymentMethodOptions(posSettings);
  if (!list.some(m => m.id === 'bank_transfer')) list.push({ id: 'bank_transfer', label: 'Bank Transfer' });
  if (current && !list.some(m => m.id === current)) list.push({ id: current, label: paymentMethodLabel(current) });
  return list;
}
