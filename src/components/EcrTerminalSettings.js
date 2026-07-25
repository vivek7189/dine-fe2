'use client';

import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { testConnectionWithSettings } from '../services/ecr/ecrService';
import { ECR_PORT_DEFAULT, ECR_INTEGRATION_METHODS, ECR_PROVIDERS } from '../services/ecr/ecrConstants';
import { isCapacitor, isElectron, isWeb, getPlatform } from '../utils/platform';
import {
  FaCreditCard,
  FaSave,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTimesCircle,
  FaNetworkWired,
  FaPlug,
  FaCloud,
  FaKey,
} from 'react-icons/fa';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#111827',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '80px',
  fontFamily: 'monospace',
  fontSize: '12px',
  resize: 'vertical',
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

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';

/**
 * Admin settings tab for ECR payment terminal configuration.
 * Supports NAPS Qatar (direct terminal) and Sadad Cloud (WiseCashier cloud mode).
 */
export default function EcrTerminalSettings({ restaurantId, selectedRestaurant }) {
  const [settings, setSettings] = useState({
    enabled: false,
    provider: ECR_PROVIDERS.NAPS_DIRECT,
    // NAPS fields
    terminalIp: '',
    port: ECR_PORT_DEFAULT,
    terminalId: '',
    merchantId: '',
    integrationMethod: ECR_INTEGRATION_METHODS.AUTO,
    // Sadad fields
    sadadApiUrl: 'https://open.sadadpos.com',
    sadadAppId: '',
    sadadAccessToken: '',
    sadadMerchantNo: '',
    sadadStoreNo: '',
    sadadTerminalSn: '',
    sadadPrivateKey: '',
    sadadPublicKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load ECR settings from restaurant document
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    setTestResult(null);
    setSaveMessage(null);
    (async () => {
      try {
        const data = await apiClient.get(`/api/restaurants/${restaurantId}`);
        const ecr = data?.ecrSettings || {};
        setSettings({
          enabled: !!ecr.enabled,
          provider: ecr.provider || ECR_PROVIDERS.NAPS_DIRECT,
          // NAPS
          terminalIp: ecr.terminalIp || '',
          port: ecr.port || ECR_PORT_DEFAULT,
          terminalId: ecr.terminalId || '',
          merchantId: ecr.merchantId || '',
          integrationMethod: ecr.integrationMethod || ECR_INTEGRATION_METHODS.AUTO,
          // Sadad
          sadadApiUrl: ecr.sadadApiUrl || 'https://open.sadadpos.com',
          sadadAppId: ecr.sadadAppId || '',
          sadadAccessToken: ecr.sadadAccessToken || '',
          sadadMerchantNo: ecr.sadadMerchantNo || '',
          sadadStoreNo: ecr.sadadStoreNo || '',
          sadadTerminalSn: ecr.sadadTerminalSn || '',
          sadadPrivateKey: ecr.sadadPrivateKey || '',
          sadadPublicKey: ecr.sadadPublicKey || '',
        });
      } catch (err) {
        console.error('Failed to load ECR settings:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await apiClient.put(`/api/restaurants/${restaurantId}`, {
        ecrSettings: { ...settings, restaurantId },
      });
      setSaveMessage({ type: 'success', text: 'ECR settings saved' });
    } catch (err) {
      console.error('Failed to save ECR settings:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (settings.provider === ECR_PROVIDERS.SADAD_CLOUD) {
        // Sadad Cloud: test via backend (verify keys/config)
        // Must save first so backend can load the config
        await apiClient.put(`/api/restaurants/${restaurantId}`, {
          ecrSettings: { ...settings, restaurantId },
        });
        const result = await apiClient.post('/api/sadad/test', { restaurantId });
        setTestResult(result);
      } else {
        // NAPS Direct
        if (!settings.terminalIp) {
          setTestResult({ success: false, message: 'Enter a terminal IP address first' });
          return;
        }
        if (isWeb()) {
          const result = await apiClient.post('/api/ecr/test', {
            terminalIp: settings.terminalIp,
            port: settings.port || ECR_PORT_DEFAULT,
          });
          setTestResult(result);
        } else {
          const result = await testConnectionWithSettings({ ...settings, restaurantId });
          setTestResult(result);
        }
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const update = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
    setTestResult(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p>Loading ECR settings...</p>
      </div>
    );
  }

  const platform = typeof window !== 'undefined' ? getPlatform() : 'web';
  const isSadad = settings.provider === ECR_PROVIDERS.SADAD_CLOUD;
  const isNaps = settings.provider === ECR_PROVIDERS.NAPS_DIRECT;
  const testDisabled = testing || (isNaps && !settings.terminalIp) || (isSadad && !settings.sadadMerchantNo);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCreditCard color="#6366f1" /> ECR Payment Terminal
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Configure card payment terminal integration for your POS.
          </p>
        </div>
      </div>

      {/* Platform info */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <FaNetworkWired size={14} />
        <span>
          Platform: <strong style={{ color: '#334155' }}>{platform}</strong>
          {isSadad && ' — Sadad Cloud works on all platforms via backend'}
          {isNaps && platform === 'electron' && ' — Direct terminal connection (best performance)'}
          {isNaps && platform === 'capacitor' && ' — App-to-App or network connection'}
          {isNaps && platform === 'web' && ' — Connection via backend proxy'}
        </span>
      </div>

      {/* Enable/Disable Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: settings.enabled ? '#f0fdf4' : '#f9fafb',
        borderRadius: '12px',
        marginBottom: '20px',
        border: settings.enabled ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
        cursor: 'pointer',
      }}
        onClick={() => update('enabled', !settings.enabled)}
      >
        <div>
          <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Enable ECR Terminal</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
            {settings.enabled
              ? 'Card (Terminal) payment method is available at checkout'
              : 'ECR terminal integration is disabled'}
          </div>
        </div>
        {settings.enabled
          ? <FaToggleOn size={28} color="#10b981" />
          : <FaToggleOff size={28} color="#d1d5db" />
        }
      </div>

      {/* Settings fields (only shown when enabled) */}
      {settings.enabled && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '20px',
          marginBottom: '20px',
        }}>
          {/* Provider Selector */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Payment Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => update('provider', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value={ECR_PROVIDERS.NAPS_DIRECT}>NAPS Qatar (Direct Terminal)</option>
              <option value={ECR_PROVIDERS.SADAD_CLOUD}>Sadad Cloud (WiseCashier)</option>
            </select>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
              {isNaps && 'Direct connection to NAPS terminal on local network.'}
              {isSadad && 'Cloud-routed via Sadad system to WiseCashier terminal.'}
            </p>
          </div>

          {/* ── NAPS Direct Fields ── */}
          {isNaps && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Terminal IP Address</label>
                  <input type="text" value={settings.terminalIp} onChange={(e) => update('terminalIp', e.target.value)} placeholder="e.g. 192.168.1.100" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Port</label>
                  <input type="number" value={settings.port} onChange={(e) => update('port', parseInt(e.target.value) || ECR_PORT_DEFAULT)} placeholder="8443" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Terminal ID (TID)</label>
                  <input type="text" value={settings.terminalId} onChange={(e) => update('terminalId', e.target.value)} placeholder="From terminal setup" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Merchant ID (MID)</label>
                  <input type="text" value={settings.merchantId} onChange={(e) => update('merchantId', e.target.value)} placeholder="From acquiring bank" style={inputStyle} />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Integration Method</label>
                <select value={settings.integrationMethod} onChange={(e) => update('integrationMethod', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value={ECR_INTEGRATION_METHODS.AUTO}>Auto (recommended)</option>
                  <option value={ECR_INTEGRATION_METHODS.NETWORK}>Network Only</option>
                  <option value={ECR_INTEGRATION_METHODS.APP_TO_APP}>App-to-App (Android only)</option>
                </select>
              </div>
            </>
          )}

          {/* ── Sadad Cloud Fields ── */}
          {isSadad && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Sadad API URL</label>
                  <select
                    value={settings.sadadApiUrl}
                    onChange={(e) => update('sadadApiUrl', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="https://open.sadadpos.com">Production — https://open.sadadpos.com</option>
                    <option value="https://open-uat.sadadpos.com">Sandbox / UAT — https://open-uat.sadadpos.com</option>
                  </select>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Use Sandbox / UAT for testing first.</p>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>App ID</label>
                  <input type="text" value={settings.sadadAppId} onChange={(e) => update('sadadAppId', e.target.value)} placeholder="e.g. wzaf502bde7e10f150" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Merchant No</label>
                  <input type="text" value={settings.sadadMerchantNo} onChange={(e) => update('sadadMerchantNo', e.target.value)} placeholder="e.g. 302400004438" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Store No</label>
                  <input type="text" value={settings.sadadStoreNo} onChange={(e) => update('sadadStoreNo', e.target.value)} placeholder="e.g. 4024000040" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Terminal SN</label>
                  <input type="text" value={settings.sadadTerminalSn} onChange={(e) => update('sadadTerminalSn', e.target.value)} placeholder="e.g. WPYB002602006535" style={inputStyle} />
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Serial number printed on the SADAD device / shown in WiseCashier.</p>
                </div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaKey size={11} /> App RSA Private Key (signs our requests)
                </label>
                <textarea
                  value={settings.sadadPrivateKey}
                  onChange={(e) => update('sadadPrivateKey', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  style={textareaStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                  The application (merchant) RSA private key from the Sadad portal — PKCS8 or PKCS1. Never share it.
                </p>
              </div>

              <div style={fieldGroupStyle}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaKey size={11} /> Sadad Gateway Public Key (verifies responses/webhooks)
                </label>
                <textarea
                  value={settings.sadadPublicKey}
                  onChange={(e) => update('sadadPublicKey', e.target.value)}
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  style={textareaStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                  Sadad&apos;s (gateway) RSA public key used to verify response and webhook signatures.
                </p>
              </div>

              {/* Webhook URL (read-only) */}
              <div style={fieldGroupStyle}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCloud size={11} /> Webhook URL (provide this to Sadad)
                </label>
                <input
                  type="text"
                  value={`${BACKEND_URL}/api/sadad/webhook`}
                  readOnly
                  style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280', cursor: 'text' }}
                  onClick={(e) => { e.target.select(); navigator.clipboard?.writeText(e.target.value); }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                  Click to copy. Sadad sends payment results to this URL.
                </p>
              </div>
            </>
          )}

          {/* Test Connection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #f3f4f6',
            marginTop: '4px',
          }}>
            <button
              onClick={handleTest}
              disabled={testDisabled}
              style={{
                padding: '10px 20px',
                background: testing ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: testing ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: testDisabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {testing
                ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing...</>
                : <><FaPlug size={12} /> Test {isSadad ? 'Configuration' : 'Connection'}</>
              }
            </button>

            {testResult && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: testResult.success ? '#10b981' : '#ef4444',
                fontWeight: 500,
              }}>
                {testResult.success
                  ? <><FaCheckCircle size={14} /> {testResult.message}</>
                  : <><FaTimesCircle size={14} /> {testResult.message}</>
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 28px',
            background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #10b981, #059669)',
            color: saving ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: saving ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          {saving
            ? <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
            : <><FaSave size={14} /> Save ECR Settings</>
          }
        </button>

        {saveMessage && (
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: saveMessage.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {saveMessage.type === 'success' ? <FaCheckCircle size={14} /> : <FaTimesCircle size={14} />}
            {saveMessage.text}
          </span>
        )}
      </div>
    </div>
  );
}
