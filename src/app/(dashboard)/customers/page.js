'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  FaArrowRight,
  FaLayerGroup,
  FaEllipsisH,
  FaStore
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
  const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [engagementRestaurant, setEngagementRestaurant] = useState(null);

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

  // Customer Groups state
  const GROUP_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280'];
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', color: GROUP_COLORS[0], icon: '' });
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupMenuOpenId, setGroupMenuOpenId] = useState(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [showAddToGroupMenu, setShowAddToGroupMenu] = useState(false);
  const [inlineCreateMode, setInlineCreateMode] = useState(false);
  const [inlineGroupName, setInlineGroupName] = useState('');
  const [inlineGroupColor, setInlineGroupColor] = useState(GROUP_COLORS[0]);
  const [inlineGroupSaving, setInlineGroupSaving] = useState(false);
  const [groupPopoverCustomerId, setGroupPopoverCustomerId] = useState(null);
  const [groupPopoverSaving, setGroupPopoverSaving] = useState(null); // groupId being toggled
  const [groupMembers, setGroupMembers] = useState([]); // Members in modal
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [addPhoneInput, setAddPhoneInput] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Bulk delete state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteReason, setBulkDeleteReason] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Single delete confirmation modal
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
          // Skip redirect in mobile embed (WebView) — let the native app handle auth
          if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) return;
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
            setRestaurants(restaurantsResponse.restaurants || []);
            if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
              const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
              const defaultId = restaurantsResponse.defaultRestaurantId;

              const resolved = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                              (defaultId ? restaurantsResponse.restaurants.find(r => r.id === defaultId) : null) ||
                              restaurantsResponse.restaurants[0];

              finalRestaurantId = resolved.id;
              finalRestaurant = resolved;
              setEngagementRestaurant(resolved);
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
      loadGroups();
    }
  }, [restaurantId]);

  // Groups API helpers
  const loadGroups = async () => {
    if (!restaurantId) return;
    try {
      setGroupsLoading(true);
      const resp = await apiClient.request(`/api/customer-groups/${restaurantId}`);
      setGroups(resp.groups || []);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setGroupsLoading(false);
    }
  };

  const openNewGroupModal = (prefillCustomerIds = null) => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      description: '',
      color: GROUP_COLORS[0],
      icon: '',
      _prefillCustomerIds: prefillCustomerIds
    });
    setGroupMembers([]);
    setMemberSearchQuery('');
    setAddPhoneInput('');
    setShowGroupModal(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name || '',
      description: group.description || '',
      color: group.color || GROUP_COLORS[0],
      icon: group.icon || ''
    });
    setGroupMembers([]);
    setMemberSearchQuery('');
    setAddPhoneInput('');
    setShowGroupModal(true);
    setGroupMenuOpenId(null);
    loadGroupMembers(group);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', color: GROUP_COLORS[0], icon: '' });
  };

  const saveGroup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!groupForm.name || !groupForm.name.trim()) {
      alert('Group name is required');
      return;
    }
    try {
      setGroupSaving(true);
      if (editingGroup) {
        const resp = await apiClient.request(`/api/customer-groups/${restaurantId}/${editingGroup.id}`, {
          method: 'PATCH',
          body: {
            name: groupForm.name.trim(),
            description: groupForm.description || '',
            color: groupForm.color,
            icon: groupForm.icon || ''
          }
        });
        // optimistic update
        setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...(resp.group || {}), name: groupForm.name.trim(), description: groupForm.description, color: groupForm.color, icon: groupForm.icon } : g));
      } else {
        const prefillIds = groupForm._prefillCustomerIds;
        let customerIds = [];
        let customerPhones = [];
        if (prefillIds && prefillIds.length > 0) {
          customerIds = prefillIds;
          customerPhones = customers.filter(c => prefillIds.includes(c.id)).map(c => c.phone).filter(Boolean);
        }
        // Also include members added via the modal UI
        if (groupMembers.length > 0) {
          const modalIds = groupMembers.map(m => m.id).filter(id => !String(id).startsWith('phone_'));
          const modalPhones = groupMembers.map(m => m.phone).filter(Boolean);
          customerIds = Array.from(new Set([...customerIds, ...modalIds]));
          customerPhones = Array.from(new Set([...customerPhones, ...modalPhones]));
        }
        const resp = await apiClient.request(`/api/customer-groups/${restaurantId}`, {
          method: 'POST',
          body: {
            name: groupForm.name.trim(),
            description: groupForm.description || '',
            color: groupForm.color,
            icon: groupForm.icon || '',
            customerIds,
            customerPhones
          }
        });
        if (resp.group) {
          setGroups(prev => [...prev, resp.group]);
        } else {
          loadGroups();
        }
        if (prefillIds && prefillIds.length > 0) {
          setSelectedCustomerIds([]);
        }
      }
      closeGroupModal();
    } catch (err) {
      console.error('Error saving group:', err);
      alert('Failed to save group: ' + (err.message || 'Unknown error'));
    } finally {
      setGroupSaving(false);
    }
  };

  const deleteGroup = async (group) => {
    if (!confirm(`Delete group "${group.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.request(`/api/customer-groups/${restaurantId}/${group.id}`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g.id !== group.id));
      if (activeGroupId === group.id) setActiveGroupId(null);
      setGroupMenuOpenId(null);
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
  };

  const addSelectedToGroup = async (groupId) => {
    if (selectedCustomerIds.length === 0) return;
    const customerIds = selectedCustomerIds.slice();
    const customerPhones = customers.filter(c => customerIds.includes(c.id)).map(c => c.phone).filter(Boolean);
    try {
      await apiClient.request(`/api/customer-groups/${restaurantId}/${groupId}/members`, {
        method: 'POST',
        body: { customerIds, customerPhones }
      });
      // optimistic
      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const newIds = Array.from(new Set([...(g.customerIds || []), ...customerIds]));
        const newPhones = Array.from(new Set([...(g.customerPhones || []), ...customerPhones]));
        return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length };
      }));
      setSelectedCustomerIds([]);
      setShowAddToGroupMenu(false);
    } catch (err) {
      console.error('Error adding to group:', err);
      alert('Failed to add customers to group');
    }
  };

  // Inline create group and add selected customers
  const handleInlineCreateAndAdd = async () => {
    if (!inlineGroupName.trim()) return;
    setInlineGroupSaving(true);
    try {
      const customerIds = selectedCustomerIds.slice();
      const customerPhones = customers.filter(c => customerIds.includes(c.id)).map(c => c.phone).filter(Boolean);
      const resp = await apiClient.request(`/api/customer-groups/${restaurantId}`, {
        method: 'POST',
        body: {
          name: inlineGroupName.trim(),
          color: inlineGroupColor,
          customerIds,
          customerPhones,
        }
      });
      if (resp.group) {
        setGroups(prev => [resp.group, ...prev]);
      }
      setSelectedCustomerIds([]);
      setShowAddToGroupMenu(false);
      setInlineCreateMode(false);
      setInlineGroupName('');
      setInlineGroupColor(GROUP_COLORS[0]);
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    }
    setInlineGroupSaving(false);
  };

  // Toggle a single customer's membership in a group (for per-customer popover)
  const toggleCustomerGroup = async (customer, groupId, isCurrentlyMember) => {
    setGroupPopoverSaving(groupId);
    try {
      const payload = {
        customerIds: [customer.id],
        customerPhones: customer.phone ? [customer.phone] : [],
      };
      if (isCurrentlyMember) {
        await apiClient.request(`/api/customer-groups/${restaurantId}/${groupId}/members`, {
          method: 'DELETE',
          body: payload,
        });
        setGroups(prev => prev.map(g => {
          if (g.id !== groupId) return g;
          const newIds = (g.customerIds || []).filter(id => id !== customer.id);
          const newPhones = customer.phone ? (g.customerPhones || []).filter(p => p !== customer.phone) : (g.customerPhones || []);
          return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length };
        }));
      } else {
        await apiClient.request(`/api/customer-groups/${restaurantId}/${groupId}/members`, {
          method: 'POST',
          body: payload,
        });
        setGroups(prev => prev.map(g => {
          if (g.id !== groupId) return g;
          const newIds = Array.from(new Set([...(g.customerIds || []), customer.id]));
          const newPhones = customer.phone ? Array.from(new Set([...(g.customerPhones || []), customer.phone])) : (g.customerPhones || []);
          return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length };
        }));
      }
    } catch (err) {
      console.error('Error toggling group membership:', err);
    }
    setGroupPopoverSaving(null);
  };

  // Returns array of groups the given customer belongs to
  const getCustomerGroups = (customer) => {
    if (!groups || groups.length === 0) return [];
    const cid = customer.id;
    const cphone = customer.phone;
    return groups.filter(g => {
      if (cid && g.customerIds && g.customerIds.includes(cid)) return true;
      if (cphone && g.customerPhones && g.customerPhones.includes(cphone)) return true;
      return false;
    });
  };

  // Load group members when editing
  const loadGroupMembers = async (group) => {
    if (!restaurantId || !group) return;
    setGroupMembersLoading(true);
    try {
      const memberIds = group.customerIds || [];
      const memberPhones = group.customerPhones || [];
      // Match against loaded customers
      const members = customers.filter(c =>
        memberIds.includes(c.id) || (c.phone && memberPhones.includes(c.phone))
      );
      // Also add phone-only members not in customer list
      const matchedPhones = new Set(members.map(m => m.phone).filter(Boolean));
      memberPhones.forEach(phone => {
        if (!matchedPhones.has(phone)) {
          members.push({ id: `phone_${phone}`, name: phone, phone, _phoneOnly: true });
        }
      });
      setGroupMembers(members);
    } catch (err) {
      console.error('Error loading group members:', err);
    } finally {
      setGroupMembersLoading(false);
    }
  };

  const addMemberToGroupModal = async (customer) => {
    const groupId = editingGroup?.id;
    if (!restaurantId || !groupId) return;
    setAddingMember(true);
    try {
      const payload = {
        customerIds: [customer.id],
        customerPhones: customer.phone ? [customer.phone] : [],
      };
      await apiClient.request(`/api/customer-groups/${restaurantId}/${groupId}/members`, {
        method: 'POST', body: payload,
      });
      setGroupMembers(prev => {
        if (prev.some(m => m.id === customer.id)) return prev;
        return [...prev, customer];
      });
      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const newIds = Array.from(new Set([...(g.customerIds || []), customer.id]));
        const newPhones = customer.phone ? Array.from(new Set([...(g.customerPhones || []), customer.phone])) : (g.customerPhones || []);
        return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length };
      }));
      setMemberSearchQuery('');
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const addMemberByPhoneModal = async (phone) => {
    const groupId = editingGroup?.id;
    if (!restaurantId || !groupId || !phone?.trim()) return;
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length < 10) { alert('Enter a valid 10-digit phone number'); return; }
    setAddingMember(true);
    try {
      let customer = customers.find(c => c.phone && c.phone.replace(/\D/g, '').slice(-10) === normalizedPhone);
      if (!customer) {
        const resp = await apiClient.request('/api/customers', {
          method: 'POST',
          body: { phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}`, restaurantId },
        });
        customer = resp.customer || { id: resp.customerId || resp.id, phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}` };
      }
      await addMemberToGroupModal(customer);
      setAddPhoneInput('');
    } catch (err) {
      console.error('Error adding member by phone:', err);
      alert('Failed to add member: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingMember(false);
    }
  };

  const removeMemberFromGroupModal = async (member) => {
    const groupId = editingGroup?.id;
    if (!restaurantId || !groupId) return;
    setRemovingMemberId(member.id);
    try {
      const payload = {
        customerIds: member._phoneOnly ? [] : [member.id],
        customerPhones: member.phone ? [member.phone] : [],
      };
      await apiClient.request(`/api/customer-groups/${restaurantId}/${groupId}/members`, {
        method: 'DELETE', body: payload,
      });
      setGroupMembers(prev => prev.filter(m => m.id !== member.id));
      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const newIds = (g.customerIds || []).filter(cid => cid !== member.id);
        const newPhones = member.phone ? (g.customerPhones || []).filter(p => p !== member.phone) : (g.customerPhones || []);
        return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length };
      }));
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Add member locally for new group (no API call yet)
  const addPendingMemberCustomers = (customer) => {
    setGroupMembers(prev => {
      if (prev.some(m => m.id === customer.id)) return prev;
      return [...prev, customer];
    });
    setMemberSearchQuery('');
  };

  const addPendingMemberByPhone = async (phone) => {
    if (!restaurantId || !phone?.trim()) return;
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length < 10) { alert('Enter a valid 10-digit phone number'); return; }
    setAddingMember(true);
    try {
      let customer = customers.find(c => c.phone && String(c.phone).replace(/\D/g, '').slice(-10) === normalizedPhone);
      if (!customer) {
        const resp = await apiClient.request('/api/customers', {
          method: 'POST',
          body: { phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}`, restaurantId },
        });
        customer = resp.customer || { id: resp.customerId || resp.id, phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}` };
      }
      addPendingMemberCustomers(customer);
      setAddPhoneInput('');
    } catch (err) {
      console.error('Error adding member by phone:', err);
      alert('Failed to add member: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingMember(false);
    }
  };

  const toggleCustomerSelect = (customerId) => {
    setSelectedCustomerIds(prev => prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]);
  };

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
        // Skip redirect in mobile embed (WebView) — let the native app handle auth
        if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) return;
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
          // Only show full page loader on initial load (no existing data)
          if (customers.length === 0) {
            setLoading(true);
          } else {
            setBackgroundLoading(true);
          }
        }
      } else {
        // For search/pagination — don't show full page loader if we already have data
        if (customers.length === 0 && !search) {
          setLoading(true);
        } else {
          setBackgroundLoading(true);
        }
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

  // Handle delete customer — show confirmation modal
  const handleDelete = (customer) => {
    setDeleteConfirmCustomer(customer);
  };

  // Confirm delete — remove row inline without full page reload
  const confirmDeleteCustomer = async () => {
    const customer = deleteConfirmCustomer;
    if (!customer) return;
    setDeletingId(customer.id);
    try {
      await apiClient.request(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      });
      // Remove from local state immediately (no full reload)
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      setTotalCustomers(prev => Math.max(0, prev - 1));
      setDeleteConfirmCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError(t('customers.messages.failedToDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk delete customers
  const handleBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await apiClient.request('/api/customers/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ customerIds: selectedCustomerIds, reason: bulkDeleteReason.trim() || 'Not specified' }),
      });
      setSelectedCustomerIds([]);
      setShowBulkDeleteModal(false);
      setBulkDeleteReason('');
      await loadCustomers(false, 1, searchTerm);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      setError('Failed to delete customers. Please try again.');
    } finally {
      setBulkDeleting(false);
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
  const activeGroup = activeGroupId ? groups.find(g => g.id === activeGroupId) : null;
  const filteredCustomers = [...customers]
    .filter(c => {
      if (!activeGroup) return true;
      const ids = activeGroup.customerIds || [];
      const phones = activeGroup.customerPhones || [];
      if (c.id && ids.includes(c.id)) return true;
      if (c.phone && phones.includes(c.phone)) return true;
      return false;
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
            onClick={() => {
              if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) return;
              router.push('/admin');
            }}
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
        backgroundColor: isMobileEmbed ? '#fff' : '#f9fafb',
        paddingTop: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Prevent iOS auto-zoom on input focus */}
        {isMobile && (
          <style dangerouslySetInnerHTML={{ __html: `
            input, textarea, select { font-size: 16px !important; }
          ` }} />
        )}
        <div style={{
          width: '100%',
          padding: isMobileEmbed ? '0' : (isMobile ? '8px' : '24px'),
          paddingTop: 0,
          boxSizing: 'border-box'
        }}>
          {/* Sticky Header + Tabs */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: isMobileEmbed ? '#fff' : '#f9fafb',
            paddingTop: isMobile ? '8px' : '24px',
            paddingBottom: isMobile ? '4px' : '4px',
            marginLeft: isMobile ? '0' : '-24px',
            marginRight: isMobile ? '0' : '-24px',
            paddingLeft: isMobileEmbed ? '10px' : (isMobile ? '0' : '24px'),
            paddingRight: isMobileEmbed ? '10px' : (isMobile ? '0' : '24px')
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
                fontSize: isMobile ? '17px' : '24px',
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

          {/* Customer Engagement — tab bar (hidden in mobile embed) */}
          {!isMobileEmbed && (
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
            borderRadius: isMobile ? '10px' : '12px',
            padding: isMobile ? '3px' : '6px 8px',
            marginBottom: isMobile ? '8px' : '12px',
            display: 'flex',
            gap: isMobile ? '1px' : '4px',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
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
                    padding: isMobile ? '6px 8px' : '10px 16px',
                    borderRadius: isMobile ? '7px' : '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
                    color: isActive ? '#ffffff' : '#881b1b',
                    fontWeight: '600',
                    fontSize: isMobile ? '10px' : '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '3px' : '6px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <TabIcon size={isMobile ? 9 : 13} />
                  {isMobile ? tab.mobileLabel : tab.label}
                </button>
              );
            })}
          </div>
          )}
          </div>

          {engagementTab === 'customers' && (
          <>
          {/* Customer Groups */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobileEmbed ? '0' : '12px',
            padding: isMobile ? '10px 12px' : '14px 16px',
            marginBottom: isMobile ? '12px' : '16px',
            border: isMobileEmbed ? 'none' : '1px solid #e5e7eb',
            boxShadow: isMobileEmbed ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <FaLayerGroup size={13} style={{ color: '#6b7280' }} />
              <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#374151' }}>Groups</h3>
              {activeGroup && (
                <button
                  onClick={() => setActiveGroupId(null)}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Clear filter
                </button>
              )}
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '4px',
              scrollbarWidth: 'thin'
            }}>
              {groupsLoading && groups.length === 0 ? (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Loading groups...</span>
              ) : groups.length === 0 ? (
                <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>
                  No groups yet. Create one to segment your customers.
                </span>
              ) : (
                groups.map((g) => {
                  const isActive = activeGroupId === g.id;
                  return (
                    <div key={g.id} style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        onClick={() => setActiveGroupId(isActive ? null : g.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px 6px 12px',
                          borderRadius: '999px',
                          border: 'none',
                          background: g.color || '#6b7280',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: isActive ? `0 0 0 3px ${(g.color || '#6b7280')}40` : 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {g.icon && <span style={{ fontSize: '13px' }}>{g.icon}</span>}
                        <span>{g.name}</span>
                        <span style={{
                          background: 'rgba(255,255,255,0.25)',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {g.customerCount ?? (g.customerIds || []).length}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroupMenuOpenId(groupMenuOpenId === g.id ? null : g.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '2px',
                            padding: '2px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <FaEllipsisH size={10} />
                        </span>
                      </button>
                      {groupMenuOpenId === g.id && (
                        <div
                          onMouseLeave={() => setGroupMenuOpenId(null)}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 30,
                            minWidth: '120px',
                            overflow: 'hidden'
                          }}
                        >
                          <button
                            onClick={() => openEditGroupModal(g)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: 'none',
                              textAlign: 'left',
                              fontSize: '13px',
                              color: '#374151',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaEdit size={11} /> Edit
                          </button>
                          <button
                            onClick={() => deleteGroup(g)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: 'none',
                              borderTop: '1px solid #f3f4f6',
                              textAlign: 'left',
                              fontSize: '13px',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaTrash size={11} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <button
                onClick={() => openNewGroupModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px dashed #d1d5db',
                  background: '#f9fafb',
                  color: '#374151',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                <FaPlus size={10} /> New Group
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobileEmbed ? '0' : '12px',
            padding: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '12px' : '16px',
            border: isMobileEmbed ? 'none' : '1px solid #e5e7eb',
            boxShadow: isMobileEmbed ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
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
            borderRadius: isMobileEmbed ? '0' : '12px',
            overflow: 'hidden',
            border: isMobileEmbed ? 'none' : '1px solid #e5e7eb',
            boxShadow: isMobileEmbed ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
            marginBottom: selectedCustomerIds.length > 0 ? '70px' : 0
          }}>
            {filteredCustomers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Select All header row */}
                <div style={{
                  padding: isMobile ? '8px' : '10px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f9fafb',
                }}>
                  <input
                    type="checkbox"
                    checked={filteredCustomers.length > 0 && filteredCustomers.every(c => selectedCustomerIds.includes(c.id))}
                    onChange={() => {
                      const allOnPage = filteredCustomers.map(c => c.id);
                      const allSelected = allOnPage.every(id => selectedCustomerIds.includes(id));
                      if (allSelected) {
                        setSelectedCustomerIds(prev => prev.filter(id => !allOnPage.includes(id)));
                      } else {
                        setSelectedCustomerIds(prev => [...new Set([...prev, ...allOnPage])]);
                      }
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    {filteredCustomers.every(c => selectedCustomerIds.includes(c.id)) ? 'Deselect all' : 'Select all'} on this page
                  </span>
                  {selectedCustomerIds.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      ({selectedCustomerIds.length} selected)
                    </span>
                  )}
                </div>
                {filteredCustomers.map((customer, index) => {
                  const isSelected = selectedCustomerIds.includes(customer.id);
                  const custGroups = getCustomerGroups(customer);
                  return isMobile ? (
                  /* ── MOBILE: Card Layout ── */
                  <div key={customer.id} style={{
                    padding: '12px',
                    borderBottom: index < filteredCustomers.length - 1 ? '1px solid #f3f4f6' : 'none',
                    backgroundColor: isSelected ? '#fef2f2' : 'transparent'
                  }}>
                    {/* Top row: checkbox + name + amount */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCustomerSelect(customer.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444', marginTop: '3px', flexShrink: 0 }}
                      />
                      <div
                        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => router.push('/customers/' + customer.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #fef2f2, #fce7f3)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#dc2626', fontSize: '15px', fontWeight: '700', flexShrink: 0
                          }}>
                            {(customer.name || (typeof customer.phone === 'string' ? customer.phone : '') || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {customer.name || t('customers.unnamed')}
                              </h3>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', flexShrink: 0 }}>
                                {formatCurrency(Number(customer.totalSpent || 0))}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              {typeof customer.phone === 'string' && customer.phone && (
                                <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <FaPhone size={8} /> {customer.phone}
                                </span>
                              )}
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {customer.totalOrders || 0} {t('customers.stats.orders')}
                              </span>
                              {customer.source === 'customer_app' && (
                                <span style={{
                                  padding: '1px 6px', backgroundColor: '#fce7f3', color: '#ec4899',
                                  fontSize: '9px', fontWeight: '700', borderRadius: '8px'
                                }}>Crave</span>
                              )}
                              {customer.loyaltyPoints > 0 && (
                                <span style={{ fontSize: '10px', fontWeight: '600', color: '#f59e0b' }}>
                                  {customer.loyaltyPoints} pts
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Group tags */}
                        {custGroups.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', paddingLeft: '46px' }}>
                            {custGroups.map(g => (
                              <span key={g.id} style={{
                                padding: '1px 7px', borderRadius: '8px', fontSize: '9px', fontWeight: '600',
                                background: (g.color || '#6b7280') + '20', color: g.color || '#6b7280',
                                display: 'inline-flex', alignItems: 'center', gap: '3px'
                              }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: g.color || '#6b7280' }} />
                                {g.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Action buttons row */}
                    <div style={{
                      display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '26px',
                      overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
                    }}>
                      <button
                        onClick={() => router.push('/customers/' + customer.id)}
                        style={{
                          padding: '5px 10px', backgroundColor: '#f1f5f9', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '4px', fontSize: '11px',
                          color: '#475569', fontWeight: '600', whiteSpace: 'nowrap'
                        }}
                      >
                        <FaUser size={9} /> View
                      </button>
                      <button
                        onClick={() => handleViewHistory(customer)}
                        style={{
                          padding: '5px 10px', backgroundColor: '#f1f5f9', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '4px', fontSize: '11px',
                          color: '#475569', fontWeight: '600', whiteSpace: 'nowrap'
                        }}
                      >
                        <FaHistory size={9} /> History
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setGroupPopoverCustomerId(groupPopoverCustomerId === customer.id ? null : customer.id)}
                          style={{
                            padding: '5px 10px', backgroundColor: getCustomerGroups(customer).length > 0 ? '#f5f3ff' : '#f1f5f9',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: '4px', fontSize: '11px',
                            color: getCustomerGroups(customer).length > 0 ? '#7c3aed' : '#475569',
                            fontWeight: '600', whiteSpace: 'nowrap'
                          }}
                        >
                          <FaLayerGroup size={9} /> Groups
                        </button>
                        {groupPopoverCustomerId === customer.id && (
                          <div style={{
                            position: 'fixed', left: '16px', right: '16px', bottom: '16px',
                            background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px',
                            boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', zIndex: 50,
                            overflow: 'hidden', maxHeight: '60vh'
                          }}>
                            <div style={{
                              padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>
                                Groups for {customer.name || 'Customer'}
                              </span>
                              <button onClick={() => setGroupPopoverCustomerId(null)} style={{
                                background: '#f3f4f6', border: 'none', borderRadius: '6px',
                                padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#6b7280'
                              }}>Close</button>
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: 'calc(60vh - 90px)' }}>
                              {groups.length === 0 ? (
                                <div style={{ padding: '16px', fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>No groups created yet</div>
                              ) : groups.map(g => {
                                const isMember = (g.customerIds || []).includes(customer.id) ||
                                  (customer.phone && (g.customerPhones || []).includes(customer.phone));
                                const isSavingThis = groupPopoverSaving === g.id;
                                return (
                                  <button
                                    key={g.id}
                                    onClick={() => toggleCustomerGroup(customer, g.id, isMember)}
                                    disabled={isSavingThis}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                      padding: '12px 16px', background: isMember ? '#f5f3ff' : 'white',
                                      border: 'none', borderBottom: '1px solid #f3f4f6', cursor: isSavingThis ? 'wait' : 'pointer',
                                      fontSize: '14px', textAlign: 'left', color: '#374151',
                                    }}
                                  >
                                    <span style={{
                                      width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                                      border: isMember ? 'none' : '2px solid #d1d5db',
                                      background: isMember ? (g.color || '#7c3aed') : 'transparent',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      {isMember && <FaCheckCircle size={12} style={{ color: 'white' }} />}
                                    </span>
                                    <span style={{
                                      width: '10px', height: '10px', borderRadius: '50%',
                                      background: g.color || '#6b7280', flexShrink: 0,
                                    }} />
                                    <span style={{ flex: 1 }}>{g.name}</span>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{g.customerCount || 0}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => { setGroupPopoverCustomerId(null); openNewGroupModal([customer.id]); }}
                              style={{
                                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '6px', background: '#f0fdf4', border: 'none',
                                borderTop: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '13px',
                                color: '#16a34a', fontWeight: 600,
                              }}
                            >
                              <FaPlus size={10} /> Create New Group
                            </button>
                          </div>
                        )}
                      </div>
                      {canEditCustomer && (
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          padding: '5px 10px', backgroundColor: '#f1f5f9', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '4px', fontSize: '11px',
                          color: '#475569', fontWeight: '600', whiteSpace: 'nowrap'
                        }}
                      >
                        <FaEdit size={9} /> Edit
                      </button>
                      )}
                      {canDeleteCustomer && (
                      <button
                        onClick={() => handleDelete(customer)}
                        style={{
                          padding: '5px 10px', backgroundColor: '#fef2f2', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '4px', fontSize: '11px',
                          color: '#dc2626', fontWeight: '600', whiteSpace: 'nowrap'
                        }}
                      >
                        <FaTrash size={9} /> Delete
                      </button>
                      )}
                    </div>
                  </div>
                  ) : (
                  /* ── DESKTOP: Original Row Layout ── */
                  <div key={customer.id} style={{
                    padding: '20px',
                    borderBottom: index < filteredCustomers.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    backgroundColor: isSelected ? '#fef2f2' : 'transparent'
                  }}>
                    {/* Select checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCustomerSelect(customer.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444', flexShrink: 0 }}
                    />
                    {/* Customer Info - Clickable */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '8px',
                        margin: '-4px',
                        transition: 'background-color 0.2s',
                        overflow: 'hidden'
                      }}
                      onClick={() => {
                        router.push('/customers/' + customer.id);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Click to view customer profile"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#dc2626',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {(customer.name || (typeof customer.phone === 'string' ? customer.phone : '') || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                            {customer.name || t('customers.unnamed')}
                          </h3>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {typeof customer.phone === 'string' && customer.phone && (
                              <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaPhone size={10} />
                                {customer.phone}
                              </span>
                            )}
                            {typeof customer.email === 'string' && customer.email && (
                              <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaEnvelope size={10} />
                                {customer.email}
                              </span>
                            )}
                            {typeof customer.city === 'string' && customer.city && (
                              <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <FaMapMarkerAlt size={10} />
                                {customer.city}
                              </span>
                            )}
                          </div>
                          {custGroups.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                              {custGroups.map(g => (
                                <span key={g.id} title={g.name} style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  background: (g.color || '#6b7280') + '20',
                                  color: g.color || '#6b7280',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <span style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: g.color || '#6b7280', flexShrink: 0,
                                  }} />
                                  {g.icon && <span>{g.icon}</span>}
                                  {g.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Crave App Badge */}
                      {customer.source === 'customer_app' && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 8px', backgroundColor: '#fce7f3', color: '#ec4899',
                          fontSize: '11px', fontWeight: '600', borderRadius: '12px'
                        }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#ec4899', borderRadius: '50%', display: 'inline-block' }}></span>
                          Crave
                        </div>
                      )}
                      {customer.loyaltyPoints > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{customer.loyaltyPoints}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Points</p>
                        </div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{customer.totalOrders || 0}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{t('customers.stats.orders')}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{formatCurrency(Number(customer.totalSpent || 0))}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{t('customers.stats.spent')}</p>
                      </div>
                      {(() => {
                        const raw = customer.lastOrderDate;
                        if (raw == null || raw === '') return null;
                        let d;
                        if (typeof raw?.toDate === 'function') d = raw.toDate();
                        else if (raw && typeof raw._seconds === 'number') d = new Date(raw._seconds * 1000);
                        else d = new Date(raw);
                        if (!d || isNaN(d.getTime())) return null;
                        return (
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{d.toLocaleDateString()}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{t('customers.stats.lastOrder')}</p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleViewHistory(customer)}
                        style={{
                          padding: 0, backgroundColor: 'transparent', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          gap: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500'
                        }}
                      >
                        <FaHistory size={12} />
                        {t('customers.actions.history')}
                      </button>
                      {/* Group toggle popover */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setGroupPopoverCustomerId(groupPopoverCustomerId === customer.id ? null : customer.id)}
                          style={{
                            padding: 0, backgroundColor: 'transparent', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '4px', fontSize: '13px',
                            color: getCustomerGroups(customer).length > 0 ? '#7c3aed' : '#6b7280',
                            fontWeight: '500'
                          }}
                          title="Manage groups"
                        >
                          <FaLayerGroup size={12} />
                          {getCustomerGroups(customer).length > 0
                            ? `${getCustomerGroups(customer).length} Groups`
                            : 'Groups'}
                        </button>
                        {groupPopoverCustomerId === customer.id && (
                          <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                            background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 50,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              padding: '8px 12px', borderBottom: '1px solid #f3f4f6',
                              fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}>
                              Groups for {customer.name || 'Customer'}
                            </div>
                            {groups.length === 0 ? (
                              <div style={{ padding: '12px', fontSize: '12px', color: '#9ca3af' }}>No groups created yet</div>
                            ) : groups.map(g => {
                              const isMember = (g.customerIds || []).includes(customer.id) ||
                                (customer.phone && (g.customerPhones || []).includes(customer.phone));
                              const isSavingThis = groupPopoverSaving === g.id;
                              return (
                                <button
                                  key={g.id}
                                  onClick={() => toggleCustomerGroup(customer, g.id, isMember)}
                                  disabled={isSavingThis}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    padding: '8px 12px', background: isMember ? '#f5f3ff' : 'white',
                                    border: 'none', borderBottom: '1px solid #f3f4f6', cursor: isSavingThis ? 'wait' : 'pointer',
                                    fontSize: '12px', textAlign: 'left', color: '#374151',
                                    transition: 'background 0.15s',
                                  }}
                                >
                                  <span style={{
                                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                    border: isMember ? 'none' : '2px solid #d1d5db',
                                    background: isMember ? (g.color || '#7c3aed') : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {isMember && <FaCheckCircle size={10} style={{ color: 'white' }} />}
                                  </span>
                                  <span style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: g.color || '#6b7280', flexShrink: 0,
                                  }} />
                                  <span style={{ flex: 1 }}>{g.name}</span>
                                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>{g.customerCount || 0}</span>
                                </button>
                              );
                            })}
                            <button
                              onClick={() => {
                                setGroupPopoverCustomerId(null);
                                openNewGroupModal([customer.id]);
                              }}
                              style={{
                                width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#f0fdf4', border: 'none', cursor: 'pointer', fontSize: '11px',
                                color: '#16a34a', fontWeight: 600, borderRadius: '0 0 10px 10px',
                              }}
                            >
                              <FaPlus size={9} /> Create New Group
                            </button>
                          </div>
                        )}
                      </div>
                      {canEditCustomer && (
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          padding: 0, backgroundColor: 'transparent', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          gap: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500'
                        }}
                      >
                        <FaEdit size={12} />
                        {t('customers.actions.edit')}
                      </button>
                      )}
                      {canDeleteCustomer && (
                      <button
                        onClick={() => handleDelete(customer)}
                        style={{
                          padding: 0, backgroundColor: 'transparent', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          gap: '4px', fontSize: '13px', color: '#dc2626', fontWeight: '500'
                        }}
                      >
                        <FaTrash size={12} />
                        {t('customers.actions.delete')}
                      </button>
                      )}
                    </div>
                  </div>
                  );
                })}
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
              borderRadius: isMobileEmbed ? '0' : '12px',
              border: isMobileEmbed ? 'none' : '1px solid #e5e7eb',
              boxShadow: isMobileEmbed ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
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
              {restaurants.length > 1 && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: isMobile ? '12px' : '16px', marginBottom: '12px', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</p>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
                    {restaurants.map(r => {
                      const isActive = (engagementRestaurant?.id || restaurantId) === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setEngagementRestaurant(r)}
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
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <FaStore size={isMobile ? 11 : 14} />
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <OffersManagement
                key={engagementRestaurant?.id || restaurantId}
                embedded={true}
                restaurantId={engagementRestaurant?.id || restaurantId}
                restaurants={restaurants}
              />
            </div>
          )}
          {engagementTab === 'loyalty' && (
            <div style={{ marginTop: 0 }}>
              {restaurants.length > 1 && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: isMobile ? '12px' : '16px', marginBottom: '12px', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</p>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
                    {restaurants.map(r => {
                      const isActive = (engagementRestaurant?.id || restaurantId) === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setEngagementRestaurant(r)}
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
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <FaStore size={isMobile ? 11 : 14} />
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <CustomerAppSettings
                key={engagementRestaurant?.id || restaurantId}
                embedded={true}
                restaurantId={engagementRestaurant?.id || restaurantId}
                section="loyalty"
              />
            </div>
          )}
          {engagementTab === 'app-settings' && (
            <div style={{ marginTop: 0 }}>
              {restaurants.length > 1 && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: isMobile ? '12px' : '16px', marginBottom: '12px', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</p>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
                    {restaurants.map(r => {
                      const isActive = (engagementRestaurant?.id || restaurantId) === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setEngagementRestaurant(r)}
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
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <FaStore size={isMobile ? 11 : 14} />
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <CustomerAppSettings
                key={engagementRestaurant?.id || restaurantId}
                embedded={true}
                restaurantId={engagementRestaurant?.id || restaurantId}
                section="settings"
              />
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

      {/* Floating selection action bar — rendered via portal to escape overflow:hidden parent */}
      {selectedCustomerIds.length > 0 && engagementTab === 'customers' && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111827',
          color: 'white',
          borderRadius: '12px',
          padding: isMobile ? '10px 14px' : '12px 18px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          flexWrap: 'wrap',
          maxWidth: 'calc(100vw - 32px)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>
            {selectedCustomerIds.length} selected
          </span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAddToGroupMenu(v => !v)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Add to group <span style={{ fontSize: '9px' }}>▾</span>
            </button>
            {showAddToGroupMenu && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '6px',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '220px',
                maxHeight: '320px',
                overflowY: 'auto',
                zIndex: 41
              }}>
                {groups.length === 0 && !inlineCreateMode ? (
                  <div style={{ padding: '10px 12px', fontSize: '12px', color: '#9ca3af' }}>
                    No groups yet
                  </div>
                ) : (
                  groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => addSelectedToGroup(g.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'white',
                        border: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        color: '#374151'
                      }}
                    >
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: g.color || '#6b7280',
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      {g.icon && <span>{g.icon}</span>}
                      <span>{g.name}</span>
                      <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>{g.customerCount || 0}</span>
                    </button>
                  ))
                )}
                {/* Divider + inline create */}
                <div style={{ borderTop: '1px solid #e5e7eb' }}>
                  {!inlineCreateMode ? (
                    <button
                      onClick={() => setInlineCreateMode(true)}
                      style={{
                        width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#f0fdf4', border: 'none', cursor: 'pointer', fontSize: '12px',
                        color: '#16a34a', fontWeight: 600, borderRadius: '0 0 8px 8px',
                      }}
                    >
                      + Create New Group
                    </button>
                  ) : (
                    <div style={{ padding: '8px 12px' }}>
                      <input
                        autoFocus
                        placeholder="Group name"
                        value={inlineGroupName}
                        onChange={(e) => setInlineGroupName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleInlineCreateAndAdd(); }}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: '6px',
                          border: '1px solid #d1d5db', fontSize: '12px', outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '4px', margin: '6px 0' }}>
                        {GROUP_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setInlineGroupColor(c)}
                            style={{
                              width: 18, height: 18, borderRadius: '50%', background: c, border: 'none',
                              cursor: 'pointer', outline: inlineGroupColor === c ? '2px solid #1f2937' : 'none',
                              outlineOffset: '1px',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={handleInlineCreateAndAdd}
                          disabled={!inlineGroupName.trim() || inlineGroupSaving}
                          style={{
                            flex: 1, padding: '6px', fontSize: '11px', fontWeight: 600,
                            background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px',
                            cursor: !inlineGroupName.trim() || inlineGroupSaving ? 'not-allowed' : 'pointer',
                            opacity: !inlineGroupName.trim() || inlineGroupSaving ? 0.6 : 1,
                          }}
                        >
                          {inlineGroupSaving ? 'Creating...' : 'Create & Add'}
                        </button>
                        <button
                          onClick={() => { setInlineCreateMode(false); setInlineGroupName(''); }}
                          style={{
                            padding: '6px 10px', fontSize: '11px', background: '#f3f4f6',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#6b7280',
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
          </div>
          <button
            onClick={() => { setShowAddToGroupMenu(false); openNewGroupModal(selectedCustomerIds.slice()); }}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + New group with selected
          </button>
          {canDeleteCustomer && ['owner', 'admin'].includes(custUserData.role) && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaTrash size={11} /> Delete
            </button>
          )}
          <button
            onClick={() => { setSelectedCustomerIds([]); setShowAddToGroupMenu(false); }}
            style={{
              background: 'transparent',
              color: '#d1d5db',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>,
        document.body
      )}

      {/* Bulk Delete Reason Modal */}
      {showBulkDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              borderBottom: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FaTrash size={14} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#991b1b' }}>
                    Delete {selectedCustomerIds.length} Customer{selectedCustomerIds.length > 1 ? 's' : ''}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c' }}>This action cannot be undone</p>
                </div>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Reason for deletion <span style={{ color: '#9ca3af', fontWeight: '400' }}>(required)</span>
              </label>
              <textarea
                autoFocus
                value={bulkDeleteReason}
                onChange={(e) => setBulkDeleteReason(e.target.value)}
                placeholder="e.g. Duplicate entries, test data cleanup, customer request..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none',
                  resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <div style={{
                marginTop: '12px', padding: '10px 12px', background: '#fffbeb',
                borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e'
              }}>
                <FaExclamationTriangle size={11} style={{ marginRight: '6px' }} />
                All customer data including order history will be permanently removed.
              </div>
            </div>
            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'flex-end', gap: '10px'
            }}>
              <button
                onClick={() => { setShowBulkDeleteModal(false); setBulkDeleteReason(''); }}
                disabled={bulkDeleting}
                style={{
                  padding: '9px 18px', fontSize: '13px', fontWeight: '600',
                  background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={!bulkDeleteReason.trim() || bulkDeleting}
                style={{
                  padding: '9px 18px', fontSize: '13px', fontWeight: '600',
                  background: !bulkDeleteReason.trim() || bulkDeleting ? '#fca5a5' : '#dc2626',
                  color: 'white', border: 'none', borderRadius: '8px',
                  cursor: !bulkDeleteReason.trim() || bulkDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {bulkDeleting ? <><FaSpinner size={12} className="spin" /> Deleting...</> : <>Delete {selectedCustomerIds.length} Customer{selectedCustomerIds.length > 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCustomer && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !deletingId) setDeleteConfirmCustomer(null); }}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '16px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '380px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              borderBottom: '1px solid #fecaca',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
              }}>
                <FaTrash size={18} color="white" />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>
                Delete Customer?
              </h3>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px', textAlign: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px', borderRadius: '10px', background: '#f9fafb',
                border: '1px solid #e5e7eb', marginBottom: '12px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#6b7280', flexShrink: 0,
                }}>
                  {(deleteConfirmCustomer.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {deleteConfirmCustomer.name || 'Unnamed'}
                  </div>
                  {deleteConfirmCustomer.phone && (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{deleteConfirmCustomer.phone}</div>
                  )}
                </div>
                {deleteConfirmCustomer.totalOrders > 0 && (
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{deleteConfirmCustomer.totalOrders}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>orders</div>
                  </div>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                This will permanently delete all customer data including order history and loyalty points.
              </p>
            </div>
            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '10px',
            }}>
              <button
                onClick={() => setDeleteConfirmCustomer(null)}
                disabled={!!deletingId}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600,
                  background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px',
                  cursor: deletingId ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => !deletingId && (e.currentTarget.style.background = '#e5e7eb')}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                disabled={!!deletingId}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600,
                  background: deletingId ? '#fca5a5' : '#dc2626',
                  color: 'white', border: 'none', borderRadius: '10px',
                  cursor: deletingId ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => !deletingId && (e.currentTarget.style.background = '#b91c1c')}
                onMouseLeave={(e) => !deletingId && (e.currentTarget.style.background = '#dc2626')}
              >
                {deletingId ? <><FaSpinner size={12} className="spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {showGroupModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: isMobile ? '16px' : '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '520px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                {editingGroup ? 'Edit Group' : 'New Customer Group'}
              </h2>
              <button
                onClick={closeGroupModal}
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
                <FaTimes size={14} />
              </button>
            </div>
            <form onSubmit={saveGroup} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. VIPs, Regulars, Birthday Club"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb'
                  }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {GROUP_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGroupForm({ ...groupForm, color: c })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: c,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: groupForm.color === c ? `0 0 0 3px ${c}50, 0 0 0 5px white inset` : 'none',
                        outline: groupForm.color === c ? `2px solid ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Icon (emoji, optional)
                  </label>
                  <input
                    type="text"
                    value={groupForm.icon}
                    onChange={(e) => setGroupForm({ ...groupForm, icon: e.target.value })}
                    placeholder="⭐ 🎂 🍕"
                    maxLength={4}
                    style={{
                      width: '100px',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '18px',
                      outline: 'none',
                      backgroundColor: '#f9fafb',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Members Section */}
              {(
                <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUsers size={12} /> Members ({groupMembers.length})
                  </label>

                  {/* Add by phone */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="tel"
                      value={addPhoneInput}
                      onChange={(e) => setAddPhoneInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editingGroup ? addMemberByPhoneModal(addPhoneInput) : addPendingMemberByPhone(addPhoneInput); } }}
                      placeholder="Add by phone number"
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      disabled={addingMember || !addPhoneInput.trim()}
                      onClick={() => editingGroup ? addMemberByPhoneModal(addPhoneInput) : addPendingMemberByPhone(addPhoneInput)}
                      style={{ padding: '8px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: addingMember || !addPhoneInput.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
                    >
                      {addingMember ? '...' : '+ Add'}
                    </button>
                  </div>

                  {/* Search existing customers */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Search customers by name or phone..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {memberSearchQuery.length >= 2 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '160px', overflowY: 'auto', zIndex: 10, marginTop: '4px' }}>
                        {customers
                          .filter(c => {
                            const q = memberSearchQuery.toLowerCase();
                            const alreadyMember = groupMembers.some(m => m.id === c.id);
                            if (alreadyMember) return false;
                            return (c.name && c.name.toLowerCase().includes(q)) || (c.phone && String(c.phone).includes(q));
                          })
                          .slice(0, 8)
                          .map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => editingGroup ? addMemberToGroupModal(c) : addPendingMemberCustomers(c)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '13px', textAlign: 'left', color: '#374151' }}
                            >
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#6b7280', flexShrink: 0 }}>
                                {(c.name || '?')[0].toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || 'Unknown'}</div>
                                {c.phone && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.phone}</div>}
                              </div>
                              <FaPlus size={10} color="#10b981" />
                            </button>
                          ))
                        }
                        {customers.filter(c => {
                          const q = memberSearchQuery.toLowerCase();
                          return !groupMembers.some(m => m.id === c.id) && ((c.name && c.name.toLowerCase().includes(q)) || (c.phone && String(c.phone).includes(q)));
                        }).length === 0 && (
                          <div style={{ padding: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>No matching customers found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Current members list */}
                  {groupMembersLoading ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>Loading members...</div>
                  ) : groupMembers.length === 0 ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', background: '#f9fafb', borderRadius: '8px' }}>No members yet. Add customers above.</div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
                      {groupMembers.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: groupForm.color || '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                            {(member.name || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name || 'Unknown'}</div>
                            {member.phone && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{member.phone}</div>}
                          </div>
                          <button
                            type="button"
                            onClick={() => editingGroup ? removeMemberFromGroupModal(member) : setGroupMembers(prev => prev.filter(m => m.id !== member.id))}
                            disabled={removingMemberId === member.id}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: removingMemberId === member.id ? '#d1d5db' : '#ef4444', opacity: removingMemberId === member.id ? 0.5 : 1 }}
                          >
                            <FaTimes size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {groupForm._prefillCustomerIds && groupForm._prefillCustomerIds.length > 0 && !editingGroup && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0369a1',
                  marginBottom: '16px'
                }}>
                  {groupForm._prefillCustomerIds.length} customer(s) will be added to this group.
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeGroupModal}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={groupSaving}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#111827',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    border: 'none',
                    cursor: groupSaving ? 'not-allowed' : 'pointer',
                    opacity: groupSaving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {groupSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;
