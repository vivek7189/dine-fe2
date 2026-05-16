'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../lib/api';

export default function BookingForm({ isOpen, onClose, onSave, editingBooking, venues, restaurantId, isMobile }) {
  const [formData, setFormData] = useState({
    type: 'catering',
    customer: { phone: '', name: '', email: '', address: { street: '', building: '', landmark: '', city: '', state: '', pincode: '' } },
    eventName: '',
    eventDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    specialInstructions: '',
    venueId: '',
    items: [],
    discount: { type: 'percentage', value: '' },
    taxAmount: '',
    serviceCharge: '',
    payment: { enabled: false, amount: '', method: 'cash' },
    trackInExpenses: false,
  });

  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [customerLookupStatus, setCustomerLookupStatus] = useState(null);
  const [venueAvailability, setVenueAvailability] = useState(null);
  const [showAddress, setShowAddress] = useState(false);

  // Load menu items on mount
  useEffect(() => {
    if (restaurantId) {
      apiClient.request('/api/menus/' + restaurantId)
        .then(data => {
          const items = Array.isArray(data) ? data : (data?.items || data?.menuItems || []);
          setMenuItems(items);
        })
        .catch(() => setMenuItems([]));
    }
  }, [restaurantId]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        type: editingBooking.type || 'catering',
        customer: {
          phone: editingBooking.customer?.phone || '',
          name: editingBooking.customer?.name || '',
          email: editingBooking.customer?.email || '',
          address: {
            street: editingBooking.customer?.address?.street || '',
            building: editingBooking.customer?.address?.building || '',
            landmark: editingBooking.customer?.address?.landmark || '',
            city: editingBooking.customer?.address?.city || '',
            state: editingBooking.customer?.address?.state || '',
            pincode: editingBooking.customer?.address?.pincode || '',
          },
        },
        eventName: editingBooking.eventName || '',
        eventDate: editingBooking.eventDate || '',
        endDate: editingBooking.endDate || '',
        startTime: editingBooking.startTime || '',
        endTime: editingBooking.endTime || '',
        guestCount: editingBooking.guestCount || '',
        specialInstructions: editingBooking.specialInstructions || '',
        venueId: editingBooking.venueId || '',
        items: editingBooking.items || [],
        discount: editingBooking.discount || { type: 'percentage', value: '' },
        taxAmount: editingBooking.taxAmount || '',
        serviceCharge: editingBooking.serviceCharge || '',
        payment: editingBooking.payment || { enabled: false, amount: '', method: 'cash' },
        trackInExpenses: editingBooking.trackInExpenses || false,
      });
    }
  }, [editingBooking]);

  if (!isOpen) return null;

  // Helpers
  const updateField = (path, value) => {
    setFormData(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleCustomerLookup = async () => {
    if (!formData.customer.phone) return;
    setCustomerLookupStatus('loading');
    try {
      const result = await apiClient.request('/api/public/customer/lookup', {
        method: 'POST',
        body: { restaurantId, phone: formData.customer.phone },
      });
      if (result && (result.name || result.email)) {
        updateField('customer.name', result.name || '');
        updateField('customer.email', result.email || '');
        if (result.address) {
          updateField('customer.address', { ...formData.customer.address, ...result.address });
        }
        setCustomerLookupStatus('found');
      } else {
        setCustomerLookupStatus('not_found');
      }
    } catch {
      setCustomerLookupStatus('not_found');
    }
  };

  const handleCheckVenueAvailability = async () => {
    if (!formData.venueId || !formData.eventDate || !formData.startTime || !formData.endTime) return;
    setVenueAvailability('loading');
    try {
      const result = await apiClient.checkVenueAvailability(
        restaurantId, formData.venueId, formData.eventDate, formData.startTime, formData.endTime
      );
      setVenueAvailability(result?.available ? 'available' : 'conflict');
    } catch {
      setVenueAvailability('conflict');
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const addMenuItem = (item) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: item._id || item.id, name: item.name, price: item.price || 0, qty: 1, notes: '', isCustom: false }],
    }));
    setMenuSearch('');
    setShowSearchResults(false);
  };

  const addCustomItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), name: '', price: 0, qty: 1, notes: '', isCustom: true }],
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.qty) || 0), 0);
  const discountAmount = formData.discount.type === 'percentage'
    ? subtotal * (parseFloat(formData.discount.value) || 0) / 100
    : parseFloat(formData.discount.value) || 0;
  const taxAmount = parseFloat(formData.taxAmount) || 0;
  const serviceCharge = parseFloat(formData.serviceCharge) || 0;
  const totalAmount = subtotal - discountAmount + taxAmount + serviceCharge;

  const handleSave = () => {
    onSave({ ...formData, subtotal, discountAmount, taxAmount, serviceCharge, totalAmount });
  };

  // Styles
  const styles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: '#fff', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    headerTitle: { fontSize: '20px', fontWeight: '600', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#6b7280', padding: '4px' },
    body: { flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' },
    section: { marginBottom: '32px' },
    sectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' },
    row: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' },
    field: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: isMobile ? '100%' : 'auto' },
    label: { fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' },
    input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    select: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' },
    textarea: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' },
    radioGroup: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' },
    btn: { padding: '8px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', border: 'none', fontWeight: '500' },
    btnPrimary: { background: '#2563eb', color: '#fff' },
    btnSecondary: { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
    btnDanger: { background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#6b7280', fontSize: '13px' },
    td: { padding: '8px', borderBottom: '1px solid #f3f4f6' },
    searchWrapper: { position: 'relative' },
    searchResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    searchItem: { padding: '8px 12px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  };

  const modalContent = (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
          <button style={styles.closeBtn} onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Section 1: Booking Type */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Booking Type</h3>
            <div style={styles.radioGroup}>
              {[{ value: 'catering', label: 'Catering' }, { value: 'advance_order', label: 'Advance Order' }, { value: 'venue', label: 'Venue Booking' }].map(opt => (
                <label key={opt.value} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="bookingType"
                    value={opt.value}
                    checked={formData.type === opt.value}
                    onChange={() => updateField('type', opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Customer Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Info</h3>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 2 }}>
                <label style={styles.label}>Phone</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={formData.customer.phone}
                    onChange={e => updateField('customer.phone', e.target.value)}
                    placeholder="Phone number"
                  />
                  <button
                    style={{ ...styles.btn, ...styles.btnSecondary }}
                    onClick={handleCustomerLookup}
                    title="Lookup customer"
                  >
                    <FaSearch />
                  </button>
                </div>
                {customerLookupStatus === 'found' && (
                  <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Customer found</span>
                )}
                {customerLookupStatus === 'not_found' && (
                  <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>No customer found</span>
                )}
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  value={formData.customer.name}
                  onChange={e => updateField('customer.name', e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={formData.customer.email}
                  onChange={e => updateField('customer.email', e.target.value)}
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Collapsible Address */}
            <div style={{ marginTop: '8px' }}>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary, fontSize: '13px', padding: '6px 12px' }}
                onClick={() => setShowAddress(!showAddress)}
              >
                {showAddress ? 'Hide Address' : 'Address'}
              </button>
              {showAddress && (
                <div style={{ marginTop: '12px' }}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Street</label>
                      <input style={styles.input} value={formData.customer.address.street} onChange={e => updateField('customer.address.street', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Building</label>
                      <input style={styles.input} value={formData.customer.address.building} onChange={e => updateField('customer.address.building', e.target.value)} />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Landmark</label>
                      <input style={styles.input} value={formData.customer.address.landmark} onChange={e => updateField('customer.address.landmark', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>City</label>
                      <input style={styles.input} value={formData.customer.address.city} onChange={e => updateField('customer.address.city', e.target.value)} />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>State</label>
                      <input style={styles.input} value={formData.customer.address.state} onChange={e => updateField('customer.address.state', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Pincode</label>
                      <input style={styles.input} value={formData.customer.address.pincode} onChange={e => updateField('customer.address.pincode', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Event Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Event Details</h3>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Event Name</label>
                <input style={styles.input} value={formData.eventName} onChange={e => updateField('eventName', e.target.value)} placeholder="Event name" />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Event Date</label>
                <input style={styles.input} type="date" value={formData.eventDate} onChange={e => updateField('eventDate', e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>End Date (optional)</label>
                <input style={styles.input} type="date" value={formData.endDate} onChange={e => updateField('endDate', e.target.value)} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Start Time</label>
                <input style={styles.input} type="time" value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>End Time</label>
                <input style={styles.input} type="time" value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Guest Count</label>
                <input style={styles.input} type="number" value={formData.guestCount} onChange={e => updateField('guestCount', e.target.value)} placeholder="Number of guests" />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Special Instructions</label>
                <textarea style={styles.textarea} value={formData.specialInstructions} onChange={e => updateField('specialInstructions', e.target.value)} placeholder="Any special requirements..." />
              </div>
            </div>
          </div>

          {/* Section 4: Venue Selection (only for venue type) */}
          {formData.type === 'venue' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Venue Selection</h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Venue</label>
                  <select style={styles.select} value={formData.venueId} onChange={e => { updateField('venueId', e.target.value); setVenueAvailability(null); }}>
                    <option value="">Select a venue</option>
                    {(venues || []).map(v => (
                      <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                  onClick={handleCheckVenueAvailability}
                >
                  Check Availability
                </button>
                {venueAvailability === 'available' && (
                  <span style={{ color: '#16a34a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCheck /> Available
                  </span>
                )}
                {venueAvailability === 'conflict' && (
                  <span style={{ color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaExclamationTriangle /> Conflict
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Items (not for venue type) */}
          {formData.type !== 'venue' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Items</h3>
              <div style={{ ...styles.row, alignItems: 'flex-end' }}>
                <div style={{ ...styles.field, ...styles.searchWrapper }}>
                  <label style={styles.label}>Search Menu</label>
                  <input
                    style={styles.input}
                    value={menuSearch}
                    onChange={e => { setMenuSearch(e.target.value); setShowSearchResults(true); }}
                    onFocus={() => menuSearch && setShowSearchResults(true)}
                    placeholder="Search items..."
                  />
                  {showSearchResults && menuSearch && filteredMenuItems.length > 0 && (
                    <div style={styles.searchResults}>
                      {filteredMenuItems.slice(0, 10).map(item => (
                        <div
                          key={item._id || item.id || item.name}
                          style={styles.searchItem}
                          onClick={() => addMenuItem(item)}
                          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          {item.name} {item.price ? `- ₹${item.price}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button style={{ ...styles.btn, ...styles.btnSecondary, marginBottom: '0' }} onClick={addCustomItem}>
                  <FaPlus style={{ marginRight: '4px' }} /> Add Custom Item
                </button>
              </div>

              {formData.items.length > 0 && (
                <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={styles.td}>
                            {item.isCustom ? (
                              <input style={{ ...styles.input, width: '100%' }} value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Item name" />
                            ) : (
                              <div>
                                <div>{item.name}</div>
                                <input style={{ ...styles.input, fontSize: '12px', marginTop: '4px', padding: '4px 8px' }} value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Notes (optional)" />
                              </div>
                            )}
                          </td>
                          <td style={styles.td}>
                            {item.isCustom ? (
                              <input style={{ ...styles.input, width: '80px' }} type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} />
                            ) : (
                              `₹${item.price}`
                            )}
                          </td>
                          <td style={styles.td}>
                            <input style={{ ...styles.input, width: '60px' }} type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                          </td>
                          <td style={styles.td}>₹{((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)).toFixed(2)}</td>
                          <td style={styles.td}>
                            <button style={styles.btnDanger} onClick={() => removeItem(idx)}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section 6: Pricing */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Pricing</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{subtotal.toFixed(2)}</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Discount</span>
                  <select
                    style={{ ...styles.select, padding: '4px 8px', fontSize: '13px' }}
                    value={formData.discount.type}
                    onChange={e => updateField('discount.type', e.target.value)}
                  >
                    <option value="percentage">%</option>
                    <option value="flat">Flat</option>
                  </select>
                  <input
                    style={{ ...styles.input, width: '80px', padding: '4px 8px' }}
                    type="number"
                    value={formData.discount.value}
                    onChange={e => updateField('discount.value', e.target.value)}
                    placeholder="0"
                  />
                  <span style={{ fontSize: '14px', color: '#ef4444' }}>-₹{discountAmount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '100px' }}>Tax Amount</span>
                <input
                  style={{ ...styles.input, width: '100px', padding: '4px 8px' }}
                  type="number"
                  value={formData.taxAmount}
                  onChange={e => updateField('taxAmount', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '100px' }}>Service Charge</span>
                <input
                  style={{ ...styles.input, width: '100px', padding: '4px 8px' }}
                  type="number"
                  value={formData.serviceCharge}
                  onChange={e => updateField('serviceCharge', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Total Amount</span>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 7: Payment */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment</h3>
            <div style={styles.toggleRow}>
              <input
                type="checkbox"
                id="advancePayment"
                checked={formData.payment.enabled}
                onChange={e => updateField('payment.enabled', e.target.checked)}
              />
              <label htmlFor="advancePayment" style={{ fontSize: '14px', cursor: 'pointer' }}>Record Advance Payment</label>
            </div>
            {formData.payment.enabled && (
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Amount</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formData.payment.amount}
                    onChange={e => updateField('payment.amount', e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Method</label>
                  <select style={styles.select} value={formData.payment.method} onChange={e => updateField('payment.method', e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 8: Options */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Options</h3>
            <div style={styles.toggleRow}>
              <input
                type="checkbox"
                id="trackExpenses"
                checked={formData.trackInExpenses}
                onChange={e => updateField('trackInExpenses', e.target.checked)}
              />
              <label htmlFor="trackExpenses" style={{ fontSize: '14px', cursor: 'pointer' }}>Track in Expenses</label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
