'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaReceipt, FaTimes, FaMinus, FaChevronUp, FaWindowMaximize, FaChair, FaClock, FaUserFriends, FaUtensils, FaTools, FaBan } from 'react-icons/fa';
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
  menuItems
}) {
  const router = useRouter();
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderMinimized, setSliderMinimized] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [outOfServiceModal, setOutOfServiceModal] = useState({ open: false, table: null });

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

                    {/* Content - Just Center Icon now, removed order details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%', 
                          opacity: 0.1 
                        }}>
                          <StatusIcon size={32} color={config.color} />
                        </div>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (t.currentOrderId) handleViewOrderClick(t.currentOrderId, t);
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
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
                            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                          >
                            <FaEye size={10} />
                            View
                          </button>
                          <button
                            className="btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sliderOpen) handleSliderClose();
                              if (t.currentOrderId) {
                                router.push(`/dashboard?orderId=${t.currentOrderId}&mode=edit`);
                              } else {
                                handleTakeOrderGuarded(t);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#dbeafe'}
                            onMouseLeave={(e) => e.target.style.background = '#eff6ff'}
                          >
                            <FaReceipt size={10} />
                            {t.currentOrderId ? 'Add' : 'Take Order'}
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