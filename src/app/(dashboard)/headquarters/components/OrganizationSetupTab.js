'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';
import {
  FaBuilding,
  FaCog,
  FaPlus,
  FaTrash,
  FaCheck,
  FaSpinner,
  FaStore,
  FaWarehouse,
  FaUtensils,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

// ============================================
// Organization Setup Tab
// Manages org creation, settings, and outlets
// ============================================

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const ORG_TYPES = [
  { value: 'chain', label: 'Chain' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'group', label: 'Group' }
];

const OUTLET_TYPES = [
  { value: 'outlet', label: 'Outlet', icon: FaStore },
  { value: 'central_kitchen', label: 'Central Kitchen', icon: FaUtensils },
  { value: 'warehouse', label: 'Warehouse', icon: FaWarehouse }
];

const TYPE_COLORS = {
  outlet: { bg: '#dcfce7', text: '#166534' },
  central_kitchen: { bg: '#fef3c7', text: '#92400e' },
  warehouse: { bg: '#dbeafe', text: '#1e40af' }
};

// ------ Inline Toast Component ------
const InlineToast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onDismiss(), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const bgColor = type === 'error' ? '#fef2f2' : '#f0fdf4';
  const borderColor = type === 'error' ? '#fca5a5' : '#86efac';
  const textColor = type === 'error' ? '#991b1b' : '#166534';

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      color: textColor,
      fontSize: '14px',
      marginBottom: '16px',
      fontFamily: FONT_STACK,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {type === 'error' ? '!' : <FaCheck size={12} />}
      <span>{message}</span>
    </div>
  );
};

// ------ Toggle Switch Component ------
const ToggleSwitch = ({ label, description, enabled, onChange, loading }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f3f4f6',
    gap: '16px'
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', fontFamily: FONT_STACK }}>
        {label}
      </div>
      {description && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontFamily: FONT_STACK }}>
          {description}
        </div>
      )}
    </div>
    <button
      onClick={() => !loading && onChange(!enabled)}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.2s'
      }}
      aria-label={`Toggle ${label}`}
    >
      {loading ? (
        <FaSpinner size={22} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />
      ) : enabled ? (
        <FaToggleOn size={28} color="#16a34a" />
      ) : (
        <FaToggleOff size={28} color="#d1d5db" />
      )}
    </button>
  </div>
);

// ------ Outlet Type Badge ------
const TypeBadge = ({ type }) => {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.outlet;
  const typeObj = OUTLET_TYPES.find(t => t.value === type);
  const Icon = typeObj ? typeObj.icon : FaStore;
  const label = typeObj ? typeObj.label : type;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: FONT_STACK
    }}>
      <Icon size={10} />
      {label}
    </span>
  );
};

// ------ Card Wrapper ------
const Card = ({ children, style = {} }) => (
  <div style={{
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    padding: '24px',
    marginBottom: '20px',
    fontFamily: FONT_STACK,
    ...style
  }}>
    {children}
  </div>
);

