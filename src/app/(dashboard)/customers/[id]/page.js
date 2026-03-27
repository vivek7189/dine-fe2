'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '../../../../lib/api';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGift,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaUser,
  FaHandHoldingUsd,
  FaWallet
} from 'react-icons/fa';

var CustomerDetail = function() {
  var router = useRouter();
  var params = useParams();
  var customerId = params.id;
  var { formatCurrency, getCurrencySymbol } = useCurrency();

  var [customer, setCustomer] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);
  var [isMobile, setIsMobile] = useState(false);
  var [showEditForm, setShowEditForm] = useState(false);
  var [saving, setSaving] = useState(false);
  var [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', city: '', dob: ''
  });
  var [formErrors, setFormErrors] = useState({});
  var [creditData, setCreditData] = useState({ outstandingBalance: 0, creditHistory: [] });
  var [creditLoading, setCreditLoading] = useState(false);
  var [settlingCredit, setSettlingCredit] = useState(null);

  useEffect(function() {
    var checkMobile = function() { setIsMobile(window.innerWidth <= 768); };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return function() { window.removeEventListener('resize', checkMobile); };
  }, []);

  useEffect(function() {
    if (customerId) loadCustomer();
  }, [customerId]);

  useEffect(function() {
    if (customerId) {
      setCreditLoading(true);
      apiClient.getCustomerCreditHistory(customerId)
        .then(function(data) { setCreditData(data); })
        .catch(function() { /* silently ignore if no credit data */ })
        .finally(function() { setCreditLoading(false); });
    }
  }, [customerId]);

  var loadCustomer = async function() {
    try {
      setLoading(true);
      var response = await apiClient.getCustomer(customerId);
      setCustomer(response.customer);
    } catch (err) {
      console.error('Error loading customer:', err);
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  var handleEdit = function() {
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      city: customer.city || '',
      dob: customer.dob || ''
    });
    setShowEditForm(true);
  };

  var handleSave = async function(e) {
    e.preventDefault();
    var errors = {};
    if (!customerForm.name && !customerForm.phone) {
      errors.general = 'Name or phone is required';
    }
    if (customerForm.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(customerForm.phone)) {
      errors.phone = 'Invalid phone number';
    }
    if (customerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) {
      errors.email = 'Invalid email address';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      await apiClient.request('/api/customers/' + customerId, {
        method: 'PATCH',
        body: {
          name: customerForm.name || null,
          phone: customerForm.phone || null,
          email: customerForm.email || null,
          city: customerForm.city || null,
          dob: customerForm.dob || null
        }
      });
      setShowEditForm(false);
      await loadCustomer();
    } catch (err) {
      console.error('Error updating customer:', err);
      setFormErrors({ general: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  var handleDelete = async function() {
    var customerName = customer.name || customer.phone || 'this customer';
    if (!confirm('Are you sure you want to delete ' + customerName + '?')) return;
    try {
      await apiClient.request('/api/customers/' + customerId, { method: 'DELETE' });
      router.push('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer');
    }
  };

  var handleSettleCredit = async function(entry) {
    if (settlingCredit) return;
    var settleAmount = entry.outstandingAmount;
    if (!settleAmount || settleAmount <= 0) return;
    try {
      setSettlingCredit(entry.orderId);
      await apiClient.settleCustomerCredit(customerId, {
        amount: settleAmount,
        paymentMethod: 'cash',
        orderId: entry.orderId
      });
      // Reload credit data
      var data = await apiClient.getCustomerCreditHistory(customerId);
      setCreditData(data);
    } catch (err) {
      console.error('Error settling credit:', err);
      alert('Failed to settle credit');
    } finally {
      setSettlingCredit(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <FaSpinner className="animate-spin" size={28} style={{ color: '#6b7280' }} />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ padding: isMobile ? '16px' : '32px' }}>
        <button onClick={function() { router.push('/customers'); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280',
          fontWeight: '500', padding: 0, marginBottom: '24px'
        }}>
          <FaArrowLeft size={14} /> Back to Customers
        </button>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaExclamationTriangle size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600', color: '#374151' }}>
            Customer not found
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            {error || 'This customer may have been deleted.'}
          </p>
        </div>
      </div>
    );
  }

  var orderHistory = customer.orderHistory || [];
  var totalPointsEarned = orderHistory.reduce(function(sum, o) { return sum + (o.loyaltyPointsEarned || 0); }, 0);
  var totalPointsRedeemed = orderHistory.reduce(function(sum, o) { return sum + (o.loyaltyPointsRedeemed || 0); }, 0);
  var currentPoints = customer.loyaltyPoints || 0;
  var totalOrders = customer.totalOrders || orderHistory.length || 0;
  var totalSpent = Number(customer.totalSpent || 0);
  var avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  var redemptionHistory = orderHistory.filter(function(o) { return o.loyaltyPointsRedeemed > 0; });

  var sortedOrders = orderHistory.slice().sort(function(a, b) {
    return new Date(b.orderDate) - new Date(a.orderDate);
  });

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Hero Header with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        padding: isMobile ? '16px 16px 60px' : '24px 32px 72px',
        position: 'relative'
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '20px' : '28px'
        }}>
          <button onClick={function() { router.push('/customers'); }} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.85)',
            fontWeight: '500', padding: '8px 14px'
          }}>
            <FaArrowLeft size={12} /> Back to Customers
          </button>
          <button onClick={function() { window.open(window.location.href, '_blank'); }} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.85)',
            fontWeight: '500'
          }}>
            <FaExternalLinkAlt size={10} /> New window
          </button>
        </div>

        {/* Customer info on dark bg */}
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: isMobile ? '52px' : '64px', height: isMobile ? '52px' : '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: 'white',
              boxShadow: '0 4px 14px rgba(239,68,68,0.4)'
            }}>
              {(customer.name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: 'white' }}>
                {customer.name || 'Unnamed Customer'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                {customer.phone && (
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaPhone size={11} /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaEnvelope size={11} /> {customer.email}
                  </span>
                )}
                {customer.city && (
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaMapMarkerAlt size={11} /> {customer.city}
                  </span>
                )}
              </div>
              {customer.createdAt && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                  Customer since {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  {customer.dob ? '  \u00B7  DOB: ' + new Date(customer.dob).toLocaleDateString() : ''}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleEdit} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'white', fontWeight: '500'
            }}>
              <FaEdit size={12} /> Edit
            </button>
            <button onClick={handleDelete} style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#fca5a5', fontWeight: '500'
            }}>
              <FaTrash size={12} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - overlapping the header */}
      <div style={{
        padding: isMobile ? '0 12px' : '0 32px',
        marginTop: isMobile ? '-44px' : '-48px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{totalOrders}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{formatCurrency(totalSpent)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{formatCurrency(avgOrderValue)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Order</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#f59e0b' }}>{currentPoints}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loyalty Points</p>
          </div>
          {creditData.outstandingBalance > 0 && (
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
              textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }}></div>
              <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(creditData.outstandingBalance)}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding</p>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: isMobile ? '0 12px 24px' : '0 32px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
          gap: '16px'
        }}>
          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Loyalty Card */}
            {(currentPoints > 0 || totalPointsEarned > 0) && (
              <div style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                borderRadius: '14px', border: '1px solid #fde68a',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaGift size={13} style={{ color: 'white' }} />
                  </div>
                  Loyalty Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#78350f' }}>Points Earned</span>
                    <span style={{ fontWeight: '700', color: '#15803d' }}>+{totalPointsEarned}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#78350f' }}>Points Redeemed</span>
                    <span style={{ fontWeight: '700', color: '#dc2626' }}>-{totalPointsRedeemed}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #fde68a', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#92400e', fontWeight: '700' }}>Balance</span>
                    <span style={{ fontWeight: '800', color: '#b45309', fontSize: '18px' }}>{currentPoints} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Redemption History */}
            {redemptionHistory.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                  Redemption History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {redemptionHistory.map(function(order, index) {
                    return (
                      <div key={index} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px',
                        fontSize: '13px', border: '1px solid #fecaca'
                      }}>
                        <div>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{order.orderNumber}</span>
                          <span style={{ color: '#9ca3af', marginLeft: '6px', fontSize: '11px' }}>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '12px' }}>
                          -{order.loyaltyPointsRedeemed} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Credit History */}
            {creditData.creditHistory.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaHandHoldingUsd size={13} style={{ color: 'white' }} />
                  </div>
                  Credit History (Khata)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {creditData.creditHistory.map(function(entry, index) {
                    var isSettled = entry.settledAt || entry.outstandingAmount <= 0;
                    return (
                      <div key={index} style={{
                        padding: '10px 12px',
                        backgroundColor: isSettled ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '8px',
                        border: isSettled ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{entry.orderNumber}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span style={{ color: '#6b7280' }}>
                            Paid: {formatCurrency(entry.paidAmount)} / {formatCurrency(entry.totalAmount)}
                          </span>
                          {isSettled ? (
                            <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '11px' }}>Settled</span>
                          ) : (
                            <button
                              onClick={function() { handleSettleCredit(entry); }}
                              disabled={settlingCredit === entry.orderId}
                              style={{
                                padding: '3px 10px',
                                background: settlingCredit === entry.orderId ? '#d1d5db' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '600',
                                cursor: settlingCredit === entry.orderId ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {settlingCredit === entry.orderId ? 'Settling...' : 'Settle ' + formatCurrency(entry.outstandingAmount)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Card */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                Customer Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaPhone size={12} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaEnvelope size={12} style={{ color: '#ef4444' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaMapMarkerAlt size={12} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{customer.city}</p>
                    </div>
                  </div>
                )}
                {customer.dob && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCalendarAlt size={12} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{new Date(customer.dob).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>Source</span>
                  <span style={{
                    fontWeight: '600', fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    backgroundColor: customer.source === 'customer_app' ? '#dbeafe' : '#f1f5f9',
                    color: customer.source === 'customer_app' ? '#1d4ed8' : '#64748b'
                  }}>
                    {customer.source === 'customer_app' ? 'App User' : 'Manual'}
                  </span>
                </div>
                {customer.lastOrderDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#94a3b8' }}>Last Order</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {(function() {
                        var raw = customer.lastOrderDate;
                        if (!raw) return 'N/A';
                        var d;
                        if (typeof raw.toDate === 'function') d = raw.toDate();
                        else if (raw._seconds) d = new Date(raw._seconds * 1000);
                        else d = new Date(raw);
                        return (!d || isNaN(d.getTime())) ? 'N/A' : d.toLocaleDateString();
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order History */}
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
          }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1e293b',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaHistory size={12} style={{ color: '#64748b' }} />
              </div>
              Order History
              <span style={{
                fontSize: '12px', fontWeight: '600', backgroundColor: '#f1f5f9',
                color: '#64748b', padding: '2px 10px', borderRadius: '20px'
              }}>
                {orderHistory.length}
              </span>
            </h3>
            {sortedOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedOrders.map(function(order, index) {
                  return (
                    <div key={index} style={{
                      padding: '14px 16px',
                      backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                              {order.orderNumber}
                            </span>
                            {order.orderTypeLabel && (
                              <span style={{
                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                                backgroundColor: order.orderType === 'dine_in' ? '#dbeafe' :
                                  order.orderType === 'takeaway' ? '#fef3c7' :
                                  order.orderType === 'delivery' ? '#dcfce7' : '#f3e8ff',
                                color: order.orderType === 'dine_in' ? '#1e40af' :
                                  order.orderType === 'takeaway' ? '#92400e' :
                                  order.orderType === 'delivery' ? '#166534' : '#7e22ce'
                              }}>
                                {order.orderTypeLabel}
                              </span>
                            )}
                            {order.orderSource === 'crave_app' && (
                              <span style={{
                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                                fontWeight: '600', backgroundColor: '#eff6ff', color: '#2563eb'
                              }}>
                                App
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                            {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {order.tableNumber ? ' \u00B7 Table ' + order.tableNumber : ''}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                            {formatCurrency(order.finalAmount || order.totalAmount)}
                          </p>
                          {/* Billing breakup */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px', marginTop: '2px' }}>
                            {order.serviceChargeAmount > 0 && (
                              <span style={{ fontSize: '10px', color: '#7c3aed' }}>
                                SC: {formatCurrency(order.serviceChargeAmount)}
                              </span>
                            )}
                            {order.tipAmount > 0 && (
                              <span style={{ fontSize: '10px', color: '#d97706' }}>
                                Tip: {formatCurrency(order.tipAmount)}
                              </span>
                            )}
                            {order.roundOffAmount != null && order.roundOffAmount !== 0 && (
                              <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                                R/O: {order.roundOffAmount > 0 ? '+' : ''}{formatCurrency(order.roundOffAmount)}
                              </span>
                            )}
                          </div>
                          {(order.discountAmount > 0 || order.loyaltyDiscount > 0) && (
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#059669' }}>
                              {order.discountAmount > 0 ? 'Offer: -' + getCurrencySymbol() + order.discountAmount : ''}
                              {order.discountAmount > 0 && order.loyaltyDiscount > 0 ? ' | ' : ''}
                              {order.loyaltyDiscount > 0 ? 'Loyalty: -' + getCurrencySymbol() + order.loyaltyDiscount : ''}
                            </p>
                          )}
                          {order.loyaltyPointsEarned > 0 && (
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
                              +{order.loyaltyPointsEarned} pts
                            </p>
                          )}
                          {/* Partial payment badge */}
                          {order.outstandingAmount > 0 && (
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <span style={{
                                fontSize: '9px', fontWeight: 700, color: 'white', backgroundColor: '#ef4444',
                                padding: '1px 6px', borderRadius: '10px'
                              }}>DUE</span>
                              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>
                                {formatCurrency(order.outstandingAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
                }}>
                  <FaHistory size={22} style={{ color: '#cbd5e1' }} />
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#64748b' }}>No orders yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Orders will appear here once placed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: isMobile ? '16px' : '32px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Edit Customer</h2>
              <button onClick={function() { setShowEditForm(false); setFormErrors({}); }} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                color: '#6b7280', padding: '8px', cursor: 'pointer'
              }}>
                <FaTimes size={14} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              {formErrors.general && (
                <div style={{
                  backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                  padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px'
                }}>
                  <FaExclamationTriangle style={{ marginRight: '6px' }} /> {formErrors.general}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'name', label: 'Name', type: 'text', required: true },
                  { key: 'phone', label: 'Phone', type: 'tel', required: true },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'dob', label: 'Date of Birth', type: 'date' },
                ].map(function(field) {
                  return (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      <input
                        type={field.type}
                        value={customerForm[field.key]}
                        onChange={function(e) {
                          var updated = Object.assign({}, customerForm);
                          updated[field.key] = e.target.value;
                          setCustomerForm(updated);
                        }}
                        style={{
                          width: '100%', padding: '10px 14px', border: formErrors[field.key] ? '1px solid #dc2626' : '1px solid #d1d5db',
                          borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb'
                        }}
                      />
                      {formErrors[field.key] && (
                        <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0' }}>{formErrors[field.key]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={function() { setShowEditForm(false); setFormErrors({}); }} style={{
                  padding: '10px 20px', backgroundColor: 'white', color: '#374151', borderRadius: '8px',
                  fontWeight: '600', fontSize: '14px', border: '1px solid #e5e7eb', cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', backgroundColor: '#111827', color: 'white', borderRadius: '8px',
                  fontWeight: '600', fontSize: '14px', border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
