'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  FaSpinner,
  FaCalendarAlt,
  FaBan,
  FaTrash,
  FaFileExcel,
  FaExclamationTriangle,
  FaUser,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

export default function CancelledOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();

  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);

  // Period from URL or default to 'today'
  const urlPeriod = searchParams.get('period');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const [activePeriod, setActivePeriod] = useState(urlPeriod || 'today');
  const [customStartDate, setCustomStartDate] = useState(urlStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(urlEndDate || '');
  const [showCustomPicker, setShowCustomPicker] = useState(urlPeriod === 'custom');

  // Filter: all | cancelled | deleted
  const [activeFilter, setActiveFilter] = useState('all');

  // Expanded order detail
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Load restaurant info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        let rid = null;
        let rName = '';
        if (userData.role === 'owner') {
          const res = await apiClient.getRestaurants();
          if (res.restaurants?.length > 0) {
            rid = res.restaurants[0].id;
            rName = res.restaurants[0].name || '';
          }
        } else {
          rid = userData.restaurantId;
          rName = userData.restaurantName || '';
        }
        setRestaurantId(rid);
        setRestaurantName(rName);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
  }, []);

  const fetchReport = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const options = { type: activeFilter };
      if (activePeriod === 'custom' && customStartDate && customEndDate) {
        options.startDate = customStartDate;
        options.endDate = customEndDate;
      } else if (activePeriod !== 'custom') {
        options.period = activePeriod;
      }
      const res = await apiClient.getCancelledOrdersReport(restaurantId, options);
      if (res?.success) {
        setSummary(res.summary);
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Fetch cancelled orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, activePeriod, customStartDate, customEndDate, activeFilter]);

  useEffect(() => {
    if (restaurantId) fetchReport();
  }, [restaurantId, fetchReport]);

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    setShowCustomPicker(period === 'custom');
    if (period !== 'custom') {
      const params = new URLSearchParams();
      params.set('period', period);
      router.replace(`/cancelled-orders?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/cancelled-orders?${params.toString()}`, { scroll: false });
      fetchReport();
    }
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: 'custom', label: 'Custom' },
  ];

  const getPeriodLabel = () => {
    if (activePeriod === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    return periods.find(p => p.key === activePeriod)?.label || 'Today';
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleExportExcel = () => {
    try {
      const XLSX = require('xlsx');
      const rows = orders.map(o => ({
        'Order #': o.orderNumber || o.id?.slice(-6) || '-',
        'Status': o.status === 'cancelled' ? 'Cancelled' : 'Deleted',
        'Date': formatDate(o.cancelledAt || o.deletedAt),
        'Amount': o.totalAmount || 0,
        'Items': o.itemsSummary || '-',
        'By': o.cancelledByName || o.cancelledBy || '-',
        'Reason': o.reason || '-',
        'Order Type': o.orderType || '-',
        'Table': o.tableNumber || '-',
        'Payment': o.paymentMethod || '-',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cancelled Orders');
      XLSX.writeFile(wb, `cancelled-orders-${getPeriodLabel().replace(/\s/g, '-')}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const topReason = summary?.byReason?.[0]?.reason || '-';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cancelled & Deleted Orders</h1>
            {restaurantName && <p className="text-sm text-gray-500 mt-0.5">{restaurantName}</p>}
          </div>
          <button
            onClick={handleExportExcel}
            disabled={!orders.length}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <FaFileExcel size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-4">
        {/* Period Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activePeriod === p.key
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {showCustomPicker && (
            <div className="flex flex-wrap items-end gap-3 mt-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', icon: null },
            { key: 'cancelled', label: 'Cancelled', icon: FaBan },
            { key: 'deleted', label: 'Deleted', icon: FaTrash },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeFilter === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.icon && <tab.icon size={12} />}
              {tab.label}
              {summary && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.key === 'all' ? summary.totalCount : tab.key === 'cancelled' ? summary.totalCancelled : summary.totalDeleted}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <FaExclamationTriangle className="text-red-500" size={18} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{summary?.totalCount || 0}</div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-gray-400">
                  <span>{summary?.totalCancelled || 0} cancelled</span>
                  <span>{summary?.totalDeleted || 0} deleted</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FaCalendarAlt className="text-amber-500" size={18} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalValueLost || 0)}</div>
                    <div className="text-xs text-gray-500">Total Value Lost</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FaUser className="text-blue-500" size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{topReason}</div>
                    <div className="text-xs text-gray-500">Top Reason</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Breakdown */}
            {summary?.byStaff?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">By Staff</h3>
                <div className="space-y-2">
                  {summary.byStaff.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{s.count} orders</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reason Breakdown */}
            {summary?.byReason?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">By Reason</h3>
                <div className="space-y-2">
                  {summary.byReason.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{r.reason}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-wise Breakdown */}
            {summary?.dailyBreakdown?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Day-wise Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Cancelled</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Deleted</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Value Lost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.dailyBreakdown.map((d, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-2 text-gray-700">{d.date}</td>
                          <td className="px-4 py-2 text-center text-gray-600">{d.cancelled}</td>
                          <td className="px-4 py-2 text-center text-gray-600">{d.deleted}</td>
                          <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(d.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Orders ({orders.length})</h3>
              </div>
              {orders.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400 text-sm">
                  No cancelled or deleted orders found for this period.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map(order => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <div key={order.id}>
                        <div
                          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {order.status === 'cancelled' ? 'CANCELLED' : 'DELETED'}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.orderNumber || order.id?.slice(-6)}
                                {order.tableNumber && <span className="text-gray-400 ml-1.5">T{order.tableNumber}</span>}
                              </div>
                              <div className="text-xs text-gray-400 truncate">{order.itemsSummary || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                              <div className="text-[10px] text-gray-400">{formatDate(order.cancelledAt || order.deletedAt)}</div>
                            </div>
                            {isExpanded ? <FaChevronUp size={10} className="text-gray-400" /> : <FaChevronDown size={10} className="text-gray-400" />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                              <div>
                                <span className="text-gray-400 block">By</span>
                                <span className="text-gray-700 font-medium">{order.cancelledByName || order.cancelledBy || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Reason</span>
                                <span className="text-gray-700 font-medium">{order.reason || 'No reason'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Order Type</span>
                                <span className="text-gray-700 font-medium">{order.orderType || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Payment</span>
                                <span className="text-gray-700 font-medium">{order.paymentMethod || '-'}</span>
                              </div>
                              {order.lastStatus && (
                                <div>
                                  <span className="text-gray-400 block">Was</span>
                                  <span className="text-gray-700 font-medium capitalize">{order.lastStatus}</span>
                                </div>
                              )}
                              {order.customerInfo?.name && (
                                <div>
                                  <span className="text-gray-400 block">Customer</span>
                                  <span className="text-gray-700 font-medium">{order.customerInfo.name}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-400 block">Items</span>
                                <span className="text-gray-700 font-medium">{order.itemCount} items</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
