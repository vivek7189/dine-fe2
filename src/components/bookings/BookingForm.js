'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaCheck, FaExclamationTriangle, FaConciergeBell, FaClipboardList, FaDoorOpen, FaArrowLeft, FaUtensils, FaBoxOpen, FaCalendarAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';

export default function BookingForm({ isOpen, onClose, onSave, editingBooking, venues, restaurantId, isMobile, bookingSettings, onVenuesChange }) {
  const enabledTypes = [];
  if (!bookingSettings || bookingSettings.enableCatering !== false) enabledTypes.push('catering');
  if (!bookingSettings || bookingSettings.enableAdvanceOrder !== false) enabledTypes.push('advance_order');
  if (!bookingSettings || bookingSettings.enableVenueBooking !== false) enabledTypes.push('venue');
  const defaultType = enabledTypes[0] || 'catering';

  const [formData, setFormData] = useState({
    type: defaultType,
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
  const [addingVenue, setAddingVenue] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [savingVenue, setSavingVenue] = useState(false);

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

  useEffect(() => {
    if (isOpen && !editingBooking && enabledTypes.length > 0 && !enabledTypes.includes(formData.type)) {
      setFormData(prev => ({ ...prev, type: enabledTypes[0] }));
    }
  }, [isOpen, editingBooking]);

  if (!isOpen) return null;

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

  const handleAddVenue = async () => {
    if (!newVenueName.trim() || !restaurantId) return;
    setSavingVenue(true);
    try {
      const res = await apiClient.request('/api/bookings/' + restaurantId + '/venues', {
        method: 'POST',
        body: { name: newVenueName.trim(), capacity: 0 },
      });
      const newVenue = res.venue || res;
      if (onVenuesChange) {
        onVenuesChange([...(venues || []), newVenue]);
      }
      updateField('venueId', newVenue._id || newVenue.id || '');
      setNewVenueName('');
      setAddingVenue(false);
    } catch (e) {
      console.error('Failed to add venue:', e);
    } finally {
      setSavingVenue(false);
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

  // Type config — venue uses red theme
  const typeConfig = {
    catering: { label: 'Catering', icon: FaConciergeBell, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    advance_order: { label: 'Advance Order', icon: FaClipboardList, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    venue: { label: 'Venue / Place Booking', icon: FaDoorOpen, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  };
  const allTypeOptions = [
    { value: 'catering', label: 'Catering', icon: FaConciergeBell, desc: 'Custom menus for events' },
    { value: 'advance_order', label: 'Advance Order', icon: FaClipboardList, desc: 'Pre-order for pickup/delivery' },
    { value: 'venue', label: 'Venue / Place', icon: FaDoorOpen, desc: 'Reserve halls, rooms & event spaces' },
  ];
  const typeOptions = allTypeOptions.filter(opt => enabledTypes.includes(opt.value));
  const tc = typeConfig[formData.type] || typeConfig.catering;
  const TypeIcon = tc.icon;

  // Subtitles
  const subtitles = {
    catering: { items: 'Search or add custom dishes for the event', customer: 'Phone to auto-fill from saved customers', event: 'When and where is the event happening?', pricing: 'Discounts, taxes & service charges', payment: 'Any advance payment received?' },
    advance_order: { items: 'Search menu or add custom items', customer: 'Phone to auto-fill from saved customers', event: 'When should the order be ready?', pricing: 'Discounts, taxes & service charges', payment: 'Record advance payment' },
    venue: { venue: 'Pick a venue or add a new one', event: 'Schedule, guest count & requirements', customer: 'Contact details for the booking', pricing: 'Charges, discounts & taxes', payment: 'Record advance or deposit' },
  };
  const sub = subtitles[formData.type] || subtitles.catering;

  // Compact shared styles
  const inp = { padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%', boxSizing: 'border-box' };
  const onF = (e) => { e.target.style.borderColor = tc.color; e.target.style.boxShadow = '0 0 0 3px ' + tc.color + '15'; };
  const onB = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };
  const lbl = { fontSize: '10px', fontWeight: '700', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const row = { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' };
  const fld = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: isMobile ? '100%' : 'auto' };

  // Compact section header
  const SH = ({ title, subtitle, step, icon }) => {
    var Icon = icon;
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: subtitle ? '2px' : 0 }}>
          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: tc.gradient, color: '#fff', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</span>
          <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#111827' }}>{title}</h3>
          {icon && <Icon size={11} style={{ color: tc.color, opacity: 0.5 }} />}
        </div>
        {subtitle && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 0 28px', lineHeight: '1.3' }}>{subtitle}</p>}
      </div>
    );
  };

  const card = { background: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', padding: isMobile ? '12px' : '14px 18px', marginBottom: '8px' };

  // ─── Section blocks ────────────────────────────

  const typeSection = (step) => (
    <div style={card}>
      <SH step={step} title="Booking Type" />
      <div style={{ display: 'flex', gap: '8px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {typeOptions.map(opt => {
          var active = formData.type === opt.value;
          var cfg = typeConfig[opt.value];
          var OptIcon = opt.icon;
          return (
            <div
              key={opt.value}
              onClick={() => updateField('type', opt.value)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', position: 'relative',
                border: active ? '2px solid ' + cfg.color : '1.5px solid #e5e7eb',
                background: active ? cfg.bg : '#fafafa',
                transition: 'all 0.2s', minWidth: isMobile ? 'calc(50% - 8px)' : 'auto',
              }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: active ? cfg.gradient : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <OptIcon size={13} style={{ color: active ? '#fff' : '#9ca3af' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: active ? cfg.color : '#6b7280' }}>{opt.label}</div>
                <div style={{ fontSize: '10px', color: active ? cfg.color + 'aa' : '#9ca3af', lineHeight: '1.2' }}>{opt.desc}</div>
              </div>
              {active && (
                <div style={{ position: 'absolute', top: '5px', right: '5px', background: cfg.gradient, color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}><FaCheck /></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Merged Customer + Event section for compact layout
  const customerEventSection = (stepCustomer, stepEvent) => (
    <div style={card}>
      <SH step={stepCustomer} title="Customer & Event Details" subtitle={sub.customer} />
      {/* Customer fields */}
      <div style={row}>
        <div style={{ ...fld, flex: 2 }}>
          <label style={lbl}>Phone</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input style={{ ...inp, flex: 1 }} value={formData.customer.phone} onChange={e => updateField('customer.phone', e.target.value)} placeholder="Phone number" onFocus={onF} onBlur={onB} />
            <button style={{ background: tc.gradient, color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onClick={handleCustomerLookup} title="Lookup customer">
              <FaSearch size={11} />
            </button>
          </div>
          {customerLookupStatus === 'found' && <span style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>Customer found — details filled</span>}
          {customerLookupStatus === 'not_found' && <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>No matching customer</span>}
        </div>
        <div style={fld}><label style={lbl}>Name</label><input style={inp} value={formData.customer.name} onChange={e => updateField('customer.name', e.target.value)} placeholder="Full name" onFocus={onF} onBlur={onB} /></div>
        <div style={fld}><label style={lbl}>Email</label><input style={inp} type="email" value={formData.customer.email} onChange={e => updateField('customer.email', e.target.value)} placeholder="Optional" onFocus={onF} onBlur={onB} /></div>
      </div>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: tc.color, padding: '2px 0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', marginBottom: showAddress ? '8px' : '10px' }}
        onClick={() => setShowAddress(!showAddress)}
      >
        <FaPlus size={8} style={{ transform: showAddress ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        {showAddress ? 'Hide address' : 'Add address'}
      </button>
      {showAddress && (
        <div>
          <div style={row}>
            <div style={fld}><label style={lbl}>Street</label><input style={inp} value={formData.customer.address.street} onChange={e => updateField('customer.address.street', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>Building</label><input style={inp} value={formData.customer.address.building} onChange={e => updateField('customer.address.building', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>City</label><input style={inp} value={formData.customer.address.city} onChange={e => updateField('customer.address.city', e.target.value)} onFocus={onF} onBlur={onB} /></div>
          </div>
          <div style={row}>
            <div style={fld}><label style={lbl}>Landmark</label><input style={inp} value={formData.customer.address.landmark} onChange={e => updateField('customer.address.landmark', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>State</label><input style={inp} value={formData.customer.address.state} onChange={e => updateField('customer.address.state', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>Pincode</label><input style={inp} value={formData.customer.address.pincode} onChange={e => updateField('customer.address.pincode', e.target.value)} onFocus={onF} onBlur={onB} /></div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0 10px 0' }} />

      {/* Event fields */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <FaCalendarAlt size={11} style={{ color: tc.color, opacity: 0.5 }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{formData.type === 'advance_order' ? 'Schedule' : 'Event Details'}</span>
      </div>
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>{formData.type === 'advance_order' ? 'Order Name / Reference' : 'Event Name'}</label>
          <input style={inp} value={formData.eventName} onChange={e => updateField('eventName', e.target.value)} placeholder={formData.type === 'advance_order' ? 'e.g. Birthday cake order' : 'e.g. Wedding Reception'} onFocus={onF} onBlur={onB} />
        </div>
        {formData.type !== 'advance_order' && (
          <div style={fld}>
            <label style={lbl}>Guest Count</label>
            <input style={inp} type="number" value={formData.guestCount} onChange={e => updateField('guestCount', e.target.value)} placeholder="Guests" onFocus={onF} onBlur={onB} />
          </div>
        )}
      </div>
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>{formData.type === 'advance_order' ? 'Pickup / Delivery Date' : 'Start Date'}</label>
          <input style={inp} type="date" value={formData.eventDate} onChange={e => updateField('eventDate', e.target.value)} onFocus={onF} onBlur={onB} />
        </div>
        {formData.type !== 'advance_order' && (
          <div style={fld}>
            <label style={lbl}>End Date (optional)</label>
            <input style={inp} type="date" value={formData.endDate} onChange={e => updateField('endDate', e.target.value)} onFocus={onF} onBlur={onB} />
          </div>
        )}
        <div style={fld}>
          <label style={lbl}>{formData.type === 'advance_order' ? 'Ready By' : 'Start Time'}</label>
          <input style={inp} type="time" value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} onFocus={onF} onBlur={onB} />
        </div>
        {formData.type !== 'advance_order' && (
          <div style={fld}>
            <label style={lbl}>End Time</label>
            <input style={inp} type="time" value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} onFocus={onF} onBlur={onB} />
          </div>
        )}
      </div>
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>Special Instructions</label>
          <textarea style={{ ...inp, resize: 'vertical', minHeight: '40px' }} value={formData.specialInstructions} onChange={e => updateField('specialInstructions', e.target.value)} placeholder={formData.type === 'advance_order' ? 'Delivery notes, packaging...' : 'Decor, dietary needs...'} onFocus={onF} onBlur={onB} />
        </div>
      </div>
    </div>
  );

  const venueSection = (step) => (
    <div style={card}>
      <SH step={step} title="Venue / Place" subtitle={sub.venue} icon={FaDoorOpen} />
      <div style={row}>
        <div style={{ ...fld, flex: 2 }}>
          <label style={lbl}>Select Venue</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select style={{ ...inp, cursor: 'pointer', flex: 1 }} value={formData.venueId} onChange={e => { updateField('venueId', e.target.value); setVenueAvailability(null); }}>
              <option value="">Choose a venue...</option>
              {(venues || []).map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
            </select>
            <button
              style={{ background: addingVenue ? '#f3f4f6' : tc.gradient, color: addingVenue ? '#374151' : '#fff', border: addingVenue ? '1.5px solid #d1d5db' : 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '500', gap: '4px' }}
              onClick={() => setAddingVenue(!addingVenue)}
              title="Add new venue"
            >
              <FaPlus size={10} /> Add
            </button>
          </div>
        </div>
      </div>
      {addingVenue && (
        <div style={{ ...row, alignItems: 'flex-end' }}>
          <div style={fld}>
            <label style={lbl}>New Venue Name</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                autoFocus
                style={inp}
                value={newVenueName}
                onChange={e => setNewVenueName(e.target.value)}
                placeholder="e.g. Main Hall, Banquet Room..."
                onFocus={onF}
                onBlur={onB}
                onKeyDown={e => { if (e.key === 'Enter') handleAddVenue(); }}
              />
              <button
                style={{ background: tc.gradient, color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', opacity: savingVenue ? 0.6 : 1 }}
                onClick={handleAddVenue}
                disabled={savingVenue}
              >
                {savingVenue ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {formData.venueId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: '1.5px solid #d1d5db', background: '#f3f4f6', color: '#374151', fontWeight: '500' }} onClick={handleCheckVenueAvailability}>Check Availability</button>
          {venueAvailability === 'available' && <span style={{ color: '#16a34a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}><FaCheck size={10} /> Available</span>}
          {venueAvailability === 'conflict' && <span style={{ color: '#dc2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}><FaExclamationTriangle size={10} /> Conflict</span>}
        </div>
      )}
    </div>
  );

  const itemsSection = (step) => (
    <div style={card}>
      <SH step={step} title={formData.type === 'advance_order' ? 'Order Items' : 'Menu Items'} subtitle={sub.items} icon={FaUtensils} />
      <div style={{ ...row, alignItems: 'flex-end' }}>
        <div style={{ ...fld, position: 'relative' }}>
          <label style={lbl}>Search Menu</label>
          <input
            style={inp}
            value={menuSearch}
            onChange={e => { setMenuSearch(e.target.value); setShowSearchResults(true); }}
            onFocus={(e) => { onF(e); menuSearch && setShowSearchResults(true); }}
            onBlur={onB}
            placeholder="Type to search..."
          />
          {showSearchResults && menuSearch && filteredMenuItems.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '4px' }}>
              {filteredMenuItems.slice(0, 10).map(item => (
                <div
                  key={item._id || item.id || item.name}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => addMenuItem(item)}
                  onMouseEnter={e => e.currentTarget.style.background = tc.bg}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span>{item.name}</span>
                  {item.price ? <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>{'\u20B9'}{item.price}</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>
        <button style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={addCustomItem}>
          <FaPlus size={9} /> Custom
        </button>
      </div>

      {formData.items.length > 0 && (
        <div style={{ marginTop: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: '600', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: '600', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '6px 10px', fontWeight: '600', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: '600', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Total</th>
                <th style={{ width: '28px', padding: '6px 4px' }}></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 10px' }}>
                    {item.isCustom ? (
                      <input style={{ ...inp, padding: '4px 8px', fontSize: '12px' }} value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Item name" onFocus={onF} onBlur={onB} />
                    ) : (
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827', fontSize: '12px' }}>{item.name}</div>
                        <input style={{ ...inp, fontSize: '10px', marginTop: '2px', padding: '2px 6px', color: '#6b7280' }} value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Notes..." onFocus={onF} onBlur={onB} />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                    {item.isCustom ? (
                      <input style={{ ...inp, width: '70px', padding: '4px 8px', fontSize: '12px', textAlign: 'right' }} type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} onFocus={onF} onBlur={onB} />
                    ) : (
                      <span style={{ fontWeight: '500', fontSize: '12px' }}>{'\u20B9'}{item.price}</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    <input style={{ ...inp, width: '48px', padding: '4px', fontSize: '12px', textAlign: 'center' }} type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} onFocus={onF} onBlur={onB} />
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '600', color: '#111827', fontSize: '12px' }}>{'\u20B9'}{((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)).toFixed(2)}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                    <button style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.6 }} onClick={() => removeItem(idx)}><FaTrash size={10} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formData.items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#d1d5db' }}>
          <FaBoxOpen size={22} style={{ opacity: 0.4 }} />
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>No items added yet</p>
        </div>
      )}
    </div>
  );

  // Merged Pricing + Payment + Options into single compact card
  const pricingPaymentSection = (stepPricing) => (
    <div style={card}>
      <SH step={stepPricing} title="Pricing & Payment" subtitle={sub.pricing} />
      <div style={{ background: '#fafafa', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Subtotal</span>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>{'\u20B9'}{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '55px' }}>Discount</span>
          <select style={{ ...inp, width: '50px', padding: '4px 6px', fontSize: '12px' }} value={formData.discount.type} onChange={e => updateField('discount.type', e.target.value)}>
            <option value="percentage">%</option>
            <option value="flat">Flat</option>
          </select>
          <input style={{ ...inp, width: '65px', padding: '4px 8px', fontSize: '12px' }} type="number" value={formData.discount.value} onChange={e => updateField('discount.value', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
          {discountAmount > 0 && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>-{'\u20B9'}{discountAmount.toFixed(2)}</span>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '55px' }}>Tax</span>
            <input style={{ ...inp, width: '80px', padding: '4px 8px', fontSize: '12px' }} type="number" value={formData.taxAmount} onChange={e => updateField('taxAmount', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '55px' }}>Service</span>
            <input style={{ ...inp, width: '80px', padding: '4px 8px', fontSize: '12px' }} type="number" value={formData.serviceCharge} onChange={e => updateField('serviceCharge', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: tc.gradient, borderRadius: '8px', marginTop: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Total</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{'\u20B9'}{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment inline */}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
          <input type="checkbox" checked={formData.payment.enabled} onChange={e => updateField('payment.enabled', e.target.checked)} style={{ accentColor: tc.color, width: '14px', height: '14px' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Advance Payment</span>
        </label>
        {formData.payment.enabled && (
          <>
            <input style={{ ...inp, width: '90px', padding: '4px 8px', fontSize: '12px' }} type="number" value={formData.payment.amount} onChange={e => updateField('payment.amount', e.target.value)} placeholder="Amount" onFocus={onF} onBlur={onB} />
            <select style={{ ...inp, width: '90px', padding: '4px 6px', fontSize: '12px', cursor: 'pointer' }} value={formData.payment.method} onChange={e => updateField('payment.method', e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </>
        )}
        <span style={{ color: '#e5e7eb', fontSize: '14px' }}>|</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.trackInExpenses} onChange={e => updateField('trackInExpenses', e.target.checked)} style={{ accentColor: tc.color, width: '14px', height: '14px' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Track in Expenses</span>
        </label>
      </div>
    </div>
  );

  // Section ordering — merged customer+event, merged pricing+payment+options
  const getSections = () => {
    if (formData.type === 'advance_order') return <>{typeSection(1)}{itemsSection(2)}{customerEventSection(3, 4)}{pricingPaymentSection(4)}</>;
    if (formData.type === 'venue') return <>{typeSection(1)}{venueSection(2)}{customerEventSection(3, 4)}{pricingPaymentSection(4)}</>;
    return <>{typeSection(1)}{itemsSection(2)}{customerEventSection(3, 4)}{pricingPaymentSection(4)}</>;
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#f7f8fa', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: '#fff', padding: '0 16px', height: '50px', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#374151',
              padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <FaArrowLeft size={12} />
          </button>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#111827' }}>
              {editingBooking ? 'Edit Booking' : 'New Booking'}
            </h2>
          </div>

          {/* Type badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '16px',
            background: tc.bg, border: '1px solid ' + tc.border,
          }}>
            <TypeIcon size={10} style={{ color: tc.color }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: tc.color }}>{tc.label}</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
              padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            title="Close"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '16px', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          {getSections()}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0
        }}>
          <button
            style={{ background: 'none', color: '#6b7280', border: 'none', padding: '8px 12px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px' }}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {totalAmount > 0 && (
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Total: {'\u20B9'}{totalAmount.toFixed(2)}</span>
            )}
            <button
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: tc.gradient, color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                boxShadow: '0 2px 8px ' + tc.color + '30'
              }}
              onClick={handleSave}
            >
              <FaCheck size={10} /> Save Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
