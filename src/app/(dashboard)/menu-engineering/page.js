'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaChartPie,
  FaStar,
  FaTimesCircle,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaPercent,
} from 'react-icons/fa';

const CLASSIFICATION_STYLES = {
  Star: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Plow Horse': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  Puzzle: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  Dog: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

const QUADRANT_COLORS = {
  Star: 'bg-green-500/10',
  Puzzle: 'bg-blue-500/10',
  'Plow Horse': 'bg-orange-500/10',
  Dog: 'bg-red-500/10',
};

export default function MenuEngineeringPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();

  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Period from URL or default to '30d'
  const urlPeriod = searchParams.get('period');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  const [activePeriod, setActivePeriod] = useState(urlPeriod || '30d');
  const [customStartDate, setCustomStartDate] = useState(urlStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(urlEndDate || '');
  const [showCustomPicker, setShowCustomPicker] = useState(urlPeriod === 'custom');

  // Sub-restaurant filtering
  const [subRestaurants, setSubRestaurants] = useState([]);
  const [selectedSubRestaurant, setSelectedSubRestaurant] = useState('');

  // Search and category filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Load restaurant info (same resolution as hourly-report)
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
      const res = await apiClient.getMenuEngineering(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch menu engineering error:', err);
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
      router.replace(`/menu-engineering?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/menu-engineering?${params.toString()}`, { scroll: false });
      fetchData();
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
    return periods.find(p => p.key === activePeriod)?.label || '30 Days';
  };

  // Derived data
  const items = data?.items || [];
  const summary = data?.summary || { stars: 0, plowHorses: 0, puzzles: 0, dogs: 0, totalItems: 0 };
  const avgMarginPercent = data?.avgMarginPercent || 0;
  const avgQtySold = data?.avgQtySold || 0;
  const categorySummary = data?.categorySummary || [];

  // Unique categories from items
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();

  // Filter items by search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // BCG Scatter - compute positions
  const maxQty = Math.max(...items.map(i => i.qtySold || 0), 1);
  const maxMargin = Math.max(...items.map(i => i.marginPercent || 0), 1);

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Item', 'Category', 'Qty Sold', 'Revenue', 'Total Cost', 'Margin', 'Margin %', 'Classification'],
      ...items.map(item => [
        item.name,
        item.category,
        item.qtySold,
        item.revenue,
        item.totalCost,
        item.margin,
        item.marginPercent,
        item.classification,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Engineering');
    XLSX.writeFile(wb, `menu-engineering-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <FaChartPie className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Engineering</h1>
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
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
            <FaSpinner className="animate-spin text-purple-500 text-3xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaChartPie className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Items Analyzed</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalItems}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FaPercent className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Avg Margin%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{avgMarginPercent.toFixed(1)}%</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaStar className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Stars</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.stars}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">High profit, high popularity</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaTimesCircle className="text-red-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Dogs</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.dogs}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Low profit, low popularity</div>
              </div>
            </div>

            {/* BCG Matrix Scatter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">BCG Matrix - Menu Classification</h3>
              <div className="relative w-full" style={{ paddingBottom: '60%', minHeight: '300px' }}>
                <div className="absolute inset-0">
                  {/* Axis labels */}
                  <div className="absolute -left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap" style={{ left: '-8px' }}>
                    Profitability (Margin %)
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-gray-400 font-medium" style={{ bottom: '-18px' }}>
                    Popularity (Qty Sold)
                  </div>

                  {/* Grid container */}
                  <div className="absolute inset-0 ml-4 mb-4">
                    {/* 2x2 quadrant grid */}
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full border border-gray-200 rounded-lg overflow-hidden">
                      {/* Top-left: Puzzle */}
                      <div className={`${QUADRANT_COLORS.Puzzle} border-r border-b border-gray-200 relative`}>
                        <span className="absolute top-2 left-2 text-[10px] sm:text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          Puzzles
                        </span>
                        <span className="absolute top-2 right-2 text-[9px] text-gray-400 hidden sm:block">High margin, Low sales</span>
                      </div>
                      {/* Top-right: Star */}
                      <div className={`${QUADRANT_COLORS.Star} border-b border-gray-200 relative`}>
                        <span className="absolute top-2 left-2 text-[10px] sm:text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <FaStar className="text-[8px]" /> Stars
                        </span>
                        <span className="absolute top-2 right-2 text-[9px] text-gray-400 hidden sm:block">High margin, High sales</span>
                      </div>
                      {/* Bottom-left: Dog */}
                      <div className={`${QUADRANT_COLORS.Dog} border-r border-gray-200 relative`}>
                        <span className="absolute bottom-2 left-2 text-[10px] sm:text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Dogs
                        </span>
                        <span className="absolute bottom-2 right-2 text-[9px] text-gray-400 hidden sm:block">Low margin, Low sales</span>
                      </div>
                      {/* Bottom-right: Plow Horse */}
                      <div className={`${QUADRANT_COLORS['Plow Horse']} relative`}>
                        <span className="absolute bottom-2 left-2 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Plow Horses
                        </span>
                        <span className="absolute bottom-2 right-2 text-[9px] text-gray-400 hidden sm:block">Low margin, High sales</span>
                      </div>
                    </div>

                    {/* Average lines */}
                    {items.length > 0 && (
                      <>
                        {/* Vertical line (avg qty sold) */}
                        <div
                          className="absolute top-0 bottom-4 w-px border-l border-dashed border-gray-400"
                          style={{ left: `${(avgQtySold / maxQty) * 100}%` }}
                        >
                          <span className="absolute -top-4 left-1 text-[9px] text-gray-500 whitespace-nowrap">
                            Avg Qty: {avgQtySold.toFixed(0)}
                          </span>
                        </div>
                        {/* Horizontal line (avg margin%) */}
                        <div
                          className="absolute left-4 right-0 h-px border-t border-dashed border-gray-400"
                          style={{ top: `${100 - (avgMarginPercent / maxMargin) * 100}%` }}
                        >
                          <span className="absolute -right-0 -top-4 text-[9px] text-gray-500 whitespace-nowrap">
                            Avg Margin: {avgMarginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}

                    {/* Item dots */}
                    {items.map((item, idx) => {
                      const x = maxQty > 0 ? ((item.qtySold || 0) / maxQty) * 100 : 0;
                      const y = maxMargin > 0 ? 100 - ((item.marginPercent || 0) / maxMargin) * 100 : 100;
                      const style = CLASSIFICATION_STYLES[item.classification] || CLASSIFICATION_STYLES.Dog;
                      const dotColor = item.classification === 'Star'
                        ? 'bg-amber-500'
                        : item.classification === 'Plow Horse'
                        ? 'bg-blue-500'
                        : item.classification === 'Puzzle'
                        ? 'bg-purple-500'
                        : 'bg-red-500';

                      return (
                        <div
                          key={idx}
                          className={`absolute w-3 h-3 rounded-full ${dotColor} border-2 border-white shadow-sm cursor-pointer group z-[5] hover:z-20 hover:scale-150 transition-transform`}
                          style={{
                            left: `calc(${Math.min(Math.max(x, 2), 98)}% - 6px)`,
                            top: `calc(${Math.min(Math.max(y, 2), 98)}% - 6px)`,
                          }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[10px] px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            <div className="font-semibold">{item.name}</div>
                            <div>Qty: {item.qtySold} | Margin: {item.marginPercent?.toFixed(1)}%</div>
                            <div className={`mt-0.5 font-medium`}>{item.classification}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Summary */}
            {categorySummary.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categorySummary.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedCategory(selectedCategory === cat.category ? '' : cat.category)}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">{cat.category}</div>
                        <div className="text-[11px] text-gray-400">{cat.items} items</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">{formatCurrency(cat.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  Item Analysis
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    ({filteredItems.length} items)
                  </span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>

                  {/* Excel Export */}
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

              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-2.5 font-semibold">Item Name</th>
                        <th className="px-4 py-2.5 font-semibold">Category</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Qty Sold</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Revenue</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Cost</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Margin</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Margin%</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredItems.map((item, idx) => {
                        const style = CLASSIFICATION_STYLES[item.classification] || CLASSIFICATION_STYLES.Dog;
                        return (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-purple-50 text-purple-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">
                                {item.qtySold}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(item.revenue)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(item.totalCost)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-700 text-sm">{formatCurrency(item.margin)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-800 font-medium">{item.marginPercent?.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                                {item.classification === 'Star' && <FaStar className="text-[9px]" />}
                                {item.classification}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm || selectedCategory ? 'No items match your filters' : 'No menu items found'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaChartPie className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No menu engineering data available</p>
            <p className="text-sm mt-1">Start taking orders to see your menu performance analysis here</p>
          </div>
        )}
      </div>
    </div>
  );
}
