'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import * as XLSX from 'xlsx';
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
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaPercent,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf
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
  var [walletData, setWalletData] = useState({ walletBalance: 0, walletHistory: [] });
  var [walletLoading, setWalletLoading] = useState(false);
  var [showAddCredit, setShowAddCredit] = useState(false);
  var [creditForm, setCreditForm] = useState({ amount: '', reason: 'advance_payment', notes: '' });
  var [addingCredit, setAddingCredit] = useState(false);
  var [expandedOrderId, setExpandedOrderId] = useState(null);
  var [statsPeriod, setStatsPeriod] = useState('all');
  var [exportDropdown, setExportDropdown] = useState(false);
  var [showBulkSettle, setShowBulkSettle] = useState(false);
  var [bulkPaymentAmount, setBulkPaymentAmount] = useState('');
  var [selectedSettleOrders, setSelectedSettleOrders] = useState([]);
  var [bulkUpdateOrderStatus, setBulkUpdateOrderStatus] = useState(false);
  var [bulkSettling, setBulkSettling] = useState(false);
  var isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;

  useEffect(function() {
    var checkMobile = function() { setIsMobile(window.innerWidth <= 768); };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return function() { window.removeEventListener('resize', checkMobile); };
  }, []);

  // Close export dropdown on outside click
  useEffect(function() {
    if (!exportDropdown) return;
    var handler = function(e) {
      if (!e.target.closest('[data-export-dropdown]')) setExportDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return function() { document.removeEventListener('mousedown', handler); };
  }, [exportDropdown]);

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

  useEffect(function() {
    if (customerId) {
      setWalletLoading(true);
      apiClient.getCustomerWallet(customerId)
        .then(function(data) { setWalletData(data); })
        .catch(function() { /* silently ignore */ })
        .finally(function() { setWalletLoading(false); });
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
      var isME = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
      router.push(isME ? '/mobile/customers' : '/customers');
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
      // Reload credit data and customer
      var data = await apiClient.getCustomerCreditHistory(customerId);
      setCreditData(data);
      await loadCustomer();
    } catch (err) {
      console.error('Error settling credit:', err);
      alert('Failed to settle credit');
    } finally {
      setSettlingCredit(null);
    }
  };

  var handleAddCredit = async function() {
    if (addingCredit || !creditForm.amount || parseFloat(creditForm.amount) <= 0) return;
    try {
      setAddingCredit(true);
      await apiClient.addCustomerWalletCredit(customerId, {
        amount: parseFloat(creditForm.amount),
        reason: creditForm.reason,
        notes: creditForm.notes
      });
      var data = await apiClient.getCustomerWallet(customerId);
      setWalletData(data);
      setCreditForm({ amount: '', reason: 'advance_payment', notes: '' });
      setShowAddCredit(false);
      await loadCustomer();
    } catch (err) {
      console.error('Error adding credit:', err);
      alert(err.message || 'Failed to add credit');
    } finally {
      setAddingCredit(false);
    }
  };

  var handleBulkSettle = async function() {
    if (bulkSettling || selectedSettleOrders.length === 0 || !bulkPaymentAmount) return;
    try {
      setBulkSettling(true);
      await apiClient.bulkSettleCredit(customerId, {
        orderIds: selectedSettleOrders,
        totalAmount: parseFloat(bulkPaymentAmount),
        paymentMethod: 'cash',
        updateOrderStatus: bulkUpdateOrderStatus
      });
      var data = await apiClient.getCustomerCreditHistory(customerId);
      setCreditData(data);
      await loadCustomer();
      setShowBulkSettle(false);
      setBulkPaymentAmount('');
      setSelectedSettleOrders([]);
      setBulkUpdateOrderStatus(false);
    } catch (err) {
      console.error('Error bulk settling credit:', err);
      alert(err.message || 'Failed to settle credit');
    } finally {
      setBulkSettling(false);
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
        <button onClick={function() { var isME = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__; router.push(isME ? '/mobile/customers' : '/customers'); }} style={{
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

  var parseDate = function(raw) {
    if (!raw) return null;
    if (typeof raw.toDate === 'function') return raw.toDate();
    if (raw._seconds) return new Date(raw._seconds * 1000);
    var d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  var orderHistory = customer.orderHistory || [];
  var totalPointsEarned = orderHistory.reduce(function(sum, o) { return sum + (o.loyaltyPointsEarned || 0); }, 0);
  var totalPointsRedeemed = orderHistory.reduce(function(sum, o) { return sum + (o.loyaltyPointsRedeemed || 0); }, 0);
  var currentPoints = customer.loyaltyPoints || 0;
  var totalOrders = Math.max(customer.totalOrders || 0, orderHistory.length || 0);
  var computedTotalSpent = orderHistory.reduce(function(sum, o) { return sum + (o.paidAmount != null ? o.paidAmount : (o.finalAmount || o.totalAmount || 0)); }, 0);
  var totalSpent = Math.max(Number(customer.totalSpent || 0), computedTotalSpent);
  var avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  var redemptionHistory = orderHistory.filter(function(o) { return o.loyaltyPointsRedeemed > 0; });

  var outstandingBalance = creditData.outstandingBalance || customer.outstandingBalance || 0;

  // Time period filtering
  var periodLabels = { all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', lastMonth: 'Last Month' };
  var filteredOrders = (function() {
    if (statsPeriod === 'all') return orderHistory;
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var start, end;
    if (statsPeriod === 'today') {
      start = startOfToday;
      end = new Date(startOfToday.getTime() + 86400000);
    } else if (statsPeriod === 'week') {
      var dayOfWeek = now.getDay() || 7; // Mon=1
      start = new Date(startOfToday);
      start.setDate(start.getDate() - (dayOfWeek - 1));
      end = new Date(startOfToday.getTime() + 86400000);
    } else if (statsPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(startOfToday.getTime() + 86400000);
    } else if (statsPeriod === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return orderHistory.filter(function(o) {
      var d = parseDate(o.orderDate);
      return d && d >= start && d < end;
    });
  })();

  // Filtered stats
  var filteredTotalOrders = filteredOrders.length;
  var filteredTotalSpent = filteredOrders.reduce(function(sum, o) { return sum + (o.finalAmount || o.totalAmount || 0); }, 0);
  var filteredAvgOrder = filteredTotalOrders > 0 ? filteredTotalSpent / filteredTotalOrders : 0;

  // Discount/savings stats from filtered orders
  var savingsStats = filteredOrders.reduce(function(acc, o) {
    acc.offerDiscount += (o.discountAmount || o.offerDiscount || 0);
    acc.manualDiscount += (o.manualDiscount || 0);
    acc.loyaltyDiscount += (o.loyaltyDiscount || 0);
    acc.couponDiscount += (o.couponDiscount || 0);
    acc.compItemCount += (o.compItems ? o.compItems.length : 0);
    if ((o.discountAmount || 0) > 0 || (o.manualDiscount || 0) > 0 || (o.loyaltyDiscount || 0) > 0 || (o.couponDiscount || 0) > 0) {
      acc.ordersWithDiscount += 1;
    }
    return acc;
  }, { offerDiscount: 0, manualDiscount: 0, loyaltyDiscount: 0, couponDiscount: 0, compItemCount: 0, ordersWithDiscount: 0 });
  savingsStats.totalSavings = savingsStats.offerDiscount + savingsStats.manualDiscount + savingsStats.loyaltyDiscount + savingsStats.couponDiscount;

  // Export helper — supports csv, xlsx, pdf
  var downloadReport = function(format) {
    setExportDropdown(false);
    var headers = ['Date', 'Order #', 'Subtotal', 'Offer Discount', 'Manual Discount', 'Loyalty Discount', 'Coupon Discount', 'Total Discount', 'Final Amount', 'Status'];
    var dataRows = filteredOrders.map(function(o) {
      var d = parseDate(o.orderDate);
      return [
        d ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString() : '',
        o.orderNumber || o.orderId || '',
        (o.subtotal || o.totalAmount || 0).toFixed(2),
        (o.discountAmount || o.offerDiscount || 0).toFixed(2),
        (o.manualDiscount || 0).toFixed(2),
        (o.loyaltyDiscount || 0).toFixed(2),
        (o.couponDiscount || 0).toFixed(2),
        (o.totalDiscountAmount || 0).toFixed(2),
        (o.finalAmount || o.totalAmount || 0).toFixed(2),
        o.status || ''
      ];
    });
    var filename = (customer.name || 'customer') + '_report_' + statsPeriod;

    if (format === 'csv' || format === 'xlsx') {
      var ws = XLSX.utils.aoa_to_sheet([headers].concat(dataRows));
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, filename + (format === 'csv' ? '.csv' : '.xlsx'), format === 'csv' ? { bookType: 'csv' } : undefined);
    } else if (format === 'pdf') {
      var html = '<html><head><title>' + filename + '</title><style>';
      html += 'body{font-family:Arial,sans-serif;padding:24px;color:#1f2937}';
      html += 'h2{font-size:16px;margin-bottom:12px}';
      html += 'table{width:100%;border-collapse:collapse;font-size:11px}';
      html += 'th{background:#f3f4f6;padding:6px 8px;text-align:left;border-bottom:2px solid #d1d5db;font-weight:600}';
      html += 'td{padding:6px 8px;border-bottom:1px solid #e5e7eb}';
      html += 'tr:nth-child(even){background:#f9fafb}';
      html += '@media print{body{padding:0}}';
      html += '</style></head><body>';
      html += '<h2>' + (customer.name || 'Customer') + ' — Order Report (' + statsPeriod + ')</h2>';
      html += '<table><thead><tr>';
      headers.forEach(function(h) { html += '<th>' + h + '</th>'; });
      html += '</tr></thead><tbody>';
      dataRows.forEach(function(row) {
        html += '<tr>';
        row.forEach(function(val) { html += '<td>' + (val || '') + '</td>'; });
        html += '</tr>';
      });
      html += '</tbody></table></body></html>';
      var w = window.open('', '_blank', 'width=900,height=600');
      w.document.write(html);
      w.document.close();
      setTimeout(function() { w.print(); }, 400);
    }
  };

  var sortedOrders = filteredOrders.slice().sort(function(a, b) {
    return (parseDate(b.orderDate) || new Date(0)) - (parseDate(a.orderDate) || new Date(0));
  });

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      paddingBottom: isMobileEmbed ? '80px' : '0',
    }}>
      {/* Hero Header with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        padding: isMobileEmbed ? '10px 12px 42px' : (isMobile ? '12px 14px 50px' : '24px 32px 72px'),
        position: 'relative'
      }}>
        {/* Top bar — hidden in mobile embed (native app handles back) */}
        {!isMobileEmbed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '14px' : '28px'
        }}>
          <button onClick={function() { var isME = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__; router.push(isME ? '/mobile/customers' : '/customers'); }} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: isMobile ? '4px' : '8px', fontSize: isMobile ? '12px' : '13px', color: 'rgba(255,255,255,0.85)',
            fontWeight: '500', padding: isMobile ? '6px 10px' : '8px 14px'
          }}>
            <FaArrowLeft size={isMobile ? 10 : 12} /> {isMobile ? 'Back' : 'Back to Customers'}
          </button>
          {!isMobile && (
          <button onClick={function() { window.open(window.location.href, '_blank'); }} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.85)',
            fontWeight: '500'
          }}>
            <FaExternalLinkAlt size={10} /> New window
          </button>
          )}
        </div>
        )}

        {/* Customer info on dark bg */}
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: isMobile ? '12px' : '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: isMobile ? '44px' : '64px', height: isMobile ? '44px' : '64px',
              borderRadius: isMobile ? '12px' : '16px',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? '18px' : '26px', fontWeight: '700', color: 'white',
              boxShadow: '0 4px 14px rgba(239,68,68,0.4)', flexShrink: 0
            }}>
              {(customer.name || 'C')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '17px' : '26px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customer.name || 'Unnamed Customer'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '12px', marginTop: isMobile ? '4px' : '6px' }}>
                {customer.phone && (
                  <span style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaPhone size={isMobile ? 9 : 11} /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '160px' : 'none' }}>
                    <FaEnvelope size={isMobile ? 9 : 11} /> {customer.email}
                  </span>
                )}
                {customer.city && !isMobile && (
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaMapMarkerAlt size={11} /> {customer.city}
                  </span>
                )}
              </div>
              {(customer.createdAt || customer.dob) && !isMobile && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                  {customer.createdAt ? 'Customer since ' + (parseDate(customer.createdAt) ? parseDate(customer.createdAt).toLocaleDateString() : 'N/A') : ''}
                  {customer.dob ? '  \u00B7  DOB: ' + (parseDate(customer.dob) ? parseDate(customer.dob).toLocaleDateString() : 'N/A') : ''}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', ...(isMobile ? { width: '100%' } : {}) }}>
            <button onClick={handleEdit} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: isMobile ? '7px 14px' : '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: isMobile ? '12px' : '13px', color: 'white', fontWeight: '500',
              flex: isMobile ? 1 : 'none', justifyContent: 'center'
            }}>
              <FaEdit size={isMobile ? 11 : 12} /> Edit
            </button>
            <button onClick={handleDelete} style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: isMobile ? '7px 14px' : '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: isMobile ? '12px' : '13px', color: '#fca5a5', fontWeight: '500',
              flex: isMobile ? 1 : 'none', justifyContent: 'center'
            }}>
              <FaTrash size={isMobile ? 11 : 12} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter + Stats Cards */}
      <div style={{
        padding: isMobile ? '0 10px' : '0 32px',
        marginTop: isMobile ? '-36px' : '-48px',
        marginBottom: isMobile ? '14px' : '20px'
      }}>
        {/* Period Filter Pills */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '12px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
          background: 'white', borderRadius: '10px', padding: '4px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          width: 'fit-content'
        }}>
          {['all', 'today', 'week', 'month', 'lastMonth'].map(function(p) {
            return (
              <button key={p} onClick={function() { setStatsPeriod(p); }}
                style={{
                  padding: isMobile ? '6px 12px' : '6px 16px',
                  fontSize: '12px', fontWeight: '600', borderRadius: '8px',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  background: statsPeriod === p ? '#1e293b' : 'transparent',
                  color: statsPeriod === p ? 'white' : '#64748b',
                }}>
                {periodLabels[p]}
              </button>
            );
          })}
        </div>

        {isMobile ? (
        /* Mobile: Horizontal scroll stats */
        <div style={{
          display: 'flex', gap: '8px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', paddingBottom: '4px'
        }}>
          {[
            { value: filteredTotalOrders, label: 'Orders', gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
            { value: formatCurrency(filteredTotalSpent), label: 'Spent', gradient: 'linear-gradient(90deg, #10b981, #34d399)' },
            { value: formatCurrency(filteredAvgOrder), label: 'Avg Order', gradient: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
            { value: currentPoints, label: 'Points', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)', color: '#f59e0b' },
            { value: formatCurrency(walletData.walletBalance), label: 'Wallet', gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)', color: '#06b6d4' },
            { value: formatCurrency(outstandingBalance), label: 'Due', gradient: outstandingBalance > 0 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)', color: outstandingBalance > 0 ? '#ef4444' : '#10b981' },
          ].map(function(stat, i) {
            return (
              <div key={i} style={{
                backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '12px 16px',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
                minWidth: '100px', flexShrink: 0
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.gradient }}></div>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: stat.color || '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>
        ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px'
        }}>

          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{filteredTotalOrders}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{formatCurrency(filteredTotalSpent)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#1e293b' }}>{formatCurrency(filteredAvgOrder)}</p>
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
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#06b6d4' }}>{formatCurrency(walletData.walletBalance)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px',
            border: outstandingBalance > 0 ? '1px solid #fecaca' : '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '22px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: outstandingBalance > 0 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: outstandingBalance > 0 ? '#ef4444' : '#10b981' }}>{formatCurrency(outstandingBalance)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding</p>
            {outstandingBalance > 0 && (
              <button onClick={function() { setShowBulkSettle(true); }} style={{
                marginTop: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: '600',
                background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Receive Payment
              </button>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ padding: isMobile ? '0 10px 24px' : '0 32px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
          gap: '16px'
        }}>
          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '16px' }}>
            {/* Loyalty Card */}
            {(currentPoints > 0 || totalPointsEarned > 0) && (
              <div style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                borderRadius: '14px', border: '1px solid #fde68a',
                padding: isMobile ? '14px' : '20px'
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

            {/* Savings Summary Card */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaPercent size={11} style={{ color: 'white' }} />
                  </div>
                  Savings Summary
                </h3>
                <div data-export-dropdown style={{ position: 'relative' }}>
                  <button onClick={function() { setExportDropdown(!exportDropdown); }} title="Export report" style={{
                    background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
                    cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', color: '#64748b', fontWeight: '500'
                  }}>
                    <FaDownload size={10} /> Export
                  </button>
                  {exportDropdown && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '120px', overflow: 'hidden' }}>
                      {[
                        { fmt: 'xlsx', label: 'Excel', icon: FaFileExcel, color: '#16a34a' },
                        { fmt: 'csv', label: 'CSV', icon: FaFileCsv, color: '#2563eb' },
                        { fmt: 'pdf', label: 'PDF', icon: FaFilePdf, color: '#dc2626' },
                      ].map(function(opt) {
                        var Icon = opt.icon;
                        return (
                          <button key={opt.fmt} onClick={function() { downloadReport(opt.fmt); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#374151', textAlign: 'left' }}
                            onMouseEnter={function(e) { e.currentTarget.style.background = '#f3f4f6'; }}
                            onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; }}
                          >
                            <Icon size={12} style={{ color: opt.color }} /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{periodLabels[statsPeriod]}</p>
              {savingsStats.totalSavings > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                    borderRadius: '10px', padding: '12px', textAlign: 'center',
                    border: '1px solid #e9d5ff'
                  }}>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#7c3aed' }}>{formatCurrency(savingsStats.totalSavings)}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#8b5cf6', fontWeight: '600', textTransform: 'uppercase' }}>Total Discounts Given</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {savingsStats.offerDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Offer Discounts</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(savingsStats.offerDiscount)}</span>
                      </div>
                    )}
                    {savingsStats.manualDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Manual Discounts</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(savingsStats.manualDiscount)}</span>
                      </div>
                    )}
                    {savingsStats.loyaltyDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Loyalty Discounts</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(savingsStats.loyaltyDiscount)}</span>
                      </div>
                    )}
                    {savingsStats.couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Coupon Discounts</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(savingsStats.couponDiscount)}</span>
                      </div>
                    )}
                    {savingsStats.compItemCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Comp Items</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{savingsStats.compItemCount} items</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Orders with discounts</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>{savingsStats.ordersWithDiscount} of {filteredTotalOrders}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
                  No discounts {statsPeriod === 'all' ? 'given yet' : 'in ' + periodLabels[statsPeriod].toLowerCase()}
                </p>
              )}
            </div>

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
                            {parseDate(order.orderDate) ? parseDate(order.orderDate).toLocaleDateString() : ''}
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

            {/* Settlement / Payment History */}
            {(creditData.settlementHistory || []).length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaCheckCircle size={13} style={{ color: 'white' }} />
                  </div>
                  Payment History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {(creditData.settlementHistory || []).map(function(entry, index) {
                    var entryDate = new Date(entry.date);
                    return (
                      <div key={index} style={{
                        padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px',
                        border: '1px solid #bbf7d0', fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#166534' }}>
                            {formatCurrency(entry.amount || entry.settledAmount)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {entryDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                          <span style={{ color: '#6b7280' }}>
                            {(entry.paymentMethod || 'cash').charAt(0).toUpperCase() + (entry.paymentMethod || 'cash').slice(1)}
                            {' \u00B7 '}
                            {(entry.orderNumbers || []).map(function(n) { return '#' + n; }).join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wallet Section */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '24px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaWallet style={{ color: '#06b6d4' }} /> Wallet
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#06b6d4', marginLeft: '8px' }}>
                    {formatCurrency(walletData.walletBalance)}
                  </span>
                </h3>
                <button
                  onClick={function() { setShowAddCredit(!showAddCredit); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  <FaHandHoldingUsd size={12} /> Add Credit
                </button>
              </div>

              {showAddCredit && (
                <div style={{
                  backgroundColor: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '120px 1fr 1fr', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#0e7490', marginBottom: '4px' }}>Amount *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={creditForm.amount}
                        onChange={function(e) { var v = e.target.value.replace(/[^0-9.]/g, ''); setCreditForm(function(p) { return Object.assign({}, p, { amount: v }); }); }}
                        placeholder="0"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #a5f3fc', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#0e7490', marginBottom: '4px' }}>Reason</label>
                      <select
                        value={creditForm.reason}
                        onChange={function(e) { setCreditForm(function(p) { return Object.assign({}, p, { reason: e.target.value }); }); }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #a5f3fc', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'white' }}
                      >
                        <option value="advance_payment">Advance Payment</option>
                        <option value="refund">Refund</option>
                        <option value="compensation">Compensation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#0e7490', marginBottom: '4px' }}>Notes</label>
                      <input
                        type="text"
                        value={creditForm.notes}
                        onChange={function(e) { setCreditForm(function(p) { return Object.assign({}, p, { notes: e.target.value }); }); }}
                        placeholder="Optional notes"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #a5f3fc', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={handleAddCredit}
                      disabled={addingCredit || !creditForm.amount || parseFloat(creditForm.amount) <= 0}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: addingCredit || !creditForm.amount ? '#94a3b8' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        color: 'white', fontSize: '13px', fontWeight: '600', cursor: addingCredit ? 'default' : 'pointer'
                      }}
                    >
                      {addingCredit ? 'Adding...' : 'Add Credit'}
                    </button>
                    <button
                      onClick={function() { setShowAddCredit(false); setCreditForm({ amount: '', reason: 'advance_payment', notes: '' }); }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {walletLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading wallet...
                </div>
              ) : walletData.walletHistory.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '20px 0' }}>No wallet transactions yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' }}>Type</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' }}>Reason</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletData.walletHistory.map(function(txn, idx) {
                        return (
                          <tr key={txn.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>
                              {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                                backgroundColor: txn.type === 'credit' ? '#ecfdf5' : '#fef2f2',
                                color: txn.type === 'credit' ? '#059669' : '#dc2626'
                              }}>
                                {txn.type === 'credit' ? '+ Credit' : '- Redeem'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: txn.type === 'credit' ? '#059669' : '#dc2626' }}>
                              {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>
                              {(txn.reason || '').replace(/_/g, ' ')}
                              {txn.notes ? (' — ' + txn.notes) : ''}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                              {formatCurrency(txn.balanceAfter != null ? txn.balanceAfter : 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Details Card */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: isMobile ? '14px' : '20px'
            }}>
              <h3 style={{ margin: isMobile ? '0 0 10px' : '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
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
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{parseDate(customer.dob) ? parseDate(customer.dob).toLocaleDateString() : 'N/A'}</p>
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
                      {parseDate(customer.lastOrderDate) ? parseDate(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order History */}
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: isMobile ? '14px' : '20px'
          }}>
            <h3 style={{
              margin: isMobile ? '0 0 10px' : '0 0 16px', fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#1e293b',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaHistory size={isMobile ? 10 : 12} style={{ color: '#64748b' }} />
              </div>
              Order History
              <span style={{
                fontSize: isMobile ? '11px' : '12px', fontWeight: '600', backgroundColor: '#f1f5f9',
                color: '#64748b', padding: '2px 10px', borderRadius: '20px'
              }}>
                {statsPeriod !== 'all' ? filteredTotalOrders + ' / ' + orderHistory.length : orderHistory.length}
              </span>
            </h3>
            {sortedOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedOrders.map(function(order, index) {
                  var orderId = order.orderId || order.orderNumber || index;
                  var isExpanded = expandedOrderId === orderId;
                  var orderDate = parseDate(order.orderDate);
                  var statusBadge = (function() {
                    if (order.paymentStatus === 'due' || (order.outstandingAmount > 0 && order.paidAmount === 0)) return { label: 'Due (Udhar)', bg: '#fee2e2', color: '#dc2626' };
                    if (order.paymentStatus === 'partial' || order.outstandingAmount > 0) return { label: 'Partial', bg: '#fef3c7', color: '#92400e' };
                    if (order.status === 'completed' || order.paymentStatus === 'paid') return { label: 'Paid', bg: '#dcfce7', color: '#166534' };
                    if (order.status === 'pending') return { label: 'Pending', bg: '#fef9c3', color: '#854d0e' };
                    if (order.status === 'confirmed') return { label: 'Confirmed', bg: '#dbeafe', color: '#1e40af' };
                    return null;
                  })();
                  return (
                    <div key={orderId} style={{
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      overflow: 'hidden',
                      transition: 'background-color 0.15s'
                    }}>
                      <div
                        onClick={function() { setExpandedOrderId(isExpanded ? null : orderId); }}
                        style={{
                          padding: isMobile ? '10px 12px' : '14px 16px',
                          backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#1e293b' }}>
                                {order.dailyOrderId ? '#' + order.dailyOrderId : order.orderNumber}
                              </span>
                              {statusBadge && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600',
                                  backgroundColor: statusBadge.bg, color: statusBadge.color
                                }}>
                                  {statusBadge.label}
                                </span>
                              )}
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
                              {order.orderSource === 'online_order' && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                                  fontWeight: '600', backgroundColor: '#dbeafe', color: '#1d4ed8'
                                }}>
                                  Online
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: isMobile ? '11px' : '12px', color: '#94a3b8' }}>
                              {orderDate ? orderDate.toLocaleDateString() : ''}{orderDate ? ' at ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              {order.tableNumber ? ' \u00B7 Table ' + order.tableNumber : ''}
                              {order.itemsCount ? ' \u00B7 ' + order.itemsCount + ' items' : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: '#1e293b' }}>
                                {formatCurrency(order.finalAmount || order.totalAmount)}
                              </p>
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
                              {order.outstandingAmount > 0 && (
                                <div style={{ marginTop: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '2px' }}>
                                    <span style={{
                                      fontSize: '9px', fontWeight: 700, color: 'white', backgroundColor: '#ef4444',
                                      padding: '1px 6px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>DUE</span>
                                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
                                      {formatCurrency(order.outstandingAmount)}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textAlign: 'right' }}>
                                    Paid {formatCurrency((order.finalAmount || order.totalAmount) - order.outstandingAmount)} of {formatCurrency(order.finalAmount || order.totalAmount)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div style={{ paddingTop: '4px', color: '#94a3b8' }}>
                              {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Expanded detail section */}
                      {isExpanded && (
                        <div style={{
                          padding: isMobile ? '10px 12px' : '14px 16px',
                          backgroundColor: '#f1f5f9',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          {/* Items list */}
                          {order.items && order.items.length > 0 ? (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {order.items.map(function(item, i) {
                                  return (
                                    <div key={i} style={{
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      padding: '6px 10px', backgroundColor: 'white', borderRadius: '6px',
                                      fontSize: '13px'
                                    }}>
                                      <span style={{ color: '#1e293b' }}>
                                        <span style={{ fontWeight: '600' }}>{item.quantity || item.qty || 1}x</span>{' '}
                                        {item.name || item.itemName || 'Item'}
                                      </span>
                                      <span style={{ fontWeight: '600', color: '#475569' }}>
                                        {formatCurrency(item.price || item.itemTotal || item.amount || 0)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : order.itemsCount ? (
                            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
                              {order.itemsCount} items in this order
                            </p>
                          ) : null}
                          {/* Billing breakup */}
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '4px',
                            padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
                            fontSize: '13px'
                          }}>
                            {(order.subtotal || order.subTotal) > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Subtotal</span>
                                <span style={{ color: '#1e293b' }}>{formatCurrency(order.subtotal || order.subTotal)}</span>
                              </div>
                            )}
                            {(order.discountAmount || 0) > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#16a34a' }}>Discount{(() => { const offerName = typeof order.appliedOffer === 'string' ? order.appliedOffer : (order.appliedOffer?.name || order.selectedOfferName); return offerName ? ` (${offerName})` : ''; })()}</span>
                                <span style={{ color: '#16a34a' }}>-{formatCurrency(order.discountAmount)}</span>
                              </div>
                            )}
                            {(order.manualDiscount || 0) > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#16a34a' }}>Manual Discount</span>
                                <span style={{ color: '#16a34a' }}>-{formatCurrency(order.manualDiscount)}</span>
                              </div>
                            )}
                            {(order.loyaltyDiscount || 0) > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c3aed' }}>Loyalty Points</span>
                                <span style={{ color: '#7c3aed' }}>-{formatCurrency(order.loyaltyDiscount)}</span>
                              </div>
                            )}
                            {(order.couponDiscount || 0) > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#16a34a' }}>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                                <span style={{ color: '#16a34a' }}>-{formatCurrency(order.couponDiscount)}</span>
                              </div>
                            )}
                            {order.serviceChargeAmount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c3aed' }}>Service Charge{order.serviceChargeRate ? ` (${order.serviceChargeRate}%)` : ''}</span>
                                <span style={{ color: '#7c3aed' }}>{formatCurrency(order.serviceChargeAmount)}</span>
                              </div>
                            )}
                            {(order.taxAmount > 0 || order.totalTax > 0) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>{order.taxBreakdown?.length > 0 ? order.taxBreakdown.map(t => `${t.name}${t.rate ? ` ${t.rate}%` : ''}`).join(', ') : 'Tax'}</span>
                                <span style={{ color: '#1e293b' }}>{formatCurrency(order.taxAmount || order.totalTax)}</span>
                              </div>
                            )}
                            {order.tipAmount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#d97706' }}>Tip</span>
                                <span style={{ color: '#d97706' }}>{formatCurrency(order.tipAmount)}</span>
                              </div>
                            )}
                            {order.roundOffAmount != null && order.roundOffAmount !== 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#9ca3af' }}>Round Off</span>
                                <span style={{ color: '#9ca3af' }}>{order.roundOffAmount > 0 ? '+' : ''}{formatCurrency(order.roundOffAmount)}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>Total</span>
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>{formatCurrency(order.finalAmount || order.totalAmount)}</span>
                            </div>
                          </div>
                          {/* Payment method */}
                          {order.paymentMethod && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaWallet size={11} style={{ color: '#94a3b8' }} />
                              Payment: <span style={{ fontWeight: '600', color: '#475569' }}>{order.paymentMethod}</span>
                            </div>
                          )}
                        </div>
                      )}
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

      {showEditForm && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
          zIndex: 9999, padding: isMobile ? '0' : '32px',
          paddingBottom: isMobileEmbed ? '70px' : (isMobile ? '0' : '32px'),
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: isMobile ? '100%' : '480px',
            maxHeight: isMobileEmbed ? '80vh' : (isMobile ? '85vh' : '90vh'),
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: isMobile ? '16px 20px' : '20px 24px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#1f2937' }}>Edit Customer</h2>
              <button onClick={function() { setShowEditForm(false); setFormErrors({}); }} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                color: '#6b7280', padding: '8px', cursor: 'pointer'
              }}>
                <FaTimes size={14} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: isMobile ? '16px 20px' : '24px', overflowY: 'auto', flex: 1 }}>
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
        </div>,
        document.body
      )}

      {/* Bulk Settle Modal */}
      {showBulkSettle && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
          zIndex: 9999, padding: isMobile ? '0' : '32px',
          paddingBottom: isMobileEmbed ? '70px' : (isMobile ? '0' : '32px'),
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            width: isMobile ? '100%' : '480px', maxHeight: isMobile ? '85vh' : '80vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Receive Payment</h3>
              <button onClick={function() { setShowBulkSettle(false); setBulkPaymentAmount(''); setSelectedSettleOrders([]); setBulkUpdateOrderStatus(false); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280'
              }}>
                <FaTimes size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {/* Amount input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Amount Received
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={bulkPaymentAmount}
                  onChange={function(e) {
                    setBulkPaymentAmount(e.target.value);
                    setSelectedSettleOrders([]);
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: '10px',
                    fontSize: '16px', fontWeight: '700', outline: 'none', boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              {/* Order selection */}
              {parseFloat(bulkPaymentAmount) > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                    Select orders to settle:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                    {(function() {
                      var unsettled = creditData.creditHistory.filter(function(e) { return !e.settledAt && e.outstandingAmount > 0; });
                      var payAmount = parseFloat(bulkPaymentAmount) || 0;
                      var selectedTotal = unsettled.filter(function(e) { return selectedSettleOrders.includes(e.orderId); })
                        .reduce(function(sum, e) { return sum + e.outstandingAmount; }, 0);

                      return unsettled.map(function(entry) {
                        var isSelected = selectedSettleOrders.includes(entry.orderId);
                        var wouldExceed = !isSelected && (selectedTotal + entry.outstandingAmount > payAmount);
                        var entryDate = new Date(entry.date);

                        return (
                          <label key={entry.orderId} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '8px',
                            backgroundColor: isSelected ? '#f0fdf4' : wouldExceed ? '#f9fafb' : '#f8fafc',
                            border: isSelected ? '1.5px solid #86efac' : '1px solid #e5e7eb',
                            cursor: wouldExceed ? 'not-allowed' : 'pointer',
                            opacity: wouldExceed ? 0.5 : 1,
                            transition: 'all 0.15s'
                          }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={wouldExceed}
                              onChange={function() {
                                if (isSelected) {
                                  setSelectedSettleOrders(selectedSettleOrders.filter(function(id) { return id !== entry.orderId; }));
                                } else if (!wouldExceed) {
                                  setSelectedSettleOrders([].concat(selectedSettleOrders, [entry.orderId]));
                                }
                              }}
                              style={{ accentColor: '#16a34a', width: '16px', height: '16px', cursor: wouldExceed ? 'not-allowed' : 'pointer' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                  #{entry.orderNumber}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#16a34a' : '#dc2626' }}>
                                  {formatCurrency(entry.outstandingAmount)}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                {entryDate.toLocaleDateString()}
                                {entry.paidAmount > 0 ? ' \u00B7 Paid ' + formatCurrency(entry.paidAmount) + ' of ' + formatCurrency(entry.totalAmount) : ' \u00B7 Full due'}
                              </div>
                            </div>
                            {isSelected && (
                              <FaCheckCircle size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                            )}
                          </label>
                        );
                      });
                    })()}
                  </div>

                  {/* Summary */}
                  {selectedSettleOrders.length > 0 && (
                    <div style={{
                      marginTop: '12px', padding: '10px 12px', backgroundColor: '#f0fdf4',
                      borderRadius: '8px', border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ color: '#475569' }}>Selected ({selectedSettleOrders.length} orders)</span>
                        <span style={{ fontWeight: '700', color: '#166534' }}>
                          {formatCurrency(creditData.creditHistory
                            .filter(function(e) { return selectedSettleOrders.includes(e.orderId); })
                            .reduce(function(sum, e) { return sum + e.outstandingAmount; }, 0)
                          )}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#6b7280' }}>Remaining from {formatCurrency(parseFloat(bulkPaymentAmount))}</span>
                        <span style={{ color: '#6b7280' }}>
                          {formatCurrency(Math.max(0, parseFloat(bulkPaymentAmount) - creditData.creditHistory
                            .filter(function(e) { return selectedSettleOrders.includes(e.orderId); })
                            .reduce(function(sum, e) { return sum + e.outstandingAmount; }, 0)
                          ))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Update order status checkbox */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px',
                    fontSize: '12px', color: '#475569', cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={bulkUpdateOrderStatus}
                      onChange={function(e) { setBulkUpdateOrderStatus(e.target.checked); }}
                      style={{ accentColor: '#16a34a' }}
                    />
                    Also mark selected orders as Completed
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid #e5e7eb',
              display: 'flex', gap: '10px', justifyContent: 'flex-end'
            }}>
              <button onClick={function() { setShowBulkSettle(false); setBulkPaymentAmount(''); setSelectedSettleOrders([]); setBulkUpdateOrderStatus(false); }} style={{
                padding: '8px 18px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: 'white', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer'
              }}>
                Cancel
              </button>
              <button
                onClick={handleBulkSettle}
                disabled={bulkSettling || selectedSettleOrders.length === 0}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none',
                  background: (bulkSettling || selectedSettleOrders.length === 0) ? '#d1d5db' : '#16a34a',
                  fontSize: '13px', fontWeight: '600', color: 'white',
                  cursor: (bulkSettling || selectedSettleOrders.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {bulkSettling && <FaSpinner className="animate-spin" size={12} />}
                {bulkSettling ? 'Settling...' : 'Settle ' + formatCurrency(
                  creditData.creditHistory
                    .filter(function(e) { return selectedSettleOrders.includes(e.orderId); })
                    .reduce(function(sum, e) { return sum + e.outstandingAmount; }, 0)
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerDetail;
