// POS v1 (/dashboard) ↔ v2 (/dashboard/v2) hand-off. Links into the POS carry what to open
// (Tables "+ Add" → ?orderId=…&mode=edit&from=tables, "Take Order" → ?tableId=…&tableNo=…). The
// redirect to the restaurant's chosen version used to drop them, so v2 opened an empty bill with no
// table. Pages keep the query they were opened with (before tidying the address bar) and pass it on;
// one-time login params (token / user) are never carried over.
export function handoffQuery(search) {
  const q = new URLSearchParams(search || '');
  q.delete('token');
  q.delete('user');
  const s = q.toString();
  return s ? `?${s}` : '';
}
