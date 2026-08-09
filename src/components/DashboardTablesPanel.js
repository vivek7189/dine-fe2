'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { FaEye, FaReceipt, FaTimes, FaMinus, FaChevronUp, FaWindowMaximize, FaChair, FaClock, FaUserFriends, FaUtensils, FaTools, FaBan, FaPrint, FaPlus, FaEllipsisH, FaCreditCard, FaExchangeAlt, FaTrash, FaSpinner, FaTh, FaThLarge, FaLayerGroup } from 'react-icons/fa';
import apiClient from '../lib/api';
import OrderSummary from './OrderSummary';
import TableCard from './TableCard';
import TableFloorPlan from './TableFloorPlan';
import TableBillingModal from './TableBillingModal';
import TableChecksSheet from './TableChecksSheet';
import MoveOrderModal from './MoveOrderModal';
import { t as translate } from '../lib/i18n';
import { useCurrency } from '../contexts/CurrencyContext';
import { buildTokenSlipsDocumentHTML, buildTokenSlipHTML } from '../utils/printFontSizes';
import { generateBillHTML, generateKOTHTML } from '../utils/printHtmlGenerator';
import { printHtmlInHiddenFrame, printDocument, supportsNativeAutoPrint } from '../utils/printBridge';
import { printKOTByStations } from '../utils/printKotStations';
import { seatLabel } from '../utils/orderItemKey';

