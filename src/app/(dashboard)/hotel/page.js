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

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [openRoomDropdown, setOpenRoomDropdown] = useState(null);

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

  const [checkOutForm, setCheckOutForm] = useState({
    finalPayment: '',
    paymentMode: 'cash',
    discount: '',
    notes: ''
  });

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

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      await apiClient.updateRoomStatus(roomId, newStatus);
      setSuccess('Room status updated');
      loadRooms();
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      setError('Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await apiClient.deleteRoom(roomId);
      setSuccess('Room deleted successfully');
      loadRooms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to delete room');
    }
  };

  // Booking actions
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.createBooking({
        restaurantId,
        roomNumber: bookingForm.roomNumber,
        guestInfo: {
          name: bookingForm.guestName,
          phone: bookingForm.guestPhone,
          email: bookingForm.guestEmail || null
        },
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        numberOfGuests: parseInt(bookingForm.numberOfGuests),
        estimatedTariff: parseFloat(bookingForm.estimatedTariff) || 0,
        specialRequests: bookingForm.specialRequests || null
      });

      setSuccess('Booking created successfully');
      setShowBookingModal(false);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiClient.cancelBooking(bookingId);
      setSuccess('Booking cancelled');
      loadBookings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to cancel booking');
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

      const response = await apiClient.hotelCheckOut(selectedCheckIn.id, {
        finalPayment: parseFloat(checkOutForm.finalPayment) || 0,
        paymentMode: checkOutForm.paymentMode,
        discounts,
        notes: checkOutForm.notes || null
      });

      setSuccess('Checked out successfully');
      setShowCheckOutModal(false);
      setCheckOutForm({ finalPayment: '', paymentMode: 'cash', discount: '', notes: '' });
      setSelectedCheckIn(null);
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

  const openCheckOut = (checkIn) => {
    setSelectedCheckIn(checkIn);
    setCheckOutForm({
      finalPayment: checkIn.balanceAmount?.toFixed(2) || '0.00',
      paymentMode: 'cash',
      discount: '',
      notes: ''
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
      case 'cleaning': return <FaBroom />;
      case 'maintenance': return <FaTools />;
      case 'reserved': return <FaBookmark />;
      case 'out-of-service': return <FaBan />;
      default: return <FaBed />;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                { id: 'checkins', label: 'Check-ins', icon: FaUserCheck }
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
            rooms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`${getRoomStatusColor(room.status)} rounded-lg p-4 text-white relative hover:shadow-lg transition-shadow cursor-pointer`}
                    onClick={() => setOpenRoomDropdown(openRoomDropdown === room.id ? null : room.id)}
                  >
                    {/* Room Number */}
                    <div className="text-center mb-2">
                      <div className="text-3xl font-bold">{room.roomNumber}</div>
                      <div className="text-xs opacity-90">{room.floor}</div>
                    </div>

                    {/* Status Icon */}
                    <div className="flex justify-center mb-2">
                      <div className="text-2xl opacity-90">
                        {getRoomStatusIcon(room.status)}
                      </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center text-xs font-medium mb-2">
                      {getRoomStatusText(room.status)}
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
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {room.status === 'available' && (
                          <>
                            <button
                              onClick={() => {
                                setCheckInForm({ ...checkInForm, roomNumber: room.roomNumber, roomTariff: room.tariff });
                                setShowCheckInModal(true);
                                setOpenRoomDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FaUserCheck className="text-green-600" />
                              Check In
                            </button>
                            <button
                              onClick={() => {
                                setBookingForm({ ...bookingForm, roomNumber: room.roomNumber, estimatedTariff: room.tariff });
                                setShowBookingModal(true);
                                setOpenRoomDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FaBookmark className="text-blue-600" />
                              Book Room
                            </button>
                          </>
                        )}
                        {(room.status === 'cleaning' || room.status === 'maintenance') && (
                          <button
                            onClick={() => {
                              handleUpdateRoomStatus(room.id, 'available');
                              setOpenRoomDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FaCheckCircle className="text-green-600" />
                            Mark Available
                          </button>
                        )}
                        {room.status !== 'occupied' && (
                          <>
                            <button
                              onClick={() => {
                                handleUpdateRoomStatus(room.id, 'maintenance');
                                setOpenRoomDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FaTools className="text-orange-600" />
                              Mark Maintenance
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteRoom(room.id);
                                setOpenRoomDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-200"
                            >
                              <FaTrash className="text-red-600" />
                              Delete Room
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
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
                          <p className="text-sm text-gray-600">{booking.guestPhone}</p>
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
                              onClick={() => handleCancelBooking(booking.id)}
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
                              Order #{order.orderNumber || i+1}: ₹{order.amount.toFixed(2)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.guestPhone}
                    onChange={e => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    onChange={e => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkOutDate}
                    onChange={e => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={checkInForm.guestPhone}
                    onChange={e => setCheckInForm({ ...checkInForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    onChange={e => setCheckInForm({ ...checkInForm, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkInForm.checkOutDate}
                    onChange={e => setCheckInForm({ ...checkInForm, checkOutDate: e.target.value })}
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
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">Check Out - Room {selectedCheckIn.roomNumber}</h2>
              <button onClick={() => { setShowCheckOutModal(false); setSelectedCheckIn(null); }} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleCheckOut} className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Charges:</span>
                    <span className="font-semibold">₹{selectedCheckIn.totalRoomCharges?.toFixed(2)}</span>
                  </div>
                  {selectedCheckIn.totalFoodCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food Charges:</span>
                      <span className="font-semibold">₹{selectedCheckIn.totalFoodCharges.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Paid:</span>
                    <span className="font-semibold text-green-600">- ₹{selectedCheckIn.advancePayment?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="h-px bg-green-200 my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-green-900">Balance Due:</span>
                    <span className="font-bold text-green-900">₹{selectedCheckIn.balanceAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
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
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowCheckOutModal(false); setSelectedCheckIn(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
            </form>
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
                        Food & Beverage Charges
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
    </div>
  );
};

export default Hotel;
