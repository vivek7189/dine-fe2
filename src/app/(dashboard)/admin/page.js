'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t, getCurrentLanguage, setLanguage, getAvailableLanguages } from '../../../lib/i18n';
import { 
  FaStore, 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaShieldAlt,
  FaCrown,
  FaUserShield,
  FaUtensils,
  FaArrowRight,
  FaKey,
  FaIdBadge,
  FaCopy,
  FaUserCog,
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaPercentage,
  FaSave,
  FaSpinner,
  FaClock,
  FaGoogle,
  FaReceipt,
  FaGlobe,
  FaPrint,
  FaDownload,
  FaWindows,
  FaApple,
  FaMoneyBillWave,
  FaChevronDown,
  FaToggleOn,
  FaToggleOff,
  FaSlidersH,
  FaCreditCard,
  FaTag,
  FaCashRegister,
  FaClipboardList,
  FaFire,
  FaChair,
  FaBoxes,
  FaRobot,
  FaBuilding,
  FaFileInvoice,
  FaLayerGroup,
  FaHandHoldingUsd,
  FaConciergeBell,
  FaDivide,
  FaGift,
  FaStar,
  FaBan,
  FaUndo,
  FaLock
} from 'react-icons/fa';
// ShiftScheduling moved to /shifts page df
import dynamic from 'next/dynamic';
import GoogleReviews from '../../../components/GoogleReviews';
import WhatsAppTab from '../../../components/WhatsAppTab';

const OffersManagement = dynamic(() => import('../offers/page'), { ssr: false });
const CustomerAppSettings = dynamic(() => import('../customer-app/page'), { ssr: false });
import { getAllCountriesWithCurrency, getCurrencyByCountryCode } from '../../../lib/currencyData';
import { FEATURE_OPS, OP_LABELS, ADMIN_TAB_LABELS, ADMIN_TAB_ID_TO_KEY, resolveFeaturePermissions } from '@/lib/permissions';
import { getPrintFontSizes, getPrintFontFamily, PRINT_FONTS } from '../../../utils/printFontSizes';

