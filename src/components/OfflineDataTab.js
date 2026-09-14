'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaDatabase, FaTrash, FaSync, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaClipboardList, FaShoppingCart, FaServer, FaToggleOn, FaToggleOff, FaPowerOff, FaRedo, FaCircle, FaClock } from 'react-icons/fa';
import { getOfflineEngineEnabled, setOfflineEngineEnabled, useSyncEngine } from '../hooks/useSyncEngine';
import apiClient from '../lib/api';
import { getApiBase, getCloudApiBase } from '../lib/apiBase';
import { getLocalServerUrl } from '../lib/localServer';
import { isTauri, isElectron } from '../utils/platform';
import { getSyncStatus, getPendingMutations, getSyncHistory, triggerSync, pauseSync, resumeSync, retryMutation, deleteMutation, clearCache, getCacheStats } from '../lib/tauriSync';
import * as electronSync from '../lib/electronSync';

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
  const [confirmDeleteKey, setConfirmDeleteKey] = useState(null);
  const [expandedFailed, setExpandedFailed] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(true);
  const [syncingKey, setSyncingKey] = useState(null);
  const [diag, setDiag] = useState(null);
  const [runningDiag, setRunningDiag] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const {
    pendingCount: syncPendingCount,
    failedOrders: syncFailedOrders,
    isOnline,
    isSyncing,
    circuitInfo,
    manualSync,
    retrySingleOrder,
    retryAllFailed,
    deleteFailedOrder,
  } = useSyncEngine(apiClient);

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

      // Get essential data
      let essentialItems = [];
      try { essentialItems = await db.getAll('essential_data'); } catch { /* store may not exist yet */ }

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

      // Compact per-order projection for the detailed list (keeps React state light).
      // Un-synced orders (pending/failed/syncing) sort first, newest-first within each group.
      const orderList = allOrders.map((o) => {
        const od = o.orderData || {};
        const action = od._offlineAction;
        const label = action === 'create_saved_cart' ? 'Saved Cart'
          : action === 'complete_billing_new' ? 'New Bill'
          : action === 'complete_billing_existing' ? 'Existing Bill' : 'Order';
        const amount = od.finalAmount ?? od.totalAmount ?? od.grandTotal ?? od.total ?? od.amount ?? null;
        return {
          idempotencyKey: o.idempotencyKey,
          syncStatus: o.syncStatus,
          createdAt: o.createdAt,
          retryCount: o.retryCount || 0,
          lastError: o.lastError || null,
          label,
          itemsCount: Array.isArray(od.items) ? od.items.length : 0,
          amount,
          orderNumber: od.orderNumber || od.dailyOrderId || null,
        };
      }).sort((a, b) => {
        const rank = (s) => (s === 'synced' ? 1 : 0);
        const r = rank(a.syncStatus) - rank(b.syncStatus);
        return r !== 0 ? r : (b.createdAt || 0) - (a.createdAt || 0);
      });

      setStats({
        orders: {
          total: allOrders.length,
          pending: pendingOrders.length,
          failed: failedOrders.length,
          synced: syncedOrders.length,
          syncing: syncingOrders.length,
          oldest: allOrders.length > 0 ? Math.min(...allOrders.map(o => o.createdAt)) : null,
          list: orderList,
        },
        cache: {
          items: cachedItems.length,
          keys: cachedItems.map(c => c.cacheKey),
        },
        essentialData: {
          count: essentialItems.length,
          keys: essentialItems.map(e => e.key),
          lastUpdated: essentialItems.length > 0 ? Math.max(...essentialItems.map(e => e.updatedAt || 0)) : null,
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

  // Sync ONE offline order now (works for pending/failed): re-queue → push → refresh.
  const handleSyncOne = useCallback(async (key) => {
    setSyncingKey(key);
    try {
      await retrySingleOrder(key);
      await manualSync();
      showToast('Order queued and synced');
    } catch (e) {
      showToast('Sync failed: ' + (e?.message || 'error'), 'error');
    } finally {
      setSyncingKey(null);
      await loadStats();
    }
  }, [retrySingleOrder, manualSync, loadStats]);

  // Delete ONE offline order from this device. The UI guards this: synced orders delete
  // freely; un-synced ones require an explicit "delete anyway" so a real order is never lost by accident.
  const handleDeleteOne = useCallback(async (key) => {
    try {
      await deleteFailedOrder(key); // generic delete-by-key (name is historical)
      showToast('Order deleted from this device');
    } catch (e) {
      showToast('Delete failed: ' + (e?.message || 'error'), 'error');
    } finally {
      setConfirmDeleteKey(null);
      await loadStats();
    }
  }, [deleteFailedOrder, loadStats]);

  // ---- Diagnostics: what backend is the app pointed at, is it reachable, and where do any
  // stale orders actually live (localStorage cache vs IndexedDB API cache)? ----
  const probe = useCallback(async (url, ms = 3500) => {
    if (!url) return false;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      const res = await fetch(`${String(url).replace(/\/+$/, '')}/api/health`, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      return res.ok;
    } catch { return false; }
  }, []);

  const countOrders = (d) => {
    try {
      if (Array.isArray(d)) return d.length;
      if (d && Array.isArray(d.orders)) return d.orders.length;
      if (d && d.data && Array.isArray(d.data.orders)) return d.data.orders.length;
      if (d && d.data && Array.isArray(d.data)) return d.data.length;
    } catch { /* ignore */ }
    return null;
  };

  const runDiagnostics = useCallback(async () => {
    setRunningDiag(true);
    try {
      const LOOPBACK = 'http://127.0.0.1:3003';
      const activeBackend = (() => { try { return getApiBase(); } catch { return null; } })();
      const cloudBackend = (() => { try { return getCloudApiBase(); } catch { return null; } })();
      let localPin = null; try { localPin = getLocalServerUrl(); } catch { /* ignore */ }
      let backendPin = null; try { backendPin = localStorage.getItem('dineopen_backend_url'); } catch { /* ignore */ }
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

      const [localAlive, activeAlive, cloudAlive] = await Promise.all([
        probe(LOOPBACK, 2500), probe(activeBackend, 4000), probe(cloudBackend, 4000),
      ]);

      // Where do cached ORDERS live? (this is usually the real source of a stale display)
      const cachedOrders = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('orderhistory_cache_') || key.startsWith('dashboard_cache_'))) {
            let n = null; try { n = countOrders(JSON.parse(localStorage.getItem(key))); } catch { /* ignore */ }
            cachedOrders.push({ where: 'localStorage', key, orders: n });
          }
        }
      } catch { /* ignore */ }
      try {
        const { getDb } = await import('../lib/offlineDb');
        const db = await getDb();
        const cachedApi = await db.getAll('cached_api');
        cachedApi.forEach((c) => {
          if (c.cacheKey && c.cacheKey.toLowerCase().includes('order')) {
            cachedOrders.push({ where: 'IndexedDB:cached_api', key: c.cacheKey, orders: countOrders(c.data) });
          }
        });
      } catch { /* ignore */ }

      let storage = null;
      try { if (navigator.storage?.estimate) { const e = await navigator.storage.estimate(); storage = { usedMB: Math.round((e.usage || 0) / 1e6), quotaMB: Math.round((e.quota || 0) / 1e6) }; } } catch { /* ignore */ }
      let dbNames = [];
      try { if (indexedDB.databases) dbNames = (await indexedDB.databases()).map(d => d.name).filter(Boolean); } catch { /* ignore */ }

      const usingLocal = !!localPin || (!!activeBackend && activeBackend.includes('127.0.0.1'));
      const staleCached = cachedOrders.some(c => (c.orders || 0) > 0);
      let verdict, severity;
      if (usingLocal && !localAlive) {
        severity = 'bad';
        verdict = 'App is pointed at the LOCAL SERVER (127.0.0.1:3003) but it is DEAD. This is the bug — click "Clean Everything & Reload" below.';
      } else if (usingLocal && localAlive) {
        severity = 'warn';
        verdict = 'App is using the LOCAL SERVER (still running on this PC). Stop/uninstall the local server app, then Clean Everything.';
      } else if (!activeAlive) {
        severity = 'warn';
        verdict = 'App is pointed at the cloud, but the backend is not reachable now (check internet / firewall / VPN).';
      } else if (staleCached) {
        severity = 'warn';
        verdict = 'App is on the cloud and reachable, but old ORDERS are cached locally (see below). Click "Clean Everything & Reload" to drop them and refetch fresh.';
      } else {
        severity = 'good';
        verdict = 'App is correctly using the cloud backend, it is reachable, and no stale cached orders were found. It should match the website.';
      }

      setDiag({
        at: new Date().toLocaleString(), online,
        activeBackend, cloudBackend, localServerPin: localPin || '(none)', backendPin: backendPin || '(none)',
        localServerAlive: localAlive, activeBackendAlive: activeAlive, cloudBackendAlive: cloudAlive,
        offlineOrders: stats?.orders?.total ?? '?',
        pendingUnsynced: (stats?.orders?.pending ?? 0) + (stats?.orders?.failed ?? 0),
        cachedOrders, storage, indexedDbs: dbNames, verdict, severity,
      });
    } finally {
      setRunningDiag(false);
    }
  }, [probe, stats]);

  const copyDiag = useCallback(() => {
    if (!diag) return;
    try { navigator.clipboard.writeText(JSON.stringify(diag, null, 2)); showToast('Diagnostics copied — paste to support'); }
    catch { showToast('Copy failed', 'error'); }
  }, [diag]);

  // ---- Clean Everything: wipe ALL local state (localStorage + IndexedDB + caches) and reload.
  // Forces the app back to the cloud. Guarded in the UI when un-synced orders exist. ----
  const handleHardReset = useCallback(async () => {
    setResetting(true);
    try {
      try { localStorage.clear(); } catch { /* ignore */ }
      try { sessionStorage.clear(); } catch { /* ignore */ }
      try {
        const dbs = indexedDB.databases ? await indexedDB.databases() : [];
        await Promise.all(dbs.map(d => d.name
          ? new Promise((res) => { const r = indexedDB.deleteDatabase(d.name); r.onsuccess = r.onerror = r.onblocked = () => res(); })
          : Promise.resolve()));
      } catch { /* ignore */ }
      try { if (window.caches) { const k = await caches.keys(); await Promise.all(k.map(n => caches.delete(n))); } } catch { /* ignore */ }
      showToast('All local data cleared — reloading…');
      setTimeout(() => { try { window.location.reload(); } catch { /* ignore */ } }, 700);
    } catch (e) {
      setResetting(false);
      showToast('Reset failed: ' + (e?.message || 'error'), 'error');
    }
  }, []);

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

  const handleClearEssential = async () => {
    setClearing('essential');
    try {
      const { clearAllEssentialData } = await import('../lib/offlineDb');
      await clearAllEssentialData();
      showToast('Essential data cleared — will re-cache on next data load');
      await loadStats();
    } catch (err) {
      showToast('Failed to clear essential data: ' + err.message, 'error');
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
    essential: { fn: handleClearEssential, label: 'Clear Essential Data', desc: 'This will clear persistent billing data (menu, floors, tax, print settings) from IndexedDB. This data is needed for offline billing after app restart. It will be re-cached automatically on next successful data load.' },
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
          {/* Diagnostics — what backend the app uses, where stale orders live, + Clean Everything reset */}
          <div style={{ ...cardStyle, border: '1px solid #c7d2fe', background: '#eef2ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaServer style={{ color: '#4f46e5' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Diagnostics</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={runDiagnostics} disabled={runningDiag} style={{ ...btnStyle('#4f46e5'), opacity: runningDiag ? 0.5 : 1 }}>
                  {runningDiag ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <FaServer size={11} />}
                  {runningDiag ? 'Checking…' : 'Run Check'}
                </button>
                {diag && (
                  <button onClick={copyDiag} style={btnStyle('#6b7280')}>
                    <FaClipboardList size={11} /> Copy Report
                  </button>
                )}
              </div>
            </div>

            {!diag && !runningDiag && (
              <p style={{ margin: 0, color: '#4338ca', fontSize: '13px' }}>
                Click <strong>Run Check</strong> to see which backend this app is using, whether it can reach the cloud, and where any old orders are cached. Then <strong>Copy Report</strong> and send it to support.
              </p>
            )}

            {diag && (
              <>
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '12px',
                  background: diag.severity === 'bad' ? '#fef2f2' : diag.severity === 'warn' ? '#fffbeb' : '#f0fdf4',
                  color: diag.severity === 'bad' ? '#991b1b' : diag.severity === 'warn' ? '#92400e' : '#166534',
                  border: `1px solid ${diag.severity === 'bad' ? '#fca5a5' : diag.severity === 'warn' ? '#fde68a' : '#bbf7d0'}`,
                }}>
                  {diag.severity === 'bad' ? '🔴 ' : diag.severity === 'warn' ? '⚠️ ' : '✅ '}{diag.verdict}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '12px' }}>
                  {[
                    ['Active backend (in use)', diag.activeBackend || '(unknown)'],
                    ['Active reachable?', diag.activeBackendAlive ? '✅ yes' : '❌ no'],
                    ['Cloud backend', diag.cloudBackend || '(unknown)'],
                    ['Cloud reachable?', diag.cloudBackendAlive ? '✅ yes' : '❌ no'],
                    ['Local-server pin', diag.localServerPin],
                    ['Local server 127.0.0.1:3003', diag.localServerAlive ? '⚠️ RUNNING' : 'not running'],
                    ['Backend pin', diag.backendPin],
                    ['Internet', diag.online ? 'online' : 'OFFLINE'],
                    ['Offline orders (queue)', String(diag.offlineOrders) + (diag.pendingUnsynced ? ` — ${diag.pendingUnsynced} unsynced!` : '')],
                    ['Storage used', diag.storage ? `${diag.storage.usedMB} / ${diag.storage.quotaMB} MB` : 'n/a'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ color: '#6b7280', marginBottom: '2px' }}>{k}</div>
                      <div style={{ color: '#111', fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Where stale orders are cached */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#4338ca', marginBottom: '6px' }}>Cached order data on this device</div>
                  {diag.cachedOrders.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>None found — no old orders cached locally.</p>
                  ) : (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {diag.cachedOrders.map((c, idx) => (
                        <div key={idx} style={{ padding: '6px 10px', background: (c.orders || 0) > 0 ? '#fffbeb' : '#fff', border: `1px solid ${(c.orders || 0) > 0 ? '#fde68a' : '#e5e7eb'}`, borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{c.where}: {c.key}</span>
                          <span style={{ fontWeight: 700, color: (c.orders || 0) > 0 ? '#b45309' : '#6b7280', whiteSpace: 'nowrap' }}>{c.orders == null ? '? orders' : `${c.orders} orders`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Clean Everything */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #c7d2fe' }}>
              {confirmReset ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600, marginBottom: '8px' }}>
                    This deletes ALL local data on this device (cached orders, caches, saved server pointer) and reloads — forcing the app back to the cloud.{' '}
                    {(stats.orders.pending + stats.orders.failed) > 0
                      ? <span>⚠️ You have {stats.orders.pending + stats.orders.failed} UN-SYNCED order(s) — Sync them first or they will be lost!</span>
                      : <span>Offline orders: 0 — nothing will be lost. You may need to log in again.</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleHardReset} disabled={resetting} style={{ ...btnStyle('#dc2626'), opacity: resetting ? 0.6 : 1 }}>
                      {resetting ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash size={11} />}
                      Yes, clean everything &amp; reload
                    </button>
                    <button onClick={() => setConfirmReset(false)} disabled={resetting} style={btnStyle('#6b7280')}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)} style={btnStyle('#dc2626')}>
                  <FaTrash size={11} /> Clean Everything &amp; Reload
                </button>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Use this if the app shows old orders that don&apos;t match the website. It clears every local cache/pointer and reloads onto the cloud.
              </p>
            </div>
          </div>

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

          {/* Offline Order Details — per-order list with individual Sync / Delete (safe, scrollable) */}
          {stats.orders.total > 0 && Array.isArray(stats.orders.list) && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => setExpandedOrders(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <FaClipboardList style={{ color: '#f59e0b' }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Order Details</h3>
                  <span style={{ ...statBoxStyle, background: '#fef3c7', color: '#92400e', fontSize: '12px' }}>
                    {stats.orders.list.length} order{stats.orders.list.length !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{expandedOrders ? '▼' : '▶'}</span>
                </button>
                {(stats.orders.pending + stats.orders.failed) > 0 && (
                  <button
                    onClick={manualSync}
                    disabled={!isOnline || isSyncing}
                    style={{ ...btnStyle('#2563eb'), opacity: (!isOnline || isSyncing) ? 0.4 : 1 }}
                  >
                    {isSyncing ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSync size={11} />}
                    Sync All Unsynced
                  </button>
                )}
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                <span style={{ color: '#c2410c', fontWeight: 700 }}>●</span> Pending / <span style={{ color: '#dc2626', fontWeight: 700 }}>●</span> Failed = <strong>not on server yet</strong> · <span style={{ color: '#15803d', fontWeight: 700 }}>●</span> Synced = safely on server
              </div>

              {expandedOrders && (
                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {stats.orders.list.map((order) => {
                    const st = order.syncStatus;
                    const isSynced = st === 'synced';
                    const meta = isSynced ? { bg: '#f0fdf4', bd: '#bbf7d0', col: '#15803d', txt: 'Synced', Icon: FaCheckCircle }
                      : st === 'failed' ? { bg: '#fef2f2', bd: '#fca5a5', col: '#dc2626', txt: 'Failed', Icon: FaExclamationTriangle }
                      : st === 'syncing' ? { bg: '#eff6ff', bd: '#bfdbfe', col: '#2563eb', txt: 'Syncing', Icon: FaSync }
                      : { bg: '#fff7ed', bd: '#fed7aa', col: '#c2410c', txt: 'Pending', Icon: FaClock };
                    const Icon = meta.Icon;
                    const isRowSyncing = syncingKey === order.idempotencyKey;
                    return (
                      <div key={order.idempotencyKey} style={{ padding: '10px 14px', borderRadius: '8px', background: '#fff', border: `1px solid ${meta.bd}`, fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', background: meta.bg, color: meta.col, fontSize: '11px', fontWeight: 700 }}>
                                <Icon size={9} /> {meta.txt}
                              </span>
                              <span style={{ fontWeight: 600, color: '#111' }}>{order.label}</span>
                              {order.orderNumber && <span style={{ color: '#6b7280', fontSize: '12px' }}>#{order.orderNumber}</span>}
                              {order.itemsCount > 0 && <span style={{ color: '#9ca3af', fontSize: '12px' }}>· {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}</span>}
                              {order.amount != null && <span style={{ fontWeight: 700, color: '#111' }}>· {order.amount}</span>}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                              {formatTime(order.createdAt)}
                              {order.retryCount > 0 && <span> · {order.retryCount} attempt{order.retryCount !== 1 ? 's' : ''}</span>}
                            </div>
                            {order.lastError && (
                              <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace', wordBreak: 'break-word' }}>{order.lastError}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                            {!isSynced && (
                              <button
                                onClick={() => handleSyncOne(order.idempotencyKey)}
                                disabled={isRowSyncing || isSyncing || !isOnline}
                                title={!isOnline ? 'Go online to sync' : 'Sync this order to the server'}
                                style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: (isRowSyncing || isSyncing || !isOnline) ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {isRowSyncing ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSync size={10} />} Sync
                              </button>
                            )}
                            {confirmDeleteKey === order.idempotencyKey ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                {!isSynced && (
                                  <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, maxWidth: '220px', textAlign: 'right' }}>
                                    Not on server — this order will be lost.
                                  </span>
                                )}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button onClick={() => handleDeleteOne(order.idempotencyKey)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                    {isSynced ? 'Delete' : 'Delete anyway'}
                                  </button>
                                  <button onClick={() => setConfirmDeleteKey(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteKey(order.idempotencyKey)}
                                title={isSynced ? 'Delete from this device (already on server)' : 'Delete — WARNING: not on server yet'}
                                style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${isSynced ? '#e5e7eb' : '#fca5a5'}`, background: isSynced ? '#fff' : '#fef2f2', color: isSynced ? '#6b7280' : '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FaTrash size={10} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sync Engine Status */}
          <div style={{
            ...cardStyle,
            border: circuitInfo.state === 'open' ? '1px solid #fca5a5' : circuitInfo.state === 'half_open' ? '1px solid #fde68a' : '1px solid #bbf7d0',
            background: circuitInfo.state === 'open' ? '#fef2f2' : circuitInfo.state === 'half_open' ? '#fffbeb' : '#f0fdf4',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCircle size={10} style={{
                  color: circuitInfo.state === 'open' ? '#dc2626' : circuitInfo.state === 'half_open' ? '#f59e0b' : '#16a34a',
                }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Sync Engine</h3>
                <span style={{
                  ...statBoxStyle,
                  background: circuitInfo.state === 'open' ? '#fef2f2' : circuitInfo.state === 'half_open' ? '#fffbeb' : '#f0fdf4',
                  color: circuitInfo.state === 'open' ? '#dc2626' : circuitInfo.state === 'half_open' ? '#d97706' : '#16a34a',
                  fontSize: '12px',
                }}>
                  {circuitInfo.state === 'open' ? 'Paused' : circuitInfo.state === 'half_open' ? 'Testing' : isSyncing ? 'Syncing...' : 'Active'}
                </span>
                {!isOnline && (
                  <span style={{ ...statBoxStyle, background: '#fef3c7', color: '#92400e', fontSize: '12px' }}>
                    Offline
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={manualSync}
                  disabled={!isOnline || isSyncing}
                  style={{
                    ...btnStyle('#2563eb'),
                    opacity: (!isOnline || isSyncing) ? 0.4 : 1,
                  }}
                >
                  {isSyncing ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSync size={11} />}
                  Force Sync Now
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ ...statBoxStyle, background: '#fff7ed', color: '#c2410c' }}>
                <FaClock size={11} /> {syncPendingCount} pending
              </div>
              <div style={{ ...statBoxStyle, background: '#fef2f2', color: '#dc2626' }}>
                <FaExclamationTriangle size={11} /> {syncFailedOrders.length} failed
              </div>
              {circuitInfo.lastSuccessAt > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaCheckCircle size={10} style={{ color: '#16a34a' }} /> Last sync: {formatTime(circuitInfo.lastSuccessAt)}
                </div>
              )}
            </div>

            {circuitInfo.state === 'open' && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', background: '#fee2e2',
                fontSize: '13px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
              }}>
                <FaExclamationTriangle size={12} />
                Sync paused after {circuitInfo.consecutiveFailures} consecutive failures.
                {circuitInfo.nextRetryIn > 0 && (
                  <span> Auto-retry in {Math.ceil(circuitInfo.nextRetryIn / 1000)}s</span>
                )}
              </div>
            )}

            {/* Failed Orders List */}
            {syncFailedOrders.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <button
                    onClick={() => setExpandedFailed(!expandedFailed)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#dc2626', padding: 0 }}
                  >
                    {expandedFailed ? '▼' : '▶'} {syncFailedOrders.length} Failed Order{syncFailedOrders.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={async () => {
                      await retryAllFailed();
                      showToast('All failed orders re-queued for sync');
                    }}
                    disabled={isSyncing}
                    style={btnStyle('#f59e0b')}
                  >
                    <FaRedo size={11} /> Retry All
                  </button>
                </div>

                {expandedFailed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {syncFailedOrders.map((order) => (
                      <div key={order.idempotencyKey} style={{
                        padding: '10px 14px', borderRadius: '8px', background: '#fff',
                        border: '1px solid #fca5a5', fontSize: '13px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#111', marginBottom: '4px' }}>
                              {order.orderData?._offlineAction === 'create_saved_cart' ? 'Saved Cart' :
                               order.orderData?._offlineAction === 'complete_billing_new' ? 'New Bill' :
                               order.orderData?._offlineAction === 'complete_billing_existing' ? 'Existing Bill' : 'Order'}
                              {order.orderData?.items?.length > 0 && ` — ${order.orderData.items.length} item${order.orderData.items.length !== 1 ? 's' : ''}`}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                              {formatTime(order.createdAt)}
                              {order.retryCount > 0 && <span> · {order.retryCount}/{5} attempts</span>}
                            </div>
                            {order.lastError && (
                              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', fontFamily: 'monospace' }}>
                                {order.lastError}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                              onClick={async () => {
                                await retrySingleOrder(order.idempotencyKey);
                                showToast('Order re-queued for sync');
                              }}
                              disabled={isSyncing}
                              style={{
                                padding: '4px 10px', borderRadius: '6px', border: '1px solid #f59e0b',
                                background: '#fffbeb', color: '#92400e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                              }}
                            >
                              <FaRedo size={10} /> Retry
                            </button>
                            {confirmDeleteKey === order.idempotencyKey ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={async () => {
                                    await deleteFailedOrder(order.idempotencyKey);
                                    setConfirmDeleteKey(null);
                                    showToast('Failed order deleted');
                                    await loadStats();
                                  }}
                                  style={{
                                    padding: '4px 10px', borderRadius: '6px', border: 'none',
                                    background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                  }}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteKey(null)}
                                  style={{
                                    padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb',
                                    background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteKey(order.idempotencyKey)}
                                style={{
                                  padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5',
                                  background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                }}
                              >
                                <FaTrash size={10} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Essential Data (Persistent Cache) */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaDatabase style={{ color: '#059669' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Essential Data (Persistent)</h3>
                <span style={{ ...statBoxStyle, background: '#ecfdf5', color: '#065f46', fontSize: '12px' }}>
                  {stats.essentialData.count} items
                </span>
              </div>
              <button onClick={() => setConfirmAction('essential')} disabled={!!clearing || stats.essentialData.count === 0} style={{ ...btnStyle('#059669'), opacity: stats.essentialData.count === 0 ? 0.4 : 1 }}>
                <FaTrash size={11} /> Clear
              </button>
            </div>
            {stats.essentialData.count > 0 ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {stats.essentialData.keys.map(key => (
                    <span key={key} style={{ padding: '3px 10px', borderRadius: '6px', background: '#ecfdf5', color: '#065f46', fontSize: '12px', fontFamily: 'monospace' }}>
                      {key}
                    </span>
                  ))}
                </div>
                {stats.essentialData.lastUpdated && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                    Last updated: {formatTime(stats.essentialData.lastUpdated)}
                  </div>
                )}
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', fontSize: '12px', color: '#065f46' }}>
                  This data survives app restarts and enables offline billing. Not cleared by &quot;Clear API Cache&quot;.
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>No essential data cached. Visit the billing page while online to cache data.</p>
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

      {/* Tauri Desktop: SQLite Sync Dashboard */}
      {isTauri() && <TauriSyncDashboard />}

      {/* Electron Desktop: JS Sync Dashboard */}
      {isElectron() && <ElectronSyncDashboard />}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ──── Tauri SQLite Sync Dashboard (only renders in desktop app) ────

function TauriSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [mutations, setMutations] = useState([]);
  const [history, setHistory] = useState([]);
  const [cacheStats, setCacheStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('status'); // status | queue | history | cache
  const [actionLoading, setActionLoading] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [status, muts, hist, cache] = await Promise.all([
        getSyncStatus(),
        getPendingMutations(),
        getSyncHistory(50),
        getCacheStats(),
      ]);
      if (status) setSyncStatus(status);
      if (muts) setMutations(muts);
      if (hist) setHistory(hist);
      if (cache) setCacheStatsData(cache);
    } catch (e) {
      console.warn('Failed to load Tauri sync data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleAction = async (action, label) => {
    setActionLoading(label);
    try {
      await action();
      await loadAll();
    } catch (e) {
      console.error(`${label} failed:`, e);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTs = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleString();
  };

  const sectionBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveSection(id)}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: activeSection === id ? '#4f46e5' : '#f3f4f6',
        color: activeSection === id ? '#fff' : '#374151',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading Tauri sync data...
      </div>
    );
  }

  const pendingTotal = (syncStatus?.pending_count || 0) + (syncStatus?.failed_count || 0) + (syncStatus?.syncing_count || 0);

  return (
    <div style={{ marginTop: '24px', borderTop: '2px solid #e5e7eb', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaDatabase size={18} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Desktop Offline Engine</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>SQLite cache &amp; background sync (Tauri)</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: syncStatus?.is_online ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 8px ${syncStatus?.is_online ? '#22c55e' : '#ef4444'}`,
          }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: syncStatus?.is_online ? '#16a34a' : '#dc2626' }}>
            {syncStatus?.is_online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Status summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Pending', value: syncStatus?.pending_count || 0, color: '#f59e0b' },
          { label: 'Failed', value: syncStatus?.failed_count || 0, color: '#ef4444' },
          { label: 'Syncing', value: syncStatus?.syncing_count || 0, color: '#3b82f6' },
          { label: 'Cached APIs', value: cacheStats?.entry_count || 0, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '14px 16px', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleAction(triggerSync, 'sync')}
          disabled={actionLoading === 'sync' || pendingTotal === 0}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#4f46e5', color: '#fff', fontWeight: '600', fontSize: '13px',
            opacity: (actionLoading === 'sync' || pendingTotal === 0) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <FaSync size={12} style={actionLoading === 'sync' ? { animation: 'spin 1s linear infinite' } : {}} />
          Sync Now
        </button>
        <button
          onClick={() => handleAction(syncStatus?.is_paused ? resumeSync : pauseSync, 'pause')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer',
            background: '#fff', color: '#374151', fontWeight: '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {syncStatus?.is_paused ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
          {syncStatus?.is_paused ? 'Resume Sync' : 'Pause Sync'}
        </button>
        {syncStatus?.last_sync_at && (
          <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaClock size={10} /> Last sync: {formatTs(syncStatus.last_sync_at)}
          </span>
        )}
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {sectionBtn('status', 'Overview')}
        {sectionBtn('queue', `Queue (${mutations.length})`)}
        {sectionBtn('history', 'Sync History')}
        {sectionBtn('cache', 'Cache')}
      </div>

      {/* Queue section */}
      {activeSection === 'queue' && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          {mutations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
              No pending mutations. All synced!
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {mutations.map((m) => (
                <div key={m.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                    background: m.method === 'POST' ? '#dcfce7' : m.method === 'DELETE' ? '#fee2e2' : '#dbeafe',
                    color: m.method === 'POST' ? '#166534' : m.method === 'DELETE' ? '#991b1b' : '#1e40af',
                  }}>{m.method}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.endpoint}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {formatTs(m.queued_at)} {m.retry_count > 0 && `• ${m.retry_count} retries`}
                      {m.last_error && <span style={{ color: '#ef4444' }}> • {m.last_error.slice(0, 60)}</span>}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                    background: m.status === 'pending' ? '#fef3c7' : m.status === 'failed' ? '#fee2e2' : m.status === 'syncing' ? '#dbeafe' : '#fecaca',
                    color: m.status === 'pending' ? '#92400e' : m.status === 'failed' ? '#991b1b' : m.status === 'syncing' ? '#1e40af' : '#7f1d1d',
                  }}>{m.status}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(m.status === 'failed' || m.status === 'permanently_failed') && (
                      <button onClick={() => handleAction(() => retryMutation(m.id), `retry-${m.id}`)} style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff',
                        cursor: 'pointer', fontSize: '11px', color: '#4f46e5',
                      }}>Retry</button>
                    )}
                    <button onClick={() => handleAction(() => deleteMutation(m.id), `del-${m.id}`)} style={{
                      padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff',
                      cursor: 'pointer', fontSize: '11px', color: '#ef4444',
                    }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History section */}
      {activeSection === 'history' && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          {history.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No sync history yet.</div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {history.map((h) => (
                <div key={h.id} style={{
                  padding: '10px 16px', borderBottom: '1px solid #f3f4f6',
                  display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: h.status === 'success' ? '#22c55e' : h.status === 'failed' ? '#ef4444' : h.status === 'error' ? '#f59e0b' : '#9ca3af',
                  }} />
                  <span style={{ color: '#6b7280', minWidth: '130px' }}>{formatTs(h.timestamp)}</span>
                  <span style={{ fontWeight: '600', color: '#374151', minWidth: '80px' }}>{h.action}</span>
                  <span style={{ color: '#6b7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.endpoint || ''} {h.details ? `— ${h.details}` : ''}
                  </span>
                  {h.duration_ms > 0 && (
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>{h.duration_ms}ms</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cache section */}
      {activeSection === 'cache' && cacheStats && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Cached Endpoints</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{cacheStats.entry_count}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Cache Size</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{formatBytes(cacheStats.total_size_bytes)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Oldest Entry</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>{formatTs(cacheStats.oldest_entry_at)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Newest Entry</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>{formatTs(cacheStats.newest_entry_at)}</div>
            </div>
          </div>
          <button
            onClick={() => handleAction(async () => { await clearCache(); await loadAll(); }, 'clearCache')}
            disabled={actionLoading === 'clearCache' || cacheStats.entry_count === 0}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff',
              color: '#ef4444', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
              opacity: cacheStats.entry_count === 0 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <FaTrash size={11} /> Clear SQLite Cache
          </button>
        </div>
      )}

      {/* Overview (default) */}
      {activeSection === 'status' && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
            The desktop app routes all API calls through a local SQLite database. When online, data is fetched
            from the cloud and cached locally. When offline, cached data is served instantly and mutations
            (orders, updates) are queued for automatic sync when connectivity returns.
          </p>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
            <div>Sync daemon: <strong style={{ color: syncStatus?.is_paused ? '#ef4444' : '#22c55e' }}>{syncStatus?.is_paused ? 'Paused' : 'Active'}</strong></div>
            <div>Mutation queue: <strong>{pendingTotal}</strong> items</div>
            <div>Permanently failed: <strong style={{ color: (syncStatus?.permanently_failed_count || 0) > 0 ? '#ef4444' : '#374151' }}>{syncStatus?.permanently_failed_count || 0}</strong></div>
            <div>Cache entries: <strong>{cacheStats?.entry_count || 0}</strong> ({formatBytes(cacheStats?.total_size_bytes || 0)})</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── Electron JS Sync Dashboard (only renders in Electron desktop app) ────

function ElectronSyncDashboard() {
  const [status, setStatus] = useState(null);
  const [mutations, setMutations] = useState([]);
  const [history, setHistory] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [s, m, h, c] = await Promise.all([
        electronSync.getSyncStatus(),
        electronSync.getPendingMutations(),
        electronSync.getSyncHistory(30),
        electronSync.getCacheStats(),
      ]);
      setStatus(s);
      setMutations(m || []);
      setHistory(h || []);
      setCacheStats(c);
    } catch (e) { console.error('[ElectronSync] refresh failed:', e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  if (loading || !status) return <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}><FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  const pendingTotal = (status.pending_count || 0) + (status.failed_count || 0);
  const isOnline = status.is_online;
  const isPaused = status.is_paused;

  return (
    <div style={{ marginTop: '24px', borderTop: '2px solid #e5e7eb', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaDatabase size={18} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Desktop Offline Engine</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>SQLite cache &amp; background sync (Electron)</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: isOnline ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 8px ${isOnline ? '#22c55e' : '#ef4444'}`,
          }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: isOnline ? '#16a34a' : '#dc2626' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Status summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Pending', value: status.pending_count || 0, color: '#f59e0b' },
          { label: 'Failed', value: status.failed_count || 0, color: '#ef4444' },
          { label: 'Perm Failed', value: status.permanently_failed_count || 0, color: '#991b1b' },
          { label: 'Sync', value: isPaused ? 'Paused' : status.syncing_count > 0 ? 'Syncing' : 'Ready', color: isPaused ? '#f59e0b' : status.syncing_count > 0 ? '#3b82f6' : '#16a34a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '14px 16px', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={async () => { await electronSync.triggerSync(); setTimeout(refresh, 1000); }}
          disabled={pendingTotal === 0 || !isOnline || isPaused}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '13px',
            opacity: (pendingTotal === 0 || !isOnline || isPaused) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <FaSync size={12} />
          Sync Now
        </button>
        <button
          onClick={async () => { isPaused ? await electronSync.resumeSync() : await electronSync.pauseSync(); refresh(); }}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer',
            background: '#fff', color: '#374151', fontWeight: '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {isPaused ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
          {isPaused ? 'Resume Sync' : 'Pause Sync'}
        </button>
        <button
          onClick={async () => { await electronSync.clearCache(); refresh(); }}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer',
            background: '#fff', color: '#374151', fontWeight: '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <FaTrash size={11} /> Clear Cache
        </button>
        {status.last_sync_at && (
          <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaClock size={10} /> Last sync: {new Date(status.last_sync_at * 1000).toLocaleString()}
          </span>
        )}
      </div>

      {/* Cache stats */}
      {cacheStats && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>SQLite Cache</h4>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
            <div>Cached endpoints: <strong>{cacheStats.entry_count}</strong></div>
            <div>Total size: <strong>{formatBytes(cacheStats.total_size_bytes || 0)}</strong></div>
          </div>
        </div>
      )}

      {/* Mutation queue */}
      {mutations.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mutation Queue ({mutations.length})</h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {mutations.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0',
                borderBottom: '1px solid #f3f4f6', fontSize: '12px',
              }}>
                <span style={{
                  padding: '2px 6px', borderRadius: '4px', fontWeight: '600', fontSize: '10px',
                  background: m.status === 'pending' ? '#fef3c7' : m.status === 'failed' ? '#fee2e2' : m.status === 'syncing' ? '#dbeafe' : '#fecaca',
                  color: m.status === 'pending' ? '#92400e' : m.status === 'failed' ? '#991b1b' : m.status === 'syncing' ? '#1e40af' : '#7f1d1d',
                }}>{m.status}</span>
                <span style={{ color: '#6b7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.method} {m.endpoint}
                </span>
                {m.retry_count > 0 && <span style={{ color: '#ef4444' }}>x{m.retry_count}</span>}
                {(m.status === 'failed' || m.status === 'permanently_failed') && (
                  <button onClick={async () => { await electronSync.retryMutation(m.id); refresh(); }}
                    style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '11px' }}>
                    Retry
                  </button>
                )}
                <button onClick={async () => { await electronSync.deleteMutation(m.id); refresh(); }}
                  style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#ef4444' }}>
                  Del
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync history */}
      {history.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Sync History (last 30)</h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {history.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                borderBottom: '1px solid #f3f4f6', fontSize: '11px', color: '#6b7280',
              }}>
                <span style={{ color: h.status === 'success' ? '#16a34a' : h.status === 'failed' ? '#ef4444' : '#f59e0b', fontWeight: '600' }}>
                  {h.action}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.endpoint || '-'}</span>
                <span>{new Date(h.timestamp * 1000).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
