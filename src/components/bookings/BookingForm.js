'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaCheck, FaExclamationTriangle, FaConciergeBell, FaClipboardList, FaDoorOpen, FaArrowLeft, FaUtensils, FaBoxOpen, FaCalendarAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';

export default function BookingForm({ isOpen, onClose, onSave, editingBooking, venues, restaurantId, isMobile, bookingSettings }) {
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

  // Type config
  const typeConfig = {
    catering: { label: 'Catering', icon: FaConciergeBell, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    advance_order: { label: 'Advance Order', icon: FaClipboardList, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    venue: { label: 'Venue Booking', icon: FaDoorOpen, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  };
  const allTypeOptions = [
    { value: 'catering', label: 'Catering', icon: FaConciergeBell, desc: 'Custom menus for events' },
    { value: 'advance_order', label: 'Advance Order', icon: FaClipboardList, desc: 'Pre-order for pickup/delivery' },
    { value: 'venue', label: 'Venue Booking', icon: FaDoorOpen, desc: 'Reserve halls & spaces' },
  ];
  const typeOptions = allTypeOptions.filter(opt => enabledTypes.includes(opt.value));
  const tc = typeConfig[formData.type] || typeConfig.catering;
  const TypeIcon = tc.icon;

  // Subtitles
  const subtitles = {
    catering: { items: 'Plan the menu \u2014 search or add custom dishes for the event', customer: 'Who is hosting? Enter phone to auto-fill from saved customers', event: 'When and where is the event happening?', pricing: 'Apply discounts, taxes, and service charges', payment: 'Has the customer paid any advance?' },
    advance_order: { items: 'What would you like to pre-order? Search your menu or add custom items', customer: 'Who is placing the order? Enter phone to auto-fill', event: 'When should the order be ready for pickup or delivery?', pricing: 'Apply discounts, taxes, and service charges', payment: 'Record any advance payment received' },
    venue: { venue: 'Pick a venue and check if it\'s available for your dates', event: 'Event schedule, guest count, and special requirements', customer: 'Contact details for the person booking the venue', pricing: 'Venue charges, discounts, and taxes', payment: 'Record any advance or deposit payment' },
  };
  const sub = subtitles[formData.type] || subtitles.catering;

  // Shared input style helper
  const inp = { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%', boxSizing: 'border-box' };
  const onF = (e) => { e.target.style.borderColor = tc.color; e.target.style.boxShadow = '0 0 0 3px ' + tc.color + '15'; };
  const onB = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };
  const lbl = { fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const row = { display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: isMobile ? 'wrap' : 'nowrap' };
  const fld = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: isMobile ? '100%' : 'auto' };

  // Section header
  const SH = ({ title, subtitle, step, icon }) => {
    var Icon = icon;
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: subtitle ? '4px' : 0 }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: tc.gradient, color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</span>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#111827' }}>{title}</h3>
          {icon && <Icon size={13} style={{ color: tc.color, opacity: 0.5 }} />}
        </div>
        {subtitle && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 0 34px', lineHeight: '1.4' }}>{subtitle}</p>}
      </div>
    );
  };

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: isMobile ? '16px' : '20px 24px', marginBottom: '12px' };

  // ─── Section blocks ────────────────────────────

  const typeSection = (step) => (
    <div style={card}>
      <SH step={step} title="Booking Type" subtitle="Choose what kind of booking you're creating" />
      <div style={{ display: 'flex', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {typeOptions.map(opt => {
          var active = formData.type === opt.value;
          var cfg = typeConfig[opt.value];
          var OptIcon = opt.icon;
          return (
            <div
              key={opt.value}
              onClick={() => updateField('type', opt.value)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', position: 'relative',
                border: active ? '2px solid ' + cfg.color : '1.5px solid #e5e7eb',
                background: active ? cfg.bg : '#fafafa',
                transition: 'all 0.2s', minWidth: isMobile ? 'calc(50% - 10px)' : 'auto',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', background: cfg.gradient, color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}><FaCheck /></div>
              )}
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: active ? cfg.gradient : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <OptIcon size={16} style={{ color: active ? '#fff' : '#9ca3af' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: active ? cfg.color : '#6b7280' }}>{opt.label}</span>
              <span style={{ fontSize: '10px', color: active ? cfg.color + 'aa' : '#9ca3af', textAlign: 'center', lineHeight: '1.3' }}>{opt.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const customerSection = (step) => (
    <div style={card}>
      <SH step={step} title="Customer Info" subtitle={sub.customer} />
      <div style={row}>
        <div style={{ ...fld, flex: 2 }}>
          <label style={lbl}>Phone</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...inp, flex: 1 }} value={formData.customer.phone} onChange={e => updateField('customer.phone', e.target.value)} placeholder="Enter phone number" onFocus={onF} onBlur={onB} />
            <button style={{ background: tc.gradient, color: '#fff', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onClick={handleCustomerLookup} title="Lookup customer">
              <FaSearch />
            </button>
          </div>
          {customerLookupStatus === 'found' && <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Customer found \u2014 details filled</span>}
          {customerLookupStatus === 'not_found' && <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>No matching customer found</span>}
        </div>
      </div>
      <div style={row}>
        <div style={fld}><label style={lbl}>Name</label><input style={inp} value={formData.customer.name} onChange={e => updateField('customer.name', e.target.value)} placeholder="Full name" onFocus={onF} onBlur={onB} /></div>
        <div style={fld}><label style={lbl}>Email</label><input style={inp} type="email" value={formData.customer.email} onChange={e => updateField('customer.email', e.target.value)} placeholder="Email (optional)" onFocus={onF} onBlur={onB} /></div>
      </div>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tc.color, padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}
        onClick={() => setShowAddress(!showAddress)}
      >
        <FaPlus size={9} style={{ transform: showAddress ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        {showAddress ? 'Hide address' : 'Add address'}
      </button>
      {showAddress && (
        <div style={{ marginTop: '12px' }}>
          <div style={row}>
            <div style={fld}><label style={lbl}>Street</label><input style={inp} value={formData.customer.address.street} onChange={e => updateField('customer.address.street', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>Building</label><input style={inp} value={formData.customer.address.building} onChange={e => updateField('customer.address.building', e.target.value)} onFocus={onF} onBlur={onB} /></div>
          </div>
          <div style={row}>
            <div style={fld}><label style={lbl}>Landmark</label><input style={inp} value={formData.customer.address.landmark} onChange={e => updateField('customer.address.landmark', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>City</label><input style={inp} value={formData.customer.address.city} onChange={e => updateField('customer.address.city', e.target.value)} onFocus={onF} onBlur={onB} /></div>
          </div>
          <div style={row}>
            <div style={fld}><label style={lbl}>State</label><input style={inp} value={formData.customer.address.state} onChange={e => updateField('customer.address.state', e.target.value)} onFocus={onF} onBlur={onB} /></div>
            <div style={fld}><label style={lbl}>Pincode</label><input style={inp} value={formData.customer.address.pincode} onChange={e => updateField('customer.address.pincode', e.target.value)} onFocus={onF} onBlur={onB} /></div>
          </div>
        </div>
      )}
    </div>
  );

  const eventSection = (step) => (
    <div style={card}>
      <SH step={step} title={formData.type === 'advance_order' ? 'Schedule' : 'Event Details'} subtitle={sub.event} icon={FaCalendarAlt} />
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>{formData.type === 'advance_order' ? 'Order Name / Reference' : 'Event Name'}</label>
          <input style={inp} value={formData.eventName} onChange={e => updateField('eventName', e.target.value)} placeholder={formData.type === 'advance_order' ? 'e.g. Birthday cake order' : 'e.g. Wedding Reception'} onFocus={onF} onBlur={onB} />
        </div>
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
      </div>
      <div style={row}>
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
      {formData.type !== 'advance_order' && (
        <div style={row}>
          <div style={fld}>
            <label style={lbl}>Guest Count</label>
            <input style={inp} type="number" value={formData.guestCount} onChange={e => updateField('guestCount', e.target.value)} placeholder="Expected number of guests" onFocus={onF} onBlur={onB} />
          </div>
        </div>
      )}
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>Special Instructions</label>
          <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px' }} value={formData.specialInstructions} onChange={e => updateField('specialInstructions', e.target.value)} placeholder={formData.type === 'advance_order' ? 'Delivery notes, packaging preferences...' : 'Decor, dietary needs, seating preferences...'} onFocus={onF} onBlur={onB} />
        </div>
      </div>
    </div>
  );

  const venueSection = (step) => (
    <div style={card}>
      <SH step={step} title="Venue" subtitle={sub.venue} icon={FaDoorOpen} />
      <div style={row}>
        <div style={fld}>
          <label style={lbl}>Select Venue</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={formData.venueId} onChange={e => { updateField('venueId', e.target.value); setVenueAvailability(null); }}>
            <option value="">Choose a venue...</option>
            {(venues || []).map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>
      {formData.venueId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: '1.5px solid #d1d5db', background: '#f3f4f6', color: '#374151', fontWeight: '500' }} onClick={handleCheckVenueAvailability}>Check Availability</button>
          {venueAvailability === 'available' && <span style={{ color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}><FaCheck size={12} /> Available</span>}
          {venueAvailability === 'conflict' && <span style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}><FaExclamationTriangle size={12} /> Conflict</span>}
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
            placeholder="Type to search your menu..."
          />
          {showSearchResults && menuSearch && filteredMenuItems.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '4px' }}>
              {filteredMenuItems.slice(0, 10).map(item => (
                <div
                  key={item._id || item.id || item.name}
                  style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => addMenuItem(item)}
                  onMouseEnter={e => e.currentTarget.style.background = tc.bg}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span>{item.name}</span>
                  {item.price ? <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{'\u20B9'}{item.price}</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>
        <button style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={addCustomItem}>
          <FaPlus size={10} /> Custom Item
        </button>
      </div>

      {formData.items.length > 0 && (
        <div style={{ marginTop: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: '600', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: '600', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: '600', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: '600', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>
                <th style={{ width: '36px', padding: '10px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>
                    {item.isCustom ? (
                      <input style={{ ...inp, padding: '6px 10px', fontSize: '13px' }} value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Item name" onFocus={onF} onBlur={onB} />
                    ) : (
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{item.name}</div>
                        <input style={{ ...inp, fontSize: '11px', marginTop: '4px', padding: '4px 8px', color: '#6b7280' }} value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Notes..." onFocus={onF} onBlur={onB} />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {item.isCustom ? (
                      <input style={{ ...inp, width: '80px', padding: '6px 10px', fontSize: '13px', textAlign: 'right' }} type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} onFocus={onF} onBlur={onB} />
                    ) : (
                      <span style={{ fontWeight: '500' }}>{'\u20B9'}{item.price}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input style={{ ...inp, width: '56px', padding: '6px', fontSize: '13px', textAlign: 'center' }} type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} onFocus={onF} onBlur={onB} />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>{'\u20B9'}{((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)).toFixed(2)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                    <button style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.6 }} onClick={() => removeItem(idx)}><FaTrash size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formData.items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '28px 0', color: '#d1d5db' }}>
          <FaBoxOpen size={28} style={{ opacity: 0.4 }} />
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>No items added yet</p>
        </div>
      )}
    </div>
  );

  const pricingSection = (step) => (
    <div style={card}>
      <SH step={step} title="Pricing" subtitle={sub.pricing} />
      <div style={{ background: '#fafafa', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{'\u20B9'}{subtotal.toFixed(2)}</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '70px' }}>Discount</span>
            <select style={{ ...inp, width: '60px', padding: '6px 8px', fontSize: '13px' }} value={formData.discount.type} onChange={e => updateField('discount.type', e.target.value)}>
              <option value="percentage">%</option>
              <option value="flat">Flat</option>
            </select>
            <input style={{ ...inp, width: '80px', padding: '6px 10px', fontSize: '13px' }} type="number" value={formData.discount.value} onChange={e => updateField('discount.value', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
            {discountAmount > 0 && <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>-{'\u20B9'}{discountAmount.toFixed(2)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '70px' }}>Tax</span>
          <input style={{ ...inp, width: '100px', padding: '6px 10px', fontSize: '13px' }} type="number" value={formData.taxAmount} onChange={e => updateField('taxAmount', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '70px' }}>Service</span>
          <input style={{ ...inp, width: '100px', padding: '6px 10px', fontSize: '13px' }} type="number" value={formData.serviceCharge} onChange={e => updateField('serviceCharge', e.target.value)} placeholder="0" onFocus={onF} onBlur={onB} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: tc.gradient, borderRadius: '10px', marginTop: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Total</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{'\u20B9'}{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const paymentSection = (step) => (
    <div style={card}>
      <SH step={step} title="Payment" subtitle={sub.payment} />
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: formData.payment.enabled ? '14px' : 0 }}>
        <input type="checkbox" checked={formData.payment.enabled} onChange={e => updateField('payment.enabled', e.target.checked)} style={{ accentColor: tc.color, width: '16px', height: '16px' }} />
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Record Advance Payment</span>
      </label>
      {formData.payment.enabled && (
        <div style={row}>
          <div style={fld}><label style={lbl}>Amount</label><input style={inp} type="number" value={formData.payment.amount} onChange={e => updateField('payment.amount', e.target.value)} placeholder="Amount paid" onFocus={onF} onBlur={onB} /></div>
          <div style={fld}>
            <label style={lbl}>Method</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={formData.payment.method} onChange={e => updateField('payment.method', e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const optionsSection = (step) => (
    <div style={card}>
      <SH step={step} title="Options" subtitle="Additional settings for this booking" />
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input type="checkbox" checked={formData.trackInExpenses} onChange={e => updateField('trackInExpenses', e.target.checked)} style={{ accentColor: tc.color, width: '16px', height: '16px' }} />
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Track in Expenses</span>
      </label>
    </div>
  );

  // Section ordering
  const getSections = () => {
    if (formData.type === 'advance_order') return <>{typeSection(1)}{itemsSection(2)}{customerSection(3)}{eventSection(4)}{pricingSection(5)}{paymentSection(6)}{optionsSection(7)}</>;
    if (formData.type === 'venue') return <>{typeSection(1)}{venueSection(2)}{eventSection(3)}{customerSection(4)}{pricingSection(5)}{paymentSection(6)}{optionsSection(7)}</>;
    return <>{typeSection(1)}{itemsSection(2)}{customerSection(3)}{eventSection(4)}{pricingSection(5)}{paymentSection(6)}{optionsSection(7)}</>;
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#f7f8fa', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: '#fff', padding: '0 20px', height: '58px', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#374151',
              padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <FaArrowLeft size={14} />
          </button>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#111827' }}>
              {editingBooking ? 'Edit Booking' : 'New Booking'}
            </h2>
          </div>

          {/* Type badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '20px',
            background: tc.bg, border: '1px solid ' + tc.border,
          }}>
            <TypeIcon size={12} style={{ color: tc.color }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: tc.color }}>{tc.label}</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
              padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'color 0.15s',
              marginLeft: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            title="Close"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          {getSections()}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0
        }}>
          <button
            style={{ background: 'none', color: '#6b7280', border: 'none', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '8px' }}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {totalAmount > 0 && (
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Total: {'\u20B9'}{totalAmount.toFixed(2)}</span>
            )}
            <button
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: tc.gradient, color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 8px ' + tc.color + '30'
              }}
              onClick={handleSave}
            >
              <FaCheck size={12} /> Save Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
