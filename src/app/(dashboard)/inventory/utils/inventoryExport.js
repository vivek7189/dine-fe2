// Client-side current-inventory report export (CSV + Excel). PDF is handled
// separately by InventoryDownloadPDFButton. Reuses the same idiom as the Menu
// export (Blob + BOM for CSV, dynamic xlsx import for Excel) — xlsx is already
// a dependency, so no new packages.

function asDate(v) {
  if (!v) return null;
  try { return v?.toDate ? v.toDate() : new Date(v); } catch { return null; }
}

function statusOf(it) {
  const cur = Number(it.currentStock) || 0;
  const min = Number(it.minStock) || 0;
  if (cur <= 0) return 'Out of Stock';
  if (cur <= min) return 'Low Stock';
  return 'In Stock';
}

// One row per inventory item, matching the on-screen / PDF stock report columns.
function buildRows(items = []) {
  return (items || []).map((it, i) => {
    const exp = asDate(it.expiryDate);
    return {
      '#': i + 1,
      'Item': it.name || '',
      'Category': it.category || '',
      'Current Stock': Number(it.currentStock) || 0,
      'Unit': it.unit || '',
      'Min': it.minStock ?? '',
      'Max': it.maxStock ?? '',
      'Cost/Unit': Number(it.costPerUnit) || 0,
      'Value': Math.round(((Number(it.currentStock) || 0) * (Number(it.costPerUnit) || 0)) * 100) / 100,
      'Supplier': it.supplier || '',
      'Expiry': exp ? exp.toLocaleDateString() : '',
      'Status': statusOf(it),
    };
  });
}

const slug = (s) => String(s || 'inventory').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'inventory';
const today = () => new Date().toISOString().slice(0, 10);

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportInventoryCSV(items, restaurantName = 'inventory') {
  const rows = buildRows(items);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  // BOM so Excel opens UTF-8 correctly (e.g. Arabic supplier names)
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `${slug(restaurantName)}-inventory-${today()}.csv`);
}

export async function exportInventoryExcel(items, restaurantName = 'inventory') {
  const rows = buildRows(items);
  if (rows.length === 0) return;
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length + 2, 12) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `${slug(restaurantName)}-inventory-${today()}.xlsx`);
}
