'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaClock,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaChartBar,
  FaSearch,
} from 'react-icons/fa';

const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
};

export default function HourlySalesPage() {
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
      const res = await apiClient.getHourlySales(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch hourly sales error:', err);
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
      router.replace(`/hourly-report?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/hourly-report?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  // Derive hourly data array (24 entries for hours 0-23)
  const hourlyData = (() => {
    if (!data?.hourlyBreakdown) return [];
    // Normalize to array of 24 entries
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const entry = data.hourlyBreakdown[h] || data.hourlyBreakdown[String(h)] || {};
      hours.push({
        hour: h,
        orders: entry.orders || entry.count || 0,
        revenue: entry.revenue || entry.amount || 0,
        topItems: entry.topItems || entry.items || [],
      });
    }
    return hours;
  })();

  // KPI computations
  const totalOrders = hourlyData.reduce((s, h) => s + h.orders, 0);
  const totalRevenue = hourlyData.reduce((s, h) => s + h.revenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const peakHourEntry = hourlyData.reduce((max, h) => h.orders > max.orders ? h : max, { hour: 0, orders: 0 });
  const maxOrders = Math.max(...hourlyData.map(h => h.orders), 1);

  // Filtered hourly data for table
  const filteredHourlyData = searchTerm
    ? hourlyData.filter(h => {
        const term = searchTerm.toLowerCase();
        const hourLabel = formatHour(h.hour).toLowerCase();
        const itemNames = (h.topItems || []).map(i => (typeof i === 'string' ? i : i.name || '')).join(' ').toLowerCase();
        return hourLabel.includes(term) || itemNames.includes(term);
      })
    : hourlyData;

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

  const getTopItemNames = (topItems) => {
    if (!topItems || topItems.length === 0) return '-';
    return topItems
      .slice(0, 3)
      .map(i => (typeof i === 'string' ? i : i.name || ''))
      .filter(Boolean)
      .join(', ') || '-';
  };

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Hour', 'Orders', 'Revenue', 'Avg Order Value', 'Top Items'],
      ...hourlyData.map(h => [
        formatHour(h.hour),
        h.orders,
        h.revenue,
        h.orders > 0 ? (h.revenue / h.orders).toFixed(2) : '0',
        getTopItemNames(h.topItems),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    // Set column widths
    ws['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 16 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Hourly Sales');
    XLSX.writeFile(wb, `hourly-sales-report-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FaClock className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hourly Sales Report</h1>
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
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
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaChartBar className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalOrders}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Revenue</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Avg Order Value</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaClock className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Peak Hour</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {peakHourEntry.orders > 0 ? formatHour(peakHourEntry.hour) : '-'}
                </div>
                {peakHourEntry.orders > 0 && (
                  <div className="text-[11px] text-gray-400 mt-0.5">{peakHourEntry.orders} orders</div>
                )}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders by Hour</h3>
              <div className="flex items-end gap-1 h-40">
                {hourlyData.map((h) => {
                  const height = maxOrders > 0 ? Math.max((h.orders / maxOrders) * 100, h.orders > 0 ? 4 : 0) : 0;
                  return (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {formatHour(h.hour)}: {h.orders} orders &middot; {formatCurrency(h.revenue)}
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-md transition-all cursor-pointer min-w-[6px] ${
                          h.orders > 0
                            ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500'
                            : 'bg-gray-100'
                        }`}
                        style={{ height: `${height}%`, minHeight: h.orders > 0 ? '4px' : '2px' }}
                      />
                      {/* X-axis label */}
                      <span className="text-[8px] sm:text-[9px] text-gray-400 truncate w-full text-center">
                        {h.hour % 3 === 0 ? formatHour(h.hour).replace(' ', '') : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* X-axis baseline */}
              <div className="border-t border-gray-200 mt-0" />
            </div>

            {/* Hourly Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Hourly Breakdown
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({hourlyData.filter(h => h.orders > 0).length} active hours)
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search hours or items..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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

              {filteredHourlyData.some(h => h.orders > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold">Hour</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Orders</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Revenue</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Avg Order</th>
                        <th className="px-4 py-2.5 font-semibold">Top Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredHourlyData
                        .filter(h => h.orders > 0)
                        .map((h) => {
                          const avg = h.orders > 0 ? h.revenue / h.orders : 0;
                          const isPeak = h.hour === peakHourEntry.hour && peakHourEntry.orders > 0;
                          return (
                            <tr key={h.hour} className={`hover:bg-gray-50/80 transition-colors ${isPeak ? 'bg-blue-50/30' : ''}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 text-sm font-mono">{formatHour(h.hour)}</span>
                                  {isPeak && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                      PEAK
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                  {h.orders}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(h.revenue)}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(avg)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                                {getTopItemNames(h.topItems)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                        <td className="px-4 py-3 text-gray-800">Total</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                            {totalOrders}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(totalRevenue)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(avgOrderValue)}</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No hours match your search' : 'No orders recorded for any hour in this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaClock className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hourly sales data available</p>
            <p className="text-sm mt-1">Start taking orders to see your hourly breakdown here</p>
          </div>
        )}
      </div>
    </div>
  );
}
