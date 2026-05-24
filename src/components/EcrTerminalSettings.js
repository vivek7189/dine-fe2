'use client';

import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { testConnectionWithSettings } from '../services/ecr/ecrService';
import { ECR_PORT_DEFAULT, ECR_INTEGRATION_METHODS } from '../services/ecr/ecrConstants';
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

/**
 * Admin settings tab for ECR (Electronic Cash Register) payment terminal configuration.
 * Allows merchants to configure NAPS Qatar terminal IP, port, TID, MID and test connectivity.
 */
export default function EcrTerminalSettings({ restaurantId, selectedRestaurant }) {
  const [settings, setSettings] = useState({
    enabled: false,
    terminalIp: '',
    port: ECR_PORT_DEFAULT,
    terminalId: '',
    merchantId: '',
    integrationMethod: ECR_INTEGRATION_METHODS.AUTO,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success, message }
  const [saveMessage, setSaveMessage] = useState(null); // { type: 'success'|'error', text }

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
          terminalIp: ecr.terminalIp || '',
          port: ecr.port || ECR_PORT_DEFAULT,
          terminalId: ecr.terminalId || '',
          merchantId: ecr.merchantId || '',
          integrationMethod: ecr.integrationMethod || ECR_INTEGRATION_METHODS.AUTO,
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
      setSaveMessage({ type: 'success', text: 'ECR terminal settings saved' });
    } catch (err) {
      console.error('Failed to save ECR settings:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.terminalIp) {
      setTestResult({ success: false, message: 'Enter a terminal IP address first' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // For web platform, test via backend proxy. For Electron/Capacitor, test directly.
      if (isWeb()) {
        const result = await apiClient.post('/api/ecr/test', {
          terminalIp: settings.terminalIp,
          port: settings.port || ECR_PORT_DEFAULT,
        });
        setTestResult(result);
      } else {
        const result = await testConnectionWithSettings({
          ...settings,
          restaurantId,
        });
        setTestResult(result);
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCreditCard color="#6366f1" /> ECR Payment Terminal
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Configure NAPS Qatar payment terminal for card payments. The terminal must be on the same local network.
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
          {platform === 'electron' && ' — Direct terminal connection (best performance)'}
          {platform === 'capacitor' && ' — App-to-App or network connection'}
          {platform === 'web' && ' — Connection via backend proxy'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Terminal IP */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Terminal IP Address</label>
              <input
                type="text"
                value={settings.terminalIp}
                onChange={(e) => update('terminalIp', e.target.value)}
                placeholder="e.g. 192.168.1.100"
                style={inputStyle}
              />
            </div>

            {/* Port */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Port</label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => update('port', parseInt(e.target.value) || ECR_PORT_DEFAULT)}
                placeholder="8443"
                style={inputStyle}
              />
            </div>

            {/* Terminal ID (TID) */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Terminal ID (TID)</label>
              <input
                type="text"
                value={settings.terminalId}
                onChange={(e) => update('terminalId', e.target.value)}
                placeholder="From terminal setup"
                style={inputStyle}
              />
            </div>

            {/* Merchant ID (MID) */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Merchant ID (MID)</label>
              <input
                type="text"
                value={settings.merchantId}
                onChange={(e) => update('merchantId', e.target.value)}
                placeholder="From acquiring bank"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Integration Method */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Integration Method</label>
            <select
              value={settings.integrationMethod}
              onChange={(e) => update('integrationMethod', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value={ECR_INTEGRATION_METHODS.AUTO}>Auto (recommended)</option>
              <option value={ECR_INTEGRATION_METHODS.NETWORK}>Network Only</option>
              <option value={ECR_INTEGRATION_METHODS.APP_TO_APP}>App-to-App (Android only)</option>
            </select>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
              Auto: Uses App-to-App on Android if available, network otherwise. Network Only: Always uses HTTP API. App-to-App: Android Intent to NAPS app.
            </p>
          </div>

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
              disabled={testing || !settings.terminalIp}
              style={{
                padding: '10px 20px',
                background: testing ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: testing ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: testing || !settings.terminalIp ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {testing
                ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing...</>
                : <><FaPlug size={12} /> Test Connection</>
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
