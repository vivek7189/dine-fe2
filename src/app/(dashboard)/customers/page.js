'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import apiClient from '../../../lib/api';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedCustomersData, setCachedCustomersData } from '../../../utils/dashboardCache';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHistory,
  FaEye,
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTag,
  FaMobileAlt,
  FaGift,
  FaArrowRight
} from 'react-icons/fa';

// Reuse full-page content as embedded tabs (standalone /offers and /customer-app remain live)
const OffersManagement = dynamic(() => import('../offers/page'), { ssr: false });
const CustomerAppSettings = dynamic(() => import('../customer-app/page'), { ssr: false });

// Memoized Customer Form Component to prevent focus loss
const CustomerForm = React.memo(({ 
  isEdit = false, 
  customerForm, 
  setCustomerForm, 
  formErrors, 
  saving, 
  onSubmit, 
  onClose, 
  isMobile 
}) => {
  if (!isEdit && !customerForm) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: isMobile ? '16px' : '32px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: isMobile ? '100%' : '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              {isEdit ? t('customers.editCustomer') : t('customers.addNewCustomer')}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: '24px' }}>
          {formErrors.general && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px'
            }}>
              <FaExclamationTriangle style={{ marginRight: '8px' }} />
              {formErrors.general}
            </div>
          )}

          {/* Field Requirements Note */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#0369a1'
          }}>
            <strong>{t('common.notes')}:</strong> {t('customers.form.note')}
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '16px' }}>
            {/* Name */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {t('customers.form.name')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                placeholder={t('customers.form.namePlaceholder')}
              />
            </div>

            {/* Phone */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {t('customers.form.phone')} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="tel"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                placeholder={t('customers.form.phonePlaceholder')}
              />
              {formErrors.phone && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {formErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '16px' }}>
            {/* Email */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {t('customers.form.email')}
              </label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                placeholder={t('customers.form.emailPlaceholder')}
              />
              {formErrors.email && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* City */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {t('customers.form.city')}
              </label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                placeholder={t('customers.form.cityPlaceholder')}
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              {t('customers.form.dateOfBirth')}
            </label>
            <input
              type="date"
              value={customerForm.dob}
              onChange={(e) => setCustomerForm({ ...customerForm, dob: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t('customers.form.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? t('customers.form.saving') : (isEdit ? t('customers.form.update') : t('customers.form.add'))} {t('customers.form.customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CustomerForm.displayName = 'CustomerForm';

const Customers = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [sortBy, setSortBy] = useState('lastOrderDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isMobile, setIsMobile] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    dob: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [engagementTab, setEngagementTab] = useState('customers'); // 'customers' | 'offers' | 'loyalty' | 'crave-app'

  // Language detection
  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
    const handleLanguageChange = (e) => setCurrentLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load restaurant and user data
  useEffect(() => {
    const loadUserAndRestaurant = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || !userData.id) {
          console.log('❌ Customers: No auth token or user, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('👤 Customers: User loaded:', userData.role);

        // Try multiple sources for restaurant ID (in order of priority)
        let finalRestaurantId = null;
        let finalRestaurant = null;

        // 1. For staff members - use assigned restaurant from user data
        if (userData.restaurantId) {
          finalRestaurantId = userData.restaurantId;
          finalRestaurant = {
            id: userData.restaurantId,
            name: userData.restaurant?.name || 'Restaurant'
          };
          console.log('👨‍💼 Customers: Using staff assigned restaurant:', finalRestaurantId);
        }
        // 2. For owners - try saved restaurant first
        else {
          const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
          const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');

          if (savedRestaurantId && savedRestaurant) {
            finalRestaurantId = savedRestaurantId;
            finalRestaurant = savedRestaurant;
            console.log('💾 Customers: Using saved restaurant from localStorage:', finalRestaurantId);
          }
          // 3. If no saved restaurant, fetch from API
          else {
            console.log('🔄 Customers: No saved restaurant, fetching from API...');
            try {
              const restaurantsResponse = await apiClient.getRestaurants();
              if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
                const firstRestaurant = restaurantsResponse.restaurants[0];
                finalRestaurantId = firstRestaurant.id;
                finalRestaurant = firstRestaurant;
                console.log('✅ Customers: Using first restaurant from API:', finalRestaurantId);

                // Save to localStorage for future use
                localStorage.setItem('selectedRestaurantId', finalRestaurantId);
                localStorage.setItem('selectedRestaurant', JSON.stringify(finalRestaurant));
              }
            } catch (error) {
              console.error('❌ Customers: Error fetching restaurants:', error);
            }
          }
        }

        if (finalRestaurantId) {
          console.log('✅ Customers: Restaurant set successfully:', finalRestaurantId);
          setRestaurantId(finalRestaurantId);
          setRestaurant(finalRestaurant);
        } else {
          console.error('❌ Customers: No restaurant ID available');
          setError('No restaurant found. Please contact support.');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Customers: Error in loadUserAndRestaurant:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    loadUserAndRestaurant();
  }, [router]);

  // Load customers when restaurant is set
  useEffect(() => {
    if (restaurantId) {
      loadCustomers(true); // Use cache
    }
  }, [restaurantId]);

  // Listen for restaurant changes
  useEffect(() => {
    const handleRestaurantChange = () => {
      console.log('Restaurant changed, reloading customers');
      loadCustomers();
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, []);

  const loadCustomers = async (useCache = true) => {
    try {
      const user = apiClient.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      if (!restaurantId) {
        console.log('⚠️ Customers: No restaurant ID available yet');
        return;
      }

      // Check for cached data first
      if (useCache) {
        const cachedData = getCachedCustomersData(restaurantId);
        if (cachedData) {
          console.log('⚡ Loading cached customers data instantly...');
          setCustomers(cachedData.customers || []);
          setLoading(false);

          // Show background loading
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('customersBackgroundLoading', { detail: { loading: true } }));
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }

      // Fetch fresh data
      const response = await apiClient.request(`/api/customers/${restaurantId}`);
      const freshCustomers = response.customers || [];
      setCustomers(freshCustomers);

      // Cache the data
      const dataToCache = {
        customers: freshCustomers
      };
      setCachedCustomersData(restaurantId, dataToCache);
      console.log('✅ Customers data cached');

    } catch (error) {
      console.error('Error loading customers:', error);
      setError(t('customers.messages.failedToLoad'));
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('customersBackgroundLoading', { detail: { loading: false } }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    console.log('Validating form with data:', customerForm);
    
    // Either name OR phone must be provided (mandatory)
    if (!customerForm.name && !customerForm.phone) {
      errors.general = t('customers.validation.nameOrPhoneRequired');
    }
    
    // If phone is provided, validate format
    if (customerForm.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(customerForm.phone)) {
      errors.phone = t('customers.validation.invalidPhone');
    }
    
    // If email is provided, validate format (optional field)
    if (customerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) {
      errors.email = t('customers.validation.invalidEmail');
    }
    
    console.log('Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', customerForm);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, proceeding with submission');

    try {
      console.log('Setting saving to true');
      setSaving(true);
      console.log('Saving state set to true');

      if (!restaurantId) {
        console.log('No restaurant ID found, setting error');
        setError(t('customers.messages.noRestaurantSelected'));
        return;
      }

      console.log('Using restaurant ID:', restaurantId);

      const customerData = {
        name: customerForm.name || null,
        phone: customerForm.phone || null,
        email: customerForm.email || null,
        city: customerForm.city || null,
        dob: customerForm.dob || null,
        restaurantId: restaurantId
      };

      console.log('Creating customer with data:', customerData);
      console.log('About to make API call...');
      console.log('Selected customer state:', selectedCustomer);

      if (selectedCustomer) {
        // Update existing customer
        console.log('Updating existing customer:', selectedCustomer.id);
        await apiClient.request(`/api/customers/${selectedCustomer.id}`, {
          method: 'PATCH',
          body: customerData
        });
        console.log('Customer updated successfully');
        setShowEditModal(false);
      } else {
        // Create new customer
        console.log('Creating new customer via API...');
        const response = await apiClient.request('/api/customers', {
          method: 'POST',
          body: customerData
        });
        console.log('Customer created successfully:', response);
        setShowAddModal(false);
      }

      // Reset form
      setCustomerForm({ name: '', phone: '', email: '', city: '', dob: '' });
      setFormErrors({});
      setSelectedCustomer(null);

      // Reload customers
      await loadCustomers();

    } catch (error) {
      console.error('Error saving customer:', error);
      console.error('Error details:', error.message, error.stack);
      setError(error.message || t('customers.messages.failedToSave'));
    } finally {
      console.log('Setting saving to false');
      setSaving(false);
    }
  };

  // Handle delete customer
  const handleDelete = async (customer) => {
    const customerName = customer.name || customer.phone || t('customers.unnamed');
    const confirmMessage = t('customers.messages.deleteConfirm', { name: customerName });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await apiClient.request(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      });
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError(t('customers.messages.failedToDelete'));
    }
  };

  // Handle edit customer
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      city: customer.city || '',
      dob: customer.dob || ''
    });
    setShowEditModal(true);
  };

  // Handle view order history
  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    setShowOrderHistory(true);
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.city && customer.city.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'lastOrderDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (sortBy === 'loyaltyPoints' || sortBy === 'totalOrders' || sortBy === 'totalSpent') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Helper functions for modal management
  const closeAddModal = () => {
    setShowAddModal(false);
    setCustomerForm({ name: '', phone: '', email: '', city: '', dob: '' });
    setFormErrors({});
    setSelectedCustomer(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCustomerForm({ name: '', phone: '', email: '', city: '', dob: '' });
    setFormErrors({});
    setSelectedCustomer(null);
  };

  // Order history modal
  const OrderHistoryModal = () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: isMobile ? '16px' : '32px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              {t('customers.orderHistory.title')} - {selectedCustomer?.name || selectedCustomer?.phone || t('customers.form.customer')}
            </h2>
            <button
              onClick={() => {
                setShowOrderHistory(false);
                setSelectedCustomer(null);
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {selectedCustomer?.orderHistory && selectedCustomer.orderHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedCustomer.orderHistory
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .map((order, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                          {order.orderNumber}
                        </h3>
                        {/* Order Type Tag */}
                        {order.orderTypeLabel && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: order.orderType === 'dine_in' ? '#dbeafe' :
                                           order.orderType === 'takeaway' ? '#fef3c7' :
                                           order.orderType === 'delivery' ? '#dcfce7' : '#f3e8ff',
                            color: order.orderType === 'dine_in' ? '#1e40af' :
                                  order.orderType === 'takeaway' ? '#92400e' :
                                  order.orderType === 'delivery' ? '#166534' : '#7e22ce'
                          }}>
                            {order.orderTypeLabel}
                          </span>
                        )}
                        {/* Crave App Tag */}
                        {order.orderSource === 'crave_app' && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: '#fce7f3',
                            color: '#be185d'
                          }}>
                            Crave
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                        ₹{order.totalAmount}
                      </p>
                      {order.tableNumber && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          {t('customers.orderHistory.table')}: {order.tableNumber}
                        </p>
                      )}
                      {/* Discount info */}
                      {(order.discountAmount > 0 || order.loyaltyDiscount > 0) && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#059669' }}>
                          {order.discountAmount > 0 && `Offer: -₹${order.discountAmount}`}
                          {order.discountAmount > 0 && order.loyaltyDiscount > 0 && ' | '}
                          {order.loyaltyDiscount > 0 && `Loyalty: -₹${order.loyaltyDiscount}`}
                        </p>
                      )}
                      {/* Loyalty points earned */}
                      {order.loyaltyPointsEarned > 0 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#7c3aed' }}>
                          +{order.loyaltyPointsEarned} pts earned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FaHistory size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>
                {t('customers.orderHistory.noHistory')}
              </h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#9ca3af' }}>
                {t('customers.orderHistory.noHistoryMessage')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Customer Profile Modal - Detailed view with loyalty info
  const CustomerProfileModal = () => {
    if (!selectedCustomer) return null;

    // Calculate loyalty stats
    const orderHistory = selectedCustomer.orderHistory || [];
    const totalPointsEarned = orderHistory.reduce((sum, o) => sum + (o.loyaltyPointsEarned || 0), 0);
    const totalPointsRedeemed = orderHistory.reduce((sum, o) => sum + (o.loyaltyPointsRedeemed || 0), 0);
    const currentPoints = selectedCustomer.loyaltyPoints || 0;
    const redemptionHistory = orderHistory.filter(o => o.loyaltyPointsRedeemed > 0);

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '16px' : '32px'
        }}
        onClick={() => {
          setShowCustomerProfile(false);
          setSelectedCustomer(null);
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '700px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            color: 'white',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  {(selectedCustomer.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
                    {selectedCustomer.name || 'Customer'}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                    {selectedCustomer.phone || 'No phone'}
                  </p>
                  {selectedCustomer.source === 'customer_app' && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}>
                      Crave App User
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomerProfile(false);
                  setSelectedCustomer(null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Loyalty Points Summary */}
          <div style={{ padding: '20px 24px', backgroundColor: '#faf5ff', borderBottom: '1px solid #e9d5ff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaGift size={16} />
              Loyalty Points
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>{currentPoints}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Current Points</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#10b981' }}>+{totalPointsEarned}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Total Earned</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>-{totalPointsRedeemed}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Total Redeemed</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{redemptionHistory.length}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Redemptions</p>
              </div>
            </div>
          </div>

          {/* Customer Details & Stats */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              {/* Contact Info */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCustomer.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <FaEnvelope size={12} style={{ color: '#9ca3af' }} />
                      {selectedCustomer.email}
                    </div>
                  )}
                  {selectedCustomer.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <FaMapMarkerAlt size={12} style={{ color: '#9ca3af' }} />
                      {selectedCustomer.city}
                    </div>
                  )}
                  {selectedCustomer.dob && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <FaCalendarAlt size={12} style={{ color: '#9ca3af' }} />
                      DOB: {new Date(selectedCustomer.dob).toLocaleDateString()}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <FaCalendarAlt size={12} style={{ color: '#9ca3af' }} />
                    Customer since: {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Order Stats */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Order Statistics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Total Orders</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedCustomer.totalOrders || orderHistory.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Total Spent</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>₹{selectedCustomer.totalSpent || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Avg. Order Value</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      ₹{(selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(0) : 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Last Order</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Redemption History */}
          {redemptionHistory.length > 0 && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Points Redemption History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {redemptionHistory.map((order, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{order.orderNumber}</span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '600', color: '#ef4444' }}>-{order.loyaltyPointsRedeemed} pts</span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>(₹{order.loyaltyDiscount || 0} off)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Recent Orders ({orderHistory.length})
              </h3>
              {orderHistory.length > 0 && (
                <button
                  onClick={() => {
                    setShowCustomerProfile(false);
                    setShowOrderHistory(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7c3aed',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View All <FaArrowRight size={10} />
                </button>
              )}
            </div>

            {orderHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {orderHistory
                  .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                  .slice(0, 5)
                  .map((order, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{order.orderNumber}</span>
                          {order.orderTypeLabel && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '600',
                              backgroundColor: order.orderType === 'dine_in' ? '#dbeafe' : order.orderType === 'takeaway' ? '#fef3c7' : '#dcfce7',
                              color: order.orderType === 'dine_in' ? '#1e40af' : order.orderType === 'takeaway' ? '#92400e' : '#166534'
                            }}>
                              {order.orderTypeLabel}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>₹{order.totalAmount}</span>
                        {order.loyaltyPointsEarned > 0 && (
                          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#10b981' }}>+{order.loyaltyPointsEarned} pts</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px' }}>
                No orders yet
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowCustomerProfile(false);
                setCustomerForm({
                  name: selectedCustomer.name || '',
                  phone: selectedCustomer.phone || '',
                  email: selectedCustomer.email || '',
                  city: selectedCustomer.city || '',
                  dob: selectedCustomer.dob || ''
                });
                setShowEditModal(true);
              }}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#374151'
              }}
            >
              <FaEdit size={14} />
              Edit Profile
            </button>
            <button
              onClick={() => {
                setShowCustomerProfile(false);
                setShowOrderHistory(true);
              }}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaHistory size={14} />
              Full History
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" size={32} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>{t('customers.loading')}</p>
        </div>
      </div>
    );
  }

  // Check if restaurant is selected
  if (!restaurantId || !restaurant) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid #fecaca'
          }}>
            <FaExclamationTriangle size={32} style={{ color: '#dc2626' }} />
          </div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            {t('customers.noRestaurant')}
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#6b7280', maxWidth: '400px' }}>
            {t('customers.noRestaurantMessage')}
          </p>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            {t('customers.goToAdmin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Customer Management - DineOpen</title>
      </Head>
      
      <div style={{ 
        width: '100%',
        backgroundColor: '#f9fafb',
        paddingTop: 0 // Align to top
      }}>
        <div style={{ 
          width: '100%', 
          padding: isMobile ? '8px' : '24px'
        }}>
          {/* Header - More Compact */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: isMobile ? '12px' : '16px', 
            padding: isMobile ? '16px' : '24px', 
            marginBottom: isMobile ? '12px' : '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: isMobile ? '32px' : '40px',
                    height: isMobile ? '32px' : '40px',
                    backgroundColor: '#ef4444',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FaUsers size={isMobile ? 16 : 20} />
                  </div>
                  {isMobile ? t('customers.titleShort') : t('customers.title')}
                </h1>
                {!isMobile && (
                  <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>
                    {t('customers.subtitle')}
                  </p>
                )}
              </div>
              
              {engagementTab === 'customers' && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  padding: isMobile ? '8px 12px' : '12px 20px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                <FaPlus size={isMobile ? 12 : 14} />
                {isMobile ? t('customers.add') : t('customers.addCustomer')}
              </button>
              )}
            </div>
          </div>

          {/* Customer Engagement — tab bar (same content as /offers and /customer-app embedded) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '10px' : '12px 16px',
            marginBottom: isMobile ? '12px' : '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={() => setEngagementTab('customers')}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: '10px',
                  border: engagementTab === 'customers' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: engagementTab === 'customers' ? '#fef2f2' : '#f9fafb',
                  color: engagementTab === 'customers' ? '#b91c1c' : '#6b7280',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaUsers size={14} />
                Customers
              </button>
              <button
                type="button"
                onClick={() => setEngagementTab('offers')}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: '10px',
                  border: engagementTab === 'offers' ? '2px solid #f59e0b' : '1px solid #fde68a',
                  background: engagementTab === 'offers' ? '#fef3c7' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: engagementTab === 'offers' ? '#92400e' : '#78350f',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaTag size={14} />
                Offers & Discounts
              </button>
              <button
                type="button"
                onClick={() => setEngagementTab('loyalty')}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: '10px',
                  border: engagementTab === 'loyalty' ? '2px solid #ec4899' : '1px solid #fbcfe8',
                  background: engagementTab === 'loyalty' ? '#fce7f3' : 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  color: engagementTab === 'loyalty' ? '#9f1239' : '#831843',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaGift size={14} />
                Loyalty Program
              </button>
              <button
                type="button"
                onClick={() => setEngagementTab('crave-app')}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: '10px',
                  border: engagementTab === 'crave-app' ? '2px solid #6366f1' : '1px solid #c7d2fe',
                  background: engagementTab === 'crave-app' ? '#e0e7ff' : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  color: engagementTab === 'crave-app' ? '#312e81' : '#1e1b4b',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaMobileAlt size={14} />
                Crave App
              </button>
            </div>
          </div>

          {engagementTab === 'customers' && (
          <>
          {/* Search and Filters - More Compact */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: isMobile ? '12px' : '16px', 
            padding: isMobile ? '12px' : '20px', 
            marginBottom: isMobile ? '12px' : '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: isMobile ? '150px' : '200px' }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: isMobile ? '8px' : '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#9ca3af',
                    fontSize: isMobile ? '12px' : '14px'
                  }} />
                  <input
                    type="text"
                    placeholder={isMobile ? t('customers.searchPlaceholderShort') : t('customers.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 8px 8px 28px' : '12px 12px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: isMobile ? '8px' : '10px',
                      fontSize: isMobile ? '12px' : '14px',
                      outline: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>
              </div>

              {/* Sort - More Compact */}
              <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', alignItems: 'center' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: isMobile ? '8px 12px' : '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: isMobile ? '8px' : '10px',
                    fontSize: isMobile ? '12px' : '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    minWidth: isMobile ? '80px' : '120px'
                  }}
                >
                  <option value="lastOrderDate">{t('customers.sort.lastOrder')}</option>
                  <option value="name">{t('customers.sort.name')}</option>
                  <option value="totalOrders">{t('customers.sort.orders')}</option>
                  <option value="totalSpent">{t('customers.sort.spent')}</option>
                  <option value="loyaltyPoints">Loyalty Points</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: isMobile ? '8px' : '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: isMobile ? '8px' : '10px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp size={isMobile ? 12 : 16} /> : <FaSortAmountDown size={isMobile ? 12 : 16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Customers List */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: isMobile ? '12px' : '16px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {filteredCustomers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredCustomers.map((customer, index) => (
                  <div key={customer.id} style={{
                    padding: isMobile ? '12px' : '20px',
                    borderBottom: index < filteredCustomers.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: isMobile ? '8px' : '16px'
                  }}>
                    {/* Customer Info - Clickable */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: isMobile ? '150px' : '200px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '8px',
                        margin: '-4px',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerProfile(true);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Click to view customer profile"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '4px' : '8px' }}>
                        <div style={{
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                          backgroundColor: '#ef4444',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '600'
                        }}>
                          {(customer.name || customer.phone || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {customer.name || t('customers.unnamed')}
                            <FaEye size={isMobile ? 10 : 12} style={{ color: '#9ca3af', opacity: 0.7 }} />
                          </h3>
                          <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
                            {customer.phone && (
                              <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaPhone size={isMobile ? 8 : 10} />
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaEnvelope size={isMobile ? 8 : 10} />
                                {customer.email}
                              </span>
                            )}
                            {customer.city && (
                              <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaMapMarkerAlt size={isMobile ? 8 : 10} />
                                {customer.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats - More Compact */}
                    <div style={{ display: 'flex', gap: isMobile ? '8px' : '16px', alignItems: 'center' }}>
                      {/* Crave App Badge */}
                      {customer.source === 'customer_app' && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#fce7f3',
                          color: '#ec4899',
                          fontSize: isMobile ? '10px' : '11px',
                          fontWeight: '600',
                          borderRadius: '12px'
                        }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#ec4899', borderRadius: '50%', display: 'inline-block' }}></span>
                          Crave
                        </div>
                      )}
                      {/* Loyalty Points */}
                      {customer.loyaltyPoints > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: '#f59e0b' }}>
                            {customer.loyaltyPoints}
                          </p>
                          <p style={{ margin: 0, fontSize: isMobile ? '10px' : '12px', color: '#6b7280' }}>Points</p>
                        </div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: '#1f2937' }}>
                          {customer.totalOrders || 0}
                        </p>
                        <p style={{ margin: 0, fontSize: isMobile ? '10px' : '12px', color: '#6b7280' }}>{t('customers.stats.orders')}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: '#ef4444' }}>
                          ₹{customer.totalSpent || 0}
                        </p>
                        <p style={{ margin: 0, fontSize: isMobile ? '10px' : '12px', color: '#6b7280' }}>{t('customers.stats.spent')}</p>
                      </div>
                      {(() => {
                        const raw = customer.lastOrderDate;
                        if (raw == null || raw === '' || isMobile) return null;
                        let d;
                        if (typeof raw?.toDate === 'function') d = raw.toDate();
                        else if (raw && typeof raw._seconds === 'number') d = new Date(raw._seconds * 1000);
                        else d = new Date(raw);
                        if (!d || isNaN(d.getTime())) return null;
                        return (
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                              {d.toLocaleDateString()}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{t('customers.stats.lastOrder')}</p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Actions - More Compact */}
                    <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px' }}>
                      <button
                        onClick={() => handleViewHistory(customer)}
                        style={{
                          padding: isMobile ? '6px 8px' : '8px 12px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: isMobile ? '6px' : '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '4px' : '6px',
                          fontSize: isMobile ? '10px' : '12px',
                          color: '#374151'
                        }}
                      >
                        <FaHistory size={isMobile ? 10 : 12} />
                        {!isMobile && t('customers.actions.history')}
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          padding: isMobile ? '6px 8px' : '8px 12px',
                          backgroundColor: '#dbeafe',
                          border: 'none',
                          borderRadius: isMobile ? '6px' : '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '4px' : '6px',
                          fontSize: isMobile ? '10px' : '12px',
                          color: '#1d4ed8'
                        }}
                      >
                        <FaEdit size={isMobile ? 10 : 12} />
                        {!isMobile && t('customers.actions.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        style={{
                          padding: isMobile ? '6px 8px' : '8px 12px',
                          backgroundColor: '#fef2f2',
                          border: 'none',
                          borderRadius: isMobile ? '6px' : '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '4px' : '6px',
                          fontSize: isMobile ? '10px' : '12px',
                          color: '#dc2626'
                        }}
                      >
                        <FaTrash size={isMobile ? 10 : 12} />
                        {!isMobile && t('customers.actions.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 20px' }}>
                <FaUsers size={isMobile ? 48 : 64} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  {searchTerm ? t('customers.noCustomersFound') : t('customers.noCustomers')}
                </h3>
                <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', color: '#9ca3af', marginBottom: isMobile ? '16px' : '24px' }}>
                  {searchTerm ? t('customers.trySearch') : t('customers.startAdding')}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: isMobile ? '8px' : '12px',
                      padding: isMobile ? '8px 16px' : '12px 24px',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '0 auto'
                    }}
                  >
                    <FaPlus size={isMobile ? 12 : 14} />
                    {t('customers.addFirst')}
                  </button>
                )}
              </div>
            )}
          </div>
        </> )}
          {engagementTab === 'offers' && (
            <div style={{ marginTop: 0 }}>
              <OffersManagement embedded={true} restaurantId={restaurantId} />
            </div>
          )}
          {(engagementTab === 'loyalty' || engagementTab === 'crave-app') && (
            <div style={{ marginTop: 0 }}>
              <CustomerAppSettings embedded={true} restaurantId={restaurantId} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <CustomerForm 
          isEdit={false}
          customerForm={customerForm}
          setCustomerForm={setCustomerForm}
          formErrors={formErrors}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={closeAddModal}
          isMobile={isMobile}
        />
      )}
      {showEditModal && (
        <CustomerForm 
          isEdit={true}
          customerForm={customerForm}
          setCustomerForm={setCustomerForm}
          formErrors={formErrors}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={closeEditModal}
          isMobile={isMobile}
        />
      )}
      {showOrderHistory && <OrderHistoryModal />}
      {showCustomerProfile && <CustomerProfileModal />}
    </>
  );
};

export default Customers;
