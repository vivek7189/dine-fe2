'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { FaCalendarCheck, FaPlus, FaList, FaCalendarAlt, FaDoorOpen, FaSpinner, FaArrowLeft, FaCog, FaConciergeBell, FaClipboardList, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import BookingList from '../../../components/bookings/BookingList';
import BookingCalendar from '../../../components/bookings/BookingCalendar';
import BookingForm from '../../../components/bookings/BookingForm';
import BookingDetail from '../../../components/bookings/BookingDetail';
import BookingInvoice from '../../../components/bookings/BookingInvoice';
import VenueManager from '../../../components/bookings/VenueManager';
import PaymentForm from '../../../components/bookings/PaymentForm';

export default function BookingsPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // Restaurant state
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar' | 'venues'

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '', startDate: '', endDate: '', search: '' });

  // Calendar state
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Venues state
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  // Booking type settings
  const [bookingSettings, setBookingSettings] = useState({ enableCatering: true, enableAdvanceOrder: true, enableVenueBooking: true });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Responsive
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load restaurant
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || !userData.id) { router.push('/login'); return; }

        let rid = null;
        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          rid = userData.restaurantId;
        } else {
          const saved = localStorage.getItem('selectedRestaurantId');
          if (saved) rid = saved;
          else {
            const resp = await apiClient.getRestaurants();
            if (resp.restaurants && resp.restaurants.length > 0) {
              rid = resp.restaurants[0].id;
            }
          }
        }

        if (rid) {
          setRestaurantId(rid);
          // Load booking type settings from restaurant
          try {
            const restData = await apiClient.getRestaurants();
            const rest = (restData.restaurants || []).find(r => r.id === rid);
            if (rest && rest.bookingSettings) {
              setBookingSettings({
                enableCatering: rest.bookingSettings.enableCatering !== false,
                enableAdvanceOrder: rest.bookingSettings.enableAdvanceOrder !== false,
                enableVenueBooking: rest.bookingSettings.enableVenueBooking !== false,
              });
            }
          } catch (e) { /* ignore settings load failure */ }
        }
      } catch (err) {
        console.error('Failed to load restaurant:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurant();
  }, [router]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!restaurantId) return;
    setBookingsLoading(true);
    try {
      const resp = await apiClient.getBookings(restaurantId, filters);
      setBookings(resp.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [restaurantId, filters]);

  useEffect(() => {
    if (restaurantId && activeTab === 'list') loadBookings();
  }, [restaurantId, activeTab, filters]);

  // Load calendar data
  const loadCalendar = useCallback(async () => {
    if (!restaurantId) return;
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

    try {
      const resp = await apiClient.getBookingCalendar(restaurantId, startDate, endDate);
      // Map to format expected by BookingCalendar component
      const mapped = (resp.bookings || []).map(b => ({
        ...b,
        date: b.eventDate,
        start_date: b.eventDate,
        end_date: b.eventEndDate || b.eventDate,
        event_name: b.eventName,
        name: b.eventName,
        type: b.type,
      }));
      setCalendarBookings(mapped);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  }, [restaurantId, calendarMonth]);

  useEffect(() => {
    if (restaurantId && activeTab === 'calendar') loadCalendar();
  }, [restaurantId, activeTab, calendarMonth]);

  // Load venues
  const loadVenues = useCallback(async () => {
    if (!restaurantId) return;
    setVenuesLoading(true);
    try {
      const resp = await apiClient.getBookingVenues(restaurantId);
      setVenues(resp.venues || []);
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setVenuesLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && activeTab === 'venues') loadVenues();
  }, [restaurantId, activeTab]);

  // Also load venues when form opens (needed for venue selection dropdown)
  useEffect(() => {
    if (showForm && restaurantId && venues.length === 0) loadVenues();
  }, [showForm, restaurantId]);

  // Actions
  async function handleSaveBooking(formData) {
    try {
      const payload = {
        type: formData.type,
        customer: formData.customer,
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventEndDate: formData.endDate || null,
        eventTime: formData.startTime || null,
        eventEndTime: formData.endTime || null,
        guestCount: Number(formData.guestCount) || 0,
        specialInstructions: formData.specialInstructions || '',
        venue: formData.type === 'venue' && formData.venueId ? {
          venueId: formData.venueId,
          venueName: (venues.find(v => v.id === formData.venueId) || {}).name || '',
        } : null,
        items: formData.items.map(item => ({
          id: item.id || String(Date.now()),
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.qty) || 1,
          isCustom: item.isCustom || false,
          notes: item.notes || null,
          category: item.category || null,
        })),
        subtotal: formData.subtotal || 0,
        discount: formData.discount && formData.discount.value ? {
          type: formData.discount.type || 'percentage',
          value: Number(formData.discount.value) || 0,
          amount: formData.discountAmount || 0,
          reason: null,
        } : null,
        taxAmount: Number(formData.taxAmount) || 0,
        serviceCharge: Number(formData.serviceCharge) || 0,
        totalAmount: formData.totalAmount || 0,
        payments: formData.payment && formData.payment.enabled && formData.payment.amount ? [{
          amount: Number(formData.payment.amount),
          method: formData.payment.method || 'cash',
          date: new Date().toISOString(),
          type: 'advance',
          note: null,
        }] : [],
        trackExpense: formData.trackInExpenses || false,
      };

      if (editingBooking) {
        await apiClient.updateBooking(restaurantId, editingBooking.id, payload);
      } else {
        await apiClient.createBooking(restaurantId, payload);
      }

      setShowForm(false);
      setEditingBooking(null);
      loadBookings();
      if (activeTab === 'calendar') loadCalendar();
    } catch (err) {
      console.error('Failed to save booking:', err);
      alert('Failed to save booking: ' + (err.message || 'Unknown error'));
    }
  }

  function handleView(booking) {
    setSelectedBooking(booking);
    setShowDetail(true);
  }

  function handleEdit(booking) {
    setEditingBooking(booking);
    setShowForm(true);
  }

  function handleAddPayment(booking) {
    setPaymentBooking(booking);
    setShowPayment(true);
  }

  async function handlePaymentSave(payment) {
    if (!paymentBooking) return;
    await apiClient.addBookingPayment(restaurantId, paymentBooking.id, payment);
    loadBookings();
    setShowPayment(false);
    setPaymentBooking(null);
    if (showDetail) {
      // Refresh detail
      const resp = await apiClient.getBooking(restaurantId, paymentBooking.id);
      setSelectedBooking(resp.booking);
    }
  }

  async function handleComplete(booking) {
    try {
      await apiClient.completeBooking(restaurantId, booking.id);
      loadBookings();
      if (showDetail) setShowDetail(false);
    } catch (err) {
      throw err;
    }
  }

  async function handleCancel(booking, reason) {
    try {
      await apiClient.deleteBooking(restaurantId, booking.id, reason || '');
      loadBookings();
      if (showDetail) setShowDetail(false);
    } catch (err) {
      throw err;
    }
  }

  async function handleDelete(booking, reason) {
    try {
      await apiClient.deleteBooking(restaurantId, booking.id, reason, { permanent: true });
      loadBookings();
      if (showDetail) setShowDetail(false);
    } catch (err) {
      throw err;
    }
  }

  async function handleShareInvoice(booking) {
    try {
      const resp = await apiClient.getBookingInvoice(restaurantId, booking.id);
      setInvoiceData(resp.invoice);
      setShowInvoice(true);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
    }
  }

  async function handleVenueSave(data, venueId) {
    if (venueId) {
      await apiClient.updateBookingVenue(restaurantId, venueId, data);
    } else {
      await apiClient.createBookingVenue(restaurantId, data);
    }
    loadVenues();
  }

  async function handleVenueDelete(venueId) {
    if (!confirm('Delete this venue?')) return;
    await apiClient.deleteBookingVenue(restaurantId, venueId);
    loadVenues();
  }

  function handleCalendarDayClick(date) {
    // Filter list by this date
    const dateStr = date.toISOString().split('T')[0];
    setFilters({ ...filters, startDate: dateStr, endDate: dateStr });
    setActiveTab('list');
  }

  function handleCalendarBookingClick(booking) {
    handleView(booking);
  }

  async function toggleBookingSetting(key) {
    const updated = { ...bookingSettings, [key]: !bookingSettings[key] };
    // Ensure at least one type is enabled
    if (!updated.enableCatering && !updated.enableAdvanceOrder && !updated.enableVenueBooking) return;
    setBookingSettings(updated);
    setSettingsSaving(true);
    try {
      await apiClient.updateRestaurant(restaurantId, { bookingSettings: updated });
    } catch (err) {
      console.error('Failed to save booking settings:', err);
    } finally {
      setSettingsSaving(false);
    }
  }

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!showSettings) return;
    function handleClick(e) {
      if (!e.target.closest('[data-settings-dropdown]')) setShowSettings(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showSettings]);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <FaSpinner size={24} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const tabs = [
    { id: 'list', label: 'Bookings', icon: FaList },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
    ...(bookingSettings.enableVenueBooking !== false ? [{ id: 'venues', label: 'Venues', icon: FaDoorOpen }] : []),
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px', maxWidth: '1400px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <button
            onClick={function() { router.back(); }}
            style={{
              padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb',
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginTop: '2px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <FaArrowLeft size={14} style={{ color: '#6b7280' }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCalendarCheck size={22} style={{ color: '#ef4444' }} />
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#1f2937' }}>Bookings</h1>
            </div>
            <p style={{ margin: '4px 0 0 32px', fontSize: '13px', color: '#6b7280', fontWeight: '400' }}>
              Manage advance orders, catering & venue bookings
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Settings gear */}
          <div style={{ position: 'relative' }} data-settings-dropdown>
            <button
              onClick={function(e) { e.stopPropagation(); setShowSettings(!showSettings); }}
              style={{
                padding: '9px', borderRadius: '8px', border: '1px solid #e5e7eb',
                background: showSettings ? '#fef2f2' : '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                color: showSettings ? '#ef4444' : '#6b7280'
              }}
              title="Booking type settings"
            >
              <FaCog size={15} />
            </button>
            {showSettings && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '12px', minWidth: '240px',
                zIndex: 100
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Enable Booking Types
                </div>
                {[
                  { key: 'enableCatering', label: 'Catering', icon: FaConciergeBell, color: '#f59e0b' },
                  { key: 'enableAdvanceOrder', label: 'Advance Order', icon: FaClipboardList, color: '#3b82f6' },
                  { key: 'enableVenueBooking', label: 'Venue / Place Booking', icon: FaDoorOpen, color: '#ef4444' },
                ].map(function(item) {
                  var enabled = bookingSettings[item.key];
                  var Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      onClick={function() { toggleBookingSetting(item.key); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 6px', borderRadius: '6px', cursor: 'pointer',
                        marginBottom: '2px', transition: 'background 0.15s',
                        background: enabled ? '#f9fafb' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={13} style={{ color: enabled ? item.color : '#d1d5db' }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: enabled ? '#1f2937' : '#9ca3af' }}>{item.label}</span>
                      </div>
                      {enabled ? (
                        <FaToggleOn size={20} style={{ color: '#ef4444' }} />
                      ) : (
                        <FaToggleOff size={20} style={{ color: '#d1d5db' }} />
                      )}
                    </div>
                  );
                })}
                {settingsSaving && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', textAlign: 'center' }}>Saving...</div>}
              </div>
            )}
          </div>
          <button
            onClick={function() { setEditingBooking(null); setShowForm(true); }}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(239,68,68,0.2)'
            }}
          >
            <FaPlus size={12} /> New Booking
          </button>
        </div>
      </div>

      {/* White card wrapper */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: '#fff', borderRadius: '10px', padding: '4px',
          width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6'
        }}>
          {tabs.map(function(tab) {
            var TabIcon = tab.icon;
            var isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={function() { setActiveTab(tab.id); }}
                style={{
                  padding: isMobile ? '8px 12px' : '8px 16px', borderRadius: '7px',
                  border: 'none', background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#ef4444' : '#6b7280',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  borderBottom: isActive ? '2px solid #ef4444' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <TabIcon size={13} />
                {!isMobile && tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <BookingList
            bookings={bookings.map(b => ({
              ...b,
              booking_number: b.bookingNumber,
              customer_name: b.customer?.name || '',
              customer_phone: b.customer?.phone || '',
              event_name: b.eventName,
              event_date: b.eventDate,
              guests: b.guestCount,
              total_amount: b.totalAmount,
              paid_amount: b.paidAmount,
              balance_amount: b.balanceAmount,
            }))}
            loading={bookingsLoading}
            onView={handleView}
            onEdit={handleEdit}
            onAddPayment={handleAddPayment}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onShareInvoice={handleShareInvoice}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {activeTab === 'calendar' && (
          <BookingCalendar
            bookings={calendarBookings}
            onDayClick={handleCalendarDayClick}
            onBookingClick={handleCalendarBookingClick}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'venues' && (
          <VenueManager
            venues={venues}
            loading={venuesLoading}
            onSave={handleVenueSave}
            onDelete={handleVenueDelete}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Modals */}
      <BookingForm
        isOpen={showForm}
        onClose={function() { setShowForm(false); setEditingBooking(null); }}
        onSave={handleSaveBooking}
        editingBooking={editingBooking}
        venues={venues}
        restaurantId={restaurantId}
        isMobile={isMobile}
        bookingSettings={bookingSettings}
        onVenuesChange={setVenues}
      />

      <BookingDetail
        booking={selectedBooking}
        isOpen={showDetail}
        onClose={function() { setShowDetail(false); setSelectedBooking(null); }}
        onAddPayment={handleAddPayment}
        onComplete={handleComplete}
        onShareInvoice={handleShareInvoice}
        formatCurrency={formatCurrency}
        isMobile={isMobile}
      />

      <PaymentForm
        isOpen={showPayment}
        onClose={function() { setShowPayment(false); setPaymentBooking(null); }}
        onSave={handlePaymentSave}
        booking={paymentBooking}
        isMobile={isMobile}
      />

      <BookingInvoice
        invoice={invoiceData}
        isOpen={showInvoice}
        onClose={function() { setShowInvoice(false); setInvoiceData(null); }}
        isMobile={isMobile}
      />
    </div>
  );
}
