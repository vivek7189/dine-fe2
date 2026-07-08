'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaGift,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaChartBar,
  FaChevronRight,
} from 'react-icons/fa';

export default function CompReportPage() {
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

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  // Load restaurant info (same resolution as sales-summary page)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        let rid = null;
        let rName = '';

        // Staff: use assigned restaurant
        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          rid = userData.restaurantId;
          rName = userData.restaurant?.name || 'Restaurant';
        } else {
          // Owner: use selectedRestaurantId from localStorage, or fetch from API
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
              // Last fallback
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
      const res = await apiClient.getCompReport(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch comp report error:', err);
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
      router.replace(`/comp-report?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/comp-report?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Filtered orders
  const orders = data?.orders || [];
  const filteredOrders = searchTerm
    ? orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const orderNum = (o.dailyOrderId ? `#${o.dailyOrderId}` : o.orderNumber || '').toLowerCase();
        const reason = (o.reason || '').toLowerCase();
        const approvedBy = (o.approvedBy || '').toLowerCase();
        return orderNum.includes(term) || reason.includes(term) || approvedBy.includes(term);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Order #', 'Original Amount', 'Comp Amount', 'Reason', 'Approved By', 'Items', 'Date'],
      ...orders.map(o => [
        o.dailyOrderId ? `#${o.dailyOrderId}` : o.orderNumber || '-',
        o.totalAmount || 0,
        o.compAmount || 0,
        o.reason || '-',
        o.approvedBy || '-',
        (o.items || []).map(i => i.name).filter(Boolean).join(', ') || '-',
        o.createdAt ? new Date(o.createdAt).toLocaleString() : '-',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 16 },
      { wch: 14 },
      { wch: 30 },
      { wch: 20 },
      { wch: 40 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Comp Report');
    XLSX.writeFile(wb, `comp-report-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <FaGift className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Comp Report</h1>
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
                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none cursor-pointer"
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
            <FaSpinner className="animate-spin text-red-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaGift className="text-red-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Comp Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.summary?.totalCompOrders || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Value Comped</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(data.summary?.totalCompValue || 0)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaChartBar className="text-purple-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">% of Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.summary?.percentOfOrders || 0}%</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaChartBar className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.summary?.totalOrdersInPeriod || 0}</div>
              </div>
            </div>

            {/* Comp Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Complimentary Orders
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                        <th className="px-4 py-2.5 font-semibold w-8"></th>
                        <th className="px-4 py-2.5 font-semibold">Order #</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Original Amount</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Comp Amount</th>
                        <th className="px-4 py-2.5 font-semibold">Reason</th>
                        <th className="px-4 py-2.5 font-semibold">Approved By</th>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
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
                                <FaChevronRight
                                  className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-800 text-sm font-mono">
                                  {order.dailyOrderId ? `#${order.dailyOrderId}` : order.orderNumber || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">
                                {formatCurrency(order.totalAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-red-600 text-sm">
                                {formatCurrency(order.compAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                                {order.reason || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {order.approvedBy || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                            {isExpanded && order.items && order.items.length > 0 && (
                              <tr>
                                <td colSpan={7} className="bg-gray-50/50 px-4 py-0">
                                  <div className="py-3 pl-8">
                                    <table className="w-full max-w-lg">
                                      <thead>
                                        <tr className="text-left text-[11px] text-gray-400 uppercase">
                                          <th className="pb-1.5 font-semibold">Item</th>
                                          <th className="pb-1.5 font-semibold text-center">Qty</th>
                                          <th className="pb-1.5 font-semibold text-right">Price</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {order.items.map((item, idx) => (
                                          <tr key={idx}>
                                            <td className="py-1.5 text-sm text-gray-700">{item.name}</td>
                                            <td className="py-1.5 text-sm text-gray-600 text-center">{item.qty}</td>
                                            <td className="py-1.5 text-sm text-gray-600 text-right">{formatCurrency(item.price || 0)}</td>
                                          </tr>
                                        ))}
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
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No orders match your search' : 'No complimentary orders in this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaGift className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No complimentary orders in this period</p>
            <p className="text-sm mt-1">Comp orders will appear here when recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
