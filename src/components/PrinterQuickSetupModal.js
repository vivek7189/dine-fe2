'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPrint, FaTimes, FaSpinner, FaSave, FaCheckCircle, FaReceipt, FaBell, FaEye, FaEdit, FaTicketAlt, FaClock, FaGlobe, FaDesktop, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import apiClient from '../lib/api';
import dynamic from 'next/dynamic';

const NativePrinterSettings = dynamic(() => import('./NativePrinterSettings'), { ssr: false });

// Check platform
const getIsWeb = () => typeof window !== 'undefined' && !window.electronAPI && !window.__TAURI__ && !window.Capacitor;
const getIsNative = () => typeof window !== 'undefined' && (!!window.electronAPI || !!window.__TAURI__ || !!window.Capacitor);

// ─── Toggle Row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ title, description, icon, enabled, onToggle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', backgroundColor: '#faf5f7', borderRadius: '10px',
    border: '1px solid #f1f5f9',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: enabled ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: enabled ? 'white' : '#6b7280', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '12px' }}>{title}</div>
        <div style={{ color: '#6b7280', fontSize: '11px', lineHeight: '1.3' }}>{description}</div>
      </div>
    </div>
    <div
      onClick={onToggle}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        backgroundColor: enabled ? '#ef4444' : '#d1d5db',
        position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
        flexShrink: 0, marginLeft: '10px',
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        backgroundColor: 'white', position: 'absolute', top: '2px',
        left: enabled ? '20px' : '2px', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrinterQuickSetupModal({ isOpen, onClose, restaurantId, onSettingsChanged }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [dirty, setDirty] = useState(false);

  const isWeb = getIsWeb();
  const isNative = getIsNative();

  // Load settings
  useEffect(() => {
    if (!isOpen || !restaurantId) return;
    setLoading(true);
    apiClient.getPrintSettings(restaurantId)
      .then(res => {
        if (res.success) setSettings(res.printSettings || {});
      })
      .catch(err => console.error('Failed to load print settings:', err))
      .finally(() => setLoading(false));
  }, [isOpen, restaurantId]);

  const toggleSetting = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!restaurantId || !settings) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const { _previewTab, _uiBillExpanded, _uiKotExpanded, ...settingsToSave } = settings;
      const response = await apiClient.updatePrintSettings(restaurantId, settingsToSave);
      if (response.success) {
        setSaveMsg({ type: 'success', text: 'Saved!' });
        setDirty(false);
        onSettingsChanged && onSettingsChanged(settings);
        setTimeout(() => setSaveMsg(null), 2000);
      }
    } catch (err) {
      console.error('Failed to save print settings:', err);
      setSaveMsg({ type: 'error', text: 'Failed to save' });
      setTimeout(() => setSaveMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10003, padding: '16px', backdropFilter: 'blur(4px)',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: '560px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          padding: '12px 18px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPrint size={14} color="rgba(255,255,255,0.9)" />
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: 0 }}>
                Printer Setup
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {dirty && (
                <button onClick={handleSave} disabled={saving} style={{
                  background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
                  fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {saving ? <FaSpinner className="animate-spin" size={10} /> : <FaSave size={10} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
              <button onClick={onClose} style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                cursor: 'pointer', padding: '5px', borderRadius: '6px', width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaTimes size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: '#9ca3af' }}>
              <FaSpinner className="animate-spin" size={16} />
              <span style={{ fontSize: '13px' }}>Loading settings...</span>
            </div>
          ) : settings ? (
            <div>
              {/* Save notification */}
              {saveMsg && (
                <div style={{
                  padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px',
                  fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: saveMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: saveMsg.type === 'success' ? '#166534' : '#dc2626',
                  border: `1px solid ${saveMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  <FaCheckCircle size={12} />
                  {saveMsg.text}
                </div>
              )}

              {/* ── Native Printer Connection (Electron/Capacitor/Tauri) ── */}
              {isNative && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaDesktop size={13} style={{ color: '#16a34a' }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Printer Connection
                      </span>
                    </div>
                    <NativePrinterSettings restaurantId={restaurantId} />
                  </div>
                </div>
              )}

              {/* ── Native Auto-Print Toggles ── */}
              {isNative && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Auto-Print (Silent)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <ToggleRow title="Print KOT on Place Order" description="Auto-print KOT slip on Place Order" icon={<FaPrint size={14} />} enabled={settings.autoPrintOnPlaceOrder} onToggle={() => toggleSetting('autoPrintOnPlaceOrder')} />
                    <ToggleRow title="Print KOT on KOT & Print" description="Auto-print KOT slip on KOT & Print" icon={<FaPrint size={14} />} enabled={settings.autoPrintOnKOTAndPrint} onToggle={() => toggleSetting('autoPrintOnKOTAndPrint')} />
                    <ToggleRow title="Print Bill on Complete Billing" description="Auto-print bill on Complete Billing" icon={<FaReceipt size={14} />} enabled={settings.autoPrintOnCompleteBilling} onToggle={() => toggleSetting('autoPrintOnCompleteBilling')} />
                    <ToggleRow title="Print Bill on Bill & Print" description="Auto-print bill on Bill & Print" icon={<FaReceipt size={14} />} enabled={settings.autoPrintOnBillAndPrint} onToggle={() => toggleSetting('autoPrintOnBillAndPrint')} />
                  </div>
                </div>
              )}

              {/* ── Web KOT Printer App ── */}
              {isWeb && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    padding: '14px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FaGlobe size={13} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Auto-Print via KOT Printer App
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#1e40af', margin: '0 0 10px 0' }}>
                      Requires dine-kot-printer desktop app running on the same network.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <ToggleRow title="KOT Printer App" description="Enable automatic printing via desktop app" icon={<FaPrint size={14} />} enabled={settings.kotPrinterEnabled} onToggle={() => toggleSetting('kotPrinterEnabled')} />
                      <ToggleRow title="Auto-Print on KOT" description="Print when order is sent to kitchen" icon={<FaPrint size={14} />} enabled={settings.autoPrintOnKOT} onToggle={() => toggleSetting('autoPrintOnKOT')} />
                      <ToggleRow title="Auto-Print on Billing" description="Print bill when billing is completed" icon={<FaReceipt size={14} />} enabled={settings.autoPrintOnBilling} onToggle={() => toggleSetting('autoPrintOnBilling')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Remote Print ── */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Remote Print
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ToggleRow title="Real-time Print Events" description="Send print events so desktop/KOT app can auto-print" icon={<FaClock size={14} />} enabled={settings.usePusherForKOT} onToggle={() => toggleSetting('usePusherForKOT')} />
                </div>
              </div>

              {/* ── Button Settings ── */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Button Settings
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ToggleRow title="KOT & Print Button" description="Show combined button to send KOT and print slip" icon={<FaPrint size={14} />} enabled={settings.enableKOTAndPrint} onToggle={() => toggleSetting('enableKOTAndPrint')} />
                  <ToggleRow title="Bill & Print Button" description="Show combined button to complete billing and print" icon={<FaReceipt size={14} />} enabled={settings.enableSaveAndPrint} onToggle={() => toggleSetting('enableSaveAndPrint')} />
                  <ToggleRow title="Update Without KOT" description="Allow saving changes without sending to kitchen" icon={<FaEdit size={14} />} enabled={settings.enableUpdateWithoutKOT} onToggle={() => toggleSetting('enableUpdateWithoutKOT')} />
                </div>
              </div>

              {/* ── Display Settings ── */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Display Settings
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ToggleRow title="Show Success Notifications" description="Show order/billing success messages on dashboard" icon={<FaBell size={14} />} enabled={settings.showSuccessNotifications} onToggle={() => toggleSetting('showSuccessNotifications')} />
                  <ToggleRow title="KOT Summary After Order" description="Show order summary after placing order" icon={<FaEye size={14} />} enabled={settings.showKOTSummaryAfterOrder} onToggle={() => toggleSetting('showKOTSummaryAfterOrder')} />
                  <ToggleRow title="Bill Summary After Billing" description="Show bill summary after billing" icon={<FaEye size={14} />} enabled={settings.showBillSummaryAfterBilling} onToggle={() => toggleSetting('showBillSummaryAfterBilling')} />
                </div>
              </div>

              {/* ── Link to Full Settings ── */}
              <Link href="/admin?tab=print" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb',
                color: '#6b7280', fontSize: '12px', fontWeight: '500',
                textDecoration: 'none', transition: 'all 0.15s',
                backgroundColor: '#f9fafb',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <FaExternalLinkAlt size={10} />
                Advanced Print Settings (Receipt Layout, Logo, KOT Exclusion)
              </Link>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              Failed to load settings
            </div>
          )}
        </div>

        {/* Footer with Save */}
        {dirty && settings && (
          <div style={{
            padding: '12px 18px', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0,
          }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', backgroundColor: 'white', color: '#6b7280',
              fontSize: '12px', fontWeight: '500', border: '1px solid #e5e7eb',
              borderRadius: '8px', cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '8px 16px',
              background: saving ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', fontSize: '12px', fontWeight: '600', border: 'none',
              borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}>
              {saving ? <FaSpinner className="animate-spin" size={10} /> : <FaSave size={10} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
