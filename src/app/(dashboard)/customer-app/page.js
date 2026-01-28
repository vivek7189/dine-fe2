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
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
  FaPrint,
  FaShare,
  FaFilePdf,
  FaLink,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';

// Helper function to determine if text should be light or dark based on background color
const getContrastTextColor = (hexColor) => {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

// Helper to get a slightly darker shade for gradients
const getDarkerShade = (hexColor, percent = 20) => {
  if (!hexColor) return hexColor;
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * percent / 100));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const CustomerAppSettings = ({ embedded = false }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [onlineOrderUrl, setOnlineOrderUrl] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loyaltyErrors, setLoyaltyErrors] = useState({
    earnPerAmount: '',
    pointsEarned: '',
    redemptionRate: '',
    maxRedemptionPercent: ''
  });

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
      earnPerAmount: 100,
      pointsEarned: 4,
      redemptionRate: 100,
      maxRedemptionPercent: 20,
    },
    branding: {
      primaryColor: '#ef4444',
      textColor: '#ffffff',
      pageBackgroundColor: '#f8fafc',
      offerGradientStart: '#fef3c7',
      offerGradientEnd: '#fde68a',
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
    // Only access localStorage on the client
    if (typeof window === 'undefined') return;

    const id = localStorage.getItem('selectedRestaurantId');
    if (id) {
      setRestaurantId(id);
      loadSettings(id);
    } else if (!embedded) {
      // Only redirect if not embedded as a tab
      router.push('/admin');
    } else {
      // When embedded, just set loading to false and wait
      setLoading(false);
    }
  }, [router, embedded]);

  const loadSettings = async (id) => {
    try {
      // Load restaurant info to get name
      const restaurantResponse = await apiClient.get(`/api/restaurants/${id}`);
      if (restaurantResponse.restaurant) {
        setRestaurantName(restaurantResponse.restaurant.name || '');
      }

      const response = await apiClient.get(`/api/restaurants/${id}/customer-app-settings`);
      if (response.settings) {
        // Extract restaurant code from settings
        const restaurantCode = response.settings.restaurantCode || '';
        setSettings(prev => ({
          ...prev,
          ...response.settings,
          restaurantCode: restaurantCode || prev.restaurantCode
        }));
        
        // Set logo preview if logoUrl exists
        if (response.settings.branding?.logoUrl) {
          setLogoPreview(response.settings.branding.logoUrl);
        }
        
        // If restaurant code exists, try to load QR code
        if (restaurantCode) {
          try {
            const qrResponse = await apiClient.get(`/api/restaurants/${id}/qr-code`);
            if (qrResponse.qrCode) {
              setQrCodeUrl(qrResponse.qrCode);
            }
            if (qrResponse.onlineOrderUrl) {
              setOnlineOrderUrl(qrResponse.onlineOrderUrl);
            }
          } catch (qrErr) {
            console.log('No QR code yet, but restaurant code exists');
            // Set online order URL even if QR doesn't exist yet
            setOnlineOrderUrl(`https://www.dineopen.com/onlineorder?restaurant=${id}`);
          }
        } else {
          // Set online order URL based on restaurant ID
          setOnlineOrderUrl(`https://www.dineopen.com/onlineorder?restaurant=${id}`);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File too large. Maximum file size is 5MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.uploadImage(formData);
      if (response.imageUrl) {
        const newLogoUrl = response.imageUrl;
        setSettings(prev => ({
          ...prev,
          branding: {
            ...prev.branding,
            logoUrl: newLogoUrl
          }
        }));
        setLogoPreview(newLogoUrl);
        alert('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        logoUrl: ''
      }
    }));
    setLogoPreview(null);
  };

  // Toast notification helper
  const showNotification = (message, isError = false) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle loyalty input change with validation (only numbers allowed)
  const handleLoyaltyInputChange = (field, value) => {
    // Check if value contains only digits (or is empty)
    if (value === '' || /^\d+$/.test(value)) {
      // Clear error
      setLoyaltyErrors(prev => ({ ...prev, [field]: '' }));
      // Update settings - allow empty string temporarily while typing
      setSettings(prev => ({
        ...prev,
        loyaltySettings: { ...prev.loyaltySettings, [field]: value === '' ? '' : parseInt(value, 10) }
      }));
    } else {
      // Show error - non-numeric characters detected
      setLoyaltyErrors(prev => ({ ...prev, [field]: 'Only numbers are allowed' }));
    }
  };

  const handleSave = async () => {
    // Get restaurantId - use state or fallback to localStorage
    let currentRestaurantId = restaurantId;
    if ((!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') && typeof window !== 'undefined') {
      currentRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (currentRestaurantId && currentRestaurantId !== 'null' && currentRestaurantId !== 'undefined') {
        setRestaurantId(currentRestaurantId);
      } else {
        currentRestaurantId = null;
      }
    }

    if (!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') {
      showNotification('No restaurant selected. Please select a restaurant first.', true);
      return;
    }

    setSaving(true);
    try {
      // Update restaurant name if changed
      if (restaurantName) {
        await apiClient.patch(`/api/restaurants/${currentRestaurantId}`, {
          name: restaurantName
        });
      }

      // Ensure restaurant code is linked to restaurant ID
      if (settings.restaurantCode) {
        await apiClient.patch(`/api/restaurants/${currentRestaurantId}`, {
          restaurantCode: settings.restaurantCode.toUpperCase()
        });
      }

      // Save customer app settings
      await apiClient.put(`/api/restaurants/${currentRestaurantId}/customer-app-settings`, settings);

      showNotification('Theme settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', true);
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

    // Get restaurantId - use state or fallback to localStorage
    let currentRestaurantId = restaurantId;
    if ((!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') && typeof window !== 'undefined') {
      currentRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') {
        currentRestaurantId = null;
      }
    }

    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    try {
      // GET endpoint auto-generates QR if code exists
      const response = await apiClient.get(`/api/restaurants/${currentRestaurantId}/qr-code`);
      if (response.qrCode) {
        setQrCodeUrl(response.qrCode);
        if (response.onlineOrderUrl) {
          setOnlineOrderUrl(response.onlineOrderUrl);
        }
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

    // Get restaurantId - use state or fallback to localStorage
    let currentRestaurantId = restaurantId;
    if ((!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') && typeof window !== 'undefined') {
      currentRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (!currentRestaurantId || currentRestaurantId === 'null' || currentRestaurantId === 'undefined') {
        currentRestaurantId = null;
      }
    }

    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    try {
      setGeneratingCode(true);
      const response = await apiClient.generateRestaurantCode(currentRestaurantId);
      if (response.restaurantCode) {
        const newCode = response.restaurantCode;
        setSettings(prev => ({ ...prev, restaurantCode: newCode }));

        // Immediately save the code to restaurant
        try {
          await apiClient.patch(`/api/restaurants/${currentRestaurantId}`, {
            restaurantCode: newCode.toUpperCase()
          });

          // Auto-generate QR code after code is saved
          try {
            const qrResponse = await apiClient.get(`/api/restaurants/${currentRestaurantId}/qr-code`);
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
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out',
          fontWeight: '500'
        }}>
          <FaCheck size={16} />
          {toastMessage}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
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

        {/* LOYALTY & REDEEM SECTION - FIRST AND PROMINENT */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: isMobile ? '24px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(236, 72, 153, 0.15)',
          border: '2px solid #fce7f3',
          background: 'linear-gradient(135deg, #fff 0%, #fef7f0 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}>
              <FaGift size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                Loyalty & Rewards Program
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0', fontWeight: '500' }}>
                Enable points system for customers to earn and redeem rewards
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #fde68a',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
              <strong>💡 How it works:</strong> Customers order through your online order page, earn loyalty points for every order, 
              and can redeem those points for discounts on future orders. Perfect for small outlets where customers order online and pick up food.
            </div>
          </div>

          <Toggle
            value={settings.loyaltySettings.enabled}
            onChange={(v) => setSettings(prev => ({
              ...prev,
              loyaltySettings: { ...prev.loyaltySettings, enabled: v }
            }))}
            label="Enable Loyalty Points System"
          />

          {settings.loyaltySettings.enabled && (
            <div style={{ marginTop: '24px' }}>
              {/* Points Earning Rule */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Points Earning Rule
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>For every ₹</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={settings.loyaltySettings.earnPerAmount}
                      onChange={(e) => handleLoyaltyInputChange('earnPerAmount', e.target.value)}
                      style={{
                        width: '80px',
                        padding: '10px 12px',
                        border: loyaltyErrors.earnPerAmount ? '2px solid #dc2626' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textAlign: 'center',
                        backgroundColor: 'white'
                      }}
                    />
                    {loyaltyErrors.earnPerAmount && (
                      <span style={{ fontSize: '10px', color: '#dc2626', marginTop: '4px' }}>{loyaltyErrors.earnPerAmount}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>spent, earn</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={settings.loyaltySettings.pointsEarned}
                      onChange={(e) => handleLoyaltyInputChange('pointsEarned', e.target.value)}
                      style={{
                        width: '80px',
                        padding: '10px 12px',
                        border: loyaltyErrors.pointsEarned ? '2px solid #dc2626' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textAlign: 'center',
                        backgroundColor: 'white'
                      }}
                    />
                    {loyaltyErrors.pointsEarned && (
                      <span style={{ fontSize: '10px', color: '#dc2626', marginTop: '4px' }}>{loyaltyErrors.pointsEarned}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>points</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#6b7280' }}>
                  Configure how customers earn loyalty points on their orders
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Points needed for ₹1 redemption
                  </label>
                  <input
                    type="text"
                    value={settings.loyaltySettings.redemptionRate}
                    onChange={(e) => handleLoyaltyInputChange('redemptionRate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: loyaltyErrors.redemptionRate ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                  {loyaltyErrors.redemptionRate && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#dc2626' }}>{loyaltyErrors.redemptionRate}</p>
                  )}
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#6b7280' }}>
                    How many points = ₹1 discount
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Max redemption % per order
                  </label>
                  <input
                    type="text"
                    value={settings.loyaltySettings.maxRedemptionPercent}
                    onChange={(e) => handleLoyaltyInputChange('maxRedemptionPercent', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: loyaltyErrors.maxRedemptionPercent ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                  {loyaltyErrors.maxRedemptionPercent && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#dc2626' }}>{loyaltyErrors.maxRedemptionPercent}</p>
                  )}
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#6b7280' }}>
                    Maximum % of order that can be redeemed
                  </p>
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                marginTop: '20px'
              }}>
                <div style={{ fontSize: '14px', color: '#166534', lineHeight: '1.7', fontWeight: '500' }}>
                  <div style={{ marginBottom: '12px', fontWeight: '700', fontSize: '15px' }}>📊 Example Calculation:</div>
                  <div style={{ marginBottom: '8px' }}>
                    • Customer spends <strong>₹1,000</strong> → Earns <strong>{Math.floor(1000 / settings.loyaltySettings.earnPerAmount) * settings.loyaltySettings.pointsEarned} points</strong>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    • With <strong>{settings.loyaltySettings.redemptionRate * 100} points</strong>, they can redeem <strong>₹100</strong>
                  </div>
                  <div>
                    • Maximum redemption per order: <strong>{settings.loyaltySettings.maxRedemptionPercent}%</strong> of order value
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <style>{`
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
                type="text"
                value={settings.minimumOrder}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setSettings(prev => ({ ...prev, minimumOrder: value === '' ? '' : parseInt(value, 10) }));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

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
              QR Code for Online Ordering
            </h2>

            {qrCodeUrl ? (
              <div>
                <div id="qr-print-area" style={{ display: 'inline-block', padding: '16px', backgroundColor: 'white' }}>
                  <img src={qrCodeUrl} alt="Restaurant QR Code" style={{ width: '200px', height: '200px', margin: '0 auto' }} />
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    Scan to order online
                  </p>
                </div>

                {/* Online Order URL Display */}
                {onlineOrderUrl && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#374151',
                    wordBreak: 'break-all',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <FaLink size={10} color="#6b7280" />
                      <span style={{ fontWeight: '600', color: '#6b7280' }}>Online Order Link:</span>
                    </div>
                    {onlineOrderUrl}
                  </div>
                )}

                {/* Action Buttons Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                  {/* Print Button */}
                  <button
                    onClick={() => {
                      const printContent = document.getElementById('qr-print-area');
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Code - ${restaurantName || 'Restaurant'}</title>
                            <style>
                              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
                              .container { text-align: center; padding: 40px; }
                              img { width: 300px; height: 300px; }
                              h2 { margin: 0 0 20px; color: #1f2937; }
                              p { margin: 16px 0 0; font-size: 16px; color: #374151; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h2>${restaurantName || 'Restaurant'}</h2>
                              <img src="${qrCodeUrl}" alt="QR Code" />
                              <p>Scan to order online</p>
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.onload = () => {
                        printWindow.print();
                      };
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaPrint size={14} />
                    Print
                  </button>

                  {/* Copy URL Button */}
                  <button
                    onClick={() => {
                      if (onlineOrderUrl) {
                        navigator.clipboard.writeText(onlineOrderUrl);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: copiedUrl ? '#dcfce7' : '#f3f4f6',
                      color: copiedUrl ? '#16a34a' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {copiedUrl ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    {copiedUrl ? 'Copied!' : 'Copy URL'}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={async () => {
                      if (navigator.share && onlineOrderUrl) {
                        try {
                          await navigator.share({
                            title: `${restaurantName || 'Restaurant'} - Online Ordering`,
                            text: `Order online from ${restaurantName || 'our restaurant'}!`,
                            url: onlineOrderUrl
                          });
                        } catch (err) {
                          if (err.name !== 'AbortError') {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(onlineOrderUrl);
                            alert('Link copied to clipboard!');
                          }
                        }
                      } else if (onlineOrderUrl) {
                        // Fallback for browsers without Web Share API
                        navigator.clipboard.writeText(onlineOrderUrl);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaShare size={14} />
                    Share
                  </button>

                  {/* Download as PDF Button */}
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Code - ${restaurantName || 'Restaurant'}</title>
                            <style>
                              @page { size: A4; margin: 0; }
                              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
                              .container { text-align: center; padding: 60px; }
                              img { width: 400px; height: 400px; }
                              h1 { margin: 0 0 30px; color: #1f2937; font-size: 32px; }
                              p { margin: 24px 0 0; font-size: 20px; color: #374151; }
                              .url { margin-top: 20px; font-size: 14px; color: #6b7280; word-break: break-all; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>${restaurantName || 'Restaurant'}</h1>
                              <img src="${qrCodeUrl}" alt="QR Code" />
                              <p>Scan to order online</p>
                              <p class="url">${onlineOrderUrl || ''}</p>
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.onload = () => {
                        printWindow.print();
                      };
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaFilePdf size={14} />
                    Save as PDF
                  </button>
                </div>

                {/* Download QR Image */}
                <button
                  onClick={downloadQR}
                  style={{
                    width: '100%',
                    marginTop: '12px',
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
                  Download QR Image
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
              Print this QR code and place it at tables or entrance for customers to scan and order online
            </p>
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
              {/* Restaurant Display Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Restaurant Display Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter restaurant name"
                  maxLength={100}
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                  This name will appear on the online ordering page header
                </p>
              </div>

              {/* Logo Upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Restaurant Logo
                </label>
                
                {/* Logo Preview */}
                {(logoPreview || settings.branding.logoUrl) && (
                  <div style={{ 
                    marginBottom: '12px',
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <img
                      src={logoPreview || settings.branding.logoUrl}
                      alt="Restaurant Logo"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      onClick={handleRemoveLogo}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: uploadingLogo ? '#f9fafb' : '#fafafa',
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!uploadingLogo) {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.backgroundColor = '#fef7f0';
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    if (!uploadingLogo && e.dataTransfer.files.length > 0) {
                      handleLogoUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => {
                    if (!uploadingLogo) {
                      document.getElementById('logo-upload-input')?.click();
                    }
                  }}
                >
                  <input
                    id="logo-upload-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                    disabled={uploadingLogo}
                  />
                  
                  {uploadingLogo ? (
                    <>
                      <div style={{ 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px',
                        display: 'inline-block'
                      }}>
                        <FaSpinner size={32} style={{ color: '#ec4899' }} />
                      </div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        Uploading logo...
                      </p>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt size={32} style={{ color: '#9ca3af', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px', fontWeight: '500' }}>
                        {logoPreview || settings.branding.logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Click or drag & drop
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '8px 0 0' }}>
                        Recommended: Square image, 200x200px or larger (Max 5MB)
                      </p>
                    </>
                  )}
                </div>

                {/* Manual URL Input (Optional) */}
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ fontSize: '12px', color: '#6b7280', cursor: 'pointer', fontWeight: '500' }}>
                    Or enter logo URL manually
                  </summary>
                  <input
                    type="url"
                    value={settings.branding.logoUrl}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, logoUrl: e.target.value }
                      }));
                      if (e.target.value) {
                        setLogoPreview(e.target.value);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginTop: '8px'
                    }}
                    placeholder="https://example.com/logo.png"
                  />
                </details>
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

              {/* Color Customization Section */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
                  🎨 Color Customization
                </h4>

                {/* Header Background Color */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Header Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const autoTextColor = getContrastTextColor(newColor);
                        setSettings(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            primaryColor: newColor,
                            textColor: autoTextColor
                          }
                        }));
                      }}
                      style={{
                        width: '50px',
                        height: '38px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    />
                    <input
                      type="text"
                      value={settings.branding.primaryColor}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, primaryColor: newColor }
                        }));
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                      }}
                      placeholder="#ef4444"
                      maxLength={7}
                    />
                    <button
                      onClick={() => {
                        const autoColor = getContrastTextColor(settings.branding.primaryColor);
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, textColor: autoColor }
                        }));
                      }}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      title="Auto-detect best text color"
                    >
                      Auto Text
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {['#ef4444', '#f97316', '#FFFF00', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#1f2937', '#ffffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const autoTextColor = getContrastTextColor(color);
                          setSettings(prev => ({
                            ...prev,
                            branding: { ...prev.branding, primaryColor: color, textColor: autoTextColor }
                          }));
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: color,
                          border: settings.branding.primaryColor === color ? '2px solid #1f2937' : '1px solid #d1d5db',
                          cursor: 'pointer'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Header Text Color */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Header Text Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.branding.textColor || '#ffffff'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, textColor: e.target.value }
                      }))}
                      style={{
                        width: '50px',
                        height: '38px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    />
                    <input
                      type="text"
                      value={settings.branding.textColor || '#ffffff'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, textColor: e.target.value }
                      }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                      }}
                      placeholder="#ffffff"
                      maxLength={7}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {['#ffffff', '#1f2937', '#000000', '#ef4444', '#f97316'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, textColor: color }
                        }))}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: color,
                          border: (settings.branding.textColor || '#ffffff') === color ? '2px solid #ec4899' : '1px solid #d1d5db',
                          cursor: 'pointer'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Page Background Color */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Page Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.branding.pageBackgroundColor || '#f8fafc'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, pageBackgroundColor: e.target.value }
                      }))}
                      style={{
                        width: '50px',
                        height: '38px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    />
                    <input
                      type="text"
                      value={settings.branding.pageBackgroundColor || '#f8fafc'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, pageBackgroundColor: e.target.value }
                      }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                      }}
                      placeholder="#f8fafc"
                      maxLength={7}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {['#f8fafc', '#ffffff', '#fef7f0', '#f0fdf4', '#fefce8', '#fef2f2', '#f5f3ff'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, pageBackgroundColor: color }
                        }))}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: color,
                          border: (settings.branding.pageBackgroundColor || '#f8fafc') === color ? '2px solid #ec4899' : '1px solid #d1d5db',
                          cursor: 'pointer'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Offer Card Gradient */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Offer Card Gradient
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>Start</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={settings.branding.offerGradientStart || '#fef3c7'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            branding: { ...prev.branding, offerGradientStart: e.target.value }
                          }))}
                          style={{
                            width: '40px',
                            height: '32px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        />
                        <input
                          type="text"
                          value={settings.branding.offerGradientStart || '#fef3c7'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            branding: { ...prev.branding, offerGradientStart: e.target.value }
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase'
                          }}
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>End</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={settings.branding.offerGradientEnd || '#fde68a'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            branding: { ...prev.branding, offerGradientEnd: e.target.value }
                          }))}
                          style={{
                            width: '40px',
                            height: '32px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        />
                        <input
                          type="text"
                          value={settings.branding.offerGradientEnd || '#fde68a'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            branding: { ...prev.branding, offerGradientEnd: e.target.value }
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase'
                          }}
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Gradient Preview */}
                  <div style={{
                    height: '32px',
                    borderRadius: '6px',
                    background: `linear-gradient(135deg, ${settings.branding.offerGradientStart || '#fef3c7'} 0%, ${settings.branding.offerGradientEnd || '#fde68a'} 100%)`,
                    border: '1px solid #e5e7eb'
                  }} />
                  {/* Preset Gradients */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[
                      { start: '#fef3c7', end: '#fde68a', name: 'Yellow' },
                      { start: '#fee2e2', end: '#fecaca', name: 'Red' },
                      { start: '#dbeafe', end: '#bfdbfe', name: 'Blue' },
                      { start: '#dcfce7', end: '#bbf7d0', name: 'Green' },
                      { start: '#f3e8ff', end: '#e9d5ff', name: 'Purple' },
                      { start: '#fce7f3', end: '#fbcfe8', name: 'Pink' },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            offerGradientStart: preset.start,
                            offerGradientEnd: preset.end
                          }
                        }))}
                        style={{
                          padding: '4px 10px',
                          background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`,
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        title={preset.name}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
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
                        color: settings.branding.headerStyle === style.value ? (settings.branding.textColor || '#ffffff') : '#374151',
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
                      background: (logoPreview || settings.branding.logoUrl)
                        ? 'white'
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: (logoPreview || settings.branding.logoUrl) ? '2px solid #f3f4f6' : 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {(logoPreview || settings.branding.logoUrl) ? (
                        <img
                          src={logoPreview || settings.branding.logoUrl}
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
                        color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : '#1f2937'
                      }}>
                        {restaurantName || 'Your Restaurant'}
                      </div>
                      {settings.branding.tagline && (
                        <div style={{
                          fontSize: '11px',
                          color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : '#6b7280',
                          marginTop: '2px',
                          opacity: 0.85
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
                        ? `${settings.branding.textColor || '#ffffff'}20`
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaCog size={14} color={['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : 'white'} />
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
                        ? `${settings.branding.textColor || '#ffffff'}20`
                        : `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.primaryColor}dd)`,
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : 'white',
                      border: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? `1px solid ${settings.branding.textColor || '#ffffff'}40` : 'none'
                    }}>
                      All
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? `${settings.branding.textColor || '#ffffff'}15` : 'white',
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : '#6b7280',
                      border: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? `1px solid ${settings.branding.textColor || '#ffffff'}30` : '1px solid #e5e7eb'
                    }}>
                      Starters
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      background: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? `${settings.branding.textColor || '#ffffff'}15` : 'white',
                      color: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? (settings.branding.textColor || '#ffffff') : '#6b7280',
                      border: ['gradient', 'solid'].includes(settings.branding.headerStyle) ? `1px solid ${settings.branding.textColor || '#ffffff'}30` : '1px solid #e5e7eb'
                    }}>
                      Main
                    </div>
                  </div>
                </div>
                {/* Preview Body */}
                <div style={{ backgroundColor: settings.branding.pageBackgroundColor || '#f8fafc', padding: '16px' }}>
                  {/* Offer Card Preview */}
                  <div style={{
                    background: `linear-gradient(135deg, ${settings.branding.offerGradientStart || '#fef3c7'} 0%, ${settings.branding.offerGradientEnd || '#fde68a'} 100%)`,
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🎁
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>10% OFF</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>First Order Discount</div>
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>10%</div>
                  </div>
                  {/* Menu Item Preview */}
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
                      color: settings.branding.textColor || '#ffffff',
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
