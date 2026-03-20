'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../../../contexts/LoadingContext';
import apiClient from '../../../lib/api';
import { useNotification } from '../../../components/Notification.js';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedTablesData, setCachedTablesData } from '../../../utils/dashboardCache';
import {
  FaPlus, FaTrash, FaCog, FaUsers, FaClock, FaUtensils, FaCheck, FaBan, FaChair,
  FaHome, FaEdit, FaEllipsisV, FaCalendarAlt, FaTools, FaTimes, FaPhoneAlt,
  FaUser, FaChevronDown, FaEye, FaChevronLeft, FaChevronRight, FaSearch,
  FaLayerGroup, FaConciergeBell, FaArrowRight
} from 'react-icons/fa';

const TableManagement = () => {
  const router = useRouter();
  const { isLoading } = useLoading();
  const { showSuccess, showError, showWarning, NotificationContainer } = useNotification();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
    const handleLanguageChange = (e) => setCurrentLanguage(e.detail.language);
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // ── State ──────────────────────────────────────────────
  const [floors, setFloors] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [userRole, setUserRole] = useState(null);

  // Floor filter
  const [selectedFloorId, setSelectedFloorId] = useState('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showEditFloor, setShowEditFloor] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookingFromHeader, setBookingFromHeader] = useState(false);
  const [selectedFloorForTable, setSelectedFloorForTable] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [addMode, setAddMode] = useState('single');
  const [bookingStep, setBookingStep] = useState(1);

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form states
  const [newFloor, setNewFloor] = useState({ name: '', description: '', section: '', areaChargeType: 'none', areaChargeValue: '' });
  const [newTable, setNewTable] = useState({ name: '', capacity: 4, type: 'regular', floorId: null });
  const [bulkTableData, setBulkTableData] = useState({ fromNumber: '', toNumber: '', capacity: 4, floorId: null });
  const [bookingData, setBookingData] = useState({
    customerName: '', customerPhone: '', partySize: 2,
    bookingDate: '', bookingTime: '', mealType: 'lunch', notes: ''
  });

  // Time slots & availability
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTablesForDate, setAvailableTablesForDate] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityStats, setAvailabilityStats] = useState({ totalTables: 0, availableTables: 0, reservedTables: 0 });

  // Date-based table status
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableStatusesForDate, setTableStatusesForDate] = useState({});
  const [loadingTableStatuses, setLoadingTableStatuses] = useState(false);

  // Bookings for date
  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const scrollContainerRef = useRef(null);
  const canManageTables = ['owner', 'admin', 'manager'].includes(userRole);

  // ── Status config ──────────────────────────────────────
  const statusConfig = {
    available: { bg: '#f0fdf4', text: '#166534', label: 'Available', icon: FaCheck, border: '#22c55e' },
    occupied: { bg: '#fefce8', text: '#92400e', label: 'Occupied', icon: FaUsers, border: '#f59e0b' },
    serving: { bg: '#fefce8', text: '#92400e', label: 'Serving', icon: FaUtensils, border: '#f59e0b' },
    reserved: { bg: '#eff6ff', text: '#1e40af', label: 'Reserved', icon: FaClock, border: '#3b82f6' },
    cleaning: { bg: '#f8fafc', text: '#475569', label: 'Cleaning', icon: FaTools, border: '#64748b' },
    'out-of-service': { bg: '#fef2f2', text: '#991b1b', label: 'Out of Service', icon: FaBan, border: '#ef4444' },
  };
  const getTableStatusInfo = (status) => statusConfig[status] || statusConfig.available;

  // ── Time slots ─────────────────────────────────────────
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push({
          value: time.toTimeString().slice(0, 5),
          display: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          available: true
        });
      }
    }
    return slots;
  };

  // ── API: Fetch availability ────────────────────────────
  const fetchAvailabilityForDate = async (date) => {
    if (!selectedRestaurant?.id || !date) return;
    try {
      setLoadingAvailability(true);
      const response = await apiClient.request(`/api/bookings/availability/${selectedRestaurant.id}?date=${date}`, { method: 'GET' });
      if (response.success) {
        setAvailableTablesForDate(response.availableTables || []);
        setAvailableTimeSlots(response.timeSlots || generateTimeSlots());
        setAvailabilityStats(response.stats || computeStats());
      } else {
        setAvailableTablesForDate(allTables);
        setAvailableTimeSlots(generateTimeSlots());
        setAvailabilityStats(computeStats());
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setAvailableTablesForDate(allTables);
      setAvailableTimeSlots(generateTimeSlots());
      setAvailabilityStats(computeStats());
    } finally {
      setLoadingAvailability(false);
    }
  };

  const computeStats = () => {
    const all = floors.flatMap(f => f.tables || []);
    return {
      totalTables: all.length,
      availableTables: all.filter(t => t.status === 'available').length,
      reservedTables: all.filter(t => t.status === 'reserved').length,
    };
  };

  const allTables = floors.flatMap(f => f.tables || []);

  // ── API: Fetch table statuses for date ─────────────────
  const fetchTableStatusesForDate = async (date) => {
    if (!selectedRestaurant?.id || !date) return;
    try {
      setLoadingTableStatuses(true);
      const response = await apiClient.request(`/api/bookings/availability/${selectedRestaurant.id}?date=${date}`, { method: 'GET' });
      if (response.success) {
        const statusMap = {};
        response.availableTables?.forEach(table => { statusMap[table.id] = 'available'; });
        floors.forEach(floor => {
          floor.tables?.forEach(table => {
            if (!statusMap[table.id]) statusMap[table.id] = table.status;
          });
        });
        setTableStatusesForDate(statusMap);
      }
    } catch (err) {
      console.error('Error fetching table statuses for date:', err);
      const statusMap = {};
      floors.forEach(floor => { floor.tables?.forEach(table => { statusMap[table.id] = table.status; }); });
      setTableStatusesForDate(statusMap);
    } finally {
      setLoadingTableStatuses(false);
    }
  };

  // ── API: Fetch bookings for date ───────────────────────
  const fetchBookingsForDate = async (date) => {
    if (!selectedRestaurant?.id || !date) return;
    try {
      setLoadingBookings(true);
      const response = await apiClient.getBookings(selectedRestaurant.id, { date });
      if (response.bookings) {
        setBookingsForDate(response.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookingsForDate([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ── Effects ────────────────────────────────────────────
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { try { setUserRole(JSON.parse(userData).role); } catch {} }
  }, []);

  useEffect(() => {
    if (showBookingForm) {
      const today = new Date().toISOString().split('T')[0];
      setBookingData(prev => ({ ...prev, bookingDate: today }));
      setBookingStep(1);
      fetchAvailabilityForDate(today);
    }
  }, [showBookingForm]);

  useEffect(() => {
    if (showBookingForm && bookingData.bookingDate) {
      fetchAvailabilityForDate(bookingData.bookingDate);
    }
  }, [bookingData.bookingDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchTableStatusesForDate(selectedDate);
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate, selectedRestaurant?.id]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { loadInitialData(true); }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedRestaurant?.id) loadFloorsAndTables(selectedRestaurant.id, true);
    };
    const handleFocus = () => {
      if (selectedRestaurant?.id) loadFloorsAndTables(selectedRestaurant.id, true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedRestaurant?.id]);

  useEffect(() => {
    const handleRestaurantChange = () => loadInitialData();
    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.table-dropdown')) setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // ── Data loading ───────────────────────────────────────
  const loadInitialData = useCallback(async (useCache = true) => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const restaurantId = user?.restaurantId || localStorage.getItem('selectedRestaurantId');

      if (useCache && restaurantId) {
        const cachedData = getCachedTablesData(restaurantId);
        if (cachedData) {
          if (cachedData.floors) setFloors(cachedData.floors);
          if (cachedData.selectedRestaurant) setSelectedRestaurant(cachedData.selectedRestaurant);
          setLoading(false);
          setBackgroundLoading(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
      setError('');

      const restaurantsResponse = await apiClient.getRestaurants();
      const restaurants = restaurantsResponse.restaurants || [];
      let restaurant = null;
      if (user?.restaurantId) {
        restaurant = restaurants.find(r => r.id === user.restaurantId);
      } else if (restaurants.length > 0) {
        const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
        restaurant = restaurants.find(r => r.id === savedRestaurantId) || restaurants[0];
      }

      if (restaurant) {
        setSelectedRestaurant(restaurant);
        if (useCache && getCachedTablesData(restaurant.id)) {
          loadFloorsAndTables(restaurant.id, false).then(() => setBackgroundLoading(false));
        } else {
          await loadFloorsAndTables(restaurant.id);
        }
      } else {
        setError('No restaurant found');
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFloorsAndTables = async (restaurantId, forceRefresh = false) => {
    try {
      if (forceRefresh) localStorage.removeItem(`floors_${restaurantId}`);
      const floorsResponse = await apiClient.getFloors(restaurantId);
      let floorsData = [];
      if (floorsResponse.floors?.length > 0) {
        floorsData = floorsResponse.floors;
      } else {
        const tablesResponse = await apiClient.getTables(restaurantId);
        floorsData = [{ id: 'default', name: 'Main Floor', description: 'Main dining area', tables: tablesResponse.tables || [], restaurantId }];
      }
      setFloors(floorsData);
      const currentRestaurant = selectedRestaurant || { id: restaurantId };
      setCachedTablesData(restaurantId, { floors: floorsData, selectedRestaurant: currentRestaurant });
    } catch (err) {
      console.error('Error loading floors and tables:', err);
      setError('Failed to load tables');
    }
  };

  // ── CRUD operations ────────────────────────────────────
  const addFloor = async () => {
    if (!newFloor.name.trim() || !selectedRestaurant) return;
    try {
      const response = await apiClient.createFloor(selectedRestaurant.id, {
        name: newFloor.name.trim(), description: newFloor.description.trim() || null,
        section: newFloor.section?.trim() || null, areaChargeType: newFloor.areaChargeType || 'none',
        areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0,
      });
      setFloors(prev => [...prev, { ...response.floor, tables: [] }]);
      setNewFloor({ name: '', description: '', section: '', areaChargeType: 'none', areaChargeValue: '' });
      setShowAddFloor(false);
      showSuccess('Floor added successfully!');
    } catch (err) { showError(`Failed to add floor: ${err.message}`); }
  };

  const editFloor = async () => {
    if (!editingFloor || !newFloor.name.trim() || !selectedRestaurant) return;
    try {
      await apiClient.updateFloor(editingFloor.id, {
        name: newFloor.name.trim(), description: newFloor.description.trim() || null,
        section: newFloor.section?.trim() || null, areaChargeType: newFloor.areaChargeType || 'none',
        areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0, restaurantId: selectedRestaurant.id
      });
      setFloors(prev => prev.map(f => f.id === editingFloor.id ? { ...f, name: newFloor.name.trim(), description: newFloor.description.trim() || null, areaChargeType: newFloor.areaChargeType || 'none', areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0 } : f));
      setNewFloor({ name: '', description: '', section: '', areaChargeType: 'none', areaChargeValue: '' });
      setEditingFloor(null); setShowEditFloor(false);
      showSuccess('Floor updated successfully!');
    } catch (err) { showError(`Failed to edit floor: ${err.message}`); }
  };

  const deleteFloor = async (floorId) => {
    if (!confirm('Delete this floor and all its tables?')) return;
    try {
      await apiClient.deleteFloor(floorId, { restaurantId: selectedRestaurant.id });
      setFloors(prev => prev.filter(f => f.id !== floorId));
      showSuccess('Floor deleted');
    } catch (err) { showError(`Failed to delete floor: ${err.message}`); }
  };

  const startEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({ name: floor.name, description: floor.description || '', section: floor.section || '', areaChargeType: floor.areaChargeType || 'none', areaChargeValue: floor.areaChargeValue || '' });
    setShowEditFloor(true);
  };

  const addTable = async () => {
    if (!newTable.name.trim() || !selectedFloorForTable || !selectedRestaurant) return;
    try {
      const selectedFloor = floors.find(f => f.id === selectedFloorForTable);
      if (!selectedFloor) { showError('Floor not found'); return; }
      const response = await apiClient.createTable(selectedRestaurant.id, {
        name: newTable.name.trim(), capacity: parseInt(newTable.capacity),
        type: newTable.type, floor: selectedFloor.name, status: 'available'
      });
      setFloors(prev => prev.map(f => f.id === selectedFloorForTable ? { ...f, tables: [...(f.tables || []), response.table] } : f));
      setNewTable({ name: '', capacity: 4, type: 'regular', floorId: null });
      setSelectedFloorForTable(null); setShowAddModal(false);
      showSuccess('Table added!');
    } catch (err) { showError(`Failed to add table: ${err.message}`); }
  };

  const bulkAddTables = async () => {
    if (!bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable || !selectedRestaurant) {
      showError('Please fill in all fields'); return;
    }
    const from = parseInt(bulkTableData.fromNumber), to = parseInt(bulkTableData.toNumber);
    if (isNaN(from) || isNaN(to)) { showError('From and To must be numbers'); return; }
    if (from > to) { showError('From must be ≤ To'); return; }
    if (to - from > 100) { showError('Max 100 tables at once'); return; }
    try {
      const selectedFloor = floors.find(f => f.id === selectedFloorForTable);
      if (!selectedFloor) { showError('Floor not found'); return; }
      const response = await apiClient.bulkCreateTables(selectedRestaurant.id, {
        floor: selectedFloor.name, fromNumber: from, toNumber: to, capacity: parseInt(bulkTableData.capacity)
      });
      if (response.tables?.length > 0) {
        setFloors(prev => prev.map(f => f.id === selectedFloorForTable ? { ...f, tables: [...(f.tables || []), ...response.tables] } : f));
      }
      setBulkTableData({ fromNumber: '', toNumber: '', capacity: 4, floorId: null });
      setSelectedFloorForTable(null); setShowAddModal(false);
      showSuccess(`Created ${response.created} tables${response.skipped > 0 ? ` (${response.skipped} skipped)` : ''}`);
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const updateTableStatus = async (tableId, newStatus, additionalData = {}) => {
    try {
      await apiClient.updateTableStatus(tableId, newStatus, additionalData.orderId, selectedRestaurant?.id);
      setFloors(prev => prev.map(floor => ({
        ...floor,
        tables: (floor.tables || []).map(table => {
          if (table.id === tableId) {
            const updated = { ...table, status: newStatus, ...additionalData };
            if (newStatus === 'available') { updated.customerName = null; updated.startTime = null; updated.reservationTime = null; }
            return updated;
          }
          return table;
        })
      })));
      setTableStatusesForDate(prev => ({ ...prev, [tableId]: newStatus }));
      setActiveDropdown(null);
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const deleteTable = async (tableId) => {
    if (!confirm('Delete this table?')) return;
    try {
      await apiClient.deleteTable(tableId, selectedRestaurant?.id);
      setFloors(prev => prev.map(f => ({ ...f, tables: (f.tables || []).filter(t => t.id !== tableId) })));
      setActiveDropdown(null);
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const createBooking = async () => {
    if (!selectedTable || !bookingData.customerName.trim() || !selectedRestaurant) return;
    try {
      await apiClient.createBooking(selectedRestaurant.id, {
        tableId: selectedTable.id, customerName: bookingData.customerName.trim(),
        customerPhone: bookingData.customerPhone.trim() || null,
        partySize: parseInt(bookingData.partySize), bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime, notes: bookingData.notes.trim() || null, status: 'confirmed'
      });
      await updateTableStatus(selectedTable.id, 'reserved', {
        customerName: bookingData.customerName, reservationTime: bookingData.bookingTime
      });
      setBookingData({ customerName: '', customerPhone: '', partySize: 2, bookingDate: '', bookingTime: '', notes: '' });
      setShowBookingForm(false); setSelectedTable(null); setBookingFromHeader(false); setBookingStep(1);
      fetchBookingsForDate(selectedDate);
      showSuccess('Booking confirmed!');
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const handleTableAction = (action, table) => {
    setSelectedTable(table);
    setActiveDropdown(null);
    switch (action) {
      case 'take-order': {
        const floor = floors.find(f => (f.tables || []).some(t => t.id === table.id));
        router.push(`/dashboard?tableId=${table.id}&tableNo=${encodeURIComponent(table.name)}&floorId=${floor?.id}`);
        break;
      }
      case 'book-table': {
        setBookingData(prev => ({ ...prev, bookingDate: new Date().toISOString().split('T')[0], partySize: Math.min(table.capacity, prev.partySize || 2) }));
        setBookingFromHeader(false); setShowBookingForm(true);
        break;
      }
      case 'out-of-service': updateTableStatus(table.id, 'out-of-service'); break;
      case 'cleaning': updateTableStatus(table.id, 'cleaning'); break;
      case 'make-available': updateTableStatus(table.id, 'available'); break;
      case 'view-order':
        if (table.currentOrderId) router.push(`/dashboard?orderId=${table.currentOrderId}&mode=edit`);
        else showWarning('No active order found');
        break;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await apiClient.cancelBooking(bookingId);
      fetchBookingsForDate(selectedDate);
      loadFloorsAndTables(selectedRestaurant.id, true);
      showSuccess('Booking cancelled');
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await apiClient.updateBooking(bookingId, { status });
      fetchBookingsForDate(selectedDate);
      if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
        loadFloorsAndTables(selectedRestaurant.id, true);
      }
      showSuccess(`Booking ${status}`);
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  // ── Computed ───────────────────────────────────────────
  const totalTables = allTables.length;
  const stats = {
    available: allTables.filter(t => (tableStatusesForDate[t.id] || t.status) === 'available').length,
    occupied: allTables.filter(t => ['occupied', 'serving'].includes(tableStatusesForDate[t.id] || t.status)).length,
    reserved: allTables.filter(t => (tableStatusesForDate[t.id] || t.status) === 'reserved').length,
    other: allTables.filter(t => ['cleaning', 'out-of-service'].includes(tableStatusesForDate[t.id] || t.status)).length,
  };

  const filteredFloors = selectedFloorId === 'all' ? floors : floors.filter(f => f.id === selectedFloorId);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const changeDate = (delta) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getElapsed = (table) => {
    if (!table.lastOrderTime) return null;
    const d = table.lastOrderTime?.toDate ? table.lastOrderTime.toDate() : table.lastOrderTime?._seconds ? new Date(table.lastOrderTime._seconds * 1000) : new Date(table.lastOrderTime);
    if (isNaN(d.getTime())) return null;
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return null;
    const symbol = localStorage.getItem('currencySymbol') || '₹';
    return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // ── Shimmer skeleton ───────────────────────────────────
  const shimmer = {
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%', animation: 'tblShimmer 1.5s ease-in-out infinite',
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`@keyframes tblShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        {/* Header skeleton */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', ...shimmer }} />
            <div><div style={{ width: '180px', height: '20px', borderRadius: '6px', ...shimmer, marginBottom: '6px' }} /><div style={{ width: '120px', height: '14px', borderRadius: '4px', ...shimmer }} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: '110px', height: '40px', borderRadius: '12px', ...shimmer, animationDelay: `${i * 0.1}s` }} />)}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: '100px', height: '36px', borderRadius: '24px', ...shimmer, animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
        {/* Grid skeleton */}
        <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', alignContent: 'start' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', borderLeft: '4px solid #e2e8f0', padding: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '72px', height: '22px', borderRadius: '8px', ...shimmer, marginBottom: '12px', animationDelay: `${i * 0.05}s` }} />
              <div style={{ width: '48px', height: '24px', borderRadius: '6px', ...shimmer, marginBottom: '8px', animationDelay: `${i * 0.05}s` }} />
              <div style={{ width: '64px', height: '14px', borderRadius: '4px', ...shimmer, animationDelay: `${i * 0.05}s` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px 24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FaChair size={28} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>No Tables Yet</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>Set up your restaurant to start managing tables.</p>
          <button onClick={() => router.push('/dashboard')} style={{
            padding: '12px 28px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}>Set Up Restaurant</button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────
  return (
    <div style={{ height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes tblShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes tblFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tblDropdown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tbl-card { transition: all 0.25s ease; cursor: pointer; }
        .tbl-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .tbl-action { transition: background 0.15s; }
        .tbl-action:hover { background: #f8fafc !important; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', padding: isMobile ? '12px 16px' : '16px 24px' }}>
        {/* Row 1: Title + Date + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
              <FaChair color="white" size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Table Management</h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0', fontWeight: '500' }}>{selectedRestaurant?.name || ''}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Date navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <button onClick={() => changeDate(-1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <FaChevronLeft size={12} />
              </button>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', padding: '0 8px', cursor: 'pointer' }} onClick={() => document.getElementById('tbl-date-input')?.showPicker?.()}>
                  {formatDate(selectedDate)}
                </span>
                <input id="tbl-date-input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
              </div>
              <button onClick={() => changeDate(1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <FaChevronRight size={12} />
              </button>
              {!isToday && (
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', color: '#6b7280', cursor: 'pointer' }}>Today</button>
              )}
            </div>

            {/* Action buttons */}
            <button onClick={() => { setBookingFromHeader(true); setSelectedTable(null); setShowBookingForm(true); }} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
            }}>
              <FaCalendarAlt size={12} /> Book
            </button>
            {canManageTables && (
              <button onClick={() => setShowAddModal(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}>
                <FaPlus size={11} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Quick Stats */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Total', count: totalTables, bg: '#f8fafc', dot: '#64748b', border: '#e2e8f0' },
            { label: 'Available', count: stats.available, bg: '#f0fdf4', dot: '#22c55e', border: '#bbf7d0' },
            { label: 'Occupied', count: stats.occupied, bg: '#fefce8', dot: '#f59e0b', border: '#fde68a' },
            { label: 'Reserved', count: stats.reserved, bg: '#eff6ff', dot: '#3b82f6', border: '#bfdbfe' },
            ...(stats.other > 0 ? [{ label: 'Other', count: stats.other, bg: '#fef2f2', dot: '#ef4444', border: '#fecaca' }] : []),
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px',
              backgroundColor: s.bg, borderRadius: '10px', border: `1px solid ${s.border}`,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.dot }} />
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{s.count}</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>{s.label}</span>
            </div>
          ))}
          {loadingTableStatuses && <div style={{ width: '16px', height: '16px', border: '2px solid #f3f4f6', borderTop: '2px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
        </div>

        {/* Row 3: Floor Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setSelectedFloorId('all')} style={{
            padding: '7px 16px', borderRadius: '24px', border: 'none', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            ...(selectedFloorId === 'all'
              ? { backgroundColor: '#ef4444', color: 'white', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }
              : { backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0' }),
          }}>
            All Floors
            <span style={{
              padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
              backgroundColor: selectedFloorId === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            }}>{totalTables}</span>
          </button>
          {floors.map(floor => {
            const floorTableCount = (floor.tables || []).length;
            const active = selectedFloorId === floor.id;
            return (
              <button key={floor.id} onClick={() => setSelectedFloorId(floor.id)} style={{
                padding: '7px 16px', borderRadius: '24px', border: active ? 'none' : '1px solid #e2e8f0',
                fontSize: '13px', fontWeight: active ? '600' : '500', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s',
                backgroundColor: active ? '#ef4444' : 'white', color: active ? 'white' : '#475569',
                boxShadow: active ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
              }}>
                {floor.name}
                <span style={{
                  padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                }}>{floorTableCount}</span>
              </button>
            );
          })}
          {canManageTables && (
            <button onClick={() => setShowAddFloor(true)} style={{
              padding: '7px 16px', borderRadius: '24px', border: '1px dashed #d1d5db', backgroundColor: 'transparent',
              color: '#9ca3af', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
            }}>
              <FaPlus size={10} /> Floor
            </button>
          )}
        </div>
      </div>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>

        {/* Floor sections */}
        {filteredFloors.map((floor) => {
          const tables = floor.tables || [];
          return (
            <div key={floor.id} style={{ marginBottom: '32px' }}>
              {/* Floor header (only when showing all floors) */}
              {selectedFloorId === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{floor.name}</span>
                    {floor.areaChargeType && floor.areaChargeType !== 'none' && (
                      <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '6px' }}>
                        {floor.areaChargeType === 'percentage' ? `+${floor.areaChargeValue}%` : `+₹${floor.areaChargeValue}`}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{tables.length} tables</span>
                  </div>
                  {canManageTables && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEditFloor(floor)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><FaEdit size={12} /></button>
                      <button onClick={() => deleteFloor(floor.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaTrash size={12} /></button>
                    </div>
                  )}
                </div>
              )}

              {/* Table grid */}
              {tables.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
                  <FaChair size={36} color="#d1d5db" style={{ marginBottom: '12px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>No tables yet</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Add tables to this floor to get started</div>
                  {canManageTables && (
                    <button onClick={() => { setSelectedFloorForTable(floor.id); setShowAddModal(true); }} style={{
                      padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                      border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                    }}>
                      <FaPlus size={11} style={{ marginRight: '6px' }} /> Add Table
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: isMobile ? '12px' : '16px',
                }}>
                  {tables.map((table, idx) => {
                    const tableStatus = tableStatusesForDate[table.id] || table.status;
                    const sInfo = getTableStatusInfo(tableStatus);
                    const StatusIcon = sInfo.icon;
                    const isDropdownOpen = activeDropdown === table.id;
                    const elapsed = getElapsed(table);
                    const orderTotal = formatCurrency(table.currentOrderTotal || table.currentOrderFinalAmount);

                    return (
                      <div key={table.id} className="tbl-card table-dropdown" style={{
                        backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
                        borderLeft: `4px solid ${sInfo.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        padding: '16px', position: 'relative', overflow: 'visible',
                        opacity: 0, animation: `tblFadeIn 0.3s ease-out ${idx * 0.03}s forwards`,
                      }} onClick={() => setActiveDropdown(isDropdownOpen ? null : table.id)}>
                        {/* Status badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
                          backgroundColor: sInfo.bg, borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: sInfo.text,
                        }}>
                          <StatusIcon size={10} /> {sInfo.label}
                        </div>

                        {/* Table number + capacity */}
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', marginTop: '10px' }}>
                          {table.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>
                          <FaUsers size={11} /> {table.capacity} seats
                        </div>

                        {/* Context row */}
                        {(tableStatus === 'occupied' || tableStatus === 'serving') && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                            <div>
                              {table.customerName && <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{table.customerName}</div>}
                              {elapsed && <div style={{ fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}><FaClock size={9} /> {elapsed}</div>}
                            </div>
                            {orderTotal && <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>{orderTotal}</div>}
                          </div>
                        )}
                        {tableStatus === 'reserved' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '13px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaClock size={10} />
                              {table.customerName || 'Reserved'}{table.reservationTime ? ` @ ${table.reservationTime}` : ''}
                            </div>
                          </div>
                        )}
                        {tableStatus === 'cleaning' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Being cleaned</div>
                        )}
                        {tableStatus === 'out-of-service' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#ef4444' }}>Temporarily unavailable</div>
                        )}

                        {/* Dropdown */}
                        {isDropdownOpen && (
                          <div style={{
                            position: 'absolute', top: '100%', left: '0', right: '0', marginTop: '4px',
                            backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #f1f5f9', zIndex: 30, overflow: 'hidden',
                            animation: 'tblDropdown 0.15s ease-out',
                          }}>
                            {tableStatus === 'available' && (
                              <>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#059669', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaUtensils size={12} /> Take Order
                                </button>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('book-table', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaCalendarAlt size={12} /> Book Table
                                </button>
                                {canManageTables && <>
                                  <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('out-of-service', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaTools size={12} /> Out of Service
                                  </button>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaConciergeBell size={12} /> Cleaning
                                  </button>
                                  <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaTrash size={12} /> Delete
                                  </button>
                                </>}
                              </>
                            )}
                            {(tableStatus === 'occupied' || tableStatus === 'serving') && (
                              <>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('view-order', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaEye size={12} /> View Order
                                </button>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaCheck size={12} /> Make Available
                                </button>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaConciergeBell size={12} /> Cleaning
                                </button>
                              </>
                            )}
                            {tableStatus === 'reserved' && (
                              <>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#059669', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaUtensils size={12} /> Take Order
                                </button>
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaCheck size={12} /> Make Available
                                </button>
                              </>
                            )}
                            {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
                              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ width: '100%', padding: '11px 16px', border: 'none', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaCheck size={12} /> Make Available
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ─── BOOKINGS PANEL ─── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCalendarAlt size={13} color="#6b7280" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                Bookings {isToday ? 'Today' : `for ${formatDate(selectedDate)}`}
              </span>
              {bookingsForDate.length > 0 && (
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '8px' }}>{bookingsForDate.length}</span>
              )}
            </div>
            {loadingBookings && <div style={{ width: '16px', height: '16px', border: '2px solid #f3f4f6', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
          {bookingsForDate.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <FaCalendarAlt size={24} color="#e2e8f0" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No bookings for this date</p>
            </div>
          ) : (
            <div>
              {bookingsForDate.map((booking, i) => {
                const bStatus = booking.status || 'confirmed';
                const bColors = {
                  confirmed: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
                  arrived: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
                  completed: { bg: '#f8fafc', text: '#475569', dot: '#64748b' },
                  cancelled: { bg: '#f1f5f9', text: '#64748b', dot: '#9ca3af' },
                  'no-show': { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
                };
                const bc = bColors[bStatus] || bColors.confirmed;
                return (
                  <div key={booking.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < bookingsForDate.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ minWidth: '60px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {booking.bookingTime || '—'}
                    </div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: bc.dot, flexShrink: 0, boxShadow: `0 0 0 3px ${bc.dot}20` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{booking.customerName || 'Guest'}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {booking.partySize} guest{booking.partySize !== 1 ? 's' : ''}
                        {booking.tableId && ` · Table ${allTables.find(t => t.id === booking.tableId)?.name || '?'}`}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '8px', backgroundColor: bc.bg, color: bc.text, textTransform: 'capitalize' }}>{bStatus}</span>
                    {bStatus === 'confirmed' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => updateBookingStatus(booking.id, 'arrived')} title="Check in" style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><FaCheck size={10} /></button>
                        <button onClick={() => cancelBooking(booking.id)} title="Cancel" style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaTimes size={10} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── ADD TABLE MODAL ─── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Add Table</h3>
                <button onClick={() => setShowAddModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={14} color="#6b7280" /></button>
              </div>
              {/* Mode toggle */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px', marginBottom: '20px' }}>
                {['single', 'bulk'].map(mode => (
                  <button key={mode} onClick={() => setAddMode(mode)} style={{
                    flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    backgroundColor: addMode === mode ? 'white' : 'transparent',
                    color: addMode === mode ? '#1f2937' : '#6b7280',
                    boxShadow: addMode === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>{mode === 'single' ? 'Single Table' : 'Bulk Add'}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {/* Floor selector */}
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Floor</label>
              <select value={selectedFloorForTable || ''} onChange={e => setSelectedFloorForTable(e.target.value)} style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none',
              }}>
                <option value="">Select floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>

              {addMode === 'single' ? (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Table Name</label>
                  <input value={newTable.name} onChange={e => setNewTable(p => ({ ...p, name: e.target.value }))} placeholder="e.g. T1, VIP 1" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Capacity</label>
                  <input type="number" value={newTable.capacity} onChange={e => setNewTable(p => ({ ...p, capacity: e.target.value }))} min={1} max={20} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={addTable} disabled={!newTable.name.trim() || !selectedFloorForTable} style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    background: newTable.name.trim() && selectedFloorForTable ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0',
                    color: newTable.name.trim() && selectedFloorForTable ? 'white' : '#9ca3af',
                  }}>Add Table</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>From #</label>
                      <input type="number" value={bulkTableData.fromNumber} onChange={e => setBulkTableData(p => ({ ...p, fromNumber: e.target.value }))} placeholder="1" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>To #</label>
                      <input type="number" value={bulkTableData.toNumber} onChange={e => setBulkTableData(p => ({ ...p, toNumber: e.target.value }))} placeholder="10" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Seats per table</label>
                  <input type="number" value={bulkTableData.capacity} onChange={e => setBulkTableData(p => ({ ...p, capacity: e.target.value }))} min={1} max={20} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  {bulkTableData.fromNumber && bulkTableData.toNumber && parseInt(bulkTableData.toNumber) >= parseInt(bulkTableData.fromNumber) && (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #f1f5f9', marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
                      Will create <strong style={{ color: '#1f2937' }}>{parseInt(bulkTableData.toNumber) - parseInt(bulkTableData.fromNumber) + 1}</strong> tables ({bulkTableData.fromNumber} – {bulkTableData.toNumber})
                    </div>
                  )}
                  <button onClick={bulkAddTables} disabled={!bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable} style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    background: bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0',
                    color: bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable ? 'white' : '#9ca3af',
                  }}>Create Tables</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT FLOOR MODAL ─── */}
      {(showAddFloor || showEditFloor) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowAddFloor(false); setShowEditFloor(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{showEditFloor ? 'Edit Floor' : 'Add Floor'}</h3>
                <button onClick={() => { setShowAddFloor(false); setShowEditFloor(false); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={14} color="#6b7280" /></button>
              </div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Floor Name *</label>
              <input value={newFloor.name} onChange={e => setNewFloor(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ground Floor, Terrace" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Description</label>
              <input value={newFloor.description} onChange={e => setNewFloor(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Area Charge</label>
              <select value={newFloor.areaChargeType} onChange={e => setNewFloor(p => ({ ...p, areaChargeType: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '12px', outline: 'none' }}>
                <option value="none">None</option>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
              {newFloor.areaChargeType !== 'none' && (
                <input type="number" value={newFloor.areaChargeValue} onChange={e => setNewFloor(p => ({ ...p, areaChargeValue: e.target.value }))} placeholder={newFloor.areaChargeType === 'percentage' ? 'e.g. 10' : 'e.g. 50'} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
              )}
              <button onClick={showEditFloor ? editFloor : addFloor} disabled={!newFloor.name.trim()} style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '8px',
                background: newFloor.name.trim() ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e2e8f0',
                color: newFloor.name.trim() ? 'white' : '#9ca3af',
              }}>{showEditFloor ? 'Update Floor' : 'Add Floor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOOKING MODAL (3-step wizard) ─── */}
      {showBookingForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowBookingForm(false); setBookingStep(1); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '24px 24px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Book a Table</h3>
                <button onClick={() => { setShowBookingForm(false); setBookingStep(1); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={14} color="#6b7280" /></button>
              </div>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[1, 2, 3].map(step => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: step < 3 ? 1 : 'none' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700',
                      backgroundColor: bookingStep > step ? '#22c55e' : bookingStep === step ? '#ef4444' : '#f1f5f9',
                      color: bookingStep >= step ? 'white' : '#9ca3af',
                    }}>{bookingStep > step ? <FaCheck size={10} /> : step}</div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: bookingStep === step ? '#1f2937' : '#9ca3af', whiteSpace: 'nowrap' }}>
                      {step === 1 ? 'Date & Time' : step === 2 ? 'Details' : 'Table'}
                    </span>
                    {step < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: bookingStep > step ? '#22c55e' : '#f1f5f9' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div style={{ padding: '0 24px 24px', flex: 1, overflow: 'auto' }}>
              {bookingStep === 1 && (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Date</label>
                  <input type="date" value={bookingData.bookingDate} onChange={e => setBookingData(p => ({ ...p, bookingDate: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Time Slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {(availableTimeSlots.length > 0 ? availableTimeSlots : generateTimeSlots()).map(slot => (
                      <button key={slot.value} onClick={() => { setBookingData(p => ({ ...p, bookingTime: slot.value })); setSelectedTimeSlot(slot.value); }} style={{
                        padding: '10px 4px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'center',
                        border: bookingData.bookingTime === slot.value ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        backgroundColor: bookingData.bookingTime === slot.value ? 'rgba(239,68,68,0.05)' : 'white',
                        color: bookingData.bookingTime === slot.value ? '#ef4444' : '#374151',
                      }}>{slot.display}</button>
                    ))}
                  </div>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Customer Name *</label>
                  <input value={bookingData.customerName} onChange={e => setBookingData(p => ({ ...p, customerName: e.target.value }))} placeholder="Guest name" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Phone</label>
                  <input value={bookingData.customerPhone} onChange={e => setBookingData(p => ({ ...p, customerPhone: e.target.value }))} placeholder="Optional" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Party Size</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <button key={n} onClick={() => setBookingData(p => ({ ...p, partySize: n }))} style={{
                        width: '40px', height: '40px', borderRadius: '10px', border: bookingData.partySize === n ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        backgroundColor: bookingData.partySize === n ? 'rgba(239,68,68,0.05)' : 'white',
                        color: bookingData.partySize === n ? '#ef4444' : '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                      }}>{n}</button>
                    ))}
                  </div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Notes</label>
                  <textarea value={bookingData.notes} onChange={e => setBookingData(p => ({ ...p, notes: e.target.value }))} placeholder="Special requests..." rows={2} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Select an available table for {bookingData.bookingDate} at {bookingData.bookingTime}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {allTables.map(table => {
                      const isAvail = (tableStatusesForDate[table.id] || table.status) === 'available';
                      const isSelected = selectedTable?.id === table.id;
                      return (
                        <button key={table.id} onClick={() => isAvail && setSelectedTable(table)} disabled={!isAvail} style={{
                          padding: '14px 10px', borderRadius: '12px', textAlign: 'center', cursor: isAvail ? 'pointer' : 'not-allowed',
                          border: isSelected ? '2px solid #ef4444' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? 'rgba(239,68,68,0.05)' : isAvail ? 'white' : '#f8fafc',
                          opacity: isAvail ? 1 : 0.4,
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: isSelected ? '#ef4444' : '#1f2937' }}>{table.name}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{table.capacity} seats</div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {bookingStep > 1 ? (
                <button onClick={() => setBookingStep(s => s - 1)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', fontWeight: '600', color: '#6b7280', cursor: 'pointer' }}>Back</button>
              ) : <div />}
              {bookingStep < 3 ? (
                <button onClick={() => setBookingStep(s => s + 1)} disabled={bookingStep === 1 && (!bookingData.bookingDate || !bookingData.bookingTime)} style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  background: (bookingStep === 1 && bookingData.bookingDate && bookingData.bookingTime) || bookingStep === 2 ? '#1f2937' : '#e2e8f0',
                  color: (bookingStep === 1 && bookingData.bookingDate && bookingData.bookingTime) || bookingStep === 2 ? 'white' : '#9ca3af',
                }}>Next</button>
              ) : (
                <button onClick={createBooking} disabled={!selectedTable || !bookingData.customerName.trim()} style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  background: selectedTable && bookingData.customerName.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#e2e8f0',
                  color: selectedTable && bookingData.customerName.trim() ? 'white' : '#9ca3af',
                }}>Confirm Booking</button>
              )}
            </div>
          </div>
        </div>
      )}

      <NotificationContainer />
    </div>
  );
};

export default TableManagement;