// ============================================
// CREATE ORGANIZATION FORM
// ============================================
const CreateOrganizationForm = ({ onRefresh }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('chain');
  const [centralizedMenu, setCentralizedMenu] = useState(false);
  const [centralKitchen, setCentralKitchen] = useState(false);
  const [centralWarehouse, setCentralWarehouse] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await apiClient.getOwnerDashboard();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        setToast({ message: 'Failed to load restaurants: ' + (err.message || 'Unknown error'), type: 'error' });
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  const toggleRestaurant = (id) => {
    setSelectedRestaurants(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Organization name is required', type: 'error' });
      return;
    }
    if (selectedRestaurants.length === 0) {
      setToast({ message: 'Select at least one restaurant', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createOrganization({
        name: name.trim(),
        type,
        settings: { centralizedMenu, centralKitchen, centralWarehouse },
        restaurantIds: selectedRestaurants
      });
      setToast({ message: 'Organization created successfully!', type: 'success' });
      onRefresh();
    } catch (err) {
      setToast({ message: 'Failed to create organization: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: FONT_STACK,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    backgroundColor: '#fff'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
    fontFamily: FONT_STACK
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FaBuilding size={20} color="#16a34a" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937', fontFamily: FONT_STACK }}>
          Create Organization
        </h3>
      </div>

      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5', fontFamily: FONT_STACK }}>
        Set up a multi-outlet organization to manage multiple restaurants, central kitchens, and warehouses from one place.
      </p>

      <InlineToast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />

      <form onSubmit={handleSubmit}>
        {/* Name & Type */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={labelStyle}>Organization Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Restaurant Group"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={labelStyle}>Organization Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
              {ORG_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT_STACK }}>
            Features
          </div>
          <ToggleSwitch
            label="Centralized Menu"
            description="Manage one menu across all outlets"
            enabled={centralizedMenu}
            onChange={setCentralizedMenu}
          />
          <ToggleSwitch
            label="Central Kitchen"
            description="Route orders through a central kitchen"
            enabled={centralKitchen}
            onChange={setCentralKitchen}
          />
          <ToggleSwitch
            label="Central Warehouse"
            description="Unified inventory and stock management"
            enabled={centralWarehouse}
            onChange={setCentralWarehouse}
          />
        </div>

        {/* Restaurant Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Select Restaurants to Add</label>
          {loadingRestaurants ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px', justifyContent: 'center', color: '#9ca3af' }}>
              <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '14px', fontFamily: FONT_STACK }}>Loading restaurants...</span>
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px',
              border: '1px dashed #e5e7eb',
              borderRadius: '10px',
              fontFamily: FONT_STACK
            }}>
              No restaurants found. Create a restaurant first.
            </div>
          ) : (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              maxHeight: '240px',
              overflowY: 'auto'
            }}>
              {restaurants.map((r, idx) => {
                const isSelected = selectedRestaurants.includes(r._id || r.id);
                return (
                  <div
                    key={r._id || r.id}
                    onClick={() => toggleRestaurant(r._id || r.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0fdf4' : '#fff',
                      borderBottom: idx < restaurants.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #16a34a' : '2px solid #d1d5db',
                      backgroundColor: isSelected ? '#16a34a' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s'
                    }}>
                      {isSelected && <FaCheck size={10} color="#fff" />}
                    </div>
                    <FaStore size={14} color={isSelected ? '#16a34a' : '#9ca3af'} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#166534' : '#374151',
                      fontFamily: FONT_STACK
                    }}>
                      {r.name || r.restaurantName || 'Unnamed Restaurant'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {selectedRestaurants.length > 0 && (
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px', fontFamily: FONT_STACK }}>
              {selectedRestaurants.length} restaurant{selectedRestaurants.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !name.trim() || selectedRestaurants.length === 0}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: submitting || !name.trim() || selectedRestaurants.length === 0 ? '#d1d5db' : '#16a34a',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting || !name.trim() || selectedRestaurants.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: FONT_STACK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {submitting ? (
            <>
              <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Creating...
            </>
          ) : (
            <>
              <FaBuilding size={14} />
              Create Organization
            </>
          )}
        </button>
      </form>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
};

// ============================================
// OUTLETS CHIP SECTION — Simple chip-based add/remove + type assignment
// ============================================
const OutletsChipSection = ({ orgData, allOutlets, onRefresh, isMobile }) => {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  // Track pending changes: { restaurantId: { selected: bool, type: string } }
  const [pendingState, setPendingState] = useState({});

  // Load all owner restaurants on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getOwnerDashboard();
        setAllRestaurants(data.restaurants || []);
      } catch (e) {
        console.error('Failed to load restaurants:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build current state from allOutlets
  const currentOutletIds = new Set(allOutlets.map(o => o.id));
  const outletTypeMap = {};
  allOutlets.forEach(o => { outletTypeMap[o.id] = o.outletType || 'outlet'; });

  // Effective state (current + pending overrides)
  const isSelected = (id) => {
    if (pendingState[id] !== undefined) return pendingState[id].selected;
    return currentOutletIds.has(id);
  };
  const getType = (id) => {
    if (pendingState[id]?.type) return pendingState[id].type;
    return outletTypeMap[id] || 'outlet';
  };

  const toggleChip = (id) => {
    setPendingState(prev => {
      const wasSelected = prev[id] !== undefined ? prev[id].selected : currentOutletIds.has(id);
      const newSelected = !wasSelected;
      // If reverting to original state, remove from pending
      const originalSelected = currentOutletIds.has(id);
      const originalType = outletTypeMap[id] || 'outlet';
      if (newSelected === originalSelected && (!prev[id]?.type || prev[id].type === originalType)) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { selected: newSelected, type: prev[id]?.type || originalType } };
    });
  };

  const changeType = (id, newType) => {
    setPendingState(prev => {
      const currentSelected = prev[id] !== undefined ? prev[id].selected : currentOutletIds.has(id);
      const originalSelected = currentOutletIds.has(id);
      const originalType = outletTypeMap[id] || 'outlet';
      // If reverting to original state, remove from pending
      if (currentSelected === originalSelected && newType === originalType) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { selected: currentSelected, type: newType } };
    });
  };

  const hasPendingChanges = Object.keys(pendingState).length > 0;

  const handleSave = async () => {
    try {
      setSaving(true);
      const ops = [];

      for (const [restaurantId, state] of Object.entries(pendingState)) {
        const wasInOrg = currentOutletIds.has(restaurantId);

        if (state.selected && !wasInOrg) {
          // Add to org
          ops.push(apiClient.addOutletToOrg(orgData.id, { restaurantId, outletType: state.type || 'outlet' }));
        } else if (!state.selected && wasInOrg) {
          // Remove from org
          ops.push(apiClient.removeOutletFromOrg(orgData.id, restaurantId));
        } else if (state.selected && wasInOrg && state.type && state.type !== (outletTypeMap[restaurantId] || 'outlet')) {
          // Type changed
          ops.push(apiClient.changeOutletType(orgData.id, restaurantId, { outletType: state.type }));
        }
      }

      if (ops.length > 0) {
        const results = await Promise.all(ops);
        // Check if any outlet got auto-pushed with central menu
        const autoPushed = results.filter(r => r?.menuAutoPushed);
        if (autoPushed.length > 0) {
          const tplName = autoPushed[0].templateName || 'Central Menu';
          setToast({ msg: `${ops.length} change${ops.length > 1 ? 's' : ''} saved. Central menu "${tplName}" auto-pushed to ${autoPushed.length} outlet${autoPushed.length > 1 ? 's' : ''}.`, type: 'success' });
        } else {
          setToast({ msg: `${ops.length} change${ops.length > 1 ? 's' : ''} saved`, type: 'success' });
        }
      }

      setPendingState({});
      onRefresh();
    } catch (e) {
      setToast({ msg: e.message || 'Failed to save changes', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => setPendingState({});

  const typeColors = {
    outlet: { bg: '#dbeafe', text: '#1d4ed8', label: 'Outlet' },
    central_kitchen: { bg: '#fef3c7', text: '#92400e', label: 'Kitchen' },
    warehouse: { bg: '#ede9fe', text: '#5b21b6', label: 'Warehouse' },
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaStore size={16} color="#6b7280" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937', fontFamily: FONT_STACK }}>Outlets</h4>
        </div>
        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
          <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '13px', marginTop: '8px', fontFamily: FONT_STACK }}>Loading restaurants...</div>
        </div>
      </Card>
    );
  }

  const selectedCount = allRestaurants.filter(r => isSelected(r._id || r.id)).length;

  return (
    <Card>
      {toast && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '13px', fontWeight: 500, fontFamily: FONT_STACK,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaStore size={16} color="#6b7280" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937', fontFamily: FONT_STACK }}>
            Outlets
          </h4>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#6b7280', backgroundColor: '#f3f4f6',
            padding: '2px 8px', borderRadius: '10px', fontFamily: FONT_STACK
          }}>
            {selectedCount} selected
          </span>
        </div>
        {hasPendingChanges && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDiscard}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff',
                color: '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_STACK,
              }}
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '7px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a',
                color: '#fff', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: FONT_STACK, display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving && <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 14px', fontFamily: FONT_STACK }}>
        Click to select/deselect restaurants. Assign a type, then save.
      </p>

      {/* Chip Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {allRestaurants.map(r => {
          const id = r._id || r.id;
          const selected = isSelected(id);
          const type = getType(id);
          const tc = typeColors[type] || typeColors.outlet;
          const isPending = pendingState[id] !== undefined;

          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: '0',
              borderRadius: '10px', overflow: 'hidden',
              border: selected ? `2px solid ${tc.text}` : '2px solid #e5e7eb',
              backgroundColor: selected ? tc.bg : '#fff',
              transition: 'all 0.15s',
              boxShadow: isPending ? '0 0 0 2px rgba(22,163,74,0.2)' : 'none',
            }}>
              {/* Main chip — click to toggle */}
              <button
                onClick={() => toggleChip(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', border: 'none', backgroundColor: 'transparent',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: FONT_STACK,
                  color: selected ? tc.text : '#6b7280',
                }}
              >
                {selected ? <FaCheck size={10} /> : <FaPlus size={10} />}
                {r.name || r.restaurantName || 'Unnamed'}
              </button>

              {/* Type selector — only for selected */}
              {selected && (
                <select
                  value={type}
                  onChange={e => { e.stopPropagation(); changeType(id, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    padding: '6px 4px 6px 6px', border: 'none', borderLeft: `1px solid ${tc.text}33`,
                    backgroundColor: 'transparent', fontSize: '11px', fontWeight: 600,
                    color: tc.text, cursor: 'pointer', fontFamily: FONT_STACK, outline: 'none',
                    appearance: 'auto',
                  }}
                >
                  <option value="outlet">Outlet</option>
                  <option value="central_kitchen">Kitchen</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              )}
            </div>
          );
        })}
      </div>

      {allRestaurants.length === 0 && (
        <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontFamily: FONT_STACK }}>
          No restaurants found. Create a restaurant first.
        </div>
      )}
    </Card>
  );
};

