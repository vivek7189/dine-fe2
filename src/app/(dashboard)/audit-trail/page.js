'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import {
  FaHistory,
  FaSpinner,
  FaFileExcel,
  FaChevronDown,
  FaSearch,
  FaEdit,
  FaTimes,
  FaPrint,
  FaUndo,
  FaMoneyBillWave,
} from 'react-icons/fa';

const ACTION_CONFIG = {
  edited: { icon: FaEdit, color: 'amber', bgClass: 'bg-amber-100', textClass: 'text-amber-700', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', borderClass: 'border-amber-300', label: 'Edited' },
  cancelled: { icon: FaTimes, color: 'red', bgClass: 'bg-red-100', textClass: 'text-red-600', badgeBg: 'bg-red-100', badgeText: 'text-red-800', borderClass: 'border-red-300', label: 'Cancelled' },
  voided: { icon: FaTimes, color: 'red', bgClass: 'bg-red-200', textClass: 'text-red-800', badgeBg: 'bg-red-200', badgeText: 'text-red-900', borderClass: 'border-red-400', label: 'Voided' },
  reprinted: { icon: FaPrint, color: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-600', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800', borderClass: 'border-purple-300', label: 'Reprinted' },
  refunded: { icon: FaMoneyBillWave, color: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800', borderClass: 'border-orange-300', label: 'Refunded' },
  restored: { icon: FaUndo, color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-800', borderClass: 'border-green-300', label: 'Restored' },
  created: { icon: FaHistory, color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', borderClass: 'border-blue-300', label: 'Created' },
};

const ACTION_FILTER_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'edited', label: 'Edited' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'voided', label: 'Voided' },
  { key: 'reprinted', label: 'Reprinted' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'restored', label: 'Restored' },
];

const formatEventTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatEventTimeShort = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function AuditTrailPage() {
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

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Action type filter
  const [actionType, setActionType] = useState('');

  // View mode: 'timeline' or 'table'
  const [viewMode, setViewMode] = useState('timeline');

  // Load restaurant info (same resolution as hourly-report page)
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
      if (actionType) {
        options.actionType = actionType;
      }
      const res = await apiClient.getAuditTrail(restaurantId, options);
      if (res?.success) {
        setData(res);
      } else {
        setData(res || null);
      }
    } catch (err) {
      console.error('Fetch audit trail error:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, getDateRange, selectedSubRestaurant, actionType]);

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
      router.replace(`/audit-trail?${params.toString()}`, { scroll: false });
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const params = new URLSearchParams();
      params.set('period', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      router.replace(`/audit-trail?${params.toString()}`, { scroll: false });
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
    return periods.find(p => p.key === activePeriod)?.label || 'Today';
  };

  // Filter events by search term
  const events = data?.events || [];
  const filteredEvents = searchTerm
    ? events.filter(e => {
        const term = searchTerm.toLowerCase();
        const orderNum = (e.orderNumber || `#${e.dailyOrderId || ''}` || '').toLowerCase();
        const staff = (e.staffName || '').toLowerCase();
        const details = (e.details || '').toLowerCase();
        return orderNum.includes(term) || staff.includes(term) || details.includes(term);
      })
    : events;

  const summary = data?.summary || {};

  const getActionConfig = (action) => {
    return ACTION_CONFIG[action] || ACTION_CONFIG.created;
  };

  const handleExcelDownload = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ['Timestamp', 'Action', 'Order #', 'Staff', 'Details', 'Amount'],
      ...filteredEvents.map(e => [
        formatEventTime(e.timestamp),
        getActionConfig(e.action).label,
        e.orderNumber || `#${e.dailyOrderId || ''}`,
        e.staffName || '',
        e.details || '',
        e.totalAmount || 0,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 28 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 50 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail');
    XLSX.writeFile(wb, `audit-trail-${activePeriod}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-slate-600 to-gray-800 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-gray-300">
                <FaHistory className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Trail</h1>
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
                    <FaHistory className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Events</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalEvents || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FaEdit className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Edits</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.edits || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaTimes className="text-red-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Cancellations</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.cancellations || 0}</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaPrint className="text-purple-600 text-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Reprints</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.reprints || 0}</div>
              </div>
            </div>

            {/* Action Type Filter + Search + View Toggle + Export */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-gray-800">
                    Events
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'})
                    </span>
                  </h3>
                  {/* Action Type Filter */}
                  <div className="relative">
                    <select
                      value={actionType}
                      onChange={e => setActionType(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      {ACTION_FILTER_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        viewMode === 'timeline'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        viewMode === 'table'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search orders, staff..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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

              {filteredEvents.length > 0 ? (
                viewMode === 'timeline' ? (
                  /* Timeline View */
                  <div className="p-4 sm:p-6">
                    <div className="relative">
                      {filteredEvents.map((event, index) => {
                        const config = getActionConfig(event.action);
                        const ActionIcon = config.icon;
                        const isLast = index === filteredEvents.length - 1;

                        return (
                          <div key={event.orderId + '-' + index} className="relative flex gap-4 pb-6">
                            {/* Timeline Line */}
                            {!isLast && (
                              <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            {/* Timeline Dot */}
                            <div className={`relative z-[1] flex-shrink-0 w-9 h-9 rounded-full ${config.bgClass} flex items-center justify-center border-2 ${config.borderClass}`}>
                              <ActionIcon className={`text-sm ${config.textClass}`} />
                            </div>
                            {/* Event Card */}
                            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
                                    {config.label}
                                  </span>
                                  <span className="font-bold text-gray-900 text-sm">
                                    Order {event.orderNumber || `#${event.dailyOrderId || ''}`}
                                  </span>
                                  {event.staffName && (
                                    <>
                                      <span className="text-gray-300">-</span>
                                      <span className="text-sm text-gray-600">{event.staffName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {event.details && (
                                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{event.details}</p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-400">{formatEventTime(event.timestamp)}</span>
                                {event.totalAmount != null && event.totalAmount !== 0 && (
                                  <span className="text-sm font-semibold text-gray-700">
                                    {formatCurrency(event.totalAmount)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                          <th className="px-4 py-2.5 font-semibold">Time</th>
                          <th className="px-4 py-2.5 font-semibold">Action</th>
                          <th className="px-4 py-2.5 font-semibold">Order #</th>
                          <th className="px-4 py-2.5 font-semibold">Staff</th>
                          <th className="px-4 py-2.5 font-semibold">Details</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredEvents.map((event, index) => {
                          const config = getActionConfig(event.action);
                          return (
                            <tr key={event.orderId + '-' + index} className="hover:bg-gray-50/80 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {formatEventTimeShort(event.timestamp)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
                                  {config.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-gray-900 text-sm">
                                  {event.orderNumber || `#${event.dailyOrderId || ''}`}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{event.staffName || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-[300px] truncate">{event.details || '-'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                                {event.totalAmount != null && event.totalAmount !== 0
                                  ? formatCurrency(event.totalAmount)
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? 'No events match your search' : 'No audit events recorded in this period'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaHistory className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No audit events recorded in this period</p>
            <p className="text-sm mt-1">Order edits, cancellations, voids, reprints, and refunds will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
