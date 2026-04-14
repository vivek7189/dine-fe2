'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaShoppingBag, FaStar, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import apiClient from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';

const CustomerDetailModal = ({ customerId, restaurantId, onClose }) => {
  const { formatCurrency } = useCurrency();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customerRes, ordersRes, loyaltyRes] = await Promise.allSettled([
          apiClient.request(`/api/customers/detail/${customerId}`),
          apiClient.getCustomerOrderHistory(customerId, 1, 15),
          apiClient.getCustomerLoyaltyHistory(customerId, 1, 20),
        ]);

        if (customerRes.status === 'fulfilled') {
          setCustomer(customerRes.value.customer || customerRes.value);
        } else {
          setError('Could not load customer details');
        }

        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value.orders || ordersRes.value || []);
        }

        if (loyaltyRes.status === 'fulfilled') {
          setLoyaltyHistory(loyaltyRes.value.transactions || loyaltyRes.value || []);
        }
      } catch (err) {
        setError('Failed to load customer data');
        console.error('CustomerDetailModal fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'orders', label: 'Orders', icon: FaShoppingBag },
    { id: 'loyalty', label: 'Loyalty', icon: FaStar },
  ];

  // Skeleton shimmer
  const Skeleton = ({ width = '100%', height = '16px', style = {} }) => (
    <div style={{
      width, height, borderRadius: '4px',
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );

  const renderOverview = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="60px" style={{ borderRadius: '10px' }} />
          ))}
        </div>
      );
    }

    const stats = [
      { label: 'Total Spent', value: formatCurrency(customer?.totalSpent || 0), color: '#047857', bg: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)', border: '#6ee7b7' },
      { label: 'Total Orders', value: customer?.totalOrders || 0, color: '#0d9488', bg: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '#2dd4bf' },
      { label: 'Loyalty Points', value: customer?.loyaltyPoints || 0, color: '#b45309', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '#fbbf24' },
      { label: 'Member Since', value: formatDate(customer?.createdAt), color: '#c2410c', bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '#fdba74' },
    ];

    return (
      <div>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              padding: '12px', borderRadius: '12px', background: stat.bg,
              border: `1px solid ${stat.border}`,
            }}>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Customer info */}
        <div style={{
          padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
            Customer Info
          </div>
          {[
            { icon: FaPhone, label: customer?.phone || '—' },
            { icon: FaEnvelope, label: customer?.email || '—' },
            { icon: FaMapMarkerAlt, label: customer?.city || '—' },
            { icon: FaBirthdayCake, label: customer?.dob ? formatDate(customer.dob) : '—' },
          ].filter(item => item.label !== '—').map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '4px 0', fontSize: '12px', color: '#4b5563',
            }}>
              <item.icon size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <span>{item.label}</span>
            </div>
          ))}
          {customer?.source && (
            <div style={{
              marginTop: '8px', display: 'inline-block',
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: customer.source.includes('crave') ? '#dbeafe' : '#f1f5f9',
              color: customer.source.includes('crave') ? '#1d4ed8' : '#64748b',
              fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
            }}>
              {customer.source.includes('crave') ? 'Crave App' : customer.source === 'pos' ? 'POS' : customer.source}
            </div>
          )}
        </div>

        {/* Last order */}
        {customer?.lastOrderDate && (
          <div style={{
            marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
            backgroundColor: '#fffbeb', border: '1px solid #fef3c7',
            fontSize: '11px', color: '#92400e',
          }}>
            Last order: {formatDate(customer.lastOrderDate)}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} height="48px" style={{ borderRadius: '8px' }} />
          ))}
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
          <FaShoppingBag size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div style={{ fontSize: '13px' }}>No order history yet</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {orders.map((order, i) => (
          <div key={order.orderId || order.id || i} style={{
            padding: '10px 12px', borderRadius: '8px', backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
                {order.orderNumber ? `#${order.orderNumber}` : `Order`}
                {order.appliedOffer?.name && (
                  <span style={{
                    marginLeft: '6px', padding: '1px 5px', borderRadius: '3px',
                    backgroundColor: '#f0fdf4', color: '#16a34a',
                    fontSize: '9px', fontWeight: 600,
                  }}>
                    {order.appliedOffer.name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                {formatDateTime(order.orderDate || order.createdAt)}
                {order.itemsCount ? ` · ${order.itemsCount} items` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>
                {formatCurrency(order.totalAmount || order.finalAmount || 0)}
              </div>
              {order.status && (
                <div style={{
                  fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                  color: order.status === 'completed' ? '#16a34a' : order.status === 'cancelled' ? '#dc2626' : '#d97706',
                }}>
                  {order.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLoyalty = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="64px" style={{ borderRadius: '10px' }} />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="40px" style={{ borderRadius: '8px' }} />
          ))}
        </div>
      );
    }

    const points = customer?.loyaltyPoints || 0;

    return (
      <div>
        {/* Points balance */}
        <div style={{
          padding: '16px', borderRadius: '14px', marginBottom: '12px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #06b6d4 100%)',
          textAlign: 'center', boxShadow: '0 4px 16px rgba(13,148,136,0.25)',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: '4px' }}>
            Available Points
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            {points.toLocaleString()}
          </div>
          {customer?.loyaltyTier && customer.loyaltyTier !== 'bronze' && (
            <div style={{
              display: 'inline-block', marginTop: '4px',
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff',
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            }}>
              {customer.loyaltyTier} tier
            </div>
          )}
        </div>

        {/* Transaction history */}
        {!loyaltyHistory.length ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: '#9ca3af' }}>
            <FaStar size={20} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div style={{ fontSize: '13px' }}>No loyalty transactions yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loyaltyHistory.map((tx, i) => {
              const isEarned = tx.type === 'earned' || tx.pointsChange > 0;
              return (
                <div key={tx.id || i} style={{
                  padding: '8px 10px', borderRadius: '6px',
                  backgroundColor: isEarned ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${isEarned ? '#dcfce7' : '#fecaca'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isEarned ? (
                      <FaArrowUp size={9} style={{ color: '#16a34a' }} />
                    ) : (
                      <FaArrowDown size={9} style={{ color: '#dc2626' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>
                        {tx.description || (isEarned ? 'Points Earned' : 'Points Redeemed')}
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af' }}>
                        {formatDateTime(tx.createdAt || tx.date)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: isEarned ? '#16a34a' : '#dc2626',
                  }}>
                    {isEarned ? '+' : ''}{tx.pointsChange || tx.points || 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Shimmer animation */}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 2001,
        ...(isMobile ? {
          bottom: 0, left: 0, right: 0,
          borderRadius: '16px 16px 0 0',
          maxHeight: '90vh',
        } : {
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          maxHeight: '85vh',
          width: '440px', maxWidth: 'calc(100vw - 32px)',
        }),
        backgroundColor: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 14px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #06b6d4 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaUser size={14} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                {loading ? 'Loading...' : (customer?.name || 'Customer')}
              </div>
              {customer?.phone && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: '8px',
            border: 'none', backgroundColor: 'rgba(255,255,255,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            <FaTimes size={11} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb',
          padding: '0 16px', flexShrink: 0, background: '#f0fdfa',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 8px',
                fontSize: '12px', fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#0d9488' : '#9ca3af',
                background: 'none', border: 'none', borderBottomWidth: '2px', borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab.id ? '#0d9488' : 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'all 0.15s',
              }}
            >
              <tab.icon size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: '12px', marginBottom: '12px',
            }}>
              {error}
            </div>
          )}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'loyalty' && renderLoyalty()}
        </div>
      </div>
    </>
  );
};

export default CustomerDetailModal;
