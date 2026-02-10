'use client';

import { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaCalendarAlt,
  FaUtensils,
  FaClock,
  FaSpinner
} from "react-icons/fa";

import { FiTrendingUp } from "react-icons/fi";
import apiClient from '../../../lib/api';
import { getCachedAnalyticsData, setCachedAnalyticsData } from '../../../utils/dashboardCache';
import { useCurrency } from '../../../contexts/CurrencyContext';

const Analytics = () => {
  const { formatCurrency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // 'today' | '24h' | '7d' | '30d' | 'all'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    // Get restaurant ID from localStorage
    const selectedRestaurant = localStorage.getItem('selectedRestaurantId');
    if (selectedRestaurant) {
      setRestaurantId(selectedRestaurant);
      loadAnalytics(selectedRestaurant, selectedPeriod, true); // Use cache
    } else {
      setError('No restaurant selected');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restaurantId) {
      loadAnalytics(restaurantId, selectedPeriod, true); // Use cache
    }
  }, [selectedPeriod, restaurantId]);

  const loadAnalytics = async (restaurantId, period, useCache = true) => {
    try {
      // Check for cached data first
      if (useCache) {
        const cachedData = getCachedAnalyticsData(restaurantId, period);
        if (cachedData) {
          console.log('⚡ Loading cached analytics data instantly...');
          setAnalytics(cachedData.analytics || cachedData);
          setLoading(false);
          
          // Show background loading
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('analyticsBackgroundLoading', { detail: { loading: true } }));
        } else {
          setLoading(true);
        }
      } else {
      setLoading(true);
      }
      
      setError(null);
      
      console.log(`📊 Loading analytics for restaurant ${restaurantId}, period: ${period}`);
      // Map frontend period to API period
      const apiPeriod = period === '24h' ? '24h' : 
                       period === '7d' ? '7d' : 
                       period === '30d' ? '30d' : 
                       period === 'all' ? 'all' : 
                       'today';
      const response = await apiClient.getAnalytics(restaurantId, apiPeriod);
      
      if (response.success) {
        const freshAnalytics = response.analytics;
        setAnalytics(freshAnalytics);
        console.log('📊 Analytics loaded:', freshAnalytics);
        
        // Cache the data
        setCachedAnalyticsData(restaurantId, freshAnalytics, period);
        console.log('✅ Analytics data cached');
      } else {
        setError('Failed to load analytics');
      }
    } catch (error) {
      console.error('Analytics loading error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('analyticsBackgroundLoading', { detail: { loading: false } }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, color = '#e53e3e' }) => (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl`} style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} className="md:hidden" style={{ color }} />
          <Icon size={24} className="hidden md:block" style={{ color }} />
        </div>
        {change && (
          <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
            change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-gray-600 text-xs md:text-sm">{title}</p>
      </div>
    </div>
  );

  const RevenueChart = () => {
    if (!analytics?.revenueData || analytics.revenueData.length === 0) {
      return (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Revenue Trend</h3>
          <div className="h-48 md:h-64 flex items-center justify-center text-gray-500 text-sm md:text-base">
            No revenue data available
          </div>
        </div>
      );
    }

    const maxRevenue = Math.max(...analytics.revenueData.map(d => d.revenue));
    
    return (
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Revenue Trend</h3>
          <div className="flex gap-1 md:gap-2">
            {['7d', '30d', '90d'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === '7d' ? '7D' : period === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-4">
          {analytics.revenueData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-primary to-red-400 rounded-t-lg transition-all duration-500 hover:scale-105"
                style={{
                  height: `${maxRevenue > 0 ? (data.revenue / maxRevenue) * 180 : 20}px`,
                  minHeight: '20px'
                }}
              />
              <div className="mt-1 md:mt-2 text-center">
                <p className="text-xs md:text-sm font-medium text-gray-800">{formatCurrency(data.revenue)}</p>
                <p className="text-xs text-gray-500">{data.day}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PopularItems = () => {
    if (!analytics?.popularItems || analytics.popularItems.length === 0) {
      return (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Popular Items</h3>
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            No popular items data available
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Popular Items</h3>
        <div className="space-y-2 md:space-y-4">
          {analytics.popularItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                  <FaUtensils className="text-gray-600" size={14} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</h4>
                  <p className="text-xs md:text-sm text-gray-600">{item.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-sm md:text-base">{formatCurrency(item.revenue)}</p>
                <p className="text-xs md:text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrderTypeChart = () => {
    if (!analytics?.ordersByType || analytics.ordersByType.length === 0) {
      return (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Orders by Type</h3>
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            No order type data available
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Orders by Type</h3>
        <div className="space-y-2 md:space-y-4">
          {analytics.ordersByType.map((type, index) => {
            const colors = ['#e53e3e', '#3182ce', '#38a169'];
            return (
              <div key={index} className="space-y-1 md:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-medium text-gray-700">{type.type}</span>
                  <span className="text-xs md:text-sm text-gray-600">{type.count} orders ({type.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                  <div
                    className="h-2 md:h-3 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: colors[index % colors.length],
                      width: `${type.percentage}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BusyHours = () => {
    if (!analytics?.busyHours || analytics.busyHours.length === 0) {
      return (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Busy Hours</h3>
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            No busy hours data available
          </div>
        </div>
      );
    }

    const maxOrders = Math.max(...analytics.busyHours.map(h => h.orders));

    return (
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Busy Hours</h3>
        <div className="space-y-2 md:space-y-3">
          {analytics.busyHours.map((hour, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-4">
              <div className="w-12 md:w-16 text-xs md:text-sm font-medium text-gray-600">
                {hour.hour}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 md:h-6 relative">
                <div
                  className="bg-gradient-to-r from-primary to-red-400 h-4 md:h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-1 md:pr-2"
                  style={{ width: `${maxOrders > 0 ? (hour.orders / maxOrders) * 100 : 0}%` }}
                >
                  <span className="text-white text-xs md:text-sm font-medium">{hour.orders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-primary text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => restaurantId && loadAnalytics(restaurantId, selectedPeriod, false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Analytics Data</h2>
            <p className="text-gray-600">Start taking orders to see your analytics!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Real-time insights into your restaurant performance</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="mb-4 md:mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2 md:p-3 border border-gray-200">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {[
                { key: 'today', label: 'Today' },
                { key: '24h', label: 'Last 24 Hours' },
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'all', label: 'All' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
                    selectedPeriod === period.key
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile, 4x1 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            icon={FaMoneyBillWave}
            color="#e53e3e"
          />
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders.toLocaleString()}
            icon={FaShoppingCart}
            color="#3182ce"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(analytics.avgOrderValue)}
            icon={FaChartLine}
            color="#38a169"
          />
          <StatCard
            title="New Customers"
            value={analytics.newCustomers.toLocaleString()}
            icon={FaUsers}
            color="#d97706"
          />
        </div>

        {/* Charts Grid - 1x2 on mobile, 2x1 on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
          <RevenueChart />
          <OrderTypeChart />
        </div>

        {/* Bottom Grid - 1x2 on mobile, 2x1 on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          <PopularItems />
          <BusyHours />
        </div>
      </div>
    </div>
  );
};

export default Analytics;