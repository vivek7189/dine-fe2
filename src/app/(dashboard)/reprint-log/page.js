'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaPrint,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaChartBar,
  FaPercentage,
  FaReceipt,
  FaChevronRight,
} from 'react-icons/fa';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function ReprintLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();

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

  // Staff filter
  const [selectedStaff, setSelectedStaff] = useState('');

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
      const res = await apiClient.getReprintLog(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch reprint log error:', err);
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
      router.replace(`/reprint-log?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/reprint-log?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  // Extract unique staff names from all billReprintHistory entries
  const staffNames = (() => {
    if (!data?.orders) return [];
    const names = new Set();
    data.orders.forEach(order => {
      (order.billReprintHistory || []).forEach(entry => {
        if (entry.reprintedByName) names.add(entry.reprintedByName);
      });
    });
    return Array.from(names).sort();
  })();

  // Filter orders by search term and staff
  const filteredOrders = (() => {
    if (!data?.orders) return [];
    return data.orders.filter(order => {
      // Staff filter
      if (selectedStaff) {
        const hasStaff = (order.billReprintHistory || []).some(
          entry => entry.reprintedByName === selectedStaff
        );
        if (!hasStaff) return false;
      }
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const orderNum = (order.orderNumber || '').toLowerCase();
        const dailyId = String(order.dailyOrderId || '').toLowerCase();
        const staffMatch = (order.billReprintHistory || []).some(
          entry => (entry.reprintedByName || '').toLowerCase().includes(term)
        );
        return orderNum.includes(term) || dailyId.includes(term) || staffMatch;
      }
      return true;
    });
  })();

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getLastReprint = (order) => {
    const history = order.billReprintHistory || [];
    return history.length > 0 ? history[history.length - 1] : null;
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

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Order #', 'Amount', 'Reprint Count', 'Last Reprinted At', 'Reprinted By', 'All Reprint History'],
      ...(data?.orders || []).map(order => {
        const lastReprint = getLastReprint(order);
        const historyStr = (order.billReprintHistory || [])
          .map(entry => `${entry.reprintedByName || 'Unknown'} at ${formatDateTime(entry.reprintedAt)}`)
          .join('; ');
        return [
          order.dailyOrderId || order.orderNumber || order.id,
          order.totalAmount || 0,
          order.billReprintCount || 0,
          lastReprint ? formatDateTime(lastReprint.reprintedAt) : '-',
          lastReprint?.reprintedByName || '-',
          historyStr || '-',
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 24 },
      { wch: 18 },
      { wch: 60 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Reprint Log');
    XLSX.writeFile(wb, `reprint-log-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <FaPrint className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reprint Check Log</h1>
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
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
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
            <FaSpinner className="animate-spin text-orange-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaPrint className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Reprints</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.totalReprints || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaChartBar className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Orders Reprinted</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.totalOrdersWithReprints || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaPercentage className="text-red-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Reprint Rate</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {data.reprintPercentage != null ? `${data.reprintPercentage}%` : '0%'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FaReceipt className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.totalOrdersInPeriod || 0}</div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Reprint Details
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Staff Filter */}
                  {staffNames.length > 0 && (
                    <div className="relative">
                      <select
                        value={selectedStaff}
                        onChange={e => setSelectedStaff(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
                      >
                        <option value="">All Staff</option>
                        {staffNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                    </div>
                  )}
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search order # or staff..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-52 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                        <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Reprint Count</th>
                        <th className="px-4 py-2.5 font-semibold">Last Reprinted</th>
                        <th className="px-4 py-2.5 font-semibold">Reprinted By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((order) => {
                        const lastReprint = getLastReprint(order);
                        const isExpanded = expandedRows[order.id];
                        const history = order.billReprintHistory || [];
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
                                  {order.dailyOrderId ? `#${order.dailyOrderId}` : order.orderNumber || order.id}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">
                                {formatCurrency(order.totalAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center bg-orange-50 text-orange-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                  {order.billReprintCount || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {lastReprint ? formatDateTime(lastReprint.reprintedAt) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {lastReprint?.reprintedByName || '-'}
                              </td>
                            </tr>
                            {/* Expanded Row - Reprint History Timeline */}
                            {isExpanded && history.length > 0 && (
                              <tr>
                                <td colSpan={6} className="bg-gray-50/60 px-4 py-4">
                                  <div className="ml-8 sm:ml-12">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Reprint History</p>
                                    <div className="relative">
                                      {/* Vertical timeline line */}
                                      <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-orange-200" />
                                      <div className="space-y-3">
                                        {history.map((entry, idx) => (
                                          <div key={idx} className="flex items-start gap-3 relative">
                                            {/* Timeline dot */}
                                            <div className="w-[11px] h-[11px] rounded-full bg-orange-400 border-2 border-white shadow-sm flex-shrink-0 mt-0.5 z-10" />
                                            <div className="text-sm text-gray-700">
                                              <span className="font-medium">{entry.reprintedByName || 'Unknown'}</span>
                                              <span className="text-gray-400 mx-1.5">&middot;</span>
                                              <span className="text-gray-500">{formatTime(entry.reprintedAt)}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
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
                  {searchTerm || selectedStaff
                    ? 'No orders match your filters'
                    : (
                      <div>
                        <FaPrint className="text-5xl mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No bill reprints recorded in this period</p>
                        <p className="text-sm mt-1">Bill reprints will appear here when staff reprint any bills</p>
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaPrint className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No bill reprints recorded in this period</p>
            <p className="text-sm mt-1">Bill reprints will appear here when staff reprint any bills</p>
          </div>
        )}
      </div>
    </div>
  );
}
