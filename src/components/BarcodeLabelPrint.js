'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LuX, LuPrinter, LuMinus, LuPlus, LuSearch } from 'react-icons/lu';
import { SquareCheck, Square } from 'lucide-react';

const LABEL_FORMATS = [
  { id: '2x1',       name: '2 x 1 inch',       w: '2in',    h: '1in',    pxW: 192, pxH: 96,  fontSize: 10 },
  { id: '1.5x1',     name: '1.5 x 1 inch',     w: '1.5in',  h: '1in',   pxW: 144, pxH: 96,  fontSize: 9  },
  { id: '2.25x1.25', name: '2.25 x 1.25 inch',  w: '2.25in', h: '1.25in', pxW: 216, pxH: 120, fontSize: 10 },
  { id: '1.25x0.85', name: '1.25 x 0.85 (Small)', w: '1.25in', h: '0.85in', pxW: 120, pxH: 82, fontSize: 8 },
  { id: 'shelf',     name: 'Shelf Tag',          w: '2.3in',  h: '1.25in', pxW: 220, pxH: 120, fontSize: 11 },
];

// Detect barcode type from value
function detectBcid(value) {
  if (!value) return 'code128';
  const v = value.trim();
  if (/^\d{13}$/.test(v)) return 'ean13';
  if (/^\d{8}$/.test(v)) return 'ean8';
  if (/^\d{12}$/.test(v)) return 'upca';
  if (/^\d{14}$/.test(v)) return 'itf14';
  return 'code128';
}

// Try rendering barcode to canvas with a given format, fallback to code128 if it fails
function tryRenderBarcode(bwipjs, canvas, value, bcid) {
  const opts = { bcid, text: value, scale: 3, height: 10, includetext: true, textxalign: 'center', textsize: 9 };
  try {
    bwipjs.toCanvas(canvas, opts);
    return true;
  } catch {
    if (bcid !== 'code128') {
      try {
        bwipjs.toCanvas(canvas, { ...opts, bcid: 'code128' });
        return true;
      } catch { return false; }
    }
    return false;
  }
}

// Render barcode to an off-screen canvas, return data URL for print embedding
function generateBarcodeDataURL(bwipjs, value) {
  if (!value) return null;
  const bcid = detectBcid(value);
  const canvas = document.createElement('canvas');
  if (tryRenderBarcode(bwipjs, canvas, value, bcid)) {
    return canvas.toDataURL('image/png');
  }
  return null;
}

function BarcodeCanvas({ value, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    let cancelled = false;

    import('bwip-js').then((bwipjs) => {
      if (cancelled) return;
      const bcid = detectBcid(value);
      const opts = { bcid, text: value, scale: 2, height: 8, includetext: true, textxalign: 'center', textsize: 8 };
      try {
        bwipjs.toCanvas(canvasRef.current, opts);
      } catch {
        // Fallback to code128 if detected format fails (e.g. invalid check digit)
        try {
          bwipjs.toCanvas(canvasRef.current, { ...opts, bcid: 'code128' });
        } catch {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = '#333';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(value, canvasRef.current.width / 2, canvasRef.current.height / 2);
        }
      }
    });

    return () => { cancelled = true; };
  }, [value]);

  return <canvas ref={canvasRef} style={{ maxWidth: width || 160, maxHeight: height || 50 }} />;
}

