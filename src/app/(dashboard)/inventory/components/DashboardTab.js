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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alert Banner */}
      {alertCount > 0 && (
        <div
          onClick={() => setActiveTab('stock')}
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
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}>
        {[
          { label: 'Add Item', icon: FaPlus, gradient: 'linear-gradient(135deg, #059669, #10b981)', action: () => setShowAddModal(true) },
          { label: 'Quick Stock', icon: FaBolt, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', action: () => setShowQuickStockModal(true) },
          { label: 'View Stock', icon: FaWarehouse, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', action: () => setActiveTab('stock') },
          { label: 'AI Insights', icon: FaChartLine, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', action: () => setActiveTab('insights') },
        ].map((btn) => (
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
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}>
        {[
          { label: 'Total Items', value: inventoryItems.length, icon: FaBoxes, color: '#059669', bg: '#ecfdf5' },
          { label: 'Low Stock', value: lowStockItems.length, icon: FaExclamationTriangle, color: '#ef4444', bg: '#fef2f2', pulse: lowStockItems.length > 0 },
          { label: 'Total Value', value: formatCurrency(totalValue), icon: FaWarehouse, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Suppliers', value: suppliers.length, icon: FaClipboardList, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '14px' : '18px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
          }}>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
