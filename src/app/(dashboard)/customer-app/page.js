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
  FaSync,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';

const CustomerAppSettings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
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
      tagline: '',
      headerStyle: 'modern', // 'modern', 'gradient', 'solid'
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
        // Extract restaurant code from settings
        const restaurantCode = response.settings.restaurantCode || '';
        setSettings(prev => ({
          ...prev,
          ...response.settings,
          restaurantCode: restaurantCode || prev.restaurantCode
        }));
        
        // If restaurant code exists, try to load QR code
        if (restaurantCode) {
          try {
            const qrResponse = await apiClient.get(`/api/restaurants/${id}/qr-code`);
            if (qrResponse.qrCode) {
              setQrCodeUrl(qrResponse.qrCode);
            }
          } catch (qrErr) {
            console.log('No QR code yet, but restaurant code exists');
          }
        }
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
      // Ensure restaurant code is linked to restaurant ID
      if (settings.restaurantCode) {
        await apiClient.patch(`/api/restaurants/${restaurantId}`, {
          restaurantCode: settings.restaurantCode.toUpperCase()
        });
      }
      
      // Save customer app settings
      await apiClient.put(`/api/restaurants/${restaurantId}/customer-app-settings`, settings);
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async () => {
    // Prevent multiple generations
    if (qrCodeUrl) {
      alert('QR code already exists. Please download the existing QR code.');
      return;
    }

    if (!settings.restaurantCode) {
      alert('Please generate a restaurant code first');
      return;
    }

    try {
      // GET endpoint auto-generates QR if code exists
      const response = await apiClient.get(`/api/restaurants/${restaurantId}/qr-code`);
      if (response.qrCode) {
        setQrCodeUrl(response.qrCode);
        alert('QR code generated successfully!');
      } else {
        alert('Failed to generate QR code. Please ensure restaurant code is saved.');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      if (error.message && error.message.includes('Restaurant code not set')) {
        alert('Please save the restaurant code first, then generate QR code.');
      } else {
        alert('Failed to generate QR code');
      }
    }
  };

  const generateCode = async () => {
    // Prevent multiple generations
    if (settings.restaurantCode) {
      alert('Restaurant code already exists. Please use the existing code.');
      return;
    }

    try {
      setGeneratingCode(true);
      const response = await apiClient.generateRestaurantCode(restaurantId);
      if (response.restaurantCode) {
        const newCode = response.restaurantCode;
        setSettings(prev => ({ ...prev, restaurantCode: newCode }));
        
        // Immediately save the code to restaurant
        try {
          await apiClient.patch(`/api/restaurants/${restaurantId}`, {
            restaurantCode: newCode.toUpperCase()
          });
          
          // Auto-generate QR code after code is saved
          try {
            const qrResponse = await apiClient.get(`/api/restaurants/${restaurantId}/qr-code`);
            if (qrResponse.qrCode) {
              setQrCodeUrl(qrResponse.qrCode);
            }
          } catch (qrErr) {
            console.log('QR code will be available after settings are saved');
          }
          
          alert('Restaurant code generated and saved successfully!');
        } catch (saveErr) {
          console.error('Error saving restaurant code:', saveErr);
          alert('Code generated but failed to save. Please save settings manually.');
        }
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (!settings.restaurantCode) return;
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
                  onClick={generateCode}
                  disabled={generatingCode || !!settings.restaurantCode}
                  title={settings.restaurantCode ? "Code already generated" : "Generate Code"}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: generatingCode || settings.restaurantCode ? '#d1d5db' : '#ec4899',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generatingCode || settings.restaurantCode ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '12px',
                    opacity: settings.restaurantCode ? 0.6 : 1
                  }}
                >
                  <FaSync size={12} style={{ animation: generatingCode ? 'spin 1s linear infinite' : 'none' }} />
                  {generatingCode ? 'Generating...' : settings.restaurantCode ? 'Generated' : 'Generate'}
                </button>
                <button
                  onClick={copyCode}
                  disabled={!settings.restaurantCode}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: copied ? '#10b981' : settings.restaurantCode ? '#f3f4f6' : '#e5e7eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: settings.restaurantCode ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: settings.restaurantCode ? 1 : 0.5
                  }}
                >
                  {copied ? <FaCheck color="white" /> : <FaCopy color="#6b7280" />}
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {settings.restaurantCode
                  ? 'Customers can use this code to find your restaurant in the Crave app'
                  : 'Click "Generate" to create a unique 6-character code for your restaurant'}
              </p>
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
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
                    disabled={!!qrCodeUrl || !settings.restaurantCode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: qrCodeUrl || !settings.restaurantCode ? '#d1d5db' : '#ec4899',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: qrCodeUrl || !settings.restaurantCode ? 'not-allowed' : 'pointer',
                      opacity: qrCodeUrl || !settings.restaurantCode ? 0.6 : 1
                    }}
                  >
                    {qrCodeUrl ? 'QR Code Generated' : !settings.restaurantCode ? 'Generate Code First' : 'Generate QR Code'}
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

        {/* Branding Section - Full Width */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🎨</span>
            Header Branding
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '-12px 0 20px' }}>
            Customize how your restaurant appears on the online ordering page
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            {/* Left Column - Basic Settings */}
            <div>
              {/* Logo URL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Restaurant Logo URL
                </label>
                <input
                  type="url"
                  value={settings.branding.logoUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, logoUrl: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://example.com/logo.png"
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                  Recommended: Square image, 200x200px or larger
                </p>
              </div>

              {/* Tagline */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={settings.branding.tagline || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, tagline: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Authentic Indian Cuisine"
                  maxLength={50}
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                  Shown below your restaurant name (max 50 characters)
                </p>
              </div>

              {/* Primary Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Brand Color
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                    style={{
                      width: '60px',
                      height: '44px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  />
                  <input
                    type="text"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase'
                    }}
                    placeholder="#ef4444"
                    maxLength={7}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#1f2937'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, primaryColor: color }
                      }))}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: color,
                        border: settings.branding.primaryColor === color ? '3px solid #1f2937' : '2px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Header Style */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Header Style
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'modern', label: 'Modern', desc: 'White background with colored accents' },
                    { value: 'gradient', label: 'Gradient', desc: 'Gradient background using brand color' },
                    { value: 'solid', label: 'Solid', desc: 'Solid brand color background' }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, headerStyle: style.value }
                      }))}
                      style={{
                        flex: 1,
                        minWidth: '100px',
                        padding: '12px 8px',
                        backgroundColor: settings.branding.headerStyle === style.value ? settings.branding.primaryColor : '#f9fafb',
                        color: settings.branding.headerStyle === style.value ? 'white' : '#374151',
                        border: settings.branding.headerStyle === style.value ? 'none' : '2px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{style.label}</div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Live Preview
              </label>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                {/* Preview Header */}
                <div style={{
                  background: settings.branding.headerStyle === 'gradient'
                    ? `linear-gradient(135deg, ${settings.branding.primaryColor} 0%, ${settings.branding.primaryColor}dd 100%)`
                    : settings.branding.headerStyle === 'solid'
                    ? settings.branding.primaryColor
                    : 'white',
                  padding: '16px',
                  borderBottom: settings.branding.headerStyle === 'modern' ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {/* Logo */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: settings.branding.logoUrl
                        ? 'white'
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: settings.branding.logoUrl ? '2px solid #f3f4f6' : 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {settings.branding.logoUrl ? (
                        <img
                          src={settings.branding.logoUrl}
                          alt="Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '🍽️'; }}
                        />
                      ) : (
                        <span style={{ fontSize: '20px' }}>🍽️</span>
                      )}
                    </div>
                    {/* Name & Tagline */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'white' : '#1f2937'
                      }}>
                        Your Restaurant
                      </div>
                      {settings.branding.tagline && (
                        <div style={{
                          fontSize: '11px',
                          color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.85)' : '#6b7280',
                          marginTop: '2px'
                        }}>
                          {settings.branding.tagline}
                        </div>
                      )}
                    </div>
                    {/* Cart Button */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle)
                        ? 'rgba(255,255,255,0.9)'
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaCog size={14} color={['gradient', 'solid'].includes(settings.branding.headerStyle) ? settings.branding.primaryColor : 'white'} />
                    </div>
                  </div>
                  {/* Search Bar Preview */}
                  <div style={{
                    backgroundColor: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.95)' : '#f9fafb',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    🔍 Search food items...
                  </div>
                  {/* Category Pills Preview */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle)
                        ? 'rgba(255,255,255,0.9)'
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? settings.branding.primaryColor : 'white'
                    }}>
                      All
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.2)' : 'white',
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.9)' : '#6b7280',
                      border: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb'
                    }}>
                      Starters
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.2)' : 'white',
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? 'rgba(255,255,255,0.9)' : '#6b7280',
                      border: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb'
                    }}>
                      Main
                    </div>
                  </div>
                </div>
                {/* Preview Body */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px' }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>Menu Item</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>₹299</div>
                    </div>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: settings.branding.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px'
                    }}>+</div>
                  </div>
                </div>
              </div>
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
