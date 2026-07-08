'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { FaBarcode, FaPrint, FaSearch, FaPlus, FaTags, FaDownload, FaUpload, FaInfoCircle, FaChevronDown, FaChevronUp, FaCheckSquare, FaBoxOpen, FaQrcode } from 'react-icons/fa';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import { t } from '../../../../lib/i18n';
import apiClient from '../../../../lib/api';

const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'Code-128', desc: 'Flexible, any character' },
  { value: 'EAN13', label: 'EAN-13', desc: '13-digit product code' },
  { value: 'EAN8', label: 'EAN-8', desc: '8-digit small products' },
  { value: 'UPCA', label: 'UPC-A', desc: '12-digit US/Canada' },
  { value: 'CODE39', label: 'Code-39', desc: 'Alphanumeric, industrial' },
  { value: 'ITF14', label: 'ITF-14', desc: '14-digit carton/case' },
  { value: 'QR', label: 'QR Code', desc: '2D, holds URL/batch info' },
];

const LABEL_TYPES = [
  { value: 'shelf', label: 'Shelf Label' },
  { value: 'price', label: 'Price Tag' },
  { value: 'barcode', label: 'Barcode Only' },
];

const LABEL_SIZES = [
  { value: 'small', label: 'Small (38x25mm)', width: 144, height: 94 },
  { value: 'medium', label: 'Medium (50x30mm)', width: 189, height: 113 },
  { value: 'large', label: 'Large (100x50mm)', width: 378, height: 189 },
];

function generateBarcodeNumber(format) {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 9000 + 1000).toString();

  if (format === 'EAN13') {
    const base = ('200' + timestamp + random).slice(0, 12);
    const checkDigit = calculateEANCheckDigit(base);
    return base + checkDigit;
  }
  if (format === 'EAN8') {
    const base = ('20' + timestamp + random).slice(0, 7);
    const checkDigit = calculateEAN8CheckDigit(base);
    return base + checkDigit;
  }
  if (format === 'UPCA') {
    const base = ('0' + timestamp + random).slice(0, 11);
    const checkDigit = calculateUPCCheckDigit(base);
    return base + checkDigit;
  }
  if (format === 'CODE39') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      const idx = (parseInt(timestamp[i % 8]) * 7 + parseInt(random[i % 4]) * 3 + i) % chars.length;
      code += chars[idx];
    }
    return code;
  }
  if (format === 'ITF14') {
    const base = ('1' + timestamp + random + '000').slice(0, 13);
    const checkDigit = calculateEANCheckDigit(base);
    return base + checkDigit;
  }
  if (format === 'QR') {
    return 'ITEM-' + timestamp + '-' + random;
  }
  // CODE128 - alphanumeric
  return 'BC' + timestamp + random.slice(0, 4);
}

function calculateEANCheckDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const remainder = sum % 10;
  return remainder === 0 ? '0' : String(10 - remainder);
}

function calculateEAN8CheckDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const remainder = sum % 10;
  return remainder === 0 ? '0' : String(10 - remainder);
}

function calculateUPCCheckDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const remainder = sum % 10;
  return remainder === 0 ? '0' : String(10 - remainder);
}

// Detect barcode type from value and format
function detectBcid(value, format) {
  if (format === 'QR') return 'qrcode';
  if (format === 'EAN13' || (!format && /^\d{13}$/.test(value))) return 'ean13';
  if (format === 'EAN8' || (!format && /^\d{8}$/.test(value))) return 'ean8';
  if (format === 'UPCA' || (!format && /^\d{12}$/.test(value))) return 'upca';
  if (format === 'CODE39') return 'code39';
  if (format === 'ITF14' || (!format && /^\d{14}$/.test(value))) return 'itf14';
  return 'code128';
}