// ============================================
// ORGANIZATION MANAGEMENT VIEW
// ============================================
const OrganizationManagement = ({ orgData, outlets, onRefresh }) => {
  const [editingName, setEditingName] = useState(false);
  const [orgName, setOrgName] = useState(orgData.name || '');
  const [savingName, setSavingName] = useState(false);
  const [savingSetting, setSavingSetting] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setOrgName(orgData.name || '');
  }, [orgData.name]);

  const allOutlets = [
    ...(outlets.outlet || []).map(o => ({ ...o, outletType: o.outletType || 'outlet' })),
    ...(outlets.central_kitchen || []).map(o => ({ ...o, outletType: o.outletType || 'central_kitchen' })),
    ...(outlets.warehouse || []).map(o => ({ ...o, outletType: o.outletType || 'warehouse' }))
  ];

  const settings = orgData.settings || {};

  const FEATURE_TOGGLES = [
    { key: 'centralizedMenu', label: 'Centralized Menu', description: 'Manage one menu across all outlets' },
    { key: 'centralKitchen', label: 'Central Kitchen', description: 'Route orders through a central kitchen' },
    { key: 'centralWarehouse', label: 'Central Warehouse', description: 'Unified inventory and stock management' },
    { key: 'allowOutletProcurement', label: 'Allow Outlet Procurement', description: 'Let outlets buy directly from external suppliers. When off, outlets can only request via warehouse indents.' },
    { key: 'menuLocking', label: 'Menu Locking', description: 'Prevent outlets from modifying shared menu' },
    { key: 'autoSyncMenu', label: 'Auto Sync Menu', description: 'Automatically push menu changes to all outlets' }
  ];

  // ------ Save org name ------
  const handleSaveName = async () => {
    if (!orgName.trim() || orgName.trim() === orgData.name) {
      setEditingName(false);
      setOrgName(orgData.name || '');
      return;
    }
    try {
      setSavingName(true);
      await apiClient.updateOrganization(orgData.id, { name: orgName.trim() });
      setToast({ message: 'Organization name updated', type: 'success' });
      setEditingName(false);
      onRefresh();
    } catch (err) {
      setToast({ message: 'Failed to update name: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  // ------ Toggle setting ------
  const handleToggleSetting = async (key, value) => {
    try {
      setSavingSetting(key);
      const updatedSettings = { ...settings, [key]: value };
      await apiClient.updateOrganization(orgData.id, { settings: updatedSettings });
      setToast({ message: `${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`, type: 'success' });
      onRefresh();
    } catch (err) {
      setToast({ message: 'Failed to update setting: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setSavingSetting(null);
    }
  };

  const orgTypeBadge = (
    <span style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      textTransform: 'capitalize',
      fontFamily: FONT_STACK
    }}>
      {orgData.type || 'chain'}
    </span>
  );

  return (
    <div>
      <InlineToast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />

      {/* Org Header */}
      <Card>
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FaBuilding size={20} color="#16a34a" />
            </div>
            <div style={{ flex: 1 }}>
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') { setEditingName(false); setOrgName(orgData.name || ''); }
                    }}
                    autoFocus
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #16a34a',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: FONT_STACK,
                      outline: 'none',
                      flex: 1,
                      maxWidth: '300px'
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      cursor: savingName ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontFamily: FONT_STACK,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {savingName ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                    Save
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3
                    onClick={() => setEditingName(true)}
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1f2937',
                      fontFamily: FONT_STACK,
                      cursor: 'pointer',
                      borderBottom: '1px dashed transparent',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderBottomColor = '#16a34a'}
                    onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
                    title="Click to edit name"
                  >
                    {orgData.name}
                  </h3>
                  {orgTypeBadge}
                </div>
              )}
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px', fontFamily: FONT_STACK }}>
                {allOutlets.length} outlet{allOutlets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <FaCog size={16} color="#6b7280" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937', fontFamily: FONT_STACK }}>
            Organization Settings
          </h4>
        </div>
        {FEATURE_TOGGLES.map(toggle => (
          <ToggleSwitch
            key={toggle.key}
            label={toggle.label}
            description={toggle.description}
            enabled={!!settings[toggle.key]}
            onChange={(val) => handleToggleSetting(toggle.key, val)}
            loading={savingSetting === toggle.key}
          />
        ))}
      </Card>

      {/* Outlets — Chip-based UI */}
      <OutletsChipSection
        orgData={orgData}
        allOutlets={allOutlets}
        onRefresh={onRefresh}
        isMobile={isMobile}
      />

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================
// MAIN EXPORT
// ============================================
export default function OrganizationSetupTab({ orgData, outlets, onRefresh, formatCurrency }) {
  if (!orgData) {
    return <CreateOrganizationForm onRefresh={onRefresh} />;
  }

  return (
    <OrganizationManagement
      orgData={orgData}
      outlets={outlets || { outlet: [], central_kitchen: [], warehouse: [] }}
      onRefresh={onRefresh}
    />
  );
}
