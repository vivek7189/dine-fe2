'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import {
  FaHotel,
  FaPlus,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaPhone,
  FaCalendar,
  FaMoneyBillWave,
  FaFileInvoice,
  FaSignOutAlt,
  FaUtensils,
  FaBed,
  FaUserCheck,
  FaTimes,
  FaReceipt,
  FaPrint,
  FaIdCard,
  FaBuilding,
  FaClock,
  FaBroom,
  FaTools,
  FaBan,
  FaEdit,
  FaTrash,
  FaBookmark
} from 'react-icons/fa';

const Hotel = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('rooms'); // rooms, bookings, checkins

  // Data
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

  // Filters
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('confirmed');
  const [checkInStatusFilter, setCheckInStatusFilter] = useState('active');

  // Room availability state for date-based viewing
  const [roomsViewDate, setRoomsViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomsViewMode, setRoomsViewMode] = useState('current'); // 'current' or 'scheduled'
  const [roomAvailability, setRoomAvailability] = useState(null);
  const [loadingRoomAvailability, setLoadingRoomAvailability] = useState(false);

  // Bookings calendar view state
  const [calendarView, setCalendarView] = useState(true); // true = calendar, false = list
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarSummary, setCalendarSummary] = useState(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);

  // Room history state
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    roomId: '',
    status: ''
  });
  const [history, setHistory] = useState([]);

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCancelMaintenanceModal, setShowCancelMaintenanceModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [deleteRoomReason, setDeleteRoomReason] = useState('');
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [cancelBookingReason, setCancelBookingReason] = useState('');
  const [roomMaintenanceSchedules, setRoomMaintenanceSchedules] = useState([]);
  const [cancelMaintenanceForm, setCancelMaintenanceForm] = useState({
    option: 'all', // 'all' or 'range'
    startDate: '',
    endDate: ''
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [openRoomDropdown, setOpenRoomDropdown] = useState(null);
  
  // Per-card loading states
  const [loadingRooms, setLoadingRooms] = useState({}); // { roomId: true/false }
  const [successRooms, setSuccessRooms] = useState({}); // { roomId: timestamp }

  // Forms
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: 'standard',
    floor: 'Ground',
    capacity: 2,
    tariff: ''
  });

  const [bulkRoomForm, setBulkRoomForm] = useState({
    fromNumber: '',
    toNumber: '',
    type: 'standard',
    floor: 'Ground',
    capacity: 2,
    tariff: ''
  });

  const [bookingForm, setBookingForm] = useState({
    roomNumber: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    numberOfGuests: 1,
    estimatedTariff: '',
    specialRequests: ''
  });

  const [checkInForm, setCheckInForm] = useState({
    roomNumber: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    numberOfGuests: 1,
    roomTariff: '',
    advancePayment: '',
    paymentMode: 'cash',
    idProofType: 'aadhar',
    idProofNumber: '',
    gstNumber: '',
    gstCompanyName: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    duration: 'today', // 'today' or 'custom'
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const [checkOutForm, setCheckOutForm] = useState({
    finalPayment: '',
    paymentMode: 'cash',
    discount: '',
    notes: '',
    roomTariff: ''
  });

  const [foodOrdersPaidStatus, setFoodOrdersPaidStatus] = useState({});

  // Load restaurant
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        let finalRestaurantId = null;

        if (userData.restaurantId) {
          finalRestaurantId = userData.restaurantId;
        } else {
          const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
          if (savedRestaurantId) {
            finalRestaurantId = savedRestaurantId;
          } else {
            const restaurantsResponse = await apiClient.getRestaurants();
            if (restaurantsResponse.restaurants?.length > 0) {
              finalRestaurantId = restaurantsResponse.restaurants[0].id;
            }
          }
        }

        setRestaurantId(finalRestaurantId);
      } catch (error) {
        console.error('Error loading restaurant:', error);
        setError('Failed to load restaurant');
      }
    };

    loadRestaurant();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (restaurantId) {
      if (activeTab === 'rooms') {
        loadRooms();
      } else if (activeTab === 'bookings') {
        loadBookings();
      } else if (activeTab === 'checkins') {
        loadCheckIns();
      } else if (activeTab === 'history') {
        loadHistory();
      }
    }
  }, [restaurantId, activeTab, bookingStatusFilter, checkInStatusFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenRoomDropdown(null);
    };

    if (openRoomDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openRoomDropdown]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRooms(restaurantId, {});
      setRooms(response.rooms || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadRoomAvailability = async () => {
    try {
      setLoadingRoomAvailability(true);
      const response = await apiClient.request(
        `/api/hotel/rooms/availability?date=${roomsViewDate}&restaurantId=${restaurantId}`
      );
      setRoomAvailability(response);
    } catch (error) {
      console.error('Error loading room availability:', error);
    } finally {
      setLoadingRoomAvailability(false);
    }
  };

  // Load room availability when date changes
  useEffect(() => {
    if (restaurantId && activeTab === 'rooms' && roomsViewDate) {
      loadRoomAvailability();
    }
  }, [roomsViewDate, restaurantId, activeTab]);

  const loadCalendarSummary = async () => {
    try {
      const response = await apiClient.request(
        `/api/hotel/calendar/summary?month=${calendarMonth}&year=${calendarYear}&restaurantId=${restaurantId}`
      );
      setCalendarSummary(response);
    } catch (error) {
      console.error('Error loading calendar summary:', error);
    }
  };

  const loadDateBookings = async (date) => {
    try {
      // Filter bookings and check-ins for the selected date
      const allBookings = await apiClient.getBookings(restaurantId, {});
      const allCheckIns = await apiClient.getCheckIns(restaurantId, { status: 'all' });

      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const filtered = [];

      // Filter bookings
      (allBookings.bookings || []).forEach(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        if (checkIn <= selectedDate && checkOut > selectedDate) {
          filtered.push({ ...booking, type: 'booking' });
        }
      });

      // Filter check-ins
      (allCheckIns.checkIns || []).forEach(checkIn => {
        const ciDate = new Date(checkIn.checkInDate);
        const coDate = new Date(checkIn.checkOutDate);
        ciDate.setHours(0, 0, 0, 0);
        coDate.setHours(0, 0, 0, 0);

        if (ciDate <= selectedDate && coDate > selectedDate) {
          filtered.push({ ...checkIn, type: 'check-in' });
        }
      });

      setSelectedDateBookings(filtered);
    } catch (error) {
      console.error('Error loading date bookings:', error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ restaurantId });
      if (historyFilters.startDate) params.append('startDate', historyFilters.startDate);
      if (historyFilters.endDate) params.append('endDate', historyFilters.endDate);
      if (historyFilters.roomId) params.append('roomId', historyFilters.roomId);
      if (historyFilters.status) params.append('status', historyFilters.status);

      const response = await apiClient.request(`/api/hotel/history?${params.toString()}`);
      setHistory(response.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load room history');
    } finally {
      setLoading(false);
    }
  };

  // Load calendar summary when month changes
  useEffect(() => {
    if (restaurantId && activeTab === 'bookings' && calendarView) {
      loadCalendarSummary();
    }
  }, [calendarMonth, calendarYear, restaurantId, activeTab, calendarView]);

  // Load bookings for selected date
  useEffect(() => {
    if (restaurantId && activeTab === 'bookings' && selectedCalendarDate) {
      loadDateBookings(selectedCalendarDate);
    }
  }, [selectedCalendarDate, restaurantId, activeTab]);

  // Load history when filters change
  useEffect(() => {
    if (restaurantId && activeTab === 'history') {
      loadHistory();
    }
  }, [historyFilters, restaurantId, activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const filters = { status: bookingStatusFilter };
      const response = await apiClient.getBookings(restaurantId, filters);
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHotelCheckIns(restaurantId, checkInStatusFilter);
      setCheckIns(response.checkIns || []);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  // Room actions
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.addRoom({
        restaurantId,
        ...roomForm
      });

      setSuccess('Room added successfully');
      setShowAddRoomModal(false);
      setRoomForm({
        roomNumber: '',
        type: 'standard',
        floor: 'Ground',
        capacity: 2,
        tariff: ''
      });
      loadRooms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddRooms = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.bulkAddRooms({
        restaurantId,
        ...bulkRoomForm
      });

      setSuccess('Rooms added successfully');
      setShowBulkAddModal(false);
      setBulkRoomForm({
        fromNumber: '',
        toNumber: '',
        type: 'standard',
        floor: 'Ground',
        capacity: 2,
        tariff: ''
      });
      loadRooms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to add rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus, maintenanceSchedule = null, cancelDateRange = null) => {
    // Set loading state for this specific room
    setLoadingRooms(prev => ({ ...prev, [roomId]: true }));
    
    try {
      // If maintenance with schedule, use new API endpoint
      if (newStatus === 'maintenance' && maintenanceSchedule) {
        await apiClient.request(`/api/room/${roomId}/maintenance`, {
          method: 'POST',
          body: maintenanceSchedule
        });
      } else {
        // If marking as available, check maintenance schedules first
        if (newStatus === 'available' && restaurantId) {
          try {
            // Get maintenance schedules for this room
            const schedulesResponse = await apiClient.getRoomMaintenanceSchedules(roomId, restaurantId);
            const schedules = schedulesResponse.schedules || [];
            
            if (schedules.length > 0) {
              // Check if it's a single day maintenance (all schedules are single day)
              const allSingleDay = schedules.every(s => {
                const start = new Date(s.startDate);
                const end = new Date(s.endDate);
                return start.toISOString().split('T')[0] === end.toISOString().split('T')[0];
              });
              
              if (allSingleDay && schedules.length === 1) {
                // Single day maintenance - cancel immediately
                await apiClient.cancelRoomMaintenance(roomId, restaurantId);
              } else {
                // Multiple days or multiple schedules - show modal
                setRoomMaintenanceSchedules(schedules);
                setSelectedRoom(rooms.find(r => r.id === roomId));
                setShowCancelMaintenanceModal(true);
                setLoadingRooms(prev => {
                  const newState = { ...prev };
                  delete newState[roomId];
                  return newState;
                });
                return; // Exit early, modal will handle the cancellation
              }
            } else if (cancelDateRange) {
              // Cancel maintenance for specific date range
              await apiClient.cancelRoomMaintenance(roomId, restaurantId, cancelDateRange.startDate, cancelDateRange.endDate);
            } else {
              // No maintenance schedules, just cancel all (safety check)
              await apiClient.cancelRoomMaintenance(roomId, restaurantId);
            }
          } catch (maintenanceError) {
            // Log but don't fail - maintenance cancellation is optional
            console.warn('Could not cancel maintenance schedules:', maintenanceError);
          }
        }
        
        await apiClient.updateRoomStatus(roomId, newStatus);
      }
      
      // Optimistically update the room status in local state
      setRooms(prevRooms => prevRooms.map(room => 
        room.id === roomId ? { ...room, status: newStatus } : room
      ));
      
      // Reload rooms and availability - await to ensure data is fresh
      // Use a separate loading state to avoid interfering with per-room loading
      const roomsResponse = await apiClient.getRooms(restaurantId, {});
      setRooms(roomsResponse.rooms || []);
      
      if (restaurantId && roomsViewDate) {
        await loadRoomAvailability();
      }
      
      // Show success feedback for this room after data is reloaded
      setSuccessRooms(prev => ({ ...prev, [roomId]: Date.now() }));
      setTimeout(() => {
        setSuccessRooms(prev => {
          const newState = { ...prev };
          delete newState[roomId];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error('Error updating room status:', error);
      setError('Failed to update room status');
      // Reload rooms on error to get correct state
      loadRooms();
      if (restaurantId && roomsViewDate) {
        loadRoomAvailability();
      }
    } finally {
      // Clear loading state
      setLoadingRooms(prev => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
    }
  };

  const handleDeleteRoom = async (roomId, reason) => {
    try {
      setLoadingRooms(prev => ({ ...prev, [roomId]: true }));
      await apiClient.deleteRoom(roomId);
      setSuccess('Room deleted successfully');
      loadRooms();
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteRoomModal(false);
      setDeleteRoomReason('');
      setSelectedRoom(null);
    } catch (error) {
      setError(error.message || 'Failed to delete room');
    } finally {
      setLoadingRooms(prev => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
    }
  };

  // Booking actions
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate dates
      const checkIn = new Date(bookingForm.checkInDate);
      const checkOut = new Date(bookingForm.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if check-in date is in the past
      if (checkIn < today) {
        setError('Check-in date cannot be in the past');
        setLoading(false);
        return;
      }

      // Check if check-out is after check-in
      if (checkOut <= checkIn) {
        setError('Check-out date must be after check-in date');
        setLoading(false);
        return;
      }

      // Check 120-day advance booking limit
      const daysInFuture = Math.floor((checkIn - today) / (1000 * 60 * 60 * 24));
      if (daysInFuture > 120) {
        setError('Cannot book more than 120 days in advance');
        setLoading(false);
        return;
      }

      // Validate overlap with backend
      try {
        const validationResponse = await apiClient.request('/api/hotel/bookings/validate', {
          method: 'POST',
          body: {
            restaurantId,
            roomNumber: bookingForm.roomNumber,
            checkInDate: bookingForm.checkInDate,
            checkOutDate: bookingForm.checkOutDate
          }
        });

        if (validationResponse.hasConflict) {
          const conflictMessage = validationResponse.conflicts.length > 0
            ? `Room is already booked by ${validationResponse.conflicts[0].guestName} for these dates`
            : 'Room is already booked for these dates';
          setError(conflictMessage);
          setLoading(false);
          return;
        }
      } catch (validationError) {
        console.error('Validation error:', validationError);
        setError('Failed to validate booking. Please try again.');
        setLoading(false);
        return;
      }

      // Check if room is unavailable and ask for override
      const selectedRoom = rooms.find(r => r.roomNumber === bookingForm.roomNumber);
      let overrideUnavailable = false;

      if (selectedRoom && (selectedRoom.status === 'out-of-service' || selectedRoom.status === 'maintenance')) {
        const confirmed = window.confirm(
          `Room ${bookingForm.roomNumber} is currently marked as ${selectedRoom.status}. Do you want to book it anyway?`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }
        overrideUnavailable = true;
      }

      // Create booking
      await apiClient.createBooking({
        restaurantId,
        roomNumber: bookingForm.roomNumber,
        guestInfo: {
          name: bookingForm.guestName,
          phone: bookingForm.guestPhone || null, // Phone is now optional
          email: bookingForm.guestEmail || null
        },
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        numberOfGuests: parseInt(bookingForm.numberOfGuests),
        estimatedTariff: parseFloat(bookingForm.estimatedTariff) || 0,
        specialRequests: bookingForm.specialRequests || null,
        overrideUnavailable
      });

      setSuccess('Booking created successfully');
      setShowBookingModal(false);
      
      // Reload bookings and room availability to reflect the new booking
      await loadBookings();
      if (restaurantId && roomsViewDate) {
        await loadRoomAvailability();
      }
      
      setBookingForm({
        roomNumber: '',
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        numberOfGuests: 1,
        estimatedTariff: '',
        specialRequests: ''
      });
      loadBookings();
      if (calendarView) {
        loadCalendarSummary(); // Refresh calendar if in calendar view
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      setLoadingRooms(prev => ({ ...prev, [bookingId]: true }));
      const response = await apiClient.cancelBooking(bookingId, reason);
      setSuccess('Booking cancelled successfully. Room is now available for the cancelled dates.');
      
      // Refresh bookings list
      loadBookings();
      
      // Refresh room availability to reflect the cancellation
      // This ensures the room shows as available for the cancelled booking dates
      if (roomsViewDate) {
        await loadRoomAvailability();
      }
      
      // Also refresh the rooms list to update room status
      await loadRooms();
      
      setTimeout(() => setSuccess(null), 3000);
      setShowCancelBookingModal(false);
      setSelectedBooking(null);
      setCancelBookingReason('');
    } catch (error) {
      setError('Failed to cancel booking: ' + (error.message || 'Unknown error'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingRooms(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleCheckInFromBooking = async (booking) => {
    try {
      const response = await apiClient.convertBookingToCheckIn(booking.id, {
        advancePayment: 0,
        paymentMode: 'cash'
      });
      setSuccess('Checked in successfully');
      loadBookings();
      setActiveTab('checkins');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to check in');
    }
  };

  // Check-in/Check-out actions
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.hotelCheckIn({
        restaurantId,
        guestInfo: {
          name: checkInForm.guestName,
          phone: checkInForm.guestPhone,
          email: checkInForm.guestEmail || null
        },
        roomNumber: checkInForm.roomNumber,
        checkInDate: checkInForm.checkInDate,
        checkOutDate: checkInForm.checkOutDate,
        numberOfGuests: parseInt(checkInForm.numberOfGuests),
        roomTariff: parseFloat(checkInForm.roomTariff) || 0,
        advancePayment: parseFloat(checkInForm.advancePayment) || 0,
        paymentMode: checkInForm.paymentMode,
        idProof: {
          type: checkInForm.idProofType,
          number: checkInForm.idProofNumber || null
        },
        gstInfo: checkInForm.gstNumber ? {
          gstNumber: checkInForm.gstNumber,
          companyName: checkInForm.gstCompanyName || null
        } : null
      });

      setSuccess('Checked in successfully');
      setShowCheckInModal(false);
      setCheckInForm({
        roomNumber: '',
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        numberOfGuests: 1,
        roomTariff: '',
        advancePayment: '',
        paymentMode: 'cash',
        idProofType: 'aadhar',
        idProofNumber: '',
        gstNumber: '',
        gstCompanyName: ''
      });
      if (activeTab === 'rooms') loadRooms();
      else loadCheckIns();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const discounts = checkOutForm.discount ? [{
        description: 'Discount',
        amount: parseFloat(checkOutForm.discount)
      }] : [];

      // Prepare food orders with their paid status using FULL order IDs
      const foodOrdersStatus = selectedCheckIn.foodOrders
        ?.filter(o => o.status !== 'cancelled')
        .map(order => {
          const fullOrderId = order.id || order.orderId;
          return {
            orderId: fullOrderId,
            amount: order.amount || order.finalAmount || 0,
            isPaid: foodOrdersPaidStatus[fullOrderId] || false,
            status: order.status,
            paymentStatus: order.paymentStatus,
            dailyOrderId: order.dailyOrderId || order.orderNumber,
            createdAt: order.createdAt
          };
        }) || [];

      const response = await apiClient.hotelCheckOut(selectedCheckIn.id, {
        finalPayment: parseFloat(checkOutForm.finalPayment) || 0,
        paymentMode: checkOutForm.paymentMode,
        discounts,
        notes: checkOutForm.notes || null,
        roomTariff: parseFloat(checkOutForm.roomTariff) || 0,
        foodOrdersStatus // Pass the paid status of food orders
      });

      setSuccess('Checked out successfully');
      setShowCheckOutModal(false);
      setCheckOutForm({ finalPayment: '', paymentMode: 'cash', discount: '', notes: '', roomTariff: '' });
      setSelectedCheckIn(null);
      setFoodOrdersPaidStatus({});
      if (activeTab === 'rooms') loadRooms();
      else loadCheckIns();
      setTimeout(() => setSuccess(null), 3000);

      setInvoice(response.invoice);
      setShowInvoiceModal(true);
    } catch (error) {
      setError(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const openCheckOut = async (checkIn) => {
    setSelectedCheckIn(checkIn);

    // Initialize food orders paid status using FULL orderId (database ID, not daily number)
    // Mark orders as paid if: status is 'completed' AND paymentStatus is 'paid'
    // Mark orders as unpaid if: status is not 'completed' OR order is pending/confirmed (KOT orders)
    const paidStatusMap = {};

    // Fetch latest order details to get current status/paymentStatus
    if (checkIn.foodOrders && checkIn.foodOrders.length > 0) {
      try {
        // Fetch all order details to get latest status and final amount (with tax)
        const orderPromises = checkIn.foodOrders.map(async (order) => {
          const fullOrderId = order.id || order.orderId;
          try {
            const orderResponse = await apiClient.getOrderById(fullOrderId);
            const latestOrder = orderResponse?.order || order;
            
            // Calculate final amount with tax if not already present
            let finalAmount = latestOrder.finalAmount;
            if (!finalAmount && latestOrder.totalAmount) {
              // Calculate tax if tax settings are available
              const taxAmount = latestOrder.taxAmount || 0;
              finalAmount = latestOrder.totalAmount + taxAmount;
            }
            
            return {
              ...latestOrder,
              finalAmount: finalAmount || latestOrder.totalAmount || order.amount
            };
          } catch (err) {
            console.error('Failed to fetch order:', fullOrderId, err);
            return order; // Fallback to cached data
          }
        });

        const latestOrders = await Promise.all(orderPromises);

        // Update checkIn with latest order data including final amount
        checkIn.foodOrders = latestOrders.map((latestOrder, idx) => {
          const originalOrder = checkIn.foodOrders[idx];
          const finalAmount = latestOrder.finalAmount || latestOrder.totalAmount + (latestOrder.taxAmount || 0) || originalOrder.amount;
          
          return {
            ...originalOrder,
            status: latestOrder.status || originalOrder.status,
            paymentStatus: latestOrder.paymentStatus || originalOrder.paymentStatus,
            amount: finalAmount, // Update amount to include tax
            finalAmount: finalAmount
          };
        });

        // Build paid status map - auto-check if order is completed and paid
        checkIn.foodOrders.forEach(order => {
          if (order.status !== 'cancelled') {
            const fullOrderId = order.id || order.orderId;
            // Order is paid if status is 'completed' AND paymentStatus is 'paid'
            // This will auto-check the checkbox
            paidStatusMap[fullOrderId] = order.status === 'completed' && order.paymentStatus === 'paid';
          }
        });
      } catch (error) {
        console.error('Failed to fetch latest order statuses:', error);
        // Fallback to using cached data
        checkIn.foodOrders.forEach(order => {
          if (order.status !== 'cancelled') {
            const fullOrderId = order.id || order.orderId;
            // Order is paid if status is 'completed' AND paymentStatus is 'paid'
            // This will auto-check the checkbox
            paidStatusMap[fullOrderId] = order.status === 'completed' && order.paymentStatus === 'paid';
          }
        });
      }
    }
    setFoodOrdersPaidStatus(paidStatusMap);

    // Calculate unpaid food charges (exclude paid and cancelled orders)
    // Use finalAmount (with tax) if available, otherwise use amount
    const unpaidFoodCharges = checkIn.foodOrders
      ?.filter(order => {
        const fullId = order.id || order.orderId;
        return order.status !== 'cancelled' && !foodOrdersPaidStatus[fullId];
      })
      .reduce((sum, order) => sum + (order.amount || order.finalAmount || 0), 0) || 0;

    const balanceWithUnpaidFood = (checkIn.totalRoomCharges || 0) + unpaidFoodCharges - (checkIn.advancePayment || 0);

    setCheckOutForm({
      finalPayment: balanceWithUnpaidFood.toFixed(2),
      paymentMode: 'cash',
      discount: '',
      notes: '',
      roomTariff: checkIn.roomTariff || checkIn.room?.tariff || '' // Pre-fill room tariff if available
    });
    setShowCheckOutModal(true);
  };

  const viewInvoice = async (checkIn) => {
    try {
      const response = await apiClient.getHotelInvoice(checkIn.id);
      setInvoice(response.invoice);
      setShowInvoiceModal(true);
    } catch (error) {
      setError('Failed to load invoice');
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'occupied': return 'bg-red-600';
      case 'booked': return 'bg-blue-600';
      case 'cleaning': return 'bg-yellow-600';
      case 'maintenance': return 'bg-orange-600';
      case 'reserved': return 'bg-blue-600';
      case 'out-of-service': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getRoomStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'booked': return 'Booked';
      case 'cleaning': return 'Cleaning';
      case 'maintenance': return 'Maintenance';
      case 'reserved': return 'Reserved';
      case 'out-of-service': return 'Out of Service';
      default: return status;
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'available': return <FaBed />;
      case 'occupied': return <FaUser />;
      case 'booked': return <FaBookmark />;
      case 'cleaning': return <FaBroom />;
      case 'maintenance': return <FaTools />;
      case 'reserved': return <FaBookmark />;
      case 'out-of-service': return <FaBan />;
      default: return <FaBed />;
    }
  };

  // Determine which status to show based on view mode
  const getRoomDisplayStatus = (room) => {
    if (!roomAvailability) return room.status;

    const roomData = roomAvailability.rooms?.find(r => r.id === room.id);
    if (!roomData) return room.status;

    if (roomsViewMode === 'current') {
      return roomData.currentStatus;
    } else {
      return roomData.scheduledStatus;
    }
  };

  // Stats
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const totalRevenue = checkIns.reduce((sum, c) => sum + (c.totalPaid || 0), 0);

  if (loading && rooms.length === 0 && bookings.length === 0 && checkIns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading hotel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaHotel className="text-red-600" />
                Hotel Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage rooms, bookings, check-ins & billing
              </p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'rooms' && (
                <>
                  <button
                    onClick={() => setShowBulkAddModal(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaPlus /> Bulk Add
                  </button>
                  <button
                    onClick={() => setShowAddRoomModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FaPlus /> Add Room
                  </button>
                </>
              )}
              {activeTab === 'bookings' && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <FaPlus /> New Booking
                </button>
              )}
              {activeTab === 'checkins' && (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <FaPlus /> New Check-In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Rooms</p>
                  <p className="text-3xl font-bold mt-2">{availableRooms}</p>
                  <p className="text-green-100 text-xs mt-1">Ready to book</p>
                </div>
                <FaBed className="text-4xl opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Occupied Rooms</p>
                  <p className="text-3xl font-bold mt-2">{occupiedRooms}</p>
                  <p className="text-red-100 text-xs mt-1">Currently in use</p>
                </div>
                <FaUser className="text-4xl opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Total Rooms</p>
                  <p className="text-3xl font-bold mt-2">{rooms.length}</p>
                  <p className="text-yellow-100 text-xs mt-1">In hotel</p>
                </div>
                <FaHotel className="text-4xl opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-600" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'rooms', label: 'Rooms', icon: FaBed },
                { id: 'bookings', label: 'Bookings', icon: FaBookmark },
                { id: 'checkins', label: 'Check-ins', icon: FaUserCheck },
                { id: 'history', label: 'Room History', icon: FaClock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {activeTab === 'bookings' && (
              <div className="flex gap-2">
                {['confirmed', 'checked-in', 'cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setBookingStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      bookingStatusFilter === filter
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'checkins' && (
              <div className="flex gap-2">
                {['active', 'all', 'checked-out'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setCheckInStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      checkInStatusFilter === filter
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filter === 'active' ? 'Active' : filter === 'all' ? 'All' : 'Checked Out'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <>
              {/* Date Picker and View Mode Toggle */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    View Date:
                  </label>
                  <input
                    type="date"
                    value={roomsViewDate}
                    onChange={(e) => setRoomsViewDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setRoomsViewDate(new Date().toISOString().split('T')[0])}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                  >
                    Today
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setRoomsViewMode('current')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      roomsViewMode === 'current'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Current Status
                  </button>
                  <button
                    onClick={() => setRoomsViewMode('scheduled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      roomsViewMode === 'scheduled'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Scheduled Status
                  </button>
                </div>
              </div>

              {rooms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative">
                {/* Loading Overlay for Date Change */}
                {loadingRoomAvailability && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center z-40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <FaSpinner className="animate-spin text-3xl text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">Loading room availability...</p>
                    </div>
                  </div>
                )}
                {rooms.map((room) => {
                  const displayStatus = getRoomDisplayStatus(room);
                  // Use displayStatus for dropdown logic, but fallback to room.status if displayStatus is not available
                  const effectiveStatus = displayStatus || room.status;
                  return (
                  <div
                    key={room.id}
                    className={`${getRoomStatusColor(displayStatus)} rounded-lg p-4 text-white relative hover:shadow-lg transition-all cursor-pointer ${
                      loadingRooms[room.id] ? 'opacity-60 pointer-events-none' : ''
                    } ${successRooms[room.id] ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                    onClick={() => !loadingRooms[room.id] && setOpenRoomDropdown(openRoomDropdown === room.id ? null : room.id)}
                  >
                    {/* Loading Overlay */}
                    {loadingRooms[room.id] && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center z-20">
                        <FaSpinner className="animate-spin text-2xl" />
                      </div>
                    )}
                    
                    {/* Success Indicator */}
                    {successRooms[room.id] && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 z-10 animate-pulse">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                    )}
                    {/* Room Number */}
                    <div className="text-center mb-2">
                      <div className="text-3xl font-bold">{room.roomNumber}</div>
                      <div className="text-xs opacity-90">{room.floor}</div>
                    </div>

                    {/* Status Icon */}
                    <div className="flex justify-center mb-2">
                      <div className="text-2xl opacity-90">
                        {getRoomStatusIcon(displayStatus)}
                      </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center text-xs font-medium mb-2">
                      {getRoomStatusText(displayStatus)}
                    </div>

                    {/* Current Guest (if occupied) */}
                    {room.currentGuest && (
                      <div className="text-center text-xs opacity-90 truncate">
                        {room.currentGuest}
                      </div>
                    )}

                    {/* Room Type & Capacity */}
                    <div className="text-center text-xs opacity-75 mt-2">
                      {room.type} • {room.capacity} guests
                    </div>

                    {/* Action Dropdown (on click) */}
                    {openRoomDropdown === room.id && (
                      <div className="absolute top-[30%] left-[50%] bg-white rounded-lg shadow-2xl border border-gray-200 z-30 min-w-[200px] overflow-hidden" style={{ transform: 'translate(-50%, 0)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col py-1">
                          {effectiveStatus === 'available' && (
                            <>
                              <button
                                onClick={() => {
                                  setCheckInForm({ ...checkInForm, roomNumber: room.roomNumber, roomTariff: room.tariff });
                                  setShowCheckInModal(true);
                                  setOpenRoomDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <FaUserCheck className="text-green-600 text-base" />
                                Check In
                              </button>
                              <button
                                onClick={() => {
                                  setBookingForm({ ...bookingForm, roomNumber: room.roomNumber, estimatedTariff: room.tariff });
                                  setShowBookingModal(true);
                                  setOpenRoomDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <FaBookmark className="text-blue-600 text-base" />
                                Book Room
                              </button>
                            </>
                          )}
                          {(effectiveStatus === 'cleaning' || effectiveStatus === 'maintenance') && (
                            <button
                              onClick={() => {
                                handleUpdateRoomStatus(room.id, 'available');
                                setOpenRoomDropdown(null);
                              }}
                              disabled={loadingRooms[room.id]}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {loadingRooms[room.id] ? (
                                <FaSpinner className="animate-spin text-green-600 text-base" />
                              ) : (
                                <FaCheckCircle className="text-green-600 text-base" />
                              )}
                              Mark Available
                            </button>
                          )}
                          {effectiveStatus !== 'occupied' && effectiveStatus !== 'maintenance' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setShowMaintenanceModal(true);
                                  setOpenRoomDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <FaTools className="text-orange-600 text-base" />
                                Mark Maintenance
                              </button>
                            </>
                          )}
                          {effectiveStatus !== 'occupied' && (
                            <>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setShowDeleteRoomModal(true);
                                  setOpenRoomDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <FaTrash className="text-red-600 text-base" />
                                Delete Room
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaHotel className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
                <p className="text-sm text-gray-600 mb-4">Add your first room to get started</p>
                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                >
                  <FaPlus /> Add Room
                </button>
              </div>
            )
            }
            </>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <>
              {/* View Toggle */}
              <div className="mb-6 flex items-center justify-between pb-4 border-b">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarView(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      calendarView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Calendar View
                  </button>
                  <button
                    onClick={() => setCalendarView(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !calendarView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>

              {calendarView ? (
                /* Calendar View */
                <div className="grid grid-cols-3 gap-6">
                  {/* Calendar Component */}
                  <div className="col-span-2">
                    <div className="bg-white rounded-lg">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={() => {
                            if (calendarMonth === 1) {
                              setCalendarMonth(12);
                              setCalendarYear(calendarYear - 1);
                            } else {
                              setCalendarMonth(calendarMonth - 1);
                            }
                          }}
                          className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          Previous
                        </button>

                        <h3 className="text-xl font-semibold">
                          {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </h3>

                        <button
                          onClick={() => {
                            if (calendarMonth === 12) {
                              setCalendarMonth(1);
                              setCalendarYear(calendarYear + 1);
                            } else {
                              setCalendarMonth(calendarMonth + 1);
                            }
                          }}
                          className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {/* Weekday Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}

                        {/* Calendar Days */}
                        {(() => {
                          const firstDay = new Date(calendarYear, calendarMonth - 1, 1);
                          const lastDay = new Date(calendarYear, calendarMonth, 0);
                          const daysInMonth = lastDay.getDate();
                          const startDayOfWeek = firstDay.getDay();

                          const days = [];

                          // Empty cells before month starts
                          for (let i = 0; i < startDayOfWeek; i++) {
                            days.push(<div key={`empty-${i}`} className="aspect-square" />);
                          }

                          // Actual days
                          for (let day = 1; day <= daysInMonth; day++) {
                            const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedCalendarDate;
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);

                            const summary = calendarSummary?.summary?.[dateStr] || { bookingCount: 0, occupancyRate: 0, availableRooms: calendarSummary?.totalRooms || 0 };

                            days.push(
                              <button
                                key={dateStr}
                                onClick={() => setSelectedCalendarDate(dateStr)}
                                className={`
                                  aspect-square p-2 rounded-lg border transition-all text-left
                                  ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400' : 'border-gray-200 hover:border-blue-300'}
                                  ${isToday ? 'ring-2 ring-blue-300' : ''}
                                  ${isPast ? 'bg-gray-50' : 'bg-white'}
                                `}
                              >
                                <div className="text-sm font-semibold mb-1">{day}</div>
                                {summary.bookingCount > 0 && (
                                  <div className="text-xs space-y-1">
                                    <div className="text-gray-600">
                                      {summary.bookingCount} booking{summary.bookingCount !== 1 ? 's' : ''}
                                    </div>
                                    <div className={`font-medium ${
                                      summary.occupancyRate > 80 ? 'text-red-600' :
                                      summary.occupancyRate > 50 ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>
                                      {Math.round(summary.occupancyRate)}%
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          }

                          return days;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Booking Detail Sidebar */}
                  <div className="col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 max-h-[calc(100vh-300px)] overflow-y-auto sticky top-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Bookings for {new Date(selectedCalendarDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h3>

                      {selectedDateBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No bookings for this date
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedDateBookings.map(booking => (
                            <div
                              key={booking.id}
                              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">Room {booking.roomNumber}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  booking.status === 'confirmed' || booking.type === 'booking' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'checked-in' || booking.type === 'check-in' ? 'bg-blue-100 text-blue-700' :
                                  booking.status === 'checked-out' ? 'bg-gray-100 text-gray-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {booking.type === 'check-in' ? 'Checked In' : booking.status}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="font-medium">{booking.guestName}</div>
                                <div>{booking.guestPhone || 'No phone'}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span>{new Date(booking.checkInDate).toLocaleDateString()}</span>
                                  <span>→</span>
                                  <span>{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                </div>
                                {(booking.totalAmount || booking.estimatedTariff) && (
                                  <div className="font-medium text-gray-900 mt-2">
                                    ₹{booking.totalAmount || (booking.estimatedTariff * booking.stayDuration)}
                                  </div>
                                )}
                              </div>

                              {booking.type === 'booking' && booking.status === 'confirmed' && (
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckInFromBooking(booking);
                                    }}
                                    className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                  >
                                    Check In
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelBooking(booking.id);
                                    }}
                                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                bookings.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {booking.roomNumber}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                              <p className="text-sm text-gray-600">{booking.guestPhone || 'No phone'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleCheckInFromBooking(booking)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Check In
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowCancelBookingModal(true);
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'cancelled' && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                Cancelled
                              </span>
                            )}
                            {booking.status === 'checked-in' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                                Checked In
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBookmark className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-sm text-gray-600 mb-4">Create your first booking</p>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                      <FaPlus /> New Booking
                    </button>
                  </div>
                )
              )}
            </>
          )}

          {/* CHECK-INS TAB */}
          {activeTab === 'checkins' && (
            checkIns.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      {/* Room & Guest Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                        <div className={`w-16 h-16 rounded-lg ${checkIn.status === 'checked-in' ? 'bg-green-600' : 'bg-gray-400'} flex items-center justify-center text-white text-xl font-bold`}>
                          {checkIn.roomNumber}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FaUser className="text-gray-400" size={12} />
                            {checkIn.guestName}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FaPhone className="text-gray-400" size={10} />
                            {checkIn.guestPhone}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaCalendar size={10} />
                              {new Date(checkIn.checkInDate).toLocaleDateString()} - {new Date(checkIn.checkOutDate).toLocaleDateString()}
                            </span>
                            <span>• {checkIn.stayDuration} nights</span>
                            {checkIn.numberOfGuests > 1 && <span>• {checkIn.numberOfGuests} guests</span>}
                          </div>
                        </div>
                      </div>

                      {/* Billing Info */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">
                          Room: ₹{checkIn.totalRoomCharges?.toFixed(2) || '0.00'}
                          {checkIn.totalFoodCharges > 0 && (
                            <span className="ml-2 text-yellow-600">
                              | Food: ₹{checkIn.totalFoodCharges.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className={`text-2xl font-bold ${checkIn.status === 'checked-in' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {checkIn.status === 'checked-in' ? `₹${checkIn.balanceAmount?.toFixed(2) || '0.00'}` : 'Paid'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {checkIn.status === 'checked-in' ? 'Balance Due' : `Total: ₹${checkIn.totalPaid?.toFixed(2) || '0.00'}`}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {checkIn.status === 'checked-in' ? (
                          <button
                            onClick={() => openCheckOut(checkIn)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
                          >
                            <FaSignOutAlt size={12} />
                            Check Out
                          </button>
                        ) : (
                          <button
                            onClick={() => viewInvoice(checkIn)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm font-medium"
                          >
                            <FaFileInvoice size={12} />
                            Invoice
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Food Orders */}
                    {checkIn.foodOrders && checkIn.foodOrders.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-900 mb-2">
                          <FaUtensils className="inline mr-1" size={10} />
                          Food Orders ({checkIn.foodOrders.length})
                        </p>
                        <div className="flex gap-2 flex-wrap text-xs text-yellow-800">
                          {checkIn.foodOrders.map((order, i) => (
                            <span key={i} className="bg-yellow-100 px-2 py-1 rounded">
                              Order #{order.orderNumber || i+1}: ₹{(order.amount || order.finalAmount || 0).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUserCheck className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No check-ins found</h3>
                <p className="text-sm text-gray-600 mb-4">Check in a guest to get started</p>
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                >
                  <FaPlus /> New Check-In
                </button>
              </div>
            )
          )}

          {/* ROOM HISTORY TAB */}
          {activeTab === 'history' && (
            <>
              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        // Auto-adjust end date if it's before the new start date
                        const newEnd = historyFilters.endDate && historyFilters.endDate < newStart 
                          ? newStart 
                          : historyFilters.endDate;
                        setHistoryFilters({...historyFilters, startDate: newStart, endDate: newEnd});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        // Ensure end date is not before start date
                        if (historyFilters.startDate && newEnd < historyFilters.startDate) {
                          setError('End date cannot be before start date');
                          return;
                        }
                        setHistoryFilters({...historyFilters, endDate: newEnd});
                      }}
                      min={historyFilters.startDate || undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <select
                      value={historyFilters.roomId}
                      onChange={(e) => setHistoryFilters({...historyFilters, roomId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Rooms</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={historyFilters.status}
                      onChange={(e) => setHistoryFilters({...historyFilters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All</option>
                      <option value="checked-out">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* History Table */}
              {history.length > 0 ? (
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.checkInDate).toLocaleDateString()} - {new Date(record.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Room {record.roomNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{record.guestName}</div>
                            <div className="text-xs text-gray-500">{record.guestPhone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.ceil((new Date(record.checkOutDate) - new Date(record.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              record.status === 'checked-out' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {record.status === 'checked-out' ? 'Completed' : record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{record.totalCharges || record.totalAmount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => viewInvoice(record)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaClock className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No history found</h3>
                  <p className="text-sm text-gray-600">
                    {historyFilters.startDate || historyFilters.endDate || historyFilters.roomId || historyFilters.status
                      ? 'Try adjusting your filters'
                      : 'Past check-outs will appear here'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Room</h2>
              <button onClick={() => setShowAddRoomModal(false)} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={roomForm.roomNumber}
                    onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={roomForm.type}
                    onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={roomForm.capacity}
                    onChange={e => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tariff (per night)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomForm.tariff}
                    onChange={e => setRoomForm({ ...roomForm, tariff: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus size={14} />
                      Add Room
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Rooms Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">Bulk Add Rooms</h2>
              <button onClick={() => setShowBulkAddModal(false)} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleBulkAddRooms} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Room Number *</label>
                    <input
                      type="number"
                      required
                      value={bulkRoomForm.fromNumber}
                      onChange={e => setBulkRoomForm({ ...bulkRoomForm, fromNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Room Number *</label>
                    <input
                      type="number"
                      required
                      value={bulkRoomForm.toNumber}
                      onChange={e => setBulkRoomForm({ ...bulkRoomForm, toNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={bulkRoomForm.type}
                    onChange={e => setBulkRoomForm({ ...bulkRoomForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="text"
                    value={bulkRoomForm.floor}
                    onChange={e => setBulkRoomForm({ ...bulkRoomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={bulkRoomForm.capacity}
                    onChange={e => setBulkRoomForm({ ...bulkRoomForm, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tariff (per night)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkRoomForm.tariff}
                    onChange={e => setBulkRoomForm({ ...bulkRoomForm, tariff: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus size={14} />
                      Add Rooms
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">New Booking</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.roomNumber}
                    onChange={e => setBookingForm({ ...bookingForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.guestName}
                    onChange={e => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={bookingForm.guestPhone}
                    onChange={e => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={bookingForm.guestEmail}
                    onChange={e => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkInDate}
                    onChange={e => {
                      const newCheckIn = e.target.value;
                      // Auto-adjust check-out date if it's before the new check-in date
                      const newCheckOut = bookingForm.checkOutDate < newCheckIn 
                        ? newCheckIn 
                        : bookingForm.checkOutDate;
                      setBookingForm({ ...bookingForm, checkInDate: newCheckIn, checkOutDate: newCheckOut });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkOutDate}
                    onChange={e => {
                      const newCheckOut = e.target.value;
                      // Ensure check-out is not before check-in
                      if (newCheckOut < bookingForm.checkInDate) {
                        setError('Check-out date cannot be before check-in date');
                        return;
                      }
                      setBookingForm({ ...bookingForm, checkOutDate: newCheckOut });
                    }}
                    min={bookingForm.checkInDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.numberOfGuests}
                    onChange={e => setBookingForm({ ...bookingForm, numberOfGuests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Tariff/Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bookingForm.estimatedTariff}
                    onChange={e => setBookingForm({ ...bookingForm, estimatedTariff: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={e => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaBookmark size={14} />
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">New Check-In</h2>
              <button onClick={() => setShowCheckInModal(false)} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleCheckIn} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={checkInForm.guestName}
                    onChange={e => setCheckInForm({ ...checkInForm, guestName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={checkInForm.guestPhone}
                    onChange={e => setCheckInForm({ ...checkInForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={checkInForm.guestEmail}
                    onChange={e => setCheckInForm({ ...checkInForm, guestEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={checkInForm.roomNumber}
                    onChange={e => setCheckInForm({ ...checkInForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={checkInForm.checkInDate}
                    onChange={e => {
                      const newCheckIn = e.target.value;
                      // Auto-adjust check-out date if it's before the new check-in date
                      const newCheckOut = checkInForm.checkOutDate < newCheckIn 
                        ? newCheckIn 
                        : checkInForm.checkOutDate;
                      setCheckInForm({ ...checkInForm, checkInDate: newCheckIn, checkOutDate: newCheckOut });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkInForm.checkOutDate}
                    onChange={e => {
                      const newCheckOut = e.target.value;
                      // Ensure check-out is not before check-in
                      if (newCheckOut < checkInForm.checkInDate) {
                        setError('Check-out date cannot be before check-in date');
                        return;
                      }
                      setCheckInForm({ ...checkInForm, checkOutDate: newCheckOut });
                    }}
                    min={checkInForm.checkInDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Tariff/Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkInForm.roomTariff}
                    onChange={e => setCheckInForm({ ...checkInForm, roomTariff: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkInForm.advancePayment}
                    onChange={e => setCheckInForm({ ...checkInForm, advancePayment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                  <select
                    value={checkInForm.idProofType}
                    onChange={e => setCheckInForm({ ...checkInForm, idProofType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="aadhar">Aadhar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={checkInForm.idProofNumber}
                    onChange={e => setCheckInForm({ ...checkInForm, idProofNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={checkInForm.gstNumber}
                    onChange={e => setCheckInForm({ ...checkInForm, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={checkInForm.gstCompanyName}
                    onChange={e => setCheckInForm({ ...checkInForm, gstCompanyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaUserCheck size={14} />
                      Check In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {showCheckOutModal && selectedCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">Check Out - Room {selectedCheckIn.roomNumber}</h2>
              <button onClick={() => { setShowCheckOutModal(false); setSelectedCheckIn(null); }} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleCheckOut} className="flex-1 overflow-y-auto p-6">
              {/* Food Orders Section */}
              {selectedCheckIn.foodOrders && selectedCheckIn.foodOrders.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUtensils className="text-yellow-600" />
                    Food Orders ({selectedCheckIn.foodOrders.filter(o => o.status !== 'cancelled').length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {selectedCheckIn.foodOrders.filter(o => o.status !== 'cancelled').map((order) => {
                      // IMPORTANT: Use full database order ID, NOT daily order number
                      const fullOrderId = order.id || order.orderId;
                      const isPaid = foodOrdersPaidStatus[fullOrderId] || false;
                      // Display daily order number for readability, but use full ID for logic
                      const displayOrderNumber = order.dailyOrderId || order.orderNumber || fullOrderId?.slice(-6);

                      return (
                        <div key={fullOrderId} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={isPaid}
                              onChange={(e) => {
                                const newStatus = { ...foodOrdersPaidStatus, [fullOrderId]: e.target.checked };
                                setFoodOrdersPaidStatus(newStatus);

                                // Recalculate balance using full order IDs
                                const unpaidOrders = selectedCheckIn.foodOrders.filter(o => {
                                  const oFullId = o.id || o.orderId;
                                  return o.status !== 'cancelled' && !newStatus[oFullId];
                                });
                                const unpaidFood = unpaidOrders.reduce((sum, o) => sum + (o.amount || o.finalAmount || 0), 0);
                                const newBalance = (selectedCheckIn.totalRoomCharges || 0) + unpaidFood - (selectedCheckIn.advancePayment || 0);
                                setCheckOutForm({ ...checkOutForm, finalPayment: newBalance.toFixed(2) });
                              }}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-900">Order #{displayOrderNumber}</span>
                                {isPaid && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">Already Paid</span>
                                )}
                                {!isPaid && order.status === 'completed' && order.paymentStatus === 'paid' && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">Auto-Paid</span>
                                )}
                                {!isPaid && order.status !== 'completed' && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">KOT</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500">
                                {order.createdAt 
                                  ? (order.createdAt._seconds 
                                      ? new Date(order.createdAt._seconds * 1000).toLocaleString()
                                      : new Date(order.createdAt).toLocaleString())
                                  : (order.linkedAt?._seconds 
                                      ? new Date(order.linkedAt._seconds * 1000).toLocaleString()
                                      : order.linkedAt 
                                        ? new Date(order.linkedAt).toLocaleString()
                                        : 'N/A')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">₹{(order.amount || order.finalAmount || 0).toFixed(2)}</div>
                            {isPaid && <span className="text-[10px] text-green-600 font-medium">Paid</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    ✓ Check the box if order bill was already paid separately
                  </p>
                </div>
              )}

              {/* Charges Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Charges:</span>
                    <span className="font-semibold">₹{selectedCheckIn.totalRoomCharges?.toFixed(2)}</span>
                  </div>
                  {selectedCheckIn.foodOrders && selectedCheckIn.foodOrders.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Food Charges (Unpaid):</span>
                        <span className="font-semibold">
                          ₹{selectedCheckIn.foodOrders
                            .filter(o => {
                              const fullId = o.id || o.orderId;
                              return o.status !== 'cancelled' && !foodOrdersPaidStatus[fullId];
                            })
                            .reduce((sum, o) => sum + (o.amount || o.finalAmount || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      {selectedCheckIn.foodOrders.some(o => {
                        const fullId = o.id || o.orderId;
                        return foodOrdersPaidStatus[fullId];
                      }) && (
                        <div className="flex justify-between text-green-600">
                          <span>Food Charges (Already Paid):</span>
                          <span className="font-semibold line-through">
                            ₹{selectedCheckIn.foodOrders
                              .filter(o => {
                                const fullId = o.id || o.orderId;
                                return foodOrdersPaidStatus[fullId];
                              })
                              .reduce((sum, o) => sum + (o.amount || o.finalAmount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Paid:</span>
                    <span className="font-semibold text-green-600">- ₹{selectedCheckIn.advancePayment?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="h-px bg-green-200 my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-green-900">Balance Due:</span>
                    <span className="font-bold text-green-900">₹{checkOutForm.finalPayment}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Tariff per Night *
                    <span className="text-xs text-gray-500 ml-2">(Edit if needed)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={checkOutForm.roomTariff}
                    onChange={e => {
                      const newTariff = parseFloat(e.target.value) || 0;
                      const nights = selectedCheckIn.stayDuration || 1;
                      const newRoomCharges = newTariff * nights;

                      // Recalculate balance with new room tariff
                      const unpaidFood = selectedCheckIn.foodOrders
                        ?.filter(o => {
                          const fullId = o.id || o.orderId;
                          return o.status !== 'cancelled' && !foodOrdersPaidStatus[fullId];
                        })
                        .reduce((sum, o) => sum + (o.amount || o.finalAmount || 0), 0) || 0;

                      const newBalance = newRoomCharges + unpaidFood - (selectedCheckIn.advancePayment || 0);

                      setCheckOutForm({
                        ...checkOutForm,
                        roomTariff: e.target.value,
                        finalPayment: newBalance.toFixed(2)
                      });
                    }}
                    placeholder="Enter room tariff per night"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCheckIn.stayDuration || 1} night(s) × ₹{checkOutForm.roomTariff || 0} = ₹{((parseFloat(checkOutForm.roomTariff) || 0) * (selectedCheckIn.stayDuration || 1)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Payment Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={checkOutForm.finalPayment}
                    onChange={e => setCheckOutForm({ ...checkOutForm, finalPayment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={checkOutForm.paymentMode}
                    onChange={e => setCheckOutForm({ ...checkOutForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkOutForm.discount}
                    onChange={e => setCheckOutForm({ ...checkOutForm, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={checkOutForm.notes}
                    onChange={e => setCheckOutForm({ ...checkOutForm, notes: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </form>
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg flex-shrink-0">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCheckOutModal(false); setSelectedCheckIn(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt size={14} />
                      Complete Checkout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal - Detailed & Professional (keeping from previous version) */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FaFileInvoice />
                    Hotel Invoice
                  </h2>
                  <p className="text-red-100 text-sm mt-1">Room #{invoice.roomNumber}</p>
                </div>
                <button onClick={() => { setShowInvoiceModal(false); setInvoice(null); }} className="text-white hover:text-gray-200">
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6">
              {/* Guest Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUser className="text-red-600" />
                    Guest Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{invoice.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{invoice.guestPhone}</span>
                    </div>
                    {invoice.guestEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{invoice.guestEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCalendar className="text-red-600" />
                    Booking Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-In:</span>
                      <span className="font-medium">{new Date(invoice.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-Out:</span>
                      <span className="font-medium">{new Date(invoice.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{invoice.stayDuration} night(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID & GST Info */}
              {(invoice.idProof || invoice.gstInfo) && (
                <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  {invoice.idProof && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaIdCard className="text-red-600" />
                        ID Proof
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{invoice.idProof.type?.replace('_', ' ')}</span>
                        </div>
                        {invoice.idProof.number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Number:</span>
                            <span className="font-medium">{invoice.idProof.number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {invoice.gstInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaBuilding className="text-red-600" />
                        GST Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST No:</span>
                          <span className="font-medium">{invoice.gstInfo.gstNumber}</span>
                        </div>
                        {invoice.gstInfo.companyName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="font-medium">{invoice.gstInfo.companyName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Food Orders Detail */}
              {invoice.foodOrders && invoice.foodOrders.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUtensils className="text-yellow-600" />
                    Food Orders ({invoice.foodOrders.length})
                  </h3>
                  <div className="space-y-2">
                    {invoice.foodOrders.map((order, idx) => {
                      // Display daily order number for readability
                      const displayOrderNumber = order.dailyOrderId || order.orderNumber || order.orderId?.slice(-6);
                      return (
                        <div key={order.orderId || idx} className={`p-3 rounded-lg border-2 ${order.isPaid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  Order #{displayOrderNumber}
                                </span>
                                {order.isPaid ? (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">PAID</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">UNPAID</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {order.createdAt 
                                  ? (order.createdAt._seconds 
                                      ? new Date(order.createdAt._seconds * 1000).toLocaleString()
                                      : new Date(order.createdAt).toLocaleString())
                                  : (order.linkedAt?._seconds 
                                      ? new Date(order.linkedAt._seconds * 1000).toLocaleString()
                                      : order.linkedAt 
                                        ? new Date(order.linkedAt).toLocaleString()
                                        : 'N/A')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-lg ${order.isPaid ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                ₹{(order.amount || order.finalAmount || 0).toFixed(2)}
                              </div>
                              {order.isPaid && <p className="text-xs text-green-600 font-medium">Excluded from bill</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Total Food Orders:</span>
                      <span className="font-semibold">₹{invoice.foodOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-green-700">Already Paid (Excluded):</span>
                      <span className="font-semibold text-green-700 line-through">
                        ₹{invoice.foodOrders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-blue-300">
                      <span className="text-gray-900">Included in Bill:</span>
                      <span className="text-gray-900">
                        ₹{invoice.foodOrders.filter(o => !o.isPaid).reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Charges Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-red-600" />
                  Charges Breakdown
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Room Charges ({invoice.stayDuration} × ₹{invoice.roomTariff})</span>
                    <span className="font-semibold text-gray-900">₹{invoice.roomCharges?.toFixed(2)}</span>
                  </div>
                  {invoice.foodCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center gap-2">
                        <FaUtensils className="text-yellow-600" size={12} />
                        Food & Beverage Charges (Unpaid Only)
                      </span>
                      <span className="font-semibold text-gray-900">₹{invoice.foodCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
                    invoice.additionalCharges.map((charge, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-700">{charge.description}</span>
                        <span className="font-semibold text-gray-900">₹{charge.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">- ₹{invoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-300 my-2" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">Grand Total</span>
                    <span className="font-bold text-gray-900">₹{invoice.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaReceipt className="text-red-600" />
                  Payment Summary
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Advance Payment</span>
                    <span className="font-semibold text-green-700">₹{invoice.advancePayment?.toFixed(2) || '0.00'}</span>
                  </div>
                  {invoice.finalPayment > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Final Payment</span>
                      <span className="font-semibold text-green-700">₹{invoice.finalPayment.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-green-300 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="font-bold text-green-700">₹{invoice.totalPaid?.toFixed(2)}</span>
                  </div>
                  {invoice.balanceAmount > 0 ? (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="font-bold">Balance Due</span>
                      <span className="font-bold">₹{invoice.balanceAmount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg text-center">
                      <FaCheckCircle className="inline mr-2 text-green-600" />
                      <span className="font-semibold text-green-800">Fully Paid</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-center text-xs text-gray-500 mb-4 flex items-center justify-center gap-2">
                <FaClock />
                Invoice generated on {new Date().toLocaleString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <FaPrint />
                  Print Invoice
                </button>
                <button
                  onClick={() => { setShowInvoiceModal(false); setInvoice(null); }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <FaTimes />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTools className="text-orange-600" />
                  Mark Room {selectedRoom.roomNumber} as Maintenance
                </h2>
                <button
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setSelectedRoom(null);
                    setMaintenanceForm({
                      duration: 'today',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                      reason: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const today = new Date().toISOString().split('T')[0];
                  
                  let schedule = {
                    restaurantId,
                    roomId: selectedRoom.id,
                    roomNumber: selectedRoom.roomNumber,
                    reason: maintenanceForm.reason || 'Maintenance required'
                  };

                  if (maintenanceForm.duration === 'today') {
                    schedule.startDate = today;
                    schedule.endDate = today;
                  } else {
                    schedule.startDate = maintenanceForm.startDate;
                    schedule.endDate = maintenanceForm.endDate;
                  }

                  await handleUpdateRoomStatus(selectedRoom.id, 'maintenance', schedule);
                  setShowMaintenanceModal(false);
                  setSelectedRoom(null);
                  setMaintenanceForm({
                    duration: 'today',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    reason: ''
                  });
                }}
              >
                <div className="space-y-4">
                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Duration
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setMaintenanceForm({
                            ...maintenanceForm,
                            duration: 'today',
                            startDate: today,
                            endDate: today
                          });
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          maintenanceForm.duration === 'today'
                            ? 'border-orange-600 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        Today Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaintenanceForm({ ...maintenanceForm, duration: 'custom' })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          maintenanceForm.duration === 'custom'
                            ? 'border-orange-600 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        Custom Range
                      </button>
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  {maintenanceForm.duration === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={maintenanceForm.startDate}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            // Auto-adjust end date if it's before the new start date
                            const newEnd = maintenanceForm.endDate < newStart 
                              ? newStart 
                              : maintenanceForm.endDate;
                            setMaintenanceForm({ ...maintenanceForm, startDate: newStart, endDate: newEnd });
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={maintenanceForm.endDate}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            // Ensure end date is not before start date
                            if (newEnd < maintenanceForm.startDate) {
                              setError('End date cannot be before start date');
                              return;
                            }
                            setMaintenanceForm({ ...maintenanceForm, endDate: newEnd });
                          }}
                          min={maintenanceForm.startDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Reason (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={maintenanceForm.reason}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })}
                      placeholder="e.g., AC repair, plumbing work..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaintenanceModal(false);
                      setSelectedRoom(null);
                      setMaintenanceForm({
                        duration: 'today',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0],
                        reason: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingRooms[selectedRoom.id]}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingRooms[selectedRoom.id] ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaTools />
                        Mark Maintenance
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Maintenance Modal */}
      {showCancelMaintenanceModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTools className="text-orange-600" />
                  Cancel Maintenance - Room {selectedRoom.roomNumber}
                </h2>
                <button
                  onClick={() => {
                    setShowCancelMaintenanceModal(false);
                    setSelectedRoom(null);
                    setRoomMaintenanceSchedules([]);
                    setCancelMaintenanceForm({
                      option: 'all',
                      startDate: '',
                      endDate: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Show maintenance schedules */}
              {roomMaintenanceSchedules.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Active Maintenance Schedules:</p>
                  {roomMaintenanceSchedules.map((schedule, idx) => (
                    <div key={idx} className="text-sm text-gray-600 mb-1">
                      {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                      {schedule.reason && <span className="text-gray-500"> ({schedule.reason})</span>}
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoadingRooms(prev => ({ ...prev, [selectedRoom.id]: true }));
                  
                  try {
                    if (cancelMaintenanceForm.option === 'all') {
                      // Cancel all maintenance schedules
                      await apiClient.cancelRoomMaintenance(selectedRoom.id, restaurantId);
                    } else {
                      // Cancel for specific date range
                      if (!cancelMaintenanceForm.startDate || !cancelMaintenanceForm.endDate) {
                        setError('Please select both start and end dates');
                        setLoadingRooms(prev => {
                          const newState = { ...prev };
                          delete newState[selectedRoom.id];
                          return newState;
                        });
                        return;
                      }
                      await apiClient.cancelRoomMaintenance(
                        selectedRoom.id, 
                        restaurantId, 
                        cancelMaintenanceForm.startDate, 
                        cancelMaintenanceForm.endDate
                      );
                    }
                    
                    // Update room status to available
                    await apiClient.updateRoomStatus(selectedRoom.id, 'available');
                    
                    // Reload data
                    const roomsResponse = await apiClient.getRooms(restaurantId, {});
                    setRooms(roomsResponse.rooms || []);
                    
                    if (restaurantId && roomsViewDate) {
                      await loadRoomAvailability();
                    }
                    
                    setShowCancelMaintenanceModal(false);
                    setSelectedRoom(null);
                    setRoomMaintenanceSchedules([]);
                    setCancelMaintenanceForm({
                      option: 'all',
                      startDate: '',
                      endDate: ''
                    });
                    
                    setSuccess('Maintenance cancelled successfully');
                    setTimeout(() => setSuccess(null), 3000);
                  } catch (error) {
                    console.error('Error cancelling maintenance:', error);
                    setError('Failed to cancel maintenance');
                  } finally {
                    setLoadingRooms(prev => {
                      const newState = { ...prev };
                      delete newState[selectedRoom.id];
                      return newState;
                    });
                  }
                }}
              >
                <div className="space-y-4">
                  {/* Option Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancel Maintenance
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCancelMaintenanceForm({ ...cancelMaintenanceForm, option: 'all' })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          cancelMaintenanceForm.option === 'all'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        All Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelMaintenanceForm({ ...cancelMaintenanceForm, option: 'range' })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          cancelMaintenanceForm.option === 'range'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        Specific Range
                      </button>
                    </div>
                  </div>

                  {/* Date Range Selection */}
                  {cancelMaintenanceForm.option === 'range' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={cancelMaintenanceForm.startDate}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            // Auto-adjust end date if it's before the new start date
                            const newEnd = cancelMaintenanceForm.endDate && cancelMaintenanceForm.endDate < newStart 
                              ? newStart 
                              : cancelMaintenanceForm.endDate;
                            setCancelMaintenanceForm({ ...cancelMaintenanceForm, startDate: newStart, endDate: newEnd });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required={cancelMaintenanceForm.option === 'range'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={cancelMaintenanceForm.endDate}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            // Ensure end date is not before start date
                            if (cancelMaintenanceForm.startDate && newEnd < cancelMaintenanceForm.startDate) {
                              setError('End date cannot be before start date');
                              return;
                            }
                            setCancelMaintenanceForm({ ...cancelMaintenanceForm, endDate: newEnd });
                          }}
                          min={cancelMaintenanceForm.startDate || undefined}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required={cancelMaintenanceForm.option === 'range'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelMaintenanceModal(false);
                      setSelectedRoom(null);
                      setRoomMaintenanceSchedules([]);
                      setCancelMaintenanceForm({
                        option: 'all',
                        startDate: '',
                        endDate: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingRooms[selectedRoom.id]}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingRooms[selectedRoom.id] ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Mark Available
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaBan className="text-red-600" />
                  Cancel Booking - Room {selectedBooking.roomNumber}
                </h2>
                <button
                  onClick={() => {
                    setShowCancelBookingModal(false);
                    setSelectedBooking(null);
                    setCancelBookingReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to cancel the booking for room <span className="font-semibold">{selectedBooking.roomNumber}</span>?
                  <br />
                  <span className="text-xs text-gray-500 mt-2 block">
                    Guest: {selectedBooking.guestName}
                    <br />
                    Dates: {new Date(selectedBooking.checkInDate).toLocaleDateString()} - {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                  </span>
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={cancelBookingReason}
                    onChange={(e) => setCancelBookingReason(e.target.value)}
                    placeholder="e.g., Guest requested cancellation, no-show, room unavailable, etc."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  {cancelBookingReason.trim().length === 0 && (
                    <p className="text-xs text-red-600 mt-1">Reason is required</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelBookingModal(false);
                    setSelectedBooking(null);
                    setCancelBookingReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!cancelBookingReason.trim()) {
                      setError('Please provide a reason for cancellation');
                      return;
                    }
                    handleCancelBooking(selectedBooking.id, cancelBookingReason);
                  }}
                  disabled={!cancelBookingReason.trim() || loadingRooms[selectedBooking.id]}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingRooms[selectedBooking.id] ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaBan />
                      Cancel Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTrash className="text-red-600" />
                  Delete Room {selectedRoom.roomNumber}
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteRoomModal(false);
                    setSelectedRoom(null);
                    setDeleteRoomReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete room <span className="font-semibold">{selectedRoom.roomNumber}</span>? 
                  This action cannot be undone.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Deletion <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={deleteRoomReason}
                    onChange={(e) => setDeleteRoomReason(e.target.value)}
                    placeholder="e.g., Room no longer in use, renovation, etc."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  {deleteRoomReason.trim().length === 0 && (
                    <p className="text-xs text-red-600 mt-1">Reason is required</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteRoomModal(false);
                    setSelectedRoom(null);
                    setDeleteRoomReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!deleteRoomReason.trim()) {
                      setError('Please provide a reason for deletion');
                      return;
                    }
                    handleDeleteRoom(selectedRoom.id, deleteRoomReason);
                  }}
                  disabled={!deleteRoomReason.trim() || loadingRooms[selectedRoom.id]}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingRooms[selectedRoom.id] ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete Room
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotel;
