'use client';

import {
  FaPlus, FaBoxes, FaExclamationTriangle, FaChartLine,
  FaWarehouse, FaBolt, FaArrowRight, FaClipboardList
} from 'react-icons/fa';

export default function DashboardTab({
  inventoryItems, dashboardStats, suppliers, purchaseOrders,
  isMobile, formatCurrency,
  setShowAddModal, setShowQuickStockModal, setActiveTab,
  getStatusColor
}) {
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

  // --- Styles ---
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '16px' : '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  };

  const sectionTitle = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Alert Banner */}
      {alertCount > 0 && (
        <div
          onClick={() => setActiveTab('stock')}
          style={{
            background: 'linear-gradient(135deg, #fef2f2, #fff7ed)',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: isMobile ? '14px 16px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              backgroundColor: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '18px' }} />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '14px' }}>
                Attention Needed
              </div>
              <div style={{ fontSize: '13px', color: '#b91c1c' }}>
                {lowStockItems.length > 0 && `${lowStockItems.length} low stock`}
                {lowStockItems.length > 0 && (expiringItems.length > 0 || expiredItems.length > 0) && ' \u00B7 '}
                {expiringItems.length > 0 && `${expiringItems.length} expiring soon`}
                {expiringItems.length > 0 && expiredItems.length > 0 && ' \u00B7 '}
                {expiredItems.length > 0 && `${expiredItems.length} expired`}
              </div>
            </div>
          </div>
          <FaArrowRight style={{ color: '#ef4444', fontSize: '14px' }} />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '14px',
      }}>
        {[
          { label: 'Add Item', icon: FaPlus, color: '#059669', bg: '#ecfdf5', action: () => setShowAddModal(true) },
          { label: 'Quick Stock', icon: FaBolt, color: '#d97706', bg: '#fffbeb', action: () => setShowQuickStockModal(true) },
          { label: 'View Stock', icon: FaWarehouse, color: '#2563eb', bg: '#eff6ff', action: () => setActiveTab('stock') },
          { label: 'AI Insights', icon: FaChartLine, color: '#7c3aed', bg: '#f5f3ff', action: () => setActiveTab('insights') },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              padding: isMobile ? '18px 10px' : '22px 16px',
              backgroundColor: btn.bg, border: `2px solid transparent`,
              borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.15s', fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600', color: btn.color,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = btn.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <btn.icon style={{ fontSize: isMobile ? '22px' : '26px' }} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '14px',
      }}>
        {[
          {
            label: 'Total Items', value: inventoryItems.length,
            color: '#059669', bg: '#ecfdf5', icon: FaBoxes, pulse: false,
          },
          {
            label: 'Low Stock', value: lowStockItems.length,
            color: '#ef4444', bg: '#fef2f2', icon: FaExclamationTriangle,
            pulse: lowStockItems.length > 0,
          },
          {
            label: 'Total Value', value: formatCurrency(totalValue),
            color: '#2563eb', bg: '#eff6ff', icon: FaWarehouse, pulse: false,
          },
          {
            label: 'Suppliers', value: suppliers.length,
            color: '#7c3aed', bg: '#f5f3ff', icon: FaClipboardList, pulse: false,
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            ...cardStyle,
            display: 'flex', flexDirection: 'column', gap: '8px',
            borderLeft: `4px solid ${stat.color}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                {stat.label}
              </span>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: stat.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                animation: stat.pulse ? 'pulse 2s infinite' : 'none',
              }}>
                <stat.icon style={{ color: stat.color, fontSize: '14px' }} />
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#1f2937',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Items */}
      <div style={cardStyle}>
        <div style={sectionTitle}>
          <FaExclamationTriangle style={{ color: '#ef4444' }} />
          Low Stock Items
          {lowStockItems.length > 0 && (
            <span style={{
              fontSize: '12px', fontWeight: '600', color: '#ef4444',
              backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '99px',
            }}>
              {lowStockItems.length}
            </span>
          )}
        </div>

        {lowStockItems.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: '#9ca3af', fontSize: '14px',
          }}>
            All items are well-stocked. Nice work!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lowStockItems.slice(0, 8).map((item) => {
              const pct = getStockPercent(item);
              return (
                <div key={item.id || item.name} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px',
                  backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600', fontSize: '14px', color: '#1f2937',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '12px', color: '#6b7280', marginTop: '2px',
                    }}>
                      {item.currentStock} / {item.minStock} {item.unit || ''}
                    </div>
                    {/* Stock bar */}
                    <div style={{
                      marginTop: '6px', height: '6px', borderRadius: '3px',
                      backgroundColor: '#e5e7eb', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: '3px',
                        backgroundColor: getBarColor(item),
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuickStockModal(true)}
                    style={{
                      padding: '8px 14px', borderRadius: '10px', border: 'none',
                      backgroundColor: '#059669', color: 'white', fontSize: '12px',
                      fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
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
                  padding: '10px', border: 'none', borderRadius: '10px',
                  backgroundColor: '#f3f4f6', color: '#4b5563', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600',
                }}
              >
                View all {lowStockItems.length} items <FaArrowRight style={{ marginLeft: '4px', fontSize: '11px' }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={cardStyle}>
        <div style={sectionTitle}>
          <FaClipboardList style={{ color: '#2563eb' }} />
          Recent Purchase Orders
        </div>

        {recentOrders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: '#9ca3af', fontSize: '14px',
          }}>
            No purchase orders yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentOrders.map((order) => (
              <div key={order.id || order.orderNumber} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '12px',
                backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '600', fontSize: '14px', color: '#1f2937',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {order.orderNumber || order.id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {order.supplierName || 'Unknown supplier'}
                    {' \u00B7 '}
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    {order.totalAmount != null && ` \u00B7 ${formatCurrency(order.totalAmount)}`}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '99px', fontSize: '11px',
                  fontWeight: '600', textTransform: 'capitalize',
                  backgroundColor: `${getOrderStatusColor(order.status)}18`,
                  color: getOrderStatusColor(order.status),
                  whiteSpace: 'nowrap',
                }}>
                  {order.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