// Tax Management Component
const TaxManagement = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [taxSettings, setTaxSettings] = useState({
    enabled: true,
    taxes: [
      {
        id: 'gst',
        name: 'GST',
        rate: 5,
        enabled: true,
        type: 'percentage'
      }
    ],
    defaultTaxRate: 5
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTaxSettings = async (restaurantId) => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getTaxSettings(restaurantId);
      if (response.success) {
        setTaxSettings(response.taxSettings);
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTaxSettings = async () => {
    if (!selectedRestaurant?.id) return;
    
    setSaving(true);
    try {
      const response = await apiClient.updateTaxSettings(selectedRestaurant.id, taxSettings);
      if (response.success) {
        alert('Tax settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving tax settings:', error);
      alert('Error saving tax settings');
    } finally {
      setSaving(false);
    }
  };

  const addTax = () => {
    const newTax = {
      id: `tax_${Date.now()}`,
      name: 'New Tax',
      rate: 0,
      enabled: true,
      type: 'percentage'
    };
    setTaxSettings(prev => ({
      ...prev,
      taxes: [...prev.taxes, newTax]
    }));
  };

  const updateTax = (index, field, value) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.map((tax, i) => 
        i === index ? { ...tax, [field]: value } : tax
      )
    }));
  };

  const removeTax = (index) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.filter((_, i) => i !== index)
    }));
  };

  const toggleTaxEnabled = (index) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.map((tax, i) => 
        i === index ? { ...tax, enabled: !tax.enabled } : tax
      )
    }));
  };

  // Load tax settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadTaxSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPercentage size={20} />
          Tax Management
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Configure tax rates and settings for your restaurant
        </p>
      </div>

      {/* Restaurant Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
          Select Restaurant
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              style={{
                backgroundColor: selectedRestaurant?.id === restaurant.id ? '#111827' : 'white',
                color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '13px',
                border: selectedRestaurant?.id === restaurant.id ? '1px solid #111827' : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FaStore size={12} style={{ marginRight: '6px' }} />
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {selectedRestaurant && (
        <div>
          {/* Tax Enable/Disable */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={taxSettings.enabled}
                onChange={(e) => setTaxSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Tax Calculation
            </label>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              When enabled, taxes will be automatically calculated and added to orders
            </p>
          </div>

          {taxSettings.enabled && (
            <div>
              {/* Tax List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    Tax Rates
                  </h3>
                  <button
                    onClick={addTax}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaPlus size={12} />
                    Add Tax
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {taxSettings.taxes.map((tax, index) => (
                    <div key={tax.id} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={tax.enabled}
                        onChange={() => toggleTaxEnabled(index)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => updateTax(index, 'name', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Tax Name (e.g., GST, VAT)"
                      />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={tax.rate}
                          onChange={(e) => updateTax(index, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          style={{
                            width: '80px',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>%</span>
                      </div>
                      
                      <button
                        onClick={() => removeTax(index)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={saveTaxSettings}
                  disabled={saving}
                  style={{
                    backgroundColor: saving ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {saving ? (
                    <>
                      <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      Save Tax Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Discount Settings */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPercentage size={14} />
              Discount Settings
            </h3>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px 0' }}>
              Control how discounts work on the billing screen
            </p>

            {/* Enable Discounts Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={taxSettings.discountSettings?.enabled || false}
                onChange={(e) => setTaxSettings(prev => ({
                  ...prev,
                  discountSettings: { ...prev.discountSettings, enabled: e.target.checked }
                }))}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Discounts on Dashboard
            </label>

            {taxSettings.discountSettings?.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {/* Manual Discount Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={taxSettings.discountSettings?.allowManualDiscount !== false}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      discountSettings: { ...prev.discountSettings, allowManualDiscount: e.target.checked }
                    }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Allow Manual Discount Input
                </label>

                {/* Roles that can apply manual discount */}
                {taxSettings.discountSettings?.allowManualDiscount !== false && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>
                      Who can apply manual discounts?
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['owner', 'manager', 'admin', 'cashier', 'waiter'].map(role => {
                        const roles = taxSettings.discountSettings?.manualDiscountRoles || ['owner'];
                        const isSelected = roles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => {
                              setTaxSettings(prev => {
                                const current = prev.discountSettings?.manualDiscountRoles || ['owner'];
                                const updated = isSelected
                                  ? current.filter(r => r !== role)
                                  : [...current, role];
                                return {
                                  ...prev,
                                  discountSettings: { ...prev.discountSettings, manualDiscountRoles: updated.length > 0 ? updated : ['owner'] }
                                };
                              });
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: isSelected ? '1px solid #111827' : '1px solid #d1d5db',
                              backgroundColor: isSelected ? '#111827' : 'white',
                              color: isSelected ? 'white' : '#6b7280',
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                              transition: 'all 0.15s'
                            }}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Discount Limits */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px 0' }}>Max % Discount</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min="1" max="100" step="1"
                        value={taxSettings.discountSettings?.maxDiscountPercent || 100}
                        onChange={(e) => setTaxSettings(prev => ({
                          ...prev,
                          discountSettings: { ...prev.discountSettings, maxDiscountPercent: parseInt(e.target.value) || 100 }
                        }))}
                        style={{ width: '70px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>%</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px 0' }}>Max Flat Discount</p>
                    <input
                      type="number"
                      min="0" step="1"
                      placeholder="No limit"
                      value={taxSettings.discountSettings?.maxDiscountAmount || ''}
                      onChange={(e) => setTaxSettings(prev => ({
                        ...prev,
                        discountSettings: { ...prev.discountSettings, maxDiscountAmount: e.target.value ? parseInt(e.target.value) : null }
                      }))}
                      style={{ width: '100px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedRestaurant && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <FaStore size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>
            Please select a restaurant to manage tax settings
          </p>
        </div>
      )}
    </div>
  );
};

// Payment Settings Component (UPI)
const PaymentSettings = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [settings, setSettings] = useState({
    upiEnabled: false,
    upiId: '',
    upiQrCodeUrl: '',
    upiDisplayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadSettings = async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/restaurants/${restaurantId}/customer-app-settings`);
      const ps = response?.settings?.paymentSettings || {};
      setSettings({
        upiEnabled: !!ps.upiEnabled,
        upiId: ps.upiId || '',
        upiQrCodeUrl: ps.upiQrCodeUrl || '',
        upiDisplayName: ps.upiDisplayName || '',
      });
    } catch (e) {
      console.error('Error loading payment settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.id) loadSettings(selectedRestaurant.id);
  }, [selectedRestaurant?.id]);

  const handleSave = async () => {
    if (!selectedRestaurant?.id) return;
    setSaving(true);
    try {
      // Merge with existing customer-app-settings to avoid wiping other fields
      const existing = await apiClient.get(`/api/restaurants/${selectedRestaurant.id}/customer-app-settings`);
      const merged = {
        ...(existing?.settings || {}),
        paymentSettings: {
          ...(existing?.settings?.paymentSettings || {}),
          ...settings,
        },
      };
      await apiClient.put(`/api/restaurants/${selectedRestaurant.id}/customer-app-settings`, merged);
      showToast('Payment settings saved');
    } catch (e) {
      console.error('Error saving payment settings:', e);
      showToast('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) { alert('Only JPEG/PNG/WebP images allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.uploadImage(formData);
      if (res.imageUrl) {
        setSettings(prev => ({ ...prev, upiQrCodeUrl: res.imageUrl }));
        showToast('QR uploaded');
      }
    } catch (e) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCreditCard color="#6366f1" /> Payment Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Enable UPI payment option for customers ordering online. Customers will see your QR + UPI ID after placing an order.
          </p>
        </div>
        <select
          value={selectedRestaurant?.id || ''}
          onChange={(e) => {
            const r = restaurants.find(x => x.id === e.target.value);
            if (r) setSelectedRestaurant(r);
          }}
          style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minWidth: '220px' }}
        >
          <option value="">Select restaurant…</option>
          {restaurants.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
      </div>

      {!selectedRestaurant ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          Please select a restaurant to manage payment settings
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={28} color="#6366f1" />
        </div>
      ) : (
        <div style={{ maxWidth: '640px' }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: '12px',
            border: '1px solid #e5e7eb', marginBottom: '20px',
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Enable UPI Payment</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                Customers will see UPI QR after placing order
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, upiEnabled: !prev.upiEnabled }))}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: settings.upiEnabled ? '#16a34a' : '#9ca3af',
              }}
            >
              {settings.upiEnabled ? <FaToggleOn size={36} /> : <FaToggleOff size={36} />}
            </button>
          </div>

          {settings.upiEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* UPI ID */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="yourrestaurant@paytm"
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'monospace',
                  }}
                />
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  e.g. name@paytm, name@upi, 9876543210@ybl
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Display Name (shown to customers)
                </label>
                <input
                  type="text"
                  value={settings.upiDisplayName}
                  onChange={(e) => setSettings(prev => ({ ...prev, upiDisplayName: e.target.value }))}
                  placeholder={selectedRestaurant?.name || 'Your Restaurant Name'}
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* QR Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  UPI QR Code Image
                </label>
                {settings.upiQrCodeUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img src={settings.upiQrCodeUrl} alt="UPI QR" style={{ width: '200px', height: '200px', objectFit: 'contain', display: 'block' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaCheckCircle size={12} /> QR Code uploaded
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{
                        padding: '8px 16px', backgroundColor: '#eef2ff', color: '#6366f1',
                        border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        opacity: uploading ? 0.6 : 1,
                      }}>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={(e) => handleUpload(e.target.files?.[0])}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                        {uploading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={12} /> : <FaDownload size={12} />}
                        {uploading ? 'Uploading…' : 'Change QR'}
                      </label>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, upiQrCodeUrl: '' }))}
                        disabled={uploading}
                        style={{
                          padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                          cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                          opacity: uploading ? 0.6 : 1,
                        }}
                      >
                        <FaTimes size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '32px', border: '2px dashed #cbd5e1', borderRadius: '12px',
                    backgroundColor: '#f8fafc', cursor: uploading ? 'not-allowed' : 'pointer', gap: '8px',
                    opacity: uploading ? 0.6 : 1,
                  }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={24} color="#6366f1" />
                        <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600 }}>Uploading…</span>
                      </>
                    ) : (
                      <>
                        <FaDownload size={24} color="#6366f1" />
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Click to upload QR image</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>JPEG/PNG/WebP, max 5MB</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Save */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving || (settings.upiEnabled && !settings.upiId.trim())}
              style={{
                padding: '12px 24px', backgroundColor: saving ? '#9ca3af' : '#6366f1',
                color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px',
                fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {saving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave />}
              {saving ? 'Saving…' : 'Save Payment Settings'}
            </button>
          </div>

          {toast && (
            <div style={{
              position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px',
              backgroundColor: '#111827', color: '#fff', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, zIndex: 9999,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}>
              {toast}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Pricing Management Component (Multi-Tier + Legacy Zone Pricing)
const ZonePricingManagement = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [pricingSettings, setPricingSettings] = useState({
    zonePricing: { enabled: false, zones: [] },
    multiPricing: { enabled: false, rules: [] }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showZonePricing, setShowZonePricing] = useState(false);
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [showFloorManager, setShowFloorManager] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [addingFloor, setAddingFloor] = useState(false);
  const [addingTableForFloor, setAddingTableForFloor] = useState(null);
  const [newTableData, setNewTableData] = useState({ name: '', capacity: 4 });
  const [addingTable, setAddingTable] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState(null);
  const [deletingTableName, setDeletingTableName] = useState('');
  const [deleteTableReason, setDeleteTableReason] = useState('');
  const { formatCurrency } = useCurrency();

  const TAKEAWAY_NAMES = ['takeaway', 'take away', 'take-away'];
  const DELIVERY_NAMES = ['delivery'];

  const DEFAULT_RULES = [
    { id: 'rule_ac_dining', name: 'AC Dining', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: true, order: 0 },
    { id: 'rule_non_ac', name: 'Non-AC Dining', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: true, order: 1 },
    { id: 'rule_takeaway', name: 'Takeaway', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: false, order: 2 },
    { id: 'rule_delivery', name: 'Delivery', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: false, order: 3 },
  ];

  const loadPricingSettings = async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const response = await apiClient.getPricingSettings(restaurantId);
      if (response.settings) {
        setPricingSettings({
          zonePricing: response.settings.zonePricing || { enabled: false, zones: [] },
          multiPricing: response.settings.multiPricing || { enabled: false, rules: [] }
        });
      }
      // Load floors for table mapping dropdown
      try {
        const floorsResponse = await apiClient.getFloors(restaurantId);
        setFloors(floorsResponse?.floors || floorsResponse || []);
        const tablesResponse = await apiClient.getTables(restaurantId);
        setTables(tablesResponse?.tables || []);
      } catch { setFloors([]); setTables([]); }
    } catch (error) {
      console.error('Failed to load pricing settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePricingSettings = async () => {
    if (!selectedRestaurant?.id) return;
    setSaving(true);
    try {
      await apiClient.updatePricingSettings(selectedRestaurant.id, pricingSettings);
      alert('Pricing settings saved!');
    } catch (error) {
      console.error('Failed to save pricing settings:', error);
      alert('Failed to save pricing settings');
    } finally {
      setSaving(false);
    }
  };

  // Floor & Table management helpers
  const getTablesForFloor = (floorName) => tables.filter(t => t.floor === floorName);

  const handleAddFloor = async () => {
    if (!newFloorName.trim() || !selectedRestaurant?.id) return;
    setAddingFloor(true);
    try {
      const response = await apiClient.createFloor(selectedRestaurant.id, {
        name: newFloorName.trim(),
        areaChargeType: 'none',
        areaChargeValue: 0,
      });
      setFloors(prev => [...prev, { ...response.floor, tables: [] }]);
      setNewFloorName('');
    } catch (err) {
      alert('Failed to add floor: ' + err.message);
    } finally {
      setAddingFloor(false);
    }
  };

  const handleDeleteFloor = async (floorId, floorName) => {
    const floorTables = getTablesForFloor(floorName);
    const msg = floorTables.length > 0
      ? `Delete "${floorName}" and its ${floorTables.length} table(s)? This cannot be undone.`
      : `Delete floor "${floorName}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      await apiClient.deleteFloor(floorId, { restaurantId: selectedRestaurant.id });
      setFloors(prev => prev.filter(f => f.id !== floorId));
      setTables(prev => prev.filter(t => t.floor !== floorName));
    } catch (err) {
      alert('Failed to delete floor: ' + err.message);
    }
  };

  const handleAddTable = async (floorId, floorName) => {
    if (!newTableData.name.trim() || !selectedRestaurant?.id) return;
    setAddingTable(true);
    try {
      const response = await apiClient.createTable(selectedRestaurant.id, {
        name: newTableData.name.trim(),
        capacity: parseInt(newTableData.capacity) || 4,
        type: 'regular',
        floor: floorName,
        status: 'available',
      });
      setTables(prev => [...prev, response.table]);
      setNewTableData({ name: '', capacity: 4 });
      setAddingTableForFloor(null);
    } catch (err) {
      alert('Failed to add table: ' + err.message);
    } finally {
      setAddingTable(false);
    }
  };

  const confirmDeleteTable = async () => {
    if (!deleteTableReason.trim() || !deletingTableId) return;
    try {
      await apiClient.deleteTable(deletingTableId, selectedRestaurant?.id);
      setTables(prev => prev.filter(t => (t._id || t.id) !== deletingTableId));
      setDeletingTableId(null);
      setDeletingTableName('');
      setDeleteTableReason('');
    } catch (err) {
      alert('Failed to delete table: ' + err.message);
    }
  };

  // Multi-pricing rule helpers
  const handleEnableMultiPricing = (checked) => {
    setPricingSettings(prev => {
      const currentRules = prev.multiPricing?.rules || [];
      return {
        ...prev,
        multiPricing: {
          ...prev.multiPricing,
          enabled: checked,
          rules: checked && currentRules.length === 0 ? DEFAULT_RULES : currentRules
        }
      };
    });
  };

  const addCustomRule = () => {
    const newRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      type: 'dynamic',
      defaultMarkupType: 'none',
      defaultMarkupValue: 0,
      tableMappings: [],
      isActive: true,
      order: (pricingSettings.multiPricing?.rules || []).length
    };
    setPricingSettings(prev => ({
      ...prev,
      multiPricing: {
        ...prev.multiPricing,
        rules: [...(prev.multiPricing?.rules || []), newRule]
      }
    }));
  };

  const updateRule = (index, field, value) => {
    setPricingSettings(prev => ({
      ...prev,
      multiPricing: {
        ...prev.multiPricing,
        rules: prev.multiPricing.rules.map((r, i) => i === index ? { ...r, [field]: value } : r)
      }
    }));
  };

  const removeRule = (index) => {
    setPricingSettings(prev => ({
      ...prev,
      multiPricing: {
        ...prev.multiPricing,
        rules: prev.multiPricing.rules.filter((_, i) => i !== index)
      }
    }));
  };

  // Zone pricing helpers
  const addZone = () => {
    const newZone = { id: `zone_${Date.now()}`, name: '', sectionMatch: '', markupType: 'percentage', markupValue: 0, isActive: true };
    setPricingSettings(prev => ({
      ...prev,
      zonePricing: { ...prev.zonePricing, zones: [...(prev.zonePricing?.zones || []), newZone] }
    }));
  };

  const updateZone = (index, field, value) => {
    setPricingSettings(prev => ({
      ...prev,
      zonePricing: { ...prev.zonePricing, zones: prev.zonePricing.zones.map((z, i) => i === index ? { ...z, [field]: value } : z) }
    }));
  };

  const removeZone = (index) => {
    setPricingSettings(prev => ({
      ...prev,
      zonePricing: { ...prev.zonePricing, zones: prev.zonePricing.zones.filter((_, i) => i !== index) }
    }));
  };

  // Grouping helpers — categorize rules by channel
  const allRules = pricingSettings.multiPricing?.rules || [];
  const DINEIN_NAMES = ['dine-in', 'dine in', 'dinein'];
  const dineInZoneRules = allRules.filter(r => {
    const name = (r.name || '').toLowerCase().trim();
    return !TAKEAWAY_NAMES.includes(name) && !DELIVERY_NAMES.includes(name) && !DINEIN_NAMES.includes(name);
  });
  const takeawayRule = allRules.find(r => TAKEAWAY_NAMES.includes((r.name || '').toLowerCase().trim()));
  const deliveryRule = allRules.find(r => DELIVERY_NAMES.includes((r.name || '').toLowerCase().trim()));
  const getRuleIndex = (ruleId) => allRules.findIndex(r => r.id === ruleId);

  // Enable/create a channel rule (takeaway or delivery) when toggled on
  const enableChannelRule = (channelNames, defaultName, defaultId) => {
    const existing = allRules.find(r => channelNames.includes((r.name || '').toLowerCase().trim()));
    if (existing) {
      updateRule(getRuleIndex(existing.id), 'isActive', true);
    } else {
      setPricingSettings(prev => ({
        ...prev,
        multiPricing: {
          ...prev.multiPricing,
          rules: [...(prev.multiPricing?.rules || []), {
            id: defaultId,
            name: defaultName,
            type: 'fixed',
            defaultMarkupType: 'none',
            defaultMarkupValue: 0,
            tableMappings: [],
            isActive: true,
            order: (prev.multiPricing?.rules || []).length
          }]
        }
      }));
    }
  };

  const disableChannelRule = (channelNames) => {
    const existing = allRules.find(r => channelNames.includes((r.name || '').toLowerCase().trim()));
    if (existing) {
      updateRule(getRuleIndex(existing.id), 'isActive', false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadPricingSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSlidersH size={20} />
          Pricing Rules
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Configure multi-tier pricing (AC/Non-AC/Takeaway) and zone surcharges
        </p>
      </div>

      {/* Restaurant Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>Select Restaurant</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              style={{
                backgroundColor: selectedRestaurant?.id === restaurant.id ? '#111827' : 'white',
                color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                padding: '6px 14px', borderRadius: '8px', fontWeight: 500, fontSize: '13px',
                border: selectedRestaurant?.id === restaurant.id ? '1px solid #111827' : '1px solid #e5e7eb',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <FaStore size={12} style={{ marginRight: '6px' }} />
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {selectedRestaurant && !loading && (
        <div>
          {/* ── Floors & Tables Overview ── */}
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showFloorManager ? '16px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaLayerGroup size={14} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Floors & Tables</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    {floors.length} floor{floors.length !== 1 ? 's' : ''} · {tables.length} table{tables.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFloorManager(!showFloorManager)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: '1px solid #d1d5db', background: showFloorManager ? '#1f2937' : 'white',
                  color: showFloorManager ? 'white' : '#374151', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <FaChair size={11} />
                {showFloorManager ? 'Close' : 'Manage'}
              </button>
            </div>

            {showFloorManager && (
              <div>
                {/* Add Floor Row */}
                <div style={{
                  display: 'flex', gap: '8px', marginBottom: '16px', padding: '12px',
                  background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb'
                }}>
                  <input
                    type="text"
                    value={newFloorName}
                    onChange={e => setNewFloorName(e.target.value)}
                    placeholder="New floor name (e.g. Terrace, AC Hall)"
                    onKeyDown={e => e.key === 'Enter' && handleAddFloor()}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
                      fontSize: '13px', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                  <button
                    onClick={handleAddFloor}
                    disabled={!newFloorName.trim() || addingFloor}
                    style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      border: 'none', background: newFloorName.trim() ? '#3b82f6' : '#e5e7eb',
                      color: newFloorName.trim() ? 'white' : '#9ca3af', cursor: newFloorName.trim() ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'
                    }}
                  >
                    <FaPlus size={10} />
                    {addingFloor ? 'Adding...' : 'Add Floor'}
                  </button>
                </div>

                {/* Floor Cards */}
                {floors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>
                    <FaLayerGroup size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '13px', margin: 0 }}>No floors yet. Add your first floor above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {floors.map(floor => {
                      const floorTables = getTablesForFloor(floor.name);
                      const isAddingHere = addingTableForFloor === floor.id;
                      return (
                        <div key={floor.id} style={{
                          background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb',
                          overflow: 'hidden'
                        }}>
                          {/* Floor Header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderBottom: '1px solid #f3f4f6'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaBuilding size={12} color="#6366f1" />
                              <span style={{ fontWeight: 600, fontSize: '13px', color: '#1f2937' }}>{floor.name}</span>
                              <span style={{
                                fontSize: '11px', background: '#f3f4f6', color: '#6b7280',
                                padding: '2px 8px', borderRadius: '10px', fontWeight: 500
                              }}>
                                {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                              </span>
                              {floor.areaChargeType && floor.areaChargeType !== 'none' && (
                                <span style={{
                                  fontSize: '10px', background: '#ede9fe', color: '#7c3aed',
                                  padding: '2px 6px', borderRadius: '8px', fontWeight: 600
                                }}>
                                  {floor.areaChargeType === 'percentage' ? `+${floor.areaChargeValue}%` : `+${formatCurrency(floor.areaChargeValue)}`}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  setAddingTableForFloor(isAddingHere ? null : floor.id);
                                  setNewTableData({ name: '', capacity: 4 });
                                }}
                                style={{
                                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                  border: '1px solid #d1d5db', background: isAddingHere ? '#f3f4f6' : 'white',
                                  color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                              >
                                <FaPlus size={9} />
                                Table
                              </button>
                              <button
                                onClick={() => handleDeleteFloor(floor.id, floor.name)}
                                style={{
                                  padding: '4px 6px', borderRadius: '6px', border: '1px solid #fee2e2',
                                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                }}
                                title="Delete floor"
                              >
                                <FaTrash size={11} color="#ef4444" />
                              </button>
                            </div>
                          </div>

                          {/* Tables */}
                          <div style={{ padding: '10px 14px' }}>
                            {floorTables.length === 0 ? (
                              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>No tables on this floor</p>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {floorTables.map(table => (
                                  <div key={table._id || table.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '12px',
                                    background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151'
                                  }}>
                                    <FaChair size={9} color="#9ca3af" />
                                    <span style={{ fontWeight: 500 }}>{table.name}</span>
                                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>({table.capacity})</span>
                                    <button
                                      onClick={() => {
                                        setDeletingTableId(table._id || table.id);
                                        setDeletingTableName(table.name);
                                        setDeleteTableReason('');
                                      }}
                                      style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '0 2px', display: 'flex', alignItems: 'center',
                                        opacity: 0.4, transition: 'opacity 0.15s'
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                      onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                                      title="Delete table"
                                    >
                                      <FaTimes size={9} color="#ef4444" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Inline Add Table Form */}
                            {isAddingHere && (
                              <div style={{
                                display: 'flex', gap: '6px', marginTop: '10px', padding: '10px',
                                background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', alignItems: 'center'
                              }}>
                                <input
                                  type="text"
                                  value={newTableData.name}
                                  onChange={e => setNewTableData(p => ({ ...p, name: e.target.value }))}
                                  placeholder="Table name (e.g. T1)"
                                  onKeyDown={e => e.key === 'Enter' && handleAddTable(floor.id, floor.name)}
                                  style={{
                                    flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db',
                                    fontSize: '12px', outline: 'none', minWidth: 0
                                  }}
                                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                  autoFocus
                                />
                                <input
                                  type="number"
                                  value={newTableData.capacity}
                                  onChange={e => setNewTableData(p => ({ ...p, capacity: e.target.value }))}
                                  min="1"
                                  style={{
                                    width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
                                    fontSize: '12px', outline: 'none', textAlign: 'center'
                                  }}
                                  title="Capacity"
                                />
                                <button
                                  onClick={() => handleAddTable(floor.id, floor.name)}
                                  disabled={!newTableData.name.trim() || addingTable}
                                  style={{
                                    padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                    border: 'none', background: newTableData.name.trim() ? '#3b82f6' : '#e5e7eb',
                                    color: newTableData.name.trim() ? 'white' : '#9ca3af',
                                    cursor: newTableData.name.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap'
                                  }}
                                >
                                  {addingTable ? '...' : 'Add'}
                                </button>
                                <button
                                  onClick={() => setAddingTableForFloor(null)}
                                  style={{
                                    padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb',
                                    background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                  }}
                                >
                                  <FaTimes size={10} color="#6b7280" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete Table Reason Modal */}
          {deletingTableId && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.4)', zIndex: 10002,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onClick={() => { setDeletingTableId(null); setDeleteTableReason(''); }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'white', borderRadius: '14px', padding: '24px', width: '380px',
                  maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px 0' }}>
                  Delete Table &ldquo;{deletingTableName}&rdquo;?
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 14px 0' }}>
                  Please provide a reason for removing this table.
                </p>
                <textarea
                  value={deleteTableReason}
                  onChange={e => setDeleteTableReason(e.target.value)}
                  placeholder="e.g. Table damaged, area restructured, duplicate entry..."
                  rows={3}
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                    fontSize: '13px', resize: 'none', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setDeletingTableId(null); setDeleteTableReason(''); }}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                      border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTable}
                    disabled={!deleteTableReason.trim()}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      border: 'none', background: deleteTableReason.trim() ? '#ef4444' : '#fca5a5',
                      color: 'white', cursor: deleteTableReason.trim() ? 'pointer' : 'default'
                    }}
                  >
                    Delete Table
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Multi-Tier Pricing Section ── */}
          <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={pricingSettings.multiPricing?.enabled || false}
                  onChange={(e) => handleEnableMultiPricing(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Enable Multi-Tier Pricing
              </label>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                Set different prices for dine-in zones (AC, Non-AC, etc.), takeaway, and delivery. Prices auto-apply based on table/floor mapping.
              </p>
            </div>

            {pricingSettings.multiPricing?.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* ━━━ SECTION 1: DINE-IN ZONES ━━━ */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    padding: '12px 16px', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>🍽️</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                          Dine-In Zones
                          <span style={{
                            fontSize: '11px', fontWeight: 500, color: '#6b7280', marginLeft: '8px',
                            backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'
                          }}>
                            {dineInZoneRules.filter(r => r.isActive).length} active
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>
                          Per-item prices by area. Set prices on Menu page.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 14px' }}>
                    {/* Zone rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                      {dineInZoneRules.map((rule) => {
                        const index = getRuleIndex(rule.id);
                        const selectedFloors = (rule.tableMappings || []);
                        const availableFloors = floors.filter(f => {
                          if (selectedFloors.includes(f.name)) return false;
                          const usedByOther = allRules.find(r => r.id !== rule.id && (r.tableMappings || []).includes(f.name));
                          return !usedByOther;
                        });
                        return (
                        <div key={rule.id} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 10px', backgroundColor: rule.isActive ? '#fff' : '#fafafa',
                          border: '1px solid #e2e8f0', borderRadius: '8px',
                          opacity: rule.isActive ? 1 : 0.5
                        }}>
                          <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={() => updateRule(index, 'isActive', !rule.isActive)}
                            style={{ width: '15px', height: '15px', flexShrink: 0 }}
                          />
                          {rule.type === 'dynamic' ? (
                            <input
                              type="text"
                              value={rule.name}
                              onChange={(e) => updateRule(index, 'name', e.target.value)}
                              placeholder="Zone name"
                              style={{
                                padding: '4px 8px', borderRadius: '5px', border: '1px solid #e2e8f0',
                                fontSize: '13px', fontWeight: 600, color: '#1f2937', background: 'white',
                                width: '120px', flexShrink: 0, boxSizing: 'border-box'
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '13px', fontWeight: 600, color: rule.isActive ? '#1f2937' : '#9ca3af', width: '120px', flexShrink: 0 }}>
                              {rule.name}
                            </span>
                          )}
                          {/* Selected floor chips + dropdown */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', flex: 1 }}>
                            {selectedFloors.map(floorName => (
                              <span key={floorName} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px',
                                padding: '2px 5px 2px 8px', borderRadius: '10px',
                                backgroundColor: '#f5f3ff', border: '1px solid #8b5cf6',
                                color: '#7c3aed', fontWeight: 600
                              }}>
                                {floorName}
                                <button
                                  onClick={() => {
                                    const updated = selectedFloors.filter(m => m !== floorName);
                                    updateRule(index, 'tableMappings', updated);
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '0 1px', fontSize: '13px', lineHeight: 1 }}
                                >&times;</button>
                              </span>
                            ))}
                            {availableFloors.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const updated = [...selectedFloors, e.target.value];
                                    updateRule(index, 'tableMappings', updated);
                                  }
                                }}
                                style={{
                                  padding: '2px 4px', borderRadius: '5px', border: '1px solid #e2e8f0',
                                  fontSize: '11px', color: '#6b7280', background: '#f9fafb', cursor: 'pointer'
                                }}
                              >
                                <option value="">+ Floor</option>
                                {availableFloors.map(f => (
                                  <option key={f.id || f.name} value={f.name}>{f.name}</option>
                                ))}
                              </select>
                            )}
                            {floors.length === 0 && (
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>No floors configured</span>
                            )}
                          </div>
                          {rule.type === 'dynamic' ? (
                            <button
                              onClick={() => removeRule(index)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                            >
                              <FaTrash size={11} />
                            </button>
                          ) : <span style={{ width: '15px', flexShrink: 0 }} />}
                        </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={addCustomRule}
                      style={{
                        backgroundColor: '#f1f5f9', color: '#475569', padding: '5px 12px', borderRadius: '6px',
                        fontWeight: '600', fontSize: '12px', border: '1px dashed #cbd5e1', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <FaPlus size={9} />
                      Add Zone
                    </button>

                    {/* Simple Surcharge Toggle */}
                    <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={pricingSettings.zonePricing?.enabled || false}
                          onChange={(e) => setPricingSettings(prev => ({
                            ...prev,
                            zonePricing: { ...prev.zonePricing, enabled: e.target.checked }
                          }))}
                          style={{ width: '15px', height: '15px' }}
                        />
                        Use simple surcharge instead
                      </label>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '3px 0 0 23px' }}>
                        Flat amount or % on entire bill per floor, instead of per-item prices.
                      </p>

                      {pricingSettings.zonePricing?.enabled && (
                        <div style={{ marginTop: '10px', marginLeft: '23px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Surcharge Zones</span>
                            <button onClick={addZone} style={{
                              backgroundColor: '#10b981', color: 'white', padding: '3px 10px', borderRadius: '6px',
                              fontWeight: '600', fontSize: '11px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <FaPlus size={9} /> Add
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(pricingSettings.zonePricing?.zones || []).map((zone, zoneIndex) => (
                              <div key={zone.id} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px'
                              }}>
                                <input type="checkbox" checked={zone.isActive} onChange={() => updateZone(zoneIndex, 'isActive', !zone.isActive)} style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                                <input type="text" value={zone.name} onChange={(e) => updateZone(zoneIndex, 'name', e.target.value)} placeholder="Name"
                                  style={{ width: '90px', padding: '4px 7px', borderRadius: '5px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', flexShrink: 0 }} />
                                <select value={zone.sectionMatch || ''} onChange={(e) => updateZone(zoneIndex, 'sectionMatch', e.target.value)}
                                  style={{ width: '100px', padding: '4px 7px', borderRadius: '5px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', flexShrink: 0 }}>
                                  <option value="">Floor</option>
                                  {floors.map(floor => (
                                    <option key={floor.id || floor.name} value={floor.name}>{floor.name}</option>
                                  ))}
                                </select>
                                <select value={zone.markupType} onChange={(e) => updateZone(zoneIndex, 'markupType', e.target.value)}
                                  style={{ width: '60px', padding: '4px 5px', borderRadius: '5px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', flexShrink: 0 }}>
                                  <option value="percentage">%</option>
                                  <option value="flat">Flat</option>
                                </select>
                                <input type="number" value={zone.markupValue} onChange={(e) => updateZone(zoneIndex, 'markupValue', parseFloat(e.target.value) || 0)} min="0" placeholder="0"
                                  style={{ width: '60px', padding: '4px 7px', borderRadius: '5px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', flexShrink: 0 }} />
                                <button onClick={() => removeZone(zoneIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            ))}
                            {(pricingSettings.zonePricing?.zones || []).length === 0 && (
                              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '8px' }}>
                                No surcharge zones yet. Click &quot;+ Add&quot; to create one.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '12px', marginBottom: 0 }}>
                      Set per-item zone prices on the Menu page. Items without a custom price use the base price.
                    </p>
                  </div>
                </div>

                {/* ━━━ SECTION 2: TAKEAWAY ━━━ */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    padding: '12px 16px', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>🥡</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>Takeaway</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>
                          {takeawayRule?.isActive ? 'Custom pricing enabled' : 'Uses base price'}
                        </div>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Different prices</span>
                      <div
                        onClick={() => {
                          if (takeawayRule?.isActive) {
                            disableChannelRule(TAKEAWAY_NAMES);
                          } else {
                            enableChannelRule(TAKEAWAY_NAMES, 'Takeaway', 'rule_takeaway');
                          }
                        }}
                        style={{
                          width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                          backgroundColor: takeawayRule?.isActive ? '#10b981' : '#d1d5db',
                          position: 'relative', transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white',
                          position: 'absolute', top: '2px',
                          left: takeawayRule?.isActive ? '18px' : '2px',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }} />
                      </div>
                    </label>
                  </div>

                  {takeawayRule?.isActive && (() => {
                    const tIdx = getRuleIndex(takeawayRule.id);
                    return (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Default Markup</label>
                          <select
                            value={takeawayRule.defaultMarkupType}
                            onChange={(e) => updateRule(tIdx, 'defaultMarkupType', e.target.value)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                          >
                            <option value="none">None (per-item only)</option>
                            <option value="percentage">% markup on base</option>
                            <option value="flat">Flat amount added</option>
                          </select>
                          {takeawayRule.defaultMarkupType !== 'none' && (
                            <input
                              type="number"
                              value={takeawayRule.defaultMarkupValue}
                              onChange={(e) => updateRule(tIdx, 'defaultMarkupValue', parseFloat(e.target.value) || 0)}
                              style={{ width: '70px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                              placeholder="0"
                            />
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0' }}>
                          Set per-item takeaway prices on the Menu page. Uses base price if not set.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* ━━━ SECTION 3: DELIVERY ━━━ */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    padding: '12px 16px', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>🛵</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>Delivery</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>
                          {deliveryRule?.isActive ? 'Custom pricing enabled' : 'Uses base price'}
                        </div>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Different prices</span>
                      <div
                        onClick={() => {
                          if (deliveryRule?.isActive) {
                            disableChannelRule(DELIVERY_NAMES);
                          } else {
                            enableChannelRule(DELIVERY_NAMES, 'Delivery', 'rule_delivery');
                          }
                        }}
                        style={{
                          width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                          backgroundColor: deliveryRule?.isActive ? '#10b981' : '#d1d5db',
                          position: 'relative', transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white',
                          position: 'absolute', top: '2px',
                          left: deliveryRule?.isActive ? '18px' : '2px',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }} />
                      </div>
                    </label>
                  </div>

                  {deliveryRule?.isActive && (() => {
                    const dIdx = getRuleIndex(deliveryRule.id);
                    return (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Default Markup</label>
                          <select
                            value={deliveryRule.defaultMarkupType}
                            onChange={(e) => updateRule(dIdx, 'defaultMarkupType', e.target.value)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                          >
                            <option value="none">None (per-item only)</option>
                            <option value="percentage">% markup on base</option>
                            <option value="flat">Flat amount added</option>
                          </select>
                          {deliveryRule.defaultMarkupType !== 'none' && (
                            <input
                              type="number"
                              value={deliveryRule.defaultMarkupValue}
                              onChange={(e) => updateRule(dIdx, 'defaultMarkupValue', parseFloat(e.target.value) || 0)}
                              style={{ width: '70px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                              placeholder="0"
                            />
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0' }}>
                          Set per-item delivery prices on the Menu page. Uses base price if not set.
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={savePricingSettings}
            disabled={saving}
            style={{
              backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '10px',
              fontWeight: '600', fontSize: '14px', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? <FaSpinner size={14} className="animate-spin" /> : <FaSave size={14} />}
            {saving ? 'Saving...' : 'Save Pricing Settings'}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Loading pricing settings...</p>
        </div>
      )}

      {!selectedRestaurant && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
          <FaStore size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>Please select a restaurant to manage pricing settings</p>
        </div>
      )}
    </div>
  );
};

// Currency Management Component
const CurrencyManagement = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [currencySettings, setCurrencySettings] = useState({
    countryCode: 'IN',
    currencyCode: 'INR',
    currencySymbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-IN',
    taxLabel: 'GST'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const countries = getAllCountriesWithCurrency();
  const filteredCountries = countries.filter(c =>
    c.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currencyCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadCurrencySettings = async (restaurantId) => {
    if (!restaurantId) return;

    setLoading(true);
    try {
      const response = await apiClient.getCurrencySettings(restaurantId);
      if (response.success && response.currencySettings) {
        setCurrencySettings(response.currencySettings);
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrencySettings = async () => {
    if (!selectedRestaurant?.id) return;

    setSaving(true);
    try {
      const response = await apiClient.updateCurrencySettings(selectedRestaurant.id, currencySettings);
      if (response.success) {
        const msg = response.taxSettingsUpdated
          ? 'Currency settings saved! Tax labels were automatically updated.'
          : 'Currency settings saved successfully!';
        alert(msg);
      }
    } catch (error) {
      console.error('Error saving currency settings:', error);
      alert('Error saving currency settings');
    } finally {
      setSaving(false);
    }
  };

  const selectCountry = (countryCode) => {
    const countryData = getCurrencyByCountryCode(countryCode);
    setCurrencySettings({
      ...countryData,
      countryCode: countryData.countryCode,
      currencyCode: countryData.currencyCode,
      currencySymbol: countryData.currencySymbol,
      symbolPosition: countryData.symbolPosition,
      decimalPlaces: countryData.decimalPlaces,
      thousandSeparator: countryData.thousandSeparator,
      decimalSeparator: countryData.decimalSeparator,
      locale: countryData.locale,
      taxLabel: countryData.taxLabel
    });
    setShowDropdown(false);
    setSearchTerm('');
  };

  // Format preview amount
  const formatPreview = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';

    const fixed = num.toFixed(currencySettings.decimalPlaces || 2);
    const [intPart, decPart] = fixed.split('.');
    const sep = currencySettings.thousandSeparator || ',';
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const decSep = currencySettings.decimalSeparator || '.';
    const formattedNum = (currencySettings.decimalPlaces || 2) > 0
      ? `${formattedInt}${decSep}${decPart}`
      : formattedInt;

    const symbol = currencySettings.currencySymbol || '₹';
    return currencySettings.symbolPosition === 'after'
      ? `${formattedNum}${symbol}`
      : `${symbol}${formattedNum}`;
  };

  // Load settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadCurrencySettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.currency-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountryData = countries.find(c => c.countryCode === currencySettings.countryCode);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaMoneyBillWave size={20} />
          Currency Settings
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Configure your restaurant&apos;s currency and number formatting
        </p>
      </div>

      {/* Restaurant Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
          Select Restaurant
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              style={{
                backgroundColor: selectedRestaurant?.id === restaurant.id ? '#111827' : 'white',
                color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '13px',
                border: selectedRestaurant?.id === restaurant.id ? '1px solid #111827' : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FaStore size={12} style={{ marginRight: '6px' }} />
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
          <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading currency settings...</p>
        </div>
      ) : selectedRestaurant ? (
        <div>
          {/* Country Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Country / Region
            </label>
            <div className="currency-dropdown" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {selectedCountryData ? (
                    <>
                      {selectedCountryData.countryName} ({selectedCountryData.currencyCode} - {selectedCountryData.currencySymbol})
                    </>
                  ) : (
                    'Select a country'
                  )}
                </span>
                <FaChevronDown size={12} style={{ color: '#6b7280' }} />
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredCountries.map((country) => (
                      <button
                        key={country.countryCode}
                        onClick={() => selectCountry(country.countryCode)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          backgroundColor: country.countryCode === currencySettings.countryCode ? '#fdf2f8' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        <span style={{ color: '#1f2937' }}>{country.countryName}</span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {country.currencyCode} ({country.currencySymbol})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Currency Preview */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: '#fdf2f8',
            borderRadius: '12px',
            border: '1px solid #f1f5f9'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Preview
            </h4>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Small amount</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {formatPreview(99.99)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Medium amount</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {formatPreview(1234.50)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Large amount</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {formatPreview(12345678.00)}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Currency Details
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Currency Code</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.currencyCode}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Symbol</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.currencySymbol}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Symbol Position</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.symbolPosition === 'before' ? 'Before amount' : 'After amount'}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Decimal Places</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.decimalPlaces}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Tax Label</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.taxLabel}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Locale</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {currencySettings.locale}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={saveCurrencySettings}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#9ca3af' : '#ef4444',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {saving ? (
                <>
                  <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={14} />
                  Save Currency Settings
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <FaStore size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>
            Please select a restaurant to manage currency settings
          </p>
        </div>
      )}
    </div>
  );
};

// Setting Toggle Component
const SettingToggle = ({ setting, printSettings, toggleSetting, disabled = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px',
      backgroundColor: disabled ? '#f9fafb' : '#faf5f7',
      borderRadius: '12px',
      border: '1px solid #f1f5f9',
      opacity: disabled ? 0.6 : 1
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
      <div style={{
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        background: printSettings[setting.key] && !disabled ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: printSettings[setting.key] && !disabled ? 'white' : '#6b7280',
        flexShrink: 0
      }}>
        {setting.icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight: '600',
          color: disabled ? '#9ca3af' : '#1f2937',
          margin: '0 0 2px 0',
          fontSize: '13px'
        }}>
          {setting.title}
        </p>
        <p style={{
          color: disabled ? '#9ca3af' : '#6b7280',
          margin: 0,
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          {setting.description}
        </p>
      </div>
    </div>
    <button
      onClick={() => !disabled && toggleSetting(setting.key)}
      disabled={disabled}
      style={{
        width: '44px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        backgroundColor: printSettings[setting.key] && !disabled ? '#ef4444' : '#d1d5db',
        flexShrink: 0,
        marginLeft: '12px'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '3px',
        left: printSettings[setting.key] ? '21px' : '3px',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }} />
    </button>
  </div>
);

// Detect platform for KOT Printer download (client-side)
const getDownloadPlatform = () => {
  if (typeof navigator === 'undefined') return { isWindows: false, isMac: false };
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isWindows = /Win/i.test(ua) || /Win/i.test(platform);
  const isMac = /Mac/i.test(ua) || /Mac/i.test(platform);
  return { isWindows, isMac };
};

// Print Settings Component
const PrintSettings = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [printSettings, setPrintSettings] = useState({
    // Dashboard UI settings
    kotPrinterEnabled: true,
    manualPrintEnabled: true,
    showKOTSummaryAfterOrder: true,
    showBillSummaryAfterBilling: true,
    // Auto-print triggers
    autoPrintOnKOT: true,
    autoPrintOnBilling: false,
    // Advanced
    usePusherForKOT: false,
    // Future reserved
    autoPrintOnOnlineOrder: false,
    autoPrintOnTableCall: false,
    // Bill print font size & font
    billFontSize: 'medium',
    billFontScale: 100,
    billFontFamily: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState(null); // { type: 'success'|'error', message }
  const [installerUrls, setInstallerUrls] = useState({ windowsUrl: null, macUrl: null });
  const [installerUrlsLoading, setInstallerUrlsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [platform, setPlatform] = useState({ isWindows: false, isMac: false });

  const loadPrintSettings = async (restaurantId) => {
    if (!restaurantId) return;

    setLoading(true);
    try {
      const response = await apiClient.getPrintSettings(restaurantId);
      if (response.success) {
        setPrintSettings(response.printSettings);
      }
    } catch (error) {
      console.error('Error loading print settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrintSettings = async () => {
    if (!selectedRestaurant?.id) return;

    setSaving(true);
    setSaveNotification(null);
    try {
      const response = await apiClient.updatePrintSettings(selectedRestaurant.id, printSettings);
      if (response.success) {
        setSaveNotification({ type: 'success', message: 'Print settings saved successfully!' });
        setTimeout(() => setSaveNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error saving print settings:', error);
      setSaveNotification({ type: 'error', message: 'Failed to save print settings. Please try again.' });
      setTimeout(() => setSaveNotification(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    setPrintSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Load print settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadPrintSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);

  // Load KOT Printer installer URLs and detect platform / owner
  useEffect(() => {
    setPlatform(getDownloadPlatform());
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsOwner(user.role === 'owner');
      }
    } catch (_) {}
    let cancelled = false;
    (async () => {
      setInstallerUrlsLoading(true);
      try {
        const res = await apiClient.getPrintInstallerUrls();
        if (!cancelled && res.success) {
          setInstallerUrls({ windowsUrl: res.windowsUrl || null, macUrl: res.macUrl || null });
        }
      } catch (_) {
        if (!cancelled) setInstallerUrls({ windowsUrl: null, macUrl: null });
      } finally {
        if (!cancelled) setInstallerUrlsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const settingsConfig = [
    // Main settings
    {
      key: 'kotPrinterEnabled',
      title: 'KOT Printer App (Auto-Print)',
      description: 'Enable automatic printing via dine-kot-printer app',
      icon: <FaPrint size={18} />,
      section: 'main'
    },
    {
      key: 'manualPrintEnabled',
      title: 'Manual Print Button',
      description: 'Show manual print button on dashboard order summary',
      icon: <FaReceipt size={18} />,
      section: 'main'
    },
    {
      key: 'showKOTSummaryAfterOrder',
      title: 'Show KOT Summary After Order',
      description: 'Display order summary on dashboard after placing order to kitchen',
      icon: <FaEye size={18} />,
      section: 'main'
    },
    {
      key: 'showBillSummaryAfterBilling',
      title: 'Show Bill Summary After Billing',
      description: 'Display bill summary on dashboard after completing billing',
      icon: <FaEye size={18} />,
      section: 'main'
    },
    // Auto-print triggers (for dine-kot-printer app)
    {
      key: 'autoPrintOnKOT',
      title: 'Auto-Print on KOT',
      description: 'Automatically print when order is sent to kitchen (for kot-printer app)',
      icon: <FaPrint size={18} />,
      section: 'autoprint'
    },
    {
      key: 'autoPrintOnBilling',
      title: 'Auto-Print on Billing',
      description: 'Automatically print bill when billing is completed (for kot-printer app)',
      icon: <FaReceipt size={18} />,
      section: 'autoprint'
    },
    // Advanced settings
    {
      key: 'usePusherForKOT',
      title: 'Use Pusher for Real-time Print',
      description: 'Use real-time Pusher events instead of polling (Advanced)',
      icon: <FaClock size={18} />,
      section: 'advanced'
    },
    // Future reserved (disabled)
    {
      key: 'autoPrintOnOnlineOrder',
      title: 'Auto-Print Online Orders',
      description: 'Auto-print when online/delivery order is received (Coming soon)',
      icon: <FaStore size={18} />,
      section: 'future',
      disabled: true
    },
    {
      key: 'autoPrintOnTableCall',
      title: 'Auto-Print Table Calls',
      description: 'Auto-print when customer requests service (Coming soon)',
      icon: <FaUsers size={18} />,
      section: 'future',
      disabled: true
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPrint size={20} />
          Print Settings
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Configure printing behavior and order summary display settings
        </p>
      </div>

      {/* Restaurant Selection */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
          Select Restaurant
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                setSelectedRestaurant(restaurant);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '13px',
                border: selectedRestaurant?.id === restaurant.id ? '1px solid #111827' : '1px solid #e5e7eb',
                background: selectedRestaurant?.id === restaurant.id ? '#111827' : 'white',
                color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaStore size={14} />
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FaSpinner className="spin" size={24} style={{ color: '#ef4444' }} />
          <p style={{ color: '#6b7280', marginTop: '12px' }}>Loading print settings...</p>
        </div>
      ) : selectedRestaurant ? (
        <>
          {/* Saving overlay */}
          {saving && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 9998,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(2px)'
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                background: 'white', padding: '32px 48px', borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <FaSpinner className="spin" size={28} style={{ color: '#ef4444' }} />
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: 0 }}>Saving print settings...</p>
              </div>
            </div>
          )}

          {/* Toast notification */}
          {saveNotification && (
            <div style={{
              padding: '12px 18px', borderRadius: '10px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: '600',
              backgroundColor: saveNotification.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: saveNotification.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${saveNotification.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {saveNotification.type === 'success' ? <FaCheck size={14} /> : <FaTimes size={14} />}
              {saveNotification.message}
            </div>
          )}

          {/* Save Button (top) */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={savePrintSettings}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 24px',
                background: saving ? '#d1d5db' : '#111827',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(236,72,153,0.35)',
                transition: 'all 0.2s', maxWidth: '300px'
              }}
            >
              {saving ? <><FaSpinner className="spin" size={16} /> Saving...</> : <><FaSave size={16} /> Save Print Settings</>}
            </button>
          </div>

          {/* Two-column layout: All settings left, Font preview right */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* LEFT COLUMN — All Settings */}
            <div style={{ flex: '1', minWidth: '340px', maxWidth: '640px' }}>

              {/* Dashboard Settings */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dashboard Settings
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {settingsConfig.filter(s => s.section === 'main').map((setting) => (
                    <SettingToggle key={setting.key} setting={setting} printSettings={printSettings} toggleSetting={toggleSetting} />
                  ))}
                </div>
              </div>

            </div>
            {/* /LEFT COLUMN end */}

            {/* RIGHT COLUMN — Bill Font Scale + Live Preview */}
            <div style={{ flex: '1', minWidth: '320px', position: 'sticky', top: '20px' }}>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '20px',
                backgroundColor: '#fafafa'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bill Print Font Size
                </p>
                <p style={{ color: '#9ca3af', margin: '0 0 16px 0', fontSize: '12px' }}>
                  Drag the slider to set font size for printed bills &amp; KOT receipts.
                </p>

                {/* Scale slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Small</span>
                    <span style={{
                      fontSize: '15px', fontWeight: '700', color: '#111827',
                      background: '#f3f4f6', borderRadius: '8px', padding: '4px 12px'
                    }}>
                      {printSettings.billFontScale || 100}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Large</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={printSettings.billFontScale || 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPrintSettings(prev => ({ ...prev, billFontScale: val }));
                    }}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((printSettings.billFontScale || 100) - 50) * 100 / 100}%, #e5e7eb ${((printSettings.billFontScale || 100) - 50) * 100 / 100}%, #e5e7eb 100%)`,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>50%</span>
                    <button
                      onClick={() => setPrintSettings(prev => ({ ...prev, billFontScale: 100 }))}
                      style={{
                        fontSize: '10px', color: '#ef4444', background: 'none', border: 'none',
                        cursor: 'pointer', fontWeight: '600', padding: 0, textDecoration: 'underline'
                      }}
                    >
                      Reset to default (100%)
                    </button>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>150%</span>
                  </div>
                </div>

                {/* Font Family Picker */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0' }}>
                    Bill Font Family
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {PRINT_FONTS.map((font) => {
                      const isSelected = (printSettings.billFontFamily || 'default') === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => setPrintSettings(prev => ({ ...prev, billFontFamily: font.id }))}
                          style={{
                            padding: '8px 10px',
                            border: isSelected ? '2px solid #111827' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            background: isSelected ? '#f9fafb' : 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            position: 'relative'
                          }}
                        >
                          <span style={{
                            fontFamily: font.family,
                            fontSize: '13px',
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? '#111827' : '#374151',
                            display: 'block',
                            lineHeight: '1.3'
                          }}>
                            {font.label}
                          </span>
                          <span style={{
                            fontFamily: font.family,
                            fontSize: '10px',
                            color: '#9ca3af',
                            display: 'block',
                            marginTop: '2px'
                          }}>
                            ₹530.00 — Butter Chicken
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live preview */}
                <div style={{
                  maxHeight: '480px',
                  overflowY: 'auto',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Preview (80mm receipt)
                  </p>
                  {(() => {
                    const f = getPrintFontSizes(printSettings.billFontScale || 100);
                    const ff = getPrintFontFamily(printSettings.billFontFamily);
                    const rName = selectedRestaurant?.name || 'My Restaurant';
                    return (
                      <div style={{
                        fontFamily: ff,
                        maxWidth: '80mm',
                        margin: '0 auto',
                        backgroundColor: 'white',
                        padding: '16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: f.body,
                        lineHeight: f.lineHeight,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                          <div style={{ fontSize: f.restaurantName, fontWeight: 'bold', textTransform: 'uppercase' }}>{rName}</div>
                          <div style={{ fontSize: f.billTitle, fontWeight: 'bold', marginTop: '4px' }}>--- BILL ---</div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '6px 0', color: '#9ca3af', fontSize: f.info }}>- - - - - - - - - - - - - - - -</div>
                        <div style={{ margin: '8px 0', fontSize: f.info }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}><span>Bill#:</span><span><strong>1042</strong></span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}><span>Date:</span><span>06 Apr 2026 2:30 PM</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}><span>Table:</span><span>T-5</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}><span>Payment:</span><span>CASH</span></div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '6px 0', color: '#9ca3af', fontSize: f.info }}>- - - - - - - - - - - - - - - -</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', borderBottom: '1px dashed #000', padding: '4px', fontSize: f.th }}>Item</th>
                              <th style={{ textAlign: 'center', borderBottom: '1px dashed #000', padding: '4px', fontSize: f.th }}>Qty</th>
                              <th style={{ textAlign: 'right', borderBottom: '1px dashed #000', padding: '4px', fontSize: f.th }}>Amt</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td style={{ fontSize: f.td, padding: f.tdPadding }}>Butter Chicken</td><td style={{ textAlign: 'center', fontSize: f.td, padding: f.tdPadding }}>1</td><td style={{ textAlign: 'right', fontSize: f.td, padding: f.tdPadding }}>₹320.00</td></tr>
                            <tr><td style={{ fontSize: f.td, padding: f.tdPadding }}>Garlic Naan</td><td style={{ textAlign: 'center', fontSize: f.td, padding: f.tdPadding }}>2</td><td style={{ textAlign: 'right', fontSize: f.td, padding: f.tdPadding }}>₹90.00</td></tr>
                            <tr><td style={{ fontSize: f.td, padding: f.tdPadding }}>Masala Dosa</td><td style={{ textAlign: 'center', fontSize: f.td, padding: f.tdPadding }}>1</td><td style={{ textAlign: 'right', fontSize: f.td, padding: f.tdPadding }}>₹120.00</td></tr>
                          </tbody>
                        </table>
                        <div style={{ borderTop: '1px dashed #000', marginTop: '8px', paddingTop: '4px', fontSize: f.totalSection }}>
                          <div style={{ fontSize: f.info, margin: '8px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}><span>Subtotal:</span><span>₹530.00</span></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', fontSize: f.info }}><span>GST (5%)</span><span>₹26.50</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: f.totalRow, marginTop: '4px' }}>
                            <span>TOTAL:</span><span>₹556.50</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '6px 0', color: '#9ca3af', fontSize: f.info }}>=  =  =  =  =  =  =  =  =  =  =</div>
                        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: f.footer }}>
                          <p style={{ margin: '0 0 4px 0' }}>Thank you for dining with us!</p>
                          <p style={{ fontSize: f.poweredBy, margin: 0, opacity: 0.6 }}>Powered by DineOpen</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          {/* /RIGHT COLUMN end */}
          </div>
          {/* /Two-column flex end — but we continue left column content below for small screens */}

          {/* Auto-Print Settings */}
          <div style={{ marginBottom: '20px', maxWidth: '640px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Auto-Print Triggers (for KOT Printer App)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settingsConfig.filter(s => s.section === 'autoprint').map((setting) => (
                <SettingToggle key={setting.key} setting={setting} printSettings={printSettings} toggleSetting={toggleSetting} />
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div style={{ marginBottom: '20px', maxWidth: '640px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Settings
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settingsConfig.filter(s => s.section === 'advanced').map((setting) => (
                <SettingToggle key={setting.key} setting={setting} printSettings={printSettings} toggleSetting={toggleSetting} />
              ))}
            </div>
          </div>

          {/* Future Settings */}
          <div style={{ marginBottom: '24px', maxWidth: '640px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Coming Soon
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
              {settingsConfig.filter(s => s.section === 'future').map((setting) => (
                <SettingToggle key={setting.key} setting={setting} printSettings={printSettings} toggleSetting={toggleSetting} disabled />
              ))}
            </div>
          </div>

          {/* Download KOT Printer App */}
          <div style={{ marginBottom: '24px', maxWidth: '640px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Download KOT Printer App
            </p>
            {installerUrlsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', color: '#6b7280', fontSize: '14px' }}>
                <FaSpinner className="spin" size={18} style={{ color: '#ef4444' }} />
                Loading...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Auto-selected primary: recommended for user's device */}
                {(platform.isWindows && installerUrls.windowsUrl) || (platform.isMac && installerUrls.macUrl) ? (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #111827',
                    background: 'linear-gradient(135deg, #fdf2f8, #fef2f2)',
                    boxShadow: '0 4px 12px rgba(236,72,153,0.2)'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Recommended for your device
                    </p>
                    <a
                      href={platform.isWindows ? installerUrls.windowsUrl : installerUrls.macUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '15px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
                      }}
                    >
                      <FaDownload size={18} />
                      {platform.isWindows ? 'Download for Windows (.exe)' : 'Download for Mac (.dmg)'}
                    </a>
                  </div>
                ) : null}
                {/* Or choose any platform */}
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', margin: 0 }}>
                  Or download for another platform
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Windows card */}
                  <div
                    style={{
                      flex: '1',
                      minWidth: '200px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: platform.isWindows ? '1px solid #111827' : '1px solid #e5e7eb',
                      background: platform.isWindows ? 'linear-gradient(135deg, #fdf2f8, #fef2f2)' : '#fafafa',
                      boxShadow: platform.isWindows ? '0 4px 12px rgba(236,72,153,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <FaWindows size={20} style={{ color: '#0078d4' }} />
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Windows</span>
                      {platform.isWindows && (
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase' }}>Your device</span>
                      )}
                    </div>
                    {installerUrls.windowsUrl ? (
                      <a
                        href={installerUrls.windowsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '13px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <FaDownload size={12} />
                        Download .exe
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Not available</span>
                    )}
                  </div>
                  {/* Mac card */}
                  <div
                    style={{
                      flex: '1',
                      minWidth: '200px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: platform.isMac ? '1px solid #111827' : '1px solid #e5e7eb',
                      background: platform.isMac ? 'linear-gradient(135deg, #fdf2f8, #fef2f2)' : '#fafafa',
                      boxShadow: platform.isMac ? '0 4px 12px rgba(236,72,153,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <FaApple size={20} style={{ color: '#555' }} />
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Mac</span>
                      {platform.isMac && (
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase' }}>Your device</span>
                      )}
                    </div>
                    {installerUrls.macUrl ? (
                      <a
                        href={installerUrls.macUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '13px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <FaDownload size={12} />
                        Download .dmg
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Not available</span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <Link
                    href="/dineopenprintupload/upload"
                    style={{
                      fontSize: '13px',
                      color: '#ef4444',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Upload new installers (owner only)
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Save Button (bottom) */}
          <div style={{ marginTop: '8px', maxWidth: '640px' }}>
            <button
              onClick={savePrintSettings}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px 28px',
                background: saving ? '#d1d5db' : '#111827',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(236,72,153,0.35)',
                transition: 'all 0.2s', width: '100%'
              }}
            >
              {saving ? <><FaSpinner className="spin" size={16} /> Saving...</> : <><FaSave size={16} /> Save Print Settings</>}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          <FaStore size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>
            Please select a restaurant to manage print settings
          </p>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'settings');
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [offersSelectedRestaurant, setOffersSelectedRestaurant] = useState(null); // null = use selectedRestaurant
  const [loading, setLoading] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: ''
  });
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState({
    id: '', name: '', description: '', address: '', city: '',
    phone: '', email: '', cuisine: '', businessType: 'restaurant',
    legalBusinessName: '', gstin: '', staffCount: '', seatingCapacity: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  const ROLE_DEFAULT_PAGE_ACCESS = {
    admin:    { dashboard:true, history:true, tables:true, menu:true, analytics:true, inventory:true, kot:true, admin:{ settings:true, tax:true, pricing:true, payments:true, billingSettings:true, currency:true, print:true, features:true, restaurants:true, staff:true, orderManagement:true, offers:true, loyalty:true, googleReviews:true, whatsapp:true }, completeBill:true, invoice:true, customers:true, offers:true },
    manager:  { dashboard:true, history:true, tables:true, menu:true, analytics:true, inventory:true, kot:true, admin:false, completeBill:true, invoice:true, customers:true, offers:true },
    waiter:   { dashboard:true, history:true, tables:true, menu:true, analytics:false, inventory:false, kot:false, admin:false, completeBill:false, invoice:false, customers:false, offers:false },
    cashier:  { dashboard:true, history:true, tables:false, menu:true, analytics:false, inventory:false, kot:false, admin:false, completeBill:true, invoice:true, customers:false, offers:false },
    employee: { dashboard:true, history:true, tables:true, menu:true, analytics:false, inventory:false, kot:false, admin:false, completeBill:false, invoice:false, customers:false, offers:false },
    sales:    { dashboard:true, history:true, tables:false, menu:true, analytics:false, inventory:false, kot:false, admin:false, completeBill:false, invoice:false, customers:true, offers:true },
  };

  const ROLE_DESCRIPTIONS = {
    admin:    'Full access like owner, scoped to assigned restaurants. Can manage multiple locations.',
    manager:  'Elevated staff with access to most features. Cannot access admin settings by default.',
    waiter:   'Service staff. Basic access to tables, orders, and menu.',
    cashier:  'Billing-focused staff. Access to POS, orders, and invoices.',
    employee: 'Basic staff. Only gets access to what you explicitly grant.',
    sales:    'Sales staff. Access to customers and offers by default.',
  };

  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    username: '',
    role: 'employee',
    startDate: new Date().toISOString().split('T')[0],
    pageAccess: {
      dashboard: true,
      history: true,
      tables: true,
      menu: true,
      analytics: false,
      inventory: false,
      kot: false,
      admin: false,
      completeBill: false,
      invoice: false,
      customers: false,
      offers: false
    }
  });
  const [showPassword, setShowPassword] = useState({});
  const [customRoles, setCustomRoles] = useState(['employee', 'waiter', 'cashier', 'manager', 'sales', 'admin']);
  const [newCustomRole, setNewCustomRole] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('owner');
  const [copiedCredentials, setCopiedCredentials] = useState({});
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [staffForReset, setStaffForReset] = useState(null);
  const [resetPasswordMode, setResetPasswordMode] = useState('generate'); // 'generate' | 'set'
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState(null); // { temporaryPassword, loginId, username } after generate
  const [showResetTempPassword, setShowResetTempPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [orderManagementSeqEnabled, setOrderManagementSeqEnabled] = useState(false);
  const [orderManagementSaving, setOrderManagementSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [posSettings, setPosSettings] = useState({});
  const [posSettingsSaving, setPosSettingsSaving] = useState(false);
  const [businessType, setBusinessType] = useState('restaurant');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };
  // Full-screen saving overlay state
  const [generalSaving, setGeneralSaving] = useState(false);

  // PIN settings state
  const [pinStatus, setPinStatus] = useState({ pinEnabled: false, pinUpdatedAt: null });
  const [pinFormMode, setPinFormMode] = useState('idle'); // 'idle', 'set', 'change', 'disable'
  const [pinFormData, setPinFormData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMessage, setPinMessage] = useState({ type: '', text: '' });

  const loadPinStatus = async () => {
    try {
      const data = await apiClient.getPinStatus();
      setPinStatus({ pinEnabled: data.pinEnabled, pinUpdatedAt: data.pinUpdatedAt });
    } catch (err) {
      console.error('Failed to load PIN status:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      loadPinStatus();
    }
  }, [activeTab]);

  const handlePinSubmit = async () => {
    setPinSaving(true);
    setPinMessage({ type: '', text: '' });
    try {
      if (pinFormMode === 'set') {
        if (!/^\d{5,10}$/.test(pinFormData.newPin)) {
          setPinMessage({ type: 'error', text: 'PIN must be 5-10 digits' });
          setPinSaving(false);
          return;
        }
        if (pinFormData.newPin !== pinFormData.confirmPin) {
          setPinMessage({ type: 'error', text: 'PINs do not match' });
          setPinSaving(false);
          return;
        }
        await apiClient.setPin(pinFormData.newPin, pinFormData.confirmPin);
        setPinMessage({ type: 'success', text: 'PIN enabled successfully!' });
      } else if (pinFormMode === 'change') {
        if (!/^\d{5,10}$/.test(pinFormData.newPin)) {
          setPinMessage({ type: 'error', text: 'New PIN must be 5-10 digits' });
          setPinSaving(false);
          return;
        }
        if (pinFormData.newPin !== pinFormData.confirmPin) {
          setPinMessage({ type: 'error', text: 'New PINs do not match' });
          setPinSaving(false);
          return;
        }
        await apiClient.changePin(pinFormData.currentPin, pinFormData.newPin, pinFormData.confirmPin);
        setPinMessage({ type: 'success', text: 'PIN changed successfully!' });
      } else if (pinFormMode === 'disable') {
        await apiClient.disablePin(pinFormData.currentPin);
        setPinMessage({ type: 'success', text: 'PIN login disabled' });
      }
      setPinFormData({ currentPin: '', newPin: '', confirmPin: '' });
      setPinFormMode('idle');
      await loadPinStatus();
    } catch (err) {
      setPinMessage({ type: 'error', text: err.message || err.error || 'Operation failed' });
    } finally {
      setPinSaving(false);
    }
  };

  // Features toggle state
  const [featureNotAllowed, setFeatureNotAllowed] = useState([]);
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [featuresMessage, setFeaturesMessage] = useState({ type: '', text: '' });

  const featureItems = [
    { id: 'pos', name: 'POS / Dashboard', icon: FaCashRegister, description: 'Point of sale billing screen', color: '#ef4444' },
    { id: 'orders', name: 'Order History', icon: FaClipboardList, description: 'View past orders and receipts', color: '#f59e0b' },
    { id: 'kot', name: 'Kitchen Orders (KOT)', icon: FaFire, description: 'Kitchen order ticket management', color: '#f97316' },
    { id: 'tables', name: 'Table Management', icon: FaChair, description: 'Manage restaurant tables and seating', color: '#3b82f6' },
    { id: 'menu', name: 'Menu Management', icon: FaUtensils, description: 'Add, edit and organize menu items', color: '#10b981' },
    { id: 'inventory', name: 'Inventory', icon: FaBoxes, description: 'Track stock and ingredients', color: '#059669' },
    { id: 'customers', name: 'Customers', icon: FaUsers, description: 'Customer database and insights', color: '#8b5cf6' },
    { id: 'shifts', name: 'Shifts', icon: FaCalendarAlt, description: 'Staff shift scheduling', color: '#f97316' },
    { id: 'billing', name: 'Billing & Plans', icon: FaCreditCard, description: 'Subscription and billing management', color: '#06b6d4' },
    { id: 'dineai', name: 'DineAI Studio', icon: FaRobot, description: 'AI-powered restaurant tools', color: '#6366f1' },
    { id: 'hotel', name: 'Hotel PMS', icon: FaBuilding, description: 'Hotel property management system', color: '#6366f1' },
    { id: 'invoice', name: 'Invoice & Billing', icon: FaFileInvoice, description: 'Professional invoicing, quotes, and expense tracking', color: '#0ea5e9' },
    { id: 'multiPricing', name: 'Multi-Tier Pricing', icon: FaLayerGroup, description: 'Per-item pricing for AC/Non-AC/Takeaway and custom rules', color: '#8b5cf6' },
    { id: 'google-reviews', name: 'Google Reviews', icon: FaGoogle, description: 'Manage, reply & collect Google Reviews', color: '#ea4335' },
  ];

  useEffect(() => {
    if (activeTab === 'features') {
      (async () => {
        try {
          const data = await apiClient.getUserPageAccess();
          setFeatureNotAllowed(data.notAllowedPages || []);
        } catch (err) {
          console.error('Failed to load features:', err);
        }
      })();
    }
  }, [activeTab]);

  const toggleFeature = (id) => {
    setFeatureNotAllowed(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
    setFeaturesMessage({ type: '', text: '' });
  };

  const handleSaveFeatures = async () => {
    setFeaturesSaving(true);
    setFeaturesMessage({ type: '', text: '' });
    try {
      await apiClient.updateFeatures(featureNotAllowed);
      localStorage.setItem('navNotAllowedPages', JSON.stringify(featureNotAllowed));
      window.dispatchEvent(new CustomEvent('featuresUpdated', { detail: { notAllowedPages: featureNotAllowed } }));
      setFeaturesMessage({ type: 'success', text: 'Features updated! Sidebar refreshed.' });
    } catch (err) {
      setFeaturesMessage({ type: 'error', text: err.message || 'Failed to save features' });
    } finally {
      setFeaturesSaving(false);
    }
  };

  // Billing settings state
  const [billingSettings, setBillingSettings] = useState({
    serviceChargeEnabled: false,
    serviceChargeRate: 10,
    serviceChargeLabel: 'Service Charge',
    roundOffEnabled: false,
    roundOffTo: 1,
    tipsEnabled: false,
    tipPresets: [5, 10, 15, 20],
    cashTenderingEnabled: false,
    denominations: [10, 20, 50, 100, 200, 500, 2000],
    splitPaymentEnabled: false,
    settlementShowOnDashboard: true,
    settlementShowOnOrderHistory: false,
    partialPaymentEnabled: false,
    compVoidEnabled: false,
    compVoidRequiresPin: true,
    managerPin: '',
    refundsEnabled: false,
    refundsRequireApproval: true,
  });
  const [billingSaving, setBillingSaving] = useState(false);
  const [billingMessage, setBillingMessage] = useState({ type: '', text: '' });
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'billing-settings' && selectedRestaurant?.id) {
      setBillingLoading(true);
      (async () => {
        try {
          const data = await apiClient.getBillingSettings(selectedRestaurant.id);
          if (data.settings) setBillingSettings(data.settings);
        } catch (err) {
          console.error('Failed to load billing settings:', err);
        } finally {
          setBillingLoading(false);
        }
      })();
    }
  }, [activeTab, selectedRestaurant?.id]);

  const handleSaveBillingSettings = async () => {
    if (!selectedRestaurant?.id) return;
    setBillingSaving(true);
    setBillingMessage({ type: '', text: '' });
    try {
      const result = await apiClient.updateBillingSettings(selectedRestaurant.id, billingSettings);
      if (result.settings) setBillingSettings(result.settings);
      const updated = { ...selectedRestaurant, billingSettings: result.settings || billingSettings };
      localStorage.setItem('selectedRestaurant', JSON.stringify(updated));
      setSelectedRestaurant(updated);
      setBillingMessage({ type: 'success', text: 'Billing settings saved successfully!' });
    } catch (err) {
      setBillingMessage({ type: 'error', text: err.message || 'Failed to save billing settings' });
    } finally {
      setBillingSaving(false);
    }
  };

  const updateBillingSetting = (key, value) => {
    setBillingSettings(prev => ({ ...prev, [key]: value }));
    setBillingMessage({ type: '', text: '' });
  };

  const handleSaveDashboardSettings = async () => {
    if (!selectedRestaurant) return;
    setPosSettingsSaving(true);
    try {
      await apiClient.updateRestaurant(selectedRestaurant.id, { posSettings, businessType });
      const updated = { ...selectedRestaurant, posSettings, businessType };
      localStorage.setItem('selectedRestaurant', JSON.stringify(updated));
      setSelectedRestaurant(updated);
      window.location.reload();
    } catch (err) {
      console.error('Failed to save posSettings:', err);
      setPosSettingsSaving(false);
    }
  };

  const navGroups = [
    { label: 'SETTINGS', items: [
      { id: 'settings', label: 'General', icon: FaUserCog },
      { id: 'tax', label: 'Tax Management', icon: FaPercentage },
      { id: 'pricing', label: 'Pricing Rules', icon: FaSlidersH },
      { id: 'payments', label: 'Payment Settings', icon: FaCreditCard },
      { id: 'billing-settings', label: 'Billing', icon: FaFileInvoice },
      { id: 'currency', label: 'Currency', icon: FaMoneyBillWave },
      { id: 'print', label: 'Print Settings', icon: FaPrint },
      { id: 'features', label: 'Features', icon: FaToggleOn },
    ]},
    { label: 'MANAGE', items: [
      { id: 'restaurants', label: 'Restaurants', icon: FaStore },
      { id: 'staff', label: 'Staff', icon: FaUsers },
    ]},
    { label: 'OPERATIONS', items: [
      { id: 'order-management', label: 'Order Management', icon: FaReceipt },
      { id: 'offers', label: 'Offers & Discounts', icon: FaTag },
      { id: 'loyalty', label: 'Loyalty Program', icon: FaStar },
    ]},
    { label: 'INTEGRATIONS', items: [
      { id: 'google-reviews', label: 'Google Reviews', icon: FaGoogle },
      { id: 'whatsapp', label: 'WhatsApp', icon: FaPhone },
    ]},
  ];
  // Filter admin tabs based on user's pageAccess.admin sub-permissions
  const filteredNavGroups = (() => {
    if (currentUserRole === 'owner') return navGroups; // Owners see all tabs
    try {
      const cached = typeof window !== 'undefined' && localStorage.getItem('navPageAccess');
      if (!cached) return navGroups;
      const pa = JSON.parse(cached);
      const adminPerms = resolveFeaturePermissions(pa, 'admin');
      return navGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
          const permKey = ADMIN_TAB_ID_TO_KEY[item.id];
          return permKey ? !!adminPerms[permKey] : true;
        })
      })).filter(group => group.items.length > 0);
    } catch { return navGroups; }
  })();

  // Auto-select first permitted tab if current tab is not in filtered list
  const allFilteredItems = filteredNavGroups.flatMap(g => g.items);
  useEffect(() => {
    if (allFilteredItems.length > 0 && !allFilteredItems.find(i => i.id === activeTab)) {
      setActiveTab(allFilteredItems[0].id);
    }
  }, [activeTab, allFilteredItems.length]);

  const activeNavItem = filteredNavGroups.flatMap(function(g) { return g.items; }).find(function(i) { return i.id === activeTab; });

  // Sync current language and posSettings when opening Settings tab
  useEffect(() => {
    if (activeTab === 'settings' && typeof window !== 'undefined') {
      setCurrentLang(getCurrentLanguage());
      try {
        const saved = localStorage.getItem('selectedRestaurant');
        if (saved) {
          const r = JSON.parse(saved);
          setPosSettings(r.posSettings || {});
          setBusinessType(r.businessType || 'restaurant');
        }
      } catch {}
    }
  }, [activeTab]);

  // Sync order management setting from selected restaurant when tab or restaurant changes
  useEffect(() => {
    if (activeTab === 'order-management' && selectedRestaurant) {
      setOrderManagementSeqEnabled(!!(selectedRestaurant.orderSettings && selectedRestaurant.orderSettings.sequentialOrderIdEnabled));
    }
  }, [activeTab, selectedRestaurant]);

  // Hide staff detail when leaving Staff tab so it doesn’t show on Order Management / other tabs
  useEffect(() => {
    if (activeTab !== 'staff' && selectedStaff) {
      setSelectedStaff(null);
    }
  }, [activeTab, selectedStaff]);

  // Client-side hydration and mobile detection
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check authorization
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Admin page: Checking authorization...');
        const userData = localStorage.getItem('user');
        const authToken = localStorage.getItem('authToken');
        
        console.log('Admin page: User data exists:', !!userData);
        console.log('Admin page: Auth token exists:', !!authToken);
        
        if (!userData || !authToken) {
          // Skip redirect in mobile embed (WebView) — let the native app handle auth
          if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) return;
          console.log('Admin page: No user data or token, redirecting to login');
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        console.log('Admin page: User role:', user.role);
        
        setCurrentUserRole(user.role || 'owner');
        
        // Allow owners, admin roles, and staff with any admin tab permission
        const hasAdminPageAccess = ['owner', 'admin'].includes(user.role) || (() => {
          const pa = user.pageAccess?.admin;
          if (typeof pa === 'object' && pa !== null) return Object.values(pa).some(Boolean);
          return !!pa;
        })();
        if (user.role && !hasAdminPageAccess) {
          // Skip redirect in mobile embed (WebView) — app controls access
          if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) {
            // Allow through in mobile embed
          } else {
            console.log('Admin page: User does not have admin access, redirecting to home');
            router.push('/');
            return;
          }
        }

        console.log('Admin page: Authorization successful');
        setAuthorized(true);
      } catch (error) {
        console.error('Admin page: Auth check error:', error);
        if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) return;
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch restaurants data from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!authorized) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getRestaurants();
        setRestaurants(response.restaurants || []);
        
        // Set selected restaurant: localStorage > BE default > first
        if (response.restaurants && response.restaurants.length > 0) {
          var savedId = localStorage.getItem('selectedRestaurantId');
          var defaultId = response.defaultRestaurantId;
          var restaurant = (savedId ? response.restaurants.find(function(r) { return r.id === savedId; }) : null) ||
                          (defaultId ? response.restaurants.find(function(r) { return r.id === defaultId; }) : null) ||
                          response.restaurants[0];
          setSelectedRestaurant(restaurant);
          setPosSettings(restaurant.posSettings || {});
          setBusinessType(restaurant.businessType || 'restaurant');
          // Always sync localStorage with resolved restaurant
          localStorage.setItem('selectedRestaurantId', restaurant.id);
          localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Don't redirect on API failure - just show empty state or allow user to add restaurants
        setRestaurants([]);
        setSelectedRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [authorized]);

  // Listen for restaurant changes from navigation dropdown
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('🏪 Admin page: Restaurant changed', event.detail);
      const { restaurant } = event.detail || {};
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        setPosSettings(restaurant.posSettings || {});
        setBusinessType(restaurant.businessType || 'restaurant');
      }
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  // Delete staff member
  const deleteStaff = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteStaff(staffId);
      
      // Remove from local state
      setStaff(prevStaff => prevStaff.filter(member => member.id !== staffId));
      
      alert(`${staffName} has been deleted successfully`);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(`Failed to delete ${staffName}: ${error.message || 'Unknown error'}`);
    }
  };

  // Fetch credentials for a specific staff member (admin-set temp password only; if user changed from app, we don't get password)
  const fetchStaffCredentials = async (staffId) => {
    try {
      const response = await apiClient.getStaffCredentials(staffId);
      // Only show password when it's admin-set (temporary). When user changed from app, hasTemporaryPassword is false and we don't get temporaryPassword.
      setStaff(prevStaff => prevStaff.map(member =>
        member.id === staffId
          ? {
              ...member,
              loginId: response.loginId ?? member.loginId,
              tempPassword: response.temporaryPassword ?? null,
              hasTemporaryPassword: response.hasTemporaryPassword ?? false,
              credentialsMessage: response.message,
              credentialsLoaded: true,
              passwordChangedByUser: !response.hasTemporaryPassword && !response.temporaryPassword
            }
          : member
      ));
      return response;
    } catch (error) {
      console.error('Error fetching staff credentials:', error);
      return null;
    }
  };

  // Fetch staff data when restaurant is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!authorized || !selectedRestaurant) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getStaff(selectedRestaurant.id);
        setStaff(response.staff || []);
      } catch (error) {
        console.error('Error fetching staff:', error);
        // Don't redirect on API failure - just show empty state
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [authorized, selectedRestaurant]);

  // Fetch menu data when restaurant is selected and menu tab is active
  useEffect(() => {
    const fetchMenu = async () => {
      if (!authorized || !selectedRestaurant || activeTab !== 'menu') return;
      
      try {
        setLoading(true);
        const response = await apiClient.getMenu(selectedRestaurant.id);
        setMenuItems(response.menuItems || []);
      } catch (error) {
        console.error('Error fetching menu:', error);
        // Don't redirect on API failure - just show empty state
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [authorized, selectedRestaurant, activeTab]);

  const getRoleInfo = (role) => {
    const roleMap = {
      owner: {
        label: 'Owner',
        icon: FaCrown,
        color: '#dc2626',
        bg: '#fee2e2'
      },
      admin: {
        label: 'Admin',
        icon: FaUserShield,
        color: '#7c3aed',
        bg: '#e9d5ff'
      },
      manager: {
        label: 'Manager',
        icon: FaUserCog,
        color: '#059669',
        bg: '#d1fae5'
      },
      employee: {
        label: 'Employee',
        icon: FaUsers,
        color: '#3b82f6',
        bg: '#dbeafe'
      },
      waiter: {
        label: 'Waiter',
        icon: FaUtensils,
        color: '#f59e0b',
        bg: '#fef3c7'
      },
      cashier: {
        label: 'Cashier',
        icon: FaUserCheck,
        color: '#8b5cf6',
        bg: '#f3e8ff'
      },
      chef: {
        label: 'Chef',
        icon: FaUtensils,
        color: '#ef4444',
        bg: '#fecaca'
      },
      cook: {
        label: 'Cook',
        icon: FaUtensils,
        color: '#f97316',
        bg: '#fed7aa'
      },
      supervisor: {
        label: 'Supervisor',
        icon: FaUserShield,
        color: '#10b981',
        bg: '#dcfce7'
      }
    };
    
    // Handle custom roles or roles not in the predefined map
    return roleMap[role] || {
      label: role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Staff',
      icon: FaUsers,
      color: '#6b7280',
      bg: '#f3f4f6'
    };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: {
        label: 'Active',
        color: '#10b981',
        bg: '#dcfce7',
        icon: FaUserCheck
      },
      inactive: {
        label: 'Inactive',
        color: '#6b7280',
        bg: '#f3f4f6',
        icon: FaUserTimes
      },
      suspended: {
        label: 'Suspended',
        color: '#ef4444',
        bg: '#fee2e2',
        icon: FaUserTimes
      }
    };
    return statusMap[status] || statusMap.active;
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await apiClient.createRestaurant(newRestaurant);
      
      // Add the new restaurant to the local state
      setRestaurants([...restaurants, response.restaurant]);
      
      setNewRestaurant({
        name: '',
        description: ''
      });
      setShowAddRestaurantModal(false);
      
      alert('Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert(`Failed to add restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestaurant = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const { id, ...fields } = editRestaurant;
      // Clean up fields - convert cuisine string to array, remove empty strings
      const cleaned = {};
      Object.entries(fields).forEach(([key, value]) => {
        if (key === 'cuisine') {
          cleaned.cuisine = typeof value === 'string'
            ? value.split(',').map(c => c.trim()).filter(Boolean)
            : (Array.isArray(value) ? value : []);
        } else if (key === 'staffCount' || key === 'seatingCapacity') {
          if (value !== '' && value !== null && value !== undefined) cleaned[key] = Number(value);
        } else if (value !== '' && value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      });

      const response = await apiClient.updateRestaurant(id, cleaned);

      // Update local restaurants state
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...cleaned } : r));

      // Update localStorage if this is the currently selected restaurant
      try {
        const stored = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
        if (stored.id === id) {
          localStorage.setItem('selectedRestaurant', JSON.stringify({ ...stored, ...cleaned }));
          window.dispatchEvent(new Event('restaurantChanged'));
        }
      } catch (e) {}

      setShowEditRestaurantModal(false);
      alert('Restaurant updated successfully!');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert(`Failed to update restaurant: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Generate unique credentials for new staff
  const generateCredentials = () => {
    // Generate unique user ID: RES001, RES002, etc.
    const existingIds = staff.map(member => member.loginId).filter(Boolean);
    let counter = 1;
    let userId;
    do {
      userId = `${selectedRestaurant?.name?.substring(0, 3).toUpperCase() || 'RES'}${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingIds.includes(userId));
    
    // Generate random 6-character alphanumeric password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return { userId, password };
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      alert('Please select a restaurant first');
      return;
    }

    // Validate role permissions
    if (currentUserRole !== 'owner' && newStaff.role === 'admin') {
      alert('Only owners can create admin roles');
      return;
    }

    try {
      setLoading(true);
      
      const staffData = {
        ...newStaff,
        restaurantId: selectedRestaurant.id,
        pageAccess: newStaff.pageAccess
      };
      
      const response = await apiClient.addStaff(selectedRestaurant.id, staffData);
      
      // Add the new staff member with credentials to local state
      const newStaffMember = {
        ...response.staff,
        loginId: response.credentials.loginId,
        username: response.credentials.username || null,
        tempPassword: response.credentials.password // Store temporarily for display
      };
      setStaff([...staff, newStaffMember]);
      
      setNewStaff({
        name: '',
        phone: '',
        email: '',
        address: '',
        username: '',
        role: 'employee',
        startDate: new Date().toISOString().split('T')[0],
        pageAccess: {
          dashboard: true,
          history: true,
          tables: true,
          menu: true,
          analytics: false,
          inventory: false,
          kot: false,
          admin: false,
          invoice: false,
          customers: false,
          offers: false
        }
      });
      setShowAddStaffModal(false);
      
      const credLines = ['User ID: ' + response.credentials.loginId];
      if (response.credentials.username) credLines.push('Username: ' + response.credentials.username);
      credLines.push('Password: ' + response.credentials.password);
      alert(`Staff member added successfully!\n\nLogin Credentials:\n${credLines.join('\n')}\n\nPlease save these credentials securely. Staff can log in with User ID or username.`);
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(`Failed to add staff member: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffStatus = async (staffId) => {
    try {
      const member = staff.find(m => m.id === staffId);
      if (!member) return;
      
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      
      await apiClient.updateStaff(staffId, { status: newStatus });
      
      setStaff(staff.map(member => {
        if (member.id === staffId) {
          return { ...member, status: newStatus };
        }
        return member;
      }));
      
      alert(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating staff status:', error);
      alert(`Failed to update staff status: ${error.message}`);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.phone && restaurant.phone.includes(searchTerm))
  );

  const filteredStaff = staff.filter(member =>
    (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.phone && member.phone.includes(searchTerm)) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDateTime = (dateInput) => {
    if (!dateInput) return 'Never';
    
    try {
      let date;
      
      // Handle Firestore timestamp
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput._seconds) {
        // Handle Firestore timestamp format
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return 'Never';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Never';
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      
      // Handle Firestore timestamp
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput._seconds) {
        // Handle Firestore timestamp format
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return 'N/A';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-IN');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const copyToClipboard = async (text, type, memberId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredentials(prev => ({
        ...prev,
        [`${memberId}_${type}`]: true
      }));
      setTimeout(() => {
        setCopiedCredentials(prev => ({
          ...prev,
          [`${memberId}_${type}`]: false
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const togglePasswordVisibility = (memberId) => {
    setShowPassword(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const openResetPasswordModal = (member) => {
    setStaffForReset(member);
    setResetPasswordMode('generate');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetUsername(member?.username || '');
    setResetResult(null);
    setShowResetTempPassword(false);
    setShowResetPasswordModal(true);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setStaffForReset(null);
    setResetResult(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetUsername('');
    setShowResetTempPassword(false);
    setResetPasswordMode('generate');
  };

  const handleGenerateTempPassword = async () => {
    if (!staffForReset?.id) return;
    try {
      setResetLoading(true);
      setResetResult(null);
      const body = resetUsername.trim() ? { username: resetUsername.trim() } : {};
      const res = await apiClient.resetStaffPassword(staffForReset.id, body);
      setResetResult({ temporaryPassword: res.temporaryPassword, loginId: res.loginId, username: res.username });
      setStaff(prev => prev.map(m => m.id === staffForReset.id ? { ...m, tempPassword: res.temporaryPassword, loginId: res.loginId, username: res.username, hasTemporaryPassword: true, credentialsMessage: res.message } : m));
    } catch (error) {
      alert(error.message || 'Failed to generate temporary password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (!staffForReset?.id) return;
    if (!resetNewPassword || !resetConfirmPassword) {
      alert('Please enter password and confirmation');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      alert('Password and confirmation do not match');
      return;
    }
    if (resetNewPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      setResetLoading(true);
      const body = { newPassword: resetNewPassword, confirmPassword: resetConfirmPassword };
      if (resetUsername.trim()) body.username = resetUsername.trim();
      const res = await apiClient.resetStaffPassword(staffForReset.id, body);
      setStaff(prev => prev.map(m => m.id === staffForReset.id ? { ...m, tempPassword: undefined, username: res.username, hasTemporaryPassword: false, credentialsMessage: 'Password set by admin. Staff can log in with the new password.' } : m));
      alert('Password set successfully.');
      closeResetPasswordModal();
    } catch (error) {
      alert(error.message || 'Failed to set password');
    } finally {
      setResetLoading(false);
    }
  };

  // Menu management functions
  const toggleMenuItemAvailability = async (itemId, currentStatus) => {
    try {
      setLoading(true);
      const updatedData = { isAvailable: !currentStatus };
      await apiClient.updateMenuItem(itemId, updatedData, selectedRestaurant?.id);
      setMenuItems(items => items.map(item =>
        item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      alert(`Failed to update item availability: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setLoading(true);
      await apiClient.deleteMenuItem(itemId, selectedRestaurant?.id);
      setMenuItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Failed to delete menu item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canManageStaff = (targetRole) => {
    const roleHierarchy = {
      'owner': 4,
      'admin': 3,
      'manager': 2,
      'waiter': 1,
      'cashier': 1,
      'employee': 1,
      'sales': 1
    };
    
    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 1;
    
    // Owners can manage everyone, admins can manage managers and below, etc.
    return currentLevel > targetLevel;
  };

  const getPerformanceStats = (member) => {
    // Different stats based on role
    switch (member.role) {
      case 'waiter':
        return {
          todayLabel: 'Orders Today',
          todayValue: member.ordersToday || 0,
          totalLabel: 'Total Orders',
          totalValue: member.totalOrders || 0
        };
      case 'manager':
        return {
          todayLabel: 'Staff Managed',
          todayValue: member.staffCount || 0,
          totalLabel: 'Total Revenue',
          totalValue: formatCurrency(member.totalRevenue || 0)
        };
      case 'cashier':
        return {
          todayLabel: 'Transactions',
          todayValue: member.transactionsToday || 0,
          totalLabel: 'Total Sales',
          totalValue: formatCurrency(member.totalSales || 0)
        };
      case 'chef':
      case 'cook':
        return {
          todayLabel: 'Dishes Made',
          todayValue: member.dishesToday || 0,
          totalLabel: 'Total Dishes',
          totalValue: member.totalDishes || 0
        };
      default:
        return {
          todayLabel: 'Tasks Today',
          todayValue: member.tasksToday || 0,
          totalLabel: 'Total Tasks',
          totalValue: member.totalTasks || 0
        };
    }
  };

  // Don't render anything until authorization is checked
  if (!authorized) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #fef2f2',
            borderTop: '1px solid #e5e7eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Full-screen saving overlay */}
      {generalSaving && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <FaSpinner size={28} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>Saving settings...</p>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 10000,
          backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: '12px', padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '400px'
        }}>
          {toast.type === 'error'
            ? <FaTimes size={14} color="#ef4444" />
            : <FaCheck size={14} color="#22c55e" />
          }
          <span style={{
            fontSize: '14px', fontWeight: 600,
            color: toast.type === 'error' ? '#dc2626' : '#16a34a'
          }}>
            {toast.message}
          </span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* Prevent iOS auto-zoom on input focus */}
      {isClient && isMobile && (
        <style dangerouslySetInnerHTML={{ __html: `
          input, textarea, select { font-size: 16px !important; }
        ` }} />
      )}
      <div style={{ padding: isClient && isMobile ? '8px' : '24px', boxSizing: 'border-box', overflowX: 'hidden' }}>

        {/* Mobile Header + Dropdown (hidden in mobile embed — each tab opened separately from app) */}
        {isClient && isMobile && !(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaShieldAlt color="white" size={15} />
              </div>
              <div>
                <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Admin</h1>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px' }}>
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} &middot; {staff.length} staff
                </p>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={function() { setMobileNavOpen(!mobileNavOpen); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  color: '#1f2937', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {activeNavItem && (function() { var AIcon = activeNavItem.icon; return <AIcon size={14} style={{ color: '#ef4444' }} />; })()}
                <span style={{ flex: 1, textAlign: 'left' }}>{activeNavItem ? activeNavItem.label : 'Select'}</span>
                <FaChevronDown size={11} style={{ color: '#9ca3af', transform: mobileNavOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {mobileNavOpen && (
                <div>
                  <div onClick={function() { setMobileNavOpen(false); }} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40
                  }}></div>
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                    background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '8px',
                    maxHeight: '60vh', overflowY: 'auto'
                  }}>
                    {filteredNavGroups.map(function(group) {
                      return (
                        <div key={group.label}>
                          <div style={{
                            fontSize: '10px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em',
                            padding: '10px 12px 4px', textTransform: 'uppercase'
                          }}>{group.label}</div>
                          {group.items.map(function(item) {
                            var MItemIcon = item.icon;
                            return (
                              <button key={item.id} onClick={function() { setActiveTab(item.id); setMobileNavOpen(false); }}
                                style={{
                                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '10px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                  background: activeTab === item.id ? '#fef2f2' : 'transparent',
                                  color: activeTab === item.id ? '#dc2626' : '#374151',
                                  fontWeight: activeTab === item.id ? 600 : 500, fontSize: '13px',
                                  transition: 'all 0.15s', textAlign: 'left'
                                }}
                              >
                                <MItemIcon size={13} style={{ color: activeTab === item.id ? '#ef4444' : '#9ca3af' }} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== DESKTOP HEADER + HORIZONTAL TABS ===== */}
        {!(isClient && isMobile) && (
          <div style={{ marginBottom: '24px' }}>
            {/* Top row: title + action button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px', height: '42px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.2)'
                }}>
                  <FaShieldAlt color="white" size={17} />
                </div>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: 0, letterSpacing: '-0.02em' }}>
                    {activeNavItem ? activeNavItem.label : 'Admin'}
                  </h1>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>
                    {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} &middot; {staff.length} staff
                  </p>
                </div>
              </div>
              {activeTab === 'restaurants' && (
                <button onClick={function() { setShowAddRestaurantModal(true); }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', padding: '10px 20px', borderRadius: '10px',
                    fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.25)'
                  }}
                >
                  <FaPlus size={12} />
                  Add Restaurant
                </button>
              )}
              {activeTab === 'staff' && (
                <button onClick={function() { setShowAddStaffModal(true); }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', padding: '10px 20px', borderRadius: '10px',
                    fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.25)'
                  }}
                >
                  <FaPlus size={12} />
                  Add Staff
                </button>
              )}
            </div>

            {/* Horizontal tab bar */}
            <div style={{
              background: 'linear-gradient(135deg, #fff1f2, #ffe4e6, #fecdd3)', borderRadius: '14px', padding: '5px 6px',
              border: '1px solid #fecdd3',
              display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap'
            }}>
              {filteredNavGroups.map(function(group, groupIdx) {
                return (
                  <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {groupIdx > 0 && (
                      <div style={{ width: '1px', height: '22px', backgroundColor: '#fda4af', margin: '0 6px', flexShrink: 0, opacity: 0.4 }}></div>
                    )}
                    {group.items.map(function(item) {
                      var isItemActive = activeTab === item.id;
                      var TabIcon = item.icon;
                      return (
                        <button key={item.id} onClick={function() { setActiveTab(item.id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '8px 14px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                            background: isItemActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
                            color: isItemActive ? 'white' : '#9f1239',
                            fontWeight: isItemActive ? 600 : 500, fontSize: '13px',
                            transition: 'all 0.15s', whiteSpace: 'nowrap',
                            boxShadow: isItemActive ? '0 2px 8px rgba(239,68,68,0.3)' : 'none'
                          }}
                        >
                          <TabIcon size={13} style={{ color: isItemActive ? 'white' : '#e11d48' }} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}



        {/* Search Bar — only on Restaurants / Staff tabs */}
        {(activeTab === 'restaurants' || activeTab === 'staff') && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isClient && isMobile ? '12px' : '16px',
          marginBottom: isClient && isMobile ? '12px' : '20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexDirection: isClient && isMobile ? 'column' : 'row'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: isClient && isMobile ? '100%' : '400px',
            flex: 1,
            width: isClient && isMobile ? '100%' : 'auto'
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '13px'
            }} />
            <input
              type="text"
              placeholder={activeTab === 'restaurants' ? 'Search restaurants...' : 'Search staff...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s'
              }}
            />
          </div>
          {isClient && isMobile && (
            <button
              onClick={function() { activeTab === 'restaurants' ? setShowAddRestaurantModal(true) : setShowAddStaffModal(true); }}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(239,68,68,0.25)'
              }}
            >
              <FaPlus size={12} />
              Add {activeTab === 'restaurants' ? 'Restaurant' : 'Staff'}
            </button>
          )}
        </div>
        )}

        {/* Restaurant Selection for Staff Tab */}
        {activeTab === 'staff' && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>Restaurant:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {restaurants.map((restaurant) => (
                <button key={restaurant.id} onClick={() => setSelectedRestaurant(restaurant)}
                  style={{
                    backgroundColor: selectedRestaurant?.id === restaurant.id ? '#111827' : 'white',
                    color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                    padding: '6px 14px', borderRadius: '8px', fontWeight: 500, fontSize: '13px',
                    border: selectedRestaurant?.id === restaurant.id ? '1px solid #111827' : '1px solid #e5e7eb',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >{restaurant.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area — only show restaurants/staff grids when on those tabs */}
        {(activeTab === 'restaurants' || activeTab === 'staff') && (activeTab === 'restaurants' ? (
          // Restaurants Grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: isClient && isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {filteredRestaurants.map(function(restaurant) {
              var initials = restaurant.name ? restaurant.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase() : 'R';
              return (
              <div key={restaurant.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
              onMouseEnter={function(e) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={function(e) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              }}>
                <div style={{ padding: '20px' }}>
                  {/* Identity row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      backgroundColor: '#fef2f2', color: '#dc2626',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 700, flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{restaurant.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '1px' }}>{restaurant.city || 'No location'}</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                      flexShrink: 0
                    }}>Active</span>
                  </div>

                  {/* Details */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {restaurant.businessType && restaurant.businessType !== 'restaurant' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>Type</span>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600, textTransform: 'capitalize' }}>{restaurant.businessType.replace('_', ' ')}</span>
                        </div>
                      )}
                      {restaurant.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>Phone</span>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{restaurant.phone}</span>
                        </div>
                      )}
                      {restaurant.cuisine && Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>Cuisine</span>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{restaurant.cuisine.join(', ')}</span>
                        </div>
                      )}
                      {!restaurant.phone && !(restaurant.cuisine && restaurant.cuisine.length > 0) && !(restaurant.businessType && restaurant.businessType !== 'restaurant') && (
                        <div style={{ fontSize: '12px', color: '#d1d5db', textAlign: 'center', padding: '4px 0' }}>No details added</div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                    <button
                      onClick={function() { setSelectedRestaurant(restaurant); setActiveTab('staff'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0', fontSize: '13px', fontWeight: 500,
                        backgroundColor: 'transparent', color: '#6b7280', border: 'none',
                        cursor: 'pointer', transition: 'color 0.15s'
                      }}
                      onMouseEnter={function(e) { e.currentTarget.style.color = '#111827'; }}
                      onMouseLeave={function(e) { e.currentTarget.style.color = '#6b7280'; }}
                    >
                      <FaUsers size={12} /> View Staff
                    </button>
                    <button
                      onClick={function() {
                        setEditRestaurant({
                          id: restaurant.id,
                          name: restaurant.name || '',
                          description: restaurant.description || '',
                          address: restaurant.address || '',
                          city: restaurant.city || '',
                          phone: restaurant.phone || '',
                          email: restaurant.email || '',
                          cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : (restaurant.cuisine || ''),
                          businessType: restaurant.businessType || 'restaurant',
                          legalBusinessName: restaurant.legalBusinessName || '',
                          gstin: restaurant.gstin || '',
                          staffCount: restaurant.staffCount || '',
                          seatingCapacity: restaurant.seatingCapacity || ''
                        });
                        setShowEditRestaurantModal(true);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0', fontSize: '13px', fontWeight: 500,
                        backgroundColor: 'transparent', color: '#6b7280', border: 'none',
                        cursor: 'pointer', transition: 'color 0.15s'
                      }}
                      onMouseEnter={function(e) { e.currentTarget.style.color = '#111827'; }}
                      onMouseLeave={function(e) { e.currentTarget.style.color = '#6b7280'; }}
                    >
                      <FaEdit size={12} /> Edit Details
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          // Staff Grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: isClient && isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredStaff.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              const statusInfo = getStatusInfo(member.status);
              const RoleIcon = roleInfo.icon;
              const StatusIcon = statusInfo.icon;
              const isInactive = member.status === 'inactive';

              return (
                <div key={member.id} style={{
                  backgroundColor: isInactive ? '#f9fafb' : 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  border: isInactive ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  opacity: isInactive ? 0.7 : 1,
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isInactive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }}>
                  {isInactive && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: '#fef2f2', color: '#dc2626',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
                      border: '1px solid #fecaca', zIndex: 1
                    }}>
                      INACTIVE
                    </div>
                  )}
                  {/* Staff Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        backgroundColor: isInactive ? '#f3f4f6' : roleInfo.bg,
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <RoleIcon color={isInactive ? '#9ca3af' : roleInfo.color} size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: isInactive ? '#6b7280' : '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>{member.phone || member.email || 'No contact'}</div>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: roleInfo.bg, color: roleInfo.color, border: '1px solid ' + roleInfo.color + '33',
                        flexShrink: 0
                      }}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Staff Details */}
                  <div style={{ padding: '14px 20px' }}>
                    {/* Login Credentials Section */}
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: isClient && isMobile ? '12px' : '16px', 
                      borderRadius: '12px',
                      marginBottom: isClient && isMobile ? '12px' : '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: isInactive ? '#6b7280' : '#0c4a6e', 
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaKey size={12} />
                        Login Credentials
                      </h4>
                      
                      {/* Show credentials if available, otherwise show load button */}
                      {(member.loginId || member.tempPassword) ? (
                        <>
                          {/* User ID Badge */}
                          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaIdBadge style={{ color: '#0ea5e9', fontSize: '14px' }} />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>User ID</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  fontSize: '13px', 
                                  fontWeight: '600', 
                                  color: '#0c4a6e',
                                  backgroundColor: '#e0f2fe',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontFamily: 'monospace'
                                }}>
                                  {member.loginId || 'N/A'}
                                </span>
                                {member.loginId && (
                                  <button
                                    onClick={() => copyToClipboard(member.loginId, 'userId', member.id)}
                                    style={{
                                      backgroundColor: copiedCredentials[`${member.id}_userId`] ? '#10b981' : '#0ea5e9',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <FaCopy size={10} />
                                    {copiedCredentials[`${member.id}_userId`] ? 'Copied!' : 'Copy'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Password: show when admin-set (temp or reset); hide when user changed from app */}
                          {(member.tempPassword || member.password || member.hasTemporaryPassword) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <FaKey style={{ color: '#0ea5e9', fontSize: '14px' }} />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Password</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0c4a6e',
                                    backgroundColor: '#e0f2fe',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    minWidth: '60px'
                                  }}>
                                    {showPassword[member.id]
                                      ? (member.tempPassword || member.password || 'N/A')
                                      : '••••••'
                                    }
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(member.id)}
                                    style={{
                                      backgroundColor: '#6b7280',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {showPassword[member.id] ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
                                    {showPassword[member.id] ? 'Hide' : 'Show'}
                                  </button>
                                  {(member.tempPassword || member.password) && (
                                    <button
                                      onClick={() => copyToClipboard(member.tempPassword || member.password, 'password', member.id)}
                                      style={{
                                        backgroundColor: copiedCredentials[`${member.id}_password`] ? '#10b981' : '#0ea5e9',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      <FaCopy size={10} />
                                      {copiedCredentials[`${member.id}_password`] ? 'Copied!' : 'Copy'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {/* When we have User ID but no password yet: offer to load (shows password only if admin-set; else "changed by staff") */}
                          {member.loginId && !(member.tempPassword || member.password || member.hasTemporaryPassword) && (
                            <div style={{ marginBottom: '8px' }}>
                              {!member.credentialsLoaded ? (
                                <button
                                  type="button"
                                  onClick={() => fetchStaffCredentials(member.id)}
                                  style={{
                                    backgroundColor: '#e0f2fe',
                                    color: '#0c4a6e',
                                    border: '1px solid #0ea5e9',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FaEye size={10} />
                                  Show password
                                </button>
                              ) : member.passwordChangedByUser ? (
                                <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                                  Password changed by staff — not displayed
                                </span>
                              ) : null}
                            </div>
                          )}

                          {/* Show message if available */}
                          {member.credentialsMessage && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '11px', 
                              color: '#6b7280', 
                              fontStyle: 'italic' 
                            }}>
                              {member.credentialsMessage}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => fetchStaffCredentials(member.id)}
                            style={{
                              backgroundColor: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              margin: '0 auto'
                            }}
                          >
                            <FaKey size={12} />
                            Load Credentials
                          </button>
                          <div style={{ 
                            marginTop: '8px', 
                            fontSize: '11px', 
                            color: '#6b7280' 
                          }}>
                            Click to load login credentials
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page Access Display */}
                    {member.pageAccess && (
                      <div style={{ 
                        backgroundColor: '#f8fafc', 
                        padding: '14px', 
                        borderRadius: '10px',
                        marginBottom: '14px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#166534', 
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaShieldAlt size={12} />
                          Page Access Permissions
                        </h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '8px'
                        }}>
                          {[
                            { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
                            { key: 'history', label: 'History', icon: '📋' },
                            { key: 'tables', label: 'Tables', icon: '🪑' },
                            { key: 'menu', label: 'Menu', icon: '🍽️' },
                            { key: 'analytics', label: 'Analytics', icon: '📊' },
                            { key: 'inventory', label: 'Inventory', icon: '📦' },
                            { key: 'kot', label: 'KOT', icon: '👨‍🍳' },
                            { key: 'admin', label: 'Admin', icon: '⚙️' },
                            { key: 'invoice', label: 'Invoice', icon: '🧾' },
                            { key: 'customers', label: 'Customers', icon: '👥' },
                            { key: 'offers', label: 'Offers', icon: '🏷️' },
                            { key: 'orders', label: 'Orders', icon: '🧾' }
                          ].map(({ key, label, icon }) => {
                            const hasGranular = !!FEATURE_OPS[key];
                            const hasAccess = hasGranular
                              ? (typeof member.pageAccess?.[key] === 'object'
                                ? Object.values(member.pageAccess[key]).some(Boolean)
                                : !!member.pageAccess?.[key])
                              : !!member.pageAccess?.[key];
                            return (
                              <div key={key} style={{ gridColumn: hasGranular && typeof member.pageAccess?.[key] === 'object' ? '1 / -1' : undefined }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: hasAccess ? '#dcfce7' : '#fef2f2',
                                  border: `1px solid ${hasAccess ? '#22c55e' : '#fca5a5'}`
                                }}>
                                  <span style={{ fontSize: '12px' }}>{icon}</span>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: hasAccess ? '#166534' : '#dc2626'
                                  }}>
                                    {label}
                                  </span>
                                  {hasAccess ? (
                                    <FaCheck size={8} style={{ color: '#22c55e' }} />
                                  ) : (
                                    <FaTimes size={8} style={{ color: '#dc2626' }} />
                                  )}
                                </div>
                                {hasGranular && typeof member.pageAccess?.[key] === 'object' && (
                                  <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '4px',
                                    marginTop: '6px',
                                    marginLeft: '8px'
                                  }}>
                                    {FEATURE_OPS[key].map(op => (
                                      <span key={op} style={{
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: member.pageAccess[key][op] ? '#dcfce7' : '#fef2f2',
                                        color: member.pageAccess[key][op] ? '#166534' : '#dc2626',
                                        border: `1px solid ${member.pageAccess[key][op] ? '#bbf7d0' : '#fca5a5'}`
                                      }}>
                                        {key === 'admin' ? (ADMIN_TAB_LABELS[op] || op) : (OP_LABELS[op] || op)}: {member.pageAccess[key][op] ? 'Yes' : 'No'}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: isClient && isMobile ? '1fr' : '1fr 1fr', gap: isClient && isMobile ? '12px' : '16px', marginBottom: isClient && isMobile ? '12px' : '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Start Date</span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                            {formatDate(member.startDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Last Login</span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                            {formatDateTime(member.lastLogin)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Performance Stats */}
                    {(() => {
                      const stats = getPerformanceStats(member);
                      return (
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: '12px', 
                          borderRadius: '10px',
                          marginBottom: '14px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                {stats.todayValue}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{stats.todayLabel}</div>
                            </div>
                            <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }} />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                {stats.totalValue}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{stats.totalLabel}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ 
                    padding: '12px 20px',
                    display: 'flex', gap: '4px',
                    borderTop: '1px solid #f3f4f6',
                    alignItems: 'center', flexWrap: 'wrap'
                  }}>
                    <button onClick={() => setSelectedStaff(member)}
                      style={{ backgroundColor: 'transparent', color: '#6b7280', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                      title="View Details"
                    ><FaEye size={10} /> View</button>
                    {canManageStaff(member.role) && (
                      <button onClick={() => toggleStaffStatus(member.id)}
                        style={{ backgroundColor: 'transparent', color: member.status === 'active' ? '#dc2626' : '#059669', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                        title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                      >{member.status === 'active' ? <FaUserTimes size={10} /> : <FaUserCheck size={10} />} {member.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                    )}
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && canManageStaff(member.role) && (
                      <button onClick={() => openResetPasswordModal(member)}
                        style={{ backgroundColor: 'transparent', color: '#6b7280', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                        title="Reset password"
                      ><FaKey size={10} /> Reset</button>
                    )}
                    <div style={{ flex: 1 }}></div>
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                      <button onClick={() => deleteStaff(member.id, member.name)}
                        style={{ backgroundColor: 'transparent', color: '#dc2626', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                        title="Delete Staff"
                      ><FaTrash size={10} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty States */}
        {activeTab === 'restaurants' && filteredRestaurants.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)
              `,
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                animation: 'bounce 2s infinite'
              }}>
                <FaStore size={40} style={{ color: '#ef4444' }} />
              </div>
              
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Restaurant Management Ready! 🏪
              </h3>
              
              <p style={{
                fontSize: '18px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {searchTerm ? 'Try different search terms' : 'Create Your First Restaurant'}
              </p>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px auto',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {searchTerm 
                  ? 'Try adjusting your search criteria or clear the search to see all restaurants.' 
                  : 'Set up your restaurant profile with details, location, and business information to start managing your operations.'
                }
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddRestaurantModal(true)}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <FaPlus size={16} />
{t('admin.addRestaurant')}
                  </button>
                )}
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'staff' && filteredStaff.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f8fafc',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaUsers size={32} style={{ color: '#d1d5db' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              {!selectedRestaurant ? t('admin.selectRestaurantFirst') : t('admin.noStaffFound')}
            </h3>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '14px'
            }}>
              {!selectedRestaurant ? 'Please select a restaurant to manage its staff.' : 
                searchTerm ? 'Try adjusting your search criteria.' : 'Add your first staff member to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showAddRestaurantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #f8fafc, #fef2f2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Add New Restaurant
                </h2>
                <button
                  onClick={() => setShowAddRestaurantModal(false)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddRestaurant} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Description
                </label>
                <textarea
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Brief description of your restaurant"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRestaurantModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? t('admin.adding') : t('admin.addRestaurant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditRestaurantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              borderRadius: '16px 16px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Edit Restaurant
                </h2>
                <button
                  onClick={() => setShowEditRestaurantModal(false)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </div>
            </div>

            <form onSubmit={handleEditRestaurant} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRestaurant.name}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, name: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Restaurant name"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editRestaurant.phone}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, phone: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editRestaurant.email}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, email: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="hello@restaurant.com"
                  />
                </div>
                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={editRestaurant.city}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, city: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Mumbai"
                  />
                </div>
                {/* Address - full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editRestaurant.address}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, address: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Full address"
                  />
                </div>
                {/* Business Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Business Type
                  </label>
                  <select
                    value={editRestaurant.businessType}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, businessType: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb', cursor: 'pointer'
                    }}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar</option>
                    <option value="bakery">Bakery</option>
                    <option value="ice_cream">Ice Cream</option>
                    <option value="qsr">QSR / Fast Food</option>
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="food_truck">Food Truck</option>
                  </select>
                </div>
                {/* Cuisine */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Cuisine (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editRestaurant.cuisine}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, cuisine: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Indian, Chinese, Italian"
                  />
                </div>
                {/* Legal Business Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Legal Business Name
                  </label>
                  <input
                    type="text"
                    value={editRestaurant.legalBusinessName}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, legalBusinessName: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Legal entity name"
                  />
                </div>
                {/* GSTIN */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={editRestaurant.gstin}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, gstin: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                {/* Staff Count */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Staff Count
                  </label>
                  <input
                    type="number"
                    value={editRestaurant.staffCount}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, staffCount: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="10"
                    min="0"
                  />
                </div>
                {/* Seating Capacity */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={editRestaurant.seatingCapacity}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, seatingCapacity: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="50"
                    min="0"
                  />
                </div>
                {/* Description - full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    value={editRestaurant.description}
                    onChange={(e) => setEditRestaurant({ ...editRestaurant, description: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      backgroundColor: '#f9fafb', minHeight: '70px', resize: 'vertical'
                    }}
                    placeholder="Brief description of your restaurant"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditRestaurantModal(false)}
                  style={{
                    flex: 1, backgroundColor: '#f3f4f6', color: '#374151',
                    padding: '12px 20px', borderRadius: '10px', fontWeight: '600',
                    fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                    padding: '12px 20px', borderRadius: '10px', fontWeight: '600',
                    fontSize: '14px', border: 'none', cursor: editLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', opacity: editLoading ? 0.7 : 1
                  }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '20px 20px 0 0' : '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '800px',
            maxHeight: isMobile ? '92vh' : '90vh',
            border: isMobile ? 'none' : '1px solid #f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: isMobile ? '16px 20px' : '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #f8fafc, #fef2f2)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
{t('admin.addNewStaff')}
                </h2>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddStaff} style={{
              padding: isMobile ? '16px 20px' : '24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              WebkitOverflowScrolling: 'touch'
            }}>
              {/* Form Fields - single column on mobile, two columns on desktop */}
              <div style={{
                display: isMobile ? 'flex' : 'grid',
                flexDirection: 'column',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '16px' : '20px',
                marginBottom: '20px'
              }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Full Name *
                    </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter staff member full name"
                />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Phone Number *
                    </label>
                <input
                  type="tel"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="+91-9876543210"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="staff@restaurant.com (used for login)"
                />
                  </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Username (optional)
                </label>
                <input
                  type="text"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. john_doe — staff can log in with this or User ID"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>3–50 characters, letters, numbers and underscore. Must be unique.</p>
              </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Address
                    </label>
                <textarea
                  value={newStaff.address}
                  onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Staff residential address"
                />
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    const roleDefaults = ROLE_DEFAULT_PAGE_ACCESS[selectedRole];
                    if (roleDefaults) {
                      setNewStaff(prev => ({ ...prev, role: selectedRole, pageAccess: { ...roleDefaults } }));
                    } else {
                      setNewStaff(prev => ({ ...prev, role: selectedRole }));
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  {customRoles.map(role => {
                    // Only show admin option to owners
                    if (role === 'admin' && currentUserRole !== 'owner') {
                      return null;
                    }
                    return (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    );
                  })}
                  <option value="custom" style={{ fontStyle: 'italic', color: '#6b7280' }}>+ Add Custom Role</option>
                </select>
                {ROLE_DESCRIPTIONS[newStaff.role] && (
                  <div style={{
                    marginTop: '8px', padding: '10px 14px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderLeft: '3px solid #3b82f6', borderRadius: '8px',
                    fontSize: '13px', color: '#475569', lineHeight: '1.5'
                  }}>
                    <span style={{ fontWeight: 600, color: '#1e40af' }}>{newStaff.role?.charAt(0).toUpperCase() + newStaff.role?.slice(1)}:</span>{' '}
                    {ROLE_DESCRIPTIONS[newStaff.role]}
                  </div>
                )}
              </div>

              {/* Custom Role Input */}
              {newStaff.role === 'custom' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Custom Role Name *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newCustomRole}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!['owner', 'admin'].includes(value)) {
                          setNewCustomRole(value);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      placeholder="supervisor, cashier, cook, etc."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCustomRole && !customRoles.includes(newCustomRole)) {
                          setCustomRoles([...customRoles, newCustomRole]);
                          setNewStaff({ ...newStaff, role: newCustomRole });
                          setNewCustomRole('');
                        }
                      }}
                      disabled={!newCustomRole || customRoles.includes(newCustomRole)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: newCustomRole && !customRoles.includes(newCustomRole) ? '#10b981' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: newCustomRole && !customRoles.includes(newCustomRole) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Note: Cannot create &apos;owner&apos; or &apos;admin&apos; roles
                  </p>
                </div>
              )}

              {/* Page Access Controls */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Page Access Permissions
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  {[
                    { key: 'dashboard', label: t('nav.dashboard'), icon: '🏠' },
                    { key: 'history', label: t('nav.history'), icon: '📋' },
                    { key: 'tables', label: t('nav.tables'), icon: '🪑' },
                    { key: 'menu', label: t('nav.menu'), icon: '🍽️' },
                    { key: 'analytics', label: t('nav.analytics'), icon: '📊' },
                    { key: 'inventory', label: t('nav.inventory'), icon: '📦' },
                    { key: 'kot', label: t('nav.kot'), icon: '👨‍🍳' },
                    { key: 'admin', label: t('nav.admin'), icon: '⚙️' },
                    { key: 'invoice', label: 'Invoice', icon: '🧾' },
                    { key: 'customers', label: 'Customers', icon: '👥' },
                    { key: 'offers', label: 'Offers', icon: '🏷️' },
                    { key: 'orders', label: 'Orders', icon: '🧾' }
                  ].map(({ key, label, icon }) => {
                    const hasGranular = !!FEATURE_OPS[key];
                    const isChecked = hasGranular
                      ? (typeof newStaff.pageAccess[key] === 'object'
                        ? Object.values(newStaff.pageAccess[key]).some(Boolean)
                        : !!newStaff.pageAccess[key])
                      : !!newStaff.pageAccess[key];
                    return (
                      <div key={key} style={{ gridColumn: hasGranular && isChecked ? '1 / -1' : undefined }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: isChecked ? '#dcfce7' : 'white',
                          border: `1px solid ${isChecked ? '#10b981' : '#e5e7eb'}`,
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (hasGranular) {
                                const ops = FEATURE_OPS[key];
                                const allEnabled = {};
                                ops.forEach(op => allEnabled[op] = true);
                                setNewStaff({
                                  ...newStaff,
                                  pageAccess: {
                                    ...newStaff.pageAccess,
                                    [key]: e.target.checked ? allEnabled : false
                                  }
                                });
                              } else {
                                setNewStaff({
                                  ...newStaff,
                                  pageAccess: {
                                    ...newStaff.pageAccess,
                                    [key]: e.target.checked
                                  }
                                });
                              }
                            }}
                            style={{ margin: 0 }}
                          />
                          <span style={{ fontSize: '16px' }}>{icon}</span>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isChecked ? '#059669' : '#374151'
                          }}>
                            {label}
                          </span>
                        </label>
                        {hasGranular && typeof newStaff.pageAccess[key] === 'object' && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginTop: '8px',
                            marginLeft: '16px',
                            padding: '10px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0'
                          }}>
                            {FEATURE_OPS[key].map(op => (
                              <label key={op} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                backgroundColor: newStaff.pageAccess[key][op] ? '#dcfce7' : 'white',
                                border: `1px solid ${newStaff.pageAccess[key][op] ? '#10b981' : '#e5e7eb'}`,
                                transition: 'all 0.2s'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={!!newStaff.pageAccess[key][op]}
                                  onChange={(e) => {
                                    const updated = {
                                      ...newStaff.pageAccess[key],
                                      [op]: e.target.checked
                                    };
                                    const anyChecked = Object.values(updated).some(Boolean);
                                    setNewStaff({
                                      ...newStaff,
                                      pageAccess: {
                                        ...newStaff.pageAccess,
                                        [key]: anyChecked ? updated : false
                                      }
                                    });
                                  }}
                                  style={{ margin: 0 }}
                                />
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: newStaff.pageAccess[key][op] ? '#059669' : '#374151'
                                }}>
                                  {key === 'admin' ? (ADMIN_TAB_LABELS[op] || op) : (OP_LABELS[op] || op)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  {t('admin.selectPageAccess')}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  {t('admin.startDate')} *
                </label>
                <input
                  type="date"
                  required
                  value={newStaff.startDate}
                  onChange={(e) => setNewStaff({ ...newStaff, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: 'auto',
                paddingTop: '16px',
                paddingBottom: isMobile ? '20px' : '0',
                borderTop: '1px solid #f3f4f6',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: isMobile ? '14px 20px' : '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: isMobile ? '14px 20px' : '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && staffForReset && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '480px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0c4a6e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaKey size={20} />
                  Reset Password
                </h2>
                <button
                  onClick={closeResetPasswordModal}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#0369a1' }}>
                {staffForReset.name}
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setResetPasswordMode('generate'); setResetResult(null); }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: resetPasswordMode === 'generate' ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                    backgroundColor: resetPasswordMode === 'generate' ? '#e0f2fe' : '#f9fafb',
                    color: resetPasswordMode === 'generate' ? '#0c4a6e' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Generate temporary
                </button>
                <button
                  type="button"
                  onClick={() => { setResetPasswordMode('set'); setResetResult(null); }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: resetPasswordMode === 'set' ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                    backgroundColor: resetPasswordMode === 'set' ? '#e0f2fe' : '#f9fafb',
                    color: resetPasswordMode === 'set' ? '#0c4a6e' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Set new password
                </button>
              </div>

              {/* Optional username (both modes) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Username (optional)
                </label>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="e.g. john_doe — staff can log in with this or User ID"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>3–50 characters, letters, numbers and underscore only. Must be unique.</p>
              </div>

              {resetPasswordMode === 'generate' && (
                <>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    Generate a temporary password for this staff. They can log in with it and change it in the app.
                  </p>
                  {resetResult ? (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>User ID</span>
                        <div style={{ fontSize: '15px', fontFamily: 'monospace', color: '#0c4a6e', marginTop: '4px' }}>
                          {resetResult.loginId}
                        </div>
                      </div>
                      {resetResult.username && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>Username</span>
                          <div style={{ fontSize: '15px', fontFamily: 'monospace', color: '#0c4a6e', marginTop: '4px' }}>
                            {resetResult.username}
                          </div>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>Temporary password</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '15px',
                            fontFamily: 'monospace',
                            color: '#0c4a6e',
                            backgroundColor: '#dcfce7',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            flex: 1
                          }}>
                            {showResetTempPassword ? resetResult.temporaryPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowResetTempPassword(prev => !prev)}
                            style={{
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={showResetTempPassword ? 'Hide' : 'Show'}
                          >
                            {showResetTempPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleGenerateTempPassword}
                    disabled={resetLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: resetLoading ? 'not-allowed' : 'pointer',
                      opacity: resetLoading ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {resetLoading ? <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <>Generate temporary password</>}
                  </button>
                </>
              )}

              {resetPasswordMode === 'set' && (
                <>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    Set a new password for this staff. They will use it to log in.
                  </p>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      New password
                    </label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSetNewPassword}
                    disabled={resetLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: resetLoading ? 'not-allowed' : 'pointer',
                      opacity: resetLoading ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {resetLoading ? <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Setting...</> : <>Set password</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Detail Modal — only when Staff tab is active */}
      {selectedStaff && activeTab === 'staff' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #f8fafc, #fef2f2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ef4444',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaUsers color="white" size={18} />
                  </div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Staff Details - {selectedStaff.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedStaff(null)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Login Credentials - Full Width */}
              {(selectedStaff.loginId || selectedStaff.tempPassword) && (
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '1px solid #0ea5e9'
                }}>
                  <h3 style={{ 
                    fontWeight: '600', 
                    color: '#0c4a6e', 
                    marginBottom: '16px', 
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaKey size={16} />
                    Login Credentials
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* User ID */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaIdBadge style={{ color: '#0ea5e9', fontSize: '16px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>User ID</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#0c4a6e',
                          backgroundColor: '#e0f2fe',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          flex: 1
                        }}>
                          {selectedStaff.loginId || 'N/A'}
                        </span>
                        {selectedStaff.loginId && (
                          <button
                            onClick={() => copyToClipboard(selectedStaff.loginId, 'userId', selectedStaff.id)}
                            style={{
                              backgroundColor: copiedCredentials[`${selectedStaff.id}_userId`] ? '#10b981' : '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            <FaCopy size={12} />
                            {copiedCredentials[`${selectedStaff.id}_userId`] ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Username (if set) */}
                    {(selectedStaff.username) && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>Username</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: '#0c4a6e',
                            backgroundColor: '#e0f2fe',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            flex: 1
                          }}>
                            {selectedStaff.username}
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedStaff.username, 'username', selectedStaff.id)}
                            style={{
                              backgroundColor: copiedCredentials[`${selectedStaff.id}_username`] ? '#10b981' : '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            <FaCopy size={12} />
                            {copiedCredentials[`${selectedStaff.id}_username`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    {(selectedStaff.tempPassword || selectedStaff.password) && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <FaKey style={{ color: '#0ea5e9', fontSize: '16px' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>Password</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: '#0c4a6e',
                            backgroundColor: '#e0f2fe',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            flex: 1,
                            minWidth: '100px'
                          }}>
                            {showPassword[selectedStaff.id] 
                              ? (selectedStaff.tempPassword || selectedStaff.password || 'N/A')
                              : '••••••••'
                            }
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(selectedStaff.id)}
                            style={{
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            {showPassword[selectedStaff.id] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                            {showPassword[selectedStaff.id] ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(selectedStaff.tempPassword || selectedStaff.password, 'password', selectedStaff.id)}
                            style={{
                              backgroundColor: copiedCredentials[`${selectedStaff.id}_password`] ? '#10b981' : '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            <FaCopy size={12} />
                            {copiedCredentials[`${selectedStaff.id}_password`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Staff Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9'
                }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '12px', fontSize: '16px' }}>Personal Information</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {selectedStaff.name || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {selectedStaff.phone || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {selectedStaff.email || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Role:</strong> {getRoleInfo(selectedStaff.role || 'employee').label}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Status:</strong> {getStatusInfo(selectedStaff.status || 'active').label}</div>
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9'
                }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '12px', fontSize: '16px' }}>Work Information</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Start Date:</strong> {selectedStaff.startDate ? new Date(selectedStaff.startDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Last Login:</strong> {formatDateTime(selectedStaff.lastLogin)}</div>
                    {(() => {
                      const stats = getPerformanceStats(selectedStaff);
                      return (
                        <>
                          <div style={{ marginBottom: '8px' }}><strong>{stats.todayLabel}:</strong> {stats.todayValue}</div>
                          <div style={{ marginBottom: '8px' }}><strong>{stats.totalLabel}:</strong> {stats.totalValue}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              padding: '24px', 
              backgroundColor: '#f8fafc', 
              display: 'flex', 
              gap: '12px',
              borderTop: '1px solid #fef2f2'
            }}>
              <button
                onClick={() => setSelectedStaff(null)}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
              <button style={{
                flex: 1,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <FaEdit size={14} />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Language + Default Restaurant + Dashboard Customization */}
      {activeTab === 'settings' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'start'
        }}>
          {/* LEFT COLUMN — General Settings (Language + Default Restaurant merged) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: isMobile ? '16px' : '24px',
            border: '1px solid #f1f5f9'
          }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaSlidersH size={17} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>General Settings</h2>
                <p style={{ color: '#6b7280', margin: '2px 0 0 0', fontSize: '13px' }}>Language & default restaurant</p>
              </div>
            </div>

            {/* Language Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FaGlobe size={14} color="#3b82f6" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Language</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>App display language</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {getAvailableLanguages().map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '13px',
                        border: 'none',
                        background: isSelected ? '#3b82f6' : '#f1f5f9',
                        color: isSelected ? 'white' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                      }}
                    >
                      {lang.nativeName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 24px 0' }} />

            {/* Default Restaurant Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FaStore size={13} color="#1e293b" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Default Restaurant</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>Active across all pages</span>
              </div>
              {restaurants.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>No restaurants yet. Add one from the Restaurants tab.</p>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {restaurants.map(function(restaurant) {
                    var isSelected = selectedRestaurant?.id === restaurant.id;
                    return (
                      <button
                        key={restaurant.id}
                        onClick={function() {
                          setSelectedRestaurant(restaurant);
                          setPosSettings(restaurant.posSettings || {});
                          setBusinessType(restaurant.businessType || 'restaurant');
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '13px',
                          border: 'none',
                          background: isSelected ? '#111827' : '#f1f5f9',
                          color: isSelected ? 'white' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 8px rgba(17,24,39,0.2)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaStore size={11} />
                        {restaurant.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              disabled={generalSaving}
              onClick={async function() {
                setGeneralSaving(true);
                try {
                  // 1. Save preferences to backend (persists across logins)
                  await apiClient.updateUserPreferences({
                    defaultRestaurantId: selectedRestaurant?.id || null,
                    language: currentLang,
                  });

                  // 2. Apply language locally
                  setLanguage(currentLang);

                  // 3. Update localStorage (used by all pages on load)
                  if (selectedRestaurant) {
                    localStorage.setItem('selectedRestaurantId', selectedRestaurant.id);
                    localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
                    // Also update user object in localStorage with defaultRestaurantId
                    try {
                      var userData = JSON.parse(localStorage.getItem('user') || '{}');
                      userData.defaultRestaurantId = selectedRestaurant.id;
                      localStorage.setItem('user', JSON.stringify(userData));
                    } catch (e) {}
                  }

                  // 4. Dispatch event — Sidebar/Layout update instantly, other pages read localStorage on mount
                  window.dispatchEvent(new CustomEvent('restaurantChanged', {
                    detail: { restaurant: selectedRestaurant, restaurantId: selectedRestaurant?.id }
                  }));

                  // 5. Toast notification
                  showToast('Settings saved successfully!');
                } catch (err) {
                  console.error('Failed to save preferences:', err);
                  showToast('Failed to save. Please try again.', 'error');
                } finally {
                  setGeneralSaving(false);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                cursor: generalSaving ? 'not-allowed' : 'pointer',
                opacity: generalSaving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
              }}
            >
              {generalSaving ? <FaSpinner size={13} className="spin" /> : <FaSave size={13} />}
              {generalSaving ? 'Saving...' : 'Save & Apply'}
            </button>
          </div>

          {/* RIGHT COLUMN — Dashboard Customization */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: isMobile ? '16px' : '24px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaSlidersH size={16} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard Customization</h2>
                <p style={{ color: '#6b7280', margin: '2px 0 0 0', fontSize: '13px' }}>Billing buttons, fields & payments</p>
              </div>
              <button
                type="button"
                disabled={posSettingsSaving || !selectedRestaurant}
                onClick={handleSaveDashboardSettings}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  border: 'none',
                  background: posSettingsSaving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: posSettingsSaving ? '#9ca3af' : 'white',
                  cursor: posSettingsSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: posSettingsSaving ? 'none' : '0 2px 8px rgba(239,68,68,0.25)',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                {posSettingsSaving ? <FaSpinner className="animate-spin" size={12} /> : <FaSave size={12} />}
                {posSettingsSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Business Type Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Business Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'restaurant', label: 'Restaurant' },
                  { id: 'cafe', label: 'Cafe' },
                  { id: 'bar', label: 'Bar / Pub' },
                  { id: 'bakery', label: 'Bakery' },
                  { id: 'ice_cream', label: 'Ice Cream' },
                  { id: 'qsr', label: 'QSR' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setBusinessType(type.id);
                      // Pre-fill posSettings defaults based on type
                      const defaults = { defaultOrderType: 'dine-in', defaultPaymentMethod: 'cash' };
                      let preset = { ...defaults };
                      if (type.id === 'cafe') preset = { ...defaults, defaultOrderType: 'takeaway', hideTableField: true };
                      else if (type.id === 'bakery') preset = { ...defaults, defaultOrderType: 'takeaway', hideTableField: true, hidePlaceOrder: true };
                      else if (type.id === 'ice_cream') preset = { ...defaults, defaultOrderType: 'takeaway', hideTableField: true, hidePlaceOrder: true };
                      else if (type.id === 'qsr') preset = { ...defaults, defaultOrderType: 'takeaway', hideTableField: true, hidePlaceOrder: true };
                      setPosSettings(prev => ({ ...prev, ...preset }));
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: businessType === type.id ? '1px solid #111827' : '1px solid #e5e7eb',
                      background: businessType === type.id ? '#111827' : 'white',
                      color: businessType === type.id ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0 0' }}>
                Selecting a type pre-fills the settings below. You can still override individually.
              </p>
            </div>

            {/* Default Order Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Default Order Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'dine-in', label: 'Dine-in' },
                  { id: 'takeaway', label: 'Takeaway' },
                  { id: 'delivery', label: 'Delivery' },
                ].map((ot) => (
                  <button
                    key={ot.id}
                    type="button"
                    onClick={() => setPosSettings(prev => ({ ...prev, defaultOrderType: ot.id }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: (posSettings.defaultOrderType || 'dine-in') === ot.id ? '1px solid #111827' : '1px solid #e5e7eb',
                      background: (posSettings.defaultOrderType || 'dine-in') === ot.id ? '#111827' : 'white',
                      color: (posSettings.defaultOrderType || 'dine-in') === ot.id ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {ot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f3e8f0', margin: '20px 0' }} />

            {/* Button Visibility & Labels */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block' }}>
                Buttons
              </label>

              {/* Save Order Toggle + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideSaveOrder: !prev.hideSaveOrder }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideSaveOrder
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Save Order</span>
                <input
                  type="text"
                  placeholder="Save Order"
                  value={posSettings.saveOrderLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, saveOrderLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>

              {/* Place Order Toggle + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hidePlaceOrder: !prev.hidePlaceOrder }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hidePlaceOrder
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Place Order</span>
                <input
                  type="text"
                  placeholder="Place Order"
                  value={posSettings.placeOrderLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, placeOrderLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>

              {/* Complete Billing Label (always shown, can't hide) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <FaToggleOn size={28} color="#9ca3af" style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Complete Billing</span>
                <input
                  type="text"
                  placeholder="Complete Billing"
                  value={posSettings.completeBillingLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, completeBillingLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 38px' }}>
                Complete Billing is always visible and cannot be hidden.
              </p>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f3e8f0', margin: '20px 0' }} />

            {/* Customer Fields */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block' }}>
                Customer Fields
              </label>

              {/* Customer Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideCustomerName: !prev.hideCustomerName }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideCustomerName
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Customer Name</span>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={posSettings.customerNameLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, customerNameLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>

              {/* Mobile Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideMobile: !prev.hideMobile }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideMobile
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Mobile Number</span>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={posSettings.mobileLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, mobileLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>

              {/* Table Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideTableField: !prev.hideTableField }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideTableField
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '90px' }}>Table Number</span>
                <input
                  type="text"
                  placeholder="Table No"
                  value={posSettings.tableLabel || ''}
                  onChange={(e) => setPosSettings(prev => ({ ...prev, tableLabel: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f3e8f0', margin: '20px 0' }} />

            {/* Payment Methods */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block' }}>
                Payment Methods
              </label>

              {/* Cash - always on */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <FaToggleOn size={28} color="#9ca3af" style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '13px', color: '#374151' }}>Cash</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>(always enabled)</span>
              </div>

              {/* UPI */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideUPI: !prev.hideUPI }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideUPI
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151' }}>UPI</span>
              </div>

              {/* Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPosSettings(prev => ({ ...prev, hideCard: !prev.hideCard }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  {posSettings.hideCard
                    ? <FaToggleOff size={28} color="#d1d5db" />
                    : <FaToggleOn size={28} color="#ef4444" />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151' }}>Card</span>
              </div>

              {/* Default Payment Method */}
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                Default Payment Method
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'cash', label: 'Cash' },
                  ...(!posSettings.hideUPI ? [{ id: 'upi', label: 'UPI' }] : []),
                  ...(!posSettings.hideCard ? [{ id: 'card', label: 'Card' }] : []),
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPosSettings(prev => ({ ...prev, defaultPaymentMethod: pm.id }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: (posSettings.defaultPaymentMethod || 'cash') === pm.id ? '1px solid #111827' : '1px solid #e5e7eb',
                      background: (posSettings.defaultPaymentMethod || 'cash') === pm.id ? '#111827' : 'white',
                      color: (posSettings.defaultPaymentMethod || 'cash') === pm.id ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              disabled={posSettingsSaving || !selectedRestaurant}
              onClick={handleSaveDashboardSettings}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                background: posSettingsSaving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: posSettingsSaving ? '#9ca3af' : 'white',
                cursor: posSettingsSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: posSettingsSaving ? 'none' : '0 4px 12px rgba(239,68,68,0.25)',
                transition: 'all 0.2s'
              }}
            >
              {posSettingsSaving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
              {posSettingsSaving ? 'Saving...' : 'Save Dashboard Settings'}
            </button>
          </div>

          {/* PIN Login Security Card */}
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: isMobile ? '16px' : '24px',
            border: '1px solid #f1f5f9'
          }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: pinStatus.pinEnabled ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaKey size={17} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Login PIN</h2>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: pinStatus.pinEnabled ? '#ecfdf5' : '#f3f4f6',
                    color: pinStatus.pinEnabled ? '#059669' : '#6b7280',
                    border: `1px solid ${pinStatus.pinEnabled ? '#a7f3d0' : '#e5e7eb'}`
                  }}>
                    {pinStatus.pinEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p style={{ color: '#6b7280', margin: '2px 0 0 0', fontSize: '13px' }}>
                  Backup login when OTP doesn&apos;t arrive
                </p>
              </div>
            </div>

            {/* PIN Message */}
            {pinMessage.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: pinMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: pinMessage.type === 'error' ? '#dc2626' : '#059669',
                border: `1px solid ${pinMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`
              }}>
                {pinMessage.text}
              </div>
            )}

            {/* PIN Not Set State */}
            {!pinStatus.pinEnabled && pinFormMode === 'idle' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  Set a 5-10 digit PIN as a backup login method. When OTP doesn&apos;t arrive, you can log in using your phone number or email along with this PIN.
                </p>
                <button
                  onClick={() => { setPinFormMode('set'); setPinMessage({ type: '', text: '' }); setPinFormData({ currentPin: '', newPin: '', confirmPin: '' }); }}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaKey size={12} /> Enable & Set PIN
                </button>
              </div>
            )}

            {/* PIN Enabled State */}
            {pinStatus.pinEnabled && pinFormMode === 'idle' && (
              <div>
                <p style={{ fontSize: '13px', color: '#059669', margin: '0 0 16px 0', fontWeight: '500' }}>
                  PIN login is active. You can use your phone/email + PIN to log in when OTP is unavailable.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setPinFormMode('change'); setPinMessage({ type: '', text: '' }); setPinFormData({ currentPin: '', newPin: '', confirmPin: '' }); }}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaKey size={12} /> Change PIN
                  </button>
                  <button
                    onClick={() => { setPinFormMode('disable'); setPinMessage({ type: '', text: '' }); setPinFormData({ currentPin: '', newPin: '', confirmPin: '' }); }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Disable PIN
                  </button>
                </div>
              </div>
            )}

            {/* Set PIN Form */}
            {pinFormMode === 'set' && (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.newPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, newPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter 5-10 digit PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.confirmPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Re-enter PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pinSaving || pinFormData.newPin.length < 5}
                    style={{
                      padding: '10px 24px',
                      background: (pinSaving || pinFormData.newPin.length < 5) ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px',
                      cursor: (pinSaving || pinFormData.newPin.length < 5) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                    }}
                  >
                    {pinSaving ? <FaSpinner className="animate-spin" size={12} /> : <FaSave size={12} />}
                    {pinSaving ? 'Saving...' : 'Set PIN'}
                  </button>
                  <button
                    onClick={() => { setPinFormMode('idle'); setPinMessage({ type: '', text: '' }); }}
                    style={{
                      padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#6b7280',
                      border: '1px solid #e5e7eb', borderRadius: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Change PIN Form */}
            {pinFormMode === 'change' && (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.currentPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, currentPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter current PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.newPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, newPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter new 5-10 digit PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.confirmPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Re-enter new PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pinSaving || pinFormData.currentPin.length < 5 || pinFormData.newPin.length < 5}
                    style={{
                      padding: '10px 24px',
                      background: (pinSaving || pinFormData.currentPin.length < 5 || pinFormData.newPin.length < 5) ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px',
                      cursor: (pinSaving || pinFormData.currentPin.length < 5 || pinFormData.newPin.length < 5) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                    }}
                  >
                    {pinSaving ? <FaSpinner className="animate-spin" size={12} /> : <FaSave size={12} />}
                    {pinSaving ? 'Saving...' : 'Change PIN'}
                  </button>
                  <button
                    onClick={() => { setPinFormMode('idle'); setPinMessage({ type: '', text: '' }); }}
                    style={{
                      padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#6b7280',
                      border: '1px solid #e5e7eb', borderRadius: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Disable PIN Form */}
            {pinFormMode === 'disable' && (
              <div style={{ maxWidth: '400px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: '0 0 14px 0', fontWeight: '500' }}>
                  Enter your current PIN to disable PIN login.
                </p>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinFormData.currentPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, currentPin: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter current PIN"
                    maxLength={10}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb', letterSpacing: '3px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pinSaving || pinFormData.currentPin.length < 5}
                    style={{
                      padding: '10px 24px',
                      background: (pinSaving || pinFormData.currentPin.length < 5) ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px',
                      cursor: (pinSaving || pinFormData.currentPin.length < 5) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                    }}
                  >
                    {pinSaving ? <FaSpinner className="animate-spin" size={12} /> : null}
                    {pinSaving ? 'Disabling...' : 'Disable PIN'}
                  </button>
                  <button
                    onClick={() => { setPinFormMode('idle'); setPinMessage({ type: '', text: '' }); }}
                    style={{
                      padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#6b7280',
                      border: '1px solid #e5e7eb', borderRadius: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Toggle Section */}
      {activeTab === 'billing-settings' && (
        <div>
          {/* Compact Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            maxWidth: '720px',
            margin: '0 auto 16px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Billing Settings</h2>
            <button
              onClick={handleSaveBillingSettings}
              disabled={billingSaving || billingLoading}
              style={{
                padding: '7px 18px',
                background: billingSaving ? '#e5e7eb' : '#dc2626',
                color: billingSaving ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: billingSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {billingSaving ? <FaSpinner className="animate-spin" size={10} /> : <FaSave size={10} />}
              {billingSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {billingMessage.text && (
            <div style={{
              padding: '8px 14px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '12px',
              fontWeight: '500',
              maxWidth: '720px',
              margin: '0 auto 12px',
              backgroundColor: billingMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: billingMessage.type === 'error' ? '#dc2626' : '#059669',
              border: `1px solid ${billingMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`
            }}>
              {billingMessage.text}
            </div>
          )}

          {billingLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <FaSpinner className="animate-spin" size={20} color="#dc2626" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', maxWidth: '720px', margin: '0 auto' }}>

              {(() => {
                const billingFeatures = [
                  {
                    key: 'serviceChargeEnabled',
                    name: 'Service Charge',
                    desc: 'Auto-add % charge to bills',
                    icon: FaConciergeBell,
                    expandedContent: (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <div style={{ width: '80px' }}>
                          <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Rate %</label>
                          <input type="number" min="0" max="100" value={billingSettings.serviceChargeRate}
                            onChange={(e) => updateBillingSetting('serviceChargeRate', Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '100%', padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Bill label</label>
                          <input type="text" value={billingSettings.serviceChargeLabel}
                            onChange={(e) => updateBillingSetting('serviceChargeLabel', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '100%', padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                          />
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'roundOffEnabled',
                    name: 'Round-off',
                    desc: 'Round final amount',
                    icon: FaDivide,
                    expandedContent: (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        {[1, 5, 10].map(val => (
                          <button key={val}
                            onClick={(e) => { e.stopPropagation(); updateBillingSetting('roundOffTo', val); }}
                            style={{
                              padding: '4px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              border: billingSettings.roundOffTo === val ? '1.5px solid #1e293b' : '1px solid #e5e7eb',
                              background: billingSettings.roundOffTo === val ? '#1e293b' : 'white',
                              color: billingSettings.roundOffTo === val ? 'white' : '#64748b'
                            }}
                          >{formatCurrency(val)}</button>
                        ))}
                      </div>
                    )
                  },
                  {
                    key: 'cashTenderingEnabled',
                    name: 'Cash Tendering',
                    desc: 'Change calculation',
                    icon: FaMoneyBillWave,
                    expandedContent: (
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Denominations</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {[10, 20, 50, 100, 200, 500, 1000, 2000].map(d => {
                            const active = billingSettings.denominations.includes(d);
                            return (
                              <button key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBillingSetting('denominations',
                                    active ? billingSettings.denominations.filter(x => x !== d)
                                      : [...billingSettings.denominations, d].sort((a, b) => a - b)
                                  );
                                }}
                                style={{
                                  padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                  border: active ? '1.5px solid #1e293b' : '1px solid #e5e7eb',
                                  background: active ? '#1e293b' : 'white',
                                  color: active ? 'white' : '#94a3b8'
                                }}
                              >{formatCurrency(d)}</button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'splitPaymentEnabled',
                    name: 'Settlement Options',
                    desc: 'Split / multi-method settlement',
                    icon: FaCreditCard,
                    expandedContent: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <label onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                          <input type="checkbox" checked={billingSettings.settlementShowOnDashboard !== false}
                            onChange={(e) => updateBillingSetting('settlementShowOnDashboard', e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '14px', height: '14px', accentColor: '#dc2626' }}
                          />
                          Show on Dashboard order summary
                        </label>
                        <label onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                          <input type="checkbox" checked={billingSettings.settlementShowOnOrderHistory === true}
                            onChange={(e) => updateBillingSetting('settlementShowOnOrderHistory', e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '14px', height: '14px', accentColor: '#dc2626' }}
                          />
                          Show on Order History &rarr; Complete flow
                        </label>
                        {!billingSettings.settlementShowOnDashboard && !billingSettings.settlementShowOnOrderHistory && (
                          <p style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}>
                            Select at least one placement, otherwise Dashboard will be used by default.
                          </p>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'tipsEnabled',
                    name: 'Tips',
                    desc: 'Tracked per staff',
                    icon: FaHandHoldingUsd,
                    expandedContent: (
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tip presets</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {billingSettings.tipPresets.map((preset, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <input type="number" min="1" max="100" value={preset}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const newPresets = [...billingSettings.tipPresets];
                                  newPresets[idx] = Number(e.target.value);
                                  updateBillingSetting('tipPresets', newPresets);
                                }}
                                style={{ width: '48px', padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: '5px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                              />
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'partialPaymentEnabled',
                    name: 'Partial Payment',
                    desc: 'Khata / credit tracking',
                    icon: FaReceipt,
                    expandedContent: null
                  },
                  {
                    key: 'compVoidEnabled',
                    name: 'Comp / Void',
                    desc: 'With manager approval',
                    icon: FaGift,
                    expandedContent: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <label onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                          <input type="checkbox" checked={billingSettings.compVoidRequiresPin}
                            onChange={(e) => updateBillingSetting('compVoidRequiresPin', e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '14px', height: '14px', accentColor: '#dc2626' }}
                          />
                          Require manager PIN
                        </label>
                        {billingSettings.compVoidRequiresPin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaLock size={9} style={{ color: '#94a3b8' }} />
                            <input type="password" value={billingSettings.managerPin}
                              onChange={(e) => updateBillingSetting('managerPin', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="4-6 digit PIN" maxLength={6}
                              style={{ width: '120px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none', letterSpacing: '3px' }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'refundsEnabled',
                    name: 'Refunds',
                    desc: 'Full or partial refunds',
                    icon: FaUndo,
                    expandedContent: (
                      <div style={{ marginTop: '8px' }}>
                        <label onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                          <input type="checkbox" checked={billingSettings.refundsRequireApproval}
                            onChange={(e) => updateBillingSetting('refundsRequireApproval', e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '14px', height: '14px', accentColor: '#dc2626' }}
                          />
                          Require manager approval
                        </label>
                      </div>
                    )
                  }
                ];

                return billingFeatures.map((feature) => {
                  const isEnabled = billingSettings[feature.key];
                  const IconComp = feature.icon;
                  return (
                    <div
                      key={feature.key}
                      style={{
                        backgroundColor: 'white',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => updateBillingSetting(feature.key, !isEnabled)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: isEnabled ? '#1e293b' : '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.2s'
                        }}>
                          <IconComp size={13} color={isEnabled ? 'white' : '#94a3b8'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontSize: '13px', fontWeight: 600,
                            color: isEnabled ? '#1e293b' : '#94a3b8',
                            transition: 'color 0.2s'
                          }}>{feature.name}</span>
                          <span style={{ fontSize: '11px', color: '#b0b8c4', marginLeft: '8px' }}>{feature.desc}</span>
                        </div>
                        <div style={{
                          width: '36px', height: '20px', borderRadius: '10px',
                          background: isEnabled ? '#dc2626' : '#e2e8f0',
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0
                        }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: 'white', position: 'absolute', top: '2px',
                            left: isEnabled ? '18px' : '2px',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                          }} />
                        </div>
                      </div>
                      {isEnabled && feature.expandedContent && (
                        <div style={{ marginLeft: '44px', paddingTop: '4px' }}>
                          {feature.expandedContent}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

            </div>
          )}

          <p style={{ fontSize: '11px', color: '#b0b8c4', marginTop: '12px', maxWidth: '720px', margin: '12px auto 0' }}>
            Enabled features appear in the POS billing sidebar.
          </p>
        </div>
      )}

      {activeTab === 'features' && (
        <div>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaToggleOn size={18} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Features</h2>
                <p style={{ color: '#6b7280', margin: '2px 0 0 0', fontSize: '13px' }}>
                  Enable or disable sidebar navigation items
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveFeatures}
              disabled={featuresSaving}
              style={{
                padding: '10px 24px',
                background: featuresSaving ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: featuresSaving ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: featuresSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: featuresSaving ? 'none' : '0 2px 8px rgba(99,102,241,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {featuresSaving ? <FaSpinner className="animate-spin" size={12} /> : <FaSave size={12} />}
              {featuresSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Message */}
          {featuresMessage.text && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: featuresMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: featuresMessage.type === 'error' ? '#dc2626' : '#059669',
              border: `1px solid ${featuresMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`
            }}>
              {featuresMessage.text}
            </div>
          )}

          {/* Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {featureItems.map((feature) => {
              const isEnabled = !featureNotAllowed.includes(feature.id);
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '14px',
                    border: `1.5px solid ${isEnabled ? feature.color + '33' : '#e5e7eb'}`,
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: isEnabled ? `0 2px 8px ${feature.color}15` : '0 1px 3px rgba(0,0,0,0.03)',
                    opacity: isEnabled ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isEnabled ? `0 6px 20px ${feature.color}20` : '0 4px 12px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isEnabled ? `0 2px 8px ${feature.color}15` : '0 1px 3px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isEnabled ? `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}>
                    <IconComponent size={18} color={isEnabled ? 'white' : '#9ca3af'} />
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isEnabled ? '#111827' : '#9ca3af',
                      margin: 0,
                      marginBottom: '2px',
                      transition: 'color 0.2s'
                    }}>
                      {feature.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {feature.description}
                    </p>
                  </div>
                  {/* Toggle */}
                  <div style={{ flexShrink: 0 }}>
                    {isEnabled
                      ? <FaToggleOn size={28} style={{ color: feature.color, transition: 'color 0.2s' }} />
                      : <FaToggleOff size={28} style={{ color: '#d1d5db', transition: 'color 0.2s' }} />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info note */}
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '20px',
            fontStyle: 'italic'
          }}>
            Disabled features will be hidden from the sidebar navigation. Home, Admin, and Profile are always visible.
          </p>
        </div>
      )}

      {/* Tax Management Section */}
      {activeTab === 'tax' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <TaxManagement
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Zone Pricing Settings Section */}
      {activeTab === 'pricing' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <ZonePricingManagement
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Payment Settings Section */}
      {activeTab === 'payments' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <PaymentSettings
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Currency Settings Section */}
      {activeTab === 'currency' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <CurrencyManagement
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Print Settings Section */}
      {activeTab === 'print' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <PrintSettings
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Order Management Section */}
      {activeTab === 'order-management' && (
        <div style={{
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(236,72,153,0.06)',
            padding: '32px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              marginBottom: '28px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f3e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
                }}>
                  <FaReceipt size={22} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: 0, letterSpacing: '-0.02em' }}>
                    Order numbering
                  </h2>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                    How order #1, #2, … are assigned
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Restaurant
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    style={{
                      background: selectedRestaurant?.id === restaurant.id ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#faf5f7',
                      color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: selectedRestaurant?.id === restaurant.id ? 'none' : '1px solid #fef2f2',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedRestaurant?.id === restaurant.id ? '0 4px 12px rgba(236,72,153,0.25)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaStore size={14} />
                    {restaurant.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedRestaurant && (
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #f1f5f9',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Numbering mode
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    backgroundColor: orderManagementSeqEnabled ? 'transparent' : 'white',
                    borderRadius: '12px',
                    border: `2px solid ${orderManagementSeqEnabled ? '#e5e7eb' : '#ef4444'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: orderManagementSeqEnabled ? 'none' : '0 2px 8px rgba(236,72,153,0.12)'
                  }}>
                    <input
                      type="radio"
                      name="orderMode"
                      checked={!orderManagementSeqEnabled}
                      onChange={() => setOrderManagementSeqEnabled(false)}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Daily reset</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>#1, #2 today → #1, #2 again tomorrow (default)</p>
                    </div>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    backgroundColor: orderManagementSeqEnabled ? 'white' : 'transparent',
                    borderRadius: '12px',
                    border: `2px solid ${orderManagementSeqEnabled ? '#ef4444' : '#e5e7eb'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: orderManagementSeqEnabled ? '0 2px 8px rgba(236,72,153,0.12)' : 'none'
                  }}>
                    <input
                      type="radio"
                      name="orderMode"
                      checked={orderManagementSeqEnabled}
                      onChange={() => setOrderManagementSeqEnabled(true)}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Sequential (never reset)</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>#1, #2, #3… forever</p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedRestaurant?.id) return;
                    setOrderManagementSaving(true);
                    try {
                      await apiClient.updateRestaurant(selectedRestaurant.id, {
                        orderSettings: { sequentialOrderIdEnabled: orderManagementSeqEnabled }
                      });
                      setRestaurants(prev => prev.map(r => r.id === selectedRestaurant.id ? { ...r, orderSettings: { ...(r.orderSettings || {}), sequentialOrderIdEnabled: orderManagementSeqEnabled } } : r));
                      setSelectedRestaurant(prev => prev && prev.id === selectedRestaurant.id ? { ...prev, orderSettings: { ...(prev.orderSettings || {}), sequentialOrderIdEnabled: orderManagementSeqEnabled } } : prev);
                      showToast('Settings saved successfully!');
                    } catch (err) {
                      console.error(err);
                      showToast('Failed to save. Please try again.', 'error');
                    } finally {
                      setOrderManagementSaving(false);
                    }
                  }}
                  disabled={orderManagementSaving}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    border: 'none',
                    cursor: orderManagementSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: orderManagementSaving ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    boxShadow: orderManagementSaving ? 'none' : '0 4px 14px rgba(236,72,153,0.35)'
                  }}
                >
                  {orderManagementSaving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <FaSave size={16} />}
                  {orderManagementSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}

            {!selectedRestaurant && restaurants.length > 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Choose a restaurant above to set order numbering.</p>
            )}
            {!selectedRestaurant && restaurants.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Add a restaurant first, then configure order numbering here.</p>
            )}
          </div>
        </div>
      )}

      {/* Offers & Discounts Section */}
      {activeTab === 'offers' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          padding: isMobile ? '12px' : '24px'
        }}>
          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
              <p style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Restaurant
              </p>
              <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
                {restaurants.map((restaurant) => {
                  const isActive = (offersSelectedRestaurant?.id || selectedRestaurant?.id) === restaurant.id;
                  return (
                    <button
                      key={restaurant.id}
                      onClick={() => setOffersSelectedRestaurant(restaurant)}
                      style={{
                        background: isActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#faf5f7',
                        color: isActive ? 'white' : '#374151',
                        padding: isMobile ? '7px 12px' : '10px 18px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: isMobile ? '12px' : '14px',
                        border: isActive ? 'none' : '1px solid #fef2f2',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 4px 12px rgba(236,72,153,0.25)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '6px' : '8px'
                      }}
                    >
                      <FaStore size={isMobile ? 11 : 14} />
                      {restaurant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <OffersManagement
            key={offersSelectedRestaurant?.id || selectedRestaurant?.id}
            embedded={true}
            restaurantId={offersSelectedRestaurant?.id || selectedRestaurant?.id}
            restaurants={restaurants}
          />
        </div>
      )}

      {/* Loyalty Program Section */}
      {activeTab === 'loyalty' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          padding: isMobile ? '12px' : '24px'
        }}>
          {/* Restaurant Selector */}
          <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
            <p style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Restaurant
            </p>
            <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  style={{
                    background: selectedRestaurant?.id === restaurant.id ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#faf5f7',
                    color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                    padding: isMobile ? '7px 12px' : '10px 18px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: isMobile ? '12px' : '14px',
                    border: selectedRestaurant?.id === restaurant.id ? 'none' : '1px solid #fef2f2',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedRestaurant?.id === restaurant.id ? '0 4px 12px rgba(236,72,153,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : '8px'
                  }}
                >
                  <FaStore size={isMobile ? 11 : 14} />
                  {restaurant.name}
                </button>
              ))}
            </div>
          </div>

          {selectedRestaurant ? (
            <CustomerAppSettings key={selectedRestaurant.id} embedded={true} restaurantId={selectedRestaurant.id} section="loyalty" />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <FaStar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>Please select a restaurant to manage loyalty settings</p>
            </div>
          )}
        </div>
      )}

      {/* Google Reviews Section */}
      {activeTab === 'google-reviews' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '24px',
          border: '1px solid #e5e7eb',
          minHeight: '400px'
        }}>
          {!selectedRestaurant ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <FaGoogle size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Select a Restaurant
              </h3>
              <p>Please select a restaurant from the dropdown above to manage Google Reviews.</p>
            </div>
          ) : (
            <GoogleReviews
              restaurantId={selectedRestaurant.id}
              restaurant={selectedRestaurant}
            />
          )}
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <WhatsAppTab
          selectedRestaurant={selectedRestaurant}
        />
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
          }
          to { 
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .mobile-modal {
            transform: translateY(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;