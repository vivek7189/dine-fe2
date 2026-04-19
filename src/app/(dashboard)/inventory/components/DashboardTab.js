'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaPlus, FaBoxes, FaExclamationTriangle, FaChartLine,
  FaWarehouse, FaBolt, FaArrowRight, FaClipboardList, FaTrash, FaTimes, FaClock
} from 'react-icons/fa';

export default function DashboardTab({
  inventoryItems, dashboardStats, suppliers, purchaseOrders,
  isMobile, formatCurrency,
  setShowAddModal, setShowQuickStockModal, setActiveTab,
  getStatusColor, onLogWaste,
  permissions = { read: true, add: true, update: true, delete: true },
}) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const lowStockItems = inventoryItems.filter(
    item => item.currentStock <= item.minStock
  );

  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntil = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 7 && daysUntil > 0;
  });

  const expiredItems = inventoryItems.filter(
    item => item.expiryDate && new Date(item.expiryDate) < new Date()
  );

  const alertCount = lowStockItems.length + expiringItems.length + expiredItems.length;

  const totalValue = dashboardStats?.totalValue
    || inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  const recentOrders = [...(purchaseOrders || [])]
    .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
    .slice(0, 5);

  const getOrderStatusColor = (status) => {
    const map = {
      pending: '#f59e0b', approved: '#3b82f6', sent: '#8b5cf6',
      received: '#10b981', delivered: '#059669', cancelled: '#ef4444'
    };
    return map[status] || '#6b7280';
  };

  const getStockPercent = (item) => {
    if (!item.maxStock || item.maxStock === 0) {
      return item.currentStock > 0 ? 50 : 0;
    }
    return Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
  };

  const getBarColor = (item) => {
    const pct = getStockPercent(item);
    if (pct <= 25) return '#ef4444';
    if (pct <= 50) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alert Banner */}
      {alertCount > 0 && (
        <div
          onClick={() => setShowAlertModal(true)}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '14px',
            padding: isMobile ? '14px 16px' : '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FaExclamationTriangle size={16} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>Attention Needed</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {lowStockItems.length > 0 && `${lowStockItems.length} low stock`}
                {lowStockItems.length > 0 && (expiringItems.length > 0 || expiredItems.length > 0) && ' \u00B7 '}
                {expiringItems.length > 0 && `${expiringItems.length} expiring soon`}
                {expiringItems.length > 0 && expiredItems.length > 0 && ' \u00B7 '}
                {expiredItems.length > 0 && `${expiredItems.length} expired`}
              </div>
            </div>
          </div>
          <FaArrowRight size={14} />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}>
        {[
          permissions.add && { label: 'Add Item', icon: FaPlus, gradient: 'linear-gradient(135deg, #059669, #10b981)', action: () => setShowAddModal(true) },
          permissions.update && { label: 'Quick Stock', icon: FaBolt, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', action: () => setShowQuickStockModal(true) },
          { label: 'View Stock', icon: FaWarehouse, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', action: () => setActiveTab('stock') },
          { label: 'AI Insights', icon: FaChartLine, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', action: () => setActiveTab('insights') },
          permissions.update && { label: 'Log Waste', icon: FaTrash, gradient: 'linear-gradient(135deg, #ef4444, #f87171)', action: onLogWaste },
        ].filter(Boolean).map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              padding: isMobile ? '18px 10px' : '20px 16px',
              background: btn.gradient, border: 'none',
              borderRadius: '14px', cursor: 'pointer',
              transition: 'all 0.15s', fontSize: isMobile ? '12px' : '13px',
              fontWeight: '700', color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          >
            <btn.icon size={isMobile ? 20 : 22} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}>
        {[
          { label: 'Total Items', value: inventoryItems.length, icon: FaBoxes, color: '#059669', bg: '#ecfdf5', tab: 'stock' },
          { label: 'Low Stock', value: lowStockItems.length, icon: FaExclamationTriangle, color: '#ef4444', bg: '#fef2f2', pulse: lowStockItems.length > 0, tab: 'stock' },
          { label: 'Total Value', value: formatCurrency(totalValue), icon: FaWarehouse, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Suppliers', value: suppliers.length, icon: FaClipboardList, color: '#8b5cf6', bg: '#f5f3ff', tab: 'procurement' },
          { label: 'Wastage', value: `${dashboardStats?.wastedItemsCount || 0} items`, icon: FaTrash, color: '#d97706', bg: '#fffbeb', subtitle: `${formatCurrency(dashboardStats?.totalWasteValue || 0)} wasted` },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={stat.tab ? () => setActiveTab(stat.tab) : undefined}
            style={{
              backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '14px' : '18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
              cursor: stat.tab ? 'pointer' : 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {stat.label}
              </span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                backgroundColor: stat.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                animation: stat.pulse ? 'pulse 2s infinite' : 'none',
              }}>
                <stat.icon size={13} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#111827' }}>
              {stat.value}
            </div>
            {stat.subtitle && (
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', marginTop: '2px' }}>
                {stat.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Low Stock Items */}
      <div style={{
        backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '16px' : '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
      }}>
        <div style={{
          fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: '0 0 14px 0',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <FaExclamationTriangle size={14} style={{ color: '#ef4444' }} />
          Low Stock Items
          {lowStockItems.length > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: '700', color: 'white',
              backgroundColor: '#ef4444', padding: '2px 8px', borderRadius: '99px',
            }}>
              {lowStockItems.length}
            </span>
          )}
        </div>

        {lowStockItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>
            All items are well-stocked. Nice work!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lowStockItems.slice(0, 8).map((item) => {
              const pct = getStockPercent(item);
              return (
                <div key={item.id || item.name} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>
                        {item.currentStock}/{item.minStock} {item.unit || ''}
                      </span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: '3px',
                        backgroundColor: getBarColor(item), transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuickStockModal(true)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none',
                      backgroundColor: '#059669', color: 'white', fontSize: '11px',
                      fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    +Stock
                  </button>
                </div>
              );
            })}
            {lowStockItems.length > 8 && (
              <button
                onClick={() => setActiveTab('stock')}
                style={{
                  padding: '8px', border: 'none', borderRadius: '8px',
                  backgroundColor: '#f3f4f6', color: '#4b5563', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                View all {lowStockItems.length} items <FaArrowRight size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Purchase Orders */}
      <div style={{
        backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '16px' : '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
      }}>
        <div style={{
          fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: '0 0 14px 0',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <FaClipboardList size={14} style={{ color: '#3b82f6' }} />
          Recent Purchase Orders
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>
            No purchase orders yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOrders.map((order) => (
              <div key={order.id || order.orderNumber} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                backgroundColor: '#fafafa', border: '1px solid #f3f4f6', gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '600', fontSize: '13px', color: '#1f2937',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {order.orderNumber || order.id}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    {order.supplierName || 'Unknown supplier'}
                    {' \u00B7 '}
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    {order.totalAmount != null && ` \u00B7 ${formatCurrency(order.totalAmount)}`}
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '99px', fontSize: '10px',
                  fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em',
                  backgroundColor: `${getOrderStatusColor(order.status)}18`,
                  color: getOrderStatusColor(order.status), whiteSpace: 'nowrap',
                }}>
                  {order.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attention Needed Modal */}
      {showAlertModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)'
        }} onClick={e => { if (e.target === e.currentTarget) setShowAlertModal(false); }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '700px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaExclamationTriangle size={14} /> Attention Needed
              </h2>
              <button onClick={() => setShowAlertModal(false)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
              }}>
                <FaTimes size={13} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
              {/* Low Stock Items */}
              {lowStockItems.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '10px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <FaExclamationTriangle size={12} /> Low Stock ({lowStockItems.length})
                  </div>
                  <div style={{ borderRadius: '12px', border: '1px solid #fecaca', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fef2f2' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Item</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Current</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Min Stock</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map(item => (
                          <tr key={item.id} style={{ borderTop: '1px solid #fee2e2' }}>
                            <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                              {item.name}
                              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>{item.category}</div>
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
                              {item.currentStock} {item.unit}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '13px', color: '#6b7280' }}>
                              {item.minStock} {item.unit}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                              <button onClick={() => { setShowAlertModal(false); setShowQuickStockModal(true); }} style={{
                                padding: '5px 12px', borderRadius: '8px', border: 'none',
                                backgroundColor: '#059669', color: 'white', fontSize: '11px',
                                fontWeight: 700, cursor: 'pointer',
                              }}>
                                +Stock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expired Items */}
              {expiredItems.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700, color: '#991b1b', marginBottom: '10px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <FaTrash size={12} /> Expired ({expiredItems.length})
                  </div>
                  <div style={{ borderRadius: '12px', border: '1px solid #fecaca', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fef2f2' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Item</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Stock</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Expired</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiredItems.map(item => (
                          <tr key={item.id} style={{ borderTop: '1px solid #fee2e2' }}>
                            <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{item.name}</td>
                            <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                              {item.currentStock} {item.unit}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '12px', color: '#991b1b' }}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                              {formatCurrency(item.currentStock * (item.costPerUnit || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expiring Soon Items */}
              {expiringItems.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '13px', fontWeight: 700, color: '#d97706', marginBottom: '10px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <FaClock size={12} /> Expiring Soon ({expiringItems.length})
                  </div>
                  <div style={{ borderRadius: '12px', border: '1px solid #fef3c7', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fffbeb' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Item</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Stock</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Expires</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Days Left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringItems.map(item => {
                          const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={item.id} style={{ borderTop: '1px solid #fef3c7' }}>
                              <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{item.name}</td>
                              <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '13px', color: '#6b7280' }}>
                                {item.currentStock} {item.unit}
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '12px', color: '#92400e' }}>
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                                  backgroundColor: daysLeft <= 2 ? '#fef2f2' : '#fffbeb',
                                  color: daysLeft <= 2 ? '#dc2626' : '#d97706',
                                }}>
                                  {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowAlertModal(false)} style={{
                padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
                borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Close</button>
              <button onClick={() => { setShowAlertModal(false); setActiveTab('stock'); }} style={{
                padding: '10px 18px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <FaWarehouse size={12} /> Go to Stock Tab
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
