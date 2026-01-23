'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../../../contexts/LoadingContext';
import apiClient from '../../../lib/api';
import { useNotification } from '../../../components/Notification.js';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedTablesData, setCachedTablesData } from '../../../utils/dashboardCache';
import { 
  FaPlus, 
  FaTrash,
  FaCog,
  FaUsers,
  FaClock,
  FaUtensils,
  FaCheck,
  FaBan,
  FaChair,
  FaHome,
  FaEdit,
  FaEllipsisV,
  FaCalendarAlt,
  FaTools,
  FaTimes,
  FaPhoneAlt,
  FaUser,
  FaChevronDown,
  FaEye
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

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dottedBorder {
        0% { border-style: dashed; }
        50% { border-style: dotted; }
        100% { border-style: dashed; }
      }
      @keyframes clockwiseBorder {
        0% { 
          border-top-color: #f59e0b;
          border-right-color: transparent;
          border-bottom-color: transparent;
          border-left-color: transparent;
        }
        25% { 
          border-top-color: #f59e0b;
          border-right-color: #f59e0b;
          border-bottom-color: transparent;
          border-left-color: transparent;
        }
        50% { 
          border-top-color: #f59e0b;
          border-right-color: #f59e0b;
          border-bottom-color: #f59e0b;
          border-left-color: transparent;
        }
        75% { 
          border-top-color: #f59e0b;
          border-right-color: #f59e0b;
          border-bottom-color: #f59e0b;
          border-left-color: #f59e0b;
        }
        100% { 
          border-top-color: transparent;
          border-right-color: #f59e0b;
          border-bottom-color: #f59e0b;
          border-left-color: #f59e0b;
        }
      }
      .dotted-border-animation {
        animation: dottedBorder 2s infinite;
      }
      .clockwise-border-animation {
        animation: clockwiseBorder 2s linear infinite;
        border: 2px dashed transparent;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [floors, setFloors] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showEditFloor, setShowEditFloor] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookingFromHeader, setBookingFromHeader] = useState(false);
  const [selectedFloorForTable, setSelectedFloorForTable] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [showNewFloorForm, setShowNewFloorForm] = useState(false);
  const [showBulkAddTable, setShowBulkAddTable] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' or 'bulk'

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form states
  const [newFloor, setNewFloor] = useState({ name: '', description: '' });
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    type: 'regular',
    floorId: null
  });
  const [bulkTableData, setBulkTableData] = useState({
    fromNumber: '',
    toNumber: '',
    capacity: 4,
    floorId: null
  });
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerPhone: '',
    partySize: 1,
    bookingDate: '',
    bookingTime: '',
    mealType: 'lunch',
    notes: ''
  });
  
  // Time slots state
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // Dynamic booking data state
  const [availableTablesForDate, setAvailableTablesForDate] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityStats, setAvailabilityStats] = useState({
    totalTables: 0,
    availableTables: 0,
    reservedTables: 0
  });

  // Date-based table status state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableStatusesForDate, setTableStatusesForDate] = useState({});
  const [loadingTableStatuses, setLoadingTableStatuses] = useState(false);

  const scrollContainerRef = useRef(null);

  // Generate time slots (10 AM to 11 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 10; // 10 AM
    const endHour = 23; // 11 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        const timeString = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          value: time.toTimeString().slice(0, 5), // HH:MM format
          display: timeString,
          available: Math.random() > 0.3 // Mock availability (70% available)
        });
      }
    }
    
    return slots;
  };

  // Fetch availability data for selected date
  const fetchAvailabilityForDate = async (date) => {
    if (!selectedRestaurant?.id || !date) return;
    
    try {
      setLoadingAvailability(true);
      
      // Call the actual API
      const response = await apiClient.request(`/api/bookings/availability/${selectedRestaurant.id}?date=${date}`, {
        method: 'GET'
      });
      
      if (response.success) {
        setAvailableTablesForDate(response.availableTables || []);
        setAvailableTimeSlots(response.timeSlots || generateTimeSlots());
        setAvailabilityStats(response.stats || {
          totalTables: floors.flatMap(floor => floor.tables || []).length,
          availableTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status === 'available').length,
          reservedTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status !== 'available' && table.status !== 'out-of-service').length
        });
      } else {
        // Fallback to mock data
        setAvailableTablesForDate(floors.flatMap(floor => floor.tables || []));
        setAvailableTimeSlots(generateTimeSlots());
        setAvailabilityStats({
          totalTables: floors.flatMap(floor => floor.tables || []).length,
          availableTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status === 'available').length,
          reservedTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status !== 'available' && table.status !== 'out-of-service').length
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Fallback to mock data
      setAvailableTablesForDate(floors.flatMap(floor => floor.tables || []));
      setAvailableTimeSlots(generateTimeSlots());
      setAvailabilityStats({
        totalTables: floors.flatMap(floor => floor.tables || []).length,
        availableTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status === 'available').length,
        reservedTables: floors.flatMap(floor => floor.tables || []).filter(table => table.status !== 'available' && table.status !== 'out-of-service').length
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Update time slots when booking modal opens
  useEffect(() => {
    if (showBookingForm) {
      const today = new Date().toISOString().split('T')[0];
      setBookingData(prev => ({ ...prev, bookingDate: today }));
      fetchAvailabilityForDate(today);
    }
  }, [showBookingForm]);

  // Fetch availability when date changes
  useEffect(() => {
    if (showBookingForm && bookingData.bookingDate) {
      fetchAvailabilityForDate(bookingData.bookingDate);
    }
  }, [bookingData.bookingDate]);

  // Fetch table statuses for selected date
  const fetchTableStatusesForDate = async (date) => {
    if (!selectedRestaurant?.id || !date) return;
    
    try {
      setLoadingTableStatuses(true);
      
      // Call the availability API to get table statuses for the date
      const response = await apiClient.request(`/api/bookings/availability/${selectedRestaurant.id}?date=${date}`, {
        method: 'GET'
      });
      
      if (response.success) {
        // Create a map of table statuses for the selected date
        const statusMap = {};
        response.availableTables?.forEach(table => {
          statusMap[table.id] = 'available';
        });
        
        // Get all tables and their current statuses
        floors.forEach(floor => {
          floor.tables?.forEach(table => {
            if (!statusMap[table.id]) {
              // If not in available tables, check if it's booked/reserved
              statusMap[table.id] = table.status;
            }
          });
        });
        
        setTableStatusesForDate(statusMap);
      }
    } catch (error) {
      console.error('Error fetching table statuses for date:', error);
      // Fallback to current table statuses
      const statusMap = {};
      floors.forEach(floor => {
        floor.tables?.forEach(table => {
          statusMap[table.id] = table.status;
        });
      });
      setTableStatusesForDate(statusMap);
    } finally {
      setLoadingTableStatuses(false);
    }
  };

  // Fetch table statuses when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTableStatusesForDate(selectedDate);
    }
  }, [selectedDate, selectedRestaurant?.id]);

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileView = width <= 768;
      setIsMobile(isMobileView);
    };
    
    // Check immediately and also with a delay for hydration
    checkMobile();
    const timeoutId = setTimeout(checkMobile, 100);
    
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load data on component mount - use cache for instant load
  useEffect(() => {
    loadInitialData(true); // Use cache
  }, []);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedRestaurant?.id) {
        console.log('🔄 Tables page visible, refreshing data...');
        loadFloorsAndTables(selectedRestaurant.id, true); // Force refresh
      }
    };

    const handleFocus = () => {
      if (selectedRestaurant?.id) {
        console.log('🔄 Tables page focused, refreshing data...');
        loadFloorsAndTables(selectedRestaurant.id, true); // Force refresh
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedRestaurant?.id]);

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('🏪 Tables page: Restaurant changed, reloading data', event.detail);
      loadInitialData(); // Reload all data with new restaurant
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  const loadInitialData = useCallback(async (useCache = true) => {
    try {
      // Only show full loading if no cache
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const restaurantId = user?.restaurantId || localStorage.getItem('selectedRestaurantId');
      
      // Check for cached data first
      if (useCache && restaurantId) {
        const cachedData = getCachedTablesData(restaurantId);
        if (cachedData) {
          console.log('⚡ Loading cached tables data instantly...');
          if (cachedData.floors) setFloors(cachedData.floors);
          if (cachedData.selectedRestaurant) setSelectedRestaurant(cachedData.selectedRestaurant);
          setLoading(false);
          
          // Show background loading
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('tablesBackgroundLoading', { detail: { loading: true } }));
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
      
      setError('');
      
      // Load restaurants
      const restaurantsResponse = await apiClient.getRestaurants();
      const restaurants = restaurantsResponse.restaurants || [];
      
      let restaurant = null;
      
      // Determine selected restaurant
      if (user?.restaurantId) {
        restaurant = restaurants.find(r => r.id === user.restaurantId);
      } else if (restaurants.length > 0) {
        const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
        restaurant = restaurants.find(r => r.id === savedRestaurantId) || restaurants[0];
      }
      
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        
        // If we have cached data, fetch in background; otherwise fetch normally
        if (useCache && getCachedTablesData(restaurant.id)) {
          // Fetch fresh data in background
          loadFloorsAndTables(restaurant.id, false).then(() => {
            setBackgroundLoading(false);
            window.dispatchEvent(new CustomEvent('tablesBackgroundLoading', { detail: { loading: false } }));
          });
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
      // Clear cache if force refresh
      if (forceRefresh) {
        localStorage.removeItem(`floors_${restaurantId}`);
        console.log('🗑️ Cleared floors cache for fresh data');
      }
      
      // Try to get floors first
      const floorsResponse = await apiClient.getFloors(restaurantId);
      let floorsData = [];
      
      if (floorsResponse.floors && floorsResponse.floors.length > 0) {
        floorsData = floorsResponse.floors;
        setFloors(floorsData);
      } else {
        // If no floors, get tables and create a default floor structure
        const tablesResponse = await apiClient.getTables(restaurantId);
        const tables = tablesResponse.tables || [];
        
        // Create default floor with all tables
        const defaultFloor = {
          id: 'default',
          name: 'Main Floor',
          description: 'Main dining area',
          tables: tables,
          restaurantId: restaurantId
        };
        floorsData = [defaultFloor];
        setFloors(floorsData);
      }
      
      // Cache the data (get current selectedRestaurant from state)
      const currentRestaurant = selectedRestaurant || (() => {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
        return { id: savedRestaurantId || restaurantId };
      })();
      
      const dataToCache = {
        floors: floorsData,
        selectedRestaurant: currentRestaurant
      };
      setCachedTablesData(restaurantId, dataToCache);
      console.log('✅ Tables data cached');
      
    } catch (err) {
      console.error('Error loading floors and tables:', err);
      setError('Failed to load tables');
    }
  };

  const getTableStatusInfo = (status) => {
    const statusMap = {
      available: { 
        bg: '#f0fdf4', 
        text: '#166534', 
        label: t('tables.statusLabels.available'),
        icon: FaCheck,
        border: '#22c55e',
        pulse: false,
        gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        shadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
      },
      occupied: { 
        bg: '#fefce8', 
        text: '#ca8a04', 
        label: t('tables.statusLabels.occupied'),
        icon: FaUsers,
        border: '#f59e0b',
        pulse: false,
        clockwiseBorder: true,
        gradient: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        shadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
      },
      serving: { 
        bg: '#fefce8', 
        text: '#ca8a04', 
        label: t('tables.statusLabels.serving'),
        icon: FaUtensils,
        border: '#f59e0b',
        pulse: false,
        dottedBorder: true,
        gradient: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        shadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
      },
      reserved: { 
        bg: '#eff6ff', 
        text: '#2563eb', 
        label: t('tables.statusLabels.reserved'),
        icon: FaClock,
        border: '#3b82f6',
        pulse: false,
        gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        shadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
      },
      cleaning: { 
        bg: '#f8fafc', 
        text: '#475569', 
        label: t('tables.statusLabels.cleaning'),
        icon: FaUtensils,
        border: '#64748b',
        pulse: false,
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        shadow: '0 4px 12px rgba(100, 116, 139, 0.2)'
      },
      'out-of-service': { 
        bg: '#fef2f2', 
        text: '#dc2626', 
        label: t('tables.statusLabels.outOfService'),
        icon: FaBan,
        border: '#ef4444',
        pulse: false,
        gradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        shadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
      }
    };
    return statusMap[status] || statusMap.available;
  };

  const getTableTypeInfo = (type) => {
    const typeMap = {
      small: { seats: '2', color: '#e53e3e' },
      regular: { seats: '4', color: '#10b981' },
      large: { seats: '6+', color: '#f59e0b' },
      vip: { seats: 'VIP', color: '#8b5cf6' },
      private: { seats: 'PVT', color: '#ef4444' }
    };
    return typeMap[type] || typeMap.regular;
  };

  // API operations
  const addFloor = async () => {
    if (!newFloor.name.trim() || !selectedRestaurant) return;
    
    try {
      const floorData = {
        name: newFloor.name.trim(),
        description: newFloor.description.trim() || null
      };
      
      const response = await apiClient.createFloor(selectedRestaurant.id, floorData);
      const newFloorData = { ...response.floor, tables: [] };
      
      setFloors(prev => [...prev, newFloorData]);
      setNewFloor({ name: '', description: '' });
      setShowAddFloor(false);
      showSuccess('Floor added successfully!');
      
    } catch (err) {
      console.error('Error adding floor:', err);
      showError(`Failed to add floor: ${err.message}`);
    }
  };

  const editFloor = async () => {
    if (!editingFloor || !newFloor.name.trim() || !selectedRestaurant) return;
    
    try {
      const floorData = {
        name: newFloor.name.trim(),
        description: newFloor.description.trim() || null,
        restaurantId: selectedRestaurant.id
      };
      
      await apiClient.updateFloor(editingFloor.id, floorData);
      
      setFloors(prev => prev.map(floor => 
        floor.id === editingFloor.id 
          ? { ...floor, name: newFloor.name.trim(), description: newFloor.description.trim() || null }
          : floor
      ));
      
      setNewFloor({ name: '', description: '' });
      setEditingFloor(null);
      setShowEditFloor(false);
      showSuccess('Floor updated successfully!');
      
    } catch (err) {
      console.error('Error editing floor:', err);
      showError(`Failed to edit floor: ${err.message}`);
    }
  };

  const deleteFloor = async (floorId) => {
    if (!confirm('Are you sure you want to delete this floor and all its tables?')) return;
    
    try {
      await apiClient.deleteFloor(floorId, { restaurantId: selectedRestaurant.id });
      setFloors(prev => prev.filter(floor => floor.id !== floorId));
      showSuccess('Floor deleted successfully!');
    } catch (err) {
      console.error('Error deleting floor:', err);
      showError(`Failed to delete floor: ${err.message}`);
    }
  };

  const startEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({ name: floor.name, description: floor.description || '' });
    setShowEditFloor(true);
  };

  const addTable = async () => {
    if (!newTable.name.trim() || !selectedFloorForTable || !selectedRestaurant) return;
    
    try {
      // Find the selected floor to get its name
      const selectedFloor = floors.find(floor => floor.id === selectedFloorForTable);
      if (!selectedFloor) {
        showError('Selected floor not found');
        return;
      }

      const tableData = {
        name: newTable.name.trim(),
        capacity: parseInt(newTable.capacity),
        type: newTable.type,
        floor: selectedFloor.name, // Send floor name instead of floorId
        status: 'available'
      };
      
      const response = await apiClient.createTable(selectedRestaurant.id, tableData);
      
      // Update floors state with new table
      setFloors(prev => prev.map(floor => {
        if (floor.id === selectedFloorForTable) {
          return {
            ...floor,
            tables: [...(floor.tables || []), response.table]
          };
        }
        return floor;
      }));
      
      setNewTable({ name: '', capacity: 4, type: 'regular', floorId: null });
      setSelectedFloorForTable(null);
      setShowAddTable(false);
      showSuccess('Table added successfully!');

    } catch (err) {
      console.error('Error adding table:', err);
      showError(`Failed to add table: ${err.message}`);
    }
  };

  const bulkAddTables = async () => {
    if (!bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable || !selectedRestaurant) {
      showError('Please fill in all required fields');
      return;
    }

    const from = parseInt(bulkTableData.fromNumber);
    const to = parseInt(bulkTableData.toNumber);

    if (isNaN(from) || isNaN(to)) {
      showError('From and To must be valid numbers');
      return;
    }

    if (from > to) {
      showError('From number must be less than or equal to To number');
      return;
    }

    if (to - from > 100) {
      showError('Cannot create more than 100 tables at once');
      return;
    }

    try {
      // Find the selected floor to get its name
      const selectedFloor = floors.find(floor => floor.id === selectedFloorForTable);
      if (!selectedFloor) {
        showError('Selected floor not found');
        return;
      }

      const bulkData = {
        floor: selectedFloor.name, // Send floor name instead of floorId
        fromNumber: from,
        toNumber: to,
        capacity: parseInt(bulkTableData.capacity)
      };

      const response = await apiClient.bulkCreateTables(selectedRestaurant.id, bulkData);

      // Update floors state with new tables
      if (response.tables && response.tables.length > 0) {
        setFloors(prev => prev.map(floor => {
          if (floor.id === selectedFloorForTable) {
            return {
              ...floor,
              tables: [...(floor.tables || []), ...response.tables]
            };
          }
          return floor;
        }));
      }

      setBulkTableData({ fromNumber: '', toNumber: '', capacity: 4, floorId: null });
      setSelectedFloorForTable(null);
      setShowBulkAddTable(false);

      let message = `Successfully created ${response.created} tables`;
      if (response.skipped > 0) {
        message += ` (${response.skipped} duplicates skipped)`;
      }
      showSuccess(message);

    } catch (err) {
      console.error('Error bulk adding tables:', err);
      showError(`Failed to bulk add tables: ${err.message}`);
    }
  };

  const updateTableStatus = async (tableId, newStatus, additionalData = {}) => {
    try {
      await apiClient.updateTableStatus(tableId, newStatus, additionalData.orderId, selectedRestaurant?.id);
      
      // Update local state
      setFloors(prev => prev.map(floor => ({
        ...floor,
        tables: (floor.tables || []).map(table => {
          if (table.id === tableId) {
            const updatedTable = { ...table, status: newStatus, ...additionalData };
            if (newStatus === 'available') {
              updatedTable.customerName = null;
              updatedTable.startTime = null;
              updatedTable.reservationTime = null;
            }
            return updatedTable;
          }
          return table;
        })
      })));

      // Also update tableStatusesForDate to reflect changes immediately in UI if overriding
      setTableStatusesForDate(prev => ({
        ...prev,
        [tableId]: newStatus
      }));
      
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating table status:', err);
      showError(`Failed to update table: ${err.message}`);
    }
  };

  const deleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await apiClient.deleteTable(tableId, selectedRestaurant?.id);
      
      setFloors(prev => prev.map(floor => ({
        ...floor,
        tables: (floor.tables || []).filter(t => t.id !== tableId)
      })));
      
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error deleting table:', err);
      showError(`Failed to delete table: ${err.message}`);
    }
  };

  const createBooking = async () => {
    if (!selectedTable || !bookingData.customerName.trim() || !selectedRestaurant) return;
    
    try {
      const booking = {
        tableId: selectedTable.id,
        customerName: bookingData.customerName.trim(),
        customerPhone: bookingData.customerPhone.trim() || null,
        partySize: parseInt(bookingData.partySize),
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        notes: bookingData.notes.trim() || null,
        status: 'confirmed'
      };
      
      await apiClient.createBooking(selectedRestaurant.id, booking);
      
      // Update table status to reserved
      await updateTableStatus(selectedTable.id, 'reserved', {
        customerName: bookingData.customerName,
        reservationTime: bookingData.bookingTime
      });
      
      // Reset form
      setBookingData({
        customerName: '',
        customerPhone: '',
        partySize: 2,
        bookingDate: '',
        bookingTime: '',
        notes: ''
      });
      setShowBookingForm(false);
      setSelectedTable(null);
      setBookingFromHeader(false);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      showError(`Failed to create booking: ${err.message}`);
    }
  };

  // Handle table actions
  const handleTableAction = (action, table) => {
    setSelectedTable(table);
    setActiveDropdown(null);
    
    switch (action) {
      case 'take-order':
        // Redirect to dashboard with table info
        const floor = floors.find(f => (f.tables || []).some(t => t.id === table.id));
        router.push(`/dashboard?tableId=${table.id}&tableNo=${encodeURIComponent(table.name)}&floorId=${floor?.id}`);
        break;
        
      case 'book-table':
        // Set default date and time
        const now = new Date();
        setBookingData(prev => ({
          ...prev,
          bookingDate: now.toISOString().split('T')[0],
          partySize: Math.min(table.capacity, prev.partySize),
          mealType: 'lunch'
        }));
        setBookingFromHeader(false);
        setShowBookingForm(true);
        break;
        
      case 'out-of-service':
        updateTableStatus(table.id, 'out-of-service');
        break;
        
      case 'cleaning':
        updateTableStatus(table.id, 'cleaning');
        break;
        
      case 'make-available':
        updateTableStatus(table.id, 'available');
        break;
        
      case 'view-order':
        // Redirect to dashboard with table's current order ID for editing
        if (table.currentOrderId) {
          router.push(`/dashboard?orderId=${table.currentOrderId}&mode=edit`);
        } else {
          showWarning('No active order found for this table');
        }
        break;
        
      default:
        break;
    }
  };

  const scrollToFloor = (floorId) => {
    const element = document.getElementById(`floor-${floorId}`);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.table-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  if (loading) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#fef7f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '4px solid #fed7aa',
              borderTop: '4px solid #f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: '600' }}>Loading table management...</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Setting up your restaurant layout</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        background: 'linear-gradient(135deg, rgb(255 246 241) 0%, rgb(254 245 242) 50%, rgb(255 244 243) 100%)',
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />
        
        <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '500px', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              animation: 'bounce 2s infinite'
            }}>
              <FaChair size={40} style={{ color: '#ef4444' }} />
            </div>
            
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Table Management Ready! 🪑
            </h1>
            
            <p style={{ 
              fontSize: '18px', 
              color: '#374151', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Organize Your Restaurant Layout
            </p>
            <p style={{ 
              fontSize: '16px', 
              color: '#6b7280', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Set up floors and tables to manage your restaurant seating efficiently. Create different sections and track table availability in real-time.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                }}
              >
                Set Up Restaurant First
              </button>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className={`page-transition ${isLoading ? 'loading' : ''}`}
      style={{ 
        height: '100vh', 
        backgroundColor: '#f8fafc', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Modern Header */}
        <div style={{
          backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: isMobile ? '12px 16px' : '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Row 1: Title + Date Picker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Title Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}>
              <FaChair color="white" size={isMobile ? 16 : 18} />
            </div>
            <div>
              <h1 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0
              }}>
                {t('tables.title')}
              </h1>
              <p style={{
                fontSize: isMobile ? '11px' : '12px',
                color: '#64748b',
                margin: '2px 0 0 0',
                fontWeight: '500'
              }}>
                {selectedRestaurant?.name}
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <FaCalendarAlt size={14} color="#64748b" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '13px',
                color: '#1f2937',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            {loadingTableStatuses && (
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid #f59e0b',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </div>
        </div>

        {/* Row 2: Status Legend + Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Compact Status Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              Status:
            </span>
            {Object.entries({
              available: getTableStatusInfo('available'),
              occupied: getTableStatusInfo('occupied'),
              reserved: getTableStatusInfo('reserved'),
              cleaning: getTableStatusInfo('cleaning'),
              'out-of-service': getTableStatusInfo('out-of-service')
            }).map(([status, info]) => (
              <div key={status} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 6px',
                backgroundColor: info.bg,
                borderRadius: '4px',
                border: `1px solid ${info.border}`
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: info.border
                }} />
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: info.text
                }}>
                  {info.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
          }}>
            {/* Book Table Button */}
            <button
              onClick={() => {
                setBookingFromHeader(true);
                setSelectedTable(null);
                setShowBookingForm(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
            >
              <FaCalendarAlt size={12} />
              Book
            </button>

            {/* Add Table Button */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }}
            >
              <FaPlus size={12} />
              Add
            </button>
          </div>
        </div>

        {/* Compact Floor Navigation */}
          <div style={{
            display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#f1f5f9',
          padding: '6px 8px',
            borderRadius: '8px',
          overflowX: 'auto',
          marginTop: '10px'
        }}>
                <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            whiteSpace: 'nowrap',
            marginRight: '4px'
          }}>
            {t('tables.floors')}:
                </div>
                {floors.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => scrollToFloor(floor.id)}
                    style={{
                padding: '6px 10px',
                borderRadius: '6px',
                      fontWeight: '600',
                fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                backgroundColor: 'white',
                color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#475569';
                    }}
                  >
              <FaHome size={10} />
                    {floor.name}
                    <span style={{
                backgroundColor: '#e2e8f0',
                color: '#475569',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {(floor.tables || []).length}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setShowAddFloor(true)}
                  style={{
              padding: '6px 10px',
              borderRadius: '6px',
                    fontWeight: '600',
              fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
              backgroundColor: 'transparent',
              color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <FaPlus size={10} />
                  {t('tables.addFloor')}
                </button>
              </div>
            </div>
            

        {/* Scrollable Floor Content */}
        <div 
          ref={scrollContainerRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
          backgroundColor: '#f8fafc',
          padding: isMobile ? '20px 16px' : '32px 24px'
          }}
        >
          {floors.map((floor) => (
          <div key={floor.id} id={`floor-${floor.id}`} style={{ marginBottom: isMobile ? '32px' : '48px', position: 'relative' }}>
            {/* Floor Info Badge - Top Left */}
                <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              zIndex: 10,
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
              gap: isMobile ? '6px' : '8px'
                }}>
              {/* Floor Icon & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                  width: isMobile ? '16px' : '18px',
                  height: isMobile ? '16px' : '18px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(99, 102, 241, 0.3)'
                }}>
                  <FaHome color="white" size={isMobile ? 6 : 8} />
                </div>
                <span style={{
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {floor.name}
                </span>
              </div>

              {/* Stats */}
                    <div style={{
                display: 'flex',
                gap: isMobile ? '4px' : '6px',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: isMobile ? '10px' : '11px',
                      fontWeight: 'bold',
                  color: '#1e293b',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  {(floor.tables || []).length}T
                </div>
                <div style={{
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: 'bold',
                  color: '#22c55e',
                  backgroundColor: '#f0fdf4',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  {(floor.tables || []).filter(t => t.status === 'available').length}F
                </div>
                <div style={{
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  {(floor.tables || []).filter(t => t.status === 'occupied').length}B
                </div>
                    </div>
                    
              {/* Actions */}
              <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
                      <button
                        onClick={() => startEditFloor(floor)}
                        style={{
                    padding: '2px 4px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                        }}
                      >
                  <FaEdit size={isMobile ? 6 : 8} color="#64748b" />
                      </button>
                      
                      <button
                        onClick={() => deleteFloor(floor.id)}
                        style={{
                    padding: '2px 4px',
                          backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                        }}
                      >
                  <FaTrash size={isMobile ? 6 : 8} color="#dc2626" />
                      </button>
                  </div>
                </div>

                {/* Tables Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile 
                ? 'repeat(auto-fit, minmax(100px, max-content))' 
                : 'repeat(auto-fit, minmax(120px, max-content))',
              gap: isMobile ? '12px' : '16px',
                  justifyContent: 'center',
                  justifyItems: 'center',
              paddingTop: isMobile ? '40px' : '50px', // Add top padding to avoid overlap with floor badge
              maxWidth: '100%',
              margin: '0 auto'
                }}>
                  {(floor.tables || []).map((table) => {
                    // Use date-based status if available, otherwise fall back to current status
                    const tableStatus = tableStatusesForDate[table.id] || table.status;
                    const statusInfo = getTableStatusInfo(tableStatus);
                    const isDropdownOpen = activeDropdown === table.id;
                    
                    return (
                      <div key={table.id} style={{ position: 'relative' }} className="table-dropdown">
                        {/* Table Card */}
                        <div
                          onClick={() => setActiveDropdown(isDropdownOpen ? null : table.id)}
                          className={`${statusInfo.dottedBorder ? 'dotted-border-animation' : ''} ${statusInfo.clockwiseBorder ? 'clockwise-border-animation' : ''}`}
                          style={{
                        width: isMobile ? '80px' : '100px',
                        height: isMobile ? '80px' : '100px',
                        background: statusInfo.gradient,
                        borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                        flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        border: statusInfo.clockwiseBorder 
                          ? '2px dashed transparent' 
                          : statusInfo.dottedBorder 
                            ? `2px dashed ${statusInfo.border}` 
                            : `2px solid ${statusInfo.border}`,
                        boxShadow: statusInfo.shadow,
                            animation: statusInfo.pulse ? 'pulse 2s infinite' : 'none'
                          }}
                          onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = statusInfo.shadow;
                          }}
                        >
                          {/* Table Number */}
                          <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                            fontWeight: 'bold', 
                        color: statusInfo.text,
                        marginBottom: '2px'
                          }}>
                            {table.name}
                          </div>

                      {/* Table Capacity */}
                      <div style={{
                        fontSize: isMobile ? '9px' : '10px',
                        color: statusInfo.text,
                        fontWeight: '600',
                        opacity: 0.8
                      }}>
                        {table.capacity}
                      </div>

                      {/* Status Icon */}
                          <div style={{
                            position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: isMobile ? '16px' : '18px',
                        height: isMobile ? '16px' : '18px',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <statusInfo.icon size={isMobile ? 8 : 10} color={statusInfo.text} />
                        </div>

                      {/* View Order Icon for occupied tables with active order */}
                      {tableStatus === 'occupied' && table.currentOrderId && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          width: isMobile ? '16px' : '18px',
                          height: isMobile ? '16px' : '18px',
                          backgroundColor: 'rgba(59, 130, 246, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableAction('view-order', table);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="View Order Details"
                        >
                          <FaEye size={isMobile ? 8 : 10} color="white" />
                        </div>
                      )}

                      {/* Customer Name */}
                      {table.customerName && (
                        <div style={{ 
                          position: 'absolute',
                          bottom: '2px',
                          left: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontSize: isMobile ? '7px' : '8px',
                          fontWeight: '600',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {table.customerName}
                            </div>
                          )}
                        </div>

                        {/* Action Dropdown */}
                        {isDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                        top: isMobile ? '110px' : '130px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                        border: '1px solid #e2e8f0',
                            zIndex: 20,
                        minWidth: isMobile ? '180px' : '160px',
                            overflow: 'hidden'
                          }}>
                            {tableStatus === 'available' && (
                              <>
                                <button
                                  onClick={() => handleTableAction('take-order', table)}
                                  style={{
                                    width: '100%',
                                padding: isMobile ? '16px 20px' : '12px 16px',
                                    border: 'none',
                                    backgroundColor: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                gap: isMobile ? '12px' : '10px',
                                color: '#059669',
                                transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                              <FaUtensils size={isMobile ? 16 : 14} />
                                  {t('tables.takeOrder')}
                                </button>
                                <button
                                  onClick={() => handleTableAction('book-table', table)}
                                  style={{
                                    width: '100%',
                                padding: isMobile ? '16px 20px' : '12px 16px',
                                    border: 'none',
                                    backgroundColor: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                gap: isMobile ? '12px' : '10px',
                                color: '#d97706',
                                transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fefbf0'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                              <FaCalendarAlt size={isMobile ? 16 : 14} />
                                  {t('tables.bookTable')}
                                </button>
                              </>
                            )}
                            
                            {/* View Order button for occupied tables */}
                            {tableStatus === 'occupied' && table.currentOrderId && (
                              <button
                                onClick={() => handleTableAction('view-order', table)}
                                style={{
                                  width: '100%',
                                  padding: isMobile ? '16px 20px' : '12px 16px',
                                  border: 'none',
                                  backgroundColor: 'white',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: isMobile ? '14px' : '13px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: isMobile ? '12px' : '10px',
                                  color: '#3b82f6',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <FaEye size={isMobile ? 16 : 14} />
                                {t('tables.viewOrder')}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleTableAction('out-of-service', table)}
                              style={{
                                width: '100%',
                            padding: isMobile ? '16px 20px' : '12px 16px',
                                border: 'none',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                            gap: isMobile ? '12px' : '10px',
                            color: '#7c3aed',
                            transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f3ff'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                          <FaTools size={isMobile ? 16 : 14} />
                              {t('tables.outOfService')}
                            </button>
                            
                            <button
                              onClick={() => handleTableAction('cleaning', table)}
                              style={{
                                width: '100%',
                            padding: isMobile ? '16px 20px' : '12px 16px',
                                border: 'none',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                            gap: isMobile ? '12px' : '10px',
                            color: '#4b5563',
                            transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                          <FaUtensils size={isMobile ? 16 : 14} />
                              {t('tables.cleaning')}
                            </button>
                            
                            {tableStatus !== 'available' && (
                              <button
                                onClick={() => handleTableAction('make-available', table)}
                                style={{
                                  width: '100%',
                              padding: isMobile ? '16px 20px' : '12px 16px',
                                  border: 'none',
                                  backgroundColor: 'white',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                              fontSize: isMobile ? '14px' : '13px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                              gap: isMobile ? '12px' : '10px',
                              color: '#059669',
                              transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                          <FaCheck size={isMobile ? 16 : 14} />
                              {t('tables.makeAvailable')}
                            </button>
                            )}
                            
                        <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            
                            <button
                              onClick={() => deleteTable(table.id)}
                              style={{
                                width: '100%',
                            padding: isMobile ? '16px 20px' : '12px 16px',
                                border: 'none',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                            gap: isMobile ? '12px' : '10px',
                            color: '#dc2626',
                            transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                          <FaTrash size={isMobile ? 16 : 14} />
                              {t('tables.deleteTable')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* Unified Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '500px',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Add Table or Floor</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 12px 0' }}>Choose what you want to add</p>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setAddMode('single')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: addMode === 'single' ? 'white' : 'transparent',
                    color: addMode === 'single' ? '#dc2626' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: addMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Single Table
                </button>
                <button
                  onClick={() => setAddMode('bulk')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: addMode === 'bulk' ? 'white' : 'transparent',
                    color: addMode === 'bulk' ? '#dc2626' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: addMode === 'bulk' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Bulk Add Tables
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Floor Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Select Floor *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={selectedFloorForTable || ''}
                    onChange={(e) => setSelectedFloorForTable(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#fef7f0',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select a floor</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => setShowNewFloorForm(true)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    <FaPlus size={14} color="#6b7280" />
                  </button>
                </div>
              </div>

              {/* New Floor Form */}
              {showNewFloorForm && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>{t('tables.modals.addFloorTitle')}</h3>
                    <button
                      onClick={() => setShowNewFloorForm(false)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      <FaTimes size={12} color="#6b7280" />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      value={newFloor.name}
                      onChange={(e) => setNewFloor({...newFloor, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Floor name (e.g., Ground Floor, Terrace)"
                    />
                    
                    <input
                      type="text"
                      value={newFloor.description}
                      onChange={(e) => setNewFloor({...newFloor, description: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Description (optional)"
                    />
                    
                    <button
                      onClick={async () => {
                        await addFloor();
                        setShowNewFloorForm(false);
                      }}
                      disabled={!newFloor.name.trim()}
                      style={{
                        padding: '8px 12px',
                        background: newFloor.name.trim() 
                          ? 'linear-gradient(135deg, #e53e3e, #dc2626)'
                          : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: newFloor.name.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      Create Floor
                    </button>
                  </div>
                </div>
              )}

              {/* Conditional Form Based on Mode */}
              {addMode === 'single' ? (
                <>
                  {/* Table Details - Single */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Table Name *
                      </label>
                      <input
                        type="text"
                        value={newTable.name}
                        onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: '#fef7f0',
                          boxSizing: 'border-box'
                        }}
                        placeholder="e.g., T1, V1"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Capacity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newTable.capacity}
                        onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: '#fef7f0',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Table Type
                    </label>
                    <select
                      value={newTable.type}
                      onChange={(e) => setNewTable({...newTable, type: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#fef7f0',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="small">Small (1-2 seats)</option>
                      <option value="regular">Regular (3-4 seats)</option>
                      <option value="large">Large (5-8 seats)</option>
                      <option value="vip">VIP</option>
                      <option value="private">Private Room</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Bulk Add Form */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef9f5',
                    borderRadius: '8px',
                    border: '2px dashed #f97316'
                  }}>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', textAlign: 'center' }}>
                      Create multiple tables with sequential numbering
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                          From Number *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bulkTableData.fromNumber}
                          onChange={(e) => setBulkTableData({...bulkTableData, fromNumber: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxSizing: 'border-box'
                          }}
                          placeholder="e.g., 1"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                          To Number *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bulkTableData.toNumber}
                          onChange={(e) => setBulkTableData({...bulkTableData, toNumber: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxSizing: 'border-box'
                          }}
                          placeholder="e.g., 10"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Capacity (per table) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={bulkTableData.capacity}
                        onChange={(e) => setBulkTableData({...bulkTableData, capacity: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {bulkTableData.fromNumber && bulkTableData.toNumber && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#166534',
                        textAlign: 'center'
                      }}>
                        Will create {parseInt(bulkTableData.toNumber) - parseInt(bulkTableData.fromNumber) + 1} tables
                        ({bulkTableData.fromNumber} - {bulkTableData.toNumber})
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fef7f0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFloorForTable(null);
                  setNewTable({ name: '', capacity: 4, type: 'regular', floorId: null });
                  setBulkTableData({ fromNumber: '', toNumber: '', capacity: 4, floorId: null });
                  setNewFloor({ name: '', description: '' });
                  setShowNewFloorForm(false);
                  setAddMode('single');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (addMode === 'single') {
                    await addTable();
                  } else {
                    await bulkAddTables();
                  }
                  setShowAddModal(false);
                  setAddMode('single');
                }}
                disabled={
                  addMode === 'single'
                    ? (!newTable.name.trim() || !selectedFloorForTable)
                    : (!bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable)
                }
                style={{
                  flex: 1,
                  background: (
                    addMode === 'single'
                      ? (newTable.name.trim() && selectedFloorForTable)
                      : (bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable)
                  )
                    ? 'linear-gradient(135deg, #e53e3e, #dc2626)'
                    : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: (
                    addMode === 'single'
                      ? (newTable.name.trim() && selectedFloorForTable)
                      : (bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable)
                  ) ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                {addMode === 'single' ? 'Add Table' : 'Create Tables'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Floor Modal */}
      {showAddFloor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{t('tables.modals.addFloorTitle')}</h2>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Floor Name *
                </label>
                <input
                  type="text"
                  value={newFloor.name}
                  onChange={(e) => setNewFloor({...newFloor, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Ground Floor, Terrace"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newFloor.description}
                  onChange={(e) => setNewFloor({...newFloor, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Main dining area"
                />
              </div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fef7f0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddFloor(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addFloor}
                disabled={!newFloor.name.trim()}
                style={{
                  flex: 1,
                  background: newFloor.name.trim() 
                    ? 'linear-gradient(135deg, #e53e3e, #dc2626)'
                    : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: newFloor.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Add Floor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Floor Modal */}
      {showEditFloor && editingFloor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{t('tables.modals.editFloorTitle')}</h2>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Floor Name *
                </label>
                <input
                  type="text"
                  value={newFloor.name}
                  onChange={(e) => setNewFloor({...newFloor, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Ground Floor, Terrace"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newFloor.description}
                  onChange={(e) => setNewFloor({...newFloor, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Main dining area"
                />
              </div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fef7f0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowEditFloor(false);
                  setEditingFloor(null);
                  setNewFloor({ name: '', description: '' });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={editFloor}
                disabled={!newFloor.name.trim()}
                style={{
                  flex: 1,
                  background: newFloor.name.trim() 
                    ? 'linear-gradient(135deg, #e53e3e, #dc2626)'
                    : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: newFloor.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Update Floor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '0' : '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{t('tables.modals.addTableTitle')}</h2>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Select Floor *
                </label>
                <select
                  value={selectedFloorForTable || ''}
                  onChange={(e) => setSelectedFloorForTable(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a floor</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.id}>{floor.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Table Name *
                  </label>
                  <input
                    type="text"
                    value={newTable.name}
                    onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#fef7f0',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., T1, V1"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#fef7f0',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Table Type
                </label>
                <select
                  value={newTable.type}
                  onChange={(e) => setNewTable({...newTable, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fef7f0',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="small">Small (1-2 seats)</option>
                  <option value="regular">Regular (3-4 seats)</option>
                  <option value="large">Large (5-8 seats)</option>
                  <option value="vip">VIP</option>
                  <option value="private">Private Room</option>
                </select>
              </div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fef7f0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowAddTable(false);
                  setSelectedFloorForTable(null);
                  setNewTable({ name: '', capacity: 4, type: 'regular', floorId: null });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addTable}
                disabled={!newTable.name.trim() || !selectedFloorForTable}
                style={{
                  flex: 1,
                  background: (newTable.name.trim() && selectedFloorForTable)
                    ? 'linear-gradient(135deg, #e53e3e, #dc2626)'
                    : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: (newTable.name.trim() && selectedFloorForTable) ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal - New Design */}
      {showBookingForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          zIndex: 9999, // Higher z-index to appear above navigation
          padding: isMobile ? '10px' : '20px',
          paddingTop: isMobile ? '60px' : '20px' // Account for mobile navigation
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '600px',
            maxHeight: isMobile ? 'calc(100vh - 80px)' : '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                margin: '0 0 8px 0',
                textAlign: 'center'
              }}>
                {t('tables.selectBookingDetails')}
              </h2>
              {selectedTable && (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#6b7280', 
                  margin: '0 0 24px 0',
                  textAlign: 'center'
                }}>
                  {t('tables.modals.bookTableTitle')} {selectedTable.name} ({selectedTable.capacity} seats)
                </p>
              )}
            </div>
            
            {/* Main Content */}
            <div style={{ padding: '0 24px 24px 24px' }}>
              {/* Available Tables Summary for Selected Date */}
              {bookingData.bookingDate && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: '0 0 16px 0' 
                  }}>
                    {t('tables.modals.availabilityFor')} {new Date(bookingData.bookingDate).toLocaleDateString()}
                  </h3>
                  
                  {loadingAvailability ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      padding: '20px',
                      color: '#6b7280'
                    }}>
                      {t('tables.loadingAvailability')}
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#059669',
                          marginBottom: '4px'
                        }}>
                          {availabilityStats.availableTables}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '600'
                        }}>
                          {t('tables.availableTables')}
                        </div>
                      </div>
                      
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#dc2626',
                          marginBottom: '4px'
                        }}>
                          {availabilityStats.reservedTables}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '600'
                        }}>
                          {t('tables.reservedTables')}
                        </div>
                      </div>
                      
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          {availabilityStats.totalTables}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '600'
                        }}>
                          {t('tables.totalTables')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Details Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Date Selection */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Date *
                  </label>
                  <div style={{ position: 'relative' }}>
                  <input
                      type="date"
                      value={bookingData.bookingDate}
                      onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '12px 16px',
                      border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <FaCalendarAlt size={16} color="#6b7280" />
                    </div>
                </div>
                </div>
                
                {/* Guest Count */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Guests *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                    value={bookingData.partySize}
                      onChange={(e) => setBookingData({...bookingData, partySize: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                        padding: '12px 16px',
                      border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        appearance: 'none'
                      }}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <FaUsers size={16} color="#6b7280" />
                    </div>
                </div>
              </div>

                {/* Meal Type */}
                <div>
                  <label style={{ 
                    display: 'block', 
                      fontSize: '14px',
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Meal Type *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={bookingData.mealType}
                      onChange={(e) => setBookingData({...bookingData, mealType: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '12px 16px',
                      border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        appearance: 'none'
                      }}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <FaUtensils size={16} color="#6b7280" />
                    </div>
                  </div>
                </div>
                </div>
                
              {/* Time Slots Section */}
                <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    Select slot
                  </h3>
                  <div style={{ 
                    height: '1px', 
                    backgroundColor: '#e5e7eb', 
                    flex: 1, 
                    marginLeft: '16px' 
                  }} />
                  <FaChevronDown size={16} color="#6b7280" style={{ marginLeft: '8px' }} />
                </div>

                {/* Time Slots Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {availableTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTimeSlot(slot.value);
                        setBookingData({...bookingData, bookingTime: slot.value});
                      }}
                      disabled={!slot.available}
                      style={{
                        padding: '16px 12px',
                        border: selectedTimeSlot === slot.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: selectedTimeSlot === slot.value ? '#eff6ff' : 'white',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        opacity: slot.available ? 1 : 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => {
                        if (slot.available && selectedTimeSlot !== slot.value) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (slot.available && selectedTimeSlot !== slot.value) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: selectedTimeSlot === slot.value ? '#3b82f6' : '#1f2937'
                      }}>
                        {slot.display}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {slot.available ? `${slot.availableTablesCount || 0} tables` : 'Unavailable'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details */}
              <div style={{ marginTop: '24px' }}>
                {/* Table Selection - Show when opened from header button */}
                {bookingFromHeader && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px',
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Select Table *
                    </label>
                    <select
                      value={selectedTable?.id || ''}
                      onChange={(e) => {
                        const tableId = e.target.value;
                        const table = floors
                          .flatMap(floor => floor.tables || [])
                          .find(t => t.id === tableId);
                        setSelectedTable(table);
                        if (table) {
                          setBookingData(prev => ({
                            ...prev,
                            partySize: Math.min(table.capacity, prev.partySize)
                          }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Choose a table to book</option>
                      {floors.map(floor => 
                        (floor.tables || []).map(table => (
                          <option key={table.id} value={table.id}>
                            {table.name} ({floor.name}) - {table.capacity} seats - {table.status}
                          </option>
                        ))
                      )}
                    </select>
                </div>
                )}

                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  margin: '0 0 16px 0' 
                }}>
                  Customer Details
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '16px' 
                }}>
                <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Customer Name *
                  </label>
                  <input
                      type="text"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '12px 16px',
                      border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                      placeholder="Enter customer name"
                  />
                </div>
                
                <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Phone Number
                  </label>
                  <input
                      type="tel"
                      value={bookingData.customerPhone}
                      onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '12px 16px',
                      border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '16px',
                      outline: 'none',
                        backgroundColor: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                      placeholder="+91 9876543210"
                  />
                </div>
              </div>
              
                <div style={{ marginTop: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                  Special Notes
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  style={{
                    width: '100%',
                      padding: '12px 16px',
                    border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                    outline: 'none',
                      backgroundColor: '#f9fafb',
                    boxSizing: 'border-box',
                      minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Any special requirements or notes..."
                />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{ 
              padding: '24px', 
              backgroundColor: '#f9fafb', 
              borderTop: '1px solid #e5e7eb',
              display: 'flex', 
              gap: '12px' 
            }}>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedTable(null);
                  setBookingFromHeader(false);
                  setSelectedTimeSlot('');
                  setBookingData({
                    customerName: '',
                    customerPhone: '',
                    partySize: 1,
                    bookingDate: '',
                    bookingTime: '',
                    mealType: 'lunch',
                    notes: ''
                  });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Cancel
              </button>
              <button
                onClick={createBooking}
                disabled={!selectedTable || !bookingData.customerName.trim() || !bookingData.bookingDate || !selectedTimeSlot}
                style={{
                  flex: 2,
                  background: (selectedTable && bookingData.customerName.trim() && bookingData.bookingDate && selectedTimeSlot)
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: (selectedTable && bookingData.customerName.trim() && bookingData.bookingDate && selectedTimeSlot) ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedTable && bookingData.customerName.trim() && bookingData.bookingDate && selectedTimeSlot) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTable && bookingData.customerName.trim() && bookingData.bookingDate && selectedTimeSlot) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <FaCalendarAlt size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 4px 16px rgba(234, 179, 8, 0.4);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <NotificationContainer />
    </div>
  );
};

export default TableManagement;