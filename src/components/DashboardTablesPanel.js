'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaReceipt, FaTimes, FaMinus, FaChevronUp, FaWindowMaximize, FaChair, FaClock, FaUserFriends, FaUtensils, FaTools, FaBan, FaPrint, FaPlus, FaEllipsisH, FaCreditCard, FaExchangeAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';
import OrderSummary from './OrderSummary';

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
  printSettings
}) {
  const router = useRouter();
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderMinimized, setSliderMinimized] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [outOfServiceModal, setOutOfServiceModal] = useState({ open: false, table: null });

  // Table Actions Modal state
  const [actionsModal, setActionsModal] = useState({ open: false, table: null, order: null, loading: false });

  // Modal cart state (separate from main cart)
  const [modalCart, setModalCart] = useState([]);
  const [modalPaymentMethod, setModalPaymentMethod] = useState('cash');
  const [modalProcessing, setModalProcessing] = useState(false);

  // Track which tables are currently printing
  const [printingTables, setPrintingTables] = useState({});

  // Prefer floor.tables if present; fall back to flat tables prop
  const grouped = useMemo(() => {
    let allGroups = [];
    if (Array.isArray(floors) && floors.length > 0 && floors.some(f => Array.isArray(f.tables))) {
      allGroups = floors.map(f => ({ info: { id: f.id, name: f.name || f.floorName || 'Floor' }, tables: f.tables || [] }));
    } else {
      // Group flat tables by floor
      const byFloor = {};
      floors.forEach(f => { byFloor[f.id || f.name || 'default'] = { info: { name: f.name || 'Floor' }, tables: [] }; });
      (tables || []).forEach(t => {
        const key = t.floorId || t.floor || t.floorName || 'default';
        if (!byFloor[key]) byFloor[key] = { info: { name: t.floorName || t.floor || 'Floor' }, tables: [] };
        byFloor[key].tables.push(t);
      });
      allGroups = Object.values(byFloor);
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
      const response = await apiClient.getOrders(selectedRestaurant.id, {
        search: orderId,
        limit: 1
      });

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

  const handleTakeOrderGuarded = (table) => {
    const status = table.status?.toLowerCase();
    if (status === 'out-of-service') {
      setOutOfServiceModal({ open: true, table });
      return;
    }
    if (sliderOpen) handleSliderClose();
    if (onTakeOrder) onTakeOrder(table.name || table.number);
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

  // Open table actions modal and fetch order details
  const openActionsModal = async (table) => {
    if (!table.currentOrderId || !selectedRestaurant?.id) return;

    setActionsModal({ open: true, table, order: null, loading: true });
    setModalCart([]);
    setModalPaymentMethod('cash');

    try {
      const response = await apiClient.getOrders(selectedRestaurant.id, {
        search: table.currentOrderId,
        limit: 1
      });

      if (response.orders && response.orders.length > 0) {
        const order = response.orders[0];
        setActionsModal(prev => ({ ...prev, order, loading: false }));

        // Populate modal cart with order items
        const cartItems = (order.items || []).map(item => ({
          id: item.menuItemId || item.id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity || 1,
          selectedVariant: item.selectedVariant,
          selectedCustomizations: item.selectedCustomizations,
          basePrice: item.basePrice || item.price || 0,
          cartId: `${item.menuItemId || item.id}-${Date.now()}-${Math.random()}`
        }));
        setModalCart(cartItems);
        setModalPaymentMethod(order.paymentMethod || 'cash');
      } else {
        setActionsModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching order for modal:', error);
      setActionsModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeActionsModal = () => {
    setActionsModal({ open: false, table: null, order: null, loading: false });
    setModalCart([]);
    setModalProcessing(false);
  };

  // Get total amount for modal cart
  const getModalTotalAmount = () => {
    return modalCart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Handle billing process from modal OrderSummary
  const handleModalProcessOrder = async () => {
    if (!actionsModal.order || !selectedRestaurant?.id || modalProcessing) return;

    setModalProcessing(true);
    const order = actionsModal.order;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      // Update order to completed status with payment
      const updateData = {
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: modalPaymentMethod,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter'
        }
      };

      await apiClient.updateOrder(order.id, updateData);

      // Process payment
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: modalPaymentMethod,
        amount: order.finalAmount || order.totalAmount || 0,
        userId: currentUser.id,
        restaurantId: selectedRestaurant.id,
        paymentStatus: 'completed'
      });

      // Send print command if auto-print is enabled
      if (!isManualPrintEnabled()) {
        try {
          await apiClient.requestManualPrint(order.id, 'bill');
        } catch (printError) {
          console.error('Auto-print failed:', printError);
        }
      } else {
        // Manual print - open print window
        openManualPrintWindow(order, actionsModal.table);
      }

      // Close modal and refresh
      closeActionsModal();
      alert('Billing completed successfully!');

      // Trigger refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshTables'));
      }
    } catch (error) {
      console.error('Billing error:', error);
      alert('Billing failed: ' + (error.message || 'Unknown error'));
    } finally {
      setModalProcessing(false);
    }
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
      const response = await apiClient.getOrders(selectedRestaurant.id, {
        search: table.currentOrderId,
        limit: 1
      });

      if (!response.orders || response.orders.length === 0) {
        alert('Order not found');
        setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        return;
      }

      const order = response.orders[0];

      // Check if manual print is enabled
      if (isManualPrintEnabled()) {
        // Manual print - open browser print window with bill format
        openManualPrintWindow(order, table);
        // Brief delay to show feedback
        setTimeout(() => {
          setPrintingTables(prev => ({ ...prev, [tableId]: false }));
        }, 1000);
      } else {
        // Auto print - send to dine-kot-printer via API
        try {
          await apiClient.requestManualPrint(order.id, 'bill');
          console.log('Print command sent to printer');
          // Keep printing state for a moment to show feedback
          setTimeout(() => {
            setPrintingTables(prev => ({ ...prev, [tableId]: false }));
          }, 2000);
        } catch (error) {
          console.error('Error sending print command:', error);
          // Fallback to manual print if auto fails
          openManualPrintWindow(order, table);
          setTimeout(() => {
            setPrintingTables(prev => ({ ...prev, [tableId]: false }));
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching order for print:', error);
      setPrintingTables(prev => ({ ...prev, [tableId]: false }));
    }
  };

  // Open manual print window with bill in standard format
  const openManualPrintWindow = (order, table) => {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
      alert('Please allow popups to print');
      return;
    }

    const items = order.items || [];
    const subtotal = order.totalAmount || items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const taxBreakdown = order.taxBreakdown || [];
    const taxTotal = taxBreakdown.reduce((sum, tax) => sum + (tax.amount || 0), 0);
    const total = order.finalAmount || (subtotal + taxTotal);

    const itemsHtml = items.map(item =>
      `<tr>
        <td style="text-align:left;padding:2px 4px;">${(item.name || '').replace(/</g, '&lt;')}</td>
        <td style="text-align:center;padding:2px 4px;">${item.quantity || 1}</td>
        <td style="text-align:right;padding:2px 4px;">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>`
    ).join('');

    const taxHtml = taxBreakdown.map(tax =>
      `<tr>
        <td colspan="2" style="text-align:left;padding:2px 4px;">${tax.name} (${tax.rate}%)</td>
        <td style="text-align:right;padding:2px 4px;">₹${(tax.amount || 0).toFixed(2)}</td>
      </tr>`
    ).join('');

    const billContent = `<!DOCTYPE html>
<html>
<head>
  <title>Bill #${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body { font-family: 'Courier New', Courier, monospace; margin: 16px; font-size: 12px; line-height: 1.4; max-width: 80mm; }
    .bill-header { text-align: center; margin-bottom: 8px; }
    .restaurant-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
    .bill-title { font-size: 14px; font-weight: bold; margin-top: 4px; }
    .divider { text-align: center; margin: 6px 0; }
    .bill-info { margin: 8px 0; font-size: 11px; }
    .bill-info div { display: flex; justify-content: space-between; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th { text-align: left; border-bottom: 1px dashed #000; padding: 4px; font-size: 11px; }
    td { font-size: 11px; }
    .total-section { border-top: 1px dashed #000; margin-top: 8px; padding-top: 4px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 4px; }
    .bill-footer { margin-top: 12px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="bill-header">
    <div class="restaurant-name">${(restaurantName || 'Restaurant').replace(/</g, '&lt;')}</div>
    <div class="bill-title">--- BILL / INVOICE ---</div>
  </div>
  <div class="divider">--------------------------------</div>
  <div class="bill-info">
    <div><span>Bill#:</span><span><strong>${order.dailyOrderId || order.id?.slice(-6) || 'N/A'}</strong></span></div>
    <div><span>Date:</span><span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
    ${order.tableNumber || table?.name ? `<div><span>Table:</span><span>${order.tableNumber || table?.name || table?.number}</span></div>` : ''}
    ${order.customerInfo?.name ? `<div><span>Customer:</span><span>${(order.customerInfo.name || '').replace(/</g, '&lt;')}</span></div>` : ''}
    <div><span>Payment:</span><span>${(order.paymentMethod || 'CASH').toUpperCase()}</span></div>
  </div>
  <div class="divider">--------------------------------</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Amt</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="total-section">
    <div class="bill-info">
      <div><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
    </div>
    ${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}
    <div class="total-row">
      <span>TOTAL:</span>
      <span>₹${total.toFixed(2)}</span>
    </div>
  </div>
  <div class="divider">================================</div>
  <div class="bill-footer">
    <p>Thank you for dining with us!</p>
    <p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p>
  </div>
</body>
</html>`;

    win.document.write(billContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  // State for billing processing
  const [billingInProgress, setBillingInProgress] = useState(false);

  // Handle Pay/Billing from modal - process billing directly
  const handlePayFromModal = async () => {
    if (!actionsModal.order || !selectedRestaurant?.id || billingInProgress) return;

    setBillingInProgress(true);
    const order = actionsModal.order;

    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      // Update order to completed status with payment
      const updateData = {
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: order.paymentMethod || 'cash',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter'
        }
      };

      await apiClient.updateOrder(order.id, updateData);

      // Process payment
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: order.paymentMethod || 'cash',
        amount: order.finalAmount || order.totalAmount || 0,
        userId: currentUser.id,
        restaurantId: selectedRestaurant.id,
        paymentStatus: 'completed'
      });

      // Send print command if auto-print is enabled
      if (!isManualPrintEnabled()) {
        try {
          await apiClient.requestManualPrint(order.id, 'bill');
        } catch (printError) {
          console.error('Auto-print failed:', printError);
        }
      } else {
        // Manual print - open print window
        openManualPrintWindow(order, actionsModal.table);
      }

      // Close modal and refresh tables
      closeActionsModal();

      // Show notification (if parent has setNotification)
      alert('Billing completed successfully!');

      // Refresh tables data by triggering a re-render
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshTables'));
      }

    } catch (error) {
      console.error('Billing error:', error);
      alert('Billing failed: ' + (error.message || 'Unknown error'));
    } finally {
      setBillingInProgress(false);
    }
  };

  // Handle Add Items from modal
  const handleAddItemsFromModal = () => {
    if (!actionsModal.order) return;
    closeActionsModal();
    router.push(`/dashboard?orderId=${actionsModal.order.id}&mode=edit&from=tables`);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 24px 40px', maxWidth: '100%', boxSizing: 'border-box' }}>
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
        @media (max-width: 560px) {
          .table-actions-modal {
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-height: 90vh !important;
          }
        }
      `}</style>

      {grouped.map((group, idx) => (
        <div key={idx} style={{ background: 'transparent' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            <div style={{
              fontSize: '16px', 
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
            {isRefreshing && (
              <div style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full"></div>
                Refreshing...
            </div>
          )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '20px',
          }}>
            {(group.tables || []).map((t, tIdx) => {
              const status = t.status || 'available';
              const config = getStatusConfig(status);
              const StatusIcon = config.icon;
              const isOccupied = status === 'occupied';
              const isAvailable = status === 'available';
              const isReserved = status === 'reserved';
              const isCleaning = status === 'cleaning';
              const isOutOfService = status === 'out-of-service';

              return (
                <div 
                  key={t.id || tIdx}
                  className="table-card"
                  style={{
                    background: config.bg, // Light background color based on status
                    borderRadius: '12px',
                    // No border for occupied (only animated dotted border), full 1px border with darker color for others
                    border: isOccupied ? 'none' : `1px solid ${config.border}`,
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '120px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* Animated Dotted Border for Occupied */}
                  {isOccupied && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="calc(100% - 3px)"
                        height="calc(100% - 3px)"
                        rx="10.5"
                        ry="10.5"
                        fill="none"
                        stroke={config.color}
                        strokeWidth="2"
                        strokeDasharray="6,6"
                        strokeDashoffset="100"
                      >
                         <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                      </rect>
                    </svg>
                  )}

                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                          {t.name || t.number}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaChair size={9} />
                          {t.capacity || '-'} Seats
                    </div>
                  </div>
                      {/* Small Status Dot for Available, Badge for others */}
                      {isAvailable ? (
                         <div style={{ 
                           width: '8px', 
                           height: '8px', 
                           borderRadius: '50%', 
                           background: '#10b981',
                           boxShadow: '0 0 0 2px #d1fae5'
                         }} title="Available" />
                      ) : (
                        <div style={{
                          background: config.bg,
                          color: config.color,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          border: `1px solid ${config.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {config.label}
                        </div>
                      )}
                    </div>

                    {/* Content - Show order total for occupied tables, icon for others */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {isOccupied && t.currentOrderTotal ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%'
                        }}>
                          <div style={{
                            fontSize: '10px',
                            color: '#92400e',
                            fontWeight: 500,
                            marginBottom: '2px'
                          }}>
                            Order Total
                          </div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: '#b45309',
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            border: '1px solid #fcd34d'
                          }}>
                            ₹{typeof t.currentOrderTotal === 'number' ? t.currentOrderTotal.toFixed(0) : t.currentOrderTotal}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          opacity: 0.1
                        }}>
                          <StatusIcon size={32} color={config.color} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '8px' }}>
                      {isAvailable ? (
                        <button
                          className="btn-action"
                          onClick={() => handleTakeOrderGuarded(t)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#047857';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#059669';
                          }}
                        >
                          <FaReceipt size={10} />
                          Take Order
                        </button>
                      ) : isOutOfService ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-action"
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            disabled
                          >
                            <FaBan size={10} />
                            Out of Service
                          </button>
                          <button
                            className="btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTakeOrderGuarded(t);
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: '#ffffff',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                            onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                          >
                            <FaReceipt size={10} />
                            Override
                          </button>
                        </div>
                      ) : (
                        /* Occupied/Reserved/Cleaning tables - Show Print, Add, More buttons */
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {/* Print Button - Smart print (auto or manual based on settings) */}
                          {(() => {
                            const tableId = t.id || t.currentOrderId;
                            const isPrinting = printingTables[tableId];
                            return (
                              <button
                                className="btn-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (t.currentOrderId && !isPrinting) handleSmartPrint(t);
                                }}
                                disabled={isPrinting}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  padding: 0,
                                  background: isPrinting
                                    ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                                    : '#ffffff',
                                  color: isPrinting ? '#3b82f6' : '#6b7280',
                                  border: isPrinting ? '1px solid #93c5fd' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: isPrinting ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'visible',
                                  opacity: isPrinting ? 0.85 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isPrinting) {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.color = '#374151';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isPrinting) {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.color = '#6b7280';
                                  }
                                }}
                                title={isPrinting ? 'Printing...' : 'Print Bill'}
                              >
                                {isPrinting ? (
                                  <FaSpinner size={11} className="animate-spin" />
                                ) : (
                                  <FaPrint size={11} />
                                )}
                                {/* Small loading indicator badge on top-right */}
                                {isPrinting && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '12px',
                                    height: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                                    animation: 'pulse 1s infinite'
                                  }}>
                                    <div style={{
                                      width: '4px',
                                      height: '4px',
                                      background: '#ffffff',
                                      borderRadius: '50%'
                                    }} />
                                  </div>
                                )}
                              </button>
                            );
                          })()}
                          {/* Add Items Button - Gray style */}
                          <button
                            className="btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sliderOpen) handleSliderClose();
                              if (t.currentOrderId) {
                                router.push(`/dashboard?orderId=${t.currentOrderId}&mode=edit&from=tables`);
                              } else {
                                handleTakeOrderGuarded(t);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              background: '#ffffff',
                              color: '#4b5563',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                          >
                            <FaPlus size={9} />
                            Add
                          </button>
                          {/* More Actions Button */}
                          <button
                            className="btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (t.currentOrderId) openActionsModal(t);
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: 0,
                              background: '#ffffff',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                            title="More Actions"
                          >
                            <FaEllipsisH size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {(!group.tables || group.tables.length === 0) && (
              <div style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>No tables on this floor.</div>
            )}
          </div>
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
          zIndex: 9999
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
                  setOutOfServiceModal({ open: false, table: null });
                  if (tbl) handleTakeOrderGuarded({ ...tbl, status: 'available' });
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

      {/* Table Actions Modal - Uses OrderSummary in billing mode */}
      {actionsModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
          onClick={closeActionsModal}
        >
          <div
            className="table-actions-modal"
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
              animation: 'modalFadeIn 0.25s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {/* Decorative circle */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '-20px',
                width: '50px',
                height: '50px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                  Bill Summary
                </div>
                <div style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.5px'
                }}>
                  Table {actionsModal.table?.name || actionsModal.table?.number}
                </div>
                {actionsModal.order && (
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}>
                      Order #{actionsModal.order.dailyOrderId || actionsModal.order.id?.slice(-6)}
                    </span>
                    <span style={{ opacity: 0.6 }}>•</span>
                    <span style={{ fontSize: '12px' }}>{getTimeElapsed(actionsModal.order.createdAt)}</span>
                    {actionsModal.order.customerInfo?.name && (
                      <>
                        <span style={{ opacity: 0.6 }}>•</span>
                        <span style={{ fontSize: '12px' }}>{actionsModal.order.customerInfo.name}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={closeActionsModal}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Content */}
            {actionsModal.loading ? (
              <div style={{
                padding: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
                }}>
                  <FaSpinner className="animate-spin" size={24} style={{ color: '#dc2626' }} />
                </div>
                <div style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>Loading order details...</div>
              </div>
            ) : actionsModal.order ? (
              <>
                {/* Scrollable content area */}
                <div style={{ maxHeight: 'calc(92vh - 280px)', overflowY: 'auto' }}>
                  {/* Order Items */}
                  <div style={{ padding: '20px 28px 16px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#dc2626',
                      marginBottom: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          borderRadius: '50%'
                        }} />
                        Order Items
                      </div>
                      <span style={{ color: '#6b7280', fontWeight: 600 }}>{actionsModal.order.items?.length || 0} items</span>
                    </div>

                    {/* Items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(actionsModal.order.items || []).map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          background: '#f9fafb',
                          borderRadius: '12px',
                          border: '1px solid #f3f4f6'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                              {item.name}
                            </div>
                            {item.selectedVariant && (
                              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{item.selectedVariant.name}</div>
                            )}
                            {item.selectedCustomizations?.length > 0 && (
                              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                                + {item.selectedCustomizations.map(c => c.name).join(', ')}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                              background: '#fff',
                              color: '#374151',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 600,
                              border: '1px solid #e5e7eb'
                            }}>
                              ×{item.quantity || 1}
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', minWidth: '70px', textAlign: 'right' }}>
                              ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bill Summary Card */}
                  <div style={{ padding: '0 28px 20px' }}>
                    <div style={{
                      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}>
                      {/* Summary Header */}
                      <div style={{
                        padding: '14px 18px',
                        background: '#ffffff',
                        borderBottom: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaReceipt size={14} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Bill Summary
                        </span>
                      </div>

                      {/* Summary Details */}
                      <div style={{ padding: '16px 18px' }}>
                        {/* Subtotal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '14px', color: '#64748b' }}>Subtotal</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                            ₹{(actionsModal.order.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Discount if any */}
                        {actionsModal.order.discountAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px', color: '#16a34a' }}>Discount</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                              - ₹{(actionsModal.order.discountAmount || 0).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Tax Breakdown */}
                        {actionsModal.order.taxBreakdown && actionsModal.order.taxBreakdown.length > 0 && (
                          <div style={{
                            background: '#ffffff',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Tax Details
                            </div>
                            {actionsModal.order.taxBreakdown.map((tax, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx < actionsModal.order.taxBreakdown.length - 1 ? '6px' : 0 }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>
                                  {tax.name} <span style={{ color: '#94a3b8' }}>({tax.rate}%)</span>
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                  ₹{(tax.amount || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total Tax if no breakdown */}
                        {(!actionsModal.order.taxBreakdown || actionsModal.order.taxBreakdown.length === 0) && actionsModal.order.taxAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Tax</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                              ₹{(actionsModal.order.taxAmount || 0).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '14px 0' }} />

                        {/* Grand Total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Grand Total</span>
                          <span style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                            ₹{(actionsModal.order.finalAmount || actionsModal.order.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Payment Method */}
                        <div style={{
                          marginTop: '14px',
                          padding: '10px 14px',
                          background: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>Payment Method</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                            {actionsModal.order.paymentMethod || 'Cash'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div style={{
                  padding: '20px 28px',
                  background: '#ffffff',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={handleAddItemsFromModal}
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
                      transition: 'all 0.2s',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.35)';
                    }}
                  >
                    <FaPlus size={14} />
                    Add Items
                  </button>
                  <button
                    onClick={handlePayFromModal}
                    disabled={billingInProgress}
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      background: billingInProgress
                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: billingInProgress ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: billingInProgress
                        ? '0 4px 16px rgba(107, 114, 128, 0.35)'
                        : '0 4px 16px rgba(220, 38, 38, 0.35)',
                      transition: 'all 0.2s',
                      transform: 'translateY(0)',
                      opacity: billingInProgress ? 0.85 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!billingInProgress) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.45)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!billingInProgress) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.35)';
                      }
                    }}
                  >
                    {billingInProgress ? (
                      <>
                        <FaSpinner className="animate-spin" size={14} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard size={14} />
                        Complete Billing
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary Actions */}
                <div style={{
                  padding: '12px 28px 20px',
                  background: '#fafafa',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px'
                }}>
                  <button
                    onClick={() => {
                      if (actionsModal.order) handleSmartPrint(actionsModal.table);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <FaPrint size={12} />
                    Print Bill
                  </button>
                  <button
                    onClick={() => {
                      closeActionsModal();
                      alert('Transfer table feature coming soon!');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <FaExchangeAlt size={12} />
                    Transfer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        closeActionsModal();
                        alert('Cancel order feature - please use Order History page');
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    <FaTrash size={11} />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <FaReceipt size={28} style={{ color: '#9ca3af' }} />
                </div>
                <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>No order found for this table</div>
              </div>
            )}
          </div>
        </div>
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
            zIndex: 9999,
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
                    #{selectedOrder.orderNumber || selectedOrder.id} • {cart?.length || 0} items • ₹{getTotalAmount ? getTotalAmount().toFixed(2) : '0.00'}
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
                  />
                ) : null}
              </div>
            )}
          </div>
      )}
    </div>
  );
}