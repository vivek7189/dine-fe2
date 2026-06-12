'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../../../contexts/LoadingContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import apiClient from '../../../lib/api';
import { useNotification } from '../../../components/Notification.js';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { canPerform } from '../../../lib/permissions';
import { getCachedTablesData, setCachedTablesData } from '../../../utils/dashboardCache';
import { getCachedData, setCachedData } from '../../../lib/offlineDb';
import OfflineBanner from '../../../components/OfflineBanner';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import {
  FaPlus, FaTrash, FaCog, FaUsers, FaClock, FaUtensils, FaCheck, FaBan, FaChair,
  FaHome, FaEdit, FaEllipsisV, FaCalendarAlt, FaTools, FaTimes, FaPhoneAlt,
  FaUser, FaChevronDown, FaEye, FaChevronLeft, FaChevronRight, FaSearch,
  FaLayerGroup, FaConciergeBell, FaArrowRight, FaSpinner, FaArrowUp, FaArrowDown, FaSortAmountDown, FaQrcode,
  FaPrint, FaReceipt, FaExchangeAlt, FaTruck, FaTh, FaThLarge
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { getBillPrintCSS, getBillHeaderHTML } from '../../../utils/printFontSizes';
import { printDocument, supportsNativeAutoPrint } from '../../../utils/printBridge';
import TableBillingModal from '../../../components/TableBillingModal';
import MoveOrderModal from '../../../components/MoveOrderModal';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../../firebase';

const DeliveryTakeawayPanel = dynamic(
  () => import('../../../components/DeliveryTakeawayPanel'),
  { ssr: false }
);

const TableQRCodesModal = ({ isOpen, onClose, floors, restaurant }) => {
  const [qrCodes, setQrCodes] = useState(new Map());
  const [customTableName, setCustomTableName] = useState('');
  const [customQR, setCustomQR] = useState(null);
  const [copiedTable, setCopiedTable] = useState(null);

  const getQRUrl = (tableName) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (restaurant.subdomainEnabled && restaurant.subdomain) {
      const base = isDev
        ? `http://${restaurant.subdomain}.localhost:3002`
        : `https://${restaurant.subdomain}.dineopen.com`;
      return `${base}/placeorder?restaurant=${restaurant.id}&table=${tableName}`;
    }
    const base = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.dineopen.com';
    return `${base}/placeorder?restaurant=${restaurant.id}&table=${tableName}`;
  };

  const allTables = floors.flatMap(floor =>
    (floor.tables || []).map(table => ({
      ...table,
      floorName: floor.name,
      floorId: floor.id || null,
      floor: floor.name,
      tableName: table.name || table.number || table.id,
    }))
  );

  useEffect(() => {
    if (!isOpen) return;
    const generateAll = async () => {
      const map = new Map();
      for (const table of allTables) {
        try {
          const url = getQRUrl(table.tableName);
          const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: '#1f2937', light: '#ffffff' } });
          map.set(table.tableName, dataUrl);
        } catch (e) {
          console.error('QR generation failed for', table.tableName, e);
        }
      }
      setQrCodes(new Map(map));
    };
    generateAll();
  }, [isOpen, floors]);

  const generateCustomQR = async () => {
    if (!customTableName.trim()) return;
    try {
      const url = getQRUrl(customTableName.trim());
      const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: '#1f2937', light: '#ffffff' } });
      setCustomQR({ name: customTableName.trim(), dataUrl, url });
    } catch (e) {
      console.error('Custom QR generation failed', e);
    }
  };

  const downloadQR = (dataUrl, tableName) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-Table-${tableName}.png`;
    a.click();
  };

  const copyUrl = (tableName) => {
    const url = getQRUrl(tableName);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableName);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const downloadAll = async () => {
    for (const table of allTables) {
      const dataUrl = qrCodes.get(table.tableName);
      if (dataUrl) {
        downloadQR(dataUrl, table.tableName);
        await new Promise(r => setTimeout(r, 300));
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 10003, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90vw', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaQrcode size={20} color="#7c3aed" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Table QR Codes</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {allTables.length > 0 && (
              <button onClick={downloadAll} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}>
                Download All ({allTables.length})
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#6b7280' }}>
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Custom QR Section */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#faf5ff', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#6b21a8' }}>Generate Custom QR</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={customTableName}
                onChange={(e) => setCustomTableName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateCustomQR()}
                placeholder="Enter table number or name"
                style={{
                  flex: 1, minWidth: '180px', padding: '10px 14px', border: '2px solid #e9d5ff', borderRadius: '10px',
                  fontSize: '14px', outline: 'none', backgroundColor: 'white',
                }}
              />
              <button onClick={generateCustomQR} disabled={!customTableName.trim()} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none', color: 'white',
                background: customTableName.trim() ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#d1d5db',
                fontSize: '13px', fontWeight: '600', cursor: customTableName.trim() ? 'pointer' : 'not-allowed',
              }}>
                Generate
              </button>
            </div>
            {customQR && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                <img src={customQR.dataUrl} alt={`QR for ${customQR.name}`} style={{ width: '120px', height: '120px', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>Table {customQR.name}</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#6b7280', wordBreak: 'break-all' }}>{customQR.url}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadQR(customQR.dataUrl, customQR.name)} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', backgroundColor: 'white',
                      fontSize: '12px', fontWeight: '600', color: '#7c3aed', cursor: 'pointer',
                    }}>
                      Download
                    </button>
                    <button onClick={() => copyUrl(customQR.name)} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', backgroundColor: 'white',
                      fontSize: '12px', fontWeight: '600', color: '#7c3aed', cursor: 'pointer',
                    }}>
                      {copiedTable === customQR.name ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* All Tables Grid */}
          {allTables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <FaQrcode size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px', fontWeight: '500' }}>No tables found. Add tables first to generate QR codes.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {allTables.map(table => {
                const dataUrl = qrCodes.get(table.tableName);
                return (
                  <div key={`${table.floorName}-${table.tableName}`} style={{
                    padding: '16px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #f3f4f6',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  }}>
                    {dataUrl ? (
                      <img src={dataUrl} alt={`QR for ${table.tableName}`} style={{ width: '140px', height: '140px', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                        <FaSpinner size={20} color="#9ca3af" className="animate-spin" />
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>Table {table.tableName}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{table.floorName}</p>
                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <button onClick={() => dataUrl && downloadQR(dataUrl, table.tableName)} disabled={!dataUrl} style={{
                        flex: 1, padding: '6px 0', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white',
                        fontSize: '11px', fontWeight: '600', color: dataUrl ? '#374151' : '#d1d5db', cursor: dataUrl ? 'pointer' : 'not-allowed',
                      }}>
                        Download
                      </button>
                      <button onClick={() => copyUrl(table.tableName)} style={{
                        flex: 1, padding: '6px 0', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white',
                        fontSize: '11px', fontWeight: '600', color: '#374151', cursor: 'pointer',
                      }}>
                        {copiedTable === table.tableName ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TableManagement = () => {
  const router = useRouter();
  const { isLoading } = useLoading();
  const { getCurrencySymbol } = useCurrency();
  const { isOnline } = useNetworkStatus();
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
  const isMobileEmbed = isMobile && typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
  const [mobileGridCols, setMobileGridCols] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tableGridCols') || '3';
    return '3';
  });
  const [userRole, setUserRole] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('tables');
  const [pusherRefreshSignal, setPusherRefreshSignal] = useState(0);

  // Print state
  const [printSettings, setPrintSettings] = useState(null);
  const [printingTables, setPrintingTables] = useState({});
  const [printDropdownTable, setPrintDropdownTable] = useState(null);

  // Billing modal data (loaded lazily when modal opens)
  const [taxSettings, setTaxSettings] = useState(null);
  const [menuItems, setMenuItems] = useState(null);

  // Floor filter
  const [selectedFloorId, setSelectedFloorId] = useState('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showEditFloor, setShowEditFloor] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookingFromHeader, setBookingFromHeader] = useState(false);
  const [selectedFloorForTable, setSelectedFloorForTable] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [addMode, setAddMode] = useState('single');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // loading for add/edit table, floor, reset, status change
  const actionLockRef = useRef(false); // prevent double-click on add/bulk actions
  const lastFloorFetchRef = useRef(0);
  const [hoveredTableId, setHoveredTableId] = useState(null);
  const [floorModalTab, setFloorModalTab] = useState('details'); // 'details' | 'order'
  const [floorOrderList, setFloorOrderList] = useState([]); // for reordering
  const [savingFloorOrder, setSavingFloorOrder] = useState(false);

  // Quick view modal
  const [quickViewOrder, setQuickViewOrder] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(null);

  // Billing modal state (shared component)
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingModalTable, setBillingModalTable] = useState(null);

  // Move order modal
  const [moveModalTable, setMoveModalTable] = useState(null);
  const posSettings = selectedRestaurant?.posSettings || {};

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
  const userData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const userPageAccess = userData.pageAccess;
  const canAddTable = canPerform(userData, userPageAccess, 'tables', 'add');
  const canEditTable = canPerform(userData, userPageAccess, 'tables', 'update');
  const canDeleteTable = canPerform(userData, userPageAccess, 'tables', 'delete');
  const canResetTables = canPerform(userData, userPageAccess, 'tables', 'reset');
  const canManageTables = canAddTable || canEditTable || canDeleteTable;

  // Timer tick to keep elapsed times updated (every 60s)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Status config (matching dashboard POS cards) ───────
  const statusConfig = {
    available: { color: '#10b981', bg: '#f0fdf4', text: '#166534', label: t('tables.statusAvailable'), icon: FaChair, border: '#10b981' },
    occupied: { color: '#f59e0b', bg: '#fffbeb', text: '#92400e', label: t('tables.statusOccupied'), icon: FaUsers, border: '#fcd34d' },
    serving: { color: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', label: t('tables.statusServing'), icon: FaUtensils, border: '#8b5cf6' },
    reserved: { color: '#3b82f6', bg: '#eff6ff', text: '#1e40af', label: t('tables.statusReserved'), icon: FaClock, border: '#3b82f6' },
    cleaning: { color: '#6b7280', bg: '#f3f4f6', text: '#475569', label: t('tables.statusCleaning'), icon: FaTools, border: '#9ca3af' },
    'out-of-service': { color: '#ef4444', bg: '#fef2f2', text: '#991b1b', label: t('tables.statusOutOfService'), icon: FaBan, border: '#ef4444' },
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
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { loadInitialData(true); }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedRestaurant?.id) {
        if (Date.now() - lastFloorFetchRef.current > 30000) {
          lastFloorFetchRef.current = Date.now();
          loadFloorsAndTables(selectedRestaurant.id, true);
        }
      }
    };
    const handleFocus = () => {
      if (selectedRestaurant?.id) {
        if (Date.now() - lastFloorFetchRef.current > 30000) {
          lastFloorFetchRef.current = Date.now();
          loadFloorsAndTables(selectedRestaurant.id, true);
        }
      }
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

  // ─── Firebase RTDB subscription for real-time table/order updates (replaces Pusher) ───
  const loadFloorsRef = useRef(null);
  useEffect(() => { loadFloorsRef.current = loadFloorsAndTables; });

  useEffect(() => {
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId || !database) return;

    let debounceTimer = null;
    const now = Date.now();
    const ordersRef = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));
    const tablesRef = query(ref(database, `events/${restaurantId}/tables`), orderByChild('ts'), startAt(now));

    console.log(`📡 Tables: Subscribed to Firebase RTDB events/${restaurantId}/orders & tables`);

    const debouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadFloorsRef.current?.(restaurantId, true), 1000);
    };

    const handleOrderEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      // Skip stale events after Firebase reconnect (> 2 min old)
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      if (eventAge > 2 * 60 * 1000) {
        console.log(`📡 Tables: Skipping stale order event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      const orderEvents = ['order-created', 'order-updated', 'order-status-updated', 'order-completed', 'order-deleted'];
      if (orderEvents.includes(data.type)) {
        console.log(`📡 Tables: Received '${data.type}'`, data);
        debouncedRefresh();
        setPusherRefreshSignal(prev => prev + 1);
      }
    };

    const handleTableEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      // Skip stale events after Firebase reconnect (> 2 min old)
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      if (eventAge > 2 * 60 * 1000) {
        console.log(`📡 Tables: Skipping stale table event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      const tableEvents = ['table-status-updated', 'tables-reset'];
      if (tableEvents.includes(data.type)) {
        console.log(`📡 Tables: Received '${data.type}'`, data);
        debouncedRefresh();
        setPusherRefreshSignal(prev => prev + 1);
      }
    };

    onChildAdded(ordersRef, handleOrderEvent);
    onChildAdded(tablesRef, handleTableEvent);

    // Periodic refresh fallback: if Firebase silently disconnects, tables still refresh
    const periodicRefreshInterval = setInterval(() => {
      if (restaurantId) loadFloorsRef.current?.(restaurantId, true);
    }, 10 * 60 * 1000); // every 10 minutes

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      clearInterval(periodicRefreshInterval);
      console.log(`📡 Tables: Unsubscribing from Firebase RTDB`);
      off(ordersRef, 'child_added', handleOrderEvent);
      off(tablesRef, 'child_added', handleTableEvent);
    };
  }, [selectedRestaurant?.id]);

  // Load print settings
  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    apiClient.getPrintSettings(selectedRestaurant.id).then(res => {
      if (res?.success) setPrintSettings(res.printSettings);
    }).catch(() => {});
  }, [selectedRestaurant?.id]);

  // Lazy-load billing modal data when modal opens
  useEffect(() => {
    if (!billingModalOpen || !selectedRestaurant?.id) return;
    if (!taxSettings) {
      apiClient.getTaxSettings(selectedRestaurant.id).then(res => {
        setTaxSettings(res?.taxSettings || res || null);
      }).catch(() => {});
    }
    if (!menuItems) {
      apiClient.getMenu(selectedRestaurant.id).then(res => {
        setMenuItems(res?.menuItems || res?.items || []);
      }).catch(() => {});
    }
  }, [billingModalOpen, selectedRestaurant?.id]);

  // Close print dropdown on outside click
  useEffect(() => {
    if (!printDropdownTable) return;
    const handler = () => setPrintDropdownTable(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [printDropdownTable]);

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

      let restaurants = [];
      let restaurant = null;
      try {
        const restaurantsResponse = await apiClient.getRestaurants();
        restaurants = restaurantsResponse.restaurants || [];
      } catch (restErr) {
        console.warn('🔌 Restaurants API failed, using cached data:', restErr.message);
        const savedRestaurant = localStorage.getItem('selectedRestaurant');
        if (savedRestaurant) {
          const parsed = JSON.parse(savedRestaurant);
          restaurants = [parsed];
        }
      }
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
      // Persist to IndexedDB for offline
      setCachedData(`tables_${restaurantId}`, { floors: floorsData, selectedRestaurant: currentRestaurant }).catch(() => {});

      // ── Stale table auto-release ──
      // If posSettings.tableAutoReleaseHours is set (e.g., 12), auto-release tables
      // that have been occupied longer than the threshold AND have no active (pending/confirmed) order.
      // This avoids tables staying "occupied" for days when staff forgets to mark complete.
      const autoReleaseHours = posSettings?.tableAutoReleaseHours;
      if (autoReleaseHours && autoReleaseHours > 0) {
        const allTables = floorsData.flatMap(f => f.tables || []);
        const staleTables = allTables.filter(table => {
          if (table.status !== 'occupied') return false;
          if (!table.lastOrderTime) return false;
          const d = table.lastOrderTime?.toDate ? table.lastOrderTime.toDate()
            : table.lastOrderTime?._seconds ? new Date(table.lastOrderTime._seconds * 1000)
            : new Date(table.lastOrderTime);
          if (isNaN(d.getTime())) return false;
          const hoursElapsed = (Date.now() - d.getTime()) / (1000 * 60 * 60);
          return hoursElapsed > autoReleaseHours;
        });
        if (staleTables.length > 0) {
          console.log(`🪑 Auto-releasing ${staleTables.length} stale tables (occupied > ${autoReleaseHours}h)`);
          // Release each stale table in background (non-blocking)
          staleTables.forEach(table => {
            apiClient.updateTableStatus(table.id, 'available', null, restaurantId)
              .then(() => console.log(`🪑 Auto-released table "${table.name}"`))
              .catch(err => console.warn(`🪑 Failed to auto-release table "${table.name}":`, err.message));
          });
          // Optimistic local update — mark them available immediately
          setFloors(prev => prev.map(floor => ({
            ...floor,
            tables: (floor.tables || []).map(t =>
              staleTables.some(s => s.id === t.id)
                ? { ...t, status: 'available', currentOrderId: null, customerName: null, startTime: null }
                : t
            ),
          })));
        }
      }
    } catch (err) {
      console.warn('🔌 Floors API failed, trying IndexedDB:', err.message);
      try {
        const idbData = await Promise.race([
          getCachedData(`tables_${restaurantId}`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        if (idbData?.floors) {
          setFloors(idbData.floors);
        } else {
          setError('Failed to load tables');
        }
      } catch (idbErr) {
        setError('Failed to load tables');
      }
    }
  };

  // ── Reset all tables ──────────────────────────────────
  const handleResetAllTables = async () => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    const allTables = floors.flatMap(f => f.tables || []);
    const occupiedCount = allTables.filter(t => t.status === 'occupied').length;
    if (occupiedCount === 0) {
      showWarning(t('tables.allTablesAvailable'));
      return;
    }
    if (!window.confirm(t('tables.freeOccupiedConfirm', { count: occupiedCount }))) return;
    setActionLoading(true);
    try {
      await apiClient.resetAllTables(selectedRestaurant.id);
      setFloors(prev => prev.map(floor => ({
        ...floor,
        tables: floor.tables?.map(t =>
          t.status === 'occupied' ? { ...t, status: 'available', currentOrderId: null } : t
        ),
      })));
      showSuccess(t('tables.tablesResetSuccess', { count: occupiedCount }));
      loadFloorsAndTables(selectedRestaurant.id, true);
    } catch (err) {
      showError(err.message || 'Failed to reset tables');
    } finally { setActionLoading(false); }
  };

  // ── CRUD operations ────────────────────────────────────
  const addFloor = async () => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    if (!newFloor.name.trim() || !selectedRestaurant) return;
    setActionLoading(true);
    try {
      const response = await apiClient.createFloor(selectedRestaurant.id, {
        name: newFloor.name.trim(), description: newFloor.description.trim() || null,
        section: newFloor.section?.trim() || null, areaChargeType: newFloor.areaChargeType || 'none',
        areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0,
      });
      setFloors(prev => [...prev, { ...response.floor, tables: [] }]);
      setNewFloor({ name: '', description: '', section: '', areaChargeType: 'none', areaChargeValue: '' });
      setShowAddFloor(false);
      showSuccess(t('tables.floorAddedSuccess'));
    } catch (err) { showError(`Failed to add floor: ${err.message}`); }
    finally { setActionLoading(false); }
  };

  const editFloor = async () => {
    if (!editingFloor || !newFloor.name.trim() || !selectedRestaurant) return;
    setActionLoading(true);
    try {
      await apiClient.updateFloor(editingFloor.id, {
        name: newFloor.name.trim(), description: newFloor.description.trim() || null,
        section: newFloor.section?.trim() || null, areaChargeType: newFloor.areaChargeType || 'none',
        areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0, restaurantId: selectedRestaurant.id
      });
      setFloors(prev => prev.map(f => f.id === editingFloor.id ? { ...f, name: newFloor.name.trim(), description: newFloor.description.trim() || null, areaChargeType: newFloor.areaChargeType || 'none', areaChargeValue: parseFloat(newFloor.areaChargeValue) || 0 } : f));
      setNewFloor({ name: '', description: '', section: '', areaChargeType: 'none', areaChargeValue: '' });
      setEditingFloor(null); setShowEditFloor(false);
      showSuccess(t('tables.floorUpdatedSuccess'));
    } catch (err) { showError(`Failed to edit floor: ${err.message}`); }
    finally { setActionLoading(false); }
  };

  const [deleteFloorConfirm, setDeleteFloorConfirm] = useState(null);
  const [deletingFloor, setDeletingFloor] = useState(false);

  const deleteFloor = async (floorId) => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    if (!selectedRestaurant?.id) {
      showError('No restaurant selected');
      return;
    }
    try {
      setDeletingFloor(true);
      await apiClient.deleteFloor(floorId, selectedRestaurant.id);
      setFloors(prev => prev.filter(f => f.id !== floorId));
      if (selectedFloorId === floorId) setSelectedFloorId('all');
      showSuccess(t('tables.floorDeletedSuccess'));
      setDeleteFloorConfirm(null);
    } catch (err) { showError(`Failed to delete floor: ${err.message}`); }
    finally { setDeletingFloor(false); }
  };

  const startEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({ name: floor.name, description: floor.description || '', section: floor.section || '', areaChargeType: floor.areaChargeType || 'none', areaChargeValue: floor.areaChargeValue || '' });
    setFloorModalTab('details');
    setFloorOrderList(floors.map(f => ({ id: f.id, name: f.name })));
    setShowEditFloor(true);
  };

  const moveFloorOrder = (index, direction) => {
    const newOrder = [...floorOrderList];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setFloorOrderList(newOrder);
  };

  const saveFloorOrder = async () => {
    if (!selectedRestaurant?.id) return;
    setSavingFloorOrder(true);
    try {
      await apiClient.reorderFloors(selectedRestaurant.id, floorOrderList.map(f => f.id));
      // Reorder local floors state to match
      const orderMap = {};
      floorOrderList.forEach((f, i) => { orderMap[f.id] = i; });
      setFloors(prev => [...prev].sort((a, b) => (orderMap[a.id] ?? Infinity) - (orderMap[b.id] ?? Infinity)));
      showSuccess(t('tables.floorOrderUpdated'));
    } catch (err) { showError(`Failed to update floor order: ${err.message}`); }
    finally { setSavingFloorOrder(false); }
  };

  const addTable = async () => {
    if (actionLockRef.current) return;
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    if (!newTable.name.trim() || !selectedFloorForTable || !selectedRestaurant) return;
    actionLockRef.current = true;
    setActionLoading(true);
    try {
      const selectedFloor = floors.find(f => f.id === selectedFloorForTable);
      if (!selectedFloor) { showError('Floor not found'); setActionLoading(false); actionLockRef.current = false; return; }
      const response = await apiClient.createTable(selectedRestaurant.id, {
        name: newTable.name.trim(), capacity: parseInt(newTable.capacity),
        type: newTable.type, floor: selectedFloor.name, status: 'available'
      });
      setFloors(prev => prev.map(f => f.id === selectedFloorForTable ? { ...f, tables: [...(f.tables || []), response.table] } : f));
      setNewTable({ name: '', capacity: 4, type: 'regular', floorId: null });
      setSelectedFloorForTable(null); setShowAddModal(false);
      showSuccess(t('tables.tableAddedSuccess'));
    } catch (err) { showError(`Failed to add table: ${err.message}`); }
    finally { setActionLoading(false); actionLockRef.current = false; }
  };

  const bulkAddTables = async () => {
    if (actionLockRef.current) return;
    if (!bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable || !selectedRestaurant) {
      showError(t('tables.fillAllFields')); return;
    }
    const from = parseInt(bulkTableData.fromNumber), to = parseInt(bulkTableData.toNumber);
    if (isNaN(from) || isNaN(to)) { showError(t('tables.fromToMustBeNumbers')); return; }
    if (from > to) { showError(t('tables.fromMustBeLessThanTo')); return; }
    if (to - from > 100) { showError(t('tables.maxTablesAtOnce')); return; }
    actionLockRef.current = true;
    setActionLoading(true);
    try {
      const selectedFloor = floors.find(f => f.id === selectedFloorForTable);
      if (!selectedFloor) { showError('Floor not found'); setActionLoading(false); return; }
      const response = await apiClient.bulkCreateTables(selectedRestaurant.id, {
        floor: selectedFloor.name, fromNumber: from, toNumber: to, capacity: parseInt(bulkTableData.capacity)
      });
      if (response.tables?.length > 0) {
        setFloors(prev => prev.map(f => f.id === selectedFloorForTable ? { ...f, tables: [...(f.tables || []), ...response.tables] } : f));
      }
      setBulkTableData({ fromNumber: '', toNumber: '', capacity: 4, floorId: null });
      setSelectedFloorForTable(null); setShowAddModal(false);
      showSuccess(t('tables.createdTablesSuccess', { created: response.created }) + (response.skipped > 0 ? ' ' + t('tables.skippedTables', { skipped: response.skipped }) : ''));
    } catch (err) { showError(`Failed: ${err.message}`); }
    finally { setActionLoading(false); actionLockRef.current = false; }
  };

  const updateTableStatus = async (tableId, newStatus, additionalData = {}) => {
    // Optimistic: update UI immediately before API call
    const prevFloors = floors;
    setFloors(prev => prev.map(floor => ({
      ...floor,
      tables: (floor.tables || []).map(table => {
        if (table.id === tableId) {
          const updated = { ...table, status: newStatus, ...additionalData };
          if (newStatus === 'available') { updated.customerName = null; updated.startTime = null; updated.reservationTime = null; updated.currentOrderId = null; }
          return updated;
        }
        return table;
      })
    })));
    setTableStatusesForDate(prev => ({ ...prev, [tableId]: newStatus }));
    setActiveDropdown(null);

    try {
      await apiClient.updateTableStatus(tableId, newStatus, additionalData.orderId, selectedRestaurant?.id);
    } catch (err) {
      // Revert on error
      setFloors(prevFloors);
      showError(`Failed: ${err.message}`);
    }
  };

  const deleteTable = async (tableId) => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    if (!confirm(t('tables.deleteThisTable'))) return;
    try {
      await apiClient.deleteTable(tableId, selectedRestaurant?.id);
      setFloors(prev => prev.map(f => ({ ...f, tables: (f.tables || []).filter(t => t.id !== tableId) })));
      setActiveDropdown(null);
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const createBooking = async () => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
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
      showSuccess(t('tables.bookingConfirmed'));
    } catch (err) { showError(`Failed: ${err.message}`); } finally { setBookingSubmitting(false); }
  };

  // ── Print Functions ─────────────────────────────────────────
  const handlePrintBill = async (table) => {
    setPrintDropdownTable(null);
    if (!table.currentOrderId || !selectedRestaurant?.id) return;
    const tableId = table.id || table.currentOrderId;
    setPrintingTables(prev => ({ ...prev, [tableId]: true }));

    try {
      const response = await apiClient.getOrderById(table.currentOrderId);
      if (!response.orders || response.orders.length === 0) {
        setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        return;
      }
      const order = response.orders[0];
      const restaurantName = selectedRestaurant?.name || 'Restaurant';

      if (supportsNativeAutoPrint()) {
        const items = order.items || [];
        const subtotal = order.totalAmount || items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        const taxBreakdown = order.taxBreakdown || [];
        const taxTotal = taxBreakdown.reduce((sum, tax) => sum + (tax.amount || 0), 0);
        const total = order.finalAmount || (subtotal + taxTotal);
        const currencySymbol = getCurrencySymbol();

        const itemsHtml = items.map(item =>
          `<tr><td style="text-align:left;">${(item.name || '').replace(/</g, '&lt;')}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${currencySymbol}${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`
        ).join('');

        const _tpIdLines = [];
        if (selectedRestaurant?.legalBusinessName && selectedRestaurant.legalBusinessName !== restaurantName) _tpIdLines.push(selectedRestaurant.legalBusinessName.replace(/</g, '&lt;'));
        if (selectedRestaurant?.address) _tpIdLines.push(selectedRestaurant.address.replace(/</g, '&lt;'));
        if (selectedRestaurant?.phone) _tpIdLines.push('Tel: ' + selectedRestaurant.phone);
        if (selectedRestaurant?.showGstOnInvoice && selectedRestaurant?.gstin) _tpIdLines.push('GSTIN: ' + selectedRestaurant.gstin);
        if (selectedRestaurant?.showFssaiOnInvoice && selectedRestaurant?.fssai) _tpIdLines.push('FSSAI: ' + selectedRestaurant.fssai);
        if (selectedRestaurant?.showTaxIdOnInvoice && selectedRestaurant?.vatNumber) _tpIdLines.push('Tax ID: ' + selectedRestaurant.vatNumber);
        if (selectedRestaurant?.showTaxIdOnInvoice && selectedRestaurant?.taxId) _tpIdLines.push('Tax ID: ' + selectedRestaurant.taxId);
        if (selectedRestaurant?.showTaxIdOnInvoice && selectedRestaurant?.businessRegistrationNumber) _tpIdLines.push('Reg#: ' + selectedRestaurant.businessRegistrationNumber);
        const _tpIdHtml = _tpIdLines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
        const _tpHeaderHtml = getBillHeaderHTML(restaurantName.replace(/</g, '&lt;'), _tpIdHtml, printSettings?.receiptLogo || null, '--- BILL / INVOICE ---');

        const billContent = `<!DOCTYPE html><html><head><title>Bill</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body>${_tpHeaderHtml}<div class="divider">--------------------------------</div><div class="bill-info"><div>Bill #${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</div><div>Table: ${order.tableNumber || table?.name || '-'}</div></div><div class="divider">--------------------------------</div><table class="items-table"><tr><th style="text-align:left;width:55%;">Item</th><th style="text-align:center;width:15%;">Qty</th><th style="text-align:right;width:30%;">Amt</th></tr>${itemsHtml}</table><div class="divider">--------------------------------</div><div class="total-section"><div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>${taxBreakdown.map(tax => `<div class="total-row"><span>${tax.name} (${tax.rate}%)</span><span>${currencySymbol}${(tax.amount || 0).toFixed(2)}</span></div>`).join('')}<div class="total-row" style="font-weight:bold;font-size:16px;"><span>TOTAL</span><span>${currencySymbol}${total.toFixed(2)}</span></div></div><div class="divider">================================</div><div class="bill-footer">Thank you!</div></body></html>`;

        await printDocument({ html: billContent, type: 'bill', printSettings: printSettings || {} });
      } else {
        openManualPrintWindow(order, table);
      }
    } catch (error) {
      console.error('Error printing bill:', error);
    } finally {
      setTimeout(() => setPrintingTables(prev => ({ ...prev, [tableId]: false })), 1000);
    }
  };

  const handlePrintKOT = async (table) => {
    setPrintDropdownTable(null);
    if (!table.currentOrderId || !selectedRestaurant?.id) return;
    const tableId = table.id || table.currentOrderId;
    setPrintingTables(prev => ({ ...prev, [tableId]: true }));

    try {
      const response = await apiClient.getOrderById(table.currentOrderId);
      if (!response.orders || response.orders.length === 0) {
        setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        return;
      }
      const order = response.orders[0];
      const items = order.items || [];
      const restaurantName = selectedRestaurant?.name || 'Restaurant';
      const formattedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formattedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

      const kotHtml = `<!DOCTYPE html><html><head><title>KOT</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body><div style="text-align:center;font-weight:bold;font-size:16px;">${restaurantName.replace(/</g, '&lt;')}</div><div style="text-align:center;font-weight:bold;margin:6px 0;">--- KITCHEN ORDER ---</div><div class="divider">--------------------------------</div><div class="bill-info"><div>Order# ${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</div>${order.tableNumber ? `<div>Table: ${order.tableNumber}${order.floorName ? ` · ${order.floorName}` : ''}</div>` : ''}${order.roomNumber ? `<div>Room: ${order.roomNumber}</div>` : ''}<div>Time: ${formattedTime}</div><div>Date: ${formattedDate}</div>${order.customerDisplay?.name || order.customerInfo?.name ? `<div>Customer: ${(order.customerDisplay?.name || order.customerInfo?.name).replace(/</g, '&lt;')}</div>` : ''}</div><div class="divider">--------------------------------</div><div style="font-weight:bold;margin-bottom:4px;">QTY &nbsp; ITEM</div><div class="divider">--------------------------------</div>${items.map(i => `<div style="margin:4px 0;"><span style="font-weight:bold;">${i.quantity || 1}x</span> ${(i.name || '').replace(/</g, '&lt;')}${i.selectedVariant?.name ? `<div style="padding-left:20px;font-size:11px;color:#666;">[${i.selectedVariant.name}]</div>` : ''}${(i.selectedCustomizations || []).map(c => `<div style="padding-left:20px;font-size:11px;color:#666;">+ ${(c.name || c || '').toString().replace(/</g, '&lt;')}</div>`).join('')}${i.notes ? `<div style="padding-left:20px;font-size:10px;font-style:italic;">Note: ${i.notes.replace(/</g, '&lt;')}</div>` : ''}</div>`).join('')}<div class="divider">--------------------------------</div><div style="font-weight:bold;text-align:center;">Total Items: ${totalItems}</div><div class="divider">================================</div></body></html>`;

      if (supportsNativeAutoPrint()) {
        await printDocument({ html: kotHtml, type: 'kot', printSettings: printSettings || {} });
      } else {
        const pw = window.open('', '_blank', 'width=400,height=600');
        if (pw) { pw.document.write(kotHtml); pw.document.close(); pw.focus(); setTimeout(() => pw.print(), 400); }
      }
    } catch (error) {
      console.error('Error printing KOT:', error);
    } finally {
      setTimeout(() => setPrintingTables(prev => ({ ...prev, [tableId]: false })), 1000);
    }
  };

  const openManualPrintWindow = (order, table) => {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) { alert('Please allow popups to print'); return; }
    const items = order.items || [];
    const subtotal = order.totalAmount || items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const taxBreakdown = order.taxBreakdown || [];
    const taxTotal = taxBreakdown.reduce((sum, tax) => sum + (tax.amount || 0), 0);
    const total = order.finalAmount || (subtotal + taxTotal);
    const currencySymbol = getCurrencySymbol();
    const restaurantName = selectedRestaurant?.name || 'Restaurant';

    const itemsHtml = items.map(item => `<tr><td style="text-align:left;">${(item.name || '').replace(/</g, '&lt;')}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${currencySymbol}${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
    const taxHtml = taxBreakdown.map(tax => `<tr><td colspan="2" style="text-align:left;">${tax.name} (${tax.rate}%)</td><td style="text-align:right;">${currencySymbol}${(tax.amount || 0).toFixed(2)}</td></tr>`).join('');

    const _tpIdLines = [];
    if (selectedRestaurant?.legalBusinessName && selectedRestaurant.legalBusinessName !== restaurantName) _tpIdLines.push(selectedRestaurant.legalBusinessName.replace(/</g, '&lt;'));
    if (selectedRestaurant?.address) _tpIdLines.push(selectedRestaurant.address.replace(/</g, '&lt;'));
    if (selectedRestaurant?.phone) _tpIdLines.push('Tel: ' + selectedRestaurant.phone);
    if (selectedRestaurant?.showGstOnInvoice && selectedRestaurant?.gstin) _tpIdLines.push('GSTIN: ' + selectedRestaurant.gstin);
    const _tpIdHtml = _tpIdLines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
    const _tpHeaderHtml = getBillHeaderHTML(restaurantName.replace(/</g, '&lt;'), _tpIdHtml, printSettings?.receiptLogo || null, '--- BILL / INVOICE ---');

    const billContent = `<!DOCTYPE html><html><head><title>Bill #${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body>${_tpHeaderHtml}<div class="divider">--------------------------------</div><div class="bill-info"><div><span>Bill#:</span><span><strong>${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</strong></span></div><div><span>Date:</span><span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>${order.tableNumber || table?.name ? `<div><span>Table:</span><span>${order.tableNumber || table?.name}${order.floorName || table?.floor ? ` · ${order.floorName || table?.floor}` : ''}</span></div>` : ''}${order.customerInfo?.name ? `<div><span>Customer:</span><span>${(order.customerInfo.name || '').replace(/</g, '&lt;')}</span></div>` : ''}<div><span>Payment:</span><span>${(order.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;width:55%;">Item</th><th style="text-align:center;width:15%;">Qty</th><th style="text-align:right;width:30%;">Amt</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div><span>Subtotal:</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div></div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}<div class="total-row"><span>TOTAL:</span><span>${currencySymbol}${total.toFixed(2)}</span></div></div><div class="divider">================================</div><div class="bill-footer"><p>Thank you for dining with us!</p><p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p></div></body></html>`;

    win.document.write(billContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleQuickView = async (e, table) => {
    e.stopPropagation();
    if (!table.currentOrderId || quickViewLoading) return;
    setQuickViewLoading(table.id);
    try {
      const response = await apiClient.getOrderById(table.currentOrderId);
      const order = response.orders?.[0] || response.order || response;
      setQuickViewOrder({ ...order, tableName: table.name });
    } catch (err) {
      console.error('Quick view failed:', err);
    } finally {
      setQuickViewLoading(null);
    }
  };

  const handleTableAction = (action, table) => {
    setSelectedTable(table);
    setActiveDropdown(null);
    switch (action) {
      case 'take-order': {
        const floor = floors.find(f => (f.tables || []).some(t => t.id === table.id));
        const dashPath = `/dashboard?tableId=${table.id}&tableNo=${encodeURIComponent(table.name)}&floorId=${floor?.id}&floorName=${encodeURIComponent(floor?.name || '')}&from=tables`;
        router.push(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? `/mobile${dashPath}` : dashPath);
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
        if (table.currentOrderId) {
          const p = `/dashboard?orderId=${table.currentOrderId}&mode=edit&from=tables`;
          router.push(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? `/mobile${p}` : p);
        }
        else showWarning(t('tables.noActiveOrder'));
        break;
      case 'move-order': {
        const floor = floors.find(f => (f.tables || []).some(t => t.id === table.id));
        setMoveModalTable({ ...table, floorId: floor?.id, floorName: floor?.name });
        break;
      }
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
    try {
      await apiClient.cancelBooking(bookingId);
      fetchBookingsForDate(selectedDate);
      loadFloorsAndTables(selectedRestaurant.id, true);
      showSuccess(t('tables.bookingCancelled'));
    } catch (err) { showError(`Failed: ${err.message}`); }
  };

  const updateBookingStatus = async (bookingId, status) => {
    if (!isOnline) { showError('You are offline. Go online to make changes.'); return; }
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

  // Sort tables: alphabetic names first (sorted A-Z), then numeric names (sorted 1,2,3...)
  const sortTables = (tablesArr) => {
    return [...tablesArr].sort((a, b) => {
      const nameA = (a.name || a.number || '').toString().trim();
      const nameB = (b.name || b.number || '').toString().trim();
      const numA = Number(nameA);
      const numB = Number(nameB);
      const isNumA = nameA !== '' && !isNaN(numA);
      const isNumB = nameB !== '' && !isNaN(numB);
      if (!isNumA && !isNumB) return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      if (!isNumA && isNumB) return -1;
      if (isNumA && !isNumB) return 1;
      return numA - numB;
    });
  };

  const filteredFloors = (selectedFloorId === 'all' ? floors : floors.filter(f => f.id === selectedFloorId))
    .map(f => ({ ...f, tables: sortTables(f.tables || []) }));

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
    if (mins < 1) return t('tables.justNow');
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  // Get elapsed hours for a table (used for aging threshold checks)
  const getElapsedHours = (table) => {
    if (!table.lastOrderTime) return 0;
    const d = table.lastOrderTime?.toDate ? table.lastOrderTime.toDate() : table.lastOrderTime?._seconds ? new Date(table.lastOrderTime._seconds * 1000) : new Date(table.lastOrderTime);
    if (isNaN(d.getTime())) return 0;
    return (Date.now() - d.getTime()) / (1000 * 60 * 60);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return null;
    const symbol = getCurrencySymbol();
    return `${symbol}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
        <div style={{ flex: 1, padding: isMobileEmbed ? '8px' : '24px', display: 'grid', gridTemplateColumns: isMobileEmbed ? `repeat(${mobileGridCols}, 1fr)` : isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: isMobileEmbed ? '6px' : '20px', alignContent: 'start' }}>
          {[...Array(isMobileEmbed ? 15 : 12)].map((_, i) => (
            <div key={i} style={{ borderRadius: isMobileEmbed ? '8px' : '12px', border: '1px solid #e5e7eb', padding: isMobileEmbed ? '6px 8px' : '12px', minHeight: isMobileEmbed ? '80px' : '120px', display: 'flex', flexDirection: 'column', gap: isMobileEmbed ? '4px' : '8px' }}>
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
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>{t('tables.noTablesYet')}</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>{t('tables.setUpRestaurant')}</p>
          <button onClick={() => router.push(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? '/mobile/dashboard' : '/dashboard')} style={{
            padding: '12px 28px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}>{t('tables.setUpRestaurantBtn')}</button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────
  return (
    <div style={{ height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <OfflineBanner />
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
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', padding: isMobileEmbed ? '8px 12px' : isMobile ? '12px 16px' : '16px 24px' }}>
        {/* Row 1: Title + Date + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobileEmbed ? '6px' : '12px', flexWrap: 'wrap', gap: isMobileEmbed ? '6px' : '12px' }}>
          {!isMobileEmbed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: isMobile && !(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) ? '48px' : '0' }}>
              <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
                <FaChair color="white" size={18} />
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{t('tables.tableManagement')}</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0', fontWeight: '500' }}>{selectedRestaurant?.name || ''}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '6px' : '10px', flexWrap: 'wrap', flex: isMobileEmbed ? 1 : undefined }}>
            {/* Date navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', backgroundColor: 'white', borderRadius: isMobileEmbed ? '8px' : '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={() => changeDate(-1)} style={{ width: isMobileEmbed ? '30px' : '36px', height: isMobileEmbed ? '30px' : '36px', borderRadius: isMobileEmbed ? '8px 0 0 8px' : '12px 0 0 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', borderRight: '1px solid #f1f5f9' }}>
                <FaChevronLeft size={isMobileEmbed ? 9 : 11} />
              </button>
              <div style={{ position: 'relative', padding: '0 4px' }}>
                <button onClick={() => document.getElementById('tbl-date-input')?.showPicker?.()} style={{
                  border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: isMobileEmbed ? '4px 6px' : '6px 8px',
                  fontSize: isMobileEmbed ? '11px' : '13px', fontWeight: '700', color: isToday ? '#ef4444' : '#1f2937',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <FaCalendarAlt size={isMobileEmbed ? 9 : 11} color={isToday ? '#ef4444' : '#9ca3af'} />
                  {isToday ? t('tables.today') : formatDate(selectedDate)}
                </button>
                <input id="tbl-date-input" type="date" value={selectedDate} onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
              </div>
              <button onClick={() => changeDate(1)} style={{ width: isMobileEmbed ? '30px' : '36px', height: isMobileEmbed ? '30px' : '36px', borderRadius: isMobileEmbed ? '0 8px 8px 0' : '0 12px 12px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', borderLeft: '1px solid #f1f5f9' }}>
                <FaChevronRight size={isMobileEmbed ? 9 : 11} />
              </button>
              {!isToday && (
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{ padding: isMobileEmbed ? '3px 8px' : '5px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: '700', color: 'white', cursor: 'pointer', marginLeft: '4px', marginRight: '4px' }}>{t('tables.today')}</button>
              )}
            </div>

            {/* Action buttons — icon-only on mobile embed */}
            {activeMainTab === 'tables' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '4px' : '10px', marginLeft: isMobileEmbed ? 'auto' : undefined }}>
                <button onClick={() => { setBookingFromHeader(true); setSelectedTable(null); setBookingData(prev => ({ ...prev, bookingDate: selectedDate })); setShowBookingForm(true); }} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? 0 : '6px',
                  padding: isMobileEmbed ? '6px' : '8px 16px', borderRadius: isMobileEmbed ? '8px' : '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                  width: isMobileEmbed ? '30px' : undefined, height: isMobileEmbed ? '30px' : undefined,
                }} title={t('tables.book')}>
                  <FaCalendarAlt size={isMobileEmbed ? 11 : 12} /> {!isMobileEmbed && t('tables.book')}
                </button>
                {canResetTables && (
                  <button onClick={handleResetAllTables} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? 0 : '6px',
                    padding: isMobileEmbed ? '6px' : '8px 16px', borderRadius: isMobileEmbed ? '8px' : '10px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                    width: isMobileEmbed ? '30px' : undefined, height: isMobileEmbed ? '30px' : undefined,
                  }} title={t('tables.resetAll')}>
                    <FaTools size={11} /> {!isMobileEmbed && t('tables.resetAll')}
                  </button>
                )}
                {canAddTable && (
                  <button onClick={() => setShowAddModal(true)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? 0 : '6px',
                    padding: isMobileEmbed ? '6px' : '8px 16px', borderRadius: isMobileEmbed ? '8px' : '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                    width: isMobileEmbed ? '30px' : undefined, height: isMobileEmbed ? '30px' : undefined,
                  }} title={t('tables.add')}>
                    <FaPlus size={11} /> {!isMobileEmbed && t('tables.add')}
                  </button>
                )}
                <button onClick={() => setShowQRModal(true)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? 0 : '6px',
                  padding: isMobileEmbed ? '6px' : '8px 16px', borderRadius: isMobileEmbed ? '8px' : '10px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                  width: isMobileEmbed ? '30px' : undefined, height: isMobileEmbed ? '30px' : undefined,
                }} title="QR Codes">
                  <FaQrcode size={isMobileEmbed ? 11 : 12} /> {!isMobileEmbed && 'QR Codes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Toggle + Floor Pills + Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '6px' : '8px', marginBottom: isMobileEmbed ? '4px' : '10px', flexWrap: isMobileEmbed ? 'nowrap' : 'wrap', overflowX: isMobileEmbed ? 'auto' : undefined, WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {/* Tab toggle — compact pill */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: isMobileEmbed ? '8px' : '10px', padding: '3px', flexShrink: 0 }}>
            {[
              { key: 'tables', label: isMobileEmbed ? (t('tables.tableManagement') || 'Tables') : (t('tables.tableManagement') || 'Tables'), icon: FaChair },
              { key: 'delivery-takeaway', label: isMobileEmbed ? 'D/T' : 'Delivery / Takeaway', icon: FaTruck },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveMainTab(tab.key)} style={{
                padding: isMobileEmbed ? '4px 8px' : '6px 14px', borderRadius: isMobileEmbed ? '6px' : '8px', border: 'none',
                fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '3px' : '5px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                backgroundColor: activeMainTab === tab.key ? 'white' : 'transparent',
                color: activeMainTab === tab.key ? '#1f2937' : '#9ca3af',
                boxShadow: activeMainTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                <tab.icon size={isMobileEmbed ? 9 : 11} /> {isMobileEmbed && tab.key === 'tables' ? '' : ''}{tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          {activeMainTab === 'tables' && <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />}

          {/* Floor pills — inline, scrollable on mobile */}
          {activeMainTab === 'tables' && <>
            <button onClick={() => setSelectedFloorId('all')} style={{
              padding: isMobileEmbed ? '3px 8px' : '5px 12px', borderRadius: '20px', border: 'none', fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '3px' : '5px', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
              ...(selectedFloorId === 'all'
                ? { backgroundColor: '#ef4444', color: 'white', boxShadow: '0 2px 6px rgba(239,68,68,0.25)' }
                : { backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0' }),
            }}>
              {isMobileEmbed ? t('tables.allFloors')?.replace(/\s+/g, '') || 'All' : t('tables.allFloors')}
              <span style={{ padding: '0 4px', borderRadius: '8px', fontSize: isMobileEmbed ? '9px' : '10px', fontWeight: '700', backgroundColor: selectedFloorId === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9' }}>{totalTables}</span>
            </button>
            {floors.map(floor => {
              const floorTableCount = (floor.tables || []).length;
              const active = selectedFloorId === floor.id;
              return (
                <button key={floor.id} onClick={() => setSelectedFloorId(floor.id)} style={{
                  padding: isMobileEmbed ? '3px 8px' : '5px 12px', borderRadius: '20px', border: active ? 'none' : '1px solid #e2e8f0',
                  fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: active ? '600' : '500', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '3px' : '5px', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  backgroundColor: active ? '#ef4444' : 'white', color: active ? 'white' : '#475569',
                  boxShadow: active ? '0 2px 6px rgba(239,68,68,0.25)' : 'none',
                }}>
                  {floor.name}
                  <span style={{ padding: '0 4px', borderRadius: '8px', fontSize: isMobileEmbed ? '9px' : '10px', fontWeight: '700', backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9' }}>{floorTableCount}</span>
                </button>
              );
            })}
            {canAddTable && !isMobileEmbed && (
              <button onClick={() => setShowAddFloor(true)} style={{
                padding: '5px 12px', borderRadius: '20px', border: '1px dashed #d1d5db', backgroundColor: 'transparent',
                color: '#9ca3af', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <FaPlus size={9} /> {t('tables.floor')}
              </button>
            )}
          </>}

          {/* Stats — compact dots on mobile embed, pushed right */}
          {activeMainTab === 'tables' && (
            <div style={{ display: 'flex', gap: isMobileEmbed ? '4px' : '6px', marginLeft: 'auto', alignItems: 'center', flexShrink: 0 }}>
              {[
                { label: t('tables.total'), count: totalTables, dot: '#64748b' },
                { label: isToday ? t('tables.available') : t('tables.free'), count: stats.available, dot: '#22c55e' },
                ...(isToday && stats.occupied > 0 ? [{ label: t('tables.occupied'), count: stats.occupied, dot: '#f59e0b' }] : []),
                ...(stats.reserved > 0 ? [{ label: isToday ? t('tables.reserved') : t('tables.booked'), count: stats.reserved, dot: '#3b82f6' }] : []),
                ...(isToday && stats.other > 0 ? [{ label: t('tables.other'), count: stats.other, dot: '#ef4444' }] : []),
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '2px' : '4px', fontSize: isMobileEmbed ? '10px' : '12px', whiteSpace: 'nowrap' }} title={s.label}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.dot }} />
                  <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.count}</span>
                  {!isMobileEmbed && <span style={{ fontWeight: '500', color: '#9ca3af' }}>{s.label}</span>}
                </div>
              ))}
              {loadingTableStatuses && <div style={{ width: '14px', height: '14px', border: '2px solid #f3f4f6', borderTop: '2px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            </div>
          )}
        </div>
      </div>

      {/* ─── DELIVERY/TAKEAWAY PANEL ─── */}
      {activeMainTab === 'delivery-takeaway' && (
        <DeliveryTakeawayPanel
          restaurantId={selectedRestaurant?.id}
          isMobile={isMobile}
          refreshSignal={pusherRefreshSignal}
          formatCurrency={formatCurrency}
        />
      )}

      {/* ─── SCROLLABLE CONTENT (Tables view) ─── */}
      {activeMainTab === 'tables' && (
      <>
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: isMobileEmbed ? '8px' : isMobile ? '16px' : '24px', position: 'relative' }}>

        {/* Loading overlay when changing dates */}
        {loadingTableStatuses && (
          <div style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(248,250,252,0.7)', zIndex: 20,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px',
            animation: 'tblPulse 1.2s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '18px', height: '18px', border: '2.5px solid #f3f4f6', borderTop: '2.5px solid #ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>{t('tables.loadingTables')}</span>
            </div>
          </div>
        )}

        {/* Floor sections */}
        {filteredFloors.map((floor) => {
          const tables = floor.tables || [];
          return (
            <div key={floor.id} style={{ marginBottom: isMobileEmbed ? '12px' : '32px' }}>
              {/* Floor header (only when showing all floors) */}
              {selectedFloorId === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobileEmbed ? '6px' : '16px', paddingBottom: isMobileEmbed ? '4px' : '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '6px' : '10px' }}>
                    <span style={{ fontSize: isMobileEmbed ? '13px' : '16px', fontWeight: '600', color: '#1f2937' }}>{floor.name}</span>
                    {floor.areaChargeType && floor.areaChargeType !== 'none' && (
                      <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '6px' }}>
                        {floor.areaChargeType === 'percentage' ? `+${floor.areaChargeValue}%` : `+${getCurrencySymbol()}${floor.areaChargeValue}`}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{tables.length} {t('tables.tables')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {/* Grid column toggle — mobile embed only */}
                    {isMobileEmbed && (
                      <>
                        <button
                          onClick={() => { setMobileGridCols('2'); localStorage.setItem('tableGridCols', '2'); }}
                          style={{ padding: '3px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: mobileGridCols === '2' ? '#3b82f6' : '#f3f4f6', color: mobileGridCols === '2' ? '#fff' : '#6b7280' }}
                        ><FaThLarge size={11} /></button>
                        <button
                          onClick={() => { setMobileGridCols('3'); localStorage.setItem('tableGridCols', '3'); }}
                          style={{ padding: '3px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: mobileGridCols === '3' ? '#3b82f6' : '#f3f4f6', color: mobileGridCols === '3' ? '#fff' : '#6b7280' }}
                        ><FaTh size={11} /></button>
                      </>
                    )}
                    {(canEditTable || canDeleteTable) && (
                      <>
                        {canEditTable && <button onClick={() => startEditFloor(floor)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><FaEdit size={12} /></button>}
                        {canDeleteTable && <button onClick={() => setDeleteFloorConfirm(floor)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaTrash size={12} /></button>}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Table grid */}
              {tables.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
                  <FaChair size={36} color="#d1d5db" style={{ marginBottom: '12px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>{t('tables.noTablesYetFloor')}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>{t('tables.addTablesToFloor')}</div>
                  {canAddTable && (
                    <button onClick={() => { setSelectedFloorForTable(floor.id); setShowAddModal(true); }} style={{
                      padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                      border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                    }}>
                      <FaPlus size={11} style={{ marginRight: '6px' }} /> {t('tables.addTable')}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobileEmbed ? `repeat(${mobileGridCols}, 1fr)` : isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: isMobileEmbed ? '8px' : isMobile ? '12px' : '20px',
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
                    const elapsedHrs = isOccupied ? getElapsedHours(table) : 0;
                    // Aging thresholds: configurable via posSettings, defaults 2h/6h
                    const warnHours = posSettings?.tableWarnHours || 2;
                    const dangerHours = posSettings?.tableDangerHours || 6;
                    const elapsedIsLong = elapsedHrs >= dangerHours;
                    const elapsedIsWarn = !elapsedIsLong && elapsedHrs >= warnHours;

                    return (
                      <div key={table.id} className="tbl-card table-dropdown" style={{
                        background: sInfo.bg,
                        borderRadius: isMobileEmbed ? '8px' : '12px',
                        border: isOccupied ? 'none' : `1px solid ${sInfo.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        padding: '0', position: 'relative', overflow: isMobileEmbed ? 'hidden' : 'visible',
                        minHeight: isMobileEmbed ? 'auto' : '120px', display: 'flex', flexDirection: 'column',
                        opacity: 0, animation: `tblFadeIn 0.3s ease-out ${idx * 0.03}s forwards`,
                      }} onClick={() => setActiveDropdown(isDropdownOpen ? null : table.id)}
                         onMouseEnter={() => setHoveredTableId(table.id)}
                         onMouseLeave={() => setHoveredTableId(null)}>

                        {/* Animated dotted border for occupied tables (today only) */}
                        {isOccupied && (
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx={isMobileEmbed ? "6.5" : "10.5"} ry={isMobileEmbed ? "6.5" : "10.5"} fill="none" stroke={sInfo.color} strokeWidth={isMobileEmbed ? "1.5" : "2"} strokeDasharray={isMobileEmbed ? "4,4" : "6,6"} strokeDashoffset="100">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                            </rect>
                          </svg>
                        )}

                        <div style={{ padding: isMobileEmbed ? '6px 8px' : '12px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                          {/* Header: name + status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobileEmbed ? '2px' : '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: isMobileEmbed ? '3px' : '6px' }}>
                                <span style={{ fontSize: isMobileEmbed ? '12px' : '16px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                                  {table.name}
                                </span>
                                {isOccupied && elapsed && (
                                  <span style={{
                                    fontSize: isMobileEmbed ? '8px' : '10px', fontWeight: 700, whiteSpace: 'nowrap',
                                    color: elapsedIsLong ? '#fff' : elapsedIsWarn ? '#92400e' : '#6b7280',
                                    ...(elapsedIsLong ? { background: '#dc2626', padding: '1px 3px', borderRadius: '3px' } : {}),
                                    ...(elapsedIsWarn ? { background: '#fef3c7', padding: '1px 3px', borderRadius: '3px' } : {}),
                                  }}>
                                    {elapsed}
                                  </span>
                                )}
                              </div>
                              {!isMobileEmbed && (
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaChair size={9} /> {table.capacity || '-'} {t('tables.seats')}
                                  {isOccupied && table.currentOrderId && (
                                    <button onClick={(e) => handleQuickView(e, table)} title="Quick view order" style={{
                                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                                      color: '#6b7280', display: 'flex', alignItems: 'center', marginLeft: '2px',
                                    }}>
                                      {quickViewLoading === table.id ? <FaSpinner size={10} className="animate-spin" /> : <FaEye size={10} />}
                                    </button>
                                  )}
                                </div>
                              )}
                              {isMobileEmbed && (
                                <div style={{ fontSize: '8px', color: '#9ca3af', marginTop: '1px' }}>
                                  {table.capacity || '-'} seats
                                </div>
                              )}
                            </div>
                            {isAvailable ? (
                              <div style={{ width: isMobileEmbed ? '6px' : '8px', height: isMobileEmbed ? '6px' : '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px #d1fae5' }} />
                            ) : (
                              isMobileEmbed ? (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sInfo.color, flexShrink: 0 }} />
                              ) : (
                                <div style={{
                                  background: sInfo.bg, color: sInfo.color, padding: '3px 8px', borderRadius: '12px',
                                  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${sInfo.border}`,
                                  display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0,
                                }}>
                                  {sInfo.label}
                                </div>
                              )
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {isToday ? (
                              /* ── TODAY: show live data ── */
                              <>
                                {isOccupied && (table.currentOrderFinalAmount || table.currentOrderTotal) ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    {!isMobileEmbed && <div style={{ fontSize: '9px', color: '#92400e', fontWeight: 500, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      {t('tables.totalInclTax')} {table.currentOrderTax ? t('tables.inclTax') : ''}
                                    </div>}
                                    <div style={{
                                      fontSize: isMobileEmbed ? '13px' : '18px', fontWeight: 800, color: '#b45309',
                                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: isMobileEmbed ? '2px 6px' : '4px 12px',
                                      borderRadius: isMobileEmbed ? '5px' : '8px', border: '1px solid #fcd34d',
                                    }}>
                                      {formatCurrency(table.currentOrderFinalAmount || table.currentOrderTotal)}
                                    </div>
                                  </div>
                                ) : isOccupied && table.customerName ? (
                                  <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: 600, color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table.customerName}</div>
                                ) : tableStatus === 'reserved' ? (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: 600, color: '#1e40af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table.customerName || t('tables.statusReserved')}</div>
                                    {!isMobileEmbed && table.reservationTime && <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>{table.reservationTime}</div>}
                                  </div>
                                ) : tableStatus === 'cleaning' ? (
                                  <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '9px' : '11px', color: '#64748b', fontStyle: 'italic' }}>{t('tables.beingCleaned')}</div>
                                ) : tableStatus === 'out-of-service' ? (
                                  <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '9px' : '11px', color: '#ef4444' }}>{t('tables.unavailable')}</div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                    <StatusIcon size={isMobileEmbed ? 20 : 32} color={sInfo.color} />
                                  </div>
                                )}
                              </>
                            ) : (
                              /* ── NON-TODAY: show booking info for this date ── */
                              <>
                                {hasBookings ? (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                      fontSize: isMobileEmbed ? '14px' : '20px', fontWeight: 800, color: '#1e40af', marginBottom: '2px',
                                    }}>
                                      {tblBookings.length}
                                    </div>
                                    <div style={{ fontSize: isMobileEmbed ? '8px' : '10px', color: '#3b82f6', fontWeight: 600 }}>
                                      {tblBookings.length === 1 ? t('tables.booking') : t('tables.bookings')}
                                    </div>
                                    {!isMobileEmbed && tblBookings[0]?.customerName && (
                                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tblBookings[0].customerName}
                                        {tblBookings.length > 1 && ` +${tblBookings.length - 1}`}
                                      </div>
                                    )}
                                    {!isMobileEmbed && tblBookings[0]?.bookingTime && (
                                      <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>
                                        {tblBookings[0].bookingTime}
                                        {tblBookings.length > 1 && ` ...`}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                      <FaChair size={isMobileEmbed ? 18 : 32} color="#10b981" />
                                    </div>
                                    {!isMobileEmbed && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{t('tables.noBookings')}</div>}
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
                              {tblBookings.length} {tblBookings.length > 1 ? t('tables.bookings') : t('tables.booking')}
                            </div>
                            {tblBookings.slice(0, 4).map((b, bi) => (
                              <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '3px 0', borderTop: bi > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                <span style={{ opacity: 0.9 }}>{b.customerName || t('tables.guest')}</span>
                                <span style={{ opacity: 0.6 }}>{b.bookingTime || '—'} · {b.partySize || '?'}p</span>
                              </div>
                            ))}
                            {tblBookings.length > 4 && (
                              <div style={{ opacity: 0.5, marginTop: '4px' }}>+{tblBookings.length - 4} {t('tables.more')}</div>
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
                        <div style={{ padding: isMobileEmbed ? '0 6px 6px' : '0 8px 8px', position: 'relative', zIndex: 2 }}>
                          {isToday ? (
                            /* ── TODAY: live action buttons ── */
                            <>
                              {isAvailable && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{
                                  width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: '#059669', color: 'white', border: 'none',
                                  borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <FaUtensils size={isMobileEmbed ? 8 : 10} /> {isMobileEmbed ? 'Order' : t('tables.takeOrder')}
                                </button>
                              )}
                              {isOccupied && (
                                <div style={{ display: 'flex', gap: isMobileEmbed ? '4px' : '5px', position: 'relative' }}>
                                  {/* Add items — primary action */}
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('view-order', table); }} style={{
                                    flex: 1, padding: isMobileEmbed ? '4px 4px' : '7px 8px', background: 'white', border: '1px solid #e5e7eb', color: '#374151',
                                    borderRadius: isMobileEmbed ? '6px' : '8px', fontSize: isMobileEmbed ? '9px' : '11px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', whiteSpace: 'nowrap',
                                  }}>
                                    <FaPlus size={isMobileEmbed ? 7 : 9} style={{ color: '#059669' }} /> Add
                                  </button>
                                  {/* Complete Bill — primary action */}
                                  <button className="tbl-action" onClick={(e) => {
                                    e.stopPropagation();
                                    if (table.currentOrderId) {
                                      setBillingModalTable(table);
                                      setBillingModalOpen(true);
                                    } else {
                                      handleTableAction('make-available', table);
                                    }
                                  }} style={{
                                    flex: 1, padding: isMobileEmbed ? '4px 4px' : '7px 8px', background: '#dc2626', border: 'none', color: 'white',
                                    borderRadius: isMobileEmbed ? '6px' : '8px', fontSize: isMobileEmbed ? '9px' : '11px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', whiteSpace: 'nowrap',
                                  }}>
                                    <FaReceipt size={isMobileEmbed ? 7 : 9} /> Bill
                                  </button>
                                  {/* Print + Move — combined in one icon menu */}
                                  <div style={{ position: 'relative' }}>
                                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); setPrintDropdownTable(printDropdownTable === table.id ? null : table.id); }} style={{
                                      width: isMobileEmbed ? '26px' : '32px', height: isMobileEmbed ? '26px' : '32px', padding: 0,
                                      background: printingTables[table.id]
                                        ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
                                        : printDropdownTable === table.id ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'rgba(0,0,0,0.03)',
                                      color: printingTables[table.id] ? '#3b82f6' : printDropdownTable === table.id ? '#b45309' : '#6b7280',
                                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                      {printingTables[table.id] ? <FaSpinner size={10} className="spin" /> : <FaPrint size={11} />}
                                    </button>
                                    {printDropdownTable === table.id && (
                                      <div onClick={(e) => e.stopPropagation()} style={{
                                        position: 'absolute', bottom: '100%', right: 0, marginBottom: '4px',
                                        background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        border: '1px solid #e5e7eb', zIndex: 999, minWidth: '140px', overflow: 'hidden',
                                        padding: '4px 0',
                                      }}>
                                        {posSettings.moveOrderEnabled && table.currentOrderId && (
                                          <button onClick={(e) => { e.stopPropagation(); setPrintDropdownTable(null); handleTableAction('move-order', table); }} style={{
                                            width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                            fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                          >
                                            <FaExchangeAlt size={10} style={{ color: '#6366f1' }} /> Move Order
                                          </button>
                                        )}
                                        <button onClick={() => { handlePrintBill(table); setPrintDropdownTable(null); }} style={{
                                          width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                          fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                          <FaReceipt size={10} style={{ color: '#10b981' }} /> Print Bill
                                        </button>
                                        <button onClick={() => { handlePrintKOT(table); setPrintDropdownTable(null); }} style={{
                                          width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                          fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                          <FaUtensils size={10} style={{ color: '#f59e0b' }} /> Print KOT
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {tableStatus === 'reserved' && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('take-order', table); }} style={{
                                  width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: '#059669', color: 'white', border: 'none',
                                  borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <FaUtensils size={isMobileEmbed ? 8 : 10} /> {isMobileEmbed ? 'Seat' : t('tables.seatGuest')}
                                </button>
                              )}
                              {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{
                                  width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: 'white', color: '#059669', border: '1px solid #d1fae5',
                                  borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                                }}>
                                  <FaCheck size={10} /> {t('tables.makeAvailable')}
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
                              width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px',
                              background: hasBookings ? 'white' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                              color: hasBookings ? '#059669' : 'white',
                              border: hasBookings ? '1px solid #bbf7d0' : 'none',
                              borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                            }}>
                              <FaCalendarAlt size={10} /> {hasBookings ? t('tables.addBooking') : t('tables.bookTable')}
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
                                    <FaCalendarAlt size={12} /> {t('tables.book')}
                                  </button>
                                  {canEditTable && (
                                    <>
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('out-of-service', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#8b5cf6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' }}>
                                        <FaBan size={12} /> {t('tables.service')}
                                      </button>
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                        <FaTools size={12} /> {t('tables.clean')}
                                      </button>
                                    </>
                                  )}
                                  {canDeleteTable && (
                                      <button className="tbl-action" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                        <FaTrash size={12} /> {t('tables.delete')}
                                      </button>
                                  )}
                                </>
                              )}
                              {isOccupied && (
                                <>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                    <FaTools size={12} /> {t('tables.clean')}
                                  </button>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                    <FaCheck size={12} /> {t('tables.free')}
                                  </button>
                                </>
                              )}
                              {tableStatus === 'reserved' && (
                                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                  <FaCheck size={12} /> {t('tables.cancelAndFree')}
                                </button>
                              )}
                              {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
                                <>
                                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); handleTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                    <FaCheck size={12} /> {t('tables.free')}
                                  </button>
                                  {canDeleteTable && (
                                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                                      <FaTrash size={12} /> {t('tables.delete')}
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
                {isToday ? t('tables.bookingsToday') : t('tables.bookingsFor') + ' ' + formatDate(selectedDate)}
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
                <FaPlus size={9} /> {t('tables.add')}
              </button>
            </div>
          </div>
          {bookingsForDate.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FaCalendarAlt size={20} color="#d1d5db" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>{t('tables.noBookings')}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{t('tables.noReservationsFor')} {isToday ? t('tables.today').toLowerCase() : formatDate(selectedDate)}</p>
            </div>
          ) : (
            <div>
              {bookingsForDate.map((booking, i) => {
                const bStatus = booking.status || 'confirmed';
                const bColors = {
                  confirmed: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e', label: t('tables.confirmed') },
                  arrived: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6', label: t('tables.arrived') },
                  completed: { bg: '#f8fafc', text: '#475569', dot: '#64748b', label: t('tables.completed') },
                  cancelled: { bg: '#f1f5f9', text: '#64748b', dot: '#9ca3af', label: t('tables.cancelled') },
                  'no-show': { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444', label: t('tables.noShow') },
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
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{booking.customerName || t('tables.guest')}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '8px', backgroundColor: bc.bg, color: bc.text }}>{bc.label}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#6b7280' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUsers size={10} /> {booking.partySize || '?'} {(booking.partySize || 0) !== 1 ? t('tables.guests') : t('tables.guest')}
                        </span>
                        {tableName && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaChair size={10} /> {t('tables.table')} {tableName}
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
                        <button onClick={() => updateBookingStatus(booking.id, 'arrived')} title={t('tables.checkIn')} style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1fae5', backgroundColor: '#f0fdf4',
                          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#059669',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <FaCheck size={9} /> {t('tables.checkIn')}
                        </button>
                        <button onClick={() => cancelBooking(booking.id)} title={t('tables.cancel')} style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                        }}>
                          <FaTimes size={10} />
                        </button>
                      </div>
                    )}
                    {bStatus === 'arrived' && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => updateBookingStatus(booking.id, 'completed')} title={t('tables.done')} style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white',
                          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#475569',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <FaCheck size={9} /> {t('tables.done')}
                        </button>
                        <button onClick={() => updateBookingStatus(booking.id, 'no-show')} title={t('tables.noShow')} style={{
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
      </>
      )}

      {/* ─── DELETE FLOOR CONFIRMATION MODAL ─── */}
      {deleteFloorConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: '20px'
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
                {t('tables.deleteFloor')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                {t('tables.deleteFloorConfirm', { name: deleteFloorConfirm.name })}
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
                {t('tables.cancel')}
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
                {deletingFloor ? t('tables.deleting') : t('tables.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD TABLE MODAL ─── */}
      {showAddModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{t('tables.addTableTitle')}</h3>
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
                  }}>{mode === 'single' ? t('tables.singleTable') : t('tables.bulkAdd')}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {/* Floor selector */}
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.floor')}</label>
              <select value={selectedFloorForTable || ''} onChange={e => setSelectedFloorForTable(e.target.value)} style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none',
              }}>
                <option value="">{t('tables.selectFloor')}</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>

              {addMode === 'single' ? (
                <>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.tableName')}</label>
                  <input value={newTable.name} onChange={e => setNewTable(p => ({ ...p, name: e.target.value }))} placeholder="e.g. T1, VIP 1" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.capacity')}</label>
                  <input type="number" value={newTable.capacity} onChange={e => setNewTable(p => ({ ...p, capacity: e.target.value }))} min={1} max={20} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={addTable} disabled={actionLoading || !newTable.name.trim() || !selectedFloorForTable} style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    background: newTable.name.trim() && selectedFloorForTable && !actionLoading ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0',
                    color: newTable.name.trim() && selectedFloorForTable && !actionLoading ? 'white' : '#9ca3af',
                    opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>{actionLoading ? <><FaSpinner size={14} className="animate-spin" /> {t('tables.adding')}</> : t('tables.addTable')}</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.fromNumber')}</label>
                      <input type="number" value={bulkTableData.fromNumber} onChange={e => setBulkTableData(p => ({ ...p, fromNumber: e.target.value }))} placeholder="1" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.toNumber')}</label>
                      <input type="number" value={bulkTableData.toNumber} onChange={e => setBulkTableData(p => ({ ...p, toNumber: e.target.value }))} placeholder="10" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.seatsPerTable')}</label>
                  <input type="number" value={bulkTableData.capacity} onChange={e => setBulkTableData(p => ({ ...p, capacity: e.target.value }))} min={1} max={20} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  {bulkTableData.fromNumber && bulkTableData.toNumber && parseInt(bulkTableData.toNumber) >= parseInt(bulkTableData.fromNumber) && (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #f1f5f9', marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
                      {t('tables.willCreate')} <strong style={{ color: '#1f2937' }}>{parseInt(bulkTableData.toNumber) - parseInt(bulkTableData.fromNumber) + 1}</strong> {t('tables.tables')} ({bulkTableData.fromNumber} – {bulkTableData.toNumber})
                    </div>
                  )}
                  <button onClick={bulkAddTables} disabled={actionLoading || !bulkTableData.fromNumber || !bulkTableData.toNumber || !selectedFloorForTable} style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    background: bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable && !actionLoading ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0',
                    color: bulkTableData.fromNumber && bulkTableData.toNumber && selectedFloorForTable && !actionLoading ? 'white' : '#9ca3af',
                    opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>{actionLoading ? <><FaSpinner size={14} className="animate-spin" /> {t('tables.creating')}</> : t('tables.createTables')}</button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── ADD/EDIT FLOOR MODAL ─── */}
      {(showAddFloor || showEditFloor) && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowAddFloor(false); setShowEditFloor(false); setFloorModalTab('details'); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{showEditFloor ? t('tables.editFloor') : t('tables.addFloor')}</h3>
                <button onClick={() => { setShowAddFloor(false); setShowEditFloor(false); setFloorModalTab('details'); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={14} color="#6b7280" /></button>
              </div>

              {/* Tabs - only show "Floor Order" tab when editing */}
              {showEditFloor && (
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                  <button onClick={() => setFloorModalTab('details')} style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    backgroundColor: floorModalTab === 'details' ? 'white' : 'transparent',
                    color: floorModalTab === 'details' ? '#1f2937' : '#6b7280',
                    boxShadow: floorModalTab === 'details' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}><FaEdit size={11} style={{ marginRight: '6px' }} />{t('tables.details')}</button>
                  <button onClick={() => setFloorModalTab('order')} style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    backgroundColor: floorModalTab === 'order' ? 'white' : 'transparent',
                    color: floorModalTab === 'order' ? '#1f2937' : '#6b7280',
                    boxShadow: floorModalTab === 'order' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}><FaSortAmountDown size={11} style={{ marginRight: '6px' }} />{t('tables.floorOrder')}</button>
                </div>
              )}

              {/* Details tab */}
              {floorModalTab === 'details' && (<>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.floorName')}</label>
                <input value={newFloor.name} onChange={e => setNewFloor(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ground Floor, Terrace" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.description')}</label>
                <input value={newFloor.description} onChange={e => setNewFloor(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>{t('tables.areaCharge')}</label>
                <select value={newFloor.areaChargeType} onChange={e => setNewFloor(p => ({ ...p, areaChargeType: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '12px', outline: 'none' }}>
                  <option value="none">{t('tables.chargeNone')}</option>
                  <option value="percentage">{t('tables.chargePercentage')}</option>
                  <option value="flat">{t('tables.chargeFlat')}</option>
                </select>
                {newFloor.areaChargeType !== 'none' && (
                  <input type="number" value={newFloor.areaChargeValue} onChange={e => setNewFloor(p => ({ ...p, areaChargeValue: e.target.value }))} placeholder={newFloor.areaChargeType === 'percentage' ? 'e.g. 10' : 'e.g. 50'} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }} />
                )}
                <button onClick={showEditFloor ? editFloor : addFloor} disabled={actionLoading || !newFloor.name.trim()} style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '8px',
                  background: newFloor.name.trim() && !actionLoading ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e2e8f0',
                  color: newFloor.name.trim() && !actionLoading ? 'white' : '#9ca3af',
                  opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>{actionLoading ? <><FaSpinner size={14} className="animate-spin" /> {showEditFloor ? t('tables.updating') : t('tables.adding')}</> : (showEditFloor ? t('tables.updateFloor') : t('tables.addFloor'))}</button>
              </>)}

              {/* Floor Order tab */}
              {floorModalTab === 'order' && (<>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: 0, marginBottom: '16px' }}>{t('tables.floorOrderDesc')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {floorOrderList.map((floor, index) => (
                    <div key={floor.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                      backgroundColor: floor.id === editingFloor?.id ? '#fef2f2' : '#f8fafc',
                      border: floor.id === editingFloor?.id ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', minWidth: '20px' }}>{index + 1}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', flex: 1 }}>{floor.name}</span>
                      <button onClick={() => moveFloorOrder(index, -1)} disabled={index === 0} style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: index === 0 ? 'default' : 'pointer',
                        backgroundColor: index === 0 ? '#f1f5f9' : '#e0f2fe', color: index === 0 ? '#d1d5db' : '#0284c7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><FaArrowUp size={10} /></button>
                      <button onClick={() => moveFloorOrder(index, 1)} disabled={index === floorOrderList.length - 1} style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: index === floorOrderList.length - 1 ? 'default' : 'pointer',
                        backgroundColor: index === floorOrderList.length - 1 ? '#f1f5f9' : '#e0f2fe', color: index === floorOrderList.length - 1 ? '#d1d5db' : '#0284c7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><FaArrowDown size={10} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={saveFloorOrder} disabled={savingFloorOrder} style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                  background: !savingFloorOrder ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e2e8f0',
                  color: !savingFloorOrder ? 'white' : '#9ca3af',
                  opacity: savingFloorOrder ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>{savingFloorOrder ? <><FaSpinner size={14} className="animate-spin" /> {t('tables.saving')}</> : t('tables.saveOrder')}</button>
              </>)}
            </div>
          </div>
        </div>,
        document.body
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

        return createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowBookingForm(false); setBookingStep(1); }}>
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
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{t('tables.reserveTable')}</h3>
                  <p style={{ fontSize: '12px', opacity: 0.8, margin: '2px 0 0' }}>
                    {bookingData.bookingDate && bookingData.bookingTime
                      ? `${formatDate(bookingData.bookingDate)} at ${bookingData.bookingTime}`
                      : t('tables.choosePreferredTime')}
                  </p>
                </div>
              </div>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[
                  { n: 1, label: t('tables.when'), icon: FaClock },
                  { n: 2, label: t('tables.who'), icon: FaUser },
                  { n: 3, label: t('tables.where'), icon: FaChair },
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
                    <FaCalendarAlt size={11} color="#ef4444" /> {t('tables.pickDate')}
                  </label>
                  <input type="date" value={bookingData.bookingDate} onChange={e => setBookingData(p => ({ ...p, bookingDate: e.target.value }))} style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '20px', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaClock size={11} color="#ef4444" /> {t('tables.chooseTime')}
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
                    <FaUser size={11} color="#ef4444" /> {t('tables.guestName')}
                  </label>
                  <input value={bookingData.customerName} onChange={e => setBookingData(p => ({ ...p, customerName: e.target.value }))} placeholder="e.g. Rahul Sharma" style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPhoneAlt size={10} color="#ef4444" /> {t('tables.phone')}
                  </label>
                  <input value={bookingData.customerPhone} onChange={e => setBookingData(p => ({ ...p, customerPhone: e.target.value }))} placeholder="+91 98765 43210" style={{
                    width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '15px',
                    backgroundColor: '#fafbfc', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
                  }} onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUsers size={11} color="#ef4444" /> {t('tables.partySize')}
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

                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>{t('tables.specialRequests')}</label>
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
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{t('tables.pickTable')}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {t('tables.for')} {formatDate(bookingData.bookingDate)} {t('tables.at')} {bookingData.bookingTime}
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
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>{t('tables.timeConflict', { name: selectedTable?.name })}</div>
                        <div style={{ fontSize: '11px', color: '#a16207' }}>
                          {t('tables.bookingAtSameTime', { count: bookingConflicts[selectedTable.id].length })}
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
                            <FaChair size={9} /> {table.capacity} {t('tables.seats').toLowerCase()}
                          </div>
                          {hasConflict && (
                            <div style={{ fontSize: '9px', color: '#d97706', fontWeight: 700, marginTop: '5px', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '6px', display: 'inline-block' }}>
                              {t('tables.sameTime', { count: tblConflicts.length })}
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
        </div>,
        document.body
        );
      })()}

      {/* Action loading overlay */}
      {actionLoading && !showAddModal && !showAddFloor && !showEditFloor && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(2px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaSpinner size={18} className="animate-spin" color="#ef4444" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Updating...</span>
          </div>
        </div>
      )}

      {showQRModal && selectedRestaurant && (
        <TableQRCodesModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          floors={floors}
          restaurant={selectedRestaurant}
        />
      )}

      {/* Shared Billing Modal */}
      <TableBillingModal
        open={billingModalOpen}
        table={billingModalTable}
        onClose={() => { setBillingModalOpen(false); setBillingModalTable(null); }}
        selectedRestaurant={selectedRestaurant}
        restaurantName={selectedRestaurant?.name || ''}
        taxSettings={taxSettings}
        menuItems={menuItems}
        printSettings={printSettings}
        billingSettings={selectedRestaurant?.billingSettings || {}}
        countryCode={selectedRestaurant?.countryCode || 'IN'}
        businessType={selectedRestaurant?.businessType || 'restaurant'}
        onRefreshTables={() => loadFloorsAndTables(selectedRestaurant?.id, true)}
        onOptimisticTableUpdate={(tableId, newStatus) => {
          setFloors(prev => prev.map(floor => ({
            ...floor,
            tables: (floor.tables || []).map(t => {
              if (t.id === tableId) {
                const updated = { ...t, status: newStatus, currentOrderId: null, currentOrderTotal: null };
                if (newStatus === 'available') { updated.customerName = null; updated.startTime = null; }
                return updated;
              }
              return t;
            })
          })));
          setTableStatusesForDate(prev => ({ ...prev, [tableId]: newStatus }));
        }}
      />

      {/* Move Order Modal */}
      {moveModalTable && (
        <MoveOrderModal
          isOpen={!!moveModalTable}
          onClose={() => setMoveModalTable(null)}
          sourceTable={moveModalTable}
          floors={floors}
          restaurantId={selectedRestaurant?.id}
          onMoveComplete={(oldTableId, newTableId) => {
            setFloors(prev => prev.map(floor => ({
              ...floor,
              tables: (floor.tables || []).map(t => {
                if (t.id === oldTableId) return { ...t, status: 'available', currentOrderId: null, currentOrderTotal: null, customerName: null, startTime: null };
                if (t.id === newTableId) return { ...t, status: 'occupied', currentOrderId: moveModalTable.currentOrderId };
                return t;
              })
            })));
            setTableStatusesForDate(prev => ({ ...prev, [oldTableId]: 'available', [newTableId]: 'occupied' }));
            setMoveModalTable(null);
          }}
        />
      )}

      {/* Quick View Order Modal */}
      {quickViewOrder && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setQuickViewOrder(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Table {quickViewOrder.tableName}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Order #{quickViewOrder.orderNumber || quickViewOrder.id?.slice(-6)}</div>
              </div>
              <button onClick={() => setQuickViewOrder(null)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTimes size={12} color="#6b7280" />
              </button>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {(quickViewOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: i < (quickViewOrder.items || []).length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                      <span style={{ color: '#6b7280', marginRight: '4px' }}>{item.quantity || 1}x</span>
                      {item.name}
                    </div>
                    {item.variant && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px', paddingLeft: '20px' }}>{typeof item.variant === 'object' ? item.variant.name : item.variant}</div>}
                    {item.customizations?.length > 0 && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px', paddingLeft: '20px' }}>{item.customizations.map(c => c.name || c).join(', ')}</div>}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', flexShrink: 0, marginLeft: '12px' }}>
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
              {(!quickViewOrder.items || quickViewOrder.items.length === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>No items in this order</div>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {quickViewOrder.subtotal != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                  <span>Subtotal</span><span>{formatCurrency(quickViewOrder.subtotal)}</span>
                </div>
              )}
              {(quickViewOrder.taxes || quickViewOrder.taxBreakdown || []).map((tax, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                  <span>{tax.name || 'Tax'}</span><span>{formatCurrency(tax.amount || 0)}</span>
                </div>
              ))}
              {quickViewOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#059669' }}>
                  <span>Discount</span><span>-{formatCurrency(quickViewOrder.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#111827', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                <span>Total</span><span>{formatCurrency(quickViewOrder.finalAmount || quickViewOrder.total || 0)}</span>
              </div>
            </div>
            <div style={{ padding: '12px 20px 16px', display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                setQuickViewOrder(null);
                const qp = `/dashboard?orderId=${quickViewOrder.id}&mode=edit&from=tables`;
                router.push(typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? `/mobile${qp}` : qp);
              }} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '600',
                background: '#059669', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <FaPlus size={10} /> Add Items
              </button>
              <button onClick={() => setQuickViewOrder(null)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600',
                background: 'white', color: '#6b7280', cursor: 'pointer',
              }}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <NotificationContainer />
    </div>
  );
};

export default TableManagement;
