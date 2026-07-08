'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import {
  FaCloud, FaPlug, FaCheck, FaTimes, FaSpinner, FaSyncAlt,
  FaFileExcel, FaChevronDown, FaLink, FaUnlink, FaExchangeAlt,
  FaClipboardList, FaHistory,
} from 'react-icons/fa';

const GL_CATEGORIES = [
  { key: 'salesRevenue', label: 'Sales Revenue', description: 'Main food & beverage sales' },
  { key: 'deliveryRevenue', label: 'Delivery Revenue', description: 'Delivery order revenue' },
  { key: 'taxPayable', label: 'Tax Payable (VAT)', description: 'Output VAT / tax collected' },
  { key: 'cashAccount', label: 'Cash Account', description: 'Cash payments received' },
  { key: 'cardAccount', label: 'Card / UPI Account', description: 'Card and UPI payments' },
  { key: 'onlinePaymentAccount', label: 'Online Payment', description: 'Online/digital payments' },
  { key: 'aggregatorAccount', label: 'Aggregator Payment', description: 'Talabat/delivery app payments' },
  { key: 'discountExpense', label: 'Discount Expense', description: 'Discounts and offers given' },
  { key: 'tipsLiability', label: 'Tips Liability', description: 'Staff tips collected' },
  { key: 'cogsAccount', label: 'Cost of Goods Sold', description: 'COGS for inventory items' },
  { key: 'dueReceivable', label: 'Due / Receivable', description: 'Outstanding amounts' },
];

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#111827',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const fieldGroupStyle = {
  marginBottom: '16px',
};

const primaryBtnStyle = {
  padding: '8px 16px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const dangerBtnStyle = {
  padding: '8px 16px',
  background: 'white',
  color: '#ef4444',
  border: '1px solid #ef4444',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const successBtnStyle = {
  ...primaryBtnStyle,
  background: '#059669',
};

const disabledBtnStyle = {
  opacity: 0.6,
  cursor: 'not-allowed',
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #f1f5f9',
  padding: '24px',
};

const SUB_TABS = [
  { key: 'connection', label: 'Connection', icon: FaPlug },
  { key: 'glMapping', label: 'GL Mapping', icon: FaExchangeAlt },
  { key: 'sync', label: 'Sync Controls', icon: FaSyncAlt },
  { key: 'logs', label: 'Sync Logs', icon: FaHistory },
];

const LOG_TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'daily_summary', label: 'Daily Summary' },
  { value: 'single_order', label: 'Single Order' },
  { value: 'item_sync', label: 'Item Sync' },
  { value: 'customer_sync', label: 'Customer Sync' },
];

const LOG_TYPE_COLORS = {
  daily_summary: { bg: '#dbeafe', color: '#1d4ed8' },
  single_order: { bg: '#f3e8ff', color: '#7c3aed' },
  item_sync: { bg: '#fef3c7', color: '#b45309' },
  customer_sync: { bg: '#d1fae5', color: '#047857' },
};