export default function DashboardTablesPanel({
  floors = [],
  tables = [],
  isRefreshing = false,
  onTakeOrder,
  onViewOrder,
  selectedRestaurant,
  onSliderClose,
  // OrderSummary props
  cart,
  setCart,
  orderType,
  setOrderType,
  paymentMethod,
  setPaymentMethod,
  onClearCart,
  onProcessOrder,
  onSaveOrder,
  onPlaceOrder,
  onRemoveFromCart,
  onAddToCart,
  onUpdateCartItemQuantity,
  onTableNumberChange,
  onCustomerNameChange,
  onCustomerMobileChange,
  processing,
  placingOrder,
  orderSuccess,
  setOrderSuccess,
  error,
  getTotalAmount,
  tableNumber,
  customerName,
  customerMobile,
  orderLookup,
  setOrderLookup,
  currentOrder,
  setCurrentOrder,
  onShowQRCode,
  restaurantName,
  taxSettings,
  menuItems,
  printSettings,
  onRefreshTables, // Callback to refresh tables data after billing
  onOptimisticTableUpdate, // Optimistic table status update (instant UI change)
  recentlyUpdatedTableId, // Table ID that just had an order action (for highlight animation)
  onClearRecentlyUpdated, // Callback to clear the highlight
  upiSettings = {},
  whatsappConnected = false,
  billingSettings = {},
  multiPricingEnabled = false,
  pricingRules = [],
  activePricingRuleId = null,
  setActivePricingRuleId,
  countryCode = 'IN',
  businessType = 'restaurant',
  canDeleteTable = false,
  onDeleteTable,
  posSettings = {},
}) {
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const isMobileEmbed = typeof window !== 'undefined' && !!window.__DINEOPEN_MOBILE_EMBED__;
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderMinimized, setSliderMinimized] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [outOfServiceModal, setOutOfServiceModal] = useState({ open: false, table: null });
  // Timer tick to keep elapsed times updated (every 60s)
  const [, setTick] = useState(0);

  // Billing modal state (shared component)
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingModalTable, setBillingModalTable] = useState(null);

  // Track which tables are currently printing
  const [printingTables, setPrintingTables] = useState({});
  const [printDropdownTable, setPrintDropdownTable] = useState(null);

  // Move order modal
  const [moveModalTable, setMoveModalTable] = useState(null);

  // Quick view modal
  const [quickViewOrder, setQuickViewOrder] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(null); // holds tableId while loading

  // Transient UI state required by the shared <TableCard>. The management
  // dropdown is disabled on the dashboard (showManagementDropdown={false}) so
  // activeDropdown / hoveredTableId are effectively no-ops here, but TableCard
  // still reads/sets them, so we provide harmless local state.
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredTableId, setHoveredTableId] = useState(null);
  const [checksSheet, setChecksSheet] = useState(null); // { table, floorInfo } for the per-party Checks panel
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'floorplan' (live floor map, view-only here)

  // Mobile grid columns: '2' or '3' (only used on isMobileEmbed)
  const [mobileGridCols, setMobileGridCols] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tableGridCols') || '3';
    return '3';
  });

  // Ref for the recently updated table card
  const updatedTableRef = useRef(null);
  // Track pending print feedback timers for cleanup on unmount
  const printTimersRef = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => {
      clearInterval(interval);
      // Clear any pending print feedback timers
      printTimersRef.current.forEach(t => clearTimeout(t));
      printTimersRef.current = [];
    };
  }, []);

  // Close print dropdown on outside click
  useEffect(() => {
    if (!printDropdownTable) return;
    const handler = () => setPrintDropdownTable(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [printDropdownTable]);

  // Auto-clear the recently updated table highlight after a brief flash, and scroll into view
  useEffect(() => {
    if (recentlyUpdatedTableId) {
      // Scroll the highlighted table into view
      if (updatedTableRef.current) {
        updatedTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timeout = setTimeout(() => {
        if (onClearRecentlyUpdated) onClearRecentlyUpdated();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [recentlyUpdatedTableId, onClearRecentlyUpdated]);

  // Sort tables: alphabetic names first (sorted A-Z), then numeric names (sorted 1,2,3...)
  const sortTables = (tablesArr) => {
    return [...tablesArr].sort((a, b) => {
      const nameA = (a.name || a.number || '').toString().trim();
      const nameB = (b.name || b.number || '').toString().trim();
      const numA = Number(nameA);
      const numB = Number(nameB);
      const isNumA = nameA !== '' && !isNaN(numA);
      const isNumB = nameB !== '' && !isNaN(numB);
      // Alphabetic names come before numeric names
      if (!isNumA && !isNumB) return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      if (!isNumA && isNumB) return -1;
      if (isNumA && !isNumB) return 1;
      return numA - numB;
    });
  };

  // Prefer floor.tables if present; fall back to flat tables prop
  const grouped = useMemo(() => {
    let allGroups = [];
    if (Array.isArray(floors) && floors.length > 0 && floors.some(f => Array.isArray(f.tables))) {
      allGroups = floors.map(f => ({ info: { id: f.id, name: f.name || f.floorName || 'Floor' }, tables: sortTables(f.tables || []) }));
    } else {
      // Group flat tables by floor
      const byFloor = {};
      floors.forEach(f => { byFloor[f.id || f.name || 'default'] = { info: { name: f.name || 'Floor' }, tables: [] }; });
      (tables || []).forEach(t => {
        const key = t.floorId || t.floor || t.floorName || 'default';
        if (!byFloor[key]) byFloor[key] = { info: { name: t.floorName || t.floor || 'Floor' }, tables: [] };
        byFloor[key].tables.push(t);
      });
      allGroups = Object.values(byFloor).map(g => ({ ...g, tables: sortTables(g.tables) }));
    }
    // Filter out floors with no tables
    return allGroups.filter(group => group.tables && group.tables.length > 0);
  }, [floors, tables]);

  const handleViewOrderClick = async (orderId, table) => {
    if (sliderOpen && selectedOrder?.id === orderId && !sliderMinimized) {
      handleSliderClose();
      setCurrentOrder(null);
      setCart([]);
      return;
    }

    if (!orderId || !selectedRestaurant?.id) return;

    setLoadingOrder(true);
    setOrderError(null);
    setSliderOpen(true);
    if (sliderMinimized) {
      setSliderMinimized(false);
    }

    try {
      const response = await apiClient.getOrderById(orderId);

      if (response.orders && response.orders.length > 0) {
        const order = response.orders[0];
        setSelectedOrder(order);
        
        const cartItems = (order.items || []).map(item => ({
          id: item.menuItemId || item.id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity || 1,
          selectedVariant: item.selectedVariant,
          selectedCustomizations: item.selectedCustomizations,
          basePrice: item.basePrice || item.price || 0,
          notes: item.notes || '',
          // Seat-level ordering: seat must survive the order→cart round-trip,
          // otherwise editing a running order silently wipes seat assignments
          ...(item.seat != null ? { seat: item.seat } : {}),
          cartId: `${item.menuItemId || item.id}-${Date.now()}-${Math.random()}`
        }));
        
        setCart(cartItems);
        setCurrentOrder(order);
        
        if (order.tableNumber) onTableNumberChange(order.tableNumber);
        if (order.orderType) setOrderType(order.orderType);
        if (order.paymentMethod) setPaymentMethod(order.paymentMethod);
        if (order.customerInfo) {
          if (order.customerInfo.name) onCustomerNameChange(order.customerInfo.name);
          if (order.customerInfo.phone) onCustomerMobileChange(order.customerInfo.phone);
        }
      } else {
        setOrderError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrderError('Failed to load order details');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleTakeOrderGuarded = (table, floorName, floorId) => {
    const status = table.status?.toLowerCase();
    if (status === 'out-of-service') {
      setOutOfServiceModal({ open: true, table, floorName, floorId });
      return;
    }
    if (sliderOpen) handleSliderClose();
    if (onTakeOrder) onTakeOrder(table.name || table.number, { id: table.id, floor: floorName, floorId: floorId || null, capacity: table.capacity });
  };

  const handleQuickView = async (e, table) => {
    e.stopPropagation();
    if (!table.currentOrderId || quickViewLoading) return;
    setQuickViewLoading(table.id);
    try {
      const response = await apiClient.getOrderById(table.currentOrderId);
      const order = response.orders?.[0] || response.order || response;
      setQuickViewOrder({ ...order, tableName: table.name || table.number });
    } catch (err) {
      console.error('Quick view failed:', err);
    } finally {
      setQuickViewLoading(null);
    }
  };

  const closeSlider = () => {
    setSliderOpen(false);
    setSliderMinimized(false);
    setSelectedOrder(null);
    setOrderError(null);
  };

  const handleSliderClose = () => {
    closeSlider();
    if (onSliderClose) {
      onSliderClose();
    }
  };

  const minimizeSlider = () => {
    setSliderMinimized(true);
  };

  const restoreSlider = () => {
    setSliderMinimized(false);
  };

  const openActionsModal = (table) => {
    if (!table.currentOrderId || !selectedRestaurant?.id) return;
    setBillingModalTable(table);
    setBillingModalOpen(true);
  };

  const closeActionsModal = () => {
    setBillingModalOpen(false);
    setBillingModalTable(null);
  };

  // Check if manual print is enabled
  const isManualPrintEnabled = () => {
    return printSettings?.manualPrintEnabled !== false;
  };

  // Smart print function - checks settings and order status
  // If auto-print enabled: send to dine-kot-printer via API
  // If manual print: open browser print window
  const handleSmartPrint = async (table) => {
    if (!table.currentOrderId || !selectedRestaurant?.id) return;

    const tableId = table.id || table.currentOrderId;

    // Set printing state for this table
    setPrintingTables(prev => ({ ...prev, [tableId]: true }));

    // First fetch the order details
    try {
      const response = await apiClient.getOrderById(table.currentOrderId);

      if (!response.orders || response.orders.length === 0) {
        alert('Order not found');
        setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        return;
      }

      const order = response.orders[0];

      // Check if manual print is enabled
      if (isManualPrintEnabled()) {
        // Manual print - open browser print window with bill format
        const invoice = buildInvoiceFromOrder(order);
        const billHtml = generateBillHTML(invoice, printSettings || {});
        openManualPrintWindow(billHtml);
        // Brief delay to show feedback
        printTimersRef.current.push(setTimeout(() => {
          setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        }, 1000));
      } else {
        // Auto print - send to dine-kot-printer via API
        try {
          await apiClient.requestManualPrint(order.id, 'bill');
          console.log('Print command sent to printer');
          // Keep printing state for a moment to show feedback
          printTimersRef.current.push(setTimeout(() => {
            setPrintingTables(prev => ({ ...prev, [tableId]: false }));
          }, 2000));
        } catch (error) {
          console.error('Error sending print command:', error);
          // Fallback to manual print if auto fails
          const invoice = buildInvoiceFromOrder(order);
          const billHtml = generateBillHTML(invoice, printSettings || {});
          openManualPrintWindow(billHtml);
          printTimersRef.current.push(setTimeout(() => {
            setPrintingTables(prev => ({ ...prev, [tableId]: false }));
          }, 1000));
        }
      }
    } catch (error) {
      console.error('Error fetching order for print:', error);
      setPrintingTables(prev => ({ ...prev, [tableId]: false }));
    }
  };

  // Build invoice object for generateBillHTML from order + restaurant data
  const buildInvoiceFromOrder = (order) => {
    const currencySymbol = getCurrencySymbol();
    const items = order.items || [];
    const subtotal = order.totalAmount || order.subtotal || items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    return {
      ...order,
      currencySymbol,
      subtotal,
      grandTotal: order.finalAmount || order.grandTotal || subtotal,
      restaurantName: restaurantName || 'Restaurant',
      restaurantLegalName: selectedRestaurant?.legalBusinessName,
      restaurantAddress: printSettings?.receiptAddress || selectedRestaurant?.address,
      restaurantPhone: printSettings?.receiptPhone || selectedRestaurant?.phone,
      gstin: selectedRestaurant?.gstin,
      fssai: selectedRestaurant?.fssai,
      vatNumber: selectedRestaurant?.vatNumber,
      taxId: selectedRestaurant?.taxId,
      businessRegistrationNumber: selectedRestaurant?.businessRegistrationNumber,
      showGstOnInvoice: selectedRestaurant?.showGstOnInvoice,
      showFssaiOnInvoice: selectedRestaurant?.showFssaiOnInvoice,
      showTaxIdOnInvoice: selectedRestaurant?.showTaxIdOnInvoice,
      countryCode: selectedRestaurant?.countryCode || countryCode,
      taxLabel: selectedRestaurant?.currencySettings?.taxLabel || '',
      customerName: order.customerDisplay?.name || order.customerInfo?.name || order.customerName,
    };
  };

  const handlePrintBill = async (table, { preBill = false } = {}) => {
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
      const invoice = buildInvoiceFromOrder(order);
      // Pre-bill: reuse the exact same bill template; generateBillHTML renders the
      // "*** PRE-BILL ***" banner when isPreBill is set. Final-bill path is unchanged.
      if (preBill) invoice.isPreBill = true;
      const billContent = generateBillHTML(invoice, printSettings || {});

      if (supportsNativeAutoPrint()) {
        await printDocument({ html: billContent, type: 'bill', printSettings: printSettings || {} });
      } else {
        openManualPrintWindow(billContent);
      }
      printFoodCourtTokensForOrder(order);
    } catch (error) {
      console.error('Error printing bill:', error);
    } finally {
      printTimersRef.current.push(setTimeout(() => setPrintingTables(prev => ({ ...prev, [tableId]: false })), 1000));
    }
  };

  // Pre-bill = same print path as the bill, with the PRE-BILL banner (unsettled order).
  const handlePrintPreBill = (table) => handlePrintBill(table, { preBill: true });

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

      // Multi-station (Electron): route by station like the dashboard billing KOT. Returns
      // handled:false for single-printer/non-Electron → falls through to the combined print below.
      const routed = await printKOTByStations({
        restaurantId: selectedRestaurant.id,
        orderId: order.id,
        order,
        restaurantName: restaurantName || selectedRestaurant?.name || '',
        categories: selectedRestaurant?.categories || [],
        printSettings: printSettings || {},
        posSettings,
        t: translate,
        currencySymbol: getCurrencySymbol(),
      });
      if (routed?.handled) {
        printTimersRef.current.push(setTimeout(() => setPrintingTables(prev => ({ ...prev, [tableId]: false })), 1000));
        return;
      }

      // KOT Exclusion: filter out excluded items before printing
      const ps = printSettings || {};
      let kotItems = order.items || [];
      if (ps.kotExclusionEnabled) {
        const excludedCats = new Set(ps.kotExcludedCategories || []);
        const excludedIds = new Set(ps.kotExcludedItemIds || []);
        if (excludedCats.size > 0 || excludedIds.size > 0) {
          kotItems = kotItems.filter(item => {
            if (excludedIds.has(item.id || item.menuItemId)) return false;
            if (excludedCats.has(item.categoryId)) return false;
            return true;
          });
        }
      }
      if (kotItems.length === 0) {
        setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        return; // all items excluded, skip KOT
      }
      const kotData = {
        ...order,
        items: kotItems,
        restaurantName: restaurantName || 'Restaurant',
        orderId: order.id,
        customerName: order.customerDisplay?.name || order.customerInfo?.name || order.customerName,
        covers: order.covers || 1,
      };
      const kotHtml = generateKOTHTML(kotData, printSettings || {});

      if (supportsNativeAutoPrint()) {
        await printDocument({ html: kotHtml, type: 'kot', printSettings: printSettings || {} });
      } else {
        const pw = window.open('', '_blank', 'width=400,height=600');
        if (pw) {
          pw.document.write(kotHtml);
          pw.document.close();
          pw.focus();
          setTimeout(() => pw.print(), 400);
        }
      }
    } catch (error) {
      console.error('Error printing KOT:', error);
    } finally {
      printTimersRef.current.push(setTimeout(() => setPrintingTables(prev => ({ ...prev, [tableId]: false })), 1000));
    }
  };

  const printFoodCourtTokensForOrder = async (order, delay = 1200) => {
    if (!printSettings?.tokenBillingEnabled || !selectedRestaurant?.id || !order?.id) return;

    try {
      const tokenRes = await apiClient.getTokenRender(selectedRestaurant.id, order.id);
      const tokens = tokenRes?.tokens || [];
      if (!tokenRes?.success || tokens.length === 0) return;

      const isNative = supportsNativeAutoPrint();
      const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      if (isNative) {
        // Native (Tauri/Capacitor): print each token as separate job — auto-cut between jobs
        if (delay > 0) await pause(delay);
        for (const token of tokens) {
          const html = buildTokenSlipHTML(token, printSettings);
          await printDocument({ html, type: 'bill', printSettings: printSettings || {} });
          await pause(350);
        }
      } else {
        // Web: combine all tokens with page breaks and print via hidden iframe
        const tokenHtml = buildTokenSlipsDocumentHTML(tokens, printSettings);
        setTimeout(() => {
          printHtmlInHiddenFrame(tokenHtml).catch((err) => {
            console.error('Food court token print failed:', err);
          });
        }, delay);
      }
    } catch (err) {
      console.error('Food court token print error:', err);
    }
  };

  // Open manual print window with bill HTML
  const openManualPrintWindow = (billHtml) => {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
      alert('Please allow popups to print');
      return;
    }

    win.document.write(billHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };


  // Calculate time elapsed since order
  const getTimeElapsed = (createdAt) => {
    if (!createdAt) return '';
    try {
      const now = new Date();
      let created;

      // Handle Firestore timestamp
      if (createdAt._seconds) {
        created = new Date(createdAt._seconds * 1000);
      } else if (createdAt.toDate) {
        created = createdAt.toDate();
      } else if (typeof createdAt === 'string') {
        created = new Date(createdAt);
      } else {
        created = new Date(createdAt);
      }

      if (isNaN(created.getTime())) return '';

      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 0) return 'just now';
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHrs = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;

      if (diffHrs < 24) {
        return remainingMins > 0 ? `${diffHrs}h ${remainingMins}m ago` : `${diffHrs}h ago`;
      }

      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  // Helper to get status configuration
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'occupied':
        return {
          color: '#f59e0b', // Amber-500
          bg: '#fffbeb', // Amber-50
          border: '#fcd34d', // Amber-300
          label: 'Occupied',
          icon: FaUserFriends
        };
      case 'reserved':
        return {
          color: '#3b82f6', // Blue-500
          bg: '#eff6ff', // Blue-50
          border: '#3b82f6', // Blue-500 (Darker border)
          label: 'Reserved',
          icon: FaClock
        };
      case 'cleaning':
        return {
          color: '#6b7280', // Gray-500
          bg: '#f3f4f6', // Gray-100
          border: '#9ca3af', // Gray-400
          label: 'Cleaning',
          icon: FaTools
        };
      case 'out-of-service':
        return {
          color: '#ef4444', // Red-500
          bg: '#fef2f2', // Red-50
          border: '#ef4444', // Red-500
          label: 'Out of Service',
          icon: FaBan
        };
      case 'serving':
        return {
          color: '#8b5cf6', // Violet-500
          bg: '#f5f3ff', // Violet-50
          border: '#8b5cf6', // Violet-500 (Darker border)
          label: 'Serving',
          icon: FaUtensils
        };
      case 'available':
      default:
        return {
          color: '#10b981', // Emerald-500
          bg: '#f0fdf4', // Emerald-50 (Light Green)
          border: '#10b981', // Emerald-500 (Darker border)
          label: 'Available',
          icon: FaChair
        };
    }
  };

  // ── Adapters for the shared <TableCard> ─────────────────────────────
  // TableCard expects getTableStatusInfo(status) → {color,bg,text,border,label,icon}.
  // getStatusConfig returns the same shape minus `text`; add it, and add the
  // `merged` status the /tables statusConfig carries (dashboard live tables
  // rarely have it, but keep parity).
  const getTableStatusInfo = (status) => {
    if (status === 'merged') {
      return { color: '#0ea5e9', bg: '#f0f9ff', text: '#075985', label: 'Merged', icon: FaLayerGroup, border: '#7dd3fc' };
    }
    const cfg = getStatusConfig(status);
    return { ...cfg, text: cfg.color };
  };

  // TableCard's getElapsed(table) → short elapsed string (no "ago"); reads
  // table.lastOrderTime (Firestore ts / _seconds / string / Date all handled).
  const getElapsed = (table) => {
    if (!table?.lastOrderTime) return null;
    const raw = table.lastOrderTime;
    const d = raw?.toDate ? raw.toDate() : raw?._seconds ? new Date(raw._seconds * 1000) : new Date(raw);
    if (isNaN(d.getTime())) return null;
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  // TableCard's getElapsedHours(table) → number of hours since last order.
  const getElapsedHours = (table) => {
    if (!table?.lastOrderTime) return 0;
    const raw = table.lastOrderTime;
    const d = raw?.toDate ? raw.toDate() : raw?._seconds ? new Date(raw._seconds * 1000) : new Date(raw);
    if (isNaN(d.getTime())) return 0;
    return (Date.now() - d.getTime()) / 3600000;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileEmbed ? '12px' : '24px', padding: isMobileEmbed ? '0 10px 20px' : '0 24px 40px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUpBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes tableSpinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes tablePulseOverlay {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.35; }
        }
        .table-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .table-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
        }
        .btn-action {
          transition: all 0.2s;
        }
        .btn-action:active {
          transform: scale(0.98);
        }
        @media (max-width: 620px) {
          .table-actions-modal {
            max-width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-height: 92vh !important;
          }
        }
      `}</style>

      {/* Grid / live Floor-plan view toggle */}
      {grouped.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
            {[{ k: 'grid', I: FaTh, label: 'Grid' }, { k: 'floorplan', I: FaThLarge, label: 'Floor Map' }].map(v => (
              <button key={v.k} onClick={() => setViewMode(v.k)} title={`${v.label} view`} style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
                backgroundColor: viewMode === v.k ? 'white' : 'transparent',
                color: viewMode === v.k ? '#1f2937' : '#9ca3af',
                boxShadow: viewMode === v.k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                <v.I size={11} /> {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {grouped.map((group, idx) => (
        <div key={idx} style={{ background: 'transparent' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobileEmbed ? '8px' : '16px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: isMobileEmbed ? '4px' : '8px'
          }}>
            <div style={{
              fontSize: isMobileEmbed ? '13px' : '16px',
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ 
                width: '4px', 
                height: '20px', 
                background: '#3b82f6', // Blue accent
                borderRadius: '2px',
                display: 'inline-block' 
              }}></span>
              {group.info?.name || `Floor ${idx + 1}`}
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#6b7280',
                marginLeft: '8px',
                background: '#f3f4f6',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                {group.tables?.length || 0} Tables
              </span>
            </div>
            {/* Grid column toggle — mobile only */}
            {isMobileEmbed && (
              <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                <button
                  onClick={() => { setMobileGridCols('2'); localStorage.setItem('tableGridCols', '2'); }}
                  style={{
                    padding: '3px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: mobileGridCols === '2' ? '#3b82f6' : '#f3f4f6',
                    color: mobileGridCols === '2' ? '#fff' : '#6b7280',
                  }}
                  title="2 columns"
                >
                  <FaThLarge size={12} />
                </button>
                <button
                  onClick={() => { setMobileGridCols('3'); localStorage.setItem('tableGridCols', '3'); }}
                  style={{
                    padding: '3px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: mobileGridCols === '3' ? '#3b82f6' : '#f3f4f6',
                    color: mobileGridCols === '3' ? '#fff' : '#6b7280',
                  }}
                  title="3 columns"
                >
                  <FaTh size={12} />
                </button>
              </div>
            )}
          </div>

          {viewMode === 'floorplan' ? (
            <TableFloorPlan
              floor={{ id: group.info?.id, name: group.info?.name, tables: group.tables || [] }}
              editable={false}
              statusInfo={getTableStatusInfo}
              formatCurrency={formatCurrency}
              onTableClick={(tbl) => {
                if (tbl.currentOrderId) {
                  if (sliderOpen) handleSliderClose();
                  router.push(`/dashboard?orderId=${tbl.currentOrderId}&mode=edit&from=tables`);
                } else {
                  handleTakeOrderGuarded(tbl, group.info?.name, group.info?.id);
                }
              }}
            />
          ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileEmbed
              ? `repeat(${mobileGridCols}, 1fr)`
              : 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: isMobileEmbed ? '8px' : '20px',
          }}>
            {(group.tables || []).map((t, tIdx) => {
              // Split sub-tables render inside their parent's compact block (below), and
              // party sub-tables (B/C/…) render as chips under their BASE card (like /tables) —
              // neither should appear as a standalone card here.
              if (t.isSubTable || t.isPartyTable) return null;
              // Split parent → compact POS-style block (matches /tables): header + tight 2-col
              // grid of tiny seat cells. One tap takes an order / opens the running order.
              if (t.isSplit) {
                const subs = (group.tables || []).filter(s => s.isSubTable && s.parentTableId === t.id)
                  .sort((a, b) => (a.subLabel || '').localeCompare(b.subLabel || ''));
                const subTap = (s) => {
                  const st = s.status || 'available';
                  if (st !== 'available' && s.currentOrderId) {
                    if (sliderOpen) handleSliderClose();
                    router.push(`/dashboard?orderId=${s.currentOrderId}&mode=edit&from=tables`);
                  } else {
                    handleTakeOrderGuarded(s, group.info?.name, group.info?.id);
                  }
                };
                return (
                  <div key={t.id || tIdx} style={{
                    // One card slot (like a normal table) — clean, uniform grid.
                    border: '1px solid #e5e7eb', background: '#fff', borderRadius: '12px',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minWidth: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 800, color: '#111827', fontSize: '14px' }}>{t.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '1px 6px', borderRadius: '999px' }}>{translate('tables.split') || 'Split'} · {subs.length}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '8px', flex: 1 }}>
                      {subs.map(s => {
                        const st = s.status || 'available';
                        const info = getTableStatusInfo(st);
                        const occupied = st !== 'available';
                        return (
                          <button key={s.id} onClick={() => subTap(s)} title={`${s.name} · ${info.label}`}
                            style={{
                              cursor: 'pointer', borderRadius: '9px',
                              border: `1.5px solid ${occupied ? info.color : info.border}`,
                              background: occupied ? info.color : info.bg,
                              color: occupied ? '#fff' : info.text,
                              minHeight: '42px', position: 'relative',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '15px', transition: 'all 0.12s',
                            }}>
                            {s.subLabel || s.name}
                            <span style={{ position: 'absolute', top: '5px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: occupied ? '#fff' : info.color }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const isRecentlyUpdated = recentlyUpdatedTableId && t.id === recentlyUpdatedTableId;
              return (
                <div
                  key={t.id || tIdx}
                  ref={isRecentlyUpdated ? updatedTableRef : undefined}
                  style={{ minWidth: 0 }}
                >
                  <TableCard
                    table={t}
                    isToday={true}
                    isMobile={isMobileEmbed}
                    isMobileEmbed={isMobileEmbed}
                    posSettings={posSettings}
                    tblBookings={[]}
                    tableStatus={t.status}
                    canEditTableConfig={false}
                    canEditTable={false}
                    waitersCount={0}
                    showManagementDropdown={false}
                    highlighted={isRecentlyUpdated}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    hoveredTableId={hoveredTableId}
                    setHoveredTableId={setHoveredTableId}
                    printDropdownTable={printDropdownTable}
                    setPrintDropdownTable={setPrintDropdownTable}
                    printingTables={printingTables}
                    quickViewLoading={quickViewLoading}
                    getTableStatusInfo={getTableStatusInfo}
                    getElapsed={getElapsed}
                    getElapsedHours={getElapsedHours}
                    formatCurrency={formatCurrency}
                    t={translate}
                    onTableAction={(action, tbl) => {
                      if (action === 'take-order') {
                        handleTakeOrderGuarded(tbl, group.info?.name, group.info?.id);
                      } else if (action === 'view-order') {
                        // Dashboard "Add items" flow for a running order
                        if (sliderOpen) handleSliderClose();
                        if (tbl.currentOrderId) {
                          router.push(`/dashboard?orderId=${tbl.currentOrderId}&mode=edit&from=tables`);
                        } else {
                          handleTakeOrderGuarded(tbl, group.info?.name, group.info?.id);
                        }
                      } else if (action === 'make-available') {
                        // Cleaning / out-of-service quick action → take order (override modal fires if out-of-service)
                        handleTakeOrderGuarded(tbl, group.info?.name, group.info?.id);
                      }
                      // book-table / out-of-service / cleaning originate only from the
                      // management dropdown, which is disabled on the dashboard.
                    }}
                    onOpenBilling={(tbl) => {
                      if (tbl.currentOrderId) openActionsModal({ ...tbl, floor: group.info?.name, floorId: group.info?.id });
                    }}
                    onQuickView={handleQuickView}
                    onPrintBill={handlePrintBill}
                    onPrintPreBill={handlePrintPreBill}
                    onPrintKOT={handlePrintKOT}
                    onMoveOrder={(tbl) => setMoveModalTable({ ...tbl, floorId: group.info?.id, floorName: group.info?.name || group.name })}
                    onEditTable={() => {}}
                    onDeleteTable={(tbl) => { if (onDeleteTable) onDeleteTable(tbl.id); }}
                    onAssignServer={() => {}}
                    onUnmerge={() => {}}
                    onBookTable={() => {}}
                    // Dynamic parties (Path A) — render B/C/… as chips under this base card and
                    // let the base read "occupied" (yellow) when any party is running.
                    parties={(group.tables || []).filter(s => s.isPartyTable && s.partyOfTableId === t.id).sort((a, b) => (a.partyLabel || '').localeCompare(b.partyLabel || ''))}
                    onAddParty={async (tbl) => {
                      try {
                        const res = await apiClient.addTableParty(selectedRestaurant.id, tbl.id);
                        if (onRefreshTables) await onRefreshTables();
                        const party = res?.party || res?.table;
                        if (party?.id) handleTakeOrderGuarded(party, group.info?.name, group.info?.id);
                      } catch (err) { console.error('Add party failed:', err?.message); }
                    }}
                    onOpenParty={(p) => {
                      if (p?.currentOrderId) {
                        if (sliderOpen) handleSliderClose();
                        router.push(`/dashboard?orderId=${p.currentOrderId}&mode=edit&from=tables`);
                      } else {
                        handleTakeOrderGuarded(p, group.info?.name, group.info?.id);
                      }
                    }}
                    onOpenChecks={(tbl) => setChecksSheet({ table: tbl, floorInfo: group.info })}
                  />
                </div>
              );
            })}
            {(!group.tables || group.tables.length === 0) && (
              <div style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>No tables on this floor.</div>
            )}
          </div>
          )}
        </div>
      ))}
      {grouped.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
          <FaChair size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <div>No floors or tables found.</div>
        </div>
      )}

      {/* Out of Service Override Modal */}
      {outOfServiceModal.open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBan size={18} color="#ef4444" />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Table Out of Service</div>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                  Table {outOfServiceModal.table?.name || outOfServiceModal.table?.number} is marked as out of service. Proceed anyway?
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => setOutOfServiceModal({ open: false, table: null })}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const tbl = outOfServiceModal.table;
                  const flName = outOfServiceModal.floorName;
                  const flId = outOfServiceModal.floorId;
                  setOutOfServiceModal({ open: false, table: null, floorName: null, floorId: null });
                  if (tbl) handleTakeOrderGuarded({ ...tbl, status: 'available' }, flName, flId);
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Billing Modal */}
      <TableBillingModal
        open={billingModalOpen}
        table={billingModalTable}
        onClose={closeActionsModal}
        selectedRestaurant={selectedRestaurant}
        restaurantName={restaurantName}
        taxSettings={taxSettings}
        menuItems={menuItems}
        printSettings={printSettings}
        billingSettings={billingSettings}
        multiPricingEnabled={multiPricingEnabled}
        pricingRules={pricingRules}
        activePricingRuleId={activePricingRuleId}
        setActivePricingRuleId={setActivePricingRuleId}
        countryCode={countryCode}
        businessType={businessType}
        upiSettings={upiSettings}
        whatsappConnected={whatsappConnected}
        onRefreshTables={onRefreshTables}
        onOptimisticTableUpdate={onOptimisticTableUpdate}
      />

      {/* Per-party "Checks" panel — Open / KOT / Bill for each check on the table */}
      {checksSheet?.table && (() => {
        const base = checksSheet.table;
        const info = checksSheet.floorInfo;
        const parties = (floors.flatMap(f => f.tables || [])).filter(x => x.isPartyTable && x.partyOfTableId === base.id).sort((a, b) => (a.partyLabel || '').localeCompare(b.partyLabel || ''));
        const openCheck = (x) => {
          setChecksSheet(null);
          if (x?.currentOrderId) { if (sliderOpen) handleSliderClose(); router.push(`/dashboard?orderId=${x.currentOrderId}&mode=edit&from=tables`); }
          else handleTakeOrderGuarded(x, info?.name, info?.id);
        };
        return (
          <TableChecksSheet
            table={base}
            parties={parties}
            currencySymbol={selectedRestaurant?.currencySymbol || '₹'}
            nextPartyLabel={String.fromCharCode(66 + parties.length)}
            onClose={() => setChecksSheet(null)}
            onOpen={openCheck}
            onKOT={(x) => handlePrintKOT(x)}
            onBill={(x) => { setChecksSheet(null); openActionsModal(x); }}
            onAddParty={async (x) => {
              setChecksSheet(null);
              try {
                const res = await apiClient.addTableParty(selectedRestaurant.id, x.id);
                if (onRefreshTables) await onRefreshTables();
                const party = res?.party || res?.table;
                if (party?.id) handleTakeOrderGuarded(party, info?.name, info?.id);
              } catch (err) { console.error('Add party failed:', err?.message); }
            }}
            onPrintAllKOT={() => { [base, ...parties].forEach(x => { if (x.currentOrderId) handlePrintKOT(x); }); }}
          />
        );
      })()}

      {/* Move Order Modal */}
      {moveModalTable && (
        <MoveOrderModal
          isOpen={!!moveModalTable}
          onClose={() => setMoveModalTable(null)}
          sourceTable={moveModalTable}
          floors={floors}
          restaurantId={selectedRestaurant?.id}
          onMoveComplete={(oldTableId, newTableId) => {
            if (onOptimisticTableUpdate) {
              onOptimisticTableUpdate(oldTableId, 'available');
              onOptimisticTableUpdate(newTableId, 'occupied');
            }
            if (onRefreshTables) setTimeout(onRefreshTables, 500);
            setMoveModalTable(null);
          }}
        />
      )}

      {/* Order Summary Slider */}
      {sliderOpen && (
        <div
          style={{
            position: 'fixed',
            top: sliderMinimized ? 'auto' : 0,
            bottom: sliderMinimized ? 0 : 'auto',
            right: 0,
            width: sliderMinimized ? '300px' : '600px',
            maxWidth: sliderMinimized ? '90vw' : '90vw',
            height: sliderMinimized ? '60px' : '100vh',
            background: '#ffffff',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
            zIndex: 10002,
            display: 'flex',
            flexDirection: 'column',
            animation: sliderMinimized ? 'slideUpBottom 0.3s ease' : 'slideInRight 0.3s ease',
            overflow: 'hidden',
            borderRadius: sliderMinimized ? '12px 12px 0 0' : '0',
            cursor: sliderMinimized ? 'default' : 'default'
          }}
        >
            {/* Header */}
            <div style={{
              padding: sliderMinimized ? '8px 12px' : '16px 24px',
              borderBottom: sliderMinimized ? 'none' : '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              flexShrink: 0,
              height: sliderMinimized ? '100%' : 'auto',
              minHeight: sliderMinimized ? '60px' : 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (sliderMinimized) {
                restoreSlider();
              }
            }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: sliderMinimized ? '14px' : '18px', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>
                  {sliderMinimized ? 'Order Details' : 'Order Details'}
                </h3>
                {selectedOrder && !sliderMinimized && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                      #{selectedOrder.orderNumber || selectedOrder.id}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                      {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'No Table'}
                    </span>
                  </div>
                )}
                {selectedOrder && sliderMinimized && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280', lineHeight: '1.2' }}>
                    #{selectedOrder.orderNumber || selectedOrder.id} • {cart?.length || 0} items • {formatCurrency(getTotalAmount ? getTotalAmount() : 0)}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {sliderMinimized ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreSlider();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    title="Maximize"
                  >
                    <FaWindowMaximize size={14} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeSlider();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    title="Minimize"
                  >
                    <FaMinus size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSliderClose();
                  }}
                  className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                  title="Close"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Content - OrderSummary Component */}
            {!sliderMinimized && (
              <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#f9fafb'
              }}
              onClick={(e) => e.stopPropagation()}
              >
                {loadingOrder ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: '12px' }}>
                    <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Loading order details...</div>
                  </div>
                ) : orderError ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444', gap: '12px' }}>
                    <FaTimes size={32} style={{ opacity: 0.5 }} />
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{orderError}</div>
                  </div>
                ) : selectedOrder ? (
                  <OrderSummary
                    cart={cart}
                    setCart={setCart}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onClearCart={onClearCart}
                    onProcessOrder={onProcessOrder}
                    onSaveOrder={onSaveOrder}
                    onPlaceOrder={onPlaceOrder}
                    onRemoveFromCart={onRemoveFromCart}
                    onAddToCart={onAddToCart}
                    onUpdateCartItemQuantity={onUpdateCartItemQuantity}
                    onTableNumberChange={onTableNumberChange}
                    onCustomerNameChange={onCustomerNameChange}
                    onCustomerMobileChange={onCustomerMobileChange}
                    processing={processing}
                    placingOrder={placingOrder}
                    orderSuccess={orderSuccess}
                    setOrderSuccess={setOrderSuccess}
                    error={error}
                    getTotalAmount={getTotalAmount}
                    tableNumber={tableNumber}
                    customerName={customerName}
                    customerMobile={customerMobile}
                    orderLookup={orderLookup}
                    setOrderLookup={setOrderLookup}
                    currentOrder={currentOrder}
                    setCurrentOrder={setCurrentOrder}
                    onShowQRCode={onShowQRCode}
                    restaurantId={selectedRestaurant?.id}
                    restaurantName={restaurantName}
                    taxSettings={taxSettings}
                    menuItems={menuItems}
                    onClose={handleSliderClose}
                    upiSettings={upiSettings}
                    whatsappConnected={whatsappConnected}
                  />
                ) : null}
              </div>
            )}
          </div>
      )}
      {/* Quick View Order Modal */}
      {quickViewOrder && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setQuickViewOrder(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Table {quickViewOrder.tableName}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Order #{quickViewOrder.orderNumber || quickViewOrder.id?.slice(-6)}</div>
                {/* Seat chips — distinct seats present on this order (seat-level ordering) */}
                {(quickViewOrder.items || []).some(it => it.seat != null) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {[...new Set((quickViewOrder.items || []).filter(it => it.seat != null).map(it => it.seat))]
                      .sort((a, b) => a - b)
                      .map(s => (
                        <span key={s} style={{ fontSize: '10px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: '999px' }}>
                          {seatLabel(s, quickViewOrder.tableNumber ?? quickViewOrder.tableName)}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <button onClick={() => setQuickViewOrder(null)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTimes size={12} color="#6b7280" />
              </button>
            </div>
            {/* Items */}
            <div style={{ padding: '12px 20px' }}>
              {(quickViewOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: i < (quickViewOrder.items || []).length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                      <span style={{ color: '#6b7280', marginRight: '4px' }}>{item.quantity || 1}x</span>
                      {item.name}
                      {item.seat != null && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', verticalAlign: 'middle' }}>
                          {seatLabel(item.seat)}
                        </span>
                      )}
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
            {/* Totals */}
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
            {/* Actions */}
            <div style={{ padding: '12px 20px 16px', display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                setQuickViewOrder(null);
                router.push(`/dashboard?orderId=${quickViewOrder.id}&mode=edit&from=tables`);
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
    </div>
  );
}
