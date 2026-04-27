'use client';

import { useState, useEffect, useRef } from 'react';
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
  FaUsers,
  FaUser,
  FaGlobe,
  FaStar,
  FaLayerGroup,
  FaExchangeAlt,
  FaSearch,
  FaArrowLeft,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useNotification } from '../../../components/Notification';

// Lightweight searchable multi-select for menu items
const ItemMultiPicker = ({ items = [], selected = [], onChange, placeholder = 'Pick items' }) => {
  const { getCurrencySymbol } = useCurrency();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const filtered = q
    ? items.filter(it => (it.name || '').toLowerCase().includes(q.toLowerCase()))
    : items;
  const selectedItems = items.filter(it => selected.includes(it.id));
  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    onChange(next);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
        {selectedItems.length === 0 && (
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>None selected</span>
        )}
        {selectedItems.map(it => (
          <span key={it.id} style={{ padding: '3px 8px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {it.name}
            <button type="button" onClick={() => toggle(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
              <FaTimes size={9} />
            </button>
          </span>
        ))}
      </div>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
        />
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '10px', fontSize: '12px', color: '#9ca3af' }}>No matches</div>
            ) : filtered.slice(0, 50).map(it => {
              const isSel = selected.includes(it.id);
              return (
                <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer', backgroundColor: isSel ? '#fdf2f8' : 'transparent' }}>
                  <input type="checkbox" checked={isSel} onChange={() => toggle(it.id)} style={{ accentColor: '#ec4899' }} />
                  <span style={{ fontSize: '13px', color: '#1f2937', flex: 1 }}>{it.name}</span>
                  {it._categoryName && <span style={{ fontSize: '10px', color: '#9ca3af' }}>· {it._categoryName}</span>}
                  {it.price != null && <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>{getCurrencySymbol()}{it.price}</span>}
                </label>
              );
            })}
            <div style={{ padding: '6px 10px', borderTop: '1px solid #f3f4f6', textAlign: 'right' }}>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '11px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OffersManagement = ({ embedded = false, restaurantId: propRestaurantId = null, restaurants = [] }) => {
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();
  const { showSuccess, showError, showWarning, NotificationContainer } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'builder'
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
    targetRestaurants: 'all',
    // Phase 5 extended fields
    audience: { type: 'all', groupIds: [], customerIds: [], customerPhones: [] },
    tiers: [],
    crossItemBogo: { enabled: false, buyItemIds: [], buyCategoryIds: [], buyQty: 1, getItemIds: [], getQty: 1, maxApplications: null },
    usageLimitPerCustomer: null,
    priority: 0,
    // Exclusions: items/categories excluded from this offer
    excludedCategories: [],
    excludedItems: [],
    // Internal UI flag: one of 'simple' | 'tiered' | 'bogo_same' | 'bogo_cross'
    discountMode: 'simple',
  };

  const [formData, setFormData] = useState(emptyOffer);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  // Groups sub-view state
  const GROUP_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280'];
  const [offersSubView, setOffersSubView] = useState('offers'); // 'offers' | 'groups'
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', color: '#ef4444', icon: '' });
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]); // Current members of group being edited
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [addPhoneInput, setAddPhoneInput] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name } of offer pending delete
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null); // offer.id currently being toggled
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState(null); // { id, name } of group pending delete
  const [deletingGroup, setDeletingGroup] = useState(false);
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
      // Load offers, settings, and customer groups in parallel
      const [offersResponse, settingsResponse, groupsResponse] = await Promise.all([
        apiClient.get(`/api/offers/${id}`),
        apiClient.get(`/api/restaurants/${id}/customer-app-settings`),
        apiClient.request(`/api/customer-groups/${id}`).catch(() => ({ groups: [] })),
      ]);

      setOffers(offersResponse.offers || []);
      setCustomerGroups(groupsResponse?.groups || []);

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

  const ensureCustomersLoaded = async () => {
    if (customersLoaded) return;
    const id = getRestaurantId();
    if (!id) return;
    try {
      const resp = await apiClient.getCustomers(id, 1, 500, '');
      setCustomersList(resp.customers || []);
      setCustomersLoaded(true);
    } catch (e) {
      console.error('Failed to load customers', e);
      setCustomersLoaded(true);
    }
  };

  const ensureMenuLoaded = async () => {
    if (menuLoaded) return;
    const id = getRestaurantId();
    if (!id) return;
    try {
      const resp = await apiClient.getMenu(id);
      // Flatten: API returns { menuItems: [...] } — each item has category field
      let items = [];
      if (Array.isArray(resp?.menuItems)) {
        items = resp.menuItems.map(it => ({ ...it, _categoryName: it.category || it.categoryName }));
      } else if (Array.isArray(resp?.items)) {
        items = resp.items;
      } else if (Array.isArray(resp?.menu)) {
        resp.menu.forEach(cat => {
          if (Array.isArray(cat.items)) items.push(...cat.items.map(it => ({ ...it, _categoryName: cat.name || cat.category })));
        });
      } else if (Array.isArray(resp)) {
        resp.forEach(cat => {
          if (Array.isArray(cat.items)) items.push(...cat.items.map(it => ({ ...it, _categoryName: cat.name || cat.category })));
        });
      }
      setMenuItems(items);
      setMenuLoaded(true);
    } catch (e) {
      console.error('Failed to load menu', e);
      setMenuLoaded(true);
    }
  };

  // Helper to get restaurantId from state, prop, or user object in localStorage
  const getRestaurantId = () => {
    if (propRestaurantId) return propRestaurantId;
    if (restaurantId) return restaurantId;
    // Try selected restaurant from localStorage first (multi-restaurant users)
    const selectedId = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;
    if (selectedId) return selectedId;
    // Fallback: user object in localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const id = userData.restaurant?.id || userData.restaurantId;
    if (id) {
      setRestaurantId(id);
      return id;
    }
    return null;
  };

  // Reset menu cache when restaurant prop changes
  useEffect(() => {
    if (propRestaurantId) {
      setMenuLoaded(false);
      setMenuItems([]);
    }
  }, [propRestaurantId]);

  const saveOfferSettings = async () => {
    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      showError('No restaurant selected. Please select a restaurant first.');
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

      showSuccess('Offer settings saved successfully!');
    } catch (error) {
      console.error('Error saving offer settings:', error);
      showError('Failed to save offer settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const inferDiscountMode = (offer) => {
    if (offer?.crossItemBogo?.enabled) return 'bogo_cross';
    if (Array.isArray(offer?.tiers) && offer.tiers.length > 0) return 'tiered';
    if (offer?.promotionType === 'bogo') return 'bogo_same';
    return 'simple';
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        ...emptyOffer,
        ...offer,
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        audience: offer.audience || { type: offer.isFirstOrderOnly ? 'first_order' : 'all', groupIds: [], customerIds: [], customerPhones: [] },
        tiers: Array.isArray(offer.tiers) ? offer.tiers : [],
        crossItemBogo: offer.crossItemBogo || { enabled: false, buyItemIds: [], buyCategoryIds: [], buyQty: 1, getItemIds: [], getQty: 1, maxApplications: null },
        usageLimitPerCustomer: offer.usageLimitPerCustomer ?? null,
        priority: offer.priority ?? 0,
        excludedCategories: offer.excludedCategories || [],
        excludedItems: offer.excludedItems || [],
        discountMode: inferDiscountMode(offer),
      });
    } else {
      setEditingOffer(null);
      setFormData(emptyOffer);
    }
    setView('builder');
    // Warm up lazy caches in background
    ensureCustomersLoaded();
    ensureMenuLoaded();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeBuilder = () => {
    setEditingOffer(null);
    setFormData(emptyOffer);
    setCustomerSearch('');
    setView('list');
  };

  const handleSave = async () => {
    if (!formData.name) {
      showWarning('Please enter an offer name');
      return;
    }

    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      showError('No restaurant selected. Please select a restaurant first.');
      return;
    }

    setSaving(true);
    try {
      // Build payload: strip UI-only flags, normalize sections based on discountMode
      const { discountMode, _showExclusions, ...rest } = formData;
      const payload = { ...rest };
      if (discountMode === 'simple') {
        payload.tiers = [];
        payload.crossItemBogo = { ...payload.crossItemBogo, enabled: false };
        if (payload.promotionType === 'bogo') payload.promotionType = 'discount';
      } else if (discountMode === 'tiered') {
        payload.crossItemBogo = { ...payload.crossItemBogo, enabled: false };
        if (payload.promotionType === 'bogo') payload.promotionType = 'discount';
      } else if (discountMode === 'bogo_same') {
        payload.tiers = [];
        payload.crossItemBogo = { ...payload.crossItemBogo, enabled: false };
        payload.promotionType = 'bogo';
      } else if (discountMode === 'bogo_cross') {
        payload.tiers = [];
        payload.crossItemBogo = { ...payload.crossItemBogo, enabled: true };
        // Clear base discount so engine only uses cross BOGO free-item discount
        payload.discountValue = 0;
        // Validate buy/get items are configured
        const buyIds = payload.crossItemBogo?.buyItemIds || [];
        const buyCats = payload.crossItemBogo?.buyCategoryIds || [];
        const getIds = payload.crossItemBogo?.getItemIds || [];
        if (buyIds.length === 0 && buyCats.length === 0) {
          showWarning('Please select at least one "Buy" item or category for Cross BOGO');
          setSaving(false);
          return;
        }
        if (getIds.length === 0) {
          showWarning('Please select at least one "Get Free" item for Cross BOGO');
          setSaving(false);
          return;
        }
      }
      // Sync first-order flag with audience for back-compat with older engine bits
      payload.isFirstOrderOnly = payload.audience?.type === 'first_order';

      if (editingOffer) {
        await apiClient.put(`/api/offers/${currentRestaurantId}/${editingOffer.id}`, payload);
      } else {
        await apiClient.post(`/api/offers/${currentRestaurantId}`, payload);
      }
      await loadOffers(currentRestaurantId);
      closeBuilder();
    } catch (error) {
      console.error('Error saving offer:', error);
      showError('Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId) => {
    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      showError('No restaurant selected. Please select a restaurant first.');
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/api/offers/${currentRestaurantId}/${offerId}`);
      await loadOffers(currentRestaurantId);
      showSuccess('Offer deleted successfully');
    } catch (error) {
      console.error('Error deleting offer:', error);
      showError('Failed to delete offer');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (offer) => {
    const currentRestaurantId = getRestaurantId();
    if (!currentRestaurantId) {
      showError('No restaurant selected. Please select a restaurant first.');
      return;
    }

    setTogglingId(offer.id);
    try {
      await apiClient.put(`/api/offers/${currentRestaurantId}/${offer.id}`, {
        ...offer,
        isActive: !offer.isActive
      });
      await loadOffers(currentRestaurantId);
      showSuccess(offer.isActive ? 'Offer deactivated' : 'Offer activated');
    } catch (error) {
      console.error('Error toggling offer:', error);
      showError('Failed to update offer status');
    } finally {
      setTogglingId(null);
    }
  };

  // Group CRUD
  const saveGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name?.trim()) return;
    const id = getRestaurantId();
    if (!id) return;
    setGroupSaving(true);
    try {
      if (editingGroup) {
        await apiClient.request(`/api/customer-groups/${id}/${editingGroup.id}`, {
          method: 'PATCH',
          body: { name: groupForm.name.trim(), description: groupForm.description || '', color: groupForm.color, icon: groupForm.icon || '' }
        });
        setCustomerGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name: groupForm.name.trim(), description: groupForm.description, color: groupForm.color, icon: groupForm.icon } : g));
      } else {
        // Include pending members when creating
        const customerIds = groupMembers.map(m => m.id).filter(id => !id.startsWith('phone_'));
        const customerPhones = groupMembers.map(m => m.phone).filter(Boolean);
        const resp = await apiClient.request(`/api/customer-groups/${id}`, {
          method: 'POST',
          body: { name: groupForm.name.trim(), description: groupForm.description || '', color: groupForm.color, icon: groupForm.icon || '', customerIds, customerPhones }
        });
        setCustomerGroups(prev => [...prev, resp.group]);
      }
      setShowGroupModal(false);
    } catch (err) {
      console.error('Error saving group:', err);
    } finally {
      setGroupSaving(false);
    }
  };

  // Load group members when editing
  const loadGroupMembers = async (group) => {
    const id = getRestaurantId();
    if (!id || !group) return;
    setGroupMembersLoading(true);
    try {
      await ensureCustomersLoaded();
      // Get member IDs and phones from group
      const memberIds = group.customerIds || [];
      const memberPhones = group.customerPhones || [];
      // Match against loaded customers
      const members = customersList.filter(c =>
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

  // Add member to group by selecting existing customer
  const addMemberToGroup = async (customer) => {
    const id = getRestaurantId();
    const groupId = editingGroup?.id;
    if (!id || !groupId) return;
    setAddingMember(true);
    try {
      const payload = {
        customerIds: [customer.id],
        customerPhones: customer.phone ? [customer.phone] : [],
      };
      await apiClient.request(`/api/customer-groups/${id}/${groupId}/members`, {
        method: 'POST', body: payload,
      });
      setGroupMembers(prev => {
        if (prev.some(m => m.id === customer.id)) return prev;
        return [...prev, customer];
      });
      setCustomerGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const newIds = Array.from(new Set([...(g.customerIds || []), customer.id]));
        const newPhones = customer.phone ? Array.from(new Set([...(g.customerPhones || []), customer.phone])) : (g.customerPhones || []);
        return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length + newPhones.length };
      }));
      setMemberSearchQuery('');
    } catch (err) {
      console.error('Error adding member:', err);
      showError('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  // Add member by phone (create customer if new)
  const addMemberByPhone = async (phone) => {
    const id = getRestaurantId();
    const groupId = editingGroup?.id;
    if (!id || !groupId || !phone?.trim()) return;
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length < 10) { showWarning('Enter a valid 10-digit phone number'); return; }
    setAddingMember(true);
    try {
      // Check if customer exists
      let customer = customersList.find(c => c.phone && c.phone.replace(/\D/g, '').slice(-10) === normalizedPhone);
      if (!customer) {
        // Create new customer
        const resp = await apiClient.request('/api/customers', {
          method: 'POST',
          body: { phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}`, restaurantId: id },
        });
        customer = resp.customer || { id: resp.customerId || resp.id, phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}` };
        setCustomersList(prev => [...prev, customer]);
      }
      await addMemberToGroup(customer);
      setAddPhoneInput('');
    } catch (err) {
      console.error('Error adding member by phone:', err);
      showError('Failed to add member: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingMember(false);
    }
  };

  // Remove member from group
  const removeMemberFromGroup = async (member) => {
    const id = getRestaurantId();
    const groupId = editingGroup?.id;
    if (!id || !groupId) return;
    setRemovingMemberId(member.id);
    try {
      const payload = {
        customerIds: member._phoneOnly ? [] : [member.id],
        customerPhones: member.phone ? [member.phone] : [],
      };
      await apiClient.request(`/api/customer-groups/${id}/${groupId}/members`, {
        method: 'DELETE', body: payload,
      });
      setGroupMembers(prev => prev.filter(m => m.id !== member.id));
      setCustomerGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const newIds = (g.customerIds || []).filter(cid => cid !== member.id);
        const newPhones = member.phone ? (g.customerPhones || []).filter(p => p !== member.phone) : (g.customerPhones || []);
        return { ...g, customerIds: newIds, customerPhones: newPhones, customerCount: newIds.length + newPhones.length };
      }));
    } catch (err) {
      console.error('Error removing member:', err);
      showError('Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Add member locally for new group (no API call yet)
  const addPendingMember = (customer) => {
    setGroupMembers(prev => {
      if (prev.some(m => m.id === customer.id)) return prev;
      return [...prev, customer];
    });
    setMemberSearchQuery('');
  };

  const addPendingMemberByPhone = async (phone) => {
    const id = getRestaurantId();
    if (!id || !phone?.trim()) return;
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length < 10) { showWarning('Enter a valid 10-digit phone number'); return; }
    setAddingMember(true);
    try {
      let customer = customersList.find(c => c.phone && String(c.phone).replace(/\D/g, '').slice(-10) === normalizedPhone);
      if (!customer) {
        const resp = await apiClient.request('/api/customers', {
          method: 'POST',
          body: { phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}`, restaurantId: id },
        });
        customer = resp.customer || { id: resp.customerId || resp.id, phone: normalizedPhone, name: `Customer ${normalizedPhone.slice(-4)}` };
        setCustomersList(prev => [...prev, customer]);
      }
      addPendingMember(customer);
      setAddPhoneInput('');
    } catch (err) {
      console.error('Error adding member by phone:', err);
      showError('Failed to add member: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingMember(false);
    }
  };

  const deleteGroup = async (groupId) => {
    const id = getRestaurantId();
    setDeletingGroup(true);
    try {
      await apiClient.request(`/api/customer-groups/${id}/${groupId}`, { method: 'DELETE' });
      setCustomerGroups(prev => prev.filter(g => g.id !== groupId));
      showSuccess('Group deleted successfully');
    } catch (err) {
      console.error('Error deleting group:', err);
      showError('Failed to delete group');
    } finally {
      setDeletingGroup(false);
      setDeleteGroupConfirm(null);
    }
  };

  const getDiscountLabel = (offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `Rs. ${offer.discountValue} OFF`;
  };

  const getAudienceBadge = (offer) => {
    const a = offer.audience;
    if (!a || !a.type || a.type === 'all') return { label: 'Everyone', bg: '#e0f2fe', fg: '#0369a1', icon: <FaGlobe size={10} /> };
    if (a.type === 'first_order') return { label: 'First order', bg: '#f3e8ff', fg: '#7c3aed', icon: <FaStar size={10} /> };
    if (a.type === 'groups') {
      const n = (a.groupIds || []).length;
      return { label: `${n} group${n !== 1 ? 's' : ''}`, bg: '#fef3c7', fg: '#92400e', icon: <FaUsers size={10} /> };
    }
    if (a.type === 'customers') {
      const n = (a.customerIds || []).length + (a.customerPhones || []).length;
      return { label: `${n} customer${n !== 1 ? 's' : ''}`, bg: '#dcfce7', fg: '#166534', icon: <FaUser size={10} /> };
    }
    return { label: 'Everyone', bg: '#e0f2fe', fg: '#0369a1', icon: <FaGlobe size={10} /> };
  };

  const getTierSummary = (offer) => {
    if (!Array.isArray(offer.tiers) || offer.tiers.length === 0) return null;
    const list = offer.tiers
      .slice()
      .sort((a, b) => (a.minSubtotal || 0) - (b.minSubtotal || 0))
      .map(t => `Rs.${t.minSubtotal || 0}+`)
      .join(', ');
    return `${offer.tiers.length} tier${offer.tiers.length !== 1 ? 's' : ''} · ${list}`;
  };

  // Approximate customer count for audience preview
  const getAudienceReachEstimate = () => {
    const a = formData.audience || { type: 'all' };
    if (a.type === 'all') return 'all customers';
    if (a.type === 'first_order') return 'first-time customers only';
    if (a.type === 'groups') {
      const selected = (a.groupIds || []);
      const total = selected.reduce((sum, gid) => {
        const g = customerGroups.find(g => g.id === gid);
        return sum + (g?.customerCount || 0);
      }, 0);
      return `~${total} customer${total !== 1 ? 's' : ''} across ${selected.length} group${selected.length !== 1 ? 's' : ''}`;
    }
    if (a.type === 'customers') {
      const n = (a.customerIds || []).length + (a.customerPhones || []).length;
      return `${n} specific customer${n !== 1 ? 's' : ''}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef7f0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fef7f0', padding: isMobile ? '8px' : '24px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <NotificationContainer />
      {/* Prevent iOS auto-zoom on input focus (requires font-size >= 16px) */}
      {isMobile && (
        <style dangerouslySetInnerHTML={{ __html: `
          input, textarea, select { font-size: 16px !important; }
        ` }} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes offerSpin { to { transform: rotate(360deg); } }
        @keyframes offerModalIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
      ` }} />

      {/* Delete Offer Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000,
          padding: isMobile ? '0' : '20px',
        }} onClick={() => !deleting && setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            padding: isMobile ? '20px 16px 28px' : '28px', width: isMobile ? '100%' : '380px',
            maxWidth: '420px', animation: 'offerModalIn 0.2s ease-out',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <FaTrash size={18} color="#dc2626" />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '700', color: '#1f2937' }}>Delete Offer</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>&ldquo;{deleteConfirm.name}&rdquo;</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  backgroundColor: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#dc2626', color: 'white', fontSize: '14px', fontWeight: '600',
                  cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {deleting ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'offerSpin 0.7s linear infinite' }} />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {deleteGroupConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000,
          padding: isMobile ? '0' : '20px',
        }} onClick={() => !deletingGroup && setDeleteGroupConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            padding: isMobile ? '20px 16px 28px' : '28px', width: isMobile ? '100%' : '380px',
            maxWidth: '420px', animation: 'offerModalIn 0.2s ease-out',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <FaTrash size={18} color="#dc2626" />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '700', color: '#1f2937' }}>Delete Group</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>&ldquo;{deleteGroupConfirm.name}&rdquo;</strong>? Members won&apos;t be deleted.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteGroupConfirm(null)}
                disabled={deletingGroup}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  backgroundColor: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGroup(deleteGroupConfirm.id)}
                disabled={deletingGroup}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#dc2626', color: 'white', fontSize: '14px', fontWeight: '600',
                  cursor: deletingGroup ? 'not-allowed' : 'pointer', opacity: deletingGroup ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {deletingGroup ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'offerSpin 0.7s linear infinite' }} />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {view === 'list' && (
        <>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '14px' : '32px',
          marginBottom: isMobile ? '12px' : '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: isMobile ? '10px' : '16px'
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '18px' : '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
              <FaTag color="#ec4899" size={isMobile ? 18 : 28} />
              Offers & Promotions
            </h1>
            {!isMobile && (
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Create and manage offers for your Crave app customers
            </p>
            )}
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: isMobile ? '8px 14px' : '12px 24px',
              backgroundColor: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: isMobile ? '10px' : '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px',
              fontSize: isMobile ? '13px' : '14px',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
          >
            <FaPlus size={isMobile ? 12 : 14} />
            Create Offer
          </button>
        </div>

        {/* Sub-view toggle: Offers | Groups */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          background: '#f3f4f6',
          borderRadius: '10px',
          padding: '4px',
          width: 'fit-content'
        }}>
          {[
            { id: 'offers', label: 'Offers', icon: <FaTag size={12} /> },
            { id: 'groups', label: `Groups (${customerGroups.length})`, icon: <FaLayerGroup size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setOffersSubView(tab.id)}
              style={{
                padding: isMobile ? '8px 14px' : '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: offersSubView === tab.id ? 'white' : 'transparent',
                color: offersSubView === tab.id ? '#1f2937' : '#6b7280',
                fontWeight: '600',
                fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer',
                boxShadow: offersSubView === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Groups Sub-view */}
        {offersSubView === 'groups' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '14px' : '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #fce7f3'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '20px', flexWrap: 'wrap', gap: isMobile ? '8px' : '12px' }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '22px', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                <FaUsers color="#ec4899" size={isMobile ? 16 : 22} />
                Customer Groups
              </h2>
              <button
                onClick={() => { setEditingGroup(null); setGroupForm({ name: '', description: '', color: GROUP_COLORS[0], icon: '' }); setGroupMembers([]); setMemberSearchQuery(''); setAddPhoneInput(''); setShowGroupModal(true); }}
                style={{
                  padding: isMobile ? '8px 14px' : '10px 20px',
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '12px' : '13px',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                }}
              >
                <FaPlus size={isMobile ? 10 : 12} /> New Group
              </button>
            </div>

            {customerGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <FaUsers size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px', margin: 0 }}>No customer groups yet. Create one to target offers to specific audiences.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                {customerGroups.map(g => (
                  <div key={g.id} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      backgroundColor: g.color || '#6b7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0
                    }}>
                      {g.icon || g.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{g.name}</p>
                      {g.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                        {g.customerCount ?? (g.customerIds || []).length} members
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description || '', color: g.color || GROUP_COLORS[0], icon: g.icon || '' }); setGroupMembers([]); setMemberSearchQuery(''); setAddPhoneInput(''); setShowGroupModal(true); loadGroupMembers(g); }}
                        style={{ background: '#f3f4f6', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#6b7280' }}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteGroupConfirm({ id: g.id, name: g.name })}
                        style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {offersSubView === 'offers' && (<>
        {/* Offer Settings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '12px' : '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '20px' }}>
            <h2 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
              <FaCog color="#6b7280" size={isMobile ? 14 : 16} />
              Offer Settings
            </h2>
            <button
              onClick={saveOfferSettings}
              disabled={savingSettings}
              style={{
                padding: isMobile ? '6px 12px' : '8px 16px',
                backgroundColor: savingSettings ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: savingSettings ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <FaSave size={isMobile ? 10 : 12} />
              {savingSettings ? 'Saving...' : (isMobile ? 'Save' : 'Save Settings')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? '8px' : '16px' }}>
            {/* Auto-apply Best Offer */}
            <div style={{ padding: isMobile ? '10px' : '16px', backgroundColor: '#f9fafb', borderRadius: isMobile ? '10px' : '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#374151' }}>Auto-apply Best Offer</span>
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
            <div style={{ padding: isMobile ? '10px' : '16px', backgroundColor: '#f9fafb', borderRadius: isMobile ? '10px' : '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#374151' }}>Allow Multiple Offers</span>
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
            <div style={{ padding: isMobile ? '10px' : '16px', backgroundColor: '#f9fafb', borderRadius: isMobile ? '10px' : '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#374151' }}>Max Offers per Order</span>
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
          <div style={{ display: 'grid', gap: isMobile ? '10px' : '16px' }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: isMobile ? '12px' : '16px',
                  padding: isMobile ? '12px' : '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: offer.isActive ? '2px solid #10b981' : '1px solid #e5e7eb',
                  opacity: offer.isActive ? 1 : 0.7,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {togglingId === offer.id && (
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                    borderRadius: 'inherit', backdropFilter: 'blur(2px)',
                  }}>
                    <div style={{
                      width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTopColor: '#10b981',
                      borderRadius: '50%', animation: 'offerSpin 0.7s linear infinite',
                    }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: isMobile ? '8px' : '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: isMobile ? '4px 8px' : '6px 12px',
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
                      {Array.isArray(offer.targetRestaurants) && offer.targetRestaurants.length > 0 && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {offer.targetRestaurants.length} restaurant{offer.targetRestaurants.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {(() => {
                        const ab = getAudienceBadge(offer);
                        return (
                          <span style={{
                            padding: '4px 10px',
                            backgroundColor: ab.bg,
                            color: ab.fg,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            {ab.icon}
                            {ab.label}
                          </span>
                        );
                      })()}
                      {Array.isArray(offer.tiers) && offer.tiers.length > 0 && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#ecfeff',
                          color: '#0e7490',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <FaLayerGroup size={10} />
                          {getTierSummary(offer)}
                        </span>
                      )}
                      {offer.crossItemBogo?.enabled && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <FaExchangeAlt size={10} />
                          Buy {offer.crossItemBogo.buyQty || 1} · Get {offer.crossItemBogo.getQty || 1} free
                        </span>
                      )}
                      {typeof offer.priority === 'number' && offer.priority !== 0 && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          P{offer.priority}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '#1f2937' }}>
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
                      onClick={() => setDeleteConfirm({ id: offer.id, name: offer.name })}
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
        </>)}
        </>
        )}

        {view === 'builder' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '12px' : '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #fce7f3',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '16px' : '24px',
              gap: isMobile ? '8px' : '12px',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              paddingBottom: isMobile ? '8px' : '12px',
              borderBottom: '1px solid #f3f4f6',
              zIndex: 2,
            }}>
              <button
                onClick={closeBuilder}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isMobile ? '8px' : '10px 14px',
                  borderRadius: isMobile ? '8px' : '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: isMobile ? '12px' : '13px',
                  flexShrink: 0,
                }}
              >
                <FaArrowLeft size={isMobile ? 10 : 12} />
              </button>
              <h2 style={{ margin: 0, fontSize: isMobile ? '14px' : '20px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                {editingOffer ? `Edit Offer${!isMobile && formData.name ? ': ' + formData.name : ''}` : 'Create Offer'}
              </h2>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {!isMobile && (
                <button
                  onClick={closeBuilder}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: isMobile ? '8px 12px' : '10px 18px',
                    backgroundColor: saving ? '#9ca3af' : '#ec4899',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? '8px' : '10px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: isMobile ? '12px' : '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  <FaSave size={isMobile ? 10 : 12} />
                  {saving ? 'Saving...' : (isMobile ? 'Save' : 'Save Offer')}
                </button>
              </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
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

              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority ?? 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value, 10) || 0 }))}
                  style={{
                    width: '120px',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                  Higher priority offers are evaluated first when multiple match
                </p>
              </div>

              {/* Discount Mode 4-card picker */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Discount Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { value: 'simple', label: 'Simple', desc: 'Flat or %', icon: <FaPercent /> },
                    { value: 'tiered', label: 'Tiered', desc: 'Spend more, save more', icon: <FaLayerGroup /> },
                    { value: 'bogo_same', label: 'BOGO', desc: 'Same item', icon: <FaGift /> },
                    { value: 'bogo_cross', label: 'Cross BOGO', desc: 'Buy X, get Y', icon: <FaExchangeAlt /> },
                  ].map(opt => {
                    const selected = formData.discountMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          discountMode: opt.value,
                          promotionType: opt.value === 'bogo_same' ? 'bogo' : (prev.promotionType === 'bogo' ? 'discount' : prev.promotionType),
                          tiers: opt.value === 'tiered' && (!prev.tiers || prev.tiers.length === 0)
                            ? [{ minSubtotal: 500, discountType: 'percentage', discountValue: 10 }]
                            : prev.tiers,
                          crossItemBogo: opt.value === 'bogo_cross'
                            ? { ...(prev.crossItemBogo || {}), enabled: true, buyQty: prev.crossItemBogo?.buyQty || 1, getQty: prev.crossItemBogo?.getQty || 1 }
                            : { ...(prev.crossItemBogo || { buyItemIds: [], getItemIds: [] }), enabled: false },
                        }))}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '10px',
                          border: selected ? '2px solid #ec4899' : '2px solid #e5e7eb',
                          backgroundColor: selected ? '#fdf2f8' : 'white',
                          color: selected ? '#be185d' : '#6b7280',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{opt.icon}</span>
                        <span>{opt.label}</span>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: selected ? '#be185d' : '#9ca3af' }}>{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tiered discount rows */}
              {formData.discountMode === 'tiered' && (
                <div style={{ padding: '12px', backgroundColor: '#ecfeff', borderRadius: '8px', border: '1px solid #a5f3fc' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0e7490', marginBottom: '8px' }}>
                    Spend Tiers
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(formData.tiers || []).map((tier, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.2fr 1fr 1fr auto', gap: '8px', alignItems: isMobile ? 'end' : 'center' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: '#0e7490', marginBottom: '2px' }}>Min Subtotal</label>
                          <input
                            type="number"
                            value={tier.minSubtotal ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, tiers: prev.tiers.map((t, i) => i === idx ? { ...t, minSubtotal: v } : t) }));
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #67e8f9', fontSize: '14px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: '#0e7490', marginBottom: '2px' }}>Type</label>
                          <select
                            value={tier.discountType || 'percentage'}
                            onChange={(e) => setFormData(prev => ({ ...prev, tiers: prev.tiers.map((t, i) => i === idx ? { ...t, discountType: e.target.value } : t) }))}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #67e8f9', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'white' }}
                          >
                            <option value="percentage">%</option>
                            <option value="flat">Flat</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: '#0e7490', marginBottom: '2px' }}>Value</label>
                          <input
                            type="number"
                            value={tier.discountValue ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, tiers: prev.tiers.map((t, i) => i === idx ? { ...t, discountValue: v } : t) }));
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #67e8f9', fontSize: '14px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== idx) }))}
                          style={{ marginTop: '14px', padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Remove tier"
                        >
                          <FaTrash color="#dc2626" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tiers: [...(prev.tiers || []), { minSubtotal: ((prev.tiers?.slice(-1)?.[0]?.minSubtotal) || 0) + 500, discountType: 'percentage', discountValue: 10 }]
                    }))}
                    style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'white', border: '1.5px dashed #0e7490', borderRadius: '6px', cursor: 'pointer', color: '#0e7490', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus size={10} /> Add tier
                  </button>
                </div>
              )}

              {/* Cross-item BOGO config */}
              {formData.discountMode === 'bogo_cross' && (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b91c1c', marginBottom: '8px' }}>
                    Cross-item BOGO
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Buy Qty</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.crossItemBogo?.buyQty ?? ''}
                        onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, buyQty: v === '' ? '' : parseInt(v, 10) } })); }}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, buyQty: 1 } })); }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Get Qty (free)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.crossItemBogo?.getQty ?? ''}
                        onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, getQty: v === '' ? '' : parseInt(v, 10) } })); }}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, getQty: 1 } })); }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Buy Items</label>
                    <ItemMultiPicker
                      items={menuItems}
                      selected={formData.crossItemBogo?.buyItemIds || []}
                      onChange={(ids) => setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, buyItemIds: ids } }))}
                      placeholder="Pick items customer must buy"
                    />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Get Items (free)</label>
                    <ItemMultiPicker
                      items={menuItems}
                      selected={formData.crossItemBogo?.getItemIds || []}
                      onChange={(ids) => setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, getItemIds: ids } }))}
                      placeholder="Pick free items"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Max Applications (per order)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.crossItemBogo?.maxApplications ?? ''}
                      onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, crossItemBogo: { ...prev.crossItemBogo, maxApplications: v === '' ? null : parseInt(v, 10) } })); }}
                      placeholder="Unlimited"
                      style={{ width: isMobile ? '100%' : '160px', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* BOGO Config (same item) */}
              {formData.discountMode === 'bogo_same' && (
                <div style={{ padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '8px', border: '1px solid #fce7f3' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '8px' }}>
                    BOGO Configuration
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Buy Qty</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.bogoConfig?.buyQty ?? ''}
                        onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: v === '' ? '' : parseInt(v, 10), getQty: prev.bogoConfig?.getQty || 1, getDiscount: prev.bogoConfig?.getDiscount || 100 } })); }}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: 2, getQty: prev.bogoConfig?.getQty || 1, getDiscount: prev.bogoConfig?.getDiscount || 100 } })); }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Get Qty Free</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.bogoConfig?.getQty ?? ''}
                        onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: v === '' ? '' : parseInt(v, 10), getDiscount: prev.bogoConfig?.getDiscount || 100 } })); }}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: 1, getDiscount: prev.bogoConfig?.getDiscount || 100 } })); }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Discount %</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.bogoConfig?.getDiscount ?? ''}
                        onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: prev.bogoConfig?.getQty || 1, getDiscount: v === '' ? '' : Math.min(parseInt(v, 10), 100) } })); }}
                        onBlur={(e) => { if (!e.target.value) setFormData(prev => ({ ...prev, bogoConfig: { ...(prev.bogoConfig || {}), buyQty: prev.bogoConfig?.buyQty || 2, getQty: prev.bogoConfig?.getQty || 1, getDiscount: 100 } })); }}
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
                      onClick={() => { setFormData(prev => ({ ...prev, scope: opt.value })); if (opt.value === 'item' || opt.value === 'category') ensureMenuLoaded(); }}
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
              {formData.scope === 'category' && (() => {
                const allCategories = [...new Set(menuItems.map(it => it.category || it._categoryName).filter(Boolean))];
                const catItems = allCategories.map(c => ({ id: c, name: c }));
                return (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Select Categories
                    </label>
                    <ItemMultiPicker
                      items={catItems}
                      selected={formData.targetCategories || []}
                      onChange={(ids) => setFormData(prev => ({ ...prev, targetCategories: ids }))}
                      placeholder="Search categories..."
                    />
                    {allCategories.length === 0 && (
                      <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                        Loading categories...
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Target Items */}
              {formData.scope === 'item' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Select Menu Items
                  </label>
                  <ItemMultiPicker
                    items={menuItems}
                    selected={formData.targetItems || []}
                    onChange={(ids) => setFormData(prev => ({ ...prev, targetItems: ids }))}
                    placeholder="Search menu items..."
                  />
                  {menuItems.length === 0 && (
                    <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                      Loading menu items...
                    </p>
                  )}
                </div>
              )}

              {/* Restaurant Targeting */}
              {restaurants.length > 1 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Apply to Restaurants
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, targetRestaurants: 'all' }))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: formData.targetRestaurants === 'all' ? '2px solid #111827' : '2px solid #e5e7eb',
                        backgroundColor: formData.targetRestaurants === 'all' ? '#111827' : 'white',
                        color: formData.targetRestaurants === 'all' ? 'white' : '#6b7280',
                        fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                      }}
                    >
                      All Restaurants
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, targetRestaurants: [restaurantId].filter(Boolean) }))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: Array.isArray(formData.targetRestaurants) ? '2px solid #111827' : '2px solid #e5e7eb',
                        backgroundColor: Array.isArray(formData.targetRestaurants) ? '#111827' : 'white',
                        color: Array.isArray(formData.targetRestaurants) ? 'white' : '#6b7280',
                        fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                      }}
                    >
                      Specific
                    </button>
                  </div>
                  {Array.isArray(formData.targetRestaurants) && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {restaurants.map(r => {
                        const isSelected = (formData.targetRestaurants || []).includes(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              const current = formData.targetRestaurants || [];
                              const updated = isSelected
                                ? current.filter(id => id !== r.id)
                                : [...current, r.id];
                              if (updated.length > 0) {
                                setFormData(prev => ({ ...prev, targetRestaurants: updated }));
                              }
                            }}
                            style={{
                              padding: '6px 12px', borderRadius: '6px',
                              border: isSelected ? '1.5px solid #111827' : '1.5px solid #d1d5db',
                              backgroundColor: isSelected ? '#111827' : 'white',
                              color: isSelected ? 'white' : '#374151',
                              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                            }}
                          >
                            {r.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Exclusions (Optional) */}
              {(() => {
                const hasExclusions = (formData.excludedCategories?.length > 0 || formData.excludedItems?.length > 0);
                const allCategories = [...new Set(menuItems.map(it => it.category || it._categoryName).filter(Boolean))];
                const catItems = allCategories.map(c => ({ id: c, name: c }));
                return (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }}
                      onClick={() => { ensureMenuLoaded(); }}
                    >
                      <input
                        type="checkbox"
                        checked={hasExclusions || formData._showExclusions}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            setFormData(prev => ({ ...prev, excludedCategories: [], excludedItems: [], _showExclusions: false }));
                          } else {
                            setFormData(prev => ({ ...prev, _showExclusions: true }));
                            ensureMenuLoaded();
                          }
                        }}
                        style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Exclude items/categories from this offer</span>
                    </label>
                    {(hasExclusions || formData._showExclusions) && (
                      <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', marginTop: 0 }}>
                          These items or categories won&apos;t receive the discount even if they match the offer scope.
                        </p>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Exclude Categories
                          </label>
                          <ItemMultiPicker
                            items={catItems}
                            selected={formData.excludedCategories || []}
                            onChange={(ids) => setFormData(prev => ({ ...prev, excludedCategories: ids }))}
                            placeholder="Search categories to exclude..."
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Exclude Items
                          </label>
                          <ItemMultiPicker
                            items={menuItems}
                            selected={formData.excludedItems || []}
                            onChange={(ids) => setFormData(prev => ({ ...prev, excludedItems: ids }))}
                            placeholder="Search items to exclude..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
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

              {/* Audience */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Audience
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { value: 'all', label: 'Everyone', icon: <FaGlobe /> },
                    { value: 'first_order', label: 'First-time', icon: <FaStar /> },
                    { value: 'groups', label: 'Groups', icon: <FaUsers /> },
                    { value: 'customers', label: 'Customers', icon: <FaUser /> },
                  ].map(opt => {
                    const selected = (formData.audience?.type || 'all') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          audience: { ...(prev.audience || {}), type: opt.value, groupIds: prev.audience?.groupIds || [], customerIds: prev.audience?.customerIds || [], customerPhones: prev.audience?.customerPhones || [] },
                          isFirstOrderOnly: opt.value === 'first_order',
                        }))}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '10px',
                          border: selected ? '2px solid #ec4899' : '2px solid #e5e7eb',
                          backgroundColor: selected ? '#fdf2f8' : 'white',
                          color: selected ? '#be185d' : '#6b7280',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Group multi-select */}
                {formData.audience?.type === 'groups' && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    {customerGroups.length === 0 ? (
                      <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                        No customer groups yet.{' '}
                        <button
                          type="button"
                          onClick={() => { setView('list'); setOffersSubView('groups'); }}
                          style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', padding: 0 }}
                        >
                          Create a group
                        </button>
                      </p>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {customerGroups.map(g => {
                          const isSel = (formData.audience?.groupIds || []).includes(g.id);
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                const cur = formData.audience?.groupIds || [];
                                const next = isSel ? cur.filter(x => x !== g.id) : [...cur, g.id];
                                setFormData(prev => ({ ...prev, audience: { ...prev.audience, groupIds: next } }));
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: isSel ? `2px solid ${g.color || '#ec4899'}` : '1.5px solid #d1d5db',
                                backgroundColor: isSel ? (g.color ? `${g.color}22` : '#fdf2f8') : 'white',
                                color: isSel ? (g.color || '#be185d') : '#374151',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: g.color || '#ec4899' }} />
                              {g.name}
                              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>({g.customerCount || 0})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer multi-select */}
                {formData.audience?.type === 'customers' && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={typeof customerSearch === 'string' ? customerSearch : ''}
                        onChange={(e) => setCustomerSearch(String(e.target.value || ''))}
                        placeholder="Search by name or phone"
                        style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                      <FaSearch size={12} color="#16a34a" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {!customersLoaded ? (
                      <p style={{ fontSize: '12px', color: '#16a34a', margin: 0 }}>Loading customers...</p>
                    ) : customersList.length === 0 ? (
                      <p style={{ fontSize: '12px', color: '#16a34a', margin: 0 }}>No customers yet.</p>
                    ) : (
                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {customersList
                          .filter(c => {
                            if (!customerSearch) return true;
                            const q = customerSearch.toLowerCase();
                            return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
                          })
                          .slice(0, 100)
                          .map(c => {
                            const isSel = (formData.audience?.customerIds || []).includes(c.id);
                            return (
                              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', backgroundColor: isSel ? '#dcfce7' : 'transparent', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isSel}
                                  onChange={() => {
                                    const cur = formData.audience?.customerIds || [];
                                    const next = isSel ? cur.filter(x => x !== c.id) : [...cur, c.id];
                                    setFormData(prev => ({ ...prev, audience: { ...prev.audience, customerIds: next } }));
                                  }}
                                  style={{ accentColor: '#16a34a' }}
                                />
                                <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>{typeof c.name === 'string' && c.name ? c.name : 'Unnamed'}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>{typeof c.phone === 'string' ? c.phone : ''}</span>
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Eligibility preview */}
              <div style={{ padding: '10px 14px', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                <p style={{ fontSize: '12px', color: '#4338ca', margin: 0 }}>
                  <strong>Reach preview:</strong> This offer will apply to {getAudienceReachEstimate()}.
                </p>
              </div>

              {/* Per-customer usage limit */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Max uses per customer
                </label>
                <input
                  type="text"
                  value={formData.usageLimitPerCustomer ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d+$/.test(v)) {
                      setFormData(prev => ({ ...prev, usageLimitPerCustomer: v === '' ? null : parseInt(v, 10) }));
                    }
                  }}
                  placeholder="Unlimited"
                  style={{
                    width: isMobile ? '100%' : '160px',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                  Limit how many times each customer can redeem this offer
                </p>
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
                  onClick={closeBuilder}
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
        )}
      </div>

      {/* Group Create/Edit Modal */}
      {showGroupModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowGroupModal(false)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: isMobile ? '20px' : '28px',
            width: '100%', maxWidth: isMobile ? '100%' : '520px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                {editingGroup ? 'Edit Group' : 'New Customer Group'}
              </h3>
              <button onClick={() => setShowGroupModal(false)} style={{ background: '#f3f4f6', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                <FaTimes size={14} color="#6b7280" />
              </button>
            </div>
            <form onSubmit={saveGroup}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Name *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. VIP Customers"
                  autoFocus
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {GROUP_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGroupForm(prev => ({ ...prev, color: c }))}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: c, border: groupForm.color === c ? '3px solid #1f2937' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Icon (emoji)</label>
                  <input
                    type="text"
                    value={groupForm.icon}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, icon: e.target.value.slice(0, 4) }))}
                    placeholder="e.g. ⭐"
                    maxLength={4}
                    style={{ width: '60px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '18px', textAlign: 'center', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Members Section */}
              {(
                <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUsers size={12} /> Members ({groupMembers.length})
                  </label>

                  {/* Add by phone */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="tel"
                      value={addPhoneInput}
                      onChange={(e) => setAddPhoneInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editingGroup ? addMemberByPhone(addPhoneInput) : addPendingMemberByPhone(addPhoneInput); } }}
                      placeholder="Add by phone number"
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      disabled={addingMember || !addPhoneInput.trim()}
                      onClick={() => editingGroup ? addMemberByPhone(addPhoneInput) : addPendingMemberByPhone(addPhoneInput)}
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
                      onChange={(e) => { setMemberSearchQuery(e.target.value); ensureCustomersLoaded(); }}
                      placeholder="Search customers by name or phone..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {memberSearchQuery.length >= 2 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '160px', overflowY: 'auto', zIndex: 10, marginTop: '4px' }}>
                        {customersList
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
                              onClick={() => editingGroup ? addMemberToGroup(c) : addPendingMember(c)}
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
                        {customersList.filter(c => {
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
                            onClick={() => editingGroup ? removeMemberFromGroup(member) : setGroupMembers(prev => prev.filter(m => m.id !== member.id))}
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowGroupModal(false)}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={groupSaving || !groupForm.name?.trim()}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', opacity: groupSaving || !groupForm.name?.trim() ? 0.6 : 1 }}>
                  {groupSaving ? 'Saving...' : (editingGroup ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersManagement;
