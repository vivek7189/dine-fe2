'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../../../lib/api';
import ImageUpload from '../../../../components/ImageUpload';
import BulkMenuUpload from '../../../../components/BulkMenuUpload';
import {
  FaUtensils, FaPlus, FaEdit, FaTrash, FaLock, FaUnlock,
  FaSync, FaUpload, FaArrowLeft, FaSpinner, FaCheck,
  FaLeaf, FaDownload, FaTh, FaList, FaSearch,
  FaCloudUploadAlt, FaEye, FaTimes, FaChevronDown
} from 'react-icons/fa';

// ============================================
// CENTRAL MENU TAB - Menu Template Management
// Manage, push & sync menus across outlets
// ============================================

const CentralMenuTab = ({ orgData, outlets, formatCurrency }) => {
  // View state
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'create'
  const [isMobile, setIsMobile] = useState(false);

  // Template list state
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);

  // Template detail state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateDetail, setTemplateDetail] = useState(null);
  const [templateItems, setTemplateItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Create/edit template form
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Edit template name inline
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Add/edit item modal
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [savingItem, setSavingItem] = useState(false);

  // Rich form data
  const defaultFormData = {
    name: '', shortCode: '', description: '', basePrice: '', category: '',
    isVeg: true, images: [], tempImages: [],
    variants: [], customizations: [],
    dineInPrice: '', takeawayPrice: '', deliveryPrice: '',
    isStockManaged: false, stockQuantity: '', lowStockThreshold: '5',
  };
  const [formData, setFormData] = useState({ ...defaultFormData });

  // Import from outlet
  const [showImportModal, setShowImportModal] = useState(false);
  const [importOutletId, setImportOutletId] = useState('');
  const [importing, setImporting] = useState(false);

  // Push to outlets
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushOutletIds, setPushOutletIds] = useState([]);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [pushing, setPushing] = useState(false);

  // Sync
  const [syncing, setSyncing] = useState(false);

  // Sync status
  const [syncStatus, setSyncStatus] = useState([]);
  const [loadingSyncStatus, setLoadingSyncStatus] = useState(false);

  // Deleting item
  const [deletingItemId, setDeletingItemId] = useState(null);

  // Toggling lock
  const [togglingLockId, setTogglingLockId] = useState(null);

  // Success/error messages
  const [message, setMessage] = useState(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVeg, setFilterVeg] = useState('all'); // 'all' | 'veg' | 'nonveg'
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Item detail modal
  const [detailItem, setDetailItem] = useState(null);

  // Responsive detection
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!orgData?.id) return;
    setLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const res = await apiClient.getMenuTemplates(orgData.id);
      if (res.success) {
        setTemplates(res.templates || []);
      } else {
        setTemplatesError('Failed to load menu templates');
      }
    } catch (err) {
      setTemplatesError(err.message || 'Failed to load menu templates');
    } finally {
      setLoadingTemplates(false);
    }
  }, [orgData?.id]);

  // Load sync status
  const loadSyncStatus = useCallback(async () => {
    if (!orgData?.id) return;
    setLoadingSyncStatus(true);
    try {
      const res = await apiClient.getMenuSyncStatus(orgData.id);
      if (res.success !== false) {
        setSyncStatus(Array.isArray(res) ? res : (res.outlets || res.data || []));
      }
    } catch (err) {
      // Silently fail sync status
    } finally {
      setLoadingSyncStatus(false);
    }
  }, [orgData?.id]);

  useEffect(() => {
    loadTemplates();
    loadSyncStatus();
  }, [loadTemplates, loadSyncStatus]);

  // Load template detail
  const loadTemplateDetail = useCallback(async (templateId) => {
    if (!orgData?.id || !templateId) return;
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await apiClient.getMenuTemplate(orgData.id, templateId);
      setTemplateDetail(res.template || null);
      setTemplateItems(res.items || []);
    } catch (err) {
      setDetailError(err.message || 'Failed to load template details');
    } finally {
      setLoadingDetail(false);
    }
  }, [orgData?.id]);

  // Navigate to detail
  const openTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setView('detail');
    loadTemplateDetail(templateId);
  };

  // Back to list
  const backToList = () => {
    setView('list');
    setSelectedTemplateId(null);
    setTemplateDetail(null);
    setTemplateItems([]);
    setShowAddItem(false);
    setEditingItemId(null);
    setEditingName(false);
    setSearchTerm('');
    setFilterVeg('all');
    setFilterCategory('all');
    loadTemplates();
    loadSyncStatus();
  };

  // Create template
  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim()) {
      setMessage({ type: 'error', text: 'Template name is required' });
      return;
    }
    setSavingTemplate(true);
    try {
      const res = await apiClient.createMenuTemplate(orgData.id, {
        name: templateForm.name.trim(),
        description: templateForm.description.trim()
      });
      if (res.success || res.template) {
        setMessage({ type: 'success', text: 'Template created successfully' });
        setTemplateForm({ name: '', description: '' });
        setView('list');
        loadTemplates();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create template' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create template' });
    } finally {
      setSavingTemplate(false);
    }
  };

  // Update template name
  const handleUpdateTemplateName = async () => {
    if (!editNameValue.trim()) return;
    try {
      await apiClient.updateMenuTemplate(orgData.id, selectedTemplateId, { name: editNameValue.trim() });
      setTemplateDetail(prev => ({ ...prev, name: editNameValue.trim() }));
      setEditingName(false);
      setMessage({ type: 'success', text: 'Template name updated' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update name' });
    }
  };

  // Import from outlet
  const handleImportFromOutlet = async () => {
    if (!importOutletId) {
      setMessage({ type: 'error', text: 'Please select an outlet' });
      return;
    }
    setImporting(true);
    try {
      const res = await apiClient.importMenuFromOutlet(orgData.id, importOutletId);
      if (res.success || res.template) {
        setMessage({ type: 'success', text: `Menu imported successfully (${res.itemCount || 0} items)` });
        setShowImportModal(false);
        setImportOutletId('');
        loadTemplates();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to import menu' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to import menu' });
    } finally {
      setImporting(false);
    }
  };

  // Add/edit item
  const handleSaveItem = async () => {
    if (!formData.name.trim() || !formData.category.trim() || !formData.basePrice) {
      setMessage({ type: 'error', text: 'Name, category and price are required' });
      return;
    }
    setSavingItem(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        basePrice: parseFloat(formData.basePrice),
        isVeg: formData.isVeg,
        description: formData.description.trim(),
        shortCode: formData.shortCode.trim(),
        images: formData.images || [],
        variants: formData.variants.filter(v => v.name.trim()),
        customizations: formData.customizations.filter(c => c.name.trim()),
        dineInPrice: formData.dineInPrice ? parseFloat(formData.dineInPrice) : null,
        takeawayPrice: formData.takeawayPrice ? parseFloat(formData.takeawayPrice) : null,
        deliveryPrice: formData.deliveryPrice ? parseFloat(formData.deliveryPrice) : null,
        isStockManaged: formData.isStockManaged,
        stockQuantity: formData.isStockManaged && formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
        lowStockThreshold: formData.isStockManaged && formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : 5,
      };

      if (editingItemId) {
        await apiClient.updateMenuTemplateItem(orgData.id, selectedTemplateId, editingItemId, payload);
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        await apiClient.addMenuTemplateItem(orgData.id, selectedTemplateId, payload);
        setMessage({ type: 'success', text: 'Item added successfully' });
      }

      setFormData({ ...defaultFormData });
      setShowAddItem(false);
      setEditingItemId(null);
      loadTemplateDetail(selectedTemplateId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save item' });
    } finally {
      setSavingItem(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeletingItemId(itemId);
    try {
      await apiClient.deleteMenuTemplateItem(orgData.id, selectedTemplateId, itemId);
      setMessage({ type: 'success', text: 'Item deleted' });
      loadTemplateDetail(selectedTemplateId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete item' });
    } finally {
      setDeletingItemId(null);
    }
  };

  // Toggle item lock
  const handleToggleLock = async (item) => {
    setTogglingLockId(item.id);
    try {
      await apiClient.toggleMenuItemLock(orgData.id, item.id, { locked: !item.isLocked });
      setTemplateItems(prev => prev.map(i => i.id === item.id ? { ...i, isLocked: !i.isLocked } : i));
      setMessage({ type: 'success', text: item.isLocked ? 'Item unlocked' : 'Item locked' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle lock' });
    } finally {
      setTogglingLockId(null);
    }
  };

  // Push to outlets
  const handlePush = async () => {
    if (pushOutletIds.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one outlet' });
      return;
    }
    setPushing(true);
    try {
      const res = await apiClient.pushMenuTemplate(orgData.id, selectedTemplateId, {
        outletIds: pushOutletIds,
        overwriteExisting
      });
      if (res.success !== false) {
        setMessage({ type: 'success', text: `Menu pushed to ${pushOutletIds.length} outlet(s)` });
        setShowPushModal(false);
        setPushOutletIds([]);
        setOverwriteExisting(false);
        loadTemplateDetail(selectedTemplateId);
        loadSyncStatus();
      } else {
        setMessage({ type: 'error', text: res.message || 'Push failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to push menu' });
    } finally {
      setPushing(false);
    }
  };

  // Sync template
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiClient.syncMenuTemplate(orgData.id, selectedTemplateId);
      if (res.success !== false) {
        setMessage({ type: 'success', text: 'Menu synced successfully' });
        loadTemplateDetail(selectedTemplateId);
        loadSyncStatus();
      } else {
        setMessage({ type: 'error', text: res.message || 'Sync failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to sync menu' });
    } finally {
      setSyncing(false);
    }
  };

  // Toggle push outlet selection
  const togglePushOutlet = (outletId) => {
    setPushOutletIds(prev =>
      prev.includes(outletId) ? prev.filter(id => id !== outletId) : [...prev, outletId]
    );
  };

  // Start editing an item — populate all formData fields
  const startEditItem = (item) => {
    setFormData({
      name: item.name || '',
      shortCode: item.shortCode || '',
      description: item.description || '',
      basePrice: item.basePrice?.toString() || '',
      category: item.category || '',
      isVeg: item.isVeg !== false,
      images: item.images || (item.image ? [item.image] : []),
      tempImages: [],
      variants: item.variants && item.variants.length > 0
        ? item.variants.map(v => ({ name: v.name || '', price: v.price?.toString() || '' }))
        : [],
      customizations: item.customizations && item.customizations.length > 0
        ? item.customizations.map(c => ({ name: c.name || '', price: c.price?.toString() || '' }))
        : [],
      dineInPrice: item.dineInPrice?.toString() || '',
      takeawayPrice: item.takeawayPrice?.toString() || '',
      deliveryPrice: item.deliveryPrice?.toString() || '',
      isStockManaged: item.isStockManaged || false,
      stockQuantity: item.stockQuantity?.toString() || '',
      lowStockThreshold: item.lowStockThreshold?.toString() || '5',
    });
    setEditingItemId(item.id);
    setShowAddItem(true);
  };

  // All outlets flattened
  const allOutlets = [
    ...(outlets?.outlet || []),
    ...(outlets?.central_kitchen || []),
    ...(outlets?.warehouse || [])
  ];

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = [...templateItems];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i =>
        i.name?.toLowerCase().includes(term) ||
        i.shortCode?.toLowerCase().includes(term) ||
        i.category?.toLowerCase().includes(term)
      );
    }
    if (filterVeg === 'veg') items = items.filter(i => i.isVeg !== false);
    if (filterVeg === 'nonveg') items = items.filter(i => i.isVeg === false);
    if (filterCategory !== 'all') items = items.filter(i => i.category === filterCategory);
    return items;
  }, [templateItems, searchTerm, filterVeg, filterCategory]);

  // Unique categories from items
  const categories = useMemo(() => {
    const cats = new Set();
    templateItems.forEach(i => { if (i.category) cats.add(i.category); });
    return Array.from(cats).sort();
  }, [templateItems]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const fmtPrice = (val) => {
    if (formatCurrency) return formatCurrency(val);
    return `${val}`;
  };

  // ---- STYLES ----
  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    },
    cardHover: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: 'translateY(0)'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    primaryButton: { backgroundColor: '#16a34a', color: 'white' },
    secondaryButton: { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
    dangerButton: { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    ghostButton: { backgroundColor: 'transparent', color: '#64748b', padding: '8px 12px' },
    input: {
      width: '100%', padding: '10px 14px', borderRadius: '10px',
      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
      transition: 'border-color 0.2s', boxSizing: 'border-box'
    },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
    },
    vegDot: (isVeg) => ({
      width: '10px', height: '10px', borderRadius: '50%',
      backgroundColor: isVeg ? '#16a34a' : '#dc2626', flexShrink: 0
    }),
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    },
    modal: {
      backgroundColor: 'white', borderRadius: '16px', width: '100%',
      maxWidth: '500px', maxHeight: '80vh', overflow: 'auto', padding: '24px'
    }
  };

  // ---- MESSAGE TOAST ----
  const renderMessage = () => {
    if (!message) return null;
    return (
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 2000,
        padding: '14px 20px', borderRadius: '12px',
        backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
        color: message.type === 'success' ? '#16a34a' : '#dc2626',
        border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '14px', fontWeight: '600', animation: 'slideInRight 0.3s ease'
      }}>
        {message.type === 'success' ? <FaCheck /> : <FaUtensils />}
        {message.text}
      </div>
    );
  };

  // ---- LOADING SKELETON ----
  const renderSkeleton = (count = 4) => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...styles.card, padding: '24px' }}>
          <div style={{ height: '20px', width: '60%', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '14px', width: '40%', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '14px', width: '30%', backgroundColor: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ))}
    </div>
  );

  // ---- CREATE TEMPLATE VIEW ----
  const renderCreateForm = () => (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('list')} style={{ ...styles.button, ...styles.ghostButton }}><FaArrowLeft /></button>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Create Menu Template</h3>
      </div>
      <div style={{ ...styles.card, padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>Template Name *</label>
          <input type="text" value={templateForm.name} onChange={e => setTemplateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Standard Menu, Weekend Special" style={styles.input} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={styles.label}>Description</label>
          <textarea value={templateForm.description} onChange={e => setTemplateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description for this template" rows={3} style={{ ...styles.input, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCreateTemplate} disabled={savingTemplate} style={{ ...styles.button, ...styles.primaryButton, opacity: savingTemplate ? 0.6 : 1 }}>
            {savingTemplate ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus />}
            {savingTemplate ? 'Creating...' : 'Create Template'}
          </button>
          <button onClick={() => setView('list')} style={{ ...styles.button, ...styles.ghostButton }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ---- IMPORT MODAL ----
  const renderImportModal = () => {
    if (!showImportModal) return null;
    return (
      <div style={styles.overlay} onClick={() => !importing && setShowImportModal(false)}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginTop: 0, marginBottom: '20px' }}>
            <FaDownload style={{ marginRight: '8px', color: '#16a34a' }} />Import Menu from Outlet
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Select Outlet</label>
            <select value={importOutletId} onChange={e => setImportOutletId(e.target.value)} style={{ ...styles.input, cursor: 'pointer' }}>
              <option value="">-- Choose an outlet --</option>
              {allOutlets.map(o => (
                <option key={o._id || o.id} value={o._id || o.id}>{o.restaurantName || o.name}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>This will create a new template from the selected outlet&apos;s current menu.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowImportModal(false); setImportOutletId(''); }} disabled={importing} style={{ ...styles.button, ...styles.ghostButton }}>Cancel</button>
            <button onClick={handleImportFromOutlet} disabled={importing || !importOutletId} style={{ ...styles.button, ...styles.primaryButton, opacity: (importing || !importOutletId) ? 0.6 : 1 }}>
              {importing ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaDownload />}
              {importing ? 'Importing...' : 'Import Menu'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- PUSH MODAL ----
  const renderPushModal = () => {
    if (!showPushModal) return null;
    return (
      <div style={styles.overlay} onClick={() => !pushing && setShowPushModal(false)}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginTop: 0, marginBottom: '20px' }}>
            <FaUpload style={{ marginRight: '8px', color: '#16a34a' }} />Push Menu to Outlets
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Select Outlets</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px' }}>
              {allOutlets.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9ca3af', padding: '12px', textAlign: 'center', margin: 0 }}>No outlets available</p>
              ) : allOutlets.map(o => {
                const oid = o._id || o.id;
                const isSelected = pushOutletIds.includes(oid);
                return (
                  <label key={oid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: isSelected ? '#f0fdf4' : 'transparent', transition: 'background-color 0.2s' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => togglePushOutlet(oid)} style={{ width: '16px', height: '16px', accentColor: '#16a34a' }} />
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: isSelected ? '600' : '400' }}>{o.restaurantName || o.name}</span>
                  </label>
                );
              })}
            </div>
            {pushOutletIds.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px', fontWeight: '600' }}>{pushOutletIds.length} outlet(s) selected</p>}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: overwriteExisting ? '#fef3c7' : '#f9fafb', border: `1px solid ${overwriteExisting ? '#fbbf24' : '#e5e7eb'}`, cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" checked={overwriteExisting} onChange={e => setOverwriteExisting(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#f59e0b' }} />
            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Overwrite existing items</span>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>Replace matching items in the outlet&apos;s menu</p>
            </div>
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowPushModal(false); setPushOutletIds([]); setOverwriteExisting(false); }} disabled={pushing} style={{ ...styles.button, ...styles.ghostButton }}>Cancel</button>
            <button onClick={handlePush} disabled={pushing || pushOutletIds.length === 0} style={{ ...styles.button, ...styles.primaryButton, opacity: (pushing || pushOutletIds.length === 0) ? 0.6 : 1 }}>
              {pushing ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaUpload />}
              {pushing ? 'Pushing...' : 'Push Menu'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- ADD/EDIT ITEM MODAL (RICH FORM) ----
  const renderItemModal = () => {
    if (!showAddItem) return null;
    return (
      <div style={{ ...styles.overlay, alignItems: 'flex-start', paddingTop: '40px' }} onClick={() => { setShowAddItem(false); setEditingItemId(null); setFormData({ ...defaultFormData }); }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '85vh', overflow: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>
              {editingItemId ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button onClick={() => { setShowAddItem(false); setEditingItemId(null); setFormData({ ...defaultFormData }); }} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTimes />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div>
              {/* Name + Short Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.label}>Item Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Paneer Tikka" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Short Code</label>
                  <input type="text" value={formData.shortCode} onChange={e => setFormData(prev => ({ ...prev, shortCode: e.target.value.toUpperCase() }))} placeholder="e.g. PT" style={styles.input} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe this dish..." rows={2} style={{ ...styles.input, resize: 'vertical' }} />
              </div>

              {/* Price */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Base Price *</label>
                <input type="number" value={formData.basePrice} onChange={e => setFormData(prev => ({ ...prev, basePrice: e.target.value }))} placeholder="0.00" min="0" step="0.01" style={styles.input} />
              </div>

              {/* Channel Prices */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Channel Prices (optional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Dine-In</div>
                    <input type="number" value={formData.dineInPrice} onChange={e => setFormData(prev => ({ ...prev, dineInPrice: e.target.value }))} placeholder="₹0" min="0" style={{ ...styles.input, padding: '8px 10px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Takeaway</div>
                    <input type="number" value={formData.takeawayPrice} onChange={e => setFormData(prev => ({ ...prev, takeawayPrice: e.target.value }))} placeholder="₹0" min="0" style={{ ...styles.input, padding: '8px 10px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Delivery</div>
                    <input type="number" value={formData.deliveryPrice} onChange={e => setFormData(prev => ({ ...prev, deliveryPrice: e.target.value }))} placeholder="₹0" min="0" style={{ ...styles.input, padding: '8px 10px', fontSize: '13px' }} />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Empty channels use base price</p>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Category *</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Starters" list="category-options" style={styles.input} />
                  <datalist id="category-options">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Stock Tracking */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: formData.isStockManaged ? '#f0fdf4' : '#f9fafb', border: `1px solid ${formData.isStockManaged ? '#bbf7d0' : '#e5e7eb'}`, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isStockManaged} onChange={e => setFormData(prev => ({ ...prev, isStockManaged: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#16a34a' }} />
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Track Stock Count</span>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>Synced with Inventory — auto-deducts on orders</p>
                  </div>
                </label>
                {formData.isStockManaged && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                      <label style={{ ...styles.label, fontSize: '12px' }}>Stock Quantity</label>
                      <input type="number" value={formData.stockQuantity} onChange={e => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))} placeholder="0" min="0" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ ...styles.label, fontSize: '12px' }}>Low Stock Alert</label>
                      <input type="number" value={formData.lowStockThreshold} onChange={e => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))} placeholder="5" min="0" style={styles.input} />
                    </div>
                  </div>
                )}
              </div>

              {/* Veg / Non-Veg */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[true, false].map(isVeg => (
                    <label key={isVeg ? 'veg' : 'nonveg'} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                      padding: '8px 16px', borderRadius: '8px',
                      backgroundColor: formData.isVeg === isVeg ? (isVeg ? '#f0fdf4' : '#fef2f2') : '#f9fafb',
                      border: `1px solid ${formData.isVeg === isVeg ? (isVeg ? '#16a34a' : '#dc2626') : '#e5e7eb'}`,
                      fontWeight: formData.isVeg === isVeg ? '600' : '400'
                    }}>
                      <input type="radio" checked={formData.isVeg === isVeg} onChange={() => setFormData(prev => ({ ...prev, isVeg }))} style={{ accentColor: isVeg ? '#16a34a' : '#dc2626' }} />
                      <span style={styles.vegDot(isVeg)} />
                      <span style={{ fontSize: '13px' }}>{isVeg ? 'Veg' : 'Non-Veg'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Dish Images (Max 4)</label>
                <ImageUpload
                  existingImages={formData.images || []}
                  maxImages={4}
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))}
                  onImageDeleted={(index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                />
              </div>

              {/* Variants */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Variants</label>
                  <button onClick={() => setFormData(prev => ({ ...prev, variants: [...prev.variants, { name: '', price: '' }] }))} style={{ ...styles.button, ...styles.secondaryButton, padding: '4px 10px', fontSize: '12px' }}>
                    <FaPlus style={{ fontSize: '10px' }} /> Add
                  </button>
                </div>
                {formData.variants.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>Add size variants like Half, Full, Family</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.variants.map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" value={v.name} onChange={e => { const nv = [...formData.variants]; nv[idx] = { ...nv[idx], name: e.target.value }; setFormData(prev => ({ ...prev, variants: nv })); }} placeholder="e.g. Half" style={{ ...styles.input, flex: 1, padding: '8px 10px', fontSize: '13px' }} />
                        <input type="number" value={v.price} onChange={e => { const nv = [...formData.variants]; nv[idx] = { ...nv[idx], price: e.target.value }; setFormData(prev => ({ ...prev, variants: nv })); }} placeholder="₹0" min="0" style={{ ...styles.input, width: '80px', padding: '8px 10px', fontSize: '13px' }} />
                        <button onClick={() => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }))} style={{ backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}><FaTrash style={{ fontSize: '12px' }} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customizations */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Customizations</label>
                  <button onClick={() => setFormData(prev => ({ ...prev, customizations: [...prev.customizations, { name: '', price: '' }] }))} style={{ ...styles.button, ...styles.secondaryButton, padding: '4px 10px', fontSize: '12px' }}>
                    <FaPlus style={{ fontSize: '10px' }} /> Add
                  </button>
                </div>
                {formData.customizations.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>Add toppings or add-ons like Extra Cheese, Butter</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.customizations.map((c, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" value={c.name} onChange={e => { const nc = [...formData.customizations]; nc[idx] = { ...nc[idx], name: e.target.value }; setFormData(prev => ({ ...prev, customizations: nc })); }} placeholder="e.g. Extra Cheese" style={{ ...styles.input, flex: 1, padding: '8px 10px', fontSize: '13px' }} />
                        <input type="number" value={c.price} onChange={e => { const nc = [...formData.customizations]; nc[idx] = { ...nc[idx], price: e.target.value }; setFormData(prev => ({ ...prev, customizations: nc })); }} placeholder="₹0" min="0" style={{ ...styles.input, width: '80px', padding: '8px 10px', fontSize: '13px' }} />
                        <button onClick={() => setFormData(prev => ({ ...prev, customizations: prev.customizations.filter((_, i) => i !== idx) }))} style={{ backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}><FaTrash style={{ fontSize: '12px' }} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end', backgroundColor: '#fafafa' }}>
            <button onClick={() => { setShowAddItem(false); setEditingItemId(null); setFormData({ ...defaultFormData }); }} style={{ ...styles.button, ...styles.ghostButton }}>Cancel</button>
            <button onClick={handleSaveItem} disabled={savingItem} style={{ ...styles.button, ...styles.primaryButton, opacity: savingItem ? 0.6 : 1 }}>
              {savingItem ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck />}
              {savingItem ? 'Saving...' : (editingItemId ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- ITEM DETAIL MODAL ----
  const renderItemDetail = () => {
    if (!detailItem) return null;
    const item = detailItem;
    return (
      <div style={styles.overlay} onClick={() => setDetailItem(null)}>
        <div style={{ ...styles.modal, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={styles.vegDot(item.isVeg !== false)} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{item.name}</h3>
              {item.shortCode && <span style={{ ...styles.badge, backgroundColor: '#f1f5f9', color: '#64748b' }}>{item.shortCode}</span>}
            </div>
            <button onClick={() => setDetailItem(null)} style={{ backgroundColor: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}><FaTimes /></button>
          </div>

          {item.description && <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{item.description}</p>}

          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
              {item.images.map((img, i) => (
                <img key={i} src={img} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          )}

          {/* Prices */}
          <div style={{ ...styles.card, padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div><div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>BASE PRICE</div><div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>{fmtPrice(item.basePrice)}</div></div>
              {item.dineInPrice && <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Dine-In</div><div style={{ fontSize: '16px', fontWeight: '600' }}>{fmtPrice(item.dineInPrice)}</div></div>}
              {item.takeawayPrice && <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Takeaway</div><div style={{ fontSize: '16px', fontWeight: '600' }}>{fmtPrice(item.takeawayPrice)}</div></div>}
              {item.deliveryPrice && <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Delivery</div><div style={{ fontSize: '16px', fontWeight: '600' }}>{fmtPrice(item.deliveryPrice)}</div></div>}
            </div>
          </div>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Variants</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.variants.map((v, i) => (
                  <span key={i} style={{ ...styles.badge, backgroundColor: '#f0fdf4', color: '#16a34a' }}>{v.name} — {fmtPrice(v.price)}</span>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          {item.customizations && item.customizations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Customizations</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.customizations.map((c, i) => (
                  <span key={i} style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#d97706' }}>+{c.name} — {fmtPrice(c.price)}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => { setDetailItem(null); startEditItem(item); }} style={{ ...styles.button, ...styles.secondaryButton }}><FaEdit /> Edit</button>
            <button onClick={() => { setDetailItem(null); handleDeleteItem(item.id); }} style={{ ...styles.button, ...styles.dangerButton }}><FaTrash /> Delete</button>
          </div>
        </div>
      </div>
    );
  };

  // ---- SYNC STATUS PANEL ----
  const renderSyncStatus = () => {
    if (syncStatus.length === 0 && !loadingSyncStatus) return null;
    return (
      <div style={{ ...styles.card, padding: '20px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginTop: 0, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSync style={{ color: '#16a34a' }} /> Sync Status
          {loadingSyncStatus && <FaSpinner style={{ animation: 'spin 1s linear infinite', color: '#9ca3af', fontSize: '12px' }} />}
        </h4>
        {loadingSyncStatus && syncStatus.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading sync status...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: '600' }}>Outlet</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#6b7280', fontWeight: '600' }}>Synced</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#6b7280', fontWeight: '600' }}>Overridden</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#6b7280', fontWeight: '600' }}>Missing</th>
                </tr>
              </thead>
              <tbody>
                {syncStatus.map((s, idx) => (
                  <tr key={s.outletId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '500', color: '#374151' }}>{s.restaurantName || s.outletName || s.name || 'Unknown'}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <span style={{ ...styles.badge, backgroundColor: '#f0fdf4', color: '#16a34a' }}>{s.syncedCount ?? s.synced ?? 0}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <span style={{ ...styles.badge, backgroundColor: (s.overriddenCount || s.overridden) > 0 ? '#fef3c7' : '#f9fafb', color: (s.overriddenCount || s.overridden) > 0 ? '#d97706' : '#9ca3af' }}>{s.overriddenCount ?? s.overridden ?? 0}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <span style={{ ...styles.badge, backgroundColor: (s.missingCount || s.missing) > 0 ? '#fef2f2' : '#f9fafb', color: (s.missingCount || s.missing) > 0 ? '#dc2626' : '#9ca3af' }}>{s.missingCount ?? s.missing ?? 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ---- ITEMS TOOLBAR ----
  const renderItemsToolbar = () => (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '20px', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap' }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: isMobile ? undefined : '0 0 240px' }}>
        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }} />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search items, codes..." style={{ ...styles.input, paddingLeft: '36px' }} />
      </div>

      {/* Veg/Non-Veg Filter */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
        {[{ key: 'all', label: 'All' }, { key: 'veg', label: 'Veg' }, { key: 'nonveg', label: 'Non-Veg' }].map(f => (
          <button key={f.key} onClick={() => setFilterVeg(f.key)} style={{
            padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: '600',
            backgroundColor: filterVeg === f.key ? 'white' : 'transparent',
            color: filterVeg === f.key ? '#111827' : '#6b7280',
            boxShadow: filterVeg === f.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...styles.input, width: 'auto', minWidth: '140px', cursor: 'pointer', padding: '8px 12px' }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
        {[{ key: 'grid', icon: <FaTh /> }, { key: 'list', icon: <FaList /> }].map(v => (
          <button key={v.key} onClick={() => setViewMode(v.key)} style={{
            padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: viewMode === v.key ? 'white' : 'transparent',
            color: viewMode === v.key ? '#111827' : '#6b7280',
            boxShadow: viewMode === v.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex', alignItems: 'center',
          }}>{v.icon}</button>
        ))}
      </div>
    </div>
  );

  // ---- GRID VIEW CARD ----
  const renderGridCard = (item) => {
    const img = (item.images && item.images.length > 0) ? item.images[0] : item.image;
    return (
      <div key={item.id} style={{ ...styles.card, overflow: 'hidden', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
        {/* Image */}
        <div style={{ position: 'relative', height: '160px', backgroundColor: '#f1f5f9', cursor: 'pointer' }} onClick={() => setDetailItem(item)}>
          {img ? (
            <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUtensils style={{ fontSize: '32px', color: '#d1d5db' }} />
            </div>
          )}
          {/* Veg/Non-Veg Badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${item.isVeg !== false ? '#16a34a' : '#dc2626'}`, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.isVeg !== false ? '#16a34a' : '#dc2626' }} />
            </div>
          </div>
          {/* Short Code */}
          {item.shortCode && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', ...styles.badge, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px' }}>
              {item.shortCode}
            </div>
          )}
          {/* Lock indicator */}
          {item.isLocked && (
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', ...styles.badge, backgroundColor: '#fef3c7', color: '#d97706' }}>
              <FaLock style={{ fontSize: '10px' }} /> Locked
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0, flex: 1, lineHeight: '1.3' }}>{item.name}</h4>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a', whiteSpace: 'nowrap', marginLeft: '8px' }}>{fmtPrice(item.basePrice)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ ...styles.badge, backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 8px' }}>{item.category}</span>
            {item.variants && item.variants.length > 0 && (
              <span style={{ ...styles.badge, backgroundColor: '#ede9fe', color: '#7c3aed', fontSize: '11px', padding: '2px 8px' }}>{item.variants.length} variants</span>
            )}
            {item.customizations && item.customizations.length > 0 && (
              <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#d97706', fontSize: '11px', padding: '2px 8px' }}>{item.customizations.length} add-ons</span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button onClick={() => setDetailItem(item)} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 10px', fontSize: '13px', color: '#6b7280' }} title="View details"><FaEye /></button>
            <button onClick={() => startEditItem(item)} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 10px', fontSize: '13px', color: '#3b82f6' }} title="Edit item"><FaEdit /></button>
            <button onClick={() => handleToggleLock(item)} disabled={togglingLockId === item.id} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 10px', fontSize: '13px', color: item.isLocked ? '#d97706' : '#9ca3af' }} title={item.isLocked ? 'Unlock' : 'Lock'}>
              {togglingLockId === item.id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (item.isLocked ? <FaLock /> : <FaUnlock />)}
            </button>
            <button onClick={() => handleDeleteItem(item.id)} disabled={deletingItemId === item.id} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 10px', fontSize: '13px', color: '#dc2626', opacity: deletingItemId === item.id ? 0.5 : 1 }} title="Delete item">
              {deletingItemId === item.id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- LIST VIEW ----
  const renderListView = () => (
    <div style={{ ...styles.card, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>#</th>
              {!isMobile && <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>IMAGE</th>}
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>ITEM</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>CATEGORY</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>PRICE</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => {
              const img = (item.images && item.images.length > 0) ? item.images[0] : item.image;
              return (
                <tr key={item.id || idx} style={{ borderTop: '1px solid #f1f5f9', transition: 'background-color 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setDetailItem(item)}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={styles.vegDot(item.isVeg !== false)} />
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{idx + 1}</span>
                    </div>
                  </td>
                  {!isMobile && (
                    <td style={{ padding: '10px 16px' }}>
                      {img ? (
                        <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaUtensils style={{ fontSize: '14px', color: '#d1d5db' }} />
                        </div>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{item.name}</div>
                    {item.shortCode && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{item.shortCode}</span>}
                    {item.variants && item.variants.length > 0 && <span style={{ fontSize: '11px', color: '#7c3aed', marginLeft: '6px' }}>{item.variants.length} var</span>}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{item.category}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>{fmtPrice(item.basePrice)}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); handleToggleLock(item); }}>
                    <span style={{ ...styles.badge, backgroundColor: item.isLocked ? '#fef3c7' : '#f9fafb', color: item.isLocked ? '#d97706' : '#9ca3af', cursor: 'pointer' }}>
                      {item.isLocked ? <><FaLock style={{ fontSize: '10px' }} /> Locked</> : <><FaUnlock style={{ fontSize: '10px' }} /> Open</>}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button onClick={() => startEditItem(item)} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 8px', fontSize: '12px', color: '#3b82f6' }}><FaEdit /></button>
                      <button onClick={() => handleDeleteItem(item.id)} disabled={deletingItemId === item.id} style={{ ...styles.button, ...styles.ghostButton, padding: '6px 8px', fontSize: '12px', color: '#dc2626' }}>
                        {deletingItemId === item.id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ---- TEMPLATE DETAIL VIEW ----
  const renderDetail = () => {
    if (loadingDetail) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaSpinner style={{ fontSize: '32px', color: '#16a34a', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading template...</p>
        </div>
      );
    }

    if (detailError) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <button onClick={backToList} style={{ ...styles.button, ...styles.ghostButton, marginBottom: '16px' }}><FaArrowLeft /> Back</button>
          <p style={{ color: '#dc2626', fontSize: '14px' }}>{detailError}</p>
          <button onClick={() => loadTemplateDetail(selectedTemplateId)} style={{ ...styles.button, ...styles.secondaryButton, marginTop: '12px' }}>Retry</button>
        </div>
      );
    }

    const template = templateDetail;
    if (!template) return null;

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={backToList} style={{ ...styles.button, ...styles.ghostButton }}><FaArrowLeft /></button>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
              <input type="text" value={editNameValue} onChange={e => setEditNameValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdateTemplateName(); if (e.key === 'Escape') setEditingName(false); }} autoFocus style={{ ...styles.input, maxWidth: '300px' }} />
              <button onClick={handleUpdateTemplateName} style={{ ...styles.button, ...styles.primaryButton, padding: '8px 14px' }}><FaCheck /></button>
            </div>
          ) : (
            <h3 onClick={() => { setEditingName(true); setEditNameValue(template.name || ''); }} style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} title="Click to edit name">
              {template.name || 'Untitled Template'}
              <FaEdit style={{ fontSize: '14px', color: '#9ca3af' }} />
            </h3>
          )}
          {template.status && (
            <span style={{ ...styles.badge, backgroundColor: template.status === 'active' ? '#f0fdf4' : '#f9fafb', color: template.status === 'active' ? '#16a34a' : '#6b7280' }}>{template.status}</span>
          )}
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{templateItems.length} items</span>
        </div>

        {template.description && <p style={{ fontSize: '14px', color: '#6b7280', marginTop: 0, marginBottom: '20px' }}>{template.description}</p>}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => { setShowAddItem(true); setEditingItemId(null); setFormData({ ...defaultFormData }); }} style={{ ...styles.button, ...styles.primaryButton }}>
            <FaPlus /> Add Item
          </button>
          <button onClick={() => setShowBulkUpload(true)} style={{ ...styles.button, backgroundColor: '#ef4444', color: 'white' }}>
            <FaCloudUploadAlt /> AI Upload
          </button>
          <button onClick={() => setShowPushModal(true)} style={{ ...styles.button, ...styles.secondaryButton }}>
            <FaUpload /> Push to Outlets
          </button>
          <button onClick={handleSync} disabled={syncing} style={{ ...styles.button, ...styles.secondaryButton, opacity: syncing ? 0.6 : 1 }}>
            {syncing ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaSync />}
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>

        {/* Items Toolbar (Search, Filter, View Toggle) */}
        {templateItems.length > 0 && renderItemsToolbar()}

        {/* Items Display */}
        {filteredItems.length === 0 && templateItems.length > 0 ? (
          <div style={{ ...styles.card, padding: '48px 20px', textAlign: 'center' }}>
            <FaSearch style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '12px' }} />
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>No items match your search</p>
            <button onClick={() => { setSearchTerm(''); setFilterVeg('all'); setFilterCategory('all'); }} style={{ ...styles.button, ...styles.secondaryButton, marginTop: '12px' }}>Clear Filters</button>
          </div>
        ) : templateItems.length === 0 ? (
          <div style={{ ...styles.card, padding: '48px 20px', textAlign: 'center' }}>
            <FaUtensils style={{ fontSize: '40px', color: '#d1d5db', marginBottom: '12px' }} />
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>No items in this template yet</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Add items manually or use AI Upload to extract from photos/files</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
              <button onClick={() => { setShowAddItem(true); setEditingItemId(null); setFormData({ ...defaultFormData }); }} style={{ ...styles.button, ...styles.primaryButton }}><FaPlus /> Add Item</button>
              <button onClick={() => setShowBulkUpload(true)} style={{ ...styles.button, backgroundColor: '#ef4444', color: 'white' }}><FaCloudUploadAlt /> AI Upload</button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filteredItems.map(item => renderGridCard(item))}
          </div>
        ) : (
          renderListView()
        )}
      </div>
    );
  };

  // ---- TEMPLATE LIST VIEW ----
  const renderList = () => {
    if (loadingTemplates) return renderSkeleton();
    if (templatesError) {
      return (
        <div style={{ ...styles.card, padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontSize: '15px', marginBottom: '12px' }}>{templatesError}</p>
          <button onClick={loadTemplates} style={{ ...styles.button, ...styles.secondaryButton }}><FaSync /> Retry</button>
        </div>
      );
    }
    return (
      <div>
        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => { setView('create'); setTemplateForm({ name: '', description: '' }); }} style={{ ...styles.button, ...styles.primaryButton }}><FaPlus /> Create Template</button>
          <button onClick={() => setShowImportModal(true)} style={{ ...styles.button, ...styles.secondaryButton }}><FaDownload /> Import from Outlet</button>
        </div>

        {/* Sync Status */}
        {renderSyncStatus()}

        {/* Template Grid */}
        {templates.length === 0 ? (
          <div style={{ ...styles.card, padding: '60px 20px', textAlign: 'center' }}>
            <FaUtensils style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>No Menu Templates</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>Create a central menu template to push consistent menus across all your outlets.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setView('create'); setTemplateForm({ name: '', description: '' }); }} style={{ ...styles.button, ...styles.primaryButton }}><FaPlus /> Create Template</button>
              <button onClick={() => setShowImportModal(true)} style={{ ...styles.button, ...styles.secondaryButton }}><FaDownload /> Import from Outlet</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {templates.map(t => (
              <div key={t.id} onClick={() => openTemplate(t.id)} style={{ ...styles.card, ...styles.cardHover, padding: '20px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUtensils style={{ color: '#16a34a', fontSize: '16px' }} />
                  </div>
                  {t.status && <span style={{ ...styles.badge, backgroundColor: t.status === 'active' ? '#f0fdf4' : '#f9fafb', color: t.status === 'active' ? '#16a34a' : '#6b7280', fontSize: '11px' }}>{t.status}</span>}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>{t.name}</h4>
                {t.description && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: t.description ? 0 : '16px' }}>
                  <div><div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{t.itemCount ?? 0}</div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Items</div></div>
                  <div><div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{Array.isArray(t.assignedOutlets) ? t.assignedOutlets.length : (t.assignedOutlets ?? 0)}</div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Outlets</div></div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Last Pushed</div><div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{formatDate(t.lastPushedAt)}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---- MAIN RENDER ----
  return (
    <div>
      {/* CSS Animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Toast Message */}
      {renderMessage()}

      {/* Modals */}
      {renderImportModal()}
      {renderPushModal()}
      {renderItemModal()}
      {renderItemDetail()}

      {/* Bulk Upload Modal */}
      <BulkMenuUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        restaurantId={allOutlets[0]?._id || allOutlets[0]?.id || ''}
        mode="template"
        orgId={orgData?.id}
        templateId={selectedTemplateId}
        onMenuItemsAdded={() => { setShowBulkUpload(false); loadTemplateDetail(selectedTemplateId); }}
        currentMenuItems={templateItems}
      />

      {/* View Router */}
      {view === 'create' && renderCreateForm()}
      {view === 'list' && renderList()}
      {view === 'detail' && renderDetail()}
    </div>
  );
};

export default CentralMenuTab;
