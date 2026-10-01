'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { adaptStaffSales } from '../../../lib/reportAdapters';
import { restaurantToday, ymd } from '../../../lib/restaurantTime';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaUsers,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaChartBar,
  FaTrophy,
  FaUserCheck,
} from 'react-icons/fa';

export default function StaffSalesPage() {
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
    // The restaurant's business date — not the viewer's device date, and not the UTC date
    // toISOString() gave (yesterday before 5:30 AM in India).
    const today = restaurantToday();
    const fmt = ymd;

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
      const res = await apiClient.getStaffSales(restaurantId, options);
      if (res?.success) {
        setData(adaptStaffSales(res)); // API → this page's shape
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch staff sales error:', err);
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
      router.replace(`/staff-sales?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/staff-sales?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  // Derive staff data sorted by totalSales descending
  const staffData = (() => {
    if (!data?.staff || !Array.isArray(data.staff)) return [];
    return [...data.staff].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
  })();

  const totalRevenue = data?.summary?.totalRevenue || 0;
  const maxSales = staffData.length > 0 ? Math.max(...staffData.map(s => s.totalSales || 0), 1) : 1;
  // QR / customer self-orders with no table server: not a staff member.
  const isSelfOrderRow = (s) => /customer self-order/i.test(String(s?.staffId || '')) || /customer self-order/i.test(String(s?.staffName || ''));
  const displayName = (s) => (isSelfOrderRow(s) ? 'QR / self-orders (no server)' : (s?.staffName || 'Unknown'));
  // Logins shared at the counter (owner / cashier …) — their row is "orders entered on this login".
  const SHARED_ROLES = ['owner', 'admin', 'co-owner', 'cashier'];
  const roleTag = (s) => (!isSelfOrderRow(s) && SHARED_ROLES.includes(String(s?.role || '').toLowerCase()) ? String(s.role).toLowerCase() : null);
  const totalOrders = staffData.reduce((sum, s) => sum + (s.ordersHandled || 0), 0);
  const avgBill = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const staffRowsCount = staffData.filter(s => !isSelfOrderRow(s)).length;
  // Orders that have a table server (Tables → Assign Server). The rest are credited to whoever
  // entered them, so the report can't split them by waiter — say so instead of a misleading average.
  const assignedOrders = staffData.reduce((sum, s) => sum + (s.assignedOrders || 0), 0);
  const showServerHint = totalOrders > 0 && assignedOrders / totalOrders < 0.5;

  // Filtered staff data for table
  const filteredStaffData = searchTerm
    ? staffData.filter(s => {
        const term = searchTerm.toLowerCase();
        return (s.staffName || '').toLowerCase().includes(term);
      })
    : staffData;

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

  const getRankDisplay = (rank) => {
    if (rank === 1) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold">1</span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold">2</span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold">3</span>;
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{rank}</span>;
  };

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Rank', 'Staff Name', 'Orders Served', 'Sales (served)', 'Avg Ticket', 'Tips', 'Revenue Share %', 'Orders Taken', 'Sales (taken)'],
      ...staffData.map((s, i) => [
        i + 1,
        displayName(s),
        s.ordersHandled || 0,
        s.totalSales || 0,
        s.avgTicket || 0,
        s.tipsEarned || 0,
        totalRevenue > 0 ? ((s.totalSales || 0) / totalRevenue * 100).toFixed(1) : '0.0',
        s.ordersTaken || 0,
        s.takenSales || 0,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    // Set column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Sales');
    XLSX.writeFile(wb, `staff-sales-report-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FaUsers className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Staff Sales Report</h1>
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
                    <FaUsers className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Staff with sales</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{staffRowsCount}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Revenue</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(data.summary?.totalRevenue || 0)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaUserCheck className="text-purple-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Orders with a server</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{assignedOrders} <span className="text-sm font-medium text-gray-400">of {totalOrders}</span></div>
                <div className="text-[11px] text-gray-400 mt-0.5">Tables → Assign Server</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaTrophy className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Tips</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(data.summary?.totalTips || 0)}</div>
              </div>
            </div>

            {/* Most orders have no table server → they can't be split by waiter; say why + how. */}
            {showServerHint && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6 text-sm leading-relaxed">
                <div className="font-semibold mb-1">Sales can&apos;t be split by waiter for this period</div>
                Only {assignedOrders} of {totalOrders} orders have a server. The rest are credited to the login that entered them
                {staffData.filter(roleTag).length ? ` (e.g. ${staffData.filter(roleTag).slice(0, 2).map(displayName).join(', ')})` : ''}
                {staffData.some(isSelfOrderRow) ? ' or are QR self-orders' : ''}. To see each waiter&apos;s sales, assign a server to each table
                (Tables → table → Assign Server) — every order on that table then counts for that server — or let waiters take orders on their own login.
              </div>
            )}

            {/* CSS Bar Chart - Top 10 Staff */}
            {staffData.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Staff by Sales</h3>
                <div className="space-y-2.5">
                  {staffData.slice(0, 10).map((s, i) => {
                    const widthPercent = maxSales > 0 ? Math.max(((s.totalSales || 0) / maxSales) * 100, 2) : 0;
                    return (
                      <div key={s.staffId || i} className="flex items-center gap-3 group">
                        <div className="w-28 sm:w-36 text-sm text-gray-700 font-medium truncate flex items-center gap-2">
                          {getRankDisplay(i + 1)}
                          <span className="truncate">{displayName(s)}</span>
                        </div>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute inset-0 flex items-center justify-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[11px] font-semibold text-gray-700 bg-white/80 px-1.5 py-0.5 rounded">
                              {formatCurrency(s.totalSales || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="w-24 text-right text-sm font-semibold text-gray-800">
                          {formatCurrency(s.totalSales || 0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Staff Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Staff Breakdown
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({staffData.length} staff members)
                  </span>
                  <span className="block text-xs text-gray-500 font-normal mt-1">
                    Sales go to the table&apos;s server (Tables → Assign Server); orders on a table with no server go to whoever took the order. &quot;Orders taken&quot; shows who typed the orders.
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search staff..."
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

              {filteredStaffData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold text-center">#</th>
                        <th className="px-4 py-2.5 font-semibold">Staff Name</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Orders Served</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Sales (served)</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Avg Ticket</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Tips Earned</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Revenue Share</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Orders Taken</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Sales (taken)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStaffData.map((s, i) => {
                        // Find original rank (before filtering)
                        const originalRank = staffData.indexOf(s) + 1;
                        const revenueShare = totalRevenue > 0 ? ((s.totalSales || 0) / totalRevenue * 100) : 0;
                        return (
                          <tr key={s.staffId || i} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 text-center">
                              {getRankDisplay(originalRank)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800 text-sm">{displayName(s)}</span>
                              {roleTag(s) && <span className="ml-2 text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{roleTag(s)} login</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {s.ordersHandled || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(s.totalSales || 0)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(s.avgTicket || 0)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(s.tipsEarned || 0)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{revenueShare.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{s.ordersTaken || 0}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(s.takenSales || 0)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-gray-800">Total</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                            {staffData.reduce((sum, s) => sum + (s.ordersHandled || 0), 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(totalRevenue)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(avgBill)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(data.summary?.totalTips || 0)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">100%</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{staffData.reduce((sum, s) => sum + (s.ordersTaken || 0), 0)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(staffData.reduce((sum, s) => sum + (s.takenSales || 0), 0))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No staff members match your search' : 'No staff sales data for this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No staff sales data available for this period</p>
            <p className="text-sm mt-1">Start taking orders to see staff performance here</p>
          </div>
        )}
      </div>
    </div>
  );
}
