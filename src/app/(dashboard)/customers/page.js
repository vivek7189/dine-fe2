'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedCustomersData, setCachedCustomersData } from '../../../utils/dashboardCache';
import { canPerform } from '../../../lib/permissions';
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
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaCog,
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
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              {isEdit ? t('customers.editCustomer') : t('customers.addNewCustomer')}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                color: '#6b7280',
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
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
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
                backgroundColor: '#111827',
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
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
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
  const [engagementTab, setEngagementTab] = useState('customers'); // 'customers' | 'offers' | 'loyalty' | 'your-app'

  // Permission gating
  const custUserData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const custPageAccess = custUserData.pageAccess;
  const canAddCustomer = canPerform(custUserData, custPageAccess, 'customers', 'add');
  const canEditCustomer = canPerform(custUserData, custPageAccess, 'customers', 'update');
  const canDeleteCustomer = canPerform(custUserData, custPageAccess, 'customers', 'delete');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 50;

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

        // 1. For staff members (not owners) - use assigned restaurant from user data
        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          finalRestaurantId = userData.restaurantId;
          finalRestaurant = {
            id: userData.restaurantId,
            name: userData.restaurant?.name || 'Restaurant'
          };
          console.log('👨‍💼 Customers: Using staff assigned restaurant:', finalRestaurantId);
        }
        // 2. For owners - fetch restaurants from API (includes defaultRestaurantId from BE)
        else {
          try {
            const restaurantsResponse = await apiClient.getRestaurants();
            if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
              const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
              const defaultId = restaurantsResponse.defaultRestaurantId;

              const resolved = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                              (defaultId ? restaurantsResponse.restaurants.find(r => r.id === defaultId) : null) ||
                              restaurantsResponse.restaurants[0];

              finalRestaurantId = resolved.id;
              finalRestaurant = resolved;
              console.log('✅ Customers: Using restaurant:', finalRestaurantId, resolved.name);

              localStorage.setItem('selectedRestaurantId', finalRestaurantId);
              localStorage.setItem('selectedRestaurant', JSON.stringify(finalRestaurant));
            }
          } catch (error) {
            // Fallback to localStorage if API fails
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
            if (savedRestaurantId && savedRestaurant) {
              finalRestaurantId = savedRestaurantId;
              finalRestaurant = savedRestaurant;
            }
            console.error('❌ Customers: Error fetching restaurants:', error);
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
      setCurrentPage(1);
      loadCustomers(false, 1);
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, []);

  // Debounced search - reload from server when search term changes
  const searchTimerRef = React.useRef(null);
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (!restaurantId) return;
    // Skip the initial mount (restaurantId effect handles that)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadCustomers(false, 1, searchTerm);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  const loadCustomers = async (useCache = true, page = currentPage, search = '') => {
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

      // Check for cached data first (only for page 1 with no search)
      if (useCache && page === 1 && !search) {
        const cachedData = getCachedCustomersData(restaurantId);
        if (cachedData) {
          console.log('⚡ Loading cached customers data instantly...');
          setCustomers(cachedData.customers || []);
          setTotalCustomers(cachedData.total || 0);
          setTotalPages(cachedData.totalPages || 1);
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

      // Fetch fresh data with pagination and search
      const response = await apiClient.getCustomers(restaurantId, page, PAGE_SIZE, search);
      const freshCustomers = response.customers || [];
      setCustomers(freshCustomers);
      setTotalCustomers(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || page);

      // Cache the data (page 1 with no search only)
      if (page === 1 && !search) {
        const dataToCache = {
          customers: freshCustomers,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        };
        setCachedCustomersData(restaurantId, dataToCache);
        console.log('✅ Customers data cached');
      }

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

      // Reload customers (go to page 1 for new customer)
      setCurrentPage(1);
      await loadCustomers(false, 1);

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
      // If last item on current page, go back one page
      const newPage = (customers.length <= 1 && currentPage > 1) ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
      await loadCustomers(false, newPage, searchTerm);
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

  // Sort customers (search is handled server-side)
  const filteredCustomers = [...customers]
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
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              {t('customers.orderHistory.title')} - {selectedCustomer?.name || (typeof selectedCustomer?.phone === 'string' ? selectedCustomer.phone : '') || t('customers.form.customer')}
            </h2>
            <button
              onClick={() => {
                setShowOrderHistory(false);
                setSelectedCustomer(null);
              }}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                color: '#6b7280',
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
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {order.tableNumber && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          {t('customers.orderHistory.table')}: {order.tableNumber}
                        </p>
                      )}
                      {/* Discount info */}
                      {(order.discountAmount > 0 || order.loyaltyDiscount > 0) && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#059669' }}>
                          {order.discountAmount > 0 && `Offer: -${getCurrencySymbol()}${order.discountAmount}`}
                          {order.discountAmount > 0 && order.loyaltyDiscount > 0 && ' | '}
                          {order.loyaltyDiscount > 0 && `Loyalty: -${getCurrencySymbol()}${order.loyaltyDiscount}`}
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
          padding: isMobile ? '8px' : '24px',
          paddingTop: 0
        }}>
          {/* Sticky Header + Tabs */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: '#f9fafb',
            paddingTop: isMobile ? '8px' : '24px',
            paddingBottom: isMobile ? '4px' : '4px',
            marginLeft: isMobile ? '-8px' : '-24px',
            marginRight: isMobile ? '-8px' : '-24px',
            paddingLeft: isMobile ? '8px' : '24px',
            paddingRight: isMobile ? '8px' : '24px'
          }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: isMobile ? '8px' : '12px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {isMobile ? t('customers.titleShort') : t('customers.title')}
              </h1>
              {!isMobile && (
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  {t('customers.subtitle')}
                </p>
              )}
            </div>

            {engagementTab === 'customers' && canAddCustomer && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: isMobile ? '8px 12px' : '10px 18px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaPlus size={isMobile ? 12 : 13} />
              {isMobile ? t('customers.add') : t('customers.addCustomer')}
            </button>
            )}
          </div>

          {/* Customer Engagement — tab bar */}
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
            borderRadius: '12px',
            padding: isMobile ? '4px' : '6px 8px',
            marginBottom: isMobile ? '8px' : '12px',
            display: 'flex',
            gap: isMobile ? '2px' : '4px',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}>
            {[
              { id: 'customers', label: 'Customers', mobileLabel: 'Customers', icon: FaUsers },
              { id: 'offers', label: 'Offers & Discounts', mobileLabel: 'Offers', icon: FaTag },
              { id: 'loyalty', label: 'Loyalty Program', mobileLabel: 'Loyalty', icon: FaGift },
              { id: 'app-settings', label: 'App Settings', mobileLabel: 'Settings', icon: FaCog },
              { id: 'your-app', label: 'Your App', mobileLabel: 'App', icon: FaMobileAlt },
            ].map(function(tab) {
              var TabIcon = tab.icon;
              var isActive = engagementTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={function() { setEngagementTab(tab.id); }}
                  style={{
                    padding: isMobile ? '7px 10px' : '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
                    color: isActive ? '#ffffff' : '#881b1b',
                    fontWeight: '600',
                    fontSize: isMobile ? '11px' : '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '6px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <TabIcon size={isMobile ? 11 : 13} />
                  {isMobile ? tab.mobileLabel : tab.label}
                </button>
              );
            })}
          </div>
          </div>

          {engagementTab === 'customers' && (
          <>
          {/* Search and Filters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '12px' : '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
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
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
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
                        router.push('/customers/' + customer.id);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Click to view customer profile"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '4px' : '8px' }}>
                        <div style={{
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#dc2626',
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '600'
                        }}>
                          {(customer.name || (typeof customer.phone === 'string' ? customer.phone : '') || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '600', color: '#1f2937' }}>
                            {customer.name || t('customers.unnamed')}
                          </h3>
                          <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
                            {typeof customer.phone === 'string' && customer.phone && (
                              <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaPhone size={isMobile ? 8 : 10} />
                                {customer.phone}
                              </span>
                            )}
                            {typeof customer.email === 'string' && customer.email && (
                              <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaEnvelope size={isMobile ? 8 : 10} />
                                {customer.email}
                              </span>
                            )}
                            {typeof customer.city === 'string' && customer.city && (
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
                        <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: '#1f2937' }}>
                          {formatCurrency(Number(customer.totalSpent || 0))}
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

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: isMobile ? '8px' : '16px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleViewHistory(customer)}
                        style={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        <FaHistory size={12} />
                        {!isMobile && t('customers.actions.history')}
                      </button>
                      {canEditCustomer && (
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        <FaEdit size={12} />
                        {!isMobile && t('customers.actions.edit')}
                      </button>
                      )}
                      {canDeleteCustomer && (
                      <button
                        onClick={() => handleDelete(customer)}
                        style={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#dc2626',
                          fontWeight: '500'
                        }}
                      >
                        <FaTrash size={12} />
                        {!isMobile && t('customers.actions.delete')}
                      </button>
                      )}
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
                {!searchTerm && canAddCustomer && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      backgroundColor: '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '0 auto'
                    }}
                  >
                    <FaPlus size={isMobile ? 12 : 13} />
                    {t('customers.addFirst')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '16px',
              padding: isMobile ? '12px' : '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#6b7280' }}>
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCustomers)} of {totalCustomers} customers
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={function() { if (currentPage > 1) { var p = currentPage - 1; setCurrentPage(p); loadCustomers(false, p); } }}
                  disabled={currentPage <= 1}
                  style={{
                    padding: isMobile ? '6px 10px' : '8px 14px',
                    backgroundColor: currentPage <= 1 ? '#f3f4f6' : '#111827',
                    color: currentPage <= 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                {(function() {
                  var pages = [];
                  var start = Math.max(1, currentPage - 2);
                  var end = Math.min(totalPages, currentPage + 2);
                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push('...');
                  }
                  for (var i = start; i <= end; i++) { pages.push(i); }
                  if (end < totalPages) {
                    if (end < totalPages - 1) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map(function(p, idx) {
                    if (p === '...') return <span key={'dots-' + idx} style={{ padding: '0 4px', color: '#9ca3af', fontSize: '13px' }}>...</span>;
                    return (
                      <button
                        key={p}
                        onClick={function() { setCurrentPage(p); loadCustomers(false, p); }}
                        style={{
                          padding: isMobile ? '6px 10px' : '8px 12px',
                          backgroundColor: currentPage === p ? '#111827' : '#f3f4f6',
                          color: currentPage === p ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: isMobile ? '12px' : '13px',
                          fontWeight: currentPage === p ? '700' : '500',
                          cursor: 'pointer',
                          minWidth: isMobile ? '32px' : '36px'
                        }}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}
                <button
                  onClick={function() { if (currentPage < totalPages) { var p = currentPage + 1; setCurrentPage(p); loadCustomers(false, p); } }}
                  disabled={currentPage >= totalPages}
                  style={{
                    padding: isMobile ? '6px 10px' : '8px 14px',
                    backgroundColor: currentPage >= totalPages ? '#f3f4f6' : '#111827',
                    color: currentPage >= totalPages ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </> )}
          {engagementTab === 'offers' && (
            <div style={{ marginTop: 0 }}>
              <OffersManagement embedded={true} restaurantId={restaurantId} />
            </div>
          )}
          {engagementTab === 'loyalty' && (
            <div style={{ marginTop: 0 }}>
              <CustomerAppSettings embedded={true} restaurantId={restaurantId} section="loyalty" />
            </div>
          )}
          {engagementTab === 'app-settings' && (
            <div style={{ marginTop: 0 }}>
              <CustomerAppSettings embedded={true} restaurantId={restaurantId} section="settings" />
            </div>
          )}
          {engagementTab === 'your-app' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: isMobile ? '24px 16px' : '48px 40px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fef2f2',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <FaMobileAlt size={28} style={{ color: '#ef4444' }} />
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>
                Request Your Own Dedicated App
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                Get a custom-branded ordering app for your restaurant, bar, or bakery.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '12px',
                textAlign: 'left',
                marginBottom: '32px'
              }}>
                {[
                  { title: 'Online Ordering', desc: 'Let customers order directly from your app' },
                  { title: 'Loyalty Rewards', desc: 'Built-in points and rewards system' },
                  { title: 'Push Notifications', desc: 'Engage customers with offers and updates' },
                  { title: 'Custom Branding', desc: 'Your logo, colors, and identity' },
                ].map(function(feature, i) {
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #f3f4f6'
                    }}>
                      <FaCheckCircle size={14} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{feature.title}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={async function() {
                  try {
                    var user = JSON.parse(localStorage.getItem('user') || '{}');
                    await apiClient.request('/api/demo', {
                      method: 'POST',
                      body: {
                        type: 'app_request',
                        restaurantId: restaurantId,
                        restaurantName: restaurant?.name || '',
                        userId: user.id || '',
                        email: user.email || '',
                        requestedAt: new Date().toISOString()
                      }
                    });
                    alert('Your app request has been submitted! We will get in touch with you soon.');
                  } catch (err) {
                    console.error('Error submitting app request:', err);
                    alert('Request submitted! We will contact you soon.');
                  }
                }}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaMobileAlt size={14} />
                Request App
                <FaArrowRight size={12} />
              </button>
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
    </>
  );
};

export default Customers;
