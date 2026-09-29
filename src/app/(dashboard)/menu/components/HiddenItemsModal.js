'use client';

// Deleted / hidden menu items with a Restore button. The normal menu API only returns active
// items, so a deleted item used to be gone for good from every screen. Lists them from
// GET /api/menus/:rid/hidden and restores with PATCH { status: 'active' }.
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUndo } from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import { useCurrency } from '../../../../contexts/CurrencyContext';

const STATUS_LABEL = { deleted: 'Deleted', inactive: 'Inactive', 'no-status': 'Hidden (no status)' };

export default function HiddenItemsModal({ restaurantId, onClose, onRestored }) {
  const { formatCurrency } = useCurrency();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.getHiddenMenuItems(restaurantId);
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      setError(e?.status === 403 || /permission|denied/i.test(e?.message || '')
        ? 'You need menu edit permission to see deleted items.'
        : (e?.message || 'Could not load deleted items.'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { if (restaurantId) load(); }, [restaurantId, load]);

  const restore = async (item) => {
    setBusyId(item.id);
    setError('');
    try {
      await apiClient.restoreMenuItem(item.id, restaurantId);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      onRestored?.(item);
    } catch (e) {
      setError(e?.message || 'Could not restore the item.');
    } finally {
      setBusyId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((it) => `${it.name || ''} ${it.category || ''}`.toLowerCase().includes(q)) : items;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: '16px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Deleted items</h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>Restore puts the item back on the menu with its old price and details.</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
            <FaTimes size={14} />
          </button>
        </div>

        {items.length > 6 && (
          <div style={{ padding: '12px 20px 0' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deleted items"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {error && (
          <div style={{ margin: '12px 20px 0', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>
        )}

        <div style={{ overflowY: 'auto', padding: '8px 20px 20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '32px 0' }}>Loading…</p>
          ) : shown.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '32px 0' }}>
              {items.length === 0 ? 'No deleted items.' : 'No items match your search.'}
            </p>
          ) : shown.map((it) => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name || 'Unnamed item'}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {[it.category, it.price != null ? formatCurrency(Number(it.price) || 0) : null, STATUS_LABEL[it.status] || it.status,
                    it.deletedAt ? new Date(it.deletedAt).toLocaleDateString() : null].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button
                onClick={() => restore(it)}
                disabled={busyId === it.id}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '13px', fontWeight: 600, cursor: busyId === it.id ? 'not-allowed' : 'pointer', opacity: busyId === it.id ? 0.6 : 1, whiteSpace: 'nowrap' }}
              >
                <FaUndo size={11} /> {busyId === it.id ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
