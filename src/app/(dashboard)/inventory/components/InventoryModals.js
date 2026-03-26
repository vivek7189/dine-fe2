'use client';

import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSave, FaCamera, FaMinus } from 'react-icons/fa';

const units = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'bunch', 'bottle', 'can', 'bag', 'box', 'pack'];

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
  fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fafafa'
};

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' };

const fieldWrap = { marginBottom: '12px' };

const primaryBtn = {
  padding: '10px 22px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none',
  borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
};

const secondaryBtn = {
  padding: '10px 18px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none',
  borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'background-color 0.2s'
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

function FocusInput({ style, ...props }) {
  return (
    <input
      style={style || inputStyle}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.backgroundColor = '#fff'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#fafafa'; }}
      {...props}
    />
  );
}

function FocusTextarea({ style, ...props }) {
  return (
    <textarea
      style={{ ...(style || inputStyle), minHeight: '60px', resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.backgroundColor = '#fff'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#fafafa'; }}
      {...props}
    />
  );
}

function FocusSelect({ style, children, ...props }) {
  return (
    <select
      style={{ ...(style || inputStyle), cursor: 'pointer', appearance: 'auto' }}
      onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.backgroundColor = '#fff'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#fafafa'; }}
      {...props}
    >
      {children}
    </select>
  );
}

function ModalShell({ show, onClose, title, children, getModalStyles, getModalContentStyles }) {
  if (!show) return null;
  return (
    <div style={getModalStyles()} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...getModalContentStyles(), padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
            }}
          >
            <FaTimes size={14} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Item Modal ───────────────────────────────────────────────────
function AddEditItemModal(props) {
  const {
    showAddModal, setShowAddModal, showEditModal, setShowEditModal,
    formData, setFormData, categories, suppliers, editingItem,
    handleAddItem, handleUpdateItem, getModalStyles, getModalContentStyles
  } = props;

  const isOpen = showAddModal || showEditModal;
  const isEdit = showEditModal && editingItem;

  const close = () => { isEdit ? setShowEditModal(false) : setShowAddModal(false); };
  const update = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <ModalShell show={isOpen} onClose={close} title={isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Name *</label>
          <FocusInput value={formData.name} onChange={e => update('name', e.target.value)} placeholder="Item name" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Category</label>
          <FocusSelect value={formData.category} onChange={e => update('category', e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id || c.name || c} value={c.name || c}>{c.name || c}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Unit</label>
          <FocusSelect value={formData.unit} onChange={e => update('unit', e.target.value)}>
            <option value="">Select unit</option>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Current Stock</label>
          <FocusInput type="number" value={formData.currentStock} onChange={e => update('currentStock', parseFloat(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Min Stock</label>
          <FocusInput type="number" value={formData.minStock} onChange={e => update('minStock', parseFloat(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Max Stock</label>
          <FocusInput type="number" value={formData.maxStock} onChange={e => update('maxStock', parseFloat(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Cost Per Unit</label>
          <FocusInput type="number" step="0.01" value={formData.costPerUnit} onChange={e => update('costPerUnit', parseFloat(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Supplier</label>
          <FocusSelect value={formData.supplier} onChange={e => update('supplier', e.target.value)}>
            <option value="">Select supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.name || s.id}>{s.name}</option>)}
          </FocusSelect>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Barcode</label>
          <FocusInput value={formData.barcode} onChange={e => update('barcode', e.target.value)} placeholder="Barcode" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Expiry Date</label>
          <FocusInput type="date" value={formData.expiryDate} onChange={e => update('expiryDate', e.target.value)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Location</label>
          <FocusInput value={formData.location} onChange={e => update('location', e.target.value)} placeholder="Storage location" />
        </div>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <FocusTextarea value={formData.description} onChange={e => update('description', e.target.value)} placeholder="Description" />
        </div>
      </div>
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={close}>Cancel</button>
        <button style={primaryBtn} onClick={isEdit ? handleUpdateItem : handleAddItem}>
          <FaSave /> {isEdit ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </ModalShell>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddSupplierModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={handleAddSupplier}><FaSave /> Add Supplier</button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddPurchaseOrderModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={handleAddPurchaseOrder}><FaSave /> Create Order</button>
      </div>
    </ModalShell>
  );
}

// ─── Add Recipe Modal ────────────────────────────────────────────────────────
function AddRecipeModal(props) {
  const {
    showAddRecipeModal, setShowAddRecipeModal,
    recipeFormData, setRecipeFormData,
    handleAddRecipe, addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredient,
    addRecipeInstruction, removeRecipeInstruction, updateRecipeInstruction,
    inventoryItems, getModalStyles, getModalContentStyles
  } = props;

  const update = (field, value) => setRecipeFormData({ ...recipeFormData, [field]: value });

  return (
    <ModalShell show={showAddRecipeModal} onClose={() => setShowAddRecipeModal(false)} title="Add Recipe"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Recipe Name *</label>
          <FocusInput value={recipeFormData.name} onChange={e => update('name', e.target.value)} placeholder="Recipe name" />
        </div>
        <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <FocusTextarea value={recipeFormData.description} onChange={e => update('description', e.target.value)} placeholder="Description" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Category</label>
          <FocusInput value={recipeFormData.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Main Course" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Servings</label>
          <FocusInput type="number" min="1" value={recipeFormData.servings} onChange={e => update('servings', parseInt(e.target.value) || 1)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Prep Time (min)</label>
          <FocusInput type="number" min="0" value={recipeFormData.prepTime} onChange={e => update('prepTime', parseInt(e.target.value) || 0)} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Cook Time (min)</label>
          <FocusInput type="number" min="0" value={recipeFormData.cookTime} onChange={e => update('cookTime', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ marginBottom: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Ingredients *</label>
          <button style={secondaryBtn} onClick={addRecipeIngredient}><FaPlus /> Add Ingredient</button>
        </div>
        {recipeFormData.ingredients.map((ing, index) => (
          <div key={index} style={rowStyle}>
            <FocusSelect style={{ ...inputStyle, flex: 2 }} value={ing.inventoryItemId}
              onChange={e => updateRecipeIngredient(index, 'inventoryItemId', e.target.value)}>
              <option value="">Select item</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </FocusSelect>
            <FocusInput style={{ ...inputStyle, flex: 1 }} type="number" min="0" step="0.1" placeholder="Qty"
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
        ))}
      </div>

      {/* Instructions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Instructions</label>
          <button style={secondaryBtn} onClick={addRecipeInstruction}><FaPlus /> Add Step</button>
        </div>
        {recipeFormData.instructions.map((inst, index) => (
          <div key={index} style={{ ...rowStyle, alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 700, color: '#059669', minWidth: '28px', paddingTop: '14px', fontSize: '14px' }}>
              {index + 1}.
            </span>
            <FocusTextarea style={{ ...inputStyle, flex: 1, minHeight: '60px' }} value={inst}
              onChange={e => updateRecipeInstruction(index, e.target.value)} placeholder={`Step ${index + 1}`} />
            {recipeFormData.instructions.length > 1 && (
              <button style={{ ...dangerBtn, marginTop: '10px' }} onClick={() => removeRecipeInstruction(index)}><FaTrash /></button>
            )}
          </div>
        ))}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <FocusTextarea value={recipeFormData.notes} onChange={e => update('notes', e.target.value)} placeholder="Additional notes" />
      </div>
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddRecipeModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={handleAddRecipe}><FaSave /> Create Recipe</button>
      </div>
    </ModalShell>
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

  const getAdjustment = (itemId) => {
    const entry = quickStockItems.find(q => q.itemId === itemId);
    return entry ? entry.adjustment : 0;
  };

  const setAdjustment = (itemId, adjustment) => {
    const existing = quickStockItems.filter(q => q.itemId !== itemId);
    if (adjustment !== 0) {
      existing.push({ itemId, adjustment });
    }
    setQuickStockItems(existing);
  };

  const adjustBy = (itemId, delta) => {
    setAdjustment(itemId, getAdjustment(itemId) + delta);
  };

  const changedCount = quickStockItems.filter(q => q.adjustment !== 0).length;
  const filteredItems = inventoryItems.filter(item =>
    item.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ModalShell show={showQuickStockModal} onClose={() => setShowQuickStockModal(false)} title="Quick Stock Update"
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '8px',
              backgroundColor: hasChange ? '#ecfdf5' : '#f9fafb',
              border: hasChange ? '1px solid #a7f3d0' : '1px solid transparent',
              transition: 'all 0.2s'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
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
          );
        })}
      </div>

      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => { setShowQuickStockModal(false); setQuickStockItems([]); }}>Cancel</button>
        <button style={{ ...primaryBtn, opacity: changedCount === 0 ? 0.5 : 1 }}
          disabled={changedCount === 0}
          onClick={() => handleQuickStockUpdate(quickStockItems.filter(q => q.adjustment !== 0))}>
          <FaSave /> Save All Changes {changedCount > 0 && `(${changedCount})`}
        </button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddGRNModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={() => setShowAddGRNModal(false)}><FaSave /> Create GRN</button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddRequisitionModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={() => setShowAddRequisitionModal(false)}><FaSave /> Create Requisition</button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>

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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddInvoiceModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={() => setShowAddInvoiceModal(false)}><FaSave /> Save Invoice</button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddReturnModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={() => setShowAddReturnModal(false)}><FaSave /> Create Return</button>
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
      getModalStyles={getModalStyles} getModalContentStyles={getModalContentStyles}>
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
      <div style={footerStyle}>
        <button style={secondaryBtn} onClick={() => setShowAddTransferModal(false)}>Cancel</button>
        <button style={primaryBtn} onClick={() => setShowAddTransferModal(false)}><FaSave /> Create Transfer</button>
      </div>
    </ModalShell>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function InventoryModals(props) {
  return (
    <>
      <AddEditItemModal {...props} />
      <AddSupplierModal {...props} />
      <AddPurchaseOrderModal {...props} />
      <AddRecipeModal {...props} />
      <QuickStockModal {...props} />
      <AddGRNModal {...props} />
      <AddRequisitionModal {...props} />
      <AddInvoiceModal {...props} />
      <AddReturnModal {...props} />
      <AddTransferModal {...props} />
    </>
  );
}
