'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSave, FaTimes, FaUndo, FaSquare, FaCircle, FaChair, FaUsers } from 'react-icons/fa';

// Drag-and-drop floor plan. Presentational + self-contained: clicking a table
// in VIEW mode fires onTableClick (host wires it to the same take-order flow),
// so this never touches order/billing logic. EDIT mode lets an owner drag /
// resize / rotate / reshape tables and persist positions via onSaveLayout.
// Falls back to an auto-grid when a floor has no saved layout.
const SNAP = 10;
const DEFAULT_W = 92;
const DEFAULT_H = 92;

const clampNum = (v, d) => (v == null || isNaN(Number(v)) ? d : Number(v));

export default function TableFloorPlan({
  floor,
  editable = false,
  statusInfo,           // (status) => { color, bg, text, border, label }
  formatCurrency,
  onTableClick,
  onSaveLayout,         // async (floorId, tablesLayout[]) => void
}) {
  const [mode, setMode] = useState('view');           // 'view' | 'edit'
  const [positions, setPositions] = useState({});     // { id: { posX, posY, width, height, rotation, shape } }
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const tables = floor?.tables || [];

  // Seed positions from saved layout, or auto-arrange in a grid when absent.
  const seed = useCallback(() => {
    const init = {};
    let auto = 0;
    tables.forEach(t => {
      if (t.posX != null && t.posY != null) {
        init[t.id] = {
          posX: clampNum(t.posX, 0), posY: clampNum(t.posY, 0),
          width: clampNum(t.width, DEFAULT_W), height: clampNum(t.height, DEFAULT_H),
          rotation: clampNum(t.rotation, 0), shape: t.shape || 'rect',
        };
      } else {
        const col = auto % 6, row = Math.floor(auto / 6);
        init[t.id] = { posX: 16 + col * 108, posY: 16 + row * 108, width: DEFAULT_W, height: DEFAULT_H, rotation: 0, shape: 'rect' };
        auto++;
      }
    });
    return init;
  }, [tables]);

  useEffect(() => { setPositions(seed()); setDirty(false); }, [floor?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep newly-added tables positioned even if the layout was already seeded.
  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev };
      let changed = false;
      let auto = Object.keys(prev).length;
      tables.forEach(t => {
        if (!next[t.id]) {
          if (t.posX != null && t.posY != null) {
            next[t.id] = { posX: clampNum(t.posX, 0), posY: clampNum(t.posY, 0), width: clampNum(t.width, DEFAULT_W), height: clampNum(t.height, DEFAULT_H), rotation: clampNum(t.rotation, 0), shape: t.shape || 'rect' };
          } else {
            const col = auto % 6, row = Math.floor(auto / 6);
            next[t.id] = { posX: 16 + col * 108, posY: 16 + row * 108, width: DEFAULT_W, height: DEFAULT_H, rotation: 0, shape: 'rect' };
            auto++;
          }
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [tables]);

  // ── Pointer drag (move / resize) ──────────────────────
  const onPointerDown = (e, id, kind) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    setSelectedId(id);
    const p = positions[id];
    if (!p) return;
    dragRef.current = {
      id, kind,
      startX: e.clientX, startY: e.clientY,
      origX: p.posX, origY: p.posY, origW: p.width, origH: p.height,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setPositions(prev => {
      const p = prev[d.id];
      if (!p) return prev;
      let np = { ...p };
      if (d.kind === 'move') {
        np.posX = Math.max(0, Math.round((d.origX + dx) / SNAP) * SNAP);
        np.posY = Math.max(0, Math.round((d.origY + dy) / SNAP) * SNAP);
      } else if (d.kind === 'resize') {
        np.width = Math.max(48, Math.round((d.origW + dx) / SNAP) * SNAP);
        np.height = Math.max(48, Math.round((d.origH + dy) / SNAP) * SNAP);
      }
      return { ...prev, [d.id]: np };
    });
    setDirty(true);
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  useEffect(() => () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove, onPointerUp]);

  const updateSel = (patch) => {
    if (!selectedId) return;
    setPositions(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], ...patch } }));
    setDirty(true);
  };

  const save = async () => {
    if (!onSaveLayout) return;
    setSaving(true);
    try {
      const layout = tables.map(t => ({ id: t.id, ...positions[t.id] }));
      await onSaveLayout(floor.id, layout);
      setDirty(false);
      setMode('view');
      setSelectedId(null);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => { setPositions(seed()); setDirty(false); setMode('view'); setSelectedId(null); };

  // Canvas extent so it grows to fit the furthest table.
  const extentW = Math.max(600, ...Object.values(positions).map(p => (p?.posX || 0) + (p?.width || 0) + 40));
  const extentH = Math.max(420, ...Object.values(positions).map(p => (p?.posY || 0) + (p?.height || 0) + 40));

  const shapeRadius = (shape) => shape === 'round' ? '50%' : '10px';
  const sel = selectedId ? positions[selectedId] : null;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          {mode === 'edit' ? 'Drag tables to arrange · drag the corner to resize' : `${tables.length} tables`}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {mode === 'view' && editable && (
            <button onClick={() => setMode('edit')} style={btn('#0ea5e9')}>Edit Layout</button>
          )}
          {mode === 'edit' && (
            <>
              <button onClick={cancel} disabled={saving} style={btn('#64748b', true)}><FaUndo size={11} /> Cancel</button>
              <button onClick={save} disabled={saving || !dirty} style={{ ...btn('#10b981'), opacity: saving || !dirty ? 0.5 : 1 }}><FaSave size={11} /> {saving ? 'Saving…' : 'Save Layout'}</button>
            </>
          )}
        </div>
      </div>

      {/* Selected-table controls (edit mode) */}
      {mode === 'edit' && sel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>{tables.find(t => t.id === selectedId)?.name}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Shape:</span>
          {[{ k: 'rect', I: FaSquare }, { k: 'square', I: FaSquare }, { k: 'round', I: FaCircle }].map(({ k, I }, i) => (
            <button key={k + i} onClick={() => updateSel({ shape: k, ...(k === 'square' ? { height: sel.width } : {}) })} title={k}
              style={{ width: '28px', height: '28px', borderRadius: '7px', border: sel.shape === k ? '2px solid #0ea5e9' : '1px solid #cbd5e1', background: 'white', cursor: 'pointer', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I size={k === 'rect' ? 13 : 12} style={k === 'rect' ? { transform: 'scaleX(1.4)' } : {}} />
            </button>
          ))}
          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>Rotate:</span>
          <button onClick={() => updateSel({ rotation: ((sel.rotation || 0) - 15 + 360) % 360 })} style={miniBtn}>⟲</button>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0c4a6e', minWidth: '32px', textAlign: 'center' }}>{sel.rotation || 0}°</span>
          <button onClick={() => updateSel({ rotation: ((sel.rotation || 0) + 15) % 360 })} style={miniBtn}>⟳</button>
        </div>
      )}

      {/* Canvas */}
      <div ref={canvasRef} onPointerDown={() => mode === 'edit' && setSelectedId(null)}
        style={{
          position: 'relative', width: '100%', minHeight: `${Math.min(extentH, 900)}px`, height: `${Math.min(extentH, 900)}px`,
          overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px',
          background: mode === 'edit'
            ? 'repeating-linear-gradient(0deg,#f8fafc,#f8fafc 19px,#eef2f7 20px), repeating-linear-gradient(90deg,#f8fafc,#f8fafc 19px,#eef2f7 20px)'
            : '#f8fafc',
        }}>
        <div style={{ position: 'relative', width: `${extentW}px`, height: `${extentH}px` }}>
          {tables.map(t => {
            const p = positions[t.id];
            if (!p) return null;
            const info = statusInfo ? statusInfo(t.status) : { color: '#10b981', bg: '#f0fdf4', border: '#10b981', text: '#166534' };
            const isSel = selectedId === t.id;
            const bill = t.currentOrderTotal;
            return (
              <div key={t.id}
                onPointerDown={(e) => onPointerDown(e, t.id, 'move')}
                onClick={(e) => { e.stopPropagation(); if (mode === 'view') { onTableClick?.(t); } else { setSelectedId(t.id); } }}
                style={{
                  position: 'absolute', left: `${p.posX}px`, top: `${p.posY}px`,
                  width: `${p.width}px`, height: `${p.height}px`,
                  transform: `rotate(${p.rotation || 0}deg)`,
                  background: info.bg, border: `2px solid ${isSel ? '#0ea5e9' : info.border}`,
                  borderRadius: shapeRadius(p.shape),
                  boxShadow: isSel ? '0 0 0 3px rgba(14,165,233,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
                  cursor: mode === 'edit' ? 'grab' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '4px', textAlign: 'center', userSelect: 'none', touchAction: 'none',
                  transition: dragRef.current ? 'none' : 'box-shadow 0.15s',
                }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: info.text, lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: '9px', color: info.text, opacity: 0.75, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <FaChair size={7} /> {t.capacity || '-'}
                  {t.currentOrderCovers > 0 && <><FaUsers size={7} style={{ marginLeft: '2px' }} /> {t.currentOrderCovers}</>}
                </div>
                {mode === 'view' && bill != null && bill > 0 && (
                  <div style={{ fontSize: '10px', fontWeight: 700, color: info.text, marginTop: '1px' }}>{formatCurrency ? formatCurrency(bill) : bill}</div>
                )}
                {/* Resize handle (edit + selected) */}
                {mode === 'edit' && isSel && (
                  <div onPointerDown={(e) => onPointerDown(e, t.id, 'resize')}
                    style={{ position: 'absolute', right: '-6px', bottom: '-6px', width: '16px', height: '16px', borderRadius: '4px', background: '#0ea5e9', border: '2px solid white', cursor: 'nwse-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const btn = (color, outline = false) => ({
  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '9px',
  border: outline ? `1px solid ${color}55` : 'none', background: outline ? 'white' : color,
  color: outline ? color : 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
});
const miniBtn = { width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' };
