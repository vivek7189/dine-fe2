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

// ── Recipe Cost Sheet export ──────────────────────────────────────────────────
// `recipes` = the /api/recipes/:id/cost-export payload: each recipe with servings,
// totalCost, costPerServing and an ingredients[] list (name, quantity, unit,
// costPerUnit, lineCost). Summary rows = one per recipe; detail rows = one per ingredient.
function recipeSummaryRows(recipes = []) {
  return (recipes || []).map((r, i) => ({
    '#': i + 1,
    'Recipe': r.name || '',
    'Category': r.category || '',
    'Menu Item': r.menuItemName || '',
    'Servings': r.servings ?? '',
    'Total Cost': Number(r.totalCost) || 0,
    'Cost / Serving': Number(r.costPerServing) || 0,
    'Ingredients': (r.ingredients || []).length,
  }));
}
function recipeIngredientRows(recipes = []) {
  const out = [];
  (recipes || []).forEach(r => {
    (r.ingredients || []).forEach(ing => {
      out.push({
        'Recipe': r.name || '',
        'Ingredient': ing.name || '',
        'Quantity': Number(ing.quantity) || 0,
        'Unit': ing.unit || '',
        'Cost / Unit': Number(ing.costPerUnit) || 0,
        'Line Cost': Number(ing.lineCost) || 0,
        'Costed': ing.matched ? 'Yes' : 'No cost',
      });
    });
  });
  return out;
}

export function exportRecipeCostCSV(recipes, restaurantName = 'recipes') {
  const rows = recipeIngredientRows(recipes);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `${slug(restaurantName)}-recipe-costs-${today()}.csv`);
}

export async function exportRecipeCostExcel(recipes, restaurantName = 'recipes') {
  const summary = recipeSummaryRows(recipes);
  const detail = recipeIngredientRows(recipes);
  if (summary.length === 0) return;
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const wsS = XLSX.utils.json_to_sheet(summary);
  wsS['!cols'] = Object.keys(summary[0]).map(k => ({ wch: Math.max(k.length + 2, 12) }));
  XLSX.utils.book_append_sheet(wb, wsS, 'Recipe Summary');
  if (detail.length) {
    const wsD = XLSX.utils.json_to_sheet(detail);
    wsD['!cols'] = Object.keys(detail[0]).map(k => ({ wch: Math.max(k.length + 2, 12) }));
    XLSX.utils.book_append_sheet(wb, wsD, 'Ingredients');
  }
  XLSX.writeFile(wb, `${slug(restaurantName)}-recipe-costs-${today()}.xlsx`);
}
