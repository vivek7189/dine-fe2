'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMobileAlt,
  FaQrcode,
  FaGift,
  FaCog,
  FaSave,
  FaDownload,
  FaCopy,
  FaCheck,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';

const CustomerAppSettings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const [settings, setSettings] = useState({
    enabled: false,
    restaurantCode: '',
    allowDineIn: true,
    allowTakeaway: true,
    allowDelivery: false,
    requireTableSelection: false,
    minimumOrder: 0,
    loyaltySettings: {
      enabled: false,
      pointsPerRupee: 1,
      redemptionRate: 100,
      maxRedemptionPercent: 20,
    },
    branding: {
      primaryColor: '#ef4444',
      logoUrl: '',
    },
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('selectedRestaurantId');
    if (id) {
      setRestaurantId(id);
      loadSettings(id);
    } else {
      router.push('/admin');
    }
  }, [router]);

  const loadSettings = async (id) => {
    try {
      const response = await apiClient.get(`/api/restaurants/${id}/customer-app-settings`);
      if (response.settings) {
        setSettings(prev => ({
          ...prev,
          ...response.settings,
          restaurantCode: response.restaurantCode || prev.restaurantCode
        }));
      }
      if (response.restaurantCode) {
        setSettings(prev => ({ ...prev, restaurantCode: response.restaurantCode }));
      }
      // Try to load QR code
      try {
        const qrResponse = await apiClient.get(`/api/restaurants/${id}/qr-code`);
        if (qrResponse.qrCode) {
          setQrCodeUrl(qrResponse.qrCode);
        }
      } catch (qrErr) {
        console.log('No QR code yet');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/api/restaurants/${restaurantId}/customer-app-settings`, settings);
      // Update restaurant code if changed
      if (settings.restaurantCode) {
        await apiClient.patch(`/api/restaurants/${restaurantId}`, {
          restaurantCode: settings.restaurantCode.toUpperCase()
        });
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await apiClient.get(`/api/restaurants/${restaurantId}/qr-code`);
      if (response.qrCode) {
        setQrCodeUrl(response.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Failed to generate QR code');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(settings.restaurantCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `crave-qr-${settings.restaurantCode}.png`;
      link.click();
    }
  };

  const Toggle = ({ value, onChange, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {value ? (
          <FaToggleOn size={28} color="#10b981" />
        ) : (
          <FaToggleOff size={28} color="#9ca3af" />
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef7f0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fef7f0', padding: isMobile ? '16px' : '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaMobileAlt color="#ec4899" size={isMobile ? 24 : 28} />
            Customer App (Crave)
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Configure your restaurant&apos;s customer ordering app settings
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
          {/* Main Settings */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #fce7f3'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCog color="#ec4899" />
              General Settings
            </h2>

            <Toggle
              value={settings.enabled}
              onChange={(v) => setSettings(prev => ({ ...prev, enabled: v }))}
              label="Enable Customer App"
            />

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Restaurant Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={settings.restaurantCode}
                  onChange={(e) => setSettings(prev => ({ ...prev, restaurantCode: e.target.value.toUpperCase() }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                  }}
                  placeholder="RESTO123"
                  maxLength={10}
                />
                <button
                  onClick={copyCode}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: copied ? '#10b981' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <FaCheck color="white" /> : <FaCopy color="#6b7280" />}
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Customers can use this code to find your restaurant in the Crave app
              </p>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '24px 0 12px' }}>Order Types</h3>
            <Toggle
              value={settings.allowDineIn}
              onChange={(v) => setSettings(prev => ({ ...prev, allowDineIn: v }))}
              label="Allow Dine-In Orders"
            />
            <Toggle
              value={settings.allowTakeaway}
              onChange={(v) => setSettings(prev => ({ ...prev, allowTakeaway: v }))}
              label="Allow Takeaway Orders"
            />
            <Toggle
              value={settings.allowDelivery}
              onChange={(v) => setSettings(prev => ({ ...prev, allowDelivery: v }))}
              label="Allow Delivery Orders"
            />
            <Toggle
              value={settings.requireTableSelection}
              onChange={(v) => setSettings(prev => ({ ...prev, requireTableSelection: v }))}
              label="Require Table Selection (Dine-In)"
            />

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Minimum Order Amount (Rs.)
              </label>
              <input
                type="number"
                value={settings.minimumOrder}
                onChange={(e) => setSettings(prev => ({ ...prev, minimumOrder: parseInt(e.target.value) || 0 }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                min={0}
              />
            </div>
          </div>

          {/* QR Code & Loyalty */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* QR Code */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #fce7f3',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaQrcode color="#ec4899" />
                QR Code
              </h2>

              {qrCodeUrl ? (
                <div>
                  <img src={qrCodeUrl} alt="Restaurant QR Code" style={{ width: '200px', height: '200px', margin: '0 auto 16px' }} />
                  <button
                    onClick={downloadQR}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#ec4899',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaDownload />
                    Download QR Code
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaQrcode size={60} color="#9ca3af" />
                  </div>
                  <button
                    onClick={handleGenerateQR}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#ec4899',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Generate QR Code
                  </button>
                </div>
              )}
              <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Print this QR code and place it at tables or entrance
              </p>
            </div>

            {/* Loyalty Settings */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #fce7f3'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaGift color="#ec4899" />
                Loyalty Program
              </h2>

              <Toggle
                value={settings.loyaltySettings.enabled}
                onChange={(v) => setSettings(prev => ({
                  ...prev,
                  loyaltySettings: { ...prev.loyaltySettings, enabled: v }
                }))}
                label="Enable Loyalty Points"
              />

              {settings.loyaltySettings.enabled && (
                <>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Points per Rs. 1 spent
                    </label>
                    <input
                      type="number"
                      value={settings.loyaltySettings.pointsPerRupee}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        loyaltySettings: { ...prev.loyaltySettings, pointsPerRupee: parseInt(e.target.value) || 1 }
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      min={1}
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Points needed for Rs. 1 redemption
                    </label>
                    <input
                      type="number"
                      value={settings.loyaltySettings.redemptionRate}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        loyaltySettings: { ...prev.loyaltySettings, redemptionRate: parseInt(e.target.value) || 100 }
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      min={1}
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Max redemption % per order
                    </label>
                    <input
                      type="number"
                      value={settings.loyaltySettings.maxRedemptionPercent}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        loyaltySettings: { ...prev.loyaltySettings, maxRedemptionPercent: parseInt(e.target.value) || 20 }
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      min={1}
                      max={100}
                    />
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#92400e'
                  }}>
                    <strong>Example:</strong> Customer spends Rs. 1000, earns {1000 * settings.loyaltySettings.pointsPerRupee} points.
                    With {settings.loyaltySettings.redemptionRate * 100} points, they can redeem Rs. 100 (max {settings.loyaltySettings.maxRedemptionPercent}% of order).
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '14px 32px',
              backgroundColor: saving ? '#9ca3af' : '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAppSettings;