export default function D365Settings({ restaurantId, selectedRestaurant }) {
  const [activeSubTab, setActiveSubTab] = useState('connection');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Connection form
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [journalBatchName, setJournalBatchName] = useState('DINEOPEN');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // GL Mapping
  const [bcAccounts, setBcAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [glMapping, setGlMapping] = useState({
    salesRevenue: '40100', deliveryRevenue: '40200', taxPayable: '23100',
    cashAccount: '11100', cardAccount: '11200', onlinePaymentAccount: '11300',
    aggregatorAccount: '11400', discountExpense: '60500', tipsLiability: '24000',
    cogsAccount: '50100', dueReceivable: '12000',
  });

  // Sync
  const [syncMode, setSyncMode] = useState('daily');
  const [autoSync, setAutoSync] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [syncDate, setSyncDate] = useState(new Date().toISOString().split('T')[0]);

  // Logs
  const [syncLogs, setSyncLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);

  // ─── Load status on mount ───
  useEffect(() => {
    if (!restaurantId) return;
    loadStatus();
  }, [restaurantId]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getD365Status(restaurantId);
      if (res.connected) {
        setStatus(res);
        setGlMapping(res.glMapping || glMapping);
        setSyncMode(res.syncMode || 'daily');
        setAutoSync(res.autoSync || false);
        setJournalBatchName(res.journalBatchName || 'DINEOPEN');
      }
    } catch (err) {
      // Not connected — that's fine
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // ─── Load logs when switching to logs tab ───
  useEffect(() => {
    if (activeSubTab === 'logs' && status?.connected) {
      loadLogs();
    }
  }, [activeSubTab, logFilter]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await apiClient.getD365SyncLog(restaurantId, {
        limit: 50,
        type: logFilter || undefined,
      });
      setSyncLogs(res.logs || res || []);
    } catch (err) {
      setError('Failed to load sync logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  // ─── Clear messages after 4 seconds ───
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ─── Connection handlers ───
  const handleTestConnection = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setError('Please fill in Tenant ID, Client ID, and Client Secret');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setError('');
    try {
      const res = await apiClient.connectD365(restaurantId, {
        tenantId, clientId, clientSecret, environment,
      });
      setTestResult(res);
      if (res.companies) {
        setCompanies(res.companies);
        if (res.companies.length === 1) {
          setSelectedCompanyId(res.companies[0].id);
        }
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!selectedCompanyId) {
      setError('Please select a company');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiClient.connectD365(restaurantId, {
        tenantId, clientId, clientSecret, environment,
        companyId: selectedCompanyId,
        journalBatchName,
      });
      setSuccess('Connected to Dynamics 365 Business Central');
      setCompanies([]);
      setTestResult(null);
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Failed to save connection');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect from Dynamics 365 Business Central? This will stop all sync operations.')) return;
    setSaving(true);
    try {
      await apiClient.disconnectD365(restaurantId);
      setStatus(null);
      setSuccess('Disconnected from Dynamics 365');
      setTenantId('');
      setClientId('');
      setClientSecret('');
      setCompanies([]);
      setTestResult(null);
    } catch (err) {
      setError(err.message || 'Failed to disconnect');
    } finally {
      setSaving(false);
    }
  };

  // ─── GL Mapping handlers ───
  const handleFetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await apiClient.getD365Accounts(restaurantId);
      setBcAccounts(res.accounts || res || []);
    } catch (err) {
      setError('Failed to fetch BC accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    setError('');
    try {
      await apiClient.updateD365Settings(restaurantId, { glMapping });
      setSuccess('GL mapping saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to save mapping');
    } finally {
      setSaving(false);
    }
  };

  // ─── Sync handlers ───
  const handleSaveSyncSettings = async () => {
    setSaving(true);
    setError('');
    try {
      await apiClient.updateD365Settings(restaurantId, { syncMode, autoSync, journalBatchName });
      setSuccess('Sync settings saved');
    } catch (err) {
      setError(err.message || 'Failed to save sync settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncDaily = async () => {
    setSyncing(prev => ({ ...prev, daily: true }));
    try {
      const res = await apiClient.syncD365Daily(restaurantId, syncDate);
      setSuccess(res.message || `Daily summary synced for ${syncDate}`);
    } catch (err) {
      setError(err.message || 'Daily sync failed');
    } finally {
      setSyncing(prev => ({ ...prev, daily: false }));
    }
  };

  const handleSyncItems = async (direction) => {
    const key = `items_${direction}`;
    setSyncing(prev => ({ ...prev, [key]: true }));
    try {
      const res = await apiClient.syncD365Items(restaurantId, direction);
      setSuccess(res.message || `Item sync (${direction}) completed`);
    } catch (err) {
      setError(err.message || `Item sync (${direction}) failed`);
    } finally {
      setSyncing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSyncCustomers = async () => {
    setSyncing(prev => ({ ...prev, customers: true }));
    try {
      const res = await apiClient.syncD365Customers(restaurantId);
      setSuccess(res.message || 'Customer sync completed');
    } catch (err) {
      setError(err.message || 'Customer sync failed');
    } finally {
      setSyncing(prev => ({ ...prev, customers: false }));
    }
  };

  // ─── Render loading state ───
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p>Loading Dynamics 365 settings...</p>
      </div>
    );
  }

  const isConnected = status?.connected;

  // ─── Render ───
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCloud color="#2563eb" /> Dynamics 365 Business Central
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Sync your DineOpen data with Microsoft Dynamics 365 Business Central.
          </p>
        </div>
        {isConnected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f0fdf4', color: '#15803d', padding: '6px 12px',
            borderRadius: '20px', fontSize: '12px', fontWeight: 600,
          }}>
            <FaCheck size={10} /> Connected
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#dc2626',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <FaTimes size={12} /> {error}
        </div>
      )}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#15803d',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <FaCheck size={12} /> {success}
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          const isDisabled = tab.key !== 'connection' && !isConnected;
          return (
            <button
              key={tab.key}
              onClick={() => !isDisabled && setActiveSubTab(tab.key)}
              disabled={isDisabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '20px', border: 'none',
                fontSize: '13px', fontWeight: 600, cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isActive ? '#2563eb' : isDisabled ? '#f3f4f6' : '#f1f5f9',
                color: isActive ? '#ffffff' : isDisabled ? '#9ca3af' : '#374151',
                transition: 'all 0.2s',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <Icon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════ Sub-tab 1: Connection ═══════════════ */}
      {activeSubTab === 'connection' && (
        <div style={cardStyle}>
          {isConnected ? (
            /* Connected status */
            <div>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
                padding: '20px', marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FaLink color="#15803d" size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#15803d' }}>Connected</div>
                    <div style={{ fontSize: '12px', color: '#16a34a' }}>Dynamics 365 Business Central</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Company</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{status.companyName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Tenant</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{status.tenantId || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Environment</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>{status.environment || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Connected Since</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>
                      {status.connectedAt ? new Date(status.connectedAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={saving}
                style={{ ...dangerBtnStyle, ...(saving ? disabledBtnStyle : {}) }}
              >
                {saving ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaUnlink size={12} />}
                {saving ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            /* Connection form */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Tenant ID</label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="e.g., contoso.onmicrosoft.com or GUID"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Client ID</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Azure AD App Client ID"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Client Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Azure AD App Client Secret"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="production">Production</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              {/* Test Connection button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !tenantId || !clientId || !clientSecret}
                  style={{
                    ...primaryBtnStyle,
                    ...((testing || !tenantId || !clientId || !clientSecret) ? disabledBtnStyle : {}),
                  }}
                >
                  {testing
                    ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing...</>
                    : <><FaPlug size={12} /> Test Connection</>
                  }
                </button>
                {testResult && !testResult.companies && (
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    color: testResult.success ? '#15803d' : '#dc2626',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    {testResult.success ? <FaCheck size={12} /> : <FaTimes size={12} />}
                    {testResult.message}
                  </span>
                )}
              </div>

              {/* Step 2: Company selection after test passes */}
              {companies.length > 0 && (
                <div style={{
                  marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                    padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#15803d',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <FaCheck size={12} /> Connection successful. Select a company to complete setup.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Company</label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        <option value="">Select a company...</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.displayName || c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Journal Batch Name</label>
                      <input
                        type="text"
                        value={journalBatchName}
                        onChange={(e) => setJournalBatchName(e.target.value)}
                        placeholder="DINEOPEN"
                        style={inputStyle}
                      />
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                        General journal batch name in BC for DineOpen entries.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveConnection}
                    disabled={saving || !selectedCompanyId}
                    style={{
                      ...successBtnStyle,
                      ...((saving || !selectedCompanyId) ? disabledBtnStyle : {}),
                      marginTop: '4px',
                    }}
                  >
                    {saving
                      ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                      : <><FaLink size={12} /> Save Connection</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ Sub-tab 2: GL Mapping ═══════════════ */}
      {activeSubTab === 'glMapping' && isConnected && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>GL Account Mapping</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
                Map DineOpen categories to your Business Central chart of accounts.
              </p>
            </div>
            <button
              onClick={handleFetchAccounts}
              disabled={loadingAccounts}
              style={{
                ...primaryBtnStyle,
                ...(loadingAccounts ? disabledBtnStyle : {}),
              }}
            >
              {loadingAccounts
                ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Fetching...</>
                : <><FaFileExcel size={12} /> Fetch BC Accounts</>
              }
            </button>
          </div>

          {bcAccounts.length > 0 && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
              padding: '8px 14px', marginBottom: '16px', fontSize: '12px', color: '#15803d',
            }}>
              {bcAccounts.length} accounts loaded from Business Central
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>DineOpen Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>BC Account</th>
                </tr>
              </thead>
              <tbody>
                {GL_CATEGORIES.map((cat, idx) => (
                  <tr
                    key={cat.key}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 500, color: '#111827' }}>{cat.label}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cat.description}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {bcAccounts.length > 0 ? (
                        <select
                          value={glMapping[cat.key] || ''}
                          onChange={(e) => setGlMapping(prev => ({ ...prev, [cat.key]: e.target.value }))}
                          style={{ ...inputStyle, maxWidth: '320px' }}
                        >
                          <option value="">Select account...</option>
                          {bcAccounts.map(acc => (
                            <option key={acc.number || acc.id} value={acc.number}>
                              {acc.number} - {acc.displayName || acc.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={glMapping[cat.key] || ''}
                          onChange={(e) => setGlMapping(prev => ({ ...prev, [cat.key]: e.target.value }))}
                          placeholder="Account number"
                          style={{ ...inputStyle, maxWidth: '200px' }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleSaveMapping}
              disabled={saving}
              style={{
                ...successBtnStyle,
                ...(saving ? disabledBtnStyle : {}),
              }}
            >
              {saving
                ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                : <><FaCheck size={12} /> Save Mapping</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ Sub-tab 3: Sync Controls ═══════════════ */}
      {activeSubTab === 'sync' && isConnected && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0' }}>Sync Settings</h3>

          {/* Sync Mode */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Sync Mode</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { value: 'daily', label: 'Daily Summary' },
                { value: 'per_order', label: 'Per Order' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                    border: syncMode === opt.value ? '2px solid #2563eb' : '1px solid #d1d5db',
                    background: syncMode === opt.value ? '#eff6ff' : '#ffffff',
                    fontSize: '13px', fontWeight: 500, color: '#111827',
                  }}
                >
                  <input
                    type="radio"
                    name="syncMode"
                    value={opt.value}
                    checked={syncMode === opt.value}
                    onChange={(e) => setSyncMode(e.target.value)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <div style={{
            ...fieldGroupStyle,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '10px',
            border: autoSync ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
            background: autoSync ? '#f0fdf4' : '#f9fafb',
            cursor: 'pointer',
          }}
            onClick={() => setAutoSync(!autoSync)}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Auto-Sync</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {autoSync ? 'Automatically sync data to BC on schedule' : 'Manual sync only'}
              </div>
            </div>
            <div style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: autoSync ? '#2563eb' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#ffffff', position: 'absolute', top: '2px',
                left: autoSync ? '22px' : '2px', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>

          {/* Journal Batch Name */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Journal Batch Name</label>
            <input
              type="text"
              value={journalBatchName}
              onChange={(e) => setJournalBatchName(e.target.value)}
              placeholder="DINEOPEN"
              style={{ ...inputStyle, maxWidth: '300px' }}
            />
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
              The general journal batch in BC where entries will be posted.
            </p>
          </div>

          <button
            onClick={handleSaveSyncSettings}
            disabled={saving}
            style={{
              ...successBtnStyle,
              ...(saving ? disabledBtnStyle : {}),
            }}
          >
            {saving
              ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><FaCheck size={12} /> Save Settings</>
            }
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e7eb', margin: '28px 0', position: 'relative' }}>
            <span style={{
              position: 'absolute', top: '-10px', left: '16px',
              background: '#ffffff', padding: '0 8px', fontSize: '12px',
              color: '#6b7280', fontWeight: 600, textTransform: 'uppercase',
            }}>
              Manual Sync
            </span>
          </div>

          {/* Manual Sync controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            {/* Daily Summary sync */}
            <div style={{
              padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '12px' }}>
                Daily Summary
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={syncDate}
                  onChange={(e) => setSyncDate(e.target.value)}
                  style={{ ...inputStyle, maxWidth: '180px' }}
                />
                <button
                  onClick={handleSyncDaily}
                  disabled={syncing.daily}
                  style={{
                    ...primaryBtnStyle,
                    ...(syncing.daily ? disabledBtnStyle : {}),
                    fontSize: '12px', padding: '8px 12px',
                  }}
                >
                  {syncing.daily
                    ? <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</>
                    : <><FaSyncAlt size={11} /> Sync Daily Summary</>
                  }
                </button>
              </div>
            </div>

            {/* Menu Items push */}
            <div style={{
              padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '12px' }}>
                Menu Items
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSyncItems('push')}
                  disabled={syncing.items_push}
                  style={{
                    ...primaryBtnStyle,
                    ...(syncing.items_push ? disabledBtnStyle : {}),
                    fontSize: '12px', padding: '8px 12px',
                  }}
                >
                  {syncing.items_push
                    ? <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Pushing...</>
                    : <><FaSyncAlt size={11} /> Sync Menu Items to BC</>
                  }
                </button>
                <button
                  onClick={() => handleSyncItems('pull')}
                  disabled={syncing.items_pull}
                  style={{
                    ...primaryBtnStyle,
                    background: '#7c3aed',
                    ...(syncing.items_pull ? disabledBtnStyle : {}),
                    fontSize: '12px', padding: '8px 12px',
                  }}
                >
                  {syncing.items_pull
                    ? <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Pulling...</>
                    : <><FaExchangeAlt size={11} /> Pull Items from BC</>
                  }
                </button>
              </div>
            </div>

            {/* Customers sync */}
            <div style={{
              padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '12px' }}>
                Customers
              </div>
              <button
                onClick={handleSyncCustomers}
                disabled={syncing.customers}
                style={{
                  ...primaryBtnStyle,
                  ...(syncing.customers ? disabledBtnStyle : {}),
                  fontSize: '12px', padding: '8px 12px',
                }}
              >
                {syncing.customers
                  ? <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</>
                  : <><FaSyncAlt size={11} /> Sync Customers to BC</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Sub-tab 4: Sync Logs ═══════════════ */}
      {activeSubTab === 'logs' && isConnected && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Sync Logs</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: '150px' }}
              >
                {LOG_TYPE_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <button
                onClick={loadLogs}
                disabled={loadingLogs}
                style={{
                  ...primaryBtnStyle,
                  ...(loadingLogs ? disabledBtnStyle : {}),
                }}
              >
                {loadingLogs
                  ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  : <FaSyncAlt size={12} />
                }
                Refresh
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>Loading sync logs...</p>
            </div>
          ) : syncLogs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', color: '#9ca3af',
              background: '#f9fafb', borderRadius: '10px',
            }}>
              <FaClipboardList size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No sync logs found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['Date', 'Type', 'Status', 'Lines', 'Amount', 'Synced By', 'Time'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 12px', color: '#6b7280',
                        fontWeight: 600, fontSize: '11px', textTransform: 'uppercase',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log, idx) => {
                    const typeColor = LOG_TYPE_COLORS[log.type] || { bg: '#f3f4f6', color: '#374151' };
                    const isExpanded = expandedLog === idx;
                    return (
                      <tr
                        key={log.id || idx}
                        onClick={() => setExpandedLog(isExpanded ? null : idx)}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          cursor: log.error ? 'pointer' : 'default',
                          background: isExpanded ? '#fefce8' : idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                          transition: 'background 0.15s',
                        }}
                      >
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {log.date ? new Date(log.date).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                            fontSize: '11px', fontWeight: 600,
                            background: typeColor.bg, color: typeColor.color,
                          }}>
                            {(log.type || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', fontWeight: 600,
                            color: log.status === 'success' ? '#15803d' : '#dc2626',
                          }}>
                            {log.status === 'success'
                              ? <FaCheck size={10} color="#15803d" />
                              : <FaTimes size={10} color="#dc2626" />
                            }
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{log.lines ?? '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{log.amount != null ? log.amount.toFixed(2) : '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{log.syncedBy || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {log.date ? new Date(log.date).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Expanded error details */}
              {expandedLog !== null && syncLogs[expandedLog]?.error && (
                <div style={{
                  margin: '8px 0 16px', padding: '12px 16px',
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                  fontSize: '12px', color: '#991b1b', fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', fontFamily: 'inherit' }}>Error Details:</div>
                  {syncLogs[expandedLog].error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spinner keyframes (inline) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
