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
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [hoveredTableId, setHoveredTableId] = useState(null);

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
  const canResetTables = ['owner', 'admin'].includes(userRole) || (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').pageAccess?.resetTables; } catch { return false; } })();

  // Timer tick to keep elapsed times updated (every 60s)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Status config (matching dashboard POS cards) ───────
  const statusConfig = {
    available: { color: '#10b981', bg: '#f0fdf4', text: '#166534', label: 'Available', icon: FaChair, border: '#10b981' },
    occupied: { color: '#f59e0b', bg: '#fffbeb', text: '#92400e', label: 'Occupied', icon: FaUsers, border: '#fcd34d' },
    serving: { color: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', label: 'Serving', icon: FaUtensils, border: '#8b5cf6' },
    reserved: { color: '#3b82f6', bg: '#eff6ff', text: '#1e40af', label: 'Reserved', icon: FaClock, border: '#3b82f6' },
    cleaning: { color: '#6b7280', bg: '#f3f4f6', text: '#475569', label: 'Cleaning', icon: FaTools, border: '#9ca3af' },
    'out-of-service': { color: '#ef4444', bg: '#fef2f2', text: '#991b1b', label: 'Out of Service', icon: FaBan, border: '#ef4444' },
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
      setBookingStep(1);
      // Use the already-set bookingDate (from selectedDate) or fall back to today
      const dateToUse = bookingData.bookingDate || new Date().toISOString().split('T')[0];
      if (!bookingData.bookingDate) {
        setBookingData(prev => ({ ...prev, bookingDate: dateToUse }));
      }
      fetchAvailabilityForDate(dateToUse);
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

  // ─── Pusher subscription for real-time table/order updates ───
  const loadFloorsRef = useRef(null);
  useEffect(() => { loadFloorsRef.current = loadFloorsAndTables; });

  useEffect(() => {
    if (!selectedRestaurant?.id) return;

    const restaurantId = selectedRestaurant.id;
    let pusher = null;
    let channel = null;
    let debounceTimer = null;

    // Dynamic import to avoid SSR/prerender issues
    import('pusher-js').then((PusherModule) => {
      const Pusher = PusherModule.default;
      pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      });

      const channelName = `restaurant-${restaurantId}`;
      channel = pusher.subscribe(channelName);

      console.log(`📡 Tables: Subscribed to '${channelName}'`);

      const debouncedRefresh = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => loadFloorsRef.current?.(restaurantId, true), 1000);
      };

      const handleEvent = (eventName) => (data) => {
        console.log(`📡 Tables: Received '${eventName}'`, data);
        debouncedRefresh();
      };

      channel.bind('order-created', handleEvent('order-created'));
      channel.bind('order-updated', handleEvent('order-updated'));
      channel.bind('order-status-updated', handleEvent('order-status-updated'));
      channel.bind('order-completed', handleEvent('order-completed'));
      channel.bind('order-deleted', handleEvent('order-deleted'));
      channel.bind('table-status-updated', handleEvent('table-status-updated'));
      channel.bind('tables-reset', handleEvent('tables-reset'));
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        channel.unbind_all();
        if (pusher) {
          pusher.unsubscribe(channel.name);
          pusher.disconnect();
        }
      }
    };
  }, [selectedRestaurant?.id]);

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
      if (user?.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
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

  // ── Reset all tables ──────────────────────────────────
  const handleResetAllTables = async () => {
    const allTables = floors.flatMap(f => f.tables || []);
    const occupiedCount = allTables.filter(t => t.status === 'occupied').length;
    if (occupiedCount === 0) {
      showWarning('All tables are already available.');
      return;
    }
    if (!window.confirm(`Free ${occupiedCount} occupied table(s)? This will mark them as available.`)) return;
    try {
      await apiClient.resetAllTables(selectedRestaurant.id);
      setFloors(prev => prev.map(floor => ({
        ...floor,
        tables: floor.tables?.map(t =>
          t.status === 'occupied' ? { ...t, status: 'available', currentOrderId: null } : t
        ),
      })));
      showSuccess(`${occupiedCount} table(s) reset to available.`);
      loadFloorsAndTables(selectedRestaurant.id, true);
    } catch (err) {
      showError(err.message || 'Failed to reset tables');
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

  const [deleteFloorConfirm, setDeleteFloorConfirm] = useState(null);
  const [deletingFloor, setDeletingFloor] = useState(false);

  const deleteFloor = async (floorId) => {
    if (!selectedRestaurant?.id) {
      showError('No restaurant selected');
      return;
    }
    try {
      setDeletingFloor(true);
      await apiClient.deleteFloor(floorId, selectedRestaurant.id);
      setFloors(prev => prev.filter(f => f.id !== floorId));
      if (selectedFloorId === floorId) setSelectedFloorId('all');
      showSuccess('Floor deleted successfully');
      setDeleteFloorConfirm(null);
    } catch (err) { showError(`Failed to delete floor: ${err.message}`); }
    finally { setDeletingFloor(false); }
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
    setBookingSubmitting(true);
    try {
      await apiClient.createBooking(selectedRestaurant.id, {
        tableId: selectedTable.id, customerName: bookingData.customerName.trim(),
        customerPhone: bookingData.customerPhone.trim() || null,
        partySize: parseInt(bookingData.partySize), bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime, notes: bookingData.notes.trim() || null, status: 'confirmed'
      });
      // Only update live table status if booking is for today
      const todayStr = new Date().toISOString().split('T')[0];
      if (bookingData.bookingDate === todayStr) {
        await updateTableStatus(selectedTable.id, 'reserved', {
          customerName: bookingData.customerName, reservationTime: bookingData.bookingTime
        });
      }
      setBookingData({ customerName: '', customerPhone: '', partySize: 2, bookingDate: '', bookingTime: '', notes: '' });
      setShowBookingForm(false); setSelectedTable(null); setBookingFromHeader(false); setBookingStep(1);
      // Refresh bookings for whichever date was booked (might differ from selectedDate)
      fetchBookingsForDate(selectedDate);
      if (bookingData.bookingDate !== selectedDate) fetchBookingsForDate(bookingData.bookingDate);
      showSuccess('Booking confirmed! Table reserved successfully.');
    } catch (err) { showError(`Failed: ${err.message}`); } finally { setBookingSubmitting(false); }
  };

  const handleTableAction = (action, table) => {
    setSelectedTable(table);
    setActiveDropdown(null);
    switch (action) {
      case 'take-order': {
        const floor = floors.find(f => (f.tables || []).some(t => t.id === table.id));
        router.push(`/dashboard?tableId=${table.id}&tableNo=${encodeURIComponent(table.name)}&floorId=${floor?.id}&floorName=${encodeURIComponent(floor?.name || '')}`);
        break;
      }
      case 'book-table': {
        setBookingData(prev => ({ ...prev, bookingDate: selectedDate, partySize: Math.min(table.capacity, prev.partySize || 2) }));
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
  const isTodayDate = selectedDate === new Date().toISOString().split('T')[0];

  // Build per-table booking map for non-today dates
  const tableBookingsMap = {};
  bookingsForDate.forEach(b => {
    if (b.tableId) {
      if (!tableBookingsMap[b.tableId]) tableBookingsMap[b.tableId] = [];
      tableBookingsMap[b.tableId].push(b);
    }
  });

  // For non-today: count tables with bookings as "reserved", rest as "available"
  const stats = isTodayDate ? {
    available: allTables.filter(t => (tableStatusesForDate[t.id] || t.status) === 'available').length,
    occupied: allTables.filter(t => ['occupied', 'serving'].includes(tableStatusesForDate[t.id] || t.status)).length,
    reserved: allTables.filter(t => (tableStatusesForDate[t.id] || t.status) === 'reserved').length,
    other: allTables.filter(t => ['cleaning', 'out-of-service'].includes(tableStatusesForDate[t.id] || t.status)).length,
  } : {
    available: allTables.filter(t => !tableBookingsMap[t.id]?.length).length,
    occupied: 0,
    reserved: allTables.filter(t => tableBookingsMap[t.id]?.length > 0).length,
    other: 0,
  };

  const filteredFloors = selectedFloorId === 'all' ? floors : floors.filter(f => f.id === selectedFloorId);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = isTodayDate;

  const changeDate = (delta) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    const newDate = d.toISOString().split('T')[0];
    setSelectedDate(newDate);
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
        <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', alignContent: 'start' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', padding: '12px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '40px', height: '16px', borderRadius: '4px', ...shimmer, animationDelay: `${i * 0.05}s` }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', ...shimmer, animationDelay: `${i * 0.05}s` }} />
              </div>
              <div style={{ width: '52px', height: '10px', borderRadius: '4px', ...shimmer, animationDelay: `${i * 0.05}s` }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', ...shimmer, animationDelay: `${i * 0.05}s` }} />
              </div>
              <div style={{ width: '100%', height: '32px', borderRadius: '6px', ...shimmer, animationDelay: `${i * 0.05}s` }} />
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
        @keyframes tblDropdown { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        @keyframes tblPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .tbl-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .tbl-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1) !important; }
        .tbl-action { transition: background 0.15s; }
        .tbl-action:hover { filter: brightness(0.95); }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={() => changeDate(-1)} style={{ width: '36px', height: '36px', borderRadius: '12px 0 0 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', borderRight: '1px solid #f1f5f9' }}>
                <FaChevronLeft size={11} />
              </button>
              <div style={{ position: 'relative', padding: '0 6px' }}>
                <button onClick={() => document.getElementById('tbl-date-input')?.showPicker?.()} style={{
                  border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '6px 8px',
                  fontSize: '13px', fontWeight: '700', color: isToday ? '#ef4444' : '#1f2937',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <FaCalendarAlt size={11} color={isToday ? '#ef4444' : '#9ca3af'} />
                  {isToday ? 'Today' : formatDate(selectedDate)}
                </button>
                <input id="tbl-date-input" type="date" value={selectedDate} onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
              </div>
              <button onClick={() => changeDate(1)} style={{ width: '36px', height: '36px', borderRadius: '0 12px 12px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', borderLeft: '1px solid #f1f5f9' }}>
                <FaChevronRight size={11} />
              </button>
              {!isToday && (
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: '11px', fontWeight: '700', color: 'white', cursor: 'pointer', marginLeft: '6px', marginRight: '4px' }}>Today</button>
              )}
            </div>

            {/* Action buttons */}
            <button onClick={() => { setBookingFromHeader(true); setSelectedTable(null); setBookingData(prev => ({ ...prev, bookingDate: selectedDate })); setShowBookingForm(true); }} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
            }}>
              <FaCalendarAlt size={12} /> Book
            </button>
            {canResetTables && (
              <button onClick={handleResetAllTables} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              }}>
                <FaTools size={11} /> Reset All
              </button>
            )}
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
            { label: isToday ? 'Available' : 'Free', count: stats.available, bg: '#f0fdf4', dot: '#22c55e', border: '#bbf7d0' },
            ...(isToday && stats.occupied > 0 ? [{ label: 'Occupied', count: stats.occupied, bg: '#fefce8', dot: '#f59e0b', border: '#fde68a' }] : []),
            ...(stats.reserved > 0 ? [{ label: isToday ? 'Reserved' : 'Booked', count: stats.reserved, bg: '#eff6ff', dot: '#3b82f6', border: '#bfdbfe' }] : []),
            ...(isToday && stats.other > 0 ? [{ label: 'Other', count: stats.other, bg: '#fef2f2', dot: '#ef4444', border: '#fecaca' }] : []),
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
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px', position: 'relative' }}>

        {/* Loading overlay when changing dates */}
        {loadingTableStatuses && (
          <div style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(248,250,252,0.7)', zIndex: 20,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px',
            animation: 'tblPulse 1.2s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '18px', height: '18px', border: '2.5px solid #f3f4f6', borderTop: '2.5px solid #ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Loading tables...</span>
            </div>
          </div>
        )}

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
                      <button onClick={() => setDeleteFloorConfirm(floor)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaTrash size={12} /></button>
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
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: isMobile ? '12px' : '20px',
                }}>
                  {tables.map((table, idx) => {
                    // For non-today: determine status from bookings, not live data
                    const tblBookings = tableBookingsMap[table.id] || [];
                    const hasBookings = tblBookings.length > 0;
                    const tableStatus = isToday ? (tableStatusesForDate[table.id] || table.status) : (hasBookings ? 'reserved' : 'available');
                    const sInfo = getTableStatusInfo(tableStatus);
                    const StatusIcon = sInfo.icon;
                    const isDropdownOpen = activeDropdown === table.id;
                    const isOccupied = isToday && (tableStatus === 'occupied' || tableStatus === 'serving');
                    const isAvailable = tableStatus === 'available';
                    const elapsed = isToday ? getElapsed(table) : null;
                    const elapsedIsLong = elapsed && elapsed.includes('d');

                    return (
                      <div key={table.id} className="tbl-card table-dropdown" style={{
                        background: sInfo.bg,
                        borderRadius: '12px',
                        border: isOccupied ? 'none' : `1px solid ${sInfo.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        padding: '0', position: 'relative', overflow: 'hidden',
                        minHeight: '120px', display: 'flex', flexDirection: 'column',
                        opacity: 0, animation: `tblFadeIn 0.3s ease-out ${idx * 0.03}s forwards`,
                      }} onClick={() => setActiveDropdown(isDropdownOpen ? null : table.id)}
                         onMouseEnter={() => setHoveredTableId(table.id)}
                         onMouseLeave={() => setHoveredTableId(null)}>

                        {/* Animated dotted border for occupied tables (today only) */}
                        {isOccupied && (
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="10.5" ry="10.5" fill="none" stroke={sInfo.color} strokeWidth="2" strokeDasharray="6,6" strokeDashoffset="100">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                            </rect>
                          </svg>
                        )}

                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                          {/* Header: name + status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                                  {table.name}
                                </span>
                                {isOccupied && elapsed && (
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: elapsedIsLong ? '#dc2626' : '#92400e', whiteSpace: 'nowrap' }}>
                                    {elapsed}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaChair size={9} /> {table.capacity || '-'} Seats
                              </div>
                            </div>
                            {isAvailable ? (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px #d1fae5' }} />
                            ) : (
                              <div style={{
                                background: sInfo.bg, color: sInfo.color, padding: '3px 8px', borderRadius: '12px',
                                fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${sInfo.border}`,
                                display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0,
                              }}>
                                {sInfo.label}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {isToday ? (
                              /* ── TODAY: show live data ── */
                              <>
                                {isOccupied && (table.currentOrderFinalAmount || table.currentOrderTotal) ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '9px', color: '#92400e', fontWeight: 500, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Total {table.currentOrderTax ? '(incl. tax)' : ''}
                                    </div>
                                    <div style={{
                                      fontSize: '18px', fontWeight: 800, color: '#b45309',
                                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '4px 12px',
                                      borderRadius: '8px', border: '1px solid #fcd34d',
                                    }}>
                                      {formatCurrency(table.currentOrderFinalAmount || table.currentOrderTotal)}
                                    </div>
                                  </div>
                                ) : isOccupied && table.customerName ? (
                                  <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#92400e' }}>{table.customerName}</div>
                                ) : tableStatus === 'reserved' ? (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>{table.customerName || 'Reserved'}</div>
                                    {table.reservationTime && <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>{table.reservationTime}</div>}
                                  </div>
                                ) : tableStatus === 'cleaning' ? (
                                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>Being cleaned</div>
                                ) : tableStatus === 'out-of-service' ? (
                                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#ef4444' }}>Unavailable</div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                    <StatusIcon size={32} color={sInfo.color} />
                                  </div>
                                )}
                              </>
                            ) : (
                              /* ── NON-TODAY: show booking info for this date ── */
                              <>
                                {hasBookings ? (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                      fontSize: '20px', fontWeight: 800, color: '#1e40af', marginBottom: '2px',
                                    }}>
                                      {tblBookings.length}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600 }}>
                                      {tblBookings.length === 1 ? 'Booking' : 'Bookings'}
                                    </div>
                                    {tblBookings[0]?.customerName && (
                                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tblBookings[0].customerName}
                                        {tblBookings.length > 1 && ` +${tblBookings.length - 1}`}
                                      </div>
                                    )}
                                    {tblBookings[0]?.bookingTime && (
                                      <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>
                                        {tblBookings[0].bookingTime}
                                        {tblBookings.length > 1 && ` ...`}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                      <FaChair size={32} color="#10b981" />
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>No bookings</div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Hover tooltip showing booking details (non-today) */}
                        {!isToday && hasBookings && hoveredTableId === table.id && !isDropdownOpen && (
                          <div style={{
                            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                            marginBottom: '8px', backgroundColor: '#1f2937', color: 'white', borderRadius: '12px',
                            padding: '10px 14px', fontSize: '11px', minWidth: '180px', maxWidth: '240px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 40,
                            animation: 'tblDropdown 0.12s ease-out',
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '12px' }}>
                              {tblBookings.length} Booking{tblBookings.length > 1 ? 's' : ''}
                            </div>
                            {tblBookings.slice(0, 4).map((b, bi) => (
                              <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '3px 0', borderTop: bi > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                <span style={{ opacity: 0.9 }}>{b.customerName || 'Guest'}</span>
                                <span style={{ opacity: 0.6 }}>{b.bookingTime || '—'} · {b.partySize || '?'}p</span>
                              </div>
                            ))}
                            {tblBookings.length > 4 && (
                              <div style={{ opacity: 0.5, marginTop: '4px' }}>+{tblBookings.length - 4} more</div>
                            )}
                            {/* Arrow */}
                            <div style={{
                              position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                              width: '10px', height: '10px', backgroundColor: '#1f2937',
                              borderRadius: '2px', transform: 'translateX(-50%) rotate(45deg)',
                            }} />
                          </div>
                        )}

                        {/* Action buttons at bottom */}
                        <div style={{ padding: '0 8px 8px', position: 'relative', zIndex: 2 }}>
                          {isToday ? (
                            /* ── TODAY: live action buttons ── */
                            <>
                              {isAvailable && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{
                                  width: '100%', padding: '8px 12px', background: '#059669', color: 'white', border: 'none',
                                  borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}>
                                  <FaUtensils size={10} /> Take Order
                                </button>
                              )}
                              {isOccupied && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('view-order', table); }} style={{
                                    flex: 1, padding: '8px', background: 'white', border: '1px solid #e5e7eb', color: '#374151',
                                    borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                  }}>
                                    <FaEye size={10} /> View
                                  </button>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{
                                    width: '32px', height: '32px', background: '#fef2f2', border: 'none', color: '#ef4444',
                                    borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    <FaCheck size={10} />
                                  </button>
                                </div>
                              )}
                              {tableStatus === 'reserved' && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{
                                  width: '100%', padding: '8px 12px', background: '#059669', color: 'white', border: 'none',
                                  borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}>
                                  <FaUtensils size={10} /> Seat Guest
                                </button>
                              )}
                              {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{
                                  width: '100%', padding: '8px 12px', background: 'white', color: '#059669', border: '1px solid #d1fae5',
                                  borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}>
                                  <FaCheck size={10} /> Make Available
                                </button>
                              )}
                            </>
                          ) : (
                            /* ── NON-TODAY: book table button ── */
                            <button className="tbl-action" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTable(table);
                              setBookingData(prev => ({ ...prev, bookingDate: selectedDate, partySize: Math.min(table.capacity, prev.partySize || 2) }));
                              setBookingFromHeader(false);
                              setShowBookingForm(true);
                            }} style={{
                              width: '100%', padding: '8px 12px',
                              background: hasBookings ? 'white' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                              color: hasBookings ? '#059669' : 'white',
                              border: hasBookings ? '1px solid #bbf7d0' : 'none',
                              borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            }}>
                              <FaCalendarAlt size={10} /> {hasBookings ? '+ Add Booking' : 'Book Table'}
                            </button>
                          )}
                        </div>

                        {/* Dropdown overlay on card top (today only) */}
                        {isToday && isDropdownOpen && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            backgroundColor: 'white', borderRadius: '12px 12px 0 0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            zIndex: 30, overflow: 'hidden',
                            animation: 'tblDropdown 0.15s ease-out',
                          }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                              {isAvailable && (
                                <>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('book-table', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5' }}>
                                    <FaCalendarAlt size={12} /> Book
                                  </button>
                                  {canManageTables && (
                                    <>
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('out-of-service', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#8b5cf6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' }}>
                                        <FaBan size={12} /> Service
                                      </button>
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                        <FaTools size={12} /> Clean
                                      </button>
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                        <FaTrash size={12} /> Delete
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                              {isOccupied && (
                                <>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                    <FaTools size={12} /> Clean
                                  </button>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                    <FaCheck size={12} /> Free
                                  </button>
                                </>
                              )}
                              {tableStatus === 'reserved' && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                  <FaCheck size={12} /> Cancel & Free
                                </button>
                              )}
                              {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
                                <>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                    <FaCheck size={12} /> Free
                                  </button>
                                  {canManageTables && (
                                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                      <FaTrash size={12} /> Delete
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
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
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCalendarAlt size={13} color="#3b82f6" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                Bookings {isToday ? 'Today' : `for ${formatDate(selectedDate)}`}
              </span>
              {bookingsForDate.length > 0 && (
                <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '10px' }}>{bookingsForDate.length}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loadingBookings && <div style={{ width: '16px', height: '16px', border: '2px solid #f3f4f6', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
              <button onClick={() => { setBookingFromHeader(true); setSelectedTable(null); setBookingData(prev => ({ ...prev, bookingDate: selectedDate })); setShowBookingForm(true); }} style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <FaPlus size={9} /> Add
              </button>
            </div>
          </div>
          {bookingsForDate.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FaCalendarAlt size={20} color="#d1d5db" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>No bookings</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>No reservations for {isToday ? 'today' : formatDate(selectedDate)}</p>
            </div>
          ) : (
            <div>
              {bookingsForDate.map((booking, i) => {
                const bStatus = booking.status || 'confirmed';
                const bColors = {
                  confirmed: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e', label: 'Confirmed' },
                  arrived: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6', label: 'Arrived' },
                  completed: { bg: '#f8fafc', text: '#475569', dot: '#64748b', label: 'Completed' },
                  cancelled: { bg: '#f1f5f9', text: '#64748b', dot: '#9ca3af', label: 'Cancelled' },
                  'no-show': { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444', label: 'No Show' },
                };
                const bc = bColors[bStatus] || bColors.confirmed;
                const tableName = booking.tableId ? (allTables.find(t => t.id === booking.tableId)?.name || '?') : null;
                return (
                  <div key={booking.id || i} style={{
                    padding: '16px 20px', borderBottom: i < bookingsForDate.length - 1 ? '1px solid #f8fafc' : 'none',
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                  }}>
                    {/* Time column */}
                    <div style={{ minWidth: '56px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                        {booking.bookingTime || '—'}
                      </div>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: bc.dot, margin: '6px auto 0', boxShadow: `0 0 0 3px ${bc.dot}20` }} />
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{booking.customerName || 'Guest'}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '8px', backgroundColor: bc.bg, color: bc.text }}>{bc.label}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#6b7280' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUsers size={10} /> {booking.partySize || '?'} guest{(booking.partySize || 0) !== 1 ? 's' : ''}
                        </span>
                        {tableName && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaChair size={10} /> Table {tableName}
                          </span>
                        )}
                        {booking.customerPhone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaPhoneAlt size={9} /> {booking.customerPhone}
                          </span>
                        )}
                      </div>
                      {booking.notes && (
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>
                          {booking.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {bStatus === 'confirmed' && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => updateBookingStatus(booking.id, 'arrived')} title="Check in" style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1fae5', backgroundColor: '#f0fdf4',
                          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#059669',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <FaCheck size={9} /> Check in
                        </button>
                        <button onClick={() => cancelBooking(booking.id)} title="Cancel" style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                        }}>
                          <FaTimes size={10} />
                        </button>
                      </div>
                    )}
                    {bStatus === 'arrived' && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => updateBookingStatus(booking.id, 'completed')} title="Complete" style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white',
                          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#475569',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <FaCheck size={9} /> Done
                        </button>
                        <button onClick={() => updateBookingStatus(booking.id, 'no-show')} title="No show" style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                        }}>
                          <FaBan size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── DELETE FLOOR CONFIRMATION MODAL ─── */}
      {deleteFloorConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '28px', borderRadius: '16px',
            maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <FaTrash size={22} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                Delete Floor
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                Delete <strong>{deleteFloorConfirm.name}</strong> and all its tables? This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteFloorConfirm(null)}
                disabled={deletingFloor}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '2px solid #e5e7eb', backgroundColor: 'white',
                  color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFloor(deleteFloorConfirm.id)}
                disabled={deletingFloor}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#ef4444',
                  color: 'white', fontWeight: '600', fontSize: '14px',
                  cursor: deletingFloor ? 'not-allowed' : 'pointer',
                  opacity: deletingFloor ? 0.7 : 1
                }}
              >
                {deletingFloor ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
      {showBookingForm && (() => {
        // Build booking conflict map for the selected date+time
        const bookingConflicts = {};
        bookingsForDate.forEach(b => {
          if (b.tableId && b.bookingTime === bookingData.bookingTime && b.status !== 'cancelled' && b.status !== 'no-show') {
            if (!bookingConflicts[b.tableId]) bookingConflicts[b.tableId] = [];
            bookingConflicts[b.tableId].push(b);
          }
        });
        // Also get all bookings for the date (any time) per table
        const dayBookingsPerTable = {};
        bookingsForDate.forEach(b => {
          if (b.tableId && b.status !== 'cancelled' && b.status !== 'no-show') {
            if (!dayBookingsPerTable[b.tableId]) dayBookingsPerTable[b.tableId] = [];
            dayBookingsPerTable[b.tableId].push(b);
          }
        });
        const hasTimeConflict = selectedTable && bookingConflicts[selectedTable.id]?.length > 0;

        return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowBookingForm(false); setBookingStep(1); }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>

            {/* Colorful header */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '20px 24px 16px', color: 'white', position: 'relative',
            }}>
              <button onClick={() => { setShowBookingForm(false); setBookingStep(1); }} style={{
                position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%',
                border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><FaTimes size={12} color="white" /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaCalendarAlt size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Reserve a Table</h3>
                  <p style={{ fontSize: '12px', opacity: 0.8, margin: '2px 0 0' }}>
                    {bookingData.bookingDate && bookingData.bookingTime
                      ? `${formatDate(bookingData.bookingDate)} at ${bookingData.bookingTime}`
                      : 'Choose your preferred time'}
                  </p>
                </div>
              </div>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[
                  { n: 1, label: 'When', icon: FaClock },
                  { n: 2, label: 'Who', icon: FaUser },
                  { n: 3, label: 'Where', icon: FaChair },
                ].map(({ n, label, icon: Icon }) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: n < 3 ? 1 : 'none' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '700',
                      backgroundColor: bookingStep > n ? 'rgba(34,197,94,0.9)' : bookingStep === n ? 'white' : 'rgba(255,255,255,0.2)',
                      color: bookingStep === n ? '#ef4444' : 'white',
                    }}>{bookingStep > n ? <FaCheck size={9} /> : <Icon size={9} />}</div>
                    <span style={{ fontSize: '11px', fontWeight: 600, opacity: bookingStep === n ? 1 : 0.6 }}>{label}</span>
                    {n < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: bookingStep > n ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
              {bookingStep === 1 && (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaCalendarAlt size={11} color="#ef4444" /> Pick a Date
                  </label>
                  <input type="date" value={bookingData.bookingDate} onChange={e => setBookingData(p => ({ ...p, bookingDate: e.target.value }))} style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '20px', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaClock size={11} color="#ef4444" /> Choose Time
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '2px' }}>
                    {(availableTimeSlots.length > 0 ? availableTimeSlots : generateTimeSlots()).map(slot => {
                      const isActive = bookingData.bookingTime === slot.value;
                      return (
                        <button key={slot.value} onClick={() => { setBookingData(p => ({ ...p, bookingTime: slot.value })); setSelectedTimeSlot(slot.value); }} style={{
                          padding: '10px 4px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'center',
                          border: isActive ? '2px solid #ef4444' : '1.5px solid #e8ecf0',
                          backgroundColor: isActive ? '#ef4444' : 'white',
                          color: isActive ? 'white' : '#374151',
                          transition: 'all 0.15s',
                          boxShadow: isActive ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
                        }}>{slot.display}</button>
                      );
                    })}
                  </div>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUser size={11} color="#ef4444" /> Guest Name *
                  </label>
                  <input value={bookingData.customerName} onChange={e => setBookingData(p => ({ ...p, customerName: e.target.value }))} placeholder="e.g. Rahul Sharma" style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPhoneAlt size={10} color="#ef4444" /> Phone
                  </label>
                  <input value={bookingData.customerPhone} onChange={e => setBookingData(p => ({ ...p, customerPhone: e.target.value }))} placeholder="+91 98765 43210" style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUsers size={11} color="#ef4444" /> Party Size
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                      const isActive = bookingData.partySize === n;
                      return (
                        <button key={n} onClick={() => setBookingData(p => ({ ...p, partySize: n }))} style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          border: isActive ? '2px solid #ef4444' : '1.5px solid #e8ecf0',
                          backgroundColor: isActive ? '#ef4444' : 'white',
                          color: isActive ? 'white' : '#374151',
                          fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                          boxShadow: isActive ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
                          transition: 'all 0.15s',
                        }}>{n}</button>
                      );
                    })}
                  </div>

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Special Requests</label>
                  <textarea value={bookingData.notes} onChange={e => setBookingData(p => ({ ...p, notes: e.target.value }))} placeholder="Birthday, high chair, window seat..." rows={2} style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '14px',
                    backgroundColor: '#fafbfc', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FaChair size={13} color="#ef4444" />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Pick a Table</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      for {formatDate(bookingData.bookingDate)} at {bookingData.bookingTime}
                    </span>
                  </div>

                  {/* Conflict warning banner */}
                  {hasTimeConflict && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px',
                      backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a',
                    }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FaClock size={12} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>Time conflict on Table {selectedTable?.name}</div>
                        <div style={{ fontSize: '11px', color: '#a16207' }}>
                          {bookingConflicts[selectedTable.id].length} booking{bookingConflicts[selectedTable.id].length > 1 ? 's' : ''} at same time — double-booking will be created
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {allTables.map(table => {
                      const isSelected = selectedTable?.id === table.id;
                      const tblConflicts = bookingConflicts[table.id] || [];
                      const tblDayBookings = dayBookingsPerTable[table.id] || [];
                      const hasConflict = tblConflicts.length > 0;
                      const hasDayBookings = tblDayBookings.length > 0;
                      const cardBg = isSelected ? '#fef2f2' : hasConflict ? '#fffbeb' : hasDayBookings ? '#eff6ff' : '#f0fdf4';
                      const cardBorder = isSelected ? '#ef4444' : hasConflict ? '#fbbf24' : hasDayBookings ? '#93c5fd' : '#86efac';
                      const nameColor = isSelected ? '#dc2626' : '#1f2937';

                      return (
                        <button key={table.id} onClick={() => setSelectedTable(table)} style={{
                          padding: '14px 8px 12px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                          border: `2px solid ${cardBorder}`,
                          backgroundColor: cardBg,
                          transition: 'all 0.15s', position: 'relative',
                          boxShadow: isSelected ? '0 4px 16px rgba(239,68,68,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        }}>
                          {/* Booking count badge */}
                          {hasDayBookings && (
                            <div style={{
                              position: 'absolute', top: '-7px', right: '-7px',
                              minWidth: '22px', height: '22px', borderRadius: '11px', padding: '0 5px',
                              backgroundColor: hasConflict ? '#f59e0b' : '#3b82f6',
                              color: 'white', fontSize: '10px', fontWeight: 800,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '2.5px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            }}>
                              {tblDayBookings.length}
                            </div>
                          )}
                          {/* Selected checkmark */}
                          {isSelected && (
                            <div style={{
                              position: 'absolute', top: '-7px', left: '-7px',
                              width: '22px', height: '22px', borderRadius: '50%',
                              backgroundColor: '#ef4444', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '2.5px solid white', boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                            }}>
                              <FaCheck size={9} />
                            </div>
                          )}
                          <div style={{ fontSize: '20px', fontWeight: '800', color: nameColor, lineHeight: 1 }}>{table.name}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <FaChair size={9} /> {table.capacity} seats
                          </div>
                          {hasConflict && (
                            <div style={{ fontSize: '9px', color: '#d97706', fontWeight: 700, marginTop: '5px', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '6px', display: 'inline-block' }}>
                              {tblConflicts.length} same time
                            </div>
                          )}
                          {!hasConflict && hasDayBookings && (
                            <div style={{ fontSize: '9px', color: '#2563eb', fontWeight: 600, marginTop: '5px', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '6px', display: 'inline-block' }}>
                              {tblDayBookings.length} booked
                            </div>
                          )}
                          {!hasDayBookings && !isSelected && (
                            <div style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600, marginTop: '5px' }}>
                              Free
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '14px', marginTop: '16px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '11px', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#fef2f2', border: '1.5px solid #ef4444' }} /> Selected
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }} /> Free
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd' }} /> Booked
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#fffbeb', border: '1.5px solid #fbbf24' }} /> Time conflict
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafbfc' }}>
              {bookingStep > 1 ? (
                <button onClick={() => setBookingStep(s => s - 1)} style={{
                  padding: '11px 22px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: 'white',
                  fontSize: '14px', fontWeight: '600', color: '#6b7280', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <FaChevronLeft size={10} /> Back
                </button>
              ) : <div />}
              {bookingStep < 3 ? (
                <button onClick={() => setBookingStep(s => s + 1)} disabled={bookingStep === 1 && (!bookingData.bookingDate || !bookingData.bookingTime)} style={{
                  padding: '11px 28px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  background: (bookingStep === 1 && bookingData.bookingDate && bookingData.bookingTime) || bookingStep === 2
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e2e8f0',
                  color: (bookingStep === 1 && bookingData.bookingDate && bookingData.bookingTime) || bookingStep === 2 ? 'white' : '#9ca3af',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: (bookingStep === 1 && bookingData.bookingDate && bookingData.bookingTime) || bookingStep === 2
                    ? '0 4px 12px rgba(239,68,68,0.3)' : 'none',
                }}>
                  Next <FaChevronRight size={10} />
                </button>
              ) : (
                <button onClick={createBooking} disabled={!selectedTable || !bookingData.customerName.trim() || bookingSubmitting} style={{
                  padding: '11px 28px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: bookingSubmitting ? 'wait' : 'pointer',
                  background: selectedTable && bookingData.customerName.trim()
                    ? (hasTimeConflict ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #22c55e, #16a34a)')
                    : '#e2e8f0',
                  color: selectedTable && bookingData.customerName.trim() ? 'white' : '#9ca3af',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: selectedTable && bookingData.customerName.trim()
                    ? (hasTimeConflict ? '0 4px 12px rgba(245,158,11,0.3)' : '0 4px 12px rgba(34,197,94,0.3)') : 'none',
                  opacity: bookingSubmitting ? 0.7 : 1,
                }}>
                  {bookingSubmitting ? (
                    <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Reserving...</>
                  ) : (
                    <><FaCheck size={11} /> {hasTimeConflict ? 'Book Anyway' : 'Confirm Booking'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      <NotificationContainer />
    </div>
  );
};

export default TableManagement;