function BarcodeVisual({ value, width = 200, height = 50, format }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    let cancelled = false;
    setError(false);

    import('bwip-js').then((bwipjs) => {
      if (cancelled) return;
      try {
        const bcid = detectBcid(value, format);
        const opts = { bcid, text: value, scale: 2, height: bcid === 'qrcode' ? 20 : 8, includetext: bcid !== 'qrcode', textxalign: 'center', textsize: 8 };
        try {
          bwipjs.toCanvas(canvasRef.current, opts);
        } catch {
          // Fallback to code128 if detected format fails (e.g. invalid check digit)
          bwipjs.toCanvas(canvasRef.current, { ...opts, bcid: 'code128', height: 8, includetext: true });
        }
      } catch {
        setError(true);
      }
    }).catch(() => setError(true));

    return () => { cancelled = true; };
  }, [value, format]);

  if (!value) return null;

  if (error) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151', letterSpacing: 2, textAlign: 'center' }}>
          {value}
        </div>
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ maxWidth: width, maxHeight: height }} />;
}

function LabelPreview({ item, labelType, labelSize, formatCurrency }) {
  const sizeConfig = LABEL_SIZES.find(s => s.value === labelSize) || LABEL_SIZES[1];
  const barcode = item.barcode || '';

  return (
    <div style={{
      width: sizeConfig.width, minHeight: sizeConfig.height,
      border: '1px dashed #9ca3af', borderRadius: 4,
      padding: 8, background: '#fff',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      gap: 2, overflow: 'hidden',
    }}>
      {labelType === 'shelf' && (
        <>
          <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.category || 'General'}
          </div>
          <div style={{
            fontSize: sizeConfig.value === 'small' ? 11 : 13, fontWeight: 700,
            color: '#111827', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}>
            {item.name}
          </div>
          <div style={{ fontSize: sizeConfig.value === 'small' ? 13 : 16, fontWeight: 700, color: '#1e293b' }}>
            {formatCurrency(item.price || 0)}
          </div>
          <BarcodeVisual value={barcode} width={sizeConfig.width - 24} height={sizeConfig.value === 'small' ? 24 : 32} />
        </>
      )}
      {labelType === 'price' && (
        <>
          <div style={{
            fontSize: sizeConfig.value === 'small' ? 11 : 13, fontWeight: 700,
            color: '#111827', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}>
            {item.name}
          </div>
          <div style={{ fontSize: sizeConfig.value === 'small' ? 13 : 16, fontWeight: 700, color: '#1e293b' }}>
            {formatCurrency(item.price || 0)}
          </div>
          <BarcodeVisual value={barcode} width={sizeConfig.width - 24} height={sizeConfig.value === 'small' ? 24 : 32} />
        </>
      )}
      {labelType === 'barcode' && (
        <>
          <BarcodeVisual value={barcode} width={sizeConfig.width - 24} height={sizeConfig.value === 'small' ? 30 : 40} />
          <div style={{
            fontSize: 10, color: '#374151', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '100%', marginTop: 2,
          }}>
            {item.name}
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = {
  padding: '10px 12px', fontSize: 12, fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
  textAlign: 'center', whiteSpace: 'nowrap',
};

const FORMAT_GUIDE = [
  { format: 'CODE128', name: 'Code-128', digits: 'Any characters', bestFor: 'General retail, shipping', industry: 'Universal', example: 'BC20241201' },
  { format: 'EAN13', name: 'EAN-13', digits: '13 digits', bestFor: 'International retail products', industry: 'Global Retail', example: '2001234567897' },
  { format: 'EAN8', name: 'EAN-8', digits: '8 digits', bestFor: 'Small products, limited space', industry: 'Small Retail', example: '20123457' },
  { format: 'UPCA', name: 'UPC-A', digits: '12 digits', bestFor: 'US & Canada retail', industry: 'North America', example: '012345678905' },
  { format: 'CODE39', name: 'Code-39', digits: 'Alphanumeric', bestFor: 'Industrial, logistics, assets', industry: 'Logistics', example: 'PROD-A1B2' },
  { format: 'ITF14', name: 'ITF-14', digits: '14 digits', bestFor: 'Cartons, cases, outer packaging', industry: 'Wholesale', example: '10012345678902' },
  { format: 'QR', name: 'QR Code', digits: 'Text/URL (2D)', bestFor: 'Product info, URLs, batch data', industry: 'Modern Retail', example: 'ITEM-20241201' },
];

export default function BarcodeTab({ items = [], restaurantId, onUpdateItem }) {
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'with', 'without'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [editingItem, setEditingItem] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [labelType, setLabelType] = useState('shelf');
  const [labelSize, setLabelSize] = useState('medium');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [savingBarcode, setSavingBarcode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const printRef = useRef(null);
  const csvImportRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.barcode?.toLowerCase().includes(term)
      );
    }
    if (filterMode === 'with') list = list.filter(i => i.barcode);
    if (filterMode === 'without') list = list.filter(i => !i.barcode);
    return list;
  }, [items, searchTerm, filterMode]);

  const stats = useMemo(() => {
    const total = items.length;
    const withBarcode = items.filter(i => i.barcode).length;
    return { total, withBarcode, withoutBarcode: total - withBarcode };
  }, [items]);

  const toggleSelectItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i._id || i.id)));
    }
  }, [filteredItems, selectedItems]);

  const saveBarcode = useCallback(async (item, barcode, format) => {
    setSavingBarcode(true);
    try {
      await apiClient.updateMenuItem(item._id || item.id, { barcode, barcodeFormat: format }, restaurantId);
      onUpdateItem?.({ ...item, barcode, barcodeFormat: format });
    } catch (err) {
      console.error('Failed to save barcode:', err);
      alert('Failed to save barcode. Please try again.');
    } finally {
      setSavingBarcode(false);
    }
  }, [restaurantId, onUpdateItem]);

  const handleGenerateBarcode = useCallback((item) => {
    const barcode = generateBarcodeNumber(barcodeFormat);
    saveBarcode(item, barcode, barcodeFormat);
  }, [barcodeFormat, saveBarcode]);

  const handleSaveManualBarcode = useCallback(() => {
    if (!editingItem || !manualBarcode.trim()) return;
    saveBarcode(editingItem, manualBarcode.trim(), barcodeFormat);
    setEditingItem(null);
    setManualBarcode('');
  }, [editingItem, manualBarcode, barcodeFormat, saveBarcode]);

  const handleAutoGenerateForEditing = useCallback(() => {
    const barcode = generateBarcodeNumber(barcodeFormat);
    setManualBarcode(barcode);
  }, [barcodeFormat]);

  const handleBulkGenerate = useCallback(() => {
    const itemsWithout = items.filter(i => !i.barcode);
    itemsWithout.forEach(item => {
      const barcode = generateBarcodeNumber(barcodeFormat);
      saveBarcode(item, barcode, barcodeFormat);
    });
  }, [items, barcodeFormat, saveBarcode]);

  const handlePrint = useCallback(async () => {
    const selectedItemsList = items.filter(i =>
      selectedItems.has(i._id || i.id) && i.barcode
    );
    if (selectedItemsList.length === 0) return;

    const sizeConfig = LABEL_SIZES.find(s => s.value === labelSize) || LABEL_SIZES[1];

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
      const uniqueBarcodes = [...new Set(selectedItemsList.map(i => i.barcode).filter(Boolean))];
      for (const barcode of uniqueBarcodes) {
        const item = selectedItemsList.find(i => i.barcode === barcode);
        const bcid = detectBcid(barcode, item?.barcodeFormat);
        const canvas = document.createElement('canvas');
        const opts = { bcid, text: barcode, scale: 3, height: bcid === 'qrcode' ? 20 : 10, includetext: bcid !== 'qrcode', textxalign: 'center', textsize: 9 };
        try {
          try {
            bwipjs.toCanvas(canvas, opts);
          } catch {
            bwipjs.toCanvas(canvas, { ...opts, bcid: 'code128', height: 10, includetext: true });
          }
          barcodeImages[barcode] = canvas.toDataURL('image/png');
        } catch { /* fallback to text */ }
      }
    }

    function genBarcode(value) {
      if (barcodeImages[value]) {
        return `<img src="${barcodeImages[value]}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
      }
      return `<div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:#374151;text-align:center">${value || ''}</div>`;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    let labelsHtml = '';
    selectedItemsList.forEach(item => {
      const barcodeHtml = genBarcode(item.barcode);
      let labelContent = '';

      if (labelType === 'shelf') {
        labelContent = `
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">${item.category || 'General'}</div>
          <div style="font-size:12px;font-weight:700;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%">${item.name}</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b">${formatCurrency(item.price || 0)}</div>
          ${barcodeHtml}
        `;
      } else if (labelType === 'price') {
        labelContent = `
          <div style="font-size:12px;font-weight:700;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%">${item.name}</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b">${formatCurrency(item.price || 0)}</div>
          ${barcodeHtml}
        `;
      } else {
        labelContent = `
          ${barcodeHtml}
          <div style="font-size:10px;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;margin-top:4px">${item.name}</div>
        `;
      }

      labelsHtml += `
        <div class="label" style="width:${sizeConfig.width * 0.75}px;min-height:${sizeConfig.height * 0.75}px;">
          ${labelContent}
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Print Labels</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
        .label { border: 1px dashed #ccc; border-radius: 3px; padding: 6px; display: inline-flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px; margin: 4px; page-break-inside: avoid; overflow: hidden; }
        .label svg { max-width: 100%; height: auto; }
        @media print { body { margin: 0; } .label { border: none !important; margin: 0; } }
      </style>
      </head><body>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${labelsHtml}</div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    printWindow.document.close();
  }, [selectedItems, items, labelType, labelSize, formatCurrency]);

  const selectedForPrint = items.filter(i =>
    selectedItems.has(i._id || i.id) && i.barcode
  );

  const allWithBarcodes = filteredItems.filter(i => i.barcode);

  const handleSelectAllWithBarcodes = useCallback(() => {
    const ids = allWithBarcodes.map(i => i._id || i.id);
    if (ids.every(id => selectedItems.has(id))) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(ids));
    }
  }, [allWithBarcodes, selectedItems]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Item Name', 'Category', 'Barcode', 'Format', 'Price'];
    const rows = items.map(item => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || 'General').replace(/"/g, '""')}"`,
      item.barcode || '',
      item.barcodeFormat || '',
      item.price || 0,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcodes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const handleImportCSV = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      // Parse header to find column indices
      const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const nameIdx = header.findIndex(h => h.includes('name'));
      const barcodeIdx = header.findIndex(h => h.includes('barcode'));
      const formatIdx = header.findIndex(h => h.includes('format'));
      if (nameIdx === -1 || barcodeIdx === -1) return;

      let updated = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const name = cols[nameIdx];
        const barcode = cols[barcodeIdx];
        if (!name || !barcode) continue;
        const format = formatIdx >= 0 ? cols[formatIdx] : 'CODE128';
        const match = items.find(item => item.name?.toLowerCase() === name.toLowerCase());
        if (match) {
          saveBarcode(match, barcode, format || 'CODE128');
          updated++;
        }
      }
      if (updated > 0) alert(`Updated barcodes for ${updated} item(s)`);
      else alert('No matching items found. Ensure "Item Name" column matches menu item names.');
    };
    reader.readAsText(file);
  }, [items, saveBarcode]);

  return (
    <div>
      {/* Stats Row */}
      <div style={{
        display: 'flex', gap: '1px', background: '#e5e7eb', borderRadius: 10,
        overflow: 'hidden', marginBottom: 16,
      }}>
        {[
          { label: t('Total Items'), value: stats.total, icon: <FaTags size={14} color="#1e293b" /> },
          { label: t('With Barcode'), value: stats.withBarcode, icon: <FaBarcode size={14} color="#1e293b" /> },
          { label: t('Without Barcode'), value: stats.withoutBarcode, icon: <FaBarcode size={14} color={stats.withoutBarcode > 0 ? '#f59e0b' : '#1e293b'} /> },
          { label: t('Selected'), value: selectedItems.size, icon: <FaPrint size={14} color="#1e293b" /> },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: '#fff', padding: isMobile ? '10px 8px' : '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: '#111827' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 220px', maxWidth: isMobile ? '100%' : 300 }}>
          <FaSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder={t('Search items or barcodes...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #d1d5db',
              borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
            }}
            onFocus={e => e.target.style.borderColor = '#1e293b'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Filter Mode */}
        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer',
            flex: isMobile ? '1 1 45%' : '0 0 auto',
          }}
        >
          <option value="all">{t('All Items')}</option>
          <option value="with">{t('With Barcode')}</option>
          <option value="without">{t('Without Barcode')}</option>
        </select>

        {/* Barcode Format */}
        <select
          value={barcodeFormat}
          onChange={e => setBarcodeFormat(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer',
            flex: isMobile ? '1 1 45%' : '0 0 auto',
          }}
        >
          {BARCODE_FORMATS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Bulk Generate */}
        {stats.withoutBarcode > 0 && (
          <button
            onClick={handleBulkGenerate}
            disabled={savingBarcode}
            style={{
              padding: '8px 16px', background: 'linear-gradient(135deg, #1e293b, #334155)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: savingBarcode ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              flex: isMobile ? '1 1 100%' : '0 0 auto', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(30,41,59,0.3)',
              opacity: savingBarcode ? 0.7 : 1,
            }}
          >
            <FaPlus size={11} /> {t('Generate All')} ({stats.withoutBarcode})
          </button>
        )}
      </div>

      {/* Print Controls */}
      {selectedItems.size > 0 && (
        <div style={{
          background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
          padding: isMobile ? 12 : 16, marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <FaPrint size={14} color="#1e293b" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {t('Print Labels')} ({selectedForPrint.length} {t('with barcodes')})
            </span>
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center',
          }}>
            {/* Label Type */}
            <select
              value={labelType}
              onChange={e => setLabelType(e.target.value)}
              style={{
                padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 13, background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              {LABEL_TYPES.map(lt => (
                <option key={lt.value} value={lt.value}>{lt.label}</option>
              ))}
            </select>

            {/* Label Size */}
            <select
              value={labelSize}
              onChange={e => setLabelSize(e.target.value)}
              style={{
                padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 13, background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              {LABEL_SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              style={{
                padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 13, background: showPrintPreview ? '#f0fdf4' : '#fff',
                color: '#374151', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {showPrintPreview ? t('Hide Preview') : t('Show Preview')}
            </button>

            <button
              onClick={handlePrint}
              disabled={selectedForPrint.length === 0}
              style={{
                padding: '7px 16px', background: selectedForPrint.length > 0
                  ? 'linear-gradient(135deg, #1e293b, #334155)' : '#d1d5db',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: selectedForPrint.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: selectedForPrint.length > 0 ? '0 2px 8px rgba(30,41,59,0.3)' : 'none',
                marginLeft: isMobile ? 0 : 'auto',
              }}
            >
              <FaPrint size={12} /> {t('Print Selected')}
            </button>
          </div>

          {/* Print Preview */}
          {showPrintPreview && selectedForPrint.length > 0 && (
            <div ref={printRef} style={{
              background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
              padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8,
              maxHeight: 300, overflowY: 'auto',
            }}>
              {selectedForPrint.map(item => (
                <LabelPreview
                  key={item._id || item.id}
                  item={item}
                  labelType={labelType}
                  labelSize={labelSize}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barcode Assignment Inline Editor */}
      {editingItem && (
        <div style={{
          background: '#fff', borderRadius: 10, border: '2px solid #1e293b',
          padding: isMobile ? 14 : 20, marginBottom: 16,
          boxShadow: '0 4px 16px rgba(30,41,59,0.15)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaBarcode size={16} color="#1e293b" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {t('Assign Barcode')}: {editingItem.name}
              </span>
            </div>
            <button
              onClick={() => { setEditingItem(null); setManualBarcode(''); }}
              style={{
                padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6,
                background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280',
              }}
            >
              {t('Cancel')}
            </button>
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', marginBottom: 12,
          }}>
            <div style={{ flex: isMobile ? '1 1 100%' : '0 0 160px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                {t('Format')}
              </label>
              <select
                value={barcodeFormat}
                onChange={e => setBarcodeFormat(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none',
                }}
              >
                {BARCODE_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label} - {f.desc}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 200px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                {t('Barcode Value')}
              </label>
              <input
                type="text"
                placeholder={t('Enter barcode or auto-generate')}
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
                  fontFamily: 'monospace',
                }}
                onFocus={e => e.target.style.borderColor = '#1e293b'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <button
              onClick={handleAutoGenerateForEditing}
              style={{
                padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8,
                background: '#f0fdf4', color: '#1e293b', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                flex: isMobile ? '1 1 48%' : '0 0 auto',
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              }}
            >
              <FaDownload size={11} /> {t('Auto-Generate')}
            </button>

            <button
              onClick={handleSaveManualBarcode}
              disabled={!manualBarcode.trim() || savingBarcode}
              style={{
                padding: '8px 16px',
                background: manualBarcode.trim() && !savingBarcode
                  ? 'linear-gradient(135deg, #1e293b, #334155)' : '#d1d5db',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                cursor: manualBarcode.trim() && !savingBarcode ? 'pointer' : 'not-allowed',
                flex: isMobile ? '1 1 48%' : '0 0 auto',
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                boxShadow: manualBarcode.trim() && !savingBarcode ? '0 2px 8px rgba(30,41,59,0.3)' : 'none',
              }}
            >
              {savingBarcode ? t('Saving...') : t('Save Barcode')}
            </button>
          </div>

          {/* Barcode Preview */}
          {manualBarcode && (
            <div style={{
              background: '#f9fafb', borderRadius: 8, padding: 16,
              display: 'flex', justifyContent: 'center',
            }}>
              <BarcodeVisual value={manualBarcode} width={280} height={60} />
            </div>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setShowFormatGuide(!showFormatGuide)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: '#faf5f0', border: '1px solid #e8e5e0', borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: '#92400e', cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <FaInfoCircle size={12} />
          {showFormatGuide ? t('Hide') : t('Learn about')} {t('barcode formats')}
          {showFormatGuide ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
        </button>
        {showFormatGuide && (
          <div style={{
            marginTop: 8, display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 10,
          }}>
            {FORMAT_GUIDE.map(fg => (
              <div key={fg.format} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, background: '#f9fafb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {fg.format === 'QR' ? <FaQrcode size={20} color="#1e293b" /> : <FaBarcode size={18} color="#1e293b" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{fg.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{fg.bestFor}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', background: '#f3f4f6', borderRadius: 4, color: '#374151', fontWeight: 500 }}>{fg.digits}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', background: '#faf5f0', borderRadius: 4, color: '#92400e', fontWeight: 500 }}>{fg.industry}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' }}>e.g. {fg.example}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSV Import/Export Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={handleExportCSV}
          disabled={items.length === 0}
          style={{
            padding: '8px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: '#374151', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, opacity: items.length === 0 ? 0.5 : 1,
          }}
        >
          <FaDownload size={11} /> {t('Export Barcodes CSV')}
        </button>
        <button
          onClick={() => csvImportRef.current?.click()}
          style={{
            padding: '8px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FaUpload size={11} /> {t('Import Barcodes CSV')}
        </button>
        <input
          ref={csvImportRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => { handleImportCSV(e.target.files?.[0]); e.target.value = ''; }}
        />
        {allWithBarcodes.length > 0 && (
          <button
            onClick={handleSelectAllWithBarcodes}
            style={{
              padding: '8px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, marginLeft: isMobile ? 0 : 'auto',
            }}
          >
            <FaCheckSquare size={11} /> {t('Select All with Barcodes')} ({allWithBarcodes.length})
          </button>
        )}
      </div>

      {/* Items List/Table */}
      {filteredItems.length === 0 ? (
        items.length === 0 ? (
          /* No menu items at all -- onboarding */
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
            padding: isMobile ? '40px 20px' : '50px 40px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1e293b, #334155)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <FaBarcode size={28} color="#fff" />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: 20, fontWeight: 700 }}>{t('Get Started with Barcodes')}</h3>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              {t('Barcodes help you quickly identify menu items, speed up billing, and track inventory. Follow these steps to set up barcodes for your restaurant.')}
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16,
              maxWidth: 700, margin: '0 auto',
            }}>
              {[
                { step: '1', icon: <FaBoxOpen size={18} />, title: t('Add Menu Items'), desc: t('Add items to your menu first from the Menu page.') },
                { step: '2', icon: <FaBarcode size={18} />, title: t('Generate Barcodes'), desc: t('Auto-generate barcodes in any format, or manually enter existing ones.') },
                { step: '3', icon: <FaPrint size={18} />, title: t('Print Labels'), desc: t('Select items and print barcode labels in different sizes for shelves.') },
              ].map(s => (
                <div key={s.step} style={{
                  background: '#f9fafb', borderRadius: 10, padding: 20, textAlign: 'center',
                  border: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#1e293b',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px', fontSize: 14, fontWeight: 700,
                  }}>{s.step}</div>
                  <div style={{ color: '#1e293b', marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Has menu items but filtered results empty */
          <div style={{
            textAlign: 'center', padding: '50px 20px', background: '#fff',
            borderRadius: 12, border: '1px solid #e5e7eb',
          }}>
            <FaBarcode size={42} color="#d1d5db" />
            <h3 style={{ margin: '16px 0 8px', color: '#374151', fontSize: 17, fontWeight: 700 }}>{t('No items found')}</h3>
            <p style={{ color: '#6b7280', fontSize: 13 }}>
              {searchTerm || filterMode !== 'all'
                ? t('Try adjusting your search or filters.')
                : t('All items already have barcodes assigned.')}
            </p>
          </div>
        )
      ) : isMobile ? (
        /* Mobile Card List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredItems.map(item => {
            const itemId = item._id || item.id;
            const isSelected = selectedItems.has(itemId);
            const hasBarcode = !!item.barcode;

            return (
              <div key={itemId} style={{
                background: '#fff', borderRadius: 10,
                border: isSelected ? '2px solid #1e293b' : hasBarcode ? '1px solid #e5e7eb' : '1px solid #fbbf24',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(itemId)}
                    style={{ width: 16, height: 16, accentColor: '#1e293b', cursor: 'pointer', flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontSize: 11, background: '#f3f4f6', color: '#6b7280',
                        padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                      }}>
                        {item.category || 'General'}
                      </span>
                    </div>
                    {hasBarcode ? (
                      <div style={{
                        fontSize: 12, fontFamily: 'monospace', color: '#1e293b',
                        marginTop: 2, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <FaBarcode size={11} /> {item.barcode}
                        {item.barcodeFormat && (
                          <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'sans-serif' }}>
                            ({item.barcodeFormat})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2, fontWeight: 500 }}>
                        {t('No barcode assigned')}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!hasBarcode ? (
                      <button
                        onClick={() => handleGenerateBarcode(item)}
                        disabled={savingBarcode}
                        style={{
                          padding: '6px 10px', background: '#1e293b', color: '#fff',
                          border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          cursor: savingBarcode ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <FaPlus size={9} /> {t('Generate')}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingItem(item); setManualBarcode(item.barcode || ''); }}
                        style={{
                          padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6,
                          background: '#fff', cursor: 'pointer', fontSize: 11, color: '#374151', fontWeight: 500,
                        }}
                      >
                        {t('Edit')}
                      </button>
                    )}
                    {!hasBarcode && (
                      <button
                        onClick={() => { setEditingItem(item); setManualBarcode(''); }}
                        style={{
                          padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6,
                          background: '#fff', cursor: 'pointer', fontSize: 11, color: '#374151', fontWeight: 500,
                        }}
                      >
                        {t('Manual')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ ...thStyle, width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll}
                    style={{ width: 15, height: 15, accentColor: '#1e293b', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ ...thStyle, textAlign: 'left' }}>{t('Item Name')}</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>{t('Category')}</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>{t('Barcode')}</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>{t('Format')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('Price')}</th>
                <th style={{ ...thStyle, width: 180, textAlign: 'center' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const itemId = item._id || item.id;
                const isSelected = selectedItems.has(itemId);
                const hasBarcode = !!item.barcode;

                return (
                  <tr key={itemId} style={{
                    borderBottom: idx < filteredItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: !hasBarcode ? '#fffbeb' : isSelected ? '#f0fdf4' : '#fff',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { if (hasBarcode && !isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = !hasBarcode ? '#fffbeb' : isSelected ? '#f0fdf4' : '#fff'; }}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(itemId)}
                        style={{ width: 15, height: 15, accentColor: '#1e293b', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: 12, background: '#f3f4f6', color: '#6b7280',
                        padding: '2px 8px', borderRadius: 4,
                      }}>
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {hasBarcode ? (
                        <span style={{
                          fontFamily: 'monospace', fontSize: 13, color: '#1e293b',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <FaBarcode size={13} color="#1e293b" />
                          {item.barcode}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>
                          {t('Not assigned')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {item.barcodeFormat ? (
                        <span style={{
                          fontSize: 11, background: '#f1f5f9', color: '#1e293b',
                          padding: '2px 8px', borderRadius: 4, fontWeight: 500,
                        }}>
                          {item.barcodeFormat}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#374151' }}>
                      {formatCurrency(item.price || 0)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {!hasBarcode ? (
                          <>
                            <button
                              onClick={() => handleGenerateBarcode(item)}
                              disabled={savingBarcode}
                              style={{
                                padding: '5px 12px', background: '#1e293b', color: '#fff',
                                border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                cursor: savingBarcode ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <FaPlus size={9} /> {t('Generate')}
                            </button>
                            <button
                              onClick={() => { setEditingItem(item); setManualBarcode(''); }}
                              style={{
                                padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 6,
                                background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500,
                              }}
                            >
                              {t('Manual')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingItem(item); setManualBarcode(item.barcode || ''); }}
                              style={{
                                padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 6,
                                background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500,
                              }}
                            >
                              {t('Edit')}
                            </button>
                            <button
                              onClick={() => handleGenerateBarcode(item)}
                              disabled={savingBarcode}
                              style={{
                                padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 6,
                                background: '#fff', cursor: savingBarcode ? 'not-allowed' : 'pointer',
                                fontSize: 12, color: '#6b7280', fontWeight: 500,
                              }}
                              title={t('Regenerate barcode')}
                            >
                              {t('Regen')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sticky bottom bar when items selected */}
      {selectedItems.size > 0 && (
        <div style={{
          position: 'sticky', bottom: 0, left: 0, right: 0,
          background: '#1e293b', borderRadius: '10px', marginTop: 16,
          padding: isMobile ? '10px 12px' : '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {selectedItems.size} {t('item')}{selectedItems.size !== 1 ? 's' : ''} {t('selected')}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              ({selectedForPrint.length} {t('with barcodes')})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSelectedItems(new Set())}
              style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('Clear')}
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <FaDownload size={10} /> {t('Export CSV')}
            </button>
            <button
              onClick={handlePrint}
              disabled={selectedForPrint.length === 0}
              style={{
                padding: '8px 18px', background: '#fff', color: '#1e293b',
                border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: selectedForPrint.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: selectedForPrint.length === 0 ? 0.5 : 1,
              }}
            >
              <FaPrint size={12} /> {t('Print Labels')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
