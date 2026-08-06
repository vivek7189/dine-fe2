// Toast-style display order number.
//
// On multi-terminal offline setups each terminal keeps its OWN daily counter, so the
// backend stamps a pre-formatted, terminal-scoped `orderNumberDisplay` at creation
// (e.g. "T2-45") that never collides with another terminal's number. For cloud /
// single-terminal orders there's no prefix, so we fall back to the plain daily number.
//
// Use this EVERYWHERE an order number is shown (lists, receipts, KOTs) so the same
// value appears on every screen and print, regardless of which terminal is viewing it.
export function orderDisplayNumber(order) {
  if (!order) return '';
  if (order.orderNumberDisplay) return order.orderNumberDisplay;
  if (order.dailyOrderId != null) return String(order.dailyOrderId);
  if (order.orderNumber != null) return String(order.orderNumber);
  return order.id ? String(order.id).slice(-4).toUpperCase() : '—';
}

export default orderDisplayNumber;
