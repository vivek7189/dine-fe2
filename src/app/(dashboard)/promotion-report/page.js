'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaTag,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaChartBar,
  FaPercent,
} from 'react-icons/fa';

const TYPE_COLORS = {
  offer: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  manual: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
  loyalty: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  coupon: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
};

const TYPE_LABELS = {
  offer: 'Offer',
  manual: 'Manual',
  loyalty: 'Loyalty',
  coupon: 'Coupon',
};

export default function PromotionReportPage() {
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

  // Type filter
  const [selectedType, setSelectedType] = useState('all');

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
      const res = await apiClient.getPromotionReport(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch promotion report error:', err);
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
      router.replace(`/promotion-report?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/promotion-report?${params.toString()}`, { scroll: false });
      fetchData();
    }
  };

  // Promotions data
  const promotions = data?.promotions || [];
  const byType = data?.byType || {};
  const summary = data?.summary || {};

  // Filtered promotions
  const filteredPromotions = promotions.filter(p => {
    const matchesType = selectedType === 'all' || p.source === selectedType;
    const matchesSearch = !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Max total for bar chart scaling
  const maxTypeTotal = Math.max(
    ...Object.values(byType).map(v => v?.total || 0),
    1
  );

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
      ['Name', 'Type', 'Usage Count', 'Total Discount', 'Avg Discount', 'Orders Affected'],
      ...promotions.map(p => [
        p.name || '-',
        TYPE_LABELS[p.source] || p.source || '-',
        p.usageCount || 0,
        p.totalDiscount || 0,
        p.avgDiscount || 0,
        p.affectedOrders || 0,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Promotion Report');
    XLSX.writeFile(wb, `promotion-report-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                <FaTag className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Promotion / Offer Report</h1>
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
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-pink-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer"
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
            <FaSpinner className="animate-spin text-pink-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaTag className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Offers Used</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalPromotionsUsed || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Discount Given</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(summary.totalDiscountGiven || 0)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Avg Discount</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(summary.avgDiscountPerOrder || 0)}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaPercent className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">% of Revenue</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.discountAsPercentOfRevenue || 0}%</div>
              </div>
            </div>

            {/* Type Breakdown - Horizontal Bars */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Discount by Type</h3>
              <div className="space-y-3">
                {Object.entries(TYPE_LABELS).map(([key, label]) => {
                  const typeData = byType[key] || { count: 0, total: 0 };
                  const barWidth = maxTypeTotal > 0 ? Math.max((typeData.total / maxTypeTotal) * 100, typeData.total > 0 ? 4 : 0) : 0;
                  const colors = TYPE_COLORS[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-sm ${colors.bar}`} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{typeData.count} used</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(typeData.total)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${colors.bar}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promotions Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Promotion Details
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  {/* Type Filter */}
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="offer">Offer</option>
                      <option value="manual">Manual</option>
                      <option value="loyalty">Loyalty</option>
                      <option value="coupon">Coupon</option>
                    </select>
                    <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search promotions..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    />
                  </div>
                  {/* Excel Download */}
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

              {filteredPromotions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold">Promotion Name</th>
                        <th className="px-4 py-2.5 font-semibold">Type</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Usage Count</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Total Discount</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Avg Discount</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Orders Affected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPromotions.map((p, idx) => {
                        const colors = TYPE_COLORS[p.source] || TYPE_COLORS.offer;
                        return (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800 text-sm">{p.name || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                {TYPE_LABELS[p.source] || p.source || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {p.usageCount || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(p.totalDiscount || 0)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(p.avgDiscount || 0)}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">{p.affectedOrders || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                        <td className="px-4 py-3 text-gray-800">Total</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">
                            {summary.totalPromotionsUsed || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-red-700 text-sm">{formatCurrency(summary.totalDiscountGiven || 0)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(summary.avgDiscountPerOrder || 0)}</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm || selectedType !== 'all'
                    ? 'No promotions match your filters'
                    : 'No promotions or discounts used in this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaTag className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No promotions or discounts used in this period</p>
            <p className="text-sm mt-1">Promotion and offer usage data will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