export default function BarcodeLabelPrint({ items, onClose, currencySymbol = '\u20B9', storeName = '', showMrp = true, showStoreName = false }) {
  const [selectedItems, setSelectedItems] = useState(() =>
    items.filter(p => p.barcode).reduce((acc, p) => ({ ...acc, [p.id || p._id]: 1 }), {})
  );
  const [format, setFormat] = useState('2x1');
  const [search, setSearch] = useState('');
  const [showMrpOnLabel, setShowMrpOnLabel] = useState(showMrp);
  const [showStoreOnLabel, setShowStoreOnLabel] = useState(showStoreName);
  const [showPrice, setShowPrice] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const itemsWithBarcode = useMemo(() =>
    items.filter(p => p.barcode && p.status !== 'deleted'),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return itemsWithBarcode;
    const term = search.toLowerCase();
    return itemsWithBarcode.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }, [itemsWithBarcode, search]);

  const toggleItem = useCallback((id) => {
    setSelectedItems(prev => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  }, []);

  const updateQty = useCallback((id, delta) => {
    setSelectedItems(prev => {
      const newQty = (prev[id] || 0) + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: newQty };
    });
  }, []);

  const selectAll = useCallback(() => {
    const allSelected = {};
    filteredItems.forEach(p => { allSelected[p.id || p._id] = selectedItems[p.id || p._id] || 1; });
    setSelectedItems(prev => ({ ...prev, ...allSelected }));
  }, [filteredItems, selectedItems]);

  const deselectAll = useCallback(() => {
    const filteredIds = new Set(filteredItems.map(p => p.id || p._id));
    setSelectedItems(prev => {
      const next = {};
      for (const [id, qty] of Object.entries(prev)) {
        if (!filteredIds.has(id)) next[id] = qty;
      }
      return next;
    });
  }, [filteredItems]);

  const selectedCount = Object.values(selectedItems).reduce((s, q) => s + q, 0);
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(p => !!selectedItems[p.id || p._id]);
  const fmt = LABEL_FORMATS.find(f => f.id === format) || LABEL_FORMATS[0];

  const printSingle = async (item) => {
    if (!item?.barcode) return;

    let bwipjs;
    try { bwipjs = await import('bwip-js'); } catch { bwipjs = null; }

    let barcodeHtml = `<div style="font-family:monospace;font-size:10px;text-align:center;letter-spacing:1px;">${item.barcode}</div>`;
    if (bwipjs) {
      const dataUrl = generateBarcodeDataURL(bwipjs, item.barcode);
      if (dataUrl) {
        barcodeHtml = `<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
      }
    }

    const storeNameHtml = showStoreOnLabel && storeName
      ? `<div style="font-size:${Math.max(7, fmt.fontSize - 2)}px;color:#666;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;">${storeName}</div>`
      : '';
    const priceHtml = showPrice
      ? `<div style="font-size:${fmt.fontSize + 4}px;font-weight:900;margin-bottom:1px;">${currencySymbol}${item.price}</div>`
      : '';
    const mrpHtml = showMrpOnLabel && item.mrp && item.mrp > item.price
      ? `<div style="font-size:${fmt.fontSize - 1}px;color:#888;text-decoration:line-through;">MRP: ${currencySymbol}${item.mrp}</div>`
      : '';

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Barcode Label</title>
      <style>
        @page { size: ${fmt.w} ${fmt.h}; margin: 0; }
        body { font-family: Arial, sans-serif; margin: 10px; }
        .label {
          width: ${fmt.w}; height: ${fmt.h};
          box-sizing: border-box; padding: 2mm;
          border: 1px solid #ddd;
          display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
          overflow: hidden;
        }
        @media print {
          body { margin: 0; }
          .label { border: none !important; }
        }
      </style></head><body>
      <div class="label">
        ${storeNameHtml}
        <div style="font-size:${fmt.fontSize}px;font-weight:bold;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;margin-bottom:2px;">${item.name}</div>
        ${priceHtml}
        ${mrpHtml}
        <div style="margin-top:auto;width:100%;">${barcodeHtml}</div>
      </div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  const handlePrint = async () => {
    const labelItems = [];
    for (const [id, qty] of Object.entries(selectedItems)) {
      const item = items.find(p => (p.id || p._id) === id);
      if (!item || !item.barcode) continue;
      for (let i = 0; i < qty; i++) {
        labelItems.push(item);
      }
    }
    if (labelItems.length === 0) return;

    // Import bwip-js (browser build has toCanvas, NOT toSVG)
    let bwipjs;
    try {
      bwipjs = await import('bwip-js');
    } catch {
      bwipjs = null;
    }

    // Pre-generate barcode images as data URLs using off-screen canvases
    const barcodeImages = {};
    if (bwipjs) {
      const uniqueBarcodes = [...new Set(labelItems.map(p => p.barcode))];
      for (const barcode of uniqueBarcodes) {
        const dataUrl = generateBarcodeDataURL(bwipjs, barcode);
        if (dataUrl) barcodeImages[barcode] = dataUrl;
      }
    }

    const labelsHtml = labelItems.map(p => {
      const barcodeHtml = barcodeImages[p.barcode]
        ? `<img src="${barcodeImages[p.barcode]}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`
        : `<div style="font-family:monospace;font-size:10px;text-align:center;letter-spacing:1px;">${p.barcode}</div>`;

      const storeNameHtml = showStoreOnLabel && storeName
        ? `<div style="font-size:${Math.max(7, fmt.fontSize - 2)}px;color:#666;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;">${storeName}</div>`
        : '';

      const priceHtml = showPrice
        ? `<div style="font-size:${fmt.fontSize + 4}px;font-weight:900;margin-bottom:1px;">${currencySymbol}${p.price}</div>`
        : '';

      const mrpHtml = showMrpOnLabel && p.mrp && p.mrp > p.price
        ? `<div style="font-size:${fmt.fontSize - 1}px;color:#888;text-decoration:line-through;">MRP: ${currencySymbol}${p.mrp}</div>`
        : '';

      return `
        <div class="label">
          ${storeNameHtml}
          <div style="font-size:${fmt.fontSize}px;font-weight:bold;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;margin-bottom:2px;">${p.name}</div>
          ${priceHtml}
          ${mrpHtml}
          <div style="margin-top:auto;width:100%;">${barcodeHtml}</div>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Barcode Labels</title>
      <style>
        @page { size: ${fmt.w} ${fmt.h}; margin: 0; }
        body { font-family: Arial, sans-serif; margin: 10px; }
        .labels { display: flex; flex-wrap: wrap; }
        .label {
          width: ${fmt.w}; height: ${fmt.h};
          box-sizing: border-box; padding: 2mm;
          border: 1px solid #ddd;
          display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
          margin: 4px; page-break-inside: avoid; overflow: hidden;
        }
        @media print {
          body { margin: 0; }
          .label { border: none !important; margin: 0; }
        }
      </style></head><body>
      <div class="labels">${labelsHtml}</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Print Barcode Labels</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{selectedCount} label{selectedCount !== 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}><LuX size={20} /></button>
        </div>

        {/* Format selector */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Size:</span>
          {LABEL_FORMATS.map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              style={{ padding: '5px 10px', borderRadius: '8px', border: format === f.id ? '2px solid #2563eb' : '1px solid #e5e7eb', cursor: 'pointer', fontSize: '11px', fontWeight: '600', backgroundColor: format === f.id ? '#eff6ff' : 'white', color: format === f.id ? '#2563eb' : '#6b7280' }}>
              {f.name}
            </button>
          ))}
        </div>

        {/* Label options */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Show:</span>
          {[
            { label: 'Price', value: showPrice, setter: setShowPrice },
            { label: 'MRP', value: showMrpOnLabel, setter: setShowMrpOnLabel },
            { label: 'Store Name', value: showStoreOnLabel, setter: setShowStoreOnLabel },
          ].map(opt => (
            <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', color: '#374151', userSelect: 'none' }}>
              <input type="checkbox" checked={opt.value} onChange={() => opt.setter(v => !v)}
                style={{ width: '14px', height: '14px', accentColor: '#2563eb', cursor: 'pointer' }} />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Search + Select All / Deselect All */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <LuSearch size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
            />
          </div>
          <button
            onClick={allFilteredSelected ? deselectAll : selectAll}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', fontWeight: '600', backgroundColor: allFilteredSelected ? '#fef2f2' : '#f0fdf4', color: allFilteredSelected ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            {allFilteredSelected ? <><Square size={13} /> Deselect All</> : <><SquareCheck size={13} /> Select All</>}
          </button>
        </div>

        {/* Item list -- scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {filteredItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '30px 0' }}>
              {search ? 'No matching items found.' : 'No items with barcodes. Add barcodes in the Barcode tab first.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredItems.map(p => {
                const itemId = p.id || p._id;
                const isSelected = !!selectedItems[itemId];
                const qty = selectedItems[itemId] || 0;
                return (
                  <div key={itemId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', backgroundColor: isSelected ? '#eff6ff' : '#f9fafb', border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer' }}
                    onClick={() => toggleItem(itemId)}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleItem(itemId)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{p.barcode} {p.sku ? `· ${p.sku}` : ''}</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', flexShrink: 0 }}>{currencySymbol}{p.price}</span>
                    {isSelected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateQty(itemId, -1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LuMinus size={12} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => updateQty(itemId, 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LuPlus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); printSingle(p); }} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <LuPrinter size={11} /> Print 1
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview + Print -- sticky bottom */}
        {selectedCount > 0 && (
          <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f3f4f6', flexShrink: 0, backgroundColor: 'white', borderRadius: '0 0 16px 16px' }}>
            {/* Preview of first label */}
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              {(() => {
                const firstId = Object.keys(selectedItems)[0];
                const firstItem = items.find(p => (p.id || p._id) === firstId);
                if (!firstItem?.barcode) return null;
                return (
                  <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '8px', textAlign: 'center', width: fmt.pxW + 12 }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 4px' }}>Label preview</p>
                    {showStoreOnLabel && storeName && <div style={{ fontSize: 8, color: '#888' }}>{storeName}</div>}
                    <div style={{ fontSize: fmt.fontSize, fontWeight: 'bold' }}>{firstItem.name}</div>
                    {showPrice && <div style={{ fontSize: fmt.fontSize + 4, fontWeight: 900 }}>{currencySymbol}{firstItem.price}</div>}
                    {showMrpOnLabel && firstItem.mrp && firstItem.mrp > firstItem.price && (
                      <div style={{ fontSize: fmt.fontSize - 1, color: '#888', textDecoration: 'line-through' }}>MRP: {currencySymbol}{firstItem.mrp}</div>
                    )}
                    <BarcodeCanvas value={firstItem.barcode} width={fmt.pxW - 20} height={40} />
                  </div>
                );
              })()}
            </div>
            <button onClick={handlePrint} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LuPrinter size={16} /> Print {selectedCount} Label{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
