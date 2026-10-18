'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { adaptStaffSales } from '../../../lib/reportAdapters';
import TeamSalesView from './TeamSalesView';
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
  FaStar,
  FaChevronRight,
  FaReceipt,
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
  const [openStaff, setOpenStaff] = useState(null);   // row showing the items that person sold
  const [itemsMode, setItemsMode] = useState('served'); // expanded row: items they served | items they took
  const [showAllTop, setShowAllTop] = useState(false);
  const [view, setView] = useState(() => (searchParams.get('view') === 'teams' ? 'teams' : 'people')); // by person | teams by station

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

  // QR / customer self-orders with no table server: not a staff member.
  const isSelfOrderRow = (s) => !!s?.isSelfOrder || s?.staffId === '__self_order'
    || /customer self-order/i.test(String(s?.staffId || '')) || /customer self-order/i.test(String(s?.staffName || ''));
  // Orders typed on a counter login (owner / manager / cashier) with no waiter chosen: not a person.
  const isCounterRow = (s) => !!s?.isCounter || s?.staffId === '__counter';
  const isPseudoRow = (s) => isSelfOrderRow(s) || isCounterRow(s);

  // Derive staff data sorted by totalSales descending — people first, then the counter /
  // self-order totals (never ranked).
  const staffData = (() => {
    if (!data?.staff || !Array.isArray(data.staff)) return [];
    const bySales = (a, b) => (b.totalSales || 0) - (a.totalSales || 0);
    return [...data.staff.filter(s => !isPseudoRow(s)).sort(bySales), ...data.staff.filter(isPseudoRow).sort(bySales)];
  })();
  const rankedStaff = staffData.filter(s => !isPseudoRow(s) && (s.totalSales || 0) > 0);
  const pseudoRows = staffData.filter(isPseudoRow).filter(s => (s.ordersHandled || 0) > 0);

  const totalRevenue = data?.summary?.totalRevenue || 0;
  const maxSales = rankedStaff.length > 0 ? Math.max(...rankedStaff.map(s => s.totalSales || 0), 1) : 1;
  const displayName = (s) => (isCounterRow(s) ? 'Counter (no waiter)' : isSelfOrderRow(s) ? 'QR / self-orders (no server)' : (s?.staffName || 'Unknown'));
  // Logins shared at the counter (owner / cashier …) — their row is "orders entered on this login".
  const SHARED_ROLES = ['owner', 'admin', 'co-owner', 'cashier'];
  const roleTag = (s) => (!isPseudoRow(s) && SHARED_ROLES.includes(String(s?.role || '').toLowerCase()) ? String(s.role).toLowerCase() : null);
  const totalOrders = staffData.reduce((sum, s) => sum + (s.ordersHandled || 0), 0);
  const avgBill = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const staffRowsCount = staffData.filter(s => !isPseudoRow(s)).length;
  // Orders that have a table server (Tables → Assign Server). The rest are credited to whoever
  // entered them, so the report can't split them by waiter — say so instead of a misleading average.
  const assignedOrders = staffData.reduce((sum, s) => sum + (s.assignedOrders || 0), 0);
  const showServerHint = totalOrders > 0 && assignedOrders / totalOrders < 0.5;

  const promoItems = data?.promoItems || [];
  const promoSales = data?.promoSales || 0;
  const topOrders = data?.topOrders || [];
  const catLabel = (c) => String(c || '').replace(/--/g, ' & ').replace(/[-_]/g, ' ');
  const fmtWhen = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); };

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
      ...staffData.map((s) => [
        isPseudoRow(s) ? '-' : staffData.filter(x => !isPseudoRow(x)).indexOf(s) + 1,
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
    // Item-wise per staff (promo = featured on the QR menu)
    const itemRows = [['Staff Name', 'Item', 'Category', 'Promo item', 'Qty', 'Sales']];
    staffData.forEach((s) => (s.items || []).forEach((it) => itemRows.push([displayName(s), it.name, it.category || '', it.promo ? 'Yes' : '', it.qty || 0, it.revenue || 0])));
    const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
    wsItems['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsItems, 'Items by Staff');
    if (promoItems.length) {
      const wsPromo = XLSX.utils.aoa_to_sheet([['Promo item', 'Category', 'Qty sold', 'Sales', 'Top seller', 'Top seller qty'],
        ...promoItems.map((p) => [p.name, p.category || '', p.qty || 0, p.revenue || 0, p.topSeller?.name || '', p.topSeller?.qty || 0])]);
      wsPromo['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsPromo, 'Promo Items');
    }
    if (topOrders.length) {
      const wsTop = XLSX.utils.aoa_to_sheet([['#', 'Order', 'Date / time', 'Table', 'Type', 'Server', 'Items', 'Amount'],
        ...topOrders.map((o, i) => [i + 1, o.orderNumber || o.id, o.createdAt ? new Date(o.createdAt).toLocaleString() : '', o.tableNumber || '', o.orderType || '', o.server || '', o.itemCount || 0, o.amount || 0])]);
      wsTop['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 7 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsTop, 'Top Bills');
    }
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
        <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 mb-5 shadow-sm">
          {[['people', 'By person'], ['teams', 'Teams by station']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setView(k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${view === k ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
        {view === 'teams' ? (
          <TeamSalesView restaurantId={restaurantId} startDate={getDateRange()?.startDate} endDate={getDateRange()?.endDate} formatCurrency={formatCurrency} />
        ) : loading ? (
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
                Only {assignedOrders} of {totalOrders} orders have a server. Orders typed at the counter with no waiter chosen are in
                &quot;Counter (no waiter)&quot;{staffData.some(isSelfOrderRow) ? ', QR self-orders in their own line' : ''} — neither is ranked as a person.
                To credit a waiter: pick <b>Served by</b> on the POS order panel (remembered on that till until changed), assign a server
                to the table (Tables → table → Assign Server), or let waiters take orders on their own login.
              </div>
            )}

            {/* CSS Bar Chart - Top 10 Staff */}
            {(rankedStaff.length > 0 || pseudoRows.length > 0) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Staff by Sales</h3>
                {rankedStaff.length === 0 && (
                  <p className="text-sm text-gray-500 mb-3">No waiter has sales yet for this period.</p>
                )}
                <div className="space-y-2.5">
                  {rankedStaff.slice(0, 10).map((s, i) => {
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
                {pseudoRows.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1.5">
                    {pseudoRows.map((s) => (
                      <div key={s.staffId} className="flex items-center justify-between text-sm text-gray-500">
                        <span className="truncate">{displayName(s)} · {s.ordersHandled || 0} orders</span>
                        <span className="font-medium text-gray-600">{formatCurrency(s.totalSales || 0)}</span>
                      </div>
                    ))}
                    {pseudoRows.some(isCounterRow) && (
                      <p className="text-xs text-gray-400">Orders typed at the counter with no waiter chosen — pick &quot;Served by&quot; on the POS to credit a waiter.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Promo items = items switched on as "Feature on the public (QR) menu" */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 mb-6 overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FaStar className="text-amber-500" /> Promo item sales
                  <span className="text-xs text-gray-500 font-normal">items featured on your QR menu</span>
                </h3>
                {promoItems.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <b>{formatCurrency(promoSales)}</b>
                    <span className="text-gray-500"> · {data?.promoQty || 0} sold{totalRevenue > 0 ? ` · ${(promoSales / totalRevenue * 100).toFixed(1)}% of sales` : ''}</span>
                  </div>
                )}
              </div>
              {promoItems.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500">
                  No promo items yet. Menu → edit an item → turn on <b>Feature on the public (QR) menu</b>. Those items are tracked here and in each waiter&apos;s item list.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2 font-semibold">Item</th>
                        <th className="px-4 py-2 font-semibold text-center">Qty sold</th>
                        <th className="px-4 py-2 font-semibold text-right">Sales</th>
                        <th className="px-4 py-2 font-semibold">Top seller</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {promoItems.map((p) => (
                        <tr key={p.name} className={p.qty ? '' : 'text-gray-400'}>
                          <td className="px-4 py-2.5"><span className="font-medium">{p.name}</span>{p.category ? <span className="ml-2 text-[11px] text-gray-400">{catLabel(p.category)}</span> : null}</td>
                          <td className="px-4 py-2.5 text-center tabular-nums">{p.qty || 0}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatCurrency(p.revenue || 0)}</td>
                          <td className="px-4 py-2.5">{p.topSeller ? <span>{p.topSeller.name} <span className="text-gray-400">· {p.topSeller.qty}</span></span> : <span className="text-gray-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Biggest bills of the period */}
            {topOrders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <FaReceipt className="text-emerald-600" /> Highest bills
                    <span className="text-xs text-gray-400 font-normal">biggest first</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2 font-semibold text-center">#</th>
                        <th className="px-4 py-2 font-semibold">Order</th>
                        <th className="px-4 py-2 font-semibold">Time</th>
                        <th className="px-4 py-2 font-semibold">Table</th>
                        <th className="px-4 py-2 font-semibold">Server</th>
                        <th className="px-4 py-2 font-semibold text-center">Items</th>
                        <th className="px-4 py-2 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(showAllTop ? topOrders : topOrders.slice(0, 10)).map((o, i) => (
                        <tr key={o.id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-2.5 text-center text-gray-400 tabular-nums">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                            {o.orderNumber || o.id.slice(0, 8)}
                            {o.hasPromo && <FaStar className="inline ml-1.5 text-amber-500 text-[11px]" title="Has a promo item" />}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{fmtWhen(o.createdAt)}</td>
                          <td className="px-4 py-2.5 text-gray-600">{o.tableNumber || <span className="text-gray-400 capitalize">{String(o.orderType || '').replace(/[_-]/g, ' ')}</span>}</td>
                          <td className="px-4 py-2.5 text-gray-600">{o.server || '—'}</td>
                          <td className="px-4 py-2.5 text-center tabular-nums text-gray-600">{o.itemCount || 0}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-900">{formatCurrency(o.amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {topOrders.length > 10 && (
                  <button type="button" onClick={() => setShowAllTop(v => !v)} className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100">
                    {showAllTop ? 'Show top 10' : `Show top ${topOrders.length}`}
                  </button>
                )}
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
                    Tap a name to see the items they sold (★ = promo item). Sales go to the table&apos;s server (Tables → Assign Server), else the waiter chosen in &quot;Served by&quot; on the POS, else whoever took the order. Orders typed on a counter login (owner / manager / cashier) with no waiter go to &quot;Counter (no waiter)&quot;. &quot;Orders taken&quot; shows who typed the orders.
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
                        <th className="px-4 py-2.5 font-semibold text-right"><FaStar className="inline text-amber-500 mr-1 -mt-0.5" />Promo items</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Orders Taken</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Sales (taken)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStaffData.map((s, i) => {
                        // Rank among people only — counter / self-order lines are totals, not ranked.
                        const pseudo = isPseudoRow(s);
                        const originalRank = pseudo ? null : staffData.filter(x => !isPseudoRow(x)).indexOf(s) + 1;
                        const revenueShare = totalRevenue > 0 ? ((s.totalSales || 0) / totalRevenue * 100) : 0;
                        const rowKey = s.staffId || String(i);
                        const isOpen = openStaff === rowKey;
                        const items = s.items || [];
                        const takenItems = s.takenItems || [];
                        const shown = itemsMode === 'taken' && !pseudo ? takenItems : items;
                        return (
                          <Fragment key={rowKey}>
                          <tr onClick={() => (items.length || takenItems.length) && setOpenStaff(isOpen ? null : rowKey)}
                            className={`${pseudo ? 'bg-gray-50 text-gray-500' : 'hover:bg-gray-50/80 transition-colors'} ${(items.length || takenItems.length) ? 'cursor-pointer' : ''}`}>
                            <td className="px-4 py-3 text-center">
                              {pseudo ? <span className="text-gray-300">—</span> : getRankDisplay(originalRank)}
                            </td>
                            <td className="px-4 py-3">
                              {(items.length > 0 || takenItems.length > 0) && <FaChevronRight className={`inline mr-1.5 text-[10px] text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                              <span className={`font-medium text-sm ${pseudo ? 'text-gray-500 italic' : 'text-gray-800'}`}>{displayName(s)}</span>
                              {isCounterRow(s) && <span className="block text-[11px] text-gray-400">Typed at the counter with no waiter chosen — pick &quot;Served by&quot; on the POS to credit a waiter</span>}
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
                            <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">{s.promoQty ? <>{formatCurrency(s.promoSales || 0)} <span className="text-gray-400">· {s.promoQty}</span></> : <span className="text-gray-300">—</span>}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{s.ordersTaken || 0}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(s.takenSales || 0)}</td>
                          </tr>
                          {isOpen && (
                            <tr className="bg-blue-50/30">
                              <td></td>
                              <td colSpan={9} className="px-4 pb-4 pt-1">
                                {!pseudo && (
                                  <div className="flex items-center gap-1 mb-2">
                                    {[['served', `Served · ${s.ordersHandled || 0} orders`], ['taken', `Took the order · ${s.ordersTaken || 0}`]].map(([k, l]) => (
                                      <button key={k} type="button" onClick={(e) => { e.stopPropagation(); setItemsMode(k); }}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${itemsMode === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{l}</button>
                                    ))}
                                  </div>
                                )}
                                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                  {shown.length === 0 ? <p className="px-3 py-3 text-sm text-gray-500">{itemsMode === 'taken' ? 'No orders typed by this person in this period.' : 'No orders served by this person in this period.'}</p> : (
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-50 text-left text-[11px] text-gray-500 uppercase">
                                        <th className="px-3 py-1.5 font-semibold">Items {itemsMode === 'taken' && !pseudo ? 'ordered through' : 'sold by'} {displayName(s)}</th>
                                        <th className="px-3 py-1.5 font-semibold text-center">Qty</th>
                                        <th className="px-3 py-1.5 font-semibold text-right">Sales</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {shown.map((it, j) => (
                                        <tr key={j} className={it.promo ? 'bg-amber-50/60' : ''}>
                                          <td className="px-3 py-1.5 text-gray-800">
                                            {it.promo && <FaStar className="inline mr-1.5 text-amber-500 text-[11px] -mt-0.5" title="Promo item (featured on QR menu)" />}
                                            {it.name}{it.category ? <span className="ml-2 text-[11px] text-gray-400">{catLabel(it.category)}</span> : null}
                                          </td>
                                          <td className="px-3 py-1.5 text-center tabular-nums">{it.qty}</td>
                                          <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(it.revenue || 0)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  )}
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
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{promoSales ? formatCurrency(promoSales) : '—'}</td>
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
