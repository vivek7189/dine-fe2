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
