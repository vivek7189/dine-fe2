'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaDatabase, FaTrash, FaSync, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaClipboardList, FaShoppingCart, FaServer, FaToggleOn, FaToggleOff, FaPowerOff } from 'react-icons/fa';
import { getOfflineEngineEnabled, setOfflineEngineEnabled } from '../hooks/useSyncEngine';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(ts) {
  if (!ts) return 'N/A';
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function OfflineDataTab() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [clearing, setClearing] = useState(null); // 'all' | 'orders' | 'cache' | 'logs' | 'sw' | 'localStorage'
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [offlineEnabled, setOfflineEnabled] = useState(() => getOfflineEngineEnabled());

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { getDb } = await import('../lib/offlineDb');
      const db = await getDb();

      // Get offline orders
      const allOrders = await db.getAll('offline_orders');
      const pendingOrders = allOrders.filter(o => o.syncStatus === 'pending');
      const failedOrders = allOrders.filter(o => o.syncStatus === 'failed');
      const syncedOrders = allOrders.filter(o => o.syncStatus === 'synced');
      const syncingOrders = allOrders.filter(o => o.syncStatus === 'syncing');

      // Get cached API data
      const cachedItems = await db.getAll('cached_api');

      // Get sync logs
      const syncLogs = await db.getAll('sync_log');

      // Estimate IndexedDB size
      let estimatedSize = 0;
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          estimatedSize = estimate.usage || 0;
        }
      } catch { /* storage estimate not available */ }

      // Count localStorage items
      let localStorageCount = 0;
      let localStorageSize = 0;
      let cacheKeys = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('dashboard_cache_') ||
            key.startsWith('tables_cache_') ||
            key.startsWith('orderhistory_cache_') ||
            key.startsWith('customers_cache_') ||
            key.startsWith('menu_cache_') ||
            key.startsWith('analytics_cache_') ||
            key.startsWith('kot_cache_') ||
            key.startsWith('automation_cache_')
          )) {
            localStorageCount++;
            const val = localStorage.getItem(key);
            localStorageSize += (key.length + (val ? val.length : 0)) * 2; // UTF-16
            cacheKeys.push(key);
          }
        }
      } catch { /* localStorage not available */ }

      // Service worker caches
      let swCacheCount = 0;
      let swCacheNames = [];
      try {
        if ('caches' in window) {
          const cacheNamesList = await caches.keys();
          swCacheNames = cacheNamesList;
          for (const name of cacheNamesList) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            swCacheCount += keys.length;
          }
        }
      } catch { /* caches not available */ }

      setStats({
        orders: {
          total: allOrders.length,
          pending: pendingOrders.length,
          failed: failedOrders.length,
          synced: syncedOrders.length,
          syncing: syncingOrders.length,
          oldest: allOrders.length > 0 ? Math.min(...allOrders.map(o => o.createdAt)) : null,
        },
        cache: {
          items: cachedItems.length,
          keys: cachedItems.map(c => c.cacheKey),
        },
        syncLogs: {
          count: syncLogs.length,
        },
        storage: {
          estimatedSize,
        },
        localStorage: {
          count: localStorageCount,
          size: localStorageSize,
          keys: cacheKeys,
        },
        swCache: {
          count: swCacheCount,
          names: swCacheNames,
        },
      });
    } catch (err) {
      console.error('Failed to load offline stats:', err);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleClearAll = async () => {
    setClearing('all');
    try {
      // 1. Clear IndexedDB
      const { getDb } = await import('../lib/offlineDb');
      const db = await getDb();
      await db.clear('offline_orders');
      await db.clear('cached_api');
      await db.clear('sync_log');

      // 2. Clear localStorage caches
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('dashboard_cache_') ||
          key.startsWith('tables_cache_') ||
          key.startsWith('orderhistory_cache_') ||
          key.startsWith('customers_cache_') ||
          key.startsWith('menu_cache_') ||
          key.startsWith('analytics_cache_') ||
          key.startsWith('kot_cache_') ||
          key.startsWith('automation_cache_')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // 3. Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      showToast('All offline data cleared successfully');
      await loadStats();
    } catch (err) {
      console.error('Failed to clear all data:', err);
      showToast('Failed to clear data: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const handleClearOrders = async () => {
    setClearing('orders');
    try {
      const { getDb } = await import('../lib/offlineDb');
      const db = await getDb();
      await db.clear('offline_orders');
      showToast('Offline orders cleared');
      await loadStats();
    } catch (err) {
      showToast('Failed to clear orders: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const handleClearCache = async () => {
    setClearing('cache');
    try {
      const { getDb } = await import('../lib/offlineDb');
      const db = await getDb();
      await db.clear('cached_api');
      showToast('API cache cleared');
      await loadStats();
    } catch (err) {
      showToast('Failed to clear cache: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const handleClearLogs = async () => {
    setClearing('logs');
    try {
      const { getDb } = await import('../lib/offlineDb');
      const db = await getDb();
      await db.clear('sync_log');
      showToast('Sync logs cleared');
      await loadStats();
    } catch (err) {
      showToast('Failed to clear logs: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const handleClearSWCache = async () => {
    setClearing('sw');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      showToast('Service worker caches cleared');
      await loadStats();
    } catch (err) {
      showToast('Failed to clear SW caches: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const handleClearLocalStorage = async () => {
    setClearing('localStorage');
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('dashboard_cache_') ||
          key.startsWith('tables_cache_') ||
          key.startsWith('orderhistory_cache_') ||
          key.startsWith('customers_cache_') ||
          key.startsWith('menu_cache_') ||
          key.startsWith('analytics_cache_') ||
          key.startsWith('kot_cache_') ||
          key.startsWith('automation_cache_')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      showToast(`Cleared ${keysToRemove.length} localStorage cache entries`);
      await loadStats();
    } catch (err) {
      showToast('Failed to clear localStorage: ' + err.message, 'error');
    } finally {
      setClearing(null);
      setConfirmAction(null);
    }
  };

  const actionMap = {
    all: { fn: handleClearAll, label: 'Clear ALL Offline Data', desc: 'This will delete all offline orders (including pending/failed), cached API data, sync logs, service worker caches, and localStorage caches. This cannot be undone.' },
    orders: { fn: handleClearOrders, label: 'Clear Offline Orders', desc: 'This will delete all offline orders including pending, failed, and synced orders from IndexedDB. Unsynced orders will be lost.' },
    cache: { fn: handleClearCache, label: 'Clear API Cache', desc: 'This will clear cached menu, categories, tables, and tax data from IndexedDB. Data will be re-fetched from server on next load.' },
    logs: { fn: handleClearLogs, label: 'Clear Sync Logs', desc: 'This will clear all sync debug logs. No data will be lost.' },
    sw: { fn: handleClearSWCache, label: 'Clear Service Worker Caches', desc: 'This will clear all browser service worker caches (API responses, static assets). Pages may load slower on next visit.' },
    localStorage: { fn: handleClearLocalStorage, label: 'Clear Dashboard Cache', desc: 'This will clear all dashboard/page data caches from localStorage. Pages will fetch fresh data on next visit.' },
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px',
    marginBottom: '16px',
  };

  const statBoxStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  };

  const btnStyle = (color = '#ef4444') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: color,
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    opacity: clearing ? 0.6 : 1,
  });

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '8px',
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          fontSize: '14px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={() => !clearing && setConfirmAction(null)}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            maxWidth: '420px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <FaExclamationTriangle size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Confirm Action</h3>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px' }}>
              {actionMap[confirmAction]?.desc}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={!!clearing}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => actionMap[confirmAction]?.fn()}
                disabled={!!clearing}
                style={btnStyle()}
              >
                {clearing ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash size={12} />}
                {clearing ? 'Clearing...' : actionMap[confirmAction]?.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111' }}>Offline Data Management</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Manage IndexedDB, service worker caches, and localStorage data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadStats} disabled={loadingStats} style={btnStyle('#6b7280')}>
            {loadingStats ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaSync size={12} />}
            Refresh
          </button>
          <button onClick={() => setConfirmAction('all')} disabled={!!clearing} style={btnStyle()}>
            <FaTrash size={12} /> Clear All
          </button>
        </div>
      </div>

      {/* Offline Engine Toggle */}
      <div style={{
        ...cardStyle,
        border: offlineEnabled ? '1px solid #bbf7d0' : '1px solid #fecaca',
        background: offlineEnabled ? '#f0fdf4' : '#fef2f2',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: offlineEnabled ? '#dcfce7' : '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: offlineEnabled ? '#16a34a' : '#dc2626',
            }}>
              <FaPowerOff size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111' }}>
                Offline Order Engine
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                {offlineEnabled
                  ? 'Orders will be saved locally when internet is unavailable and synced when back online.'
                  : 'Offline ordering is disabled. Orders will fail if there is no internet connection.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !offlineEnabled;
              setOfflineEnabled(next);
              setOfflineEngineEnabled(next);
              showToast(next ? 'Offline engine enabled' : 'Offline engine disabled');
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: offlineEnabled ? '#dc2626' : '#16a34a',
              color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              minWidth: '140px', justifyContent: 'center',
            }}
          >
            {offlineEnabled ? <><FaToggleOff size={16} /> Disable</> : <><FaToggleOn size={16} /> Enable</>}
          </button>
        </div>
      </div>

      {loadingStats ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading offline data stats...</p>
        </div>
      ) : !stats ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af' }}>
          <FaDatabase size={24} />
          <p style={{ marginTop: '8px' }}>Could not load IndexedDB data. Your browser may not support it.</p>
        </div>
      ) : (
        <>
          {/* Storage Overview */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FaDatabase style={{ color: '#6366f1' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Storage Overview</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ ...statBoxStyle, background: '#f0f9ff', color: '#0369a1' }}>
                IndexedDB: {formatBytes(stats.storage.estimatedSize)}
              </div>
              <div style={{ ...statBoxStyle, background: '#faf5ff', color: '#7c3aed' }}>
                localStorage Cache: {formatBytes(stats.localStorage.size)}
              </div>
              <div style={{ ...statBoxStyle, background: '#f0fdf4', color: '#15803d' }}>
                SW Cache Entries: {stats.swCache.count}
              </div>
            </div>
          </div>

          {/* Offline Orders */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShoppingCart style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Offline Orders</h3>
                <span style={{ ...statBoxStyle, background: '#fef3c7', color: '#92400e', fontSize: '12px' }}>
                  {stats.orders.total} total
                </span>
              </div>
              <button onClick={() => setConfirmAction('orders')} disabled={!!clearing || stats.orders.total === 0} style={{ ...btnStyle('#f59e0b'), opacity: stats.orders.total === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear Orders
              </button>
            </div>
            {stats.orders.total > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {stats.orders.pending > 0 && (
                  <div style={{ ...statBoxStyle, background: '#fff7ed', color: '#c2410c' }}>
                    <FaExclamationTriangle size={11} /> {stats.orders.pending} pending sync
                  </div>
                )}
                {stats.orders.failed > 0 && (
                  <div style={{ ...statBoxStyle, background: '#fef2f2', color: '#dc2626' }}>
                    <FaExclamationTriangle size={11} /> {stats.orders.failed} failed
                  </div>
                )}
                {stats.orders.syncing > 0 && (
                  <div style={{ ...statBoxStyle, background: '#eff6ff', color: '#2563eb' }}>
                    <FaSync size={11} /> {stats.orders.syncing} syncing
                  </div>
                )}
                {stats.orders.synced > 0 && (
                  <div style={{ ...statBoxStyle, background: '#f0fdf4', color: '#15803d' }}>
                    <FaCheckCircle size={11} /> {stats.orders.synced} synced
                  </div>
                )}
                {stats.orders.oldest && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', width: '100%' }}>
                    Oldest entry: {formatTime(stats.orders.oldest)}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>No offline orders stored</p>
            )}
            {stats.orders.pending > 0 && (
              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fff7ed', borderRadius: '8px', fontSize: '13px', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaExclamationTriangle size={12} />
                You have {stats.orders.pending} order(s) waiting to sync. Clearing will permanently delete them.
              </div>
            )}
          </div>

          {/* Cached API Data (IndexedDB) */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaServer style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>IndexedDB API Cache</h3>
                <span style={{ ...statBoxStyle, background: '#eef2ff', color: '#4338ca', fontSize: '12px' }}>
                  {stats.cache.items} items
                </span>
              </div>
              <button onClick={() => setConfirmAction('cache')} disabled={!!clearing || stats.cache.items === 0} style={{ ...btnStyle('#6366f1'), opacity: stats.cache.items === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear Cache
              </button>
            </div>
            {stats.cache.items > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {stats.cache.keys.map(key => (
                  <span key={key} style={{ padding: '3px 10px', borderRadius: '6px', background: '#f3f4f6', color: '#374151', fontSize: '12px', fontFamily: 'monospace' }}>
                    {key}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>No cached API data</p>
            )}
          </div>

          {/* Dashboard Cache (localStorage) */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaDatabase style={{ color: '#059669' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Dashboard Cache (localStorage)</h3>
                <span style={{ ...statBoxStyle, background: '#ecfdf5', color: '#065f46', fontSize: '12px' }}>
                  {stats.localStorage.count} entries ({formatBytes(stats.localStorage.size)})
                </span>
              </div>
              <button onClick={() => setConfirmAction('localStorage')} disabled={!!clearing || stats.localStorage.count === 0} style={{ ...btnStyle('#059669'), opacity: stats.localStorage.count === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear
              </button>
            </div>
            {stats.localStorage.count > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {stats.localStorage.keys.map(key => (
                  <span key={key} style={{ padding: '3px 10px', borderRadius: '6px', background: '#f3f4f6', color: '#374151', fontSize: '12px', fontFamily: 'monospace' }}>
                    {key}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>No dashboard cache entries</p>
            )}
          </div>

          {/* Service Worker Caches */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSync style={{ color: '#0891b2' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Service Worker Caches</h3>
                <span style={{ ...statBoxStyle, background: '#ecfeff', color: '#0e7490', fontSize: '12px' }}>
                  {stats.swCache.count} entries
                </span>
              </div>
              <button onClick={() => setConfirmAction('sw')} disabled={!!clearing || stats.swCache.count === 0} style={{ ...btnStyle('#0891b2'), opacity: stats.swCache.count === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear
              </button>
            </div>
            {stats.swCache.names.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {stats.swCache.names.map(name => (
                  <span key={name} style={{ padding: '3px 10px', borderRadius: '6px', background: '#f3f4f6', color: '#374151', fontSize: '12px', fontFamily: 'monospace' }}>
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>No service worker caches</p>
            )}
          </div>

          {/* Sync Logs */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClipboardList style={{ color: '#8b5cf6' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Sync Logs</h3>
                <span style={{ ...statBoxStyle, background: '#f5f3ff', color: '#6d28d9', fontSize: '12px' }}>
                  {stats.syncLogs.count} entries
                </span>
              </div>
              <button onClick={() => setConfirmAction('logs')} disabled={!!clearing || stats.syncLogs.count === 0} style={{ ...btnStyle('#8b5cf6'), opacity: stats.syncLogs.count === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear Logs
              </button>
            </div>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
              Debug logs from offline order sync operations
            </p>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
