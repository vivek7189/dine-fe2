'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaPlus, FaTrash, FaSave, FaCamera, FaMinus, FaClipboardList, FaImage, FaCheckCircle, FaExclamationTriangle, FaSearch, FaMagic, FaEye, FaBoxes, FaArrowDown, FaKeyboard, FaPaste, FaReceipt, FaHistory, FaChevronDown, FaCheck, FaFileImage, FaCloudUploadAlt } from 'react-icons/fa';
import SmartImportModalInline from './SmartImportModal';

const units = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'bunch', 'bottle', 'can', 'bag', 'box', 'pack'];

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937'
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };

const fieldWrap = { marginBottom: '14px' };

const primaryBtn = {
  padding: '11px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none',
  borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
};

const secondaryBtn = {
  padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
  borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'all 0.2s'
};

const dangerBtn = {
  padding: '6px 10px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none',
  borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '4px'
};

const footerStyle = {
  display: 'flex', justifyContent: 'flex-end', gap: '10px',
  marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6'
};

const rowStyle = {
  display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px',
  padding: '10px', backgroundColor: '#f9fafb', borderRadius: '10px'
};

// ─── Custom Dropdown Select ─────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = 'Select...', creatable = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = options.filter(o => {
    const label = typeof o === 'string' ? o : o.label;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  // Check if search text exactly matches an existing option
  const exactMatch = search.trim() && filtered.some(o => {
    const label = typeof o === 'string' ? o : o.label;
    return label.toLowerCase() === search.trim().toLowerCase();
  });

  const showCreateOption = creatable && search.trim() && !exactMatch;

  const selectedLabel = (() => {
    if (!value) return null;
    const found = options.find(o => (typeof o === 'string' ? o : o.value) === value);
    return found ? (typeof found === 'string' ? found : found.label) : value;
  })();

  const showSearch = options.length > 5 || creatable;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', padding: '11px 14px',
          borderColor: open ? '#059669' : '#e8ecf1',
          boxShadow: open ? '0 0 0 3px rgba(5,150,105,0.08)' : 'none',
        }}
      >
        <span style={{ color: selectedLabel ? '#1f2937' : '#94a3b8', fontWeight: selectedLabel ? 500 : 400 }}>
          {selectedLabel || placeholder}
        </span>
        <FaChevronDown size={10} style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '12px', border: '1.5px solid #e8ecf1',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden',
          maxHeight: '260px', display: 'flex', flexDirection: 'column',
        }}>
          {showSearch && (
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={creatable ? 'Search or type new...' : 'Search...'}
                style={{
                  width: '100%', padding: '7px 10px', border: '1.5px solid #e8ecf1', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc',
                }}
                onFocus={e => { e.target.style.borderColor = '#059669'; }}
                onBlur={e => { e.target.style.borderColor = '#e8ecf1'; }}
              />
            </div>
          )}
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filtered.length === 0 && !showCreateOption && (
              <div style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No options</div>
            )}
            {filtered.map((o, i) => {
              const val = typeof o === 'string' ? o : o.value;
              const label = typeof o === 'string' ? o : o.label;
              const isSelected = val === value;
              return (
                <button
                  key={val + i}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none', textAlign: 'left',
                    backgroundColor: isSelected ? '#ecfdf5' : 'transparent', cursor: 'pointer',
                    fontSize: '13px', fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#059669' : '#374151',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.target.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isSelected) e.target.style.backgroundColor = 'transparent'; }}
                >
                  {label}
                  {isSelected && <FaCheck size={11} style={{ color: '#059669' }} />}
                </button>
              );
            })}
            {showCreateOption && (
              <button
                type="button"
                onClick={() => { onChange(search.trim()); setOpen(false); setSearch(''); }}
                style={{
                  width: '100%', padding: '10px 14px', border: 'none', textAlign: 'left',
                  backgroundColor: '#f0fdf4', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: '#059669',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  borderTop: filtered.length > 0 ? '1px solid #e8ecf1' : 'none',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { e.target.style.backgroundColor = '#dcfce7'; }}
                onMouseLeave={e => { e.target.style.backgroundColor = '#f0fdf4'; }}
              >
                <FaPlus size={10} /> Create &quot;{search.trim()}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FocusInput({ style, type, ...props }) {
  const isNumeric = type === 'number';
  return (
    <input
      style={style || inputStyle}
      type={isNumeric ? 'text' : (type || 'text')}
      inputMode={isNumeric ? 'decimal' : undefined}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}

function FocusTextarea({ style, ...props }) {
  return (
    <textarea
      style={{ ...(style || inputStyle), minHeight: '60px', resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}

function FocusSelect({ style, children, ...props }) {
  return (
    <select
      style={{ ...(style || inputStyle), cursor: 'pointer', appearance: 'auto' }}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      {...props}
    >
      {children}
    </select>
  );
}

function ModalShell({ show, onClose, title, children, footer, getModalStyles, getModalContentStyles }) {
  if (!show || typeof document === 'undefined') return null;
  return createPortal(
    <div style={{ ...getModalStyles(), zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...getModalContentStyles(), padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FaTimes size={13} />
          </button>
        </div>
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 2px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
    </div>
  );
}

// ─── Manual Item Form (shared between Add & Edit) ───────────────────────────
function ManualItemForm({ formData, setFormData, categories, suppliers }) {
  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateMulti = (fields) => setFormData(prev => ({ ...prev, ...fields }));

  const categoryOptions = categories.map(c => ({ value: c.name || c, label: c.name || c }));
  const unitOptions = units.map(u => ({ value: u, label: u }));
  const supplierOptions = suppliers.map(s => ({ value: s.name || s.id, label: s.name }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
      <SectionHeader icon={<FaBoxes size={10} color="white" />} title="Basic Info" />
      <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
        <label style={labelStyle}>Name *</label>
        <FocusInput value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Tomatoes, Olive Oil, Flour" />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Category</label>
        <CustomSelect value={formData.category} onChange={v => update('category', v)} options={categoryOptions} placeholder="Select category" creatable />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Unit</label>
        <CustomSelect value={formData.unit} onChange={v => update('unit', v)} options={unitOptions} placeholder="Select unit" />
      </div>
      <SectionHeader icon={<FaClipboardList size={10} color="white" />} title="Stock & Pricing" />
      <div style={fieldWrap}>
        <label style={labelStyle}>Current Stock</label>
        <FocusInput type="number" value={formData.currentStock} onChange={e => update('currentStock', parseFloat(e.target.value) || 0)} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Cost Per Unit</label>
        <FocusInput type="number" step="0.01" value={formData.costPerUnit} onChange={e => update('costPerUnit', parseFloat(e.target.value) || 0)} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Min Stock</label>
        <FocusInput type="number" value={formData.minStock} onChange={e => update('minStock', parseFloat(e.target.value) || 0)} placeholder="Low stock alert" />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Max Stock</label>
        <FocusInput type="number" value={formData.maxStock} onChange={e => update('maxStock', parseFloat(e.target.value) || 0)} placeholder="Maximum capacity" />
      </div>
      <SectionHeader icon={<FaReceipt size={10} color="white" />} title="Tracking" />
      <div style={fieldWrap}>
        <label style={labelStyle}>Supplier</label>
        <CustomSelect value={formData.supplier} onChange={v => update('supplier', v)} options={supplierOptions} placeholder="Select supplier" />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Barcode</label>
        <FocusInput value={formData.barcode} onChange={e => update('barcode', e.target.value)} placeholder="Scan or enter barcode" />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>MFG Date</label>
        <FocusInput type="date" value={formData.mfgDate} onChange={e => {
          const mfg = e.target.value;
          const updates = { mfgDate: mfg };
          if (mfg && formData.expiryDays && formData.expiryMethod === 'days') {
            const d = new Date(mfg);
            d.setDate(d.getDate() + parseInt(formData.expiryDays));
            updates.expiryDate = d.toISOString().split('T')[0];
          }
          updateMulti(updates);
        }} />
      </div>
      <div style={fieldWrap}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={labelStyle}>{formData.expiryMethod === 'days' ? 'Expiry Days' : 'Expiry Date'}</span>
          <button type="button" onClick={() => {
            if (formData.expiryMethod === 'days') {
              updateMulti({ expiryMethod: 'date', expiryDays: '', expiryDate: '' });
            } else {
              updateMulti({ expiryMethod: 'days', expiryDays: '', expiryDate: '' });
            }
          }} style={{
            background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', padding: 0
          }}>
            Use {formData.expiryMethod === 'days' ? 'date' : 'days'} instead
          </button>
        </div>
        {formData.expiryMethod === 'days' ? (
          <FocusInput type="number" min="1" value={formData.expiryDays} onChange={e => {
            const days = e.target.value;
            const updates = { expiryDays: days };
            if (formData.mfgDate && days) {
              const d = new Date(formData.mfgDate);
              d.setDate(d.getDate() + parseInt(days));
              updates.expiryDate = d.toISOString().split('T')[0];
            } else {
              updates.expiryDate = '';
            }
            updateMulti(updates);
          }} placeholder="e.g. 3" />
        ) : (
          <FocusInput type="date" value={formData.expiryDate} onChange={e => update('expiryDate', e.target.value)} />
        )}
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Location</label>
        <FocusInput value={formData.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Walk-in cooler, Shelf A" />
      </div>
      <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
        <label style={labelStyle}>Description</label>
        <FocusTextarea value={formData.description} onChange={e => update('description', e.target.value)} placeholder="Optional notes about this item" />
      </div>
    </div>
  );
}

// ─── Add / Edit Item Modal ───────────────────────────────────────────────────
function AddEditItemModal(props) {
  const {
    showAddModal, setShowAddModal, showEditModal, setShowEditModal,
    formData, setFormData, categories, suppliers, editingItem,
    handleAddItem, handleUpdateItem, getModalStyles, getModalContentStyles,
    currentRestaurant, loadInventoryData,
  } = props;

  const [addTab, setAddTab] = useState('manual');
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [smartImportMode, setSmartImportMode] = useState('image');

  const isOpen = showAddModal || showEditModal;
  const isEdit = showEditModal && editingItem;

  const close = () => {
    isEdit ? setShowEditModal(false) : setShowAddModal(false);
    setAddTab('manual');
  };

  // For edit mode, render the simple form
  if (isEdit) {
    return (
      <ModalShell show={isOpen} onClose={close} title="Edit Inventory Item"
        getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={secondaryBtn} onClick={close}>Cancel</button>
            <button style={primaryBtn} onClick={handleUpdateItem}>
              <FaSave /> Update Item
            </button>
          </div>
        }>
        <ManualItemForm formData={formData} setFormData={setFormData} categories={categories} suppliers={suppliers} />
      </ModalShell>
    );
  }

  // Add mode — tabbed interface
  const addTabs = [
    { id: 'manual', label: 'Manual', icon: FaPlus, desc: 'Add one item' },
    { id: 'invoice', label: 'Scan Invoice', icon: FaFileImage, desc: 'Upload photo' },
    { id: 'paste', label: 'Paste Text', icon: FaKeyboard, desc: 'Bulk import' },
  ];

  const handleOpenSmartImport = (mode) => {
    setSmartImportMode(mode);
    setSmartImportOpen(true);
  };

  return (
    <>
      <ModalShell show={isOpen} onClose={close} title="Add Inventory Items"
        getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
        footer={
          addTab === 'manual' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={secondaryBtn} onClick={close}>Cancel</button>
              <button style={primaryBtn} onClick={handleAddItem}>
                <FaSave /> Add Item
              </button>
            </div>
          ) : null
        }>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
          {addTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = addTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAddTab(tab.id)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '8px', border: 'none',
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#059669' : '#64748b',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={12} /> {tab.label}
                </div>
                <span style={{ fontSize: '10px', color: isActive ? '#6b7280' : '#94a3b8', fontWeight: 400 }}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {addTab === 'manual' && (
          <ManualItemForm formData={formData} setFormData={setFormData} categories={categories} suppliers={suppliers} />
        )}

        {addTab === 'invoice' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FaFileImage size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>
              Scan Supplier Invoice
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Upload a photo of your supplier invoice or purchase bill. AI will extract all items with quantities, costs, and categories — ready for review.
            </p>
            <button
              onClick={() => handleOpenSmartImport('image')}
              style={{
                ...primaryBtn,
                padding: '14px 32px', fontSize: '14px',
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
              }}
            >
              <FaCloudUploadAlt size={16} /> Upload Invoice Photo
            </button>
          </div>
        )}

        {addTab === 'paste' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FaKeyboard size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>
              Bulk Import from Text
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Paste your ingredient list, recipe, or menu data. AI will extract and categorize all items automatically.
            </p>
            <button
              onClick={() => handleOpenSmartImport('text')}
              style={{
                ...primaryBtn,
                padding: '14px 32px', fontSize: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}
            >
              <FaMagic size={14} /> Open Smart Import
            </button>
          </div>
        )}
      </ModalShell>

      {/* Smart Import Modal (opened from invoice/paste tabs) */}
      {smartImportOpen && currentRestaurant && (
        <SmartImportModalInline
          isOpen={smartImportOpen}
          onClose={() => setSmartImportOpen(false)}
          restaurantId={currentRestaurant.id}
          onSuccess={() => { loadInventoryData?.(); close(); }}
          initialMode={smartImportMode}
        />
      )}
    </>
  );
}

// ─── Add Supplier Modal ──────────────────────────────────────────────────────
function AddSupplierModal(props) {
  const {
    showAddSupplierModal, setShowAddSupplierModal,
    supplierFormData, setSupplierFormData, handleAddSupplier,
    getModalStyles, getModalContentStyles
  } = props;

  const update = (field, value) => setSupplierFormData({ ...supplierFormData, [field]: value });

  return (
    <ModalShell show={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} title="Add Supplier"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddSupplierModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={handleAddSupplier}><FaSave /> Add Supplier</button>
        </div>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Name *</label>
          <FocusInput value={supplierFormData.name} onChange={e => update('name', e.target.value)} placeholder="Supplier name" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Contact Person *</label>
          <FocusInput value={supplierFormData.contact} onChange={e => update('contact', e.target.value)} placeholder="Contact person" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Phone</label>
          <FocusInput value={supplierFormData.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone number" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email</label>
          <FocusInput type="email" value={supplierFormData.email} onChange={e => update('email', e.target.value)} placeholder="Email" />
        </div>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Address</label>
          <FocusTextarea value={supplierFormData.address} onChange={e => update('address', e.target.value)} placeholder="Address" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Payment Terms</label>
          <FocusSelect value={supplierFormData.paymentTerms} onChange={e => update('paymentTerms', e.target.value)}>
            <option value="">Select terms</option>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Advance">Advance</option>
          </FocusSelect>
        </div>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notes</label>
          <FocusTextarea value={supplierFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Notes" />
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add Purchase Order Modal ────────────────────────────────────────────────
function AddPurchaseOrderModal(props) {
  const {
    showAddPurchaseOrderModal, setShowAddPurchaseOrderModal,
    purchaseOrderFormData, setPurchaseOrderFormData,
    handleAddPurchaseOrder, addPurchaseOrderItem, removePurchaseOrderItem, updatePurchaseOrderItem,
    suppliers, inventoryItems, getModalStyles, getModalContentStyles
  } = props;

  return (
    <ModalShell show={showAddPurchaseOrderModal} onClose={() => setShowAddPurchaseOrderModal(false)} title="Create Purchase Order"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddPurchaseOrderModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={handleAddPurchaseOrder}><FaSave /> Create Order</button>
        </div>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Supplier *</label>
          <FocusSelect value={purchaseOrderFormData.supplierId}
            onChange={e => setPurchaseOrderFormData({ ...purchaseOrderFormData, supplierId: e.target.value })}>
            <option value="">Select supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Expected Delivery Date</label>
          <FocusInput type="date" value={purchaseOrderFormData.expectedDeliveryDate}
            onChange={e => setPurchaseOrderFormData({ ...purchaseOrderFormData, expectedDeliveryDate: e.target.value })} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items *</label>
          <button style={secondaryBtn} onClick={addPurchaseOrderItem}><FaPlus /> Add Item</button>
        </div>
        {purchaseOrderFormData.items.map((item, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={item.inventoryItemId}
              onChange={e => updatePurchaseOrderItem(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty"
              value={item.quantity} onChange={e => updatePurchaseOrderItem(index, 'quantity', parseInt(e.target.value) || 1)} />
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" step="0.01" placeholder="Price"
              value={item.unitPrice} onChange={e => updatePurchaseOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
            {purchaseOrderFormData.items.length > 1 && (
              <button style={dangerBtn} onClick={() => removePurchaseOrderItem(index)}><FaTrash /></button>
            )}
          </div>
        ))}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={purchaseOrderFormData.notes}
          onChange={e => setPurchaseOrderFormData({ ...purchaseOrderFormData, notes: e.target.value })} placeholder="Order notes" />
      </div>
    </ModalShell>
  );
}

// ─── Recipe Form Body (shared between Add & Edit) ──────────────────────────
function RecipeFormBody({ recipeFormData, setRecipeFormData, inventoryItems,
  addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredient,
  addRecipeInstruction, removeRecipeInstruction, updateRecipeInstruction,
  handleGenerateRecipeSteps, generatingSteps,
  handleGenerateFullRecipe, generatingFullRecipe }) {

  const update = (field, value) => setRecipeFormData({ ...recipeFormData, [field]: value });

  return (
    <>
      {/* AI Generation Section */}
      {handleGenerateFullRecipe && (
        <div style={{
          padding: '14px 16px', marginBottom: 16, borderRadius: 12,
          background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaMagic size={11} /> AI Recipe Generator — Enter name & servings, then generate
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180 }}>
              <label style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>Recipe Name *</label>
              <FocusInput value={recipeFormData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Paneer Butter Masala" />
            </div>
            <div style={{ flex: 0, minWidth: 80, maxWidth: 100 }}>
              <label style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>Servings</label>
              <FocusInput type="number" value={recipeFormData.servings} onChange={e => update('servings', parseInt(e.target.value) || 1)} placeholder="4" />
            </div>
            <button
              style={{
                ...secondaryBtn,
                background: recipeFormData.name ? 'linear-gradient(135deg, #059669, #10b981)' : '#d1d5db',
                color: recipeFormData.name ? '#fff' : '#9ca3af',
                cursor: recipeFormData.name ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap', padding: '10px 18px', fontSize: 13,
                border: 'none', opacity: generatingFullRecipe ? 0.7 : 1,
                boxShadow: recipeFormData.name ? '0 2px 8px rgba(5,150,105,0.3)' : 'none',
              }}
              onClick={handleGenerateFullRecipe}
              disabled={!recipeFormData.name || generatingFullRecipe}
            >
              {generatingFullRecipe ? (
                <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
              ) : (
                <><FaMagic size={12} /> Generate with AI</>
              )}
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            AI will fill category, description, ingredients (auto-added to inventory), prep/cook time & instructions
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {!handleGenerateFullRecipe && (
          <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Recipe Name *</label>
            <FocusInput value={recipeFormData.name} onChange={e => update('name', e.target.value)} placeholder="Recipe name" />
          </div>
        )}
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <FocusTextarea value={recipeFormData.description} onChange={e => update('description', e.target.value)}
            placeholder="Full recipe description or method" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Category</label>
          <FocusInput value={recipeFormData.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Tea Counter" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Servings</label>
          <FocusInput type="number" value={recipeFormData.servings} onChange={e => update('servings', parseInt(e.target.value) || 1)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Prep Time (min)</label>
          <FocusInput type="number" value={recipeFormData.prepTime} onChange={e => update('prepTime', parseInt(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Cook Time (min)</label>
          <FocusInput type="number" value={recipeFormData.cookTime} onChange={e => update('cookTime', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ marginBottom: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Ingredients *</label>
          <button style={secondaryBtn} onClick={addRecipeIngredient}><FaPlus /> Add Ingredient</button>
        </div>
        {recipeFormData.ingredients.map((ing, index) => (
          <div key={index}>
            <div style={rowStyle}>
              <FocusSelect style={{ ...inputStyle, flex: 2, ...(ing._unmatched && !ing.inventoryItemId ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' } : {}) }} value={ing.inventoryItemId}
                onChange={e => updateRecipeIngredient(index, 'inventoryItemId', e.target.value)}>
                <option value="">{ing._unmatched ? `⚠ ${ing.inventoryItemName || 'Select item'}` : 'Select item'}</option>
                {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
              </FocusSelect>
              <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Qty"
                value={ing.quantity} onChange={e => updateRecipeIngredient(index, 'quantity', parseFloat(e.target.value) || 0)} />
              <FocusSelect style={{ ...inputStyle, flex: 1 }} value={ing.unit}
                onChange={e => updateRecipeIngredient(index, 'unit', e.target.value)}>
                <option value="">Unit</option>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </FocusSelect>
            {recipeFormData.ingredients.length > 1 && (
              <button style={dangerBtn} onClick={() => removeRecipeIngredient(index)}><FaTrash /></button>
            )}
            </div>
            {ing._unmatched && !ing.inventoryItemId && (
              <div style={{ fontSize: 11, color: '#d97706', marginTop: 2, marginBottom: 4, paddingLeft: 4 }}>
                Not in inventory — please select a matching item or add &quot;{ing.inventoryItemName}&quot; to inventory first
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Instructions</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {handleGenerateRecipeSteps && recipeFormData.name && (
              <button
                style={{ ...secondaryBtn, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
                onClick={handleGenerateRecipeSteps}
                disabled={generatingSteps}
              >
                {generatingSteps ? (
                  <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                ) : (
                  <><FaMagic size={12} /> AI Generate Steps</>
                )}
              </button>
            )}
            <button style={secondaryBtn} onClick={addRecipeInstruction}><FaPlus /> Add Step</button>
          </div>
        </div>
        {recipeFormData.instructions.map((inst, index) => (
          <div key={index} style={{ ...rowStyle, alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 700, color: '#059669', minWidth: 28, paddingTop: 14, fontSize: 14 }}>
              {index + 1}.
            </span>
            <FocusTextarea style={{ ...inputStyle, flex: 1, minHeight: 60 }} value={inst}
              onChange={e => updateRecipeInstruction(index, e.target.value)} placeholder={`Step ${index + 1}`} />
            {recipeFormData.instructions.length > 1 && (
              <button style={{ ...dangerBtn, marginTop: 10 }} onClick={() => removeRecipeInstruction(index)}><FaTrash /></button>
            )}
          </div>
        ))}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={recipeFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Additional notes" />
      </div>
    </>
  );
}

// ─── Add Recipe Modal (Portal) ──────────────────────────────────────────────
function AddRecipeModal(props) {
  const {
    showAddRecipeModal, setShowAddRecipeModal,
    recipeFormData, setRecipeFormData,
    handleAddRecipe, addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredient,
    addRecipeInstruction, removeRecipeInstruction, updateRecipeInstruction,
    inventoryItems, isMobile,
    handleGenerateRecipeSteps, generatingSteps,
    handleGenerateFullRecipe, generatingFullRecipe,
    loading, error,
  } = props;

  if (!showAddRecipeModal || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 10002, padding: 20, overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) setShowAddRecipeModal(false); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: 14,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: isMobile ? '500px' : '820px',
        marginTop: 20, marginBottom: 20,
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '16px 20px', borderRadius: '14px 14px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Add Recipe</h2>
          <button onClick={() => setShowAddRecipeModal(false)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
          }}>
            <FaTimes size={14} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <RecipeFormBody
            recipeFormData={recipeFormData} setRecipeFormData={setRecipeFormData}
            inventoryItems={inventoryItems}
            addRecipeIngredient={addRecipeIngredient} removeRecipeIngredient={removeRecipeIngredient}
            updateRecipeIngredient={updateRecipeIngredient}
            addRecipeInstruction={addRecipeInstruction} removeRecipeInstruction={removeRecipeInstruction}
            updateRecipeInstruction={updateRecipeInstruction}
            handleGenerateRecipeSteps={handleGenerateRecipeSteps} generatingSteps={generatingSteps}
            handleGenerateFullRecipe={handleGenerateFullRecipe} generatingFullRecipe={generatingFullRecipe}
          />
        </div>
        {error && (
          <div style={{
            margin: '0 20px', padding: '10px 14px', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 15 }}>⚠</span> {error}
          </div>
        )}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddRecipeModal(false)}>Cancel</button>
          <button style={{ ...primaryBtn, opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }} onClick={handleAddRecipe} disabled={loading}>{loading ? 'Creating...' : <><FaSave /> Create Recipe</>}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Quick Stock Update Modal ────────────────────────────────────────────────
function QuickStockModal(props) {
  const {
    showQuickStockModal, setShowQuickStockModal,
    inventoryItems, handleQuickStockUpdate,
    quickStockItems, setQuickStockItems,
    getModalStyles, getModalContentStyles
  } = props;

  const [filter, setFilter] = useState('');
  const [batchInfo, setBatchInfo] = useState({}); // { [itemId]: { mfgDate, expiryDays } }

  const getAdjustment = (itemId) => {
    const entry = quickStockItems.find(q => q.itemId === itemId);
    return entry ? entry.adjustment : 0;
  };

  const setAdjustment = (itemId, adjustment) => {
    const existing = quickStockItems.filter(q => q.itemId !== itemId);
    if (adjustment !== 0) {
      existing.push({ itemId, adjustment, ...(batchInfo[itemId] || {}) });
    }
    setQuickStockItems(existing);
  };

  const adjustBy = (itemId, delta) => {
    const newAdj = getAdjustment(itemId) + delta;
    setAdjustment(itemId, newAdj);
  };

  const updateBatchInfo = (itemId, field, value) => {
    const updated = { ...batchInfo, [itemId]: { ...(batchInfo[itemId] || {}), [field]: value } };
    setBatchInfo(updated);
    // Also update in quickStockItems if already has adjustment
    const adj = getAdjustment(itemId);
    if (adj !== 0) {
      const existing = quickStockItems.filter(q => q.itemId !== itemId);
      existing.push({ itemId, adjustment: adj, ...updated[itemId] });
      setQuickStockItems(existing);
    }
  };

  const changedCount = quickStockItems.filter(q => q.adjustment !== 0).length;
  const filteredItems = inventoryItems.filter(item =>
    item.name?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleClose = () => {
    setShowQuickStockModal(false);
    setQuickStockItems([]);
    setBatchInfo({});
  };

  return (
    <ModalShell show={showQuickStockModal} onClose={handleClose} title="Quick Stock Update"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={handleClose}>Cancel</button>
          <button style={{ ...primaryBtn, opacity: changedCount === 0 ? 0.5 : 1 }}
            disabled={changedCount === 0}
            onClick={() => { handleQuickStockUpdate(quickStockItems.filter(q => q.adjustment !== 0)); setBatchInfo({}); }}>
            <FaSave /> Save All Changes {changedCount > 0 && `(${changedCount})`}
          </button>
        </div>
      }>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px', marginTop: '-8px' }}>
        Adjust stock levels for your daily check-in. Changed items are highlighted.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <FocusInput value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search items..." />
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
        {filteredItems.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>No items found</p>
        )}
        {filteredItems.map(item => {
          const adj = getAdjustment(item.id);
          const hasChange = adj !== 0;
          const newStock = Math.max(0, (item.currentStock || 0) + adj);
          const info = batchInfo[item.id] || {};
          return (
            <div key={item.id} style={{
              borderRadius: '12px', marginBottom: '8px',
              backgroundColor: hasChange ? '#ecfdf5' : '#f9fafb',
              border: hasChange ? '1px solid #a7f3d0' : '1px solid transparent',
              transition: 'all 0.2s', overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Current: {item.currentStock || 0} {item.unit || ''}
                    {hasChange && (
                      <span style={{ color: '#059669', fontWeight: 600, marginLeft: '8px' }}>
                        New: {newStock} {item.unit || ''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => adjustBy(item.id, -1)} style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                  }}><FaMinus /></button>
                  <input type="number" value={adj} onChange={e => setAdjustment(item.id, parseInt(e.target.value) || 0)}
                    style={{
                      width: '60px', textAlign: 'center', padding: '8px 4px', borderRadius: '8px',
                      border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 600, outline: 'none'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#059669'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                  <button onClick={() => adjustBy(item.id, 1)} style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#d1fae5', color: '#059669', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                  }}><FaPlus /></button>
                </div>
              </div>
              {/* Batch info row — mfg date & expiry days (always visible when adding stock) */}
              {adj > 0 && (
                <div style={{
                  padding: '8px 16px 12px', borderTop: '1px solid #e5e7eb',
                  display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f0fdf4',
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Mfg Date</label>
                    <input type="date" value={info.mfgDate || ''}
                      onChange={e => updateBatchInfo(item.id, 'mfgDate', e.target.value)}
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: '8px',
                        border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', marginTop: '2px',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expiry (days)</label>
                    <input type="number" value={info.expiryDays || ''} placeholder="e.g. 30"
                      onChange={e => updateBatchInfo(item.id, 'expiryDays', parseInt(e.target.value) || '')}
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: '8px',
                        border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', marginTop: '2px',
                      }}
                    />
                  </div>
                  {info.mfgDate && info.expiryDays && (
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expires On</label>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', marginTop: '6px' }}>
                        {new Date(new Date(info.mfgDate).getTime() + info.expiryDays * 86400000).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ─── Add GRN Modal ───────────────────────────────────────────────────────────
function AddGRNModal(props) {
  const {
    showAddGRNModal, setShowAddGRNModal,
    grnFormData, setGrnFormData,
    purchaseOrders, getModalStyles, getModalContentStyles
  } = props;

  const selectedPO = purchaseOrders.find(po => po.id === grnFormData.purchaseOrderId);

  const handlePOChange = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setGrnFormData({
      purchaseOrderId: poId,
      items: po?.items?.map(item => ({ ...item, receivedQuantity: item.quantity || 0 })) || [],
      notes: ''
    });
  };

  return (
    <ModalShell show={showAddGRNModal} onClose={() => setShowAddGRNModal(false)} title="Add Goods Received Note"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddGRNModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={() => setShowAddGRNModal(false)}><FaSave /> Create GRN</button>
        </div>
      }>
      <div style={fieldWrap}>
        <label style={labelStyle}>Purchase Order *</label>
        <FocusSelect value={grnFormData.purchaseOrderId} onChange={e => handlePOChange(e.target.value)}>
          <option value="">Select purchase order</option>
          {purchaseOrders.filter(po => po.status !== 'cancelled').map(po => (
            <option key={po.id} value={po.id}>PO #{po.id?.slice(-6)} - {po.supplierName || 'Supplier'}</option>
          ))}
        </FocusSelect>
      </div>

      {grnFormData.items.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Items Received</label>
          {grnFormData.items.map((item, index) => (
            <div key={index} style={rowStyle}>
              <span style={{ flex: 2, fontSize: '14px', fontWeight: 500 }}>{item.inventoryItemName || item.name || 'Item'}</span>
              <span style={{ fontSize: '13px', color: '#6b7280', flex: 1 }}>Ordered: {item.quantity || 0}</span>
              <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="0" placeholder="Received"
                value={item.receivedQuantity || ''}
                onChange={e => {
                  const newItems = [...grnFormData.items];
                  newItems[index] = { ...newItems[index], receivedQuantity: parseInt(e.target.value) || 0 };
                  setGrnFormData({ ...grnFormData, items: newItems });
                }} />
            </div>
          ))}
        </div>
      )}

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={grnFormData.notes || ''} onChange={e => setGrnFormData({ ...grnFormData, notes: e.target.value })} placeholder="Notes" />
      </div>
    </ModalShell>
  );
}

// ─── Add Requisition Modal ───────────────────────────────────────────────────
function AddRequisitionModal(props) {
  const {
    showAddRequisitionModal, setShowAddRequisitionModal,
    requisitionFormData, setRequisitionFormData,
    inventoryItems, getModalStyles, getModalContentStyles
  } = props;

  const addItem = () => {
    setRequisitionFormData({
      ...requisitionFormData,
      items: [...requisitionFormData.items, { inventoryItemId: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    setRequisitionFormData({
      ...requisitionFormData,
      items: requisitionFormData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...requisitionFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setRequisitionFormData({ ...requisitionFormData, items: newItems });
  };

  return (
    <ModalShell show={showAddRequisitionModal} onClose={() => setShowAddRequisitionModal(false)} title="Add Purchase Requisition"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddRequisitionModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={() => setShowAddRequisitionModal(false)}><FaSave /> Create Requisition</button>
        </div>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Priority</label>
          <FocusSelect value={requisitionFormData.priority} onChange={e => setRequisitionFormData({ ...requisitionFormData, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Reason</label>
          <FocusInput value={requisitionFormData.reason} onChange={e => setRequisitionFormData({ ...requisitionFormData, reason: e.target.value })} placeholder="Reason" />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items Needed</label>
          <button style={secondaryBtn} onClick={addItem}><FaPlus /> Add Item</button>
        </div>
        {requisitionFormData.items.map((item, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={item.inventoryItemId}
              onChange={e => updateItem(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty"
              value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
            <button style={dangerBtn} onClick={() => removeItem(index)}><FaTrash /></button>
          </div>
        ))}
        {requisitionFormData.items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '14px' }}>No items added yet</p>
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={requisitionFormData.notes} onChange={e => setRequisitionFormData({ ...requisitionFormData, notes: e.target.value })} placeholder="Notes" />
      </div>
    </ModalShell>
  );
}

// ─── Add Invoice Modal ───────────────────────────────────────────────────────
function AddInvoiceModal(props) {
  const {
    showAddInvoiceModal, setShowAddInvoiceModal,
    invoiceFormData, setInvoiceFormData,
    handleInvoiceOCR, processingInvoiceOCR, invoiceFileInputRef,
    handleSaveInvoice,
    suppliers, inventoryItems, getModalStyles, getModalContentStyles
  } = props;

  const update = (field, value) => setInvoiceFormData({ ...invoiceFormData, [field]: value });

  const addItem = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: [...invoiceFormData.items, { inventoryItemId: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: invoiceFormData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  return (
    <ModalShell show={showAddInvoiceModal} onClose={() => setShowAddInvoiceModal(false)} title="Add Supplier Invoice"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddInvoiceModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={handleSaveInvoice}><FaSave /> Save Invoice</button>
        </div>
      }>

      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ ...primaryBtn, padding: '12px 20px' }}
            disabled={processingInvoiceOCR}
            onClick={() => invoiceFileInputRef?.current?.click()}>
            <FaCamera /> {processingInvoiceOCR ? 'Scanning...' : 'Scan Invoice (OCR)'}
          </button>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Upload a photo to auto-fill fields</span>
        </div>
        <input ref={invoiceFileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleInvoiceOCR(e.target.files[0]); }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Supplier</label>
          <FocusSelect value={invoiceFormData.supplierId} onChange={e => update('supplierId', e.target.value)}>
            <option value="">Select supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Invoice Number</label>
          <FocusInput value={invoiceFormData.invoiceNumber} onChange={e => update('invoiceNumber', e.target.value)} placeholder="INV-001" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Invoice Date</label>
          <FocusInput type="date" value={invoiceFormData.invoiceDate} onChange={e => update('invoiceDate', e.target.value)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Total Amount</label>
          <FocusInput type="number" step="0.01" value={invoiceFormData.totalAmount} onChange={e => update('totalAmount', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items</label>
          <button style={secondaryBtn} onClick={addItem}><FaPlus /> Add Item</button>
        </div>
        {invoiceFormData.items.map((item, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={item.inventoryItemId}
              onChange={e => updateItem(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty"
              value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" step="0.01" placeholder="Price"
              value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
            <button style={dangerBtn} onClick={() => removeItem(index)}><FaTrash /></button>
          </div>
        ))}
        {invoiceFormData.items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '14px' }}>No items added yet. Use OCR or add manually.</p>
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={invoiceFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Notes" />
      </div>
    </ModalShell>
  );
}

// ─── Add Return Modal ────────────────────────────────────────────────────────
function AddReturnModal(props) {
  const {
    showAddReturnModal, setShowAddReturnModal,
    returnFormData, setReturnFormData,
    suppliers, purchaseOrders, inventoryItems,
    getModalStyles, getModalContentStyles
  } = props;

  const update = (field, value) => setReturnFormData({ ...returnFormData, [field]: value });

  const addItem = () => {
    setReturnFormData({
      ...returnFormData,
      items: [...returnFormData.items, { inventoryItemId: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    setReturnFormData({
      ...returnFormData,
      items: returnFormData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...returnFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReturnFormData({ ...returnFormData, items: newItems });
  };

  return (
    <ModalShell show={showAddReturnModal} onClose={() => setShowAddReturnModal(false)} title="Add Supplier Return"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddReturnModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={() => setShowAddReturnModal(false)}><FaSave /> Create Return</button>
        </div>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Purchase Order</label>
          <FocusSelect value={returnFormData.purchaseOrderId} onChange={e => update('purchaseOrderId', e.target.value)}>
            <option value="">Select PO (optional)</option>
            {purchaseOrders.map(po => (
              <option key={po.id} value={po.id}>PO #{po.id?.slice(-6)}</option>
            ))}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Supplier</label>
          <FocusSelect value={returnFormData.supplierId} onChange={e => update('supplierId', e.target.value)}>
            <option value="">Select supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Return Type</label>
          <FocusSelect value={returnFormData.returnType} onChange={e => update('returnType', e.target.value)}>
            <option value="damaged">Damaged</option>
            <option value="expired">Expired</option>
            <option value="wrong_item">Wrong Item</option>
            <option value="quality">Quality Issue</option>
            <option value="excess">Excess Stock</option>
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Reason</label>
          <FocusInput value={returnFormData.reason} onChange={e => update('reason', e.target.value)} placeholder="Reason for return" />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items to Return</label>
          <button style={secondaryBtn} onClick={addItem}><FaPlus /> Add Item</button>
        </div>
        {returnFormData.items.map((item, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={item.inventoryItemId}
              onChange={e => updateItem(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty"
              value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
            <button style={dangerBtn} onClick={() => removeItem(index)}><FaTrash /></button>
          </div>
        ))}
        {returnFormData.items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '14px' }}>No items added yet</p>
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={returnFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Notes" />
      </div>
    </ModalShell>
  );
}

// ─── Add Transfer Modal ──────────────────────────────────────────────────────
function AddTransferModal(props) {
  const {
    showAddTransferModal, setShowAddTransferModal,
    transferFormData, setTransferFormData,
    inventoryItems, getModalStyles, getModalContentStyles
  } = props;

  const update = (field, value) => setTransferFormData({ ...transferFormData, [field]: value });

  const addItem = () => {
    setTransferFormData({
      ...transferFormData,
      items: [...transferFormData.items, { inventoryItemId: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    setTransferFormData({
      ...transferFormData,
      items: transferFormData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...transferFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setTransferFormData({ ...transferFormData, items: newItems });
  };

  return (
    <ModalShell show={showAddTransferModal} onClose={() => setShowAddTransferModal(false)} title="Add Stock Transfer"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowAddTransferModal(false)}>Cancel</button>
          <button style={primaryBtn} onClick={() => setShowAddTransferModal(false)}><FaSave /> Create Transfer</button>
        </div>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>From Location *</label>
          <FocusInput value={transferFormData.fromLocation} onChange={e => update('fromLocation', e.target.value)} placeholder="e.g. Main Kitchen" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>To Location *</label>
          <FocusInput value={transferFormData.toLocation} onChange={e => update('toLocation', e.target.value)} placeholder="e.g. Bar Storage" />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items to Transfer</label>
          <button style={secondaryBtn} onClick={addItem}><FaPlus /> Add Item</button>
        </div>
        {transferFormData.items.map((item, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={item.inventoryItemId}
              onChange={e => updateItem(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty"
              value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
            <button style={dangerBtn} onClick={() => removeItem(index)}><FaTrash /></button>
          </div>
        ))}
        {transferFormData.items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '14px' }}>No items added yet</p>
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Reason</label>
        <FocusInput value={transferFormData.reason} onChange={e => update('reason', e.target.value)} placeholder="Reason for transfer" />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={transferFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Notes" />
      </div>
    </ModalShell>
  );
}

// ─── Quick Order Logger Modal ─────────────────────────────────────────────────
function QuickOrderModal(props) {
  const {
    showQuickOrderModal, setShowQuickOrderModal,
    quickOrderMode, setQuickOrderMode,
    quickOrderText, setQuickOrderText,
    quickOrderParsedItems, setQuickOrderParsedItems,
    quickOrderSource, setQuickOrderSource,
    quickOrderParsing, quickOrderConfirming,
    quickOrderManualItems, setQuickOrderManualItems,
    quickOrderResult, setQuickOrderResult,
    menuItems,
    handleParseQuickOrderText, handleParseQuickOrderImage, handleConfirmQuickOrder,
    getModalStyles, getModalContentStyles, isMobile, formatCurrency,
  } = props;

  const [menuSearch, setMenuSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const modes = [
    { id: 'manual', label: 'Manual', icon: FaKeyboard },
    { id: 'text', label: 'Paste Text', icon: FaPaste },
    { id: 'image', label: 'Upload Photo', icon: FaImage },
  ];

  const handleCloseQuickOrder = () => {
    setShowQuickOrderModal(false);
    setQuickOrderResult(null);
    setQuickOrderText('');
    setQuickOrderParsedItems([]);
    setQuickOrderManualItems([]);
    setQuickOrderMode('manual');
  };

  const sources = ['zomato', 'swiggy', 'whatsapp', 'phone', 'walk-in', 'other'];

  const filteredMenuItems = (menuItems || []).filter(item =>
    item.name?.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const addManualItem = (item) => {
    const existing = quickOrderManualItems.find(i => i.menuItemId === item.id || i.menuItemId === item._id);
    if (existing) {
      setQuickOrderManualItems(quickOrderManualItems.map(i =>
        (i.menuItemId === item.id || i.menuItemId === item._id) ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setQuickOrderManualItems([...quickOrderManualItems, {
        menuItemId: item.id || item._id,
        name: item.name,
        price: item.price || 0,
        quantity: 1,
      }]);
    }
  };

  const updateManualQty = (menuItemId, delta) => {
    setQuickOrderManualItems(quickOrderManualItems.map(i => {
      if (i.menuItemId === menuItemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeManualItem = (menuItemId) => {
    setQuickOrderManualItems(quickOrderManualItems.filter(i => i.menuItemId !== menuItemId));
  };

  const updateParsedQty = (index, value) => {
    const updated = [...quickOrderParsedItems];
    updated[index] = { ...updated[index], quantity: Math.max(0, value) };
    setQuickOrderParsedItems(updated);
  };

  const removeParsedItem = (index) => {
    setQuickOrderParsedItems(quickOrderParsedItems.filter((_, i) => i !== index));
  };

  const validItemCount = quickOrderMode === 'manual'
    ? quickOrderManualItems.filter(i => i.quantity > 0).length
    : quickOrderParsedItems.filter(i => i.menuItemId && i.quantity > 0).length;

  const pillStyle = (active) => ({
    padding: '10px 18px', borderRadius: '12px', border: active ? 'none' : '1px solid #e5e7eb',
    background: active ? 'linear-gradient(135deg, #059669, #10b981)' : '#fff',
    color: active ? 'white' : '#6b7280',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px',
    boxShadow: active ? '0 2px 8px rgba(5,150,105,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
    flex: 1, justifyContent: 'center',
  });

  const sourceChipStyle = (active) => ({
    padding: '6px 14px', borderRadius: '16px', border: 'none',
    backgroundColor: active ? '#059669' : '#f3f4f6',
    color: active ? 'white' : '#6b7280',
    fontWeight: 600, fontSize: '12px', cursor: 'pointer',
    textTransform: 'capitalize', transition: 'all 0.2s',
  });

  return (
    <ModalShell show={showQuickOrderModal} onClose={handleCloseQuickOrder} title="Log External Order"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>

      {/* Deduction Results Screen */}
      {quickOrderResult ? (
        <div>
          {/* Success Header */}
          <div style={{
            textAlign: 'center', padding: '20px 16px', marginBottom: '20px',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '14px',
            border: '1px solid #a7f3d0',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <FaCheckCircle size={22} color="white" />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#065f46' }}>
              Order Logged Successfully!
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
              {quickOrderResult.items.length} item{quickOrderResult.items.length !== 1 ? 's' : ''} processed
              {quickOrderResult.totalAmount > 0 && ` • Total: ${formatCurrency(quickOrderResult.totalAmount)}`}
            </p>
          </div>

          {/* Items Ordered */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaReceipt size={11} /> Items Ordered
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickOrderResult.items.map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 600, color: '#065f46', border: '1px solid #bbf7d0',
                }}>
                  {item.name} <span style={{ color: '#059669', fontWeight: 700 }}>×{item.quantity}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Inventory Deductions */}
          {quickOrderResult.deductions.length > 0 ? (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaArrowDown size={11} /> Inventory Deducted
              </label>
              <div style={{
                border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden',
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                  padding: '10px 14px', backgroundColor: '#f9fafb',
                  fontSize: '11px', fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <span>Ingredient</span>
                  <span style={{ textAlign: 'right' }}>Deducted</span>
                  <span style={{ textAlign: 'right' }}>Stock Now</span>
                </div>
                {quickOrderResult.deductions.map((d, i) => {
                  const isLow = d.newStock <= 0;
                  const isWarning = d.newStock > 0 && d.newStock <= 5;
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                      padding: '10px 14px', alignItems: 'center',
                      borderBottom: i < quickOrderResult.deductions.length - 1 ? '1px solid #f3f4f6' : 'none',
                      backgroundColor: isLow ? '#fef2f2' : isWarning ? '#fffbeb' : '#fff',
                      animation: `slideInUp 0.3s ease-out ${i * 0.05}s both`,
                    }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                          {d.inventoryItemName}
                        </span>
                      </div>
                      <span style={{
                        textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#ef4444',
                      }}>
                        -{parseFloat(d.quantityDeducted.toFixed(2))} {d.unit}
                      </span>
                      <span style={{
                        textAlign: 'right', fontSize: '13px', fontWeight: 700,
                        color: isLow ? '#dc2626' : isWarning ? '#d97706' : '#059669',
                      }}>
                        {parseFloat(d.newStock.toFixed(2))} {d.unit}
                        {isLow && ' ⚠️'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '16px', backgroundColor: '#fffbeb', borderRadius: '10px',
              border: '1px solid #fde68a', marginBottom: '16px',
              fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <FaExclamationTriangle size={14} />
              No inventory deductions were made. Check if recipes are linked to menu items.
            </div>
          )}

          {/* Close Button */}
          <div style={{ ...footerStyle, justifyContent: 'center' }}>
            <button style={{ ...primaryBtn, padding: '12px 32px' }} onClick={handleCloseQuickOrder}>
              Done
            </button>
          </div>
        </div>
      ) : (
      <>
      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {modes.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.id} style={pillStyle(quickOrderMode === m.id)}
              onClick={() => setQuickOrderMode(m.id)}>
              <Icon size={14} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Manual Mode */}
      {quickOrderMode === 'manual' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Search Menu Items</label>
            <FocusInput value={menuSearch} onChange={e => setMenuSearch(e.target.value)}
              placeholder="Type to search menu items..." />
          </div>
          {menuSearch.trim() && (
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
              {filteredMenuItems.length === 0 && (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '16px', fontSize: '13px' }}>No items found</p>
              )}
              {filteredMenuItems.map(item => (
                <div key={item.id || item._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderBottom: '1px solid #f3f4f6',
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{item.name}</span>
                    {item.price > 0 && (
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                        {item.price}
                      </span>
                    )}
                  </div>
                  <button style={{ ...secondaryBtn, padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => addManualItem(item)}>
                    <FaPlus size={10} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Added items */}
          {quickOrderManualItems.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Added Items ({quickOrderManualItems.length})</label>
              {quickOrderManualItems.map(item => (
                <div key={item.menuItemId} style={rowStyle}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13px', color: '#111827' }}>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => updateManualQty(item.menuItemId, -1)} style={{
                      width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                      backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><FaMinus size={10} /></button>
                    <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateManualQty(item.menuItemId, 1)} style={{
                      width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                      backgroundColor: '#d1fae5', color: '#059669', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><FaPlus size={10} /></button>
                    <button style={dangerBtn} onClick={() => removeManualItem(item.menuItemId)}>
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {quickOrderManualItems.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '13px' }}>
              Search and add menu items above
            </p>
          )}
        </div>
      )}

      {/* Text Mode */}
      {quickOrderMode === 'text' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Paste Order Text</label>
            <FocusTextarea
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              value={quickOrderText}
              onChange={e => setQuickOrderText(e.target.value)}
              placeholder="Paste orders here... e.g. '10 cardamom tea, 5 black coffee' or paste a WhatsApp/Zomato order"
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: (!quickOrderText.trim() || quickOrderParsing) ? 0.5 : 1, marginBottom: '16px' }}
            disabled={!quickOrderText.trim() || quickOrderParsing}
            onClick={handleParseQuickOrderText}
          >
            {quickOrderParsing ? (
              <>
                <div style={{
                  width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                Parsing...
              </>
            ) : (
              <><FaSearch size={12} /> Parse with AI</>
            )}
          </button>
        </div>
      )}

      {/* Image Mode */}
      {quickOrderMode === 'image' && (
        <div>
          <div style={{
            marginBottom: '12px', padding: '24px', border: '2px dashed #d1d5db',
            borderRadius: '12px', textAlign: 'center', backgroundColor: '#f9fafb',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onClick={() => document.getElementById('quick-order-image-input')?.click()}
          >
            <FaImage size={28} style={{ color: '#9ca3af', marginBottom: '8px' }} />
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
              {imageFile ? imageFile.name : 'Click to upload a photo of the order'}
            </p>
            <input
              id="quick-order-image-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) setImageFile(e.target.files[0]); }}
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: (!imageFile || quickOrderParsing) ? 0.5 : 1, marginBottom: '16px' }}
            disabled={!imageFile || quickOrderParsing}
            onClick={() => { if (imageFile) handleParseQuickOrderImage(imageFile); }}
          >
            {quickOrderParsing ? (
              <>
                <div style={{
                  width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                Extracting...
              </>
            ) : (
              <><FaImage size={12} /> Extract Items</>
            )}
          </button>
        </div>
      )}

      {/* Parsed Items Review (text & image modes) */}
      {(quickOrderMode === 'text' || quickOrderMode === 'image') && quickOrderParsedItems.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Parsed Items ({quickOrderParsedItems.length})</label>
          {quickOrderParsedItems.map((item, index) => {
            const isUnmatched = !item.menuItemId;
            const isFuzzy = item.matchType === 'fuzzy';
            return (
              <div key={index} style={{
                ...rowStyle,
                backgroundColor: isUnmatched ? '#fef2f2' : rowStyle.backgroundColor,
                border: isUnmatched ? '1px solid #fecaca' : 'none',
              }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '13px', color: isUnmatched ? '#dc2626' : '#111827' }}>
                  {item.name || item.parsedName || 'Unknown'}
                </span>
                <FocusInput
                  style={{ ...inputStyle, width: '60px', textAlign: 'center', padding: '6px' }}
                  type="number" min="0"
                  value={item.quantity}
                  onChange={e => updateParsedQty(index, parseInt(e.target.value) || 0)}
                />
                {item.menuItemId && !isFuzzy && (
                  <FaCheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} title="Exact match" />
                )}
                {item.menuItemId && isFuzzy && (
                  <FaExclamationTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} title="Fuzzy match" />
                )}
                {isUnmatched && (
                  <FaTimes size={14} style={{ color: '#ef4444', flexShrink: 0 }} title="Unmatched" />
                )}
                <button style={dangerBtn} onClick={() => removeParsedItem(index)}>
                  <FaTrash size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Source Selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Order Source</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sources.map(s => (
            <button key={s} style={sourceChipStyle(quickOrderSource === s)}
              onClick={() => setQuickOrderSource(s)}>
              {s === 'walk-in' ? 'Walk-in' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={handleCloseQuickOrder}>Cancel</button>
        <button
          style={{ ...primaryBtn, opacity: (validItemCount === 0 || quickOrderConfirming) ? 0.5 : 1 }}
          disabled={validItemCount === 0 || quickOrderConfirming}
          onClick={handleConfirmQuickOrder}
        >
          {quickOrderConfirming ? (
            <>
              <div style={{
                width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite',
              }} />
              Confirming...
            </>
          ) : (
            <><FaCheckCircle size={12} /> Confirm & Deduct Inventory</>
          )}
        </button>
      </div>
      </>
      )}
    </ModalShell>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
// ─── Edit Recipe Modal (Portal) ─────────────────────────────────────────────
function EditRecipeModal(props) {
  const {
    showEditRecipeModal, setShowEditRecipeModal, editingRecipe,
    recipeFormData, setRecipeFormData,
    handleUpdateRecipe, addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredient,
    addRecipeInstruction, removeRecipeInstruction, updateRecipeInstruction,
    inventoryItems, isMobile,
    handleGenerateRecipeSteps, generatingSteps,
    handleGenerateFullRecipe, generatingFullRecipe,
    loading, error,
  } = props;

  if (!showEditRecipeModal || !editingRecipe || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 10002, padding: 20, overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) setShowEditRecipeModal(false); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: 14,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: isMobile ? '500px' : '820px',
        marginTop: 20, marginBottom: 20,
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '16px 20px', borderRadius: '14px 14px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>
            Edit Recipe — {editingRecipe.name}
          </h2>
          <button onClick={() => setShowEditRecipeModal(false)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
          }}>
            <FaTimes size={14} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <RecipeFormBody
            recipeFormData={recipeFormData} setRecipeFormData={setRecipeFormData}
            inventoryItems={inventoryItems}
            addRecipeIngredient={addRecipeIngredient} removeRecipeIngredient={removeRecipeIngredient}
            updateRecipeIngredient={updateRecipeIngredient}
            addRecipeInstruction={addRecipeInstruction} removeRecipeInstruction={removeRecipeInstruction}
            updateRecipeInstruction={updateRecipeInstruction}
            handleGenerateRecipeSteps={handleGenerateRecipeSteps} generatingSteps={generatingSteps}
            handleGenerateFullRecipe={handleGenerateFullRecipe} generatingFullRecipe={generatingFullRecipe}
          />
        </div>
        {error && (
          <div style={{
            margin: '0 20px', padding: '10px 14px', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 15 }}>⚠</span> {error}
          </div>
        )}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={() => setShowEditRecipeModal(false)}>Cancel</button>
          <button style={{ ...primaryBtn, opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }} onClick={handleUpdateRecipe} disabled={loading}>{loading ? 'Updating...' : <><FaSave /> Update Recipe</>}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── View Recipe Detail Modal (Portal) ──────────────────────────────────────
function ViewRecipeModal(props) {
  const { showViewRecipeModal, setShowViewRecipeModal, viewingRecipe, isMobile, formatCurrency, inventoryItems } = props;

  if (!showViewRecipeModal || !viewingRecipe || typeof document === 'undefined') return null;

  const ingredients = viewingRecipe.ingredients || [];
  const instructions = viewingRecipe.instructions || [];

  const getIngCost = (ing) => {
    const item = inventoryItems.find(i => i.id === ing.inventoryItemId || i._id === ing.inventoryItemId);
    return item ? (ing.quantity || 0) * (item.costPerUnit || 0) : 0;
  };
  const totalCost = ingredients.reduce((s, i) => s + getIngCost(i), 0);
  const costPerServing = viewingRecipe.servings > 0 ? totalCost / viewingRecipe.servings : totalCost;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 10002, padding: 20, overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) setShowViewRecipeModal(false); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: 14,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: isMobile ? '500px' : '700px',
        marginTop: 20, marginBottom: 20,
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '20px 24px', borderRadius: '14px 14px 0 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>{viewingRecipe.name}</h2>
              {viewingRecipe.category && (
                <span style={{
                  display: 'inline-block', marginTop: 8, padding: '3px 12px',
                  backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
                  fontSize: 12, fontWeight: 600, color: '#fff', backdropFilter: 'blur(4px)',
                }}>{viewingRecipe.category}</span>
              )}
            </div>
            <button onClick={() => setShowViewRecipeModal(false)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FaTimes size={16} />
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {viewingRecipe.servings > 0 && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399' }} />
                {viewingRecipe.servings} serving{viewingRecipe.servings !== 1 ? 's' : ''}
              </span>
            )}
            {viewingRecipe.prepTime > 0 && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                {viewingRecipe.prepTime}m prep
              </span>
            )}
            {viewingRecipe.cookTime > 0 && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f87171' }} />
                {viewingRecipe.cookTime}m cook
              </span>
            )}
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginLeft: 'auto' }}>
              Cost: {formatCurrency(costPerServing)}/serving
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {/* Description */}
          {viewingRecipe.description && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{viewingRecipe.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ingredients ({ingredients.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 6 }}>
                {ingredients.map((ing, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    backgroundColor: '#f9fafb', borderRadius: 8, fontSize: 14,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: '#059669', flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 600, color: '#374151' }}>
                      {ing.quantity} {ing.unit}
                    </span>
                    <span style={{ color: '#6b7280' }}>{ing.inventoryItemName || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructions.length > 0 && instructions.some(s => s.trim()) && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Instructions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {instructions.filter(s => s.trim()).map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: 12, padding: '10px 14px',
                    backgroundColor: '#f0fdf4', borderRadius: 8, borderLeft: '3px solid #059669',
                  }}>
                    <span style={{
                      fontWeight: 800, color: '#059669', fontSize: 14, minWidth: 22,
                    }}>{idx + 1}.</span>
                    <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {viewingRecipe.notes && (
            <div style={{
              padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: 8,
              border: '1px solid #fde68a', fontSize: 13, color: '#92400e', lineHeight: 1.5,
            }}>
              <strong>Notes:</strong> {viewingRecipe.notes}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Stock History Modal ─────────────────────────────────────────────────────
function StockHistoryModal({ showStockHistoryModal, setShowStockHistoryModal, stockHistoryItem, stockHistoryData, getModalStyles, getModalContentStyles, formatCurrency }) {
  const transactions = stockHistoryData?.transactions || [];
  const batches = stockHistoryData?.batches || [];

  const typeBadge = (type) => {
    const map = {
      ADDITION: { bg: '#dcfce7', color: '#166534', label: 'Addition' },
      DEDUCTION: { bg: '#fef2f2', color: '#991b1b', label: 'Deduction' },
      ADJUSTMENT: { bg: '#dbeafe', color: '#1e40af', label: 'Adjustment' },
      MANUAL: { bg: '#f3f4f6', color: '#374151', label: 'Manual' },
    };
    const s = map[type] || map.MANUAL;
    return (
      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const priceTrendBadge = (current, previous) => {
    if (current == null || !current || previous == null) return null;
    const curr = parseFloat(current);
    const prev = parseFloat(previous);
    if (!prev && !curr) return null;
    if (!prev && curr > 0) return null; // first purchase, no comparison
    const diff = curr - prev;
    const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : 0;
    if (Math.abs(diff) < 0.01) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#166534' }}>
          = Same price
        </span>
      );
    }
    if (diff > 0) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#fef2f2', color: '#dc2626' }}>
          ▲ +{pct}% ({formatCurrency(diff)} more)
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534' }}>
        ▼ {pct}% ({formatCurrency(Math.abs(diff))} less)
      </span>
    );
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const fmtShortDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const batchStatus = (batch) => {
    if (batch.remainingQty <= 0) return { label: 'Depleted', bg: '#f3f4f6', color: '#6b7280' };
    if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) return { label: 'Expired', bg: '#fef2f2', color: '#ef4444' };
    return { label: 'Active', bg: '#dcfce7', color: '#166534' };
  };

  const daysToExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Compute price trend summary from batches (sorted oldest → newest)
  const pricedBatches = [...batches].filter(b => b.costPerUnit > 0).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const priceHistory = pricedBatches.map(b => ({ cost: b.costPerUnit, date: b.createdAt, supplier: b.supplier }));
  const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].cost : null;
  const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].cost : null;
  const lowestPrice = priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.cost)) : null;
  const highestPrice = priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.cost)) : null;

  return (
    <ModalShell
      show={showStockHistoryModal}
      onClose={() => setShowStockHistoryModal(false)}
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FaHistory size={14} /> Stock History{stockHistoryItem ? ` — ${stockHistoryItem.name}` : ''}</span>}
      getModalStyles={getModalStyles}
      getModalContentStyles={getModalContentStyles}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={secondaryBtn} onClick={() => setShowStockHistoryModal(false)}>Close</button>
        </div>
      }
    >
      {/* ── Price Trend Summary ── */}
      {priceHistory.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)', border: '1px solid #bfdbfe' }}>
          <label style={{ ...labelStyle, fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Price Trend
            {latestPrice && previousPrice && priceTrendBadge(latestPrice, previousPrice)}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Current</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1f2937' }}>{formatCurrency(latestPrice)}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>per {stockHistoryItem?.unit || 'unit'}</div>
            </div>
            {previousPrice && (
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Previous</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#6b7280' }}>{formatCurrency(previousPrice)}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>per {stockHistoryItem?.unit || 'unit'}</div>
              </div>
            )}
            {lowestPrice !== highestPrice && (
              <>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '11px', color: '#059669', marginBottom: '2px' }}>Lowest</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>{formatCurrency(lowestPrice)}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>all time</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: '2px' }}>Highest</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>{formatCurrency(highestPrice)}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>all time</div>
                </div>
              </>
            )}
          </div>
          {/* Mini price timeline */}
          {priceHistory.length > 1 && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {priceHistory.map((p, i) => {
                const prev = i > 0 ? priceHistory[i - 1].cost : null;
                const trendIcon = prev === null ? '' : p.cost > prev ? '▲' : p.cost < prev ? '▼' : '=';
                const trendColor = prev === null ? '#6b7280' : p.cost > prev ? '#dc2626' : p.cost < prev ? '#059669' : '#6b7280';
                return (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', padding: '2px 6px', borderRadius: '6px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <span style={{ color: trendColor, fontWeight: 700 }}>{trendIcon}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(p.cost)}</span>
                    <span style={{ color: '#9ca3af', fontSize: '10px' }}>{fmtShortDate(p.date)}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Transaction Timeline ── */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ ...labelStyle, fontSize: '13px', marginBottom: '12px' }}>Transaction Timeline</label>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>No stock movements recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {transactions.map((tx, i) => {
              const isAdd = tx.type === 'ADDITION';
              const isDeduct = tx.type === 'DEDUCTION';
              const qtyColor = isDeduct ? '#ef4444' : '#059669';
              const qtyPrefix = isDeduct ? '' : '+';
              const qty = tx.quantityChange != null ? Math.abs(tx.quantityChange) : tx.quantity;
              return (
                <div key={tx._id || tx.id || i} style={{
                  padding: '12px 14px', borderLeft: '3px solid #e5e7eb',
                  marginLeft: '8px', position: 'relative',
                  backgroundColor: i === 0 ? '#f0fdf4' : 'transparent',
                  borderRadius: i === 0 ? '0 8px 8px 0' : '0',
                }}>
                  {/* timeline dot */}
                  <div style={{
                    position: 'absolute', left: '-7px', top: '16px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: isAdd ? '#059669' : isDeduct ? '#ef4444' : '#3b82f6',
                    border: '2px solid white', boxShadow: '0 0 0 2px #e5e7eb',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{fmtDate(tx.date || tx.createdAt)}</span>
                    {typeBadge(tx.type)}
                    <span style={{ fontWeight: 700, fontSize: '13px', color: qtyColor }}>
                      {qtyPrefix}{qty} {tx.unit || stockHistoryItem?.unit || ''}
                    </span>
                  </div>
                  {(tx.previousStock != null && tx.newStock != null) && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                      Stock: {tx.previousStock} → {tx.newStock}
                    </div>
                  )}
                  {/* Price info */}
                  {tx.costPerUnit > 0 && (
                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>@ {formatCurrency(tx.costPerUnit)}/{stockHistoryItem?.unit || 'unit'}</span>
                      {tx.totalCost > 0 && <span style={{ color: '#6b7280' }}>= {formatCurrency(tx.totalCost)} total</span>}
                      {priceTrendBadge(tx.costPerUnit, tx.previousCostPerUnit)}
                    </div>
                  )}
                  {tx.notes && (
                    <div style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>{tx.notes}</div>
                  )}
                  {(tx.performedBy || tx.source) && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {tx.performedBy ? `By: ${tx.performedBy}` : ''}{tx.performedBy && tx.source ? ' · ' : ''}{tx.source ? `Source: ${tx.source}` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Active Batches ── */}
      <div>
        <label style={{ ...labelStyle, fontSize: '13px', marginBottom: '12px' }}>Batches</label>
        {batches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>No batch data available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Batch #</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Cost/Unit</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Remaining / Original</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Batch Value</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => {
                  const status = batchStatus(batch);
                  const dte = daysToExpiry(batch.expiryDate);
                  const dteColor = dte === null ? '#9ca3af' : dte <= 0 ? '#ef4444' : dte <= 3 ? '#f59e0b' : '#374151';
                  const batchValue = (batch.remainingQty || 0) * (batch.costPerUnit || 0);
                  // Find previous batch for price comparison
                  const prevBatch = i < batches.length - 1 ? batches[i + 1] : null; // batches sorted newest first
                  return (
                    <tr key={batch._id || batch.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{batches.length - i}</td>
                      <td style={{ padding: '8px 10px' }}>{fmtShortDate(batch.createdAt)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700 }}>{batch.costPerUnit ? formatCurrency(batch.costPerUnit) : '—'}</span>
                          {prevBatch?.costPerUnit > 0 && batch.costPerUnit > 0 && priceTrendBadge(batch.costPerUnit, prevBatch.costPerUnit)}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontWeight: 600 }}>{batch.remainingQty}</span>
                        <span style={{ color: '#9ca3af' }}> / {batch.quantity || batch.originalQty}</span>
                        <span style={{ color: '#9ca3af', marginLeft: '4px' }}>{batch.unit || stockHistoryItem?.unit || ''}</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: batchValue > 0 ? '#1f2937' : '#9ca3af' }}>
                        {batchValue > 0 ? formatCurrency(batchValue) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: dteColor }}>
                        {dte === null ? '—' : dte <= 0 ? `Expired ${Math.abs(dte)}d ago` : `${dte}d`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function DeleteConfirmModal({ deleteConfirmModal, setDeleteConfirmModal, confirmDeleteItem, getModalStyles }) {
  if (!deleteConfirmModal?.show) return null;
  const isLinked = !!deleteConfirmModal.linkedMessage;

  return (
    <div style={getModalStyles()} onClick={() => setDeleteConfirmModal({ show: false, itemId: null, itemName: '', linkedMessage: '' })}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{
          width: '56px', height: '56px', margin: '0 auto 20px',
          backgroundColor: isLinked ? '#fef3c7' : '#fee2e2',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
        }}>
          {isLinked ? '🔗' : '🗑️'}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', textAlign: 'center', marginBottom: '12px' }}>
          {isLinked ? 'Cannot Delete Item' : 'Delete Item?'}
        </h3>

        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' }}>
          {isLinked
            ? deleteConfirmModal.linkedMessage
            : <>Are you sure you want to delete <strong style={{ color: '#1f2937' }}>{deleteConfirmModal.itemName}</strong>? This action cannot be undone.</>
          }
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setDeleteConfirmModal({ show: false, itemId: null, itemName: '', linkedMessage: '' })}
            style={{
              padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isLinked ? 'OK' : 'Cancel'}
          </button>
          {!isLinked && (
            <button
              onClick={confirmDeleteItem}
              style={{
                padding: '10px 24px', backgroundColor: '#dc2626', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InventoryModals(props) {
  return (
    <>
      <AddEditItemModal {...props} />
      <AddSupplierModal {...props} />
      <AddPurchaseOrderModal {...props} />
      <AddRecipeModal {...props} />
      <EditRecipeModal {...props} />
      <ViewRecipeModal {...props} />
      <QuickStockModal {...props} />
      <AddGRNModal {...props} />
      <AddRequisitionModal {...props} />
      <AddInvoiceModal {...props} />
      <AddReturnModal {...props} />
      <AddTransferModal {...props} />
      <QuickOrderModal {...props} />
      <StockHistoryModal {...props} />
      <DeleteConfirmModal {...props} />
    </>
  );
}
