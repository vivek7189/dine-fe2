'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaPercent,
  FaGift,
  FaCog,
  FaSave,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';

const OffersManagement = ({ embedded = false, restaurantId: propRestaurantId = null }) => {
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerSettings, setOfferSettings] = useState({
    autoApplyBestOffer: false,
    allowMultipleOffers: false,
    maxOffersAllowed: 1
  });

  const emptyOffer = {
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: null,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
    usageLimit: null,
    isFirstOrderOnly: false,
    autoApply: false,
    // Enhanced fields
    scope: 'order',
    targetCategories: [],
    targetItems: [],
    schedule: null,
    promotionType: 'discount',
    bogoConfig: null,
    eventLabel: '',
  };

  const [formData, setFormData] = useState(emptyOffer);
  const [offerErrors, setOfferErrors] = useState({
    maxOffersAllowed: '',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: ''
  });

  // Handle number input with validation (only numbers allowed)
  const handleOfferNumberInput = (field, value, setter, allowDecimal = false) => {
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (value === '' || pattern.test(value)) {
      setOfferErrors(prev => ({ ...prev, [field]: '' }));
      setter(value);
    } else {
      setOfferErrors(prev => ({ ...prev, [field]: 'Only numbers allowed' }));
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only access localStorage on the client
    if (typeof window === 'undefined') return;

    // Use prop restaurantId first (when embedded), then try to get from user object in localStorage
    let id = propRestaurantId;
    if (!id) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      id = userData.restaurant?.id || userData.restaurantId;
    }

    if (id) {
      setRestaurantId(id);
      loadOffers(id);
    } else if (!embedded) {
      // Only redirect if not embedded as a tab
      router.push('/admin');
    } else {
      // When embedded, just set loading to false and wait
      setLoading(false);
    }
  }, [router, embedded, propRestaurantId]);

  const loadOffers = async (id) => {
    try {
      // Load offers and settings in parallel
      const [offersResponse, settingsResponse] = await Promise.all([
        apiClient.get(`/api/offers/${id}`),
        apiClient.get(`/api/restaurants/${id}/customer-app-settings`)
      ]);

      setOffers(offersResponse.offers || []);

      // Load offer settings
      if (settingsResponse?.settings?.offerSettings) {
        setOfferSettings(settingsResponse.settings.offerSettings);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get restaurantId from state, prop, or user object in localStorage
  const getRestaurantId = () => {
    if (restaurantId) return restaurantId;
    if (propRestaurantId) return propRestaurantId;
    // Try to get from user object in localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const id = userData.restaurant?.id || userData.restaurantId;
    if (id) {
      setRestaurantId(id);
      return id;
    }
    return null;
  };

  const saveOfferSettings = async () => {
    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    setSavingSettings(true);
    try {
      // Get current settings first
      const currentSettings = await apiClient.get(`/api/restaurants/${currentRestaurantId}/customer-app-settings`);

      // Update with new offer settings
      await apiClient.put(`/api/restaurants/${currentRestaurantId}/customer-app-settings`, {
        ...currentSettings.settings,
        offerSettings
      });

      alert('Offer settings saved successfully!');
    } catch (error) {
      console.error('Error saving offer settings:', error);
      alert('Failed to save offer settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        ...offer,
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingOffer(null);
      setFormData(emptyOffer);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please enter an offer name');
      return;
    }

    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    setSaving(true);
    try {
      if (editingOffer) {
        await apiClient.put(`/api/offers/${currentRestaurantId}/${editingOffer.id}`, formData);
      } else {
        await apiClient.post(`/api/offers/${currentRestaurantId}`, formData);
      }
      await loadOffers(currentRestaurantId);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    try {
      await apiClient.delete(`/api/offers/${currentRestaurantId}/${offerId}`);
      await loadOffers(currentRestaurantId);
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer');
    }
  };

  const handleToggleActive = async (offer) => {
    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      alert('No restaurant selected. Please select a restaurant first.');
      return;
    }

    try {
      await apiClient.put(`/api/offers/${currentRestaurantId}/${offer.id}`, {
        ...offer,
        isActive: !offer.isActive
      });
      await loadOffers(currentRestaurantId);
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  };

  const getDiscountLabel = (offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `Rs. ${offer.discountValue} OFF`;
  };

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
          border: '1px solid #fce7f3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaTag color="#ec4899" size={isMobile ? 24 : 28} />
              Offers & Promotions
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Create and manage offers for your Crave app customers
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
          >
            <FaPlus />
            Create Offer
          </button>
        </div>

        {/* Offer Settings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCog color="#6b7280" />
              Offer Settings
            </h2>
            <button
              onClick={saveOfferSettings}
              disabled={savingSettings}
              style={{
                padding: '8px 16px',
                backgroundColor: savingSettings ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: savingSettings ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <FaSave size={12} />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
            {/* Auto-apply Best Offer */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Auto-apply Best Offer</span>
                <button
                  onClick={() => setOfferSettings(prev => ({ ...prev, autoApplyBestOffer: !prev.autoApplyBestOffer }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {offerSettings.autoApplyBestOffer ? (
                    <FaToggleOn size={24} color="#10b981" />
                  ) : (
                    <FaToggleOff size={24} color="#9ca3af" />
                  )}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Automatically apply the best available offer to customer orders
              </p>
            </div>

            {/* Allow Multiple Offers */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Allow Multiple Offers</span>
                <button
                  onClick={() => setOfferSettings(prev => ({ ...prev, allowMultipleOffers: !prev.allowMultipleOffers }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {offerSettings.allowMultipleOffers ? (
                    <FaToggleOn size={24} color="#10b981" />
                  ) : (
                    <FaToggleOff size={24} color="#9ca3af" />
                  )}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Allow customers to combine multiple offers on a single order
              </p>
            </div>

            {/* Max Offers Allowed */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Max Offers per Order</span>
              </div>
              <input
                type="text"
                value={offerSettings.maxOffersAllowed}
                onChange={(e) => handleOfferNumberInput('maxOffersAllowed', e.target.value, (val) => {
                  const numVal = val === '' ? '' : parseInt(val, 10);
                  setOfferSettings(prev => ({ ...prev, maxOffersAllowed: numVal }));
                })}
                disabled={!offerSettings.allowMultipleOffers}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: offerErrors.maxOffersAllowed ? '2px solid #dc2626' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: offerSettings.allowMultipleOffers ? 'white' : '#f3f4f6',
                  color: offerSettings.allowMultipleOffers ? '#1f2937' : '#9ca3af'
                }}
              />
              {offerErrors.maxOffersAllowed && (
                <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{offerErrors.maxOffersAllowed}</p>
              )}
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0' }}>
                {offerSettings.allowMultipleOffers ? 'Maximum number of offers that can be combined' : 'Enable multiple offers first'}
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
              <strong>Note:</strong> First-order-only offers are automatically hidden from returning customers on the online ordering page.
            </p>
          </div>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #fce7f3'
          }}>
            <FaGift size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No Offers Yet</h3>
            <p style={{ color: '#6b7280', margin: '0 0 24px' }}>
              Create your first offer to attract more customers
            </p>
            <button
              onClick={() => handleOpenModal()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Your First Offer
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: offer.isActive ? '2px solid #10b981' : '1px solid #e5e7eb',
                  opacity: offer.isActive ? 1 : 0.7
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: offer.discountType === 'percentage' ? '#fef3c7' : '#dbeafe',
                        color: offer.discountType === 'percentage' ? '#92400e' : '#1e40af',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {getDiscountLabel(offer)}
                      </span>
                      {offer.isFirstOrderOnly && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#f3e8ff',
                          color: '#7c3aed',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          First Order Only
                        </span>
                      )}
                      {offer.autoApply && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Auto-Apply
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                      {offer.name}
                    </h3>
                    {offer.description && (
                      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6b7280' }}>
                        {offer.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
                      {offer.minOrderValue > 0 && (
                        <span>Min order: Rs. {offer.minOrderValue}</span>
                      )}
                      {offer.maxDiscount && (
                        <span>Max discount: Rs. {offer.maxDiscount}</span>
                      )}
                      {offer.usageLimit && (
                        <span>Usage limit: {offer.usageCount || 0}/{offer.usageLimit}</span>
                      )}
                      {offer.validUntil && (
                        <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleActive(offer)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                      title={offer.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {offer.isActive ? (
                        <FaToggleOn size={24} color="#10b981" />
                      ) : (
                        <FaToggleOff size={24} color="#9ca3af" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(offer)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Edit"
                    >
                      <FaEdit color="#6b7280" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                    >
                      <FaTrash color="#dc2626" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {editingOffer ? 'Edit Offer' : 'Create Offer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <FaTimes size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Offer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. New Year Special"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the offer"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Discount Value
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.discountValue}
                      onChange={(e) => handleOfferNumberInput('discountValue', e.target.value, (val) => {
                        const numVal = val === '' ? '' : parseFloat(val);
                        setFormData(prev => ({ ...prev, discountValue: numVal }));
                      }, true)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingLeft: '36px',
                        border: offerErrors.discountValue ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                      {formData.discountType === 'percentage' ? <FaPercent /> : getCurrencySymbol()}
                    </span>
                  </div>
                  {offerErrors.discountValue && (
                    <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{offerErrors.discountValue}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Min Order Value (Rs.)
                  </label>
                  <input
                    type="text"
                    value={formData.minOrderValue}
                    onChange={(e) => handleOfferNumberInput('minOrderValue', e.target.value, (val) => {
                      const numVal = val === '' ? '' : parseInt(val, 10);
                      setFormData(prev => ({ ...prev, minOrderValue: numVal }));
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: offerErrors.minOrderValue ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {offerErrors.minOrderValue && (
                    <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{offerErrors.minOrderValue}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Max Discount (Rs.)
                  </label>
                  <input
                    type="text"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => handleOfferNumberInput('maxDiscount', e.target.value, (val) => {
                      setFormData(prev => ({ ...prev, maxDiscount: val === '' ? null : parseInt(val, 10) }));
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: offerErrors.maxDiscount ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="No limit"
                  />
                  {offerErrors.maxDiscount && (
                    <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{offerErrors.maxDiscount}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
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

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Usage Limit (total uses)
                </label>
                <input
                  type="text"
                  value={formData.usageLimit || ''}
                  onChange={(e) => handleOfferNumberInput('usageLimit', e.target.value, (val) => {
                    setFormData(prev => ({ ...prev, usageLimit: val === '' ? null : parseInt(val, 10) }));
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: offerErrors.usageLimit ? '2px solid #dc2626' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Unlimited"
                />
                {offerErrors.usageLimit && (
                  <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{offerErrors.usageLimit}</p>
                )}
              </div>

              {/* Promotion Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Promotion Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'discount', label: 'Discount' },
                    { value: 'bogo', label: 'BOGO' },
                    { value: 'event', label: 'Event' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, promotionType: opt.value }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: formData.promotionType === opt.value ? '2px solid #ec4899' : '2px solid #e5e7eb',
                        backgroundColor: formData.promotionType === opt.value ? '#fdf2f8' : 'white',
                        color: formData.promotionType === opt.value ? '#be185d' : '#6b7280',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOGO Config */}
              {formData.promotionType === 'bogo' && (
                <div style={{ padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '8px', border: '1px solid #fce7f3' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '8px' }}>
                    BOGO Configuration
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Buy Qty</label>
                      <input
                        type="number"
                        value={formData.bogoConfig?.buyQty || 2}
                        onChange={(e) => setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: parseInt(e.target.value) || 2, getQty: prev.bogoConfig?.getQty || 1, getDiscount: prev.bogoConfig?.getDiscount || 100 } }))}
                        min="1"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Get Qty Free</label>
                      <input
                        type="number"
                        value={formData.bogoConfig?.getQty || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: parseInt(e.target.value) || 1, getDiscount: prev.bogoConfig?.getDiscount || 100 } }))}
                        min="1"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Discount %</label>
                      <input
                        type="number"
                        value={formData.bogoConfig?.getDiscount || 100}
                        onChange={(e) => setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: prev.bogoConfig?.getQty || 1, getDiscount: parseInt(e.target.value) || 100 } }))}
                        min="0"
                        max="100"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    e.g., Buy 2 Get 1 at 100% off = Buy 2 Get 1 Free
                  </p>
                </div>
              )}

              {/* Event Label */}
              {formData.promotionType === 'event' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Event Label
                  </label>
                  <input
                    type="text"
                    value={formData.eventLabel || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventLabel: e.target.value }))}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="e.g., Ladies Night, Trivia Tuesday, Happy Hour"
                  />
                </div>
              )}

              {/* Scope */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Applies To
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'order', label: 'Whole Order' },
                    { value: 'category', label: 'Categories' },
                    { value: 'item', label: 'Specific Items' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, scope: opt.value }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: formData.scope === opt.value ? '2px solid #ec4899' : '2px solid #e5e7eb',
                        backgroundColor: formData.scope === opt.value ? '#fdf2f8' : 'white',
                        color: formData.scope === opt.value ? '#be185d' : '#6b7280',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Categories */}
              {formData.scope === 'category' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Target Categories (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.targetCategories || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetCategories: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="e.g., Whiskey, Beer, Cocktails"
                  />
                </div>
              )}

              {/* Target Items */}
              {formData.scope === 'item' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Target Item IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.targetItems || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetItems: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="e.g., item_123, item_456"
                  />
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Copy item IDs from your menu
                  </p>
                </div>
              )}

              {/* Schedule (Happy Hour) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!formData.schedule}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: e.target.checked ? { type: 'recurring', days: [1,2,3,4,5], startTime: '16:00', endTime: '19:00' } : null
                    }))}
                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Time-based schedule (Happy Hour)</span>
                </label>
                {formData.schedule && (
                  <div style={{ padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Days</label>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const days = formData.schedule.days || [];
                              const newDays = days.includes(i) ? days.filter(d => d !== i) : [...days, i];
                              setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, days: newDays } }));
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: (formData.schedule.days || []).includes(i) ? '2px solid #f59e0b' : '1px solid #d1d5db',
                              backgroundColor: (formData.schedule.days || []).includes(i) ? '#fef3c7' : 'white',
                              color: (formData.schedule.days || []).includes(i) ? '#92400e' : '#6b7280',
                              fontWeight: '600',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Start Time</label>
                        <input
                          type="time"
                          value={formData.schedule.startTime || '16:00'}
                          onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, startTime: e.target.value } }))}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>End Time</label>
                        <input
                          type="time"
                          value={formData.schedule.endTime || '19:00'}
                          onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, endTime: e.target.value } }))}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFirstOrderOnly}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFirstOrderOnly: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>First order only</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.autoApply}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoApply: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Auto-apply (best offer applied automatically)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: saving ? '#9ca3af' : '#ec4899',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersManagement;
