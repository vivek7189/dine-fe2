'use client';

/**
 * TerminalsTab — Admin panel for LAN Hub & Terminal management
 *
 * Shown only on Electron. Allows admin to:
 * - Enable/disable hub mode
 * - View pairing code + QR code
 * - See all paired terminals with status
 * - Rename, change role, remove terminals
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { isElectron } from '../../utils/platform';
import {
  FaNetworkWired,
  FaDesktop,
  FaMobileAlt,
  FaQrcode,
  FaCopy,
  FaSync,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCircle,
  FaPlug,
  FaPowerOff,
} from 'react-icons/fa';

const ROLE_OPTIONS = [
  { value: 'counter', label: 'Counter' },
  { value: 'kitchen-display', label: 'Kitchen Display' },
  { value: 'waiter-device', label: 'Waiter Device' },
  { value: 'manager', label: 'Manager' },
];

export default function TerminalsTab({ restaurantId }) {
  const [isHubMode, setIsHubMode] = useState(false);
  const [hubInfo, setHubInfo] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [terminals, setTerminals] = useState([]);
  const [terminalConfig, setTerminalConfig] = useState(null);
  const [terminalId, setTerminalId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const pollRef = useRef(null);

  const electronAvailable = isElectron();
  const api = (typeof window !== 'undefined' && electronAvailable) ? window.electronAPI?.lanHub : null;

  const refresh = useCallback(async () => {
    if (!api) return;
    try {
      const [info, config, tid, hubFlag] = await Promise.all([
        api.getHubInfo(),
        api.getTerminalConfig(),
        api.getTerminalId(),
        api.isHub(),
      ]);

      setHubInfo(info);
      setTerminalConfig(config);
      setTerminalId(tid);
      setIsHubMode(hubFlag || info?.isRunning);

      if (info?.isRunning) {
        const code = await api.getPairingCode();
        setPairingCode(code);
        const qr = await api.getHubQrData();
        setQrData(qr);
        const terms = await api.getConnectedTerminals();
        setTerminals(terms || []);
      }
    } catch (e) {
      console.error('Terminal refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!electronAvailable) return;
    refresh();
    pollRef.current = setInterval(refresh, 5000);
    return () => clearInterval(pollRef.current);
  }, [refresh, electronAvailable]);

  // Not available in browser
  if (!electronAvailable) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <FaNetworkWired size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h3 style={{ margin: '0 0 8px', fontSize: '17px', color: '#374151' }}>Terminal Management</h3>
        <p style={{ fontSize: '14px' }}>
          Terminal and LAN hub management is only available on the desktop POS app.
        </p>
      </div>
    );
  }

  const handleStartHub = async () => {
    try {
      await api.startHub(3847);
      await refresh();
    } catch (e) {
      console.error('Start hub error:', e);
    }
  };

  const handleStopHub = async () => {
    try {
      await api.stopHub();
      setIsHubMode(false);
      setTerminals([]);
      setPairingCode(null);
      setQrData(null);
      await refresh();
    } catch (e) {
      console.error('Stop hub error:', e);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      await api.regeneratePairingCode();
      const code = await api.getPairingCode();
      setPairingCode(code);
      const qr = await api.getHubQrData();
      setQrData(qr);
    } catch (e) {
      console.error('Regenerate code error:', e);
    }
  };

  const handleCopyCode = () => {
    if (pairingCode?.code) {
      navigator.clipboard.writeText(pairingCode.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleRemoveTerminal = async (tid) => {
    // Remove via hub REST API (hub.js handles this)
    try {
      const info = hubInfo;
      if (info?.port) {
        await fetch(`http://localhost:${info.port}/hub/terminals/${tid}`, { method: 'DELETE' });
        await refresh();
      }
    } catch (e) {
      console.error('Remove terminal error:', e);
    }
  };

  const handleSaveEdit = async (tid) => {
    try {
      const info = hubInfo;
      if (info?.port) {
        await fetch(`http://localhost:${info.port}/hub/terminals/${tid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName, role: editRole }),
        });
        setEditingId(null);
        await refresh();
      }
    } catch (e) {
      console.error('Save edit error:', e);
    }
  };

  const codeExpiresIn = pairingCode
    ? Math.max(0, Math.floor((pairingCode.expiresAt - Date.now()) / 1000))
    : 0;

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
        Loading terminal info...
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* This Terminal Info */}
      <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <FaDesktop style={{ color: '#6366f1' }} />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>This Terminal</h4>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.8 }}>
          <div><strong>Terminal ID:</strong> {terminalId ? terminalId.slice(0, 8) + '...' : 'N/A'}</div>
          <div><strong>Role:</strong> {isHubMode ? 'Hub (Primary)' : terminalConfig?.role || 'Not configured'}</div>
          {terminalConfig?.restaurantName && (
            <div><strong>Restaurant:</strong> {terminalConfig.restaurantName}</div>
          )}
          {terminalConfig?.pairedAt && !isHubMode && (
            <div><strong>Paired:</strong> {new Date(terminalConfig.pairedAt).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* Hub Mode Toggle */}
      <div style={{ marginBottom: '24px', padding: '20px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              <FaNetworkWired style={{ marginRight: '8px', color: '#6366f1' }} />
              LAN Hub Mode
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              Enable to let other terminals and waiter devices connect to this terminal
            </p>
          </div>
          <button
            onClick={isHubMode ? handleStopHub : handleStartHub}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isHubMode ? '#dc2626' : '#6366f1',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isHubMode ? <><FaPowerOff /> Stop Hub</> : <><FaPlug /> Start Hub</>}
          </button>
        </div>

        {isHubMode && hubInfo?.isRunning && (
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
            <FaCircle size={8} style={{ marginRight: '6px' }} />
            Hub running on port {hubInfo.port} &middot; {terminals.length} terminal(s) paired
          </div>
        )}
      </div>

      {/* Pairing Code + QR (only when hub is running) */}
      {isHubMode && hubInfo?.isRunning && (
        <div style={{ marginBottom: '24px', padding: '20px', background: '#fefce8', borderRadius: '14px', border: '1px solid #fef08a' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#854d0e' }}>
            <FaQrcode style={{ marginRight: '8px' }} />
            Pairing Code
          </h4>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Code display */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px', fontWeight: 800, letterSpacing: '8px', color: '#1e293b',
                fontFamily: 'monospace', padding: '12px 24px', background: '#fff',
                borderRadius: '12px', border: '2px dashed #d1d5db',
              }}>
                {pairingCode?.code || '------'}
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                Expires in {Math.floor(codeExpiresIn / 60)}:{String(codeExpiresIn % 60).padStart(2, '0')}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={handleCopyCode}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db',
                    background: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', color: '#374151',
                  }}
                >
                  {codeCopied ? <><FaCheck size={10} /> Copied</> : <><FaCopy size={10} /> Copy</>}
                </button>
                <button
                  onClick={handleRegenerateCode}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db',
                    background: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', color: '#374151',
                  }}
                >
                  <FaSync size={10} /> New Code
                </button>
              </div>
            </div>

            {/* QR code area */}
            {qrData && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '140px', height: '140px', background: '#fff', borderRadius: '12px',
                  border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', color: '#9ca3af', padding: '8px',
                  wordBreak: 'break-all',
                }}>
                  {/* QR code would be rendered here with a library like qrcode or react-qr-code */}
                  <div style={{ textAlign: 'center' }}>
                    <FaQrcode size={40} style={{ color: '#d1d5db', marginBottom: '4px' }} />
                    <div>Scan with dine-app</div>
                  </div>
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#9ca3af' }}>
                  QR for waiter devices
                </div>
              </div>
            )}

            {/* Instructions */}
            <div style={{ fontSize: '12px', color: '#78716c', lineHeight: 1.8, maxWidth: '260px' }}>
              <div><strong>To add a desktop terminal:</strong></div>
              <div>1. Open the POS app on the new device</div>
              <div>2. It will auto-discover this hub</div>
              <div>3. Enter the 6-digit code above</div>
              <div style={{ marginTop: '8px' }}><strong>To add a waiter device:</strong></div>
              <div>1. Open dine-app &rarr; Join Restaurant LAN</div>
              <div>2. Scan the QR code or enter code manually</div>
            </div>
          </div>
        </div>
      )}

      {/* Paired Terminals List */}
      {isHubMode && (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Paired Terminals ({terminals.length})
          </h4>

          {terminals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              No terminals paired yet. Share the pairing code to connect devices.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {terminals.map((t) => (
                <div
                  key={t.terminalId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: '#f8fafc', borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {/* Icon */}
                  <div style={{ color: t.online ? '#16a34a' : '#9ca3af' }}>
                    {t.deviceType === 'react-native' ? <FaMobileAlt size={18} /> : <FaDesktop size={18} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    {editingId === t.terminalId ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
                            fontSize: '13px', width: '140px',
                          }}
                        />
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
                            fontSize: '12px',
                          }}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <button onClick={() => handleSaveEdit(t.terminalId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}>
                          <FaCheck />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          {t.name || 'Unnamed Terminal'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {ROLE_OPTIONS.find((r) => r.value === t.role)?.label || t.role}
                          {' '}&middot;{' '}
                          {t.deviceType === 'react-native' ? 'Mobile' : 'Desktop'}
                          {t.lastSeen && ` \u00b7 Last seen ${new Date(t.lastSeen).toLocaleTimeString()}`}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status dot */}
                  <FaCircle size={8} style={{ color: t.online ? '#16a34a' : '#d1d5db' }} />

                  {/* Actions */}
                  {editingId !== t.terminalId && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setEditingId(t.terminalId); setEditName(t.name || ''); setEditRole(t.role || 'counter'); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                        title="Edit"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => handleRemoveTerminal(t.terminalId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                        title="Remove"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client terminal info (when not hub) */}
      {!isHubMode && terminalConfig?.pairedAt && (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Hub Connection
          </h4>
          <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.8 }}>
            <div><strong>Connected to:</strong> {terminalConfig.hubHost}:{terminalConfig.hubPort}</div>
            <div><strong>Restaurant:</strong> {terminalConfig.restaurantName || terminalConfig.restaurantId}</div>
            <div><strong>Paired:</strong> {new Date(terminalConfig.pairedAt).toLocaleString()}</div>
          </div>
          <button
            onClick={async () => {
              await api.unpair();
              setTerminalConfig(null);
            }}
            style={{
              marginTop: '12px', padding: '8px 16px', borderRadius: '8px',
              border: '1px solid #dc2626', background: '#fff', color: '#dc2626',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Unpair from Hub
          </button>
        </div>
      )}
    </div>
  );
}
