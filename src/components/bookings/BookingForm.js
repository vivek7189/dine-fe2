'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaCheck, FaExclamationTriangle, FaConciergeBell, FaClipboardList, FaDoorOpen, FaArrowLeft } from 'react-icons/fa';
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

  // When form opens fresh (not editing), set default type to first enabled type
  useEffect(() => {
    if (isOpen && !editingBooking && enabledTypes.length > 0 && !enabledTypes.includes(formData.type)) {
      setFormData(prev => ({ ...prev, type: enabledTypes[0] }));
    }
  }, [isOpen, editingBooking]);

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

  // Type options with icons — filtered by bookingSettings
  const allTypeOptions = [
    { value: 'catering', label: 'Catering', icon: <FaConciergeBell size={20} /> },
    { value: 'advance_order', label: 'Advance Order', icon: <FaClipboardList size={20} /> },
    { value: 'venue', label: 'Venue Booking', icon: <FaDoorOpen size={20} /> },
  ];
  const typeOptions = allTypeOptions.filter(opt => enabledTypes.includes(opt.value));

  // Styles
  const styles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: '#f8f9fb', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { background: '#fff', padding: '0 20px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    headerBack: { background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' },
    headerTitle: { fontSize: '16px', fontWeight: '600', margin: 0, color: '#111827', letterSpacing: '-0.01em' },
    headerBadge: { fontSize: '11px', fontWeight: '500', color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' },
    body: { flex: 1, overflowY: 'auto', padding: '20px', maxWidth: '820px', margin: '0 auto', width: '100%' },
    sectionCard: { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 24px', marginBottom: '14px' },
    row: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' },
    field: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: isMobile ? '100%' : 'auto' },
    label: { fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' },
    input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', transition: 'border-color 0.2s' },
    inputFocus: { borderColor: '#ef4444' },
    select: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' },
    textarea: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px', background: '#fff' },
    typeCard: (isActive) => ({
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 12px',
      borderRadius: '10px',
      border: isActive ? '2px solid #ef4444' : '1.5px solid #e5e7eb',
      background: isActive ? '#fef2f2' : '#fff',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s',
    }),
    typeCardIcon: (isActive) => ({
      color: isActive ? '#ef4444' : '#9ca3af',
      transition: 'color 0.2s',
    }),
    typeCardLabel: (isActive) => ({
      fontSize: '13px',
      fontWeight: '600',
      color: isActive ? '#dc2626' : '#6b7280',
    }),
    typeCardCheck: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      background: '#ef4444',
      color: '#fff',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
    },
    btn: { padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', border: 'none', fontWeight: '500' },
    btnPrimary: { background: '#ef4444', color: '#fff' },
    btnSecondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' },
    btnOutline: { background: 'transparent', color: '#6b7280', border: 'none', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    btnDanger: { background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px' },
    btnSearch: { background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    footer: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', padding: '12px 20px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
    tableWrapper: { marginTop: '16px', overflowX: 'auto', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { textAlign: 'left', padding: '10px 12px', background: '#f9fafb', fontWeight: '600', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
    td: (idx) => ({ padding: '10px 12px', background: idx % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }),
    pricingCard: { background: '#fafafa', borderRadius: '10px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' },
    pricingTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#ef4444', borderRadius: '8px', marginTop: '4px' },
    searchWrapper: { position: 'relative' },
    searchResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
    searchItem: { padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  };

  // Section header helper
  const SectionHead = ({ title, subtitle, step }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</span>
        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#111827' }}>{title}</h3>
      </div>
      {subtitle && <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 0 32px', lineHeight: '1.3' }}>{subtitle}</p>}
    </div>
  );

  // Context-aware subtitles per type
  const subtitles = {
    catering: {
      items: 'Plan the menu — search or add custom dishes for the event',
      customer: 'Who is hosting? Enter phone to auto-fill from saved customers',
      event: 'When and where is the event happening?',
      pricing: 'Apply discounts, taxes, and service charges',
      payment: 'Has the customer paid any advance?',
    },
    advance_order: {
      items: 'What would you like to pre-order? Search your menu or add custom items',
      customer: 'Who is placing the order? Enter phone to auto-fill',
      event: 'When should the order be ready for pickup or delivery?',
      pricing: 'Apply discounts, taxes, and service charges',
      payment: 'Record any advance payment received',
    },
    venue: {
      venue: 'Pick a venue and check if it\'s available for your dates',
      event: 'Event schedule, guest count, and special requirements',
      customer: 'Contact details for the person booking the venue',
      pricing: 'Venue charges, discounts, and taxes',
      payment: 'Record any advance or deposit payment',
    },
  };
  const sub = subtitles[formData.type] || subtitles.catering;

  // ─── Reusable section blocks ─────────────────────────────

  const typeSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Booking Type" subtitle="Choose what kind of booking you're creating" />
      <div style={{ display: 'flex', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {typeOptions.map(opt => (
          <div
            key={opt.value}
            style={styles.typeCard(formData.type === opt.value)}
            onClick={() => updateField('type', opt.value)}
          >
            {formData.type === opt.value && (
              <div style={styles.typeCardCheck}><FaCheck /></div>
            )}
            <div style={styles.typeCardIcon(formData.type === opt.value)}>{opt.icon}</div>
            <span style={styles.typeCardLabel(formData.type === opt.value)}>{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const customerSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Customer Info" subtitle={sub.customer} />
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 2 }}>
          <label style={styles.label}>Phone</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={formData.customer.phone}
              onChange={e => updateField('customer.phone', e.target.value)}
              placeholder="Enter phone number"
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button style={styles.btnSearch} onClick={handleCustomerLookup} title="Lookup customer">
              <FaSearch />
            </button>
          </div>
          {customerLookupStatus === 'found' && (
            <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Customer found — details filled automatically</span>
          )}
          {customerLookupStatus === 'not_found' && (
            <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>No matching customer found</span>
          )}
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={formData.customer.name} onChange={e => updateField('customer.name', e.target.value)} placeholder="Full name" onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={formData.customer.email} onChange={e => updateField('customer.email', e.target.value)} placeholder="Email (optional)" onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
      </div>
      <div style={{ marginTop: '4px' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setShowAddress(!showAddress)}
        >
          <FaPlus size={10} style={{ transform: showAddress ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
          {showAddress ? 'Hide address fields' : 'Add address'}
        </button>
        {showAddress && (
          <div style={{ marginTop: '12px' }}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Street</label>
                <input style={styles.input} value={formData.customer.address.street} onChange={e => updateField('customer.address.street', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Building</label>
                <input style={styles.input} value={formData.customer.address.building} onChange={e => updateField('customer.address.building', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Landmark</label>
                <input style={styles.input} value={formData.customer.address.landmark} onChange={e => updateField('customer.address.landmark', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input style={styles.input} value={formData.customer.address.city} onChange={e => updateField('customer.address.city', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>State</label>
                <input style={styles.input} value={formData.customer.address.state} onChange={e => updateField('customer.address.state', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Pincode</label>
                <input style={styles.input} value={formData.customer.address.pincode} onChange={e => updateField('customer.address.pincode', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const eventSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title={formData.type === 'advance_order' ? 'Schedule' : 'Event Details'} subtitle={sub.event} />
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>{formData.type === 'advance_order' ? 'Order Name / Reference' : 'Event Name'}</label>
          <input style={styles.input} value={formData.eventName} onChange={e => updateField('eventName', e.target.value)} placeholder={formData.type === 'advance_order' ? 'e.g. Birthday cake order' : 'e.g. Wedding Reception'} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>{formData.type === 'advance_order' ? 'Pickup / Delivery Date' : 'Start Date'}</label>
          <input style={styles.input} type="date" value={formData.eventDate} onChange={e => updateField('eventDate', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        {formData.type !== 'advance_order' && (
          <div style={styles.field}>
            <label style={styles.label}>End Date (optional)</label>
            <input style={styles.input} type="date" value={formData.endDate} onChange={e => updateField('endDate', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        )}
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>{formData.type === 'advance_order' ? 'Ready By' : 'Start Time'}</label>
          <input style={styles.input} type="time" value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        {formData.type !== 'advance_order' && (
          <div style={styles.field}>
            <label style={styles.label}>End Time</label>
            <input style={styles.input} type="time" value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        )}
      </div>
      {formData.type !== 'advance_order' && (
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Guest Count</label>
            <input style={styles.input} type="number" value={formData.guestCount} onChange={e => updateField('guestCount', e.target.value)} placeholder="Expected number of guests" onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        </div>
      )}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Special Instructions</label>
          <textarea style={styles.textarea} value={formData.specialInstructions} onChange={e => updateField('specialInstructions', e.target.value)} placeholder={formData.type === 'advance_order' ? 'Delivery notes, packaging preferences...' : 'Decor, dietary needs, seating preferences...'} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
      </div>
    </div>
  );

  const venueSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Venue" subtitle={sub.venue} />
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Select Venue</label>
          <select style={styles.select} value={formData.venueId} onChange={e => { updateField('venueId', e.target.value); setVenueAvailability(null); }}>
            <option value="">Choose a venue...</option>
            {(venues || []).map(v => (
              <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>
      {formData.venueId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <button style={{ ...styles.btn, ...styles.btnSecondary, fontSize: '13px' }} onClick={handleCheckVenueAvailability}>
            Check Availability
          </button>
          {venueAvailability === 'available' && (
            <span style={{ color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <FaCheck size={12} /> Available
            </span>
          )}
          {venueAvailability === 'conflict' && (
            <span style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <FaExclamationTriangle size={12} /> Conflict — venue is booked
            </span>
          )}
        </div>
      )}
    </div>
  );

  const itemsSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title={formData.type === 'advance_order' ? 'Order Items' : 'Menu Items'} subtitle={sub.items} />
      <div style={{ ...styles.row, alignItems: 'flex-end' }}>
        <div style={{ ...styles.field, ...styles.searchWrapper }}>
          <label style={styles.label}>Search Menu</label>
          <input
            style={styles.input}
            value={menuSearch}
            onChange={e => { setMenuSearch(e.target.value); setShowSearchResults(true); }}
            onFocus={(e) => { e.target.style.borderColor = '#ef4444'; menuSearch && setShowSearchResults(true); }}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            placeholder="Type to search your menu..."
          />
          {showSearchResults && menuSearch && filteredMenuItems.length > 0 && (
            <div style={styles.searchResults}>
              {filteredMenuItems.slice(0, 10).map(item => (
                <div
                  key={item._id || item.id || item.name}
                  style={styles.searchItem}
                  onClick={() => addMenuItem(item)}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {item.name} {item.price ? `- \u20B9${item.price}` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
        <button style={{ ...styles.btn, ...styles.btnSecondary, marginBottom: '0', whiteSpace: 'nowrap' }} onClick={addCustomItem}>
          <FaPlus style={{ marginRight: '4px' }} /> Custom Item
        </button>
      </div>

      {formData.items.length > 0 && (
        <div style={styles.tableWrapper}>
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
                  <td style={styles.td(idx)}>
                    {item.isCustom ? (
                      <input style={{ ...styles.input, width: '100%', padding: '6px 10px' }} value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Item name" />
                    ) : (
                      <div>
                        <div style={{ fontWeight: '500' }}>{item.name}</div>
                        <input style={{ ...styles.input, fontSize: '12px', marginTop: '4px', padding: '4px 8px' }} value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Notes (optional)" />
                      </div>
                    )}
                  </td>
                  <td style={styles.td(idx)}>
                    {item.isCustom ? (
                      <input style={{ ...styles.input, width: '80px', padding: '6px 10px' }} type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} />
                    ) : (
                      <span style={{ fontWeight: '500' }}>{'\u20B9'}{item.price}</span>
                    )}
                  </td>
                  <td style={styles.td(idx)}>
                    <input style={{ ...styles.input, width: '60px', padding: '6px 10px' }} type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                  </td>
                  <td style={{ ...styles.td(idx), fontWeight: '500' }}>{'\u20B9'}{((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)).toFixed(2)}</td>
                  <td style={styles.td(idx)}>
                    <button style={styles.btnDanger} onClick={() => removeItem(idx)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formData.items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#d1d5db' }}>
          <FaClipboardList size={28} />
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>No items added yet</p>
        </div>
      )}
    </div>
  );

  const pricingSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Pricing" subtitle={sub.pricing} />
      <div style={styles.pricingCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{'\u20B9'}{subtotal.toFixed(2)}</span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Discount</span>
            <select
              style={{ ...styles.select, padding: '6px 10px', fontSize: '13px' }}
              value={formData.discount.type}
              onChange={e => updateField('discount.type', e.target.value)}
            >
              <option value="percentage">%</option>
              <option value="flat">Flat</option>
            </select>
            <input
              style={{ ...styles.input, width: '80px', padding: '6px 10px' }}
              type="number"
              value={formData.discount.value}
              onChange={e => updateField('discount.value', e.target.value)}
              placeholder="0"
            />
            {discountAmount > 0 && <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>-{'\u20B9'}{discountAmount.toFixed(2)}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '100px' }}>Tax Amount</span>
          <input
            style={{ ...styles.input, width: '100px', padding: '6px 10px' }}
            type="number"
            value={formData.taxAmount}
            onChange={e => updateField('taxAmount', e.target.value)}
            placeholder="0"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '100px' }}>Service Charge</span>
          <input
            style={{ ...styles.input, width: '100px', padding: '6px 10px' }}
            type="number"
            value={formData.serviceCharge}
            onChange={e => updateField('serviceCharge', e.target.value)}
            placeholder="0"
          />
        </div>

        <div style={styles.pricingTotal}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Total</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{'\u20B9'}{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const paymentSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Payment" subtitle={sub.payment} />
      <div style={styles.toggleRow}>
        <input
          type="checkbox"
          id="advancePayment"
          checked={formData.payment.enabled}
          onChange={e => updateField('payment.enabled', e.target.checked)}
          style={{ accentColor: '#ef4444' }}
        />
        <label htmlFor="advancePayment" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>Record Advance Payment</label>
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
              placeholder="Amount paid"
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
  );

  const optionsSection = (step) => (
    <div style={styles.sectionCard}>
      <SectionHead step={step} title="Options" subtitle="Additional settings for this booking" />
      <div style={styles.toggleRow}>
        <input
          type="checkbox"
          id="trackExpenses"
          checked={formData.trackInExpenses}
          onChange={e => updateField('trackInExpenses', e.target.checked)}
          style={{ accentColor: '#ef4444' }}
        />
        <label htmlFor="trackExpenses" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>Track in Expenses</label>
      </div>
    </div>
  );

  // ─── Type-specific section ordering ──────────────────────
  const getSections = () => {
    if (formData.type === 'advance_order') {
      return (
        <>
          {typeSection(1)}
          {itemsSection(2)}
          {customerSection(3)}
          {eventSection(4)}
          {pricingSection(5)}
          {paymentSection(6)}
          {optionsSection(7)}
        </>
      );
    }
    if (formData.type === 'venue') {
      return (
        <>
          {typeSection(1)}
          {venueSection(2)}
          {eventSection(3)}
          {customerSection(4)}
          {pricingSection(5)}
          {paymentSection(6)}
          {optionsSection(7)}
        </>
      );
    }
    // catering (default)
    return (
      <>
        {typeSection(1)}
        {itemsSection(2)}
        {customerSection(3)}
        {eventSection(4)}
        {pricingSection(5)}
        {paymentSection(6)}
        {optionsSection(7)}
      </>
    );
  };

  // Type labels for header
  const typeLabels = { catering: 'Catering', advance_order: 'Advance Order', venue: 'Venue Booking' };

  const modalContent = (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.headerBack} onClick={onClose} onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <FaArrowLeft size={16} />
          </button>
          <h2 style={styles.headerTitle}>
            {editingBooking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>{typeLabels[formData.type] || 'Catering'}</span>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {getSections()}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.btnOutline} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.btn, ...styles.btnPrimary, padding: '10px 24px', fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleSave}>
            <FaCheck size={12} /> Save Booking
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
