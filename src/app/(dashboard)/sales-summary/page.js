'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  FaChartPie,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaShoppingBag,
  FaUsers,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaChevronDown,
  FaFileExcel,
  FaCreditCard,
} from 'react-icons/fa';

export default function SalesSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Period from URL or default to 'today'
  const urlPeriod = searchParams.get('period');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const [activePeriod, setActivePeriod] = useState(urlPeriod || 'today');
  const [customStartDate, setCustomStartDate] = useState(urlStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(urlEndDate || '');
  const [showCustomPicker, setShowCustomPicker] = useState(urlPeriod === 'custom');

  // Active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Sorting & filtering
  const [sortBy, setSortBy] = useState('quantity'); // quantity | revenue | name
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Load restaurant info (same resolution as order history page)
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

  const fetchSummary = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const options = {};
      if (activePeriod === 'custom' && customStartDate && customEndDate) {
        options.startDate = customStartDate;
        options.endDate = customEndDate;
      } else if (activePeriod !== 'custom') {
        options.period = activePeriod;
      }
      const res = await apiClient.getDailySummary(restaurantId, options);
      if (res?.success) setSummary(res.summary);
    } catch (err) {
      console.error('Fetch summary error:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, activePeriod, customStartDate, customEndDate]);

  useEffect(() => {
    if (restaurantId) fetchSummary();
  }, [restaurantId, fetchSummary]);

  // Update URL when period changes
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    setShowCustomPicker(period === 'custom');
    if (period !== 'custom') {
      const params = new URLSearchParams();
      params.set('period', period);
      router.replace(`/sales-summary?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/sales-summary?${params.toString()}`, { scroll: false });
      fetchSummary();
    }
  };

  // Sort & filter items
  const getFilteredItems = () => {
    if (!summary?.items) return [];
    let items = [...summary.items];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term));
    }
    items.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'quantity') cmp = a.quantity - b.quantity;
      else if (sortBy === 'revenue') cmp = a.revenue - b.revenue;
      else cmp = a.name.localeCompare(b.name);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return items;
  };

  const filteredItems = getFilteredItems();
  const totalQty = filteredItems.reduce((s, i) => s + i.quantity, 0);
  const totalItemRevenue = filteredItems.reduce((s, i) => s + i.revenue, 0);

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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const prettifyPaymentMethod = (method) => {
    const map = { cash: 'Cash', razorpay: 'Online/Razorpay', split: 'Split Payment', upi: 'UPI', card: 'Card' };
    return map[method?.toLowerCase()] || method?.toUpperCase() || method;
  };

  const handleExcelDownload = async (tabType) => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    let data = [];
    if (tabType === 'category') {
      data = [['Category', 'Items Sold', 'Revenue', '% of Total'],
        ...(summary?.categoryBreakdown || []).map(c => [c.category, c.itemsSold, c.revenue, c.percentage + '%'])];
    } else if (tabType === 'payment') {
      data = [['Payment Method', 'Transactions', 'Amount', '% of Total'],
        ...(summary?.paymentBreakdown || []).map(p => [prettifyPaymentMethod(p.method), p.transactions, p.amount, p.percentage + '%'])];
    } else if (tabType === 'daywise') {
      data = [['Date', 'Orders', 'Revenue', 'Avg Order Value'],
        ...(summary?.dailyRevenue || []).map(d => [d.date, d.orders, d.revenue, d.orders > 0 ? (d.revenue / d.orders).toFixed(2) : '0'])];
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, tabType);
    XLSX.writeFile(wb, `sales-${tabType}-report.xlsx`);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FaChartPie },
    { key: 'category', label: 'Category Sales', icon: FaChartPie },
    { key: 'payment', label: 'Payment Mode', icon: FaCreditCard },
    { key: 'daywise', label: 'Day-wise', icon: FaCalendarAlt },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <FaChartPie className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Summary</h1>
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
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeTab === t.key
                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <t.icon className="text-xs" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-rose-500 text-3xl" />
          </div>
        ) : summary ? (
          <>
            {/* === OVERVIEW TAB === */}
            {activeTab === 'overview' && (<>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Revenue</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenueWithTax || summary.totalRevenue || 0)}</div>
                {summary.totalRevenueWithTax > summary.totalRevenue && summary.totalRevenue > 0 && (
                  <div className="text-[11px] text-gray-400 mt-0.5">excl. tax: {formatCurrency(summary.totalRevenue)}</div>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaShoppingBag className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Orders</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalOrders}</div>
                {summary.avgOrderValue > 0 && (
                  <div className="text-[11px] text-gray-400 mt-0.5">avg: {formatCurrency(summary.avgOrderValue)}</div>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaChartPie className="text-purple-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Items Sold</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {summary.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{summary.items?.length || 0} unique items</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaUsers className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Customers</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.uniqueCustomers || 0}</div>
              </div>
            </div>

            {/* Daily Revenue Trend (only for multi-day periods) */}
            {summary.dailyRevenue && summary.dailyRevenue.length > 1 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Revenue Trend</h3>
                <div className="flex items-end gap-1 h-32">
                  {(() => {
                    const maxRev = Math.max(...summary.dailyRevenue.map(d => d.revenue), 1);
                    return summary.dailyRevenue.map((day, idx) => {
                      const height = Math.max((day.revenue / maxRev) * 100, 4);
                      const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {formatCurrency(day.revenue)} &middot; {day.orders} orders
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md hover:from-rose-600 hover:to-rose-500 transition-all cursor-pointer min-w-[8px]"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[9px] text-gray-400 truncate w-full text-center">{dateLabel}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Order Type & Busiest Hours Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Order Types */}
              {summary.ordersByType && Object.keys(summary.ordersByType).length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Types</h3>
                  <div className="space-y-2">
                    {Object.entries(summary.ordersByType)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => {
                        const pct = summary.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                        const colors = {
                          dine_in: 'bg-blue-500', delivery: 'bg-green-500', takeaway: 'bg-amber-500',
                          customer_self_order: 'bg-purple-500'
                        };
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="capitalize text-gray-700 font-medium">{type.replace(/_/g, ' ')}</span>
                              <span className="text-gray-500">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${colors[type] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Busiest Hours */}
              {summary.hourlyBreakdown && Object.keys(summary.hourlyBreakdown).length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Busiest Hours</h3>
                  <div className="space-y-1.5">
                    {Object.entries(summary.hourlyBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([hour, count]) => {
                        const h = parseInt(hour);
                        const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                        const maxH = Math.max(...Object.values(summary.hourlyBreakdown));
                        const pct = maxH > 0 ? Math.round((count / maxH) * 100) : 0;
                        return (
                          <div key={hour} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-12 text-right font-mono">{label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-3">
                              <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 font-semibold w-8">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Item-wise Sales Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Item-wise Sales
                  <span className="text-xs text-gray-400 font-normal ml-2">({summary.items?.length || 0} items)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-44 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold w-10">#</th>
                        <th
                          className="px-4 py-2.5 font-semibold cursor-pointer hover:text-gray-700 select-none"
                          onClick={() => toggleSort('name')}
                        >
                          <span className="flex items-center gap-1">
                            Item
                            {sortBy === 'name' && (sortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}
                          </span>
                        </th>
                        <th
                          className="px-4 py-2.5 font-semibold text-center cursor-pointer hover:text-gray-700 select-none"
                          onClick={() => toggleSort('quantity')}
                        >
                          <span className="flex items-center justify-center gap-1">
                            Qty Sold
                            {sortBy === 'quantity' && (sortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}
                          </span>
                        </th>
                        <th
                          className="px-4 py-2.5 font-semibold text-right cursor-pointer hover:text-gray-700 select-none"
                          onClick={() => toggleSort('revenue')}
                        >
                          <span className="flex items-center justify-end gap-1">
                            Revenue
                            {sortBy === 'revenue' && (sortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}
                          </span>
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-right">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredItems.map((item, idx) => {
                        const revPct = totalItemRevenue > 0 ? ((item.revenue / totalItemRevenue) * 100) : 0;
                        const isTop3 = idx < 3 && sortBy === 'quantity' && sortDir === 'desc';
                        return (
                          <tr key={item.originalKey || item.name} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isTop3 && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                                    'bg-orange-50 text-orange-600'
                                  }`}>
                                    {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
                                  </span>
                                )}
                                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(item.revenue)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${Math.min(revPct, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">{revPct.toFixed(1)}%</span>
                              </div>
                            </td>
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
                            {totalQty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(totalItemRevenue)}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No items match your search' : 'No sales data for this period'}
                </div>
              )}
            </div>
            </>)}

            {/* === CATEGORY SALES TAB === */}
            {activeTab === 'category' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800">Category-wise Sales</h3>
                  <button
                    onClick={() => handleExcelDownload('category')}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FaFileExcel className="text-xs" />
                    Download Excel
                  </button>
                </div>
                {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                          <th className="px-4 py-2.5 font-semibold">Category</th>
                          <th className="px-4 py-2.5 font-semibold text-center">Items Sold</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Revenue</th>
                          <th className="px-4 py-2.5 font-semibold text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {summary.categoryBreakdown.map((cat, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800 text-sm">{cat.category}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {cat.itemsSold}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(cat.revenue)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">{cat.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                          <td className="px-4 py-3 text-gray-800">Total</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                              {summary.categoryBreakdown.reduce((s, c) => s + c.itemsSold, 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(summary.categoryBreakdown.reduce((s, c) => s + c.revenue, 0))}</td>
                          <td className="px-4 py-3 text-right text-xs text-gray-500">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">No category data available for this period</div>
                )}
              </div>
            )}

            {/* === PAYMENT MODE TAB === */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800">Payment Mode Breakdown</h3>
                  <button
                    onClick={() => handleExcelDownload('payment')}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FaFileExcel className="text-xs" />
                    Download Excel
                  </button>
                </div>
                {summary.paymentBreakdown && summary.paymentBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                          <th className="px-4 py-2.5 font-semibold">Payment Method</th>
                          <th className="px-4 py-2.5 font-semibold text-center">Transactions</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                          <th className="px-4 py-2.5 font-semibold text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {summary.paymentBreakdown.map((pm, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800 text-sm">{prettifyPaymentMethod(pm.method)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {pm.transactions}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(pm.amount)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${Math.min(pm.percentage, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">{pm.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                          <td className="px-4 py-3 text-gray-800">Total</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                              {summary.paymentBreakdown.reduce((s, p) => s + p.transactions, 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(summary.paymentBreakdown.reduce((s, p) => s + p.amount, 0))}</td>
                          <td className="px-4 py-3 text-right text-xs text-gray-500">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">No payment data available for this period</div>
                )}
              </div>
            )}

            {/* === DAY-WISE TAB === */}
            {activeTab === 'daywise' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800">Day-wise Breakdown</h3>
                  {summary.dailyRevenue && summary.dailyRevenue.length > 1 && (
                    <button
                      onClick={() => handleExcelDownload('daywise')}
                      className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <FaFileExcel className="text-xs" />
                      Download Excel
                    </button>
                  )}
                </div>
                {summary.dailyRevenue && summary.dailyRevenue.length > 1 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                          <th className="px-4 py-2.5 font-semibold">Date</th>
                          <th className="px-4 py-2.5 font-semibold text-center">Orders</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Revenue</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Avg Order Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {summary.dailyRevenue.map((day, idx) => {
                          const avg = day.orders > 0 ? day.revenue / day.orders : 0;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-800 text-sm">{day.date}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                  {day.orders}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(day.revenue)}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(avg)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                          <td className="px-4 py-3 text-gray-800">Total</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                              {summary.dailyRevenue.reduce((s, d) => s + d.orders, 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(summary.dailyRevenue.reduce((s, d) => s + d.revenue, 0))}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">
                            {formatCurrency(
                              summary.dailyRevenue.reduce((s, d) => s + d.orders, 0) > 0
                                ? summary.dailyRevenue.reduce((s, d) => s + d.revenue, 0) / summary.dailyRevenue.reduce((s, d) => s + d.orders, 0)
                                : 0
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FaCalendarAlt className="text-3xl mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Select a multi-day period (7 days, 30 days, or custom range) to view day-wise breakdown</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaChartPie className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No sales data available</p>
            <p className="text-sm mt-1">Start taking orders to see your sales summary here</p>
          </div>
        )}
      </div>
    </div>
  );
}
