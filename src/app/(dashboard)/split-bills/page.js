'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaCut,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaChartBar,
  FaChevronRight,
} from 'react-icons/fa';

const getMethodColor = (method) => {
  const colors = {
    cash: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    card: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    upi: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    online: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    wallet: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  };
  return colors[method?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
};

const getMethodIcon = (method) => {
  switch (method?.toLowerCase()) {
    case 'cash': return '$';
    case 'card': return '\u2660';
    case 'upi': return 'U';
    default: return '\u2B24';
  }
};

export default function SplitBillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Period from URL or default to 'today'
  const urlPeriod = searchParams.get('period');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const [activePeriod, setActivePeriod] = useState(urlPeriod || 'today');
  const [customStartDate, setCustomStartDate] = useState(urlStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(urlEndDate || '');
  const [showCustomPicker, setShowCustomPicker] = useState(urlPeriod === 'custom');

  // Sub-restaurant filtering
  const [subRestaurants, setSubRestaurants] = useState([]);
  const [selectedSubRestaurant, setSelectedSubRestaurant] = useState('');

  // Search filter for table
  const [searchTerm, setSearchTerm] = useState('');

  // Expandable rows
  const [expandedRows, setExpandedRows] = useState({});

  // Load restaurant info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        let rid = null;
        let rName = '';

        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          rid = userData.restaurantId;
          rName = userData.restaurant?.name || 'Restaurant';
        } else {
          const savedId = localStorage.getItem('selectedRestaurantId');
          const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
          if (savedId && savedRestaurant) {
            rid = savedId;
            rName = savedRestaurant.name || '';
          } else {
            try {
              const res = await apiClient.getRestaurants();
              const restaurants = res.restaurants || [];
              const defaultId = res.defaultRestaurantId;
              const resolved = (defaultId ? restaurants.find(r => r.id === defaultId) : null) || restaurants[0];
              if (resolved) {
                rid = resolved.id;
                rName = resolved.name || '';
              }
            } catch (e) {
              rid = userData.restaurantId || userData.restaurant?.id;
              rName = userData.restaurant?.name || '';
            }
          }
        }

        setRestaurantId(rid);
        setRestaurantName(rName);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  // Load sub-restaurants when restaurant changes
  useEffect(() => {
    if (!restaurantId) return;
    const loadSubRestaurants = async () => {
      try {
        const res = await apiClient.getSubRestaurants(restaurantId);
        setSubRestaurants(res.subRestaurants || []);
      } catch (err) {
        console.error('Error loading sub-restaurants:', err);
        setSubRestaurants([]);
      }
    };
    loadSubRestaurants();
    setSelectedSubRestaurant('');
  }, [restaurantId]);

  // Compute date range from active period
  const getDateRange = useCallback(() => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];

    switch (activePeriod) {
      case 'today':
        return { startDate: fmt(today), endDate: fmt(today) };
      case 'yesterday': {
        const yd = new Date(today);
        yd.setDate(yd.getDate() - 1);
        return { startDate: fmt(yd), endDate: fmt(yd) };
      }
      case '7d': {
        const d7 = new Date(today);
        d7.setDate(d7.getDate() - 6);
        return { startDate: fmt(d7), endDate: fmt(today) };
      }
      case '30d': {
        const d30 = new Date(today);
        d30.setDate(d30.getDate() - 29);
        return { startDate: fmt(d30), endDate: fmt(today) };
      }
      case 'custom':
        if (customStartDate && customEndDate) {
          return { startDate: customStartDate, endDate: customEndDate };
        }
        return null;
      default:
        return { startDate: fmt(today), endDate: fmt(today) };
    }
  }, [activePeriod, customStartDate, customEndDate]);

  const fetchData = useCallback(async () => {
    if (!restaurantId) return;
    const range = getDateRange();
    if (!range) return;

    setLoading(true);
    try {
      const options = {
        startDate: range.startDate,
        endDate: range.endDate,
      };
      if (selectedSubRestaurant) {
        options.subRestaurantId = selectedSubRestaurant;
      }
      const res = await apiClient.getSplitBills(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch split bills error:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, getDateRange, selectedSubRestaurant]);

  useEffect(() => {
    if (restaurantId) fetchData();
  }, [restaurantId, fetchData]);

  // Update URL when period changes
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    setShowCustomPicker(period === 'custom');
    if (period !== 'custom') {
      const params = new URLSearchParams();
      params.set('period', period);
      router.replace(`/split-bills?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/split-bills?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  // Orders data
  const orders = data?.orders || [];

  // KPI computations
  const totalSplitOrders = data?.summary?.totalSplitOrders || 0;
  const avgSplitsPerOrder = data?.summary?.avgSplitsPerOrder || 0;
  const mostCommonMethod = data?.summary?.mostCommonMethod || '-';
  const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Method breakdown
  const methodBreakdown = data?.methodBreakdown || {};

  // Filtered orders for table
  const filteredOrders = searchTerm
    ? orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const orderNum = (o.orderNumber || '').toLowerCase();
        const dailyId = String(o.dailyOrderId || '');
        return orderNum.includes(term) || dailyId.includes(term);
      })
    : orders;

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

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const capitalize = (str) => {
    if (!str || str === '-') return '-';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Order #', 'Total Amount', 'Split Count', 'Split Details', 'Date'],
      ...orders.map(o => [
        o.dailyOrderId || o.orderNumber || '-',
        o.totalAmount || 0,
        o.splitCount || 0,
        (o.splitPayments || []).map(sp => `${capitalize(sp.method)}: ${sp.amount}`).join(', '),
        formatDate(o.createdAt),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 40 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Split Bills');
    XLSX.writeFile(wb, `split-bills-report-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                <FaCut className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Split Bills Report</h1>
                <p className="text-xs text-gray-500">{restaurantName} &middot; {getPeriodLabel()}</p>
              </div>
            </div>
          </div>

          {/* Period Tabs */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activePeriod === p.key
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {showCustomPicker && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}

          {/* Sub-restaurant Filter */}
          {subRestaurants.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 font-medium">Section:</span>
              <div className="relative">
                <select
                  value={selectedSubRestaurant}
                  onChange={e => setSelectedSubRestaurant(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none cursor-pointer"
                >
                  <option value="">All Sections</option>
                  {subRestaurants.map(sr => (
                    <option key={sr.id} value={sr.id}>{sr.name}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-teal-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaCut className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Split Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalSplitOrders}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaChartBar className="text-purple-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Avg Splits</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{avgSplitsPerOrder}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{getMethodIcon(mostCommonMethod)}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Common Method</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{capitalize(mostCommonMethod)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Value</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
              </div>
            </div>

            {/* Method Breakdown */}
            {Object.keys(methodBreakdown).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {Object.entries(methodBreakdown).map(([method, info]) => {
                  const color = getMethodColor(method);
                  return (
                    <div
                      key={method}
                      className={`${color.bg} rounded-xl p-3 border ${color.border}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${color.text} uppercase`}>{capitalize(method)}</span>
                      </div>
                      <div className={`text-lg font-bold ${color.text}`}>{formatCurrency(info.total || 0)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{info.count || 0} transactions</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Split Bill Orders
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({orders.length} orders)
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search order number..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleExcelDownload}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FaFileExcel className="text-xs" />
                    <span className="hidden sm:inline">Download Excel</span>
                    <span className="sm:hidden">Excel</span>
                  </button>
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold">Order #</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Total Amount</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Split Count</th>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                        <th className="px-4 py-2.5 font-semibold text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedRows[order.id];
                        return (
                          <Fragment key={order.id}>
                            <tr
                              className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                              onClick={() => toggleRow(order.id)}
                            >
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-800 text-sm font-mono">
                                  {order.dailyOrderId ? `#${order.dailyOrderId}` : order.orderNumber || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">
                                {formatCurrency(order.totalAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center bg-teal-50 text-teal-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                  {order.splitCount || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <FaChevronRight
                                  className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="px-4 py-0">
                                  <div className="bg-gray-50 rounded-lg p-3 my-2 mx-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Split Payment Details</h4>
                                    <table className="w-full">
                                      <thead>
                                        <tr className="text-left text-[11px] text-gray-400 uppercase">
                                          <th className="pb-1.5 font-semibold">Method</th>
                                          <th className="pb-1.5 font-semibold text-right">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {(order.splitPayments || []).map((sp, idx) => {
                                          const color = getMethodColor(sp.method);
                                          return (
                                            <tr key={idx}>
                                              <td className="py-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
                                                  {capitalize(sp.method)}
                                                </span>
                                              </td>
                                              <td className="py-2 text-right font-semibold text-gray-800 text-sm">
                                                {formatCurrency(sp.amount || 0)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                        <td className="px-4 py-3 text-gray-800">Total</td>
                        <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(totalValue)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-teal-100 text-teal-800 font-bold text-sm px-3 py-0.5 rounded-full">
                            {orders.length}
                          </span>
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No orders match your search' : 'No split bill orders in this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaCut className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No split bill orders in this period</p>
            <p className="text-sm mt-1">Split bill orders will appear here once customers split their payments</p>
          </div>
        )}
      </div>
    </div>
  );
}
