'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const PLATFORMS = [
  {
    id: 'talabat',
    name: 'Talabat',
    color: '#FF5A00',
    bgLight: '#FFF7F0',
    borderLight: '#FFD4B8',
    description: 'The #1 food delivery platform in GCC (Qatar, UAE, KSA, Kuwait, Bahrain, Oman)',
    logo: null,
    available: true,
  },
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    color: '#00CCBC',
    bgLight: '#F0FDFB',
    borderLight: '#B3F0E8',
    description: 'Popular food delivery platform in UAE, UK, and Europe',
    logo: null,
    available: false,
  },
  {
    id: 'noon_food',
    name: 'Noon Food',
    color: '#FEEE00',
    bgLight: '#FFFEF0',
    borderLight: '#FFF5A0',
    description: 'Growing food delivery platform in UAE with low commission rates',
    logo: null,
    available: false,
  },
  {
    id: 'careem',
    name: 'Careem NOW',
    color: '#4DB848',
    bgLight: '#F0FDF4',
    borderLight: '#BBF7D0',
    description: 'Food delivery by Careem across UAE and Middle East',
    logo: null,
    available: false,
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Talabat state
  const [talabatStatus, setTalabatStatus] = useState(null); // null = loading, false = not connected, object = connected
  const [connectForm, setConnectForm] = useState({ vendorId: '', clientId: '', clientSecret: '', webhookSecret: '' });
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pushingMenu, setPushingMenu] = useState(false);
  const [togglingStore, setTogglingStore] = useState(false);
  const [toast, setToast] = useState(null);
  const [webhookUrls, setWebhookUrls] = useState(null);
  const [showWebhookUrls, setShowWebhookUrls] = useState(false);

  // Get restaurant ID from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const rid = user.restaurantId || localStorage.getItem('selectedRestaurantId');
      setRestaurantId(rid);
    }
  }, []);

  // Load Talabat status
  const loadTalabatStatus = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const result = await apiClient.getTalabatStatus(restaurantId);
      setTalabatStatus(result.connected ? result : false);
    } catch {
      setTalabatStatus(false);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) loadTalabatStatus();
  }, [restaurantId, loadTalabatStatus]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleConnect = async () => {
    if (!connectForm.vendorId || !connectForm.clientId || !connectForm.clientSecret) {
      setToast({ msg: 'Please fill in Vendor ID, Client ID, and Client Secret', type: 'error' });
      return;
    }
    setConnecting(true);
    try {
      const result = await apiClient.connectTalabat(restaurantId, connectForm);
      setToast({ msg: result.message || 'Connected to Talabat', type: 'success' });
      setShowConnectForm(false);
      setConnectForm({ vendorId: '', clientId: '', clientSecret: '', webhookSecret: '' });
      await loadTalabatStatus();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to connect to Talabat', type: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Talabat? Orders will no longer flow into your POS.')) return;
    setDisconnecting(true);
    try {
      await apiClient.disconnectTalabat(restaurantId);
      setToast({ msg: 'Disconnected from Talabat', type: 'success' });
      setTalabatStatus(false);
    } catch (err) {
      setToast({ msg: err.message || 'Failed to disconnect', type: 'error' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handlePushMenu = async () => {
    setPushingMenu(true);
    try {
      const result = await apiClient.pushMenuToTalabat(restaurantId);
      setToast({ msg: result.message || 'Menu pushed to Talabat', type: 'success' });
      await loadTalabatStatus();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to push menu', type: 'error' });
    } finally {
      setPushingMenu(false);
    }
  };

  const handleToggleStore = async () => {
    const currentlyOpen = talabatStatus?.storeStatus === 'open';
    setTogglingStore(true);
    try {
      const result = await apiClient.updateTalabatStoreStatus(restaurantId, !currentlyOpen);
      setToast({ msg: result.message || `Store ${!currentlyOpen ? 'opened' : 'closed'} on Talabat`, type: 'success' });
      await loadTalabatStatus();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to update store status', type: 'error' });
    } finally {
      setTogglingStore(false);
    }
  };

  const handleToggleAutoAccept = async () => {
    const newValue = !talabatStatus?.autoAccept;
    try {
      await apiClient.updateTalabatSettings(restaurantId, { autoAccept: newValue });
      setToast({ msg: `Auto-accept ${newValue ? 'enabled' : 'disabled'}`, type: 'success' });
      await loadTalabatStatus();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to update setting', type: 'error' });
    }
  };

  const handleShowWebhookUrls = async () => {
    if (!webhookUrls) {
      try {
        const result = await apiClient.getAggregatorWebhookUrls();
        setWebhookUrls(result.webhooks);
      } catch {
        setToast({ msg: 'Failed to load webhook URLs', type: 'error' });
        return;
      }
    }
    setShowWebhookUrls(!showWebhookUrls);
  };

  // ─── Render Helpers ───────────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db',
    fontSize: 14, fontFamily: FONT, outline: 'none', transition: 'border-color 0.15s',
  };

  const btnStyle = (bg, color, disabled) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14, fontWeight: 600, fontFamily: FONT,
    background: disabled ? '#d1d5db' : bg, color: disabled ? '#6b7280' : color,
    opacity: disabled ? 0.7 : 1, transition: 'all 0.15s',
  });

  const toggleBtn = (active) => ({
    position: 'relative', display: 'inline-flex', height: 24, width: 44,
    alignItems: 'center', borderRadius: 12, cursor: 'pointer',
    background: active ? '#3b82f6' : '#d1d5db', border: 'none',
    transition: 'background 0.2s',
  });

  const toggleDot = (active) => ({
    display: 'inline-block', height: 16, width: 16, borderRadius: '50%',
    background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
    transform: active ? 'translateX(24px)' : 'translateX(4px)',
  });

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#111827' }}>
          Integrations
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Connect your restaurant with food delivery platforms to receive orders directly in your POS
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 500,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Platform Cards */}
      {PLATFORMS.map(platform => {
        const isTalabat = platform.id === 'talabat';
        const isConnected = isTalabat && talabatStatus && talabatStatus.connected;

        return (
          <div key={platform.id} style={{
            border: `1px solid ${isConnected ? platform.borderLight : '#e5e7eb'}`,
            borderRadius: 12, padding: 24, marginBottom: 16,
            background: isConnected ? platform.bgLight : '#fff',
            opacity: platform.available ? 1 : 0.6,
          }}>
            {/* Platform Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: platform.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: platform.id === 'noon_food' ? '#111' : '#fff', fontWeight: 800, fontSize: 16,
                }}>
                  {platform.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>
                    {platform.name}
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                    {platform.description}
                  </p>
                </div>
              </div>
              {/* Status Badge */}
              {isTalabat && !loading && (
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: isConnected ? '#d1fae5' : '#f3f4f6',
                  color: isConnected ? '#059669' : '#6b7280',
                }}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              )}
              {!platform.available && (
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: '#f3f4f6', color: '#9ca3af',
                }}>
                  Coming Soon
                </span>
              )}
            </div>

            {/* Talabat Content */}
            {isTalabat && platform.available && (
              <>
                {loading ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading status...</p>
                ) : isConnected ? (
                  /* Connected State */
                  <div>
                    {/* Info Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      <div style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Vendor ID</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{talabatStatus.vendorId}</div>
                      </div>
                      <div style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Connected Since</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                          {talabatStatus.connectedAt ? new Date(talabatStatus.connectedAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Auto Accept */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Auto-accept orders</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>Automatically accept incoming Talabat orders without staff intervention</div>
                        </div>
                        <button style={toggleBtn(talabatStatus.autoAccept)} onClick={handleToggleAutoAccept}>
                          <span style={toggleDot(talabatStatus.autoAccept)} />
                        </button>
                      </div>

                      {/* Store Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Store status on Talabat</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Currently: <span style={{
                              fontWeight: 700,
                              color: talabatStatus.storeStatus === 'open' ? '#059669' : '#dc2626',
                            }}>
                              {talabatStatus.storeStatus === 'open' ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        <button
                          style={btnStyle(
                            talabatStatus.storeStatus === 'open' ? '#dc2626' : '#059669',
                            '#fff',
                            togglingStore,
                          )}
                          onClick={handleToggleStore}
                          disabled={togglingStore}
                        >
                          {togglingStore ? '...' : talabatStatus.storeStatus === 'open' ? 'Close Store' : 'Open Store'}
                        </button>
                      </div>

                      {/* Menu Sync */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Menu sync</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {talabatStatus.lastMenuSyncAt
                              ? `Last synced: ${new Date(talabatStatus.lastMenuSyncAt).toLocaleString()}`
                              : 'Menu has not been pushed yet'}
                            {talabatStatus.lastMenuSyncStatus && (
                              <span style={{
                                marginLeft: 8, padding: '2px 6px', borderRadius: 4, fontSize: 11,
                                background: talabatStatus.lastMenuSyncStatus === 'completed' ? '#d1fae5' : '#fef3c7',
                                color: talabatStatus.lastMenuSyncStatus === 'completed' ? '#059669' : '#92400e',
                              }}>
                                {talabatStatus.lastMenuSyncStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          style={btnStyle('#3b82f6', '#fff', pushingMenu)}
                          onClick={handlePushMenu}
                          disabled={pushingMenu}
                        >
                          {pushingMenu ? 'Pushing...' : 'Push Menu Now'}
                        </button>
                      </div>

                      {/* Webhook URLs */}
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#3b82f6', fontWeight: 600, padding: 0, fontFamily: FONT }}
                          onClick={handleShowWebhookUrls}
                        >
                          {showWebhookUrls ? 'Hide' : 'Show'} Webhook URLs
                        </button>
                        {showWebhookUrls && webhookUrls && (
                          <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 8, padding: 16, fontSize: 12 }}>
                            <p style={{ margin: '0 0 8px', color: '#6b7280' }}>Configure these URLs in your Talabat partner portal:</p>
                            {Object.entries(webhookUrls).map(([key, url]) => (
                              <div key={key} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                                <code style={{ fontSize: 12, color: '#111827', wordBreak: 'break-all' }}>{url}</code>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Disconnect */}
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                        <button
                          style={btnStyle('#fff', '#dc2626', disconnecting)}
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                          onMouseEnter={e => { if (!disconnecting) { e.target.style.background = '#fef2f2'; } }}
                          onMouseLeave={e => { e.target.style.background = '#fff'; }}
                        >
                          {disconnecting ? 'Disconnecting...' : 'Disconnect Talabat'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Not Connected State */
                  <div>
                    {!showConnectForm ? (
                      <button
                        style={btnStyle(platform.color, '#fff', false)}
                        onClick={() => setShowConnectForm(true)}
                      >
                        Connect Talabat
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
                          Enter your Talabat integration credentials. You can get these from the{' '}
                          <a href="https://integration.talabat.com" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                            Talabat Partner Portal
                          </a>.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                              Vendor ID *
                            </label>
                            <input
                              style={inputStyle}
                              placeholder="e.g. TAL-12345"
                              value={connectForm.vendorId}
                              onChange={e => setConnectForm(prev => ({ ...prev, vendorId: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                              Client ID *
                            </label>
                            <input
                              style={inputStyle}
                              placeholder="OAuth client ID"
                              value={connectForm.clientId}
                              onChange={e => setConnectForm(prev => ({ ...prev, clientId: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                              Client Secret *
                            </label>
                            <input
                              style={inputStyle}
                              type="password"
                              placeholder="OAuth client secret"
                              value={connectForm.clientSecret}
                              onChange={e => setConnectForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                              Webhook Secret (optional)
                            </label>
                            <input
                              style={inputStyle}
                              placeholder="For signature verification"
                              value={connectForm.webhookSecret}
                              onChange={e => setConnectForm(prev => ({ ...prev, webhookSecret: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                          <button
                            style={btnStyle(platform.color, '#fff', connecting)}
                            onClick={handleConnect}
                            disabled={connecting}
                          >
                            {connecting ? 'Connecting...' : 'Connect'}
                          </button>
                          <button
                            style={btnStyle('#f3f4f6', '#374151', false)}
                            onClick={() => { setShowConnectForm(false); setConnectForm({ vendorId: '', clientId: '', clientSecret: '', webhookSecret: '' }); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Coming Soon Platforms */}
            {!platform.available && (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                Integration will be available soon. Contact support for early access.
              </p>
            )}
          </div>
        );
      })}

      {/* How It Works Section */}
      <div style={{ marginTop: 32, padding: 24, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#111827' }}>
          How Aggregator Integration Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { step: '1', title: 'Connect', desc: 'Enter your aggregator credentials to link your account' },
            { step: '2', title: 'Push Menu', desc: 'Sync your DineOpen menu to the delivery platform' },
            { step: '3', title: 'Receive Orders', desc: 'Orders appear in your KOT screen with platform badge' },
            { step: '4', title: 'Manage', desc: 'Accept, prepare, and complete orders — status syncs back automatically' },
          ].map(s => (
            <div key={s.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, margin: '0 auto 8px',
              }}>
                {s.step}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
