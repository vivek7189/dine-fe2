'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getCachedAutomationData, setCachedAutomationData } from '../../../utils/dashboardCache';
import {
  FaRobot,
  FaWhatsapp,
  FaEnvelope,
  FaSms,
  FaChartLine,
  FaUsers,
  FaGift,
  FaCog,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendar,
  FaMoneyBillWave,
  FaTags,
  FaBell,
  FaHistory,
  FaFilter,
  FaSearch,
  FaDownload,
  FaUpload,
  FaImage,
  FaTimes
} from 'react-icons/fa';

const Automation = () => {
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappSettings, setWhatsappSettings] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Load initial data
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
    const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');

    if (!token || !userData.id) {
      router.push('/login');
      return;
    }

    setRestaurantId(savedRestaurantId);
    setRestaurant(savedRestaurant);
    loadAutomationData(savedRestaurantId, true); // Use cache
  }, [router]);

  const loadAutomationData = async (rid, useCache = true) => {
    if (!rid) return;
    
    try {
      // Check for cached data first
      if (useCache) {
        const cachedData = getCachedAutomationData(rid);
        if (cachedData) {
          console.log('⚡ Loading cached automation data instantly...');
          if (cachedData.automations) setAutomations(cachedData.automations);
          if (cachedData.templates) setTemplates(cachedData.templates);
          if (cachedData.analytics) setAnalytics(cachedData.analytics);
          if (cachedData.customers) setCustomers(cachedData.customers);
          if (cachedData.coupons) setCoupons(cachedData.coupons);
          if (cachedData.whatsappConnected !== undefined) setWhatsappConnected(cachedData.whatsappConnected);
          if (cachedData.whatsappSettings) setWhatsappSettings(cachedData.whatsappSettings);
          setLoading(false);
          
          // Show background loading
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('automationBackgroundLoading', { detail: { loading: true } }));
        } else {
      setLoading(true);
        }
      } else {
        setLoading(true);
      }
      
      // Load all automation data in parallel with better error handling
      const [automationsRes, templatesRes, analyticsRes, customersRes, couponsRes, whatsappRes] = await Promise.allSettled([
        apiClient.getAutomations(rid).catch((err) => {
          console.warn('Failed to load automations:', err);
          return { automations: [] };
        }),
        apiClient.getAutomationTemplates(rid).catch((err) => {
          console.warn('Failed to load templates:', err);
          return { templates: [] };
        }),
        apiClient.getAutomationAnalytics(rid).catch((err) => {
          console.warn('Failed to load analytics:', err);
          return { analytics: null };
        }),
        apiClient.getCustomers(rid).catch((err) => {
          console.warn('Failed to load customers:', err);
          return { customers: [] };
        }),
        apiClient.getCoupons(rid).catch((err) => {
          console.warn('Failed to load coupons:', err);
          return { coupons: [] };
        }),
        apiClient.getWhatsAppSettings(rid).catch((err) => {
          console.warn('Failed to load WhatsApp settings:', err);
          return { connected: false, webhookUrl: null };
        })
      ]);

      // Extract values from Promise.allSettled results
      const getValue = (result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      };

      const automationsData = getValue(automationsRes) || { automations: [] };
      const templatesData = getValue(templatesRes) || { templates: [] };
      const analyticsData = getValue(analyticsRes) || { analytics: null };
      const customersData = getValue(customersRes) || { customers: [] };
      const couponsData = getValue(couponsRes) || { coupons: [] };
      const whatsappData = getValue(whatsappRes) || { connected: false, webhookUrl: null };

      const freshAutomations = automationsData.automations || [];
      const freshTemplates = templatesData.templates || [];
      const freshAnalytics = analyticsData.analytics;
      const freshCustomers = customersData.customers || [];
      const freshCoupons = couponsData.coupons || [];
      const freshWhatsappConnected = whatsappData.connected || false;
      const freshWhatsappSettings = {
        ...whatsappData.settings,
        webhookUrl: whatsappData.webhookUrl || null
      };

      setAutomations(freshAutomations);
      setTemplates(freshTemplates);
      setAnalytics(freshAnalytics);
      setCustomers(freshCustomers);
      setCoupons(freshCoupons);
      setWhatsappConnected(freshWhatsappConnected);
      setWhatsappSettings(freshWhatsappSettings);

      // Cache the data
      const dataToCache = {
        automations: freshAutomations,
        templates: freshTemplates,
        analytics: freshAnalytics,
        customers: freshCustomers,
        coupons: freshCoupons,
        whatsappConnected: freshWhatsappConnected,
        whatsappSettings: freshWhatsappSettings
      };
      setCachedAutomationData(rid, dataToCache);
      console.log('✅ Automation data cached');
      
    } catch (error) {
      console.error('Error loading automation data:', error);
      // Set defaults on error
      setAutomations([]);
      setTemplates([]);
      setAnalytics(null);
      setCustomers([]);
      setCoupons([]);
      setWhatsappConnected(false);
      setWhatsappSettings({ webhookUrl: null });
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('automationBackgroundLoading', { detail: { loading: false } }));
    }
  };

  const toggleAutomation = async (automationId, enabled) => {
    try {
      await apiClient.updateAutomation(restaurantId, automationId, { enabled: !enabled });
      setAutomations(prev => prev.map(a => 
        a.id === automationId ? { ...a, enabled: !enabled } : a
      ));
    } catch (error) {
      console.error('Error toggling automation:', error);
      alert('Failed to update automation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading automation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaRobot className="text-red-600" />
                Automation & Loyalty
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Automate customer engagement and build loyalty programs
              </p>
            </div>
            {!whatsappConnected && (
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FaWhatsapp /> Connect WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'automations', label: 'Automations', icon: FaRobot },
                { id: 'templates', label: 'Templates', icon: FaTags },
                { id: 'customers', label: 'Customers', icon: FaUsers },
                { id: 'coupons', label: 'Coupons', icon: FaGift },
                { id: 'analytics', label: 'Analytics', icon: FaChartLine },
                { id: 'settings', label: 'Settings', icon: FaCog }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === 'overview' && <OverviewTab analytics={analytics} automations={automations} whatsappConnected={whatsappConnected} />}
          {activeTab === 'automations' && <AutomationsTab automations={automations} onToggle={toggleAutomation} restaurantId={restaurantId} />}
          {activeTab === 'templates' && <TemplatesTab templates={templates} restaurantId={restaurantId} />}
          {activeTab === 'customers' && <CustomersTab customers={customers} restaurantId={restaurantId} />}
          {activeTab === 'coupons' && <CouponsTab coupons={coupons} restaurantId={restaurantId} />}
          {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
          {activeTab === 'settings' && <SettingsTab whatsappConnected={whatsappConnected} whatsappSettings={whatsappSettings} restaurantId={restaurantId} />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analytics, automations, whatsappConnected }) => {
  const activeAutomations = automations.filter(a => a.enabled).length;
  const totalAutomations = automations.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Messages Sent</p>
              <p className="text-3xl font-bold mt-2">{analytics?.messagesSent || 0}</p>
              <p className="text-red-100 text-xs mt-1">Last 30 days</p>
            </div>
            <FaWhatsapp className="text-4xl opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Conversions</p>
              <p className="text-3xl font-bold mt-2">{analytics?.conversions || 0}</p>
              <p className="text-green-100 text-xs mt-1">Coupons used</p>
            </div>
            <FaCheckCircle className="text-4xl opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Automations</p>
              <p className="text-3xl font-bold mt-2">{activeAutomations}/{totalAutomations}</p>
              <p className="text-blue-100 text-xs mt-1">Enabled</p>
            </div>
            <FaRobot className="text-4xl opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{analytics?.totalCustomers || 0}</p>
              <p className="text-purple-100 text-xs mt-1">In database</p>
            </div>
            <FaUsers className="text-4xl opacity-50" />
          </div>
        </div>
      </div>

      {!whatsappConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">WhatsApp Not Connected</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Connect your WhatsApp Business number to start sending automated messages to customers.
            </p>
            <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
              Connect Now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <div className="space-y-3">
            {[
              { label: 'New Customers', value: analytics?.segments?.new || 0, color: 'blue' },
              { label: 'Returning Customers', value: analytics?.segments?.returning || 0, color: 'green' },
              { label: 'High Value', value: analytics?.segments?.highValue || 0, color: 'purple' },
              { label: 'Lost Customers', value: analytics?.segments?.lost || 0, color: 'red' }
            ].map(segment => (
              <div key={segment.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{segment.label}</span>
                <span className={`text-sm font-semibold text-${segment.color}-600`}>{segment.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics?.recentActivity?.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full bg-${activity.type === 'message' ? 'green' : 'blue'}-500`} />
                <span className="text-gray-600 flex-1">{activity.description}</span>
                <span className="text-gray-400">{activity.time}</span>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Automations Tab Component
const AutomationsTab = ({ automations, onToggle, restaurantId }) => {
  const automationTypes = [
    { id: 'welcome', name: 'Welcome Message', description: 'Send welcome message on first order', icon: FaCheckCircle },
    { id: 'followup', name: 'Order Follow-up', description: 'Follow up after order completion', icon: FaBell },
    { id: 'reminder', name: 'Booking Reminder', description: 'Remind customers before booking', icon: FaCalendar },
    { id: 'winback', name: 'Win-back Campaign', description: 'Re-engage inactive customers', icon: FaUsers },
    { id: 'birthday', name: 'Birthday Greeting', description: 'Send birthday wishes with coupon', icon: FaGift },
    { id: 'highvalue', name: 'High Value Reward', description: 'Reward high-spending customers', icon: FaMoneyBillWave }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Automation Flows</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <FaPlus /> Create Automation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationTypes.map(type => {
          const automation = automations.find(a => a.type === type.id);
          return (
            <div key={type.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <type.icon className="text-red-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    {automation && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>Status: {automation.enabled ? 'Active' : 'Inactive'}</span>
                        <span>Sent: {automation.stats?.sent || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => automation && onToggle(automation.id, automation.enabled)}
                  className="ml-4"
                >
                  {automation?.enabled ? (
                    <FaToggleOn className="text-green-600 text-2xl" />
                  ) : (
                    <FaToggleOff className="text-gray-300 text-2xl" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Templates Tab Component
const TemplatesTab = ({ templates, restaurantId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <FaPlus /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div key={template.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{template.message}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>Type: {template.type}</span>
                  <span>Status: {template.approved ? 'Approved' : 'Pending'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <FaEdit />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Customers Tab Component
const CustomersTab = ({ customers, restaurantId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Customer Database</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search customers..."
            className="px-4 py-2 border rounded-lg"
          />
          <button className="px-4 py-2 bg-gray-100 rounded-lg">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.slice(0, 10).map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{customer.name || 'Walk-in'}</td>
                <td className="px-4 py-3 text-sm">{customer.phone || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{customer.visitCount || 0}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(customer.totalSpend || 0)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    customer.segment === 'highValue' ? 'bg-purple-100 text-purple-700' :
                    customer.segment === 'returning' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {customer.segment || 'new'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Coupons Tab Component
const CouponsTab = ({ coupons, restaurantId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Coupon Codes</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <FaPlus /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{coupon.code}</h3>
                <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold">{coupon.discountType === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span>{coupon.usedCount || 0}/{coupon.maxUses || '∞'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid until:</span>
                    <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <FaEdit />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Message Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Sent</span>
              <span className="font-semibold">{analytics?.messagesSent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivered</span>
              <span className="font-semibold">{analytics?.messagesDelivered || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Read</span>
              <span className="font-semibold">{analytics?.messagesRead || 0}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conversion Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Coupons Used</span>
              <span className="font-semibold">{analytics?.conversions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Orders Placed</span>
              <span className="font-semibold">{analytics?.ordersPlaced || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue Generated</span>
              <span className="font-semibold">{formatCurrency(analytics?.revenueGenerated || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ whatsappConnected, whatsappSettings, restaurantId }) => {
  const [connectionMode, setConnectionMode] = useState('restaurant'); // 'restaurant' or 'dineopen'
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionData, setConnectionData] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: ''
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from DineOpen automation system.');
  const [testTemplateName, setTestTemplateName] = useState('');
  const [testTemplateLanguage, setTestTemplateLanguage] = useState('en_US');
  const [useTemplate, setUseTemplate] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleConnect = async () => {
    try {
      if (connectionMode === 'restaurant') {
        // Connect restaurant's own WhatsApp
        await apiClient.connectWhatsApp(restaurantId, {
          mode: 'restaurant',
          ...connectionData
        });
      } else {
        // Use DineOpen's WhatsApp (just enable it)
        await apiClient.connectWhatsApp(restaurantId, {
          mode: 'dineopen'
        });
      }
      alert('WhatsApp connected successfully!');
      setShowConnectModal(false);
      window.location.reload();
    } catch (error) {
      let errorMessage = error.message || 'Failed to connect';
      
      // Provide more helpful error message for 404
      if (errorMessage.includes('not found')) {
        errorMessage = 'Backend endpoint not found. Please restart your backend server and try again.';
      }
      
      alert('Failed to connect: ' + errorMessage);
      console.error('WhatsApp connection error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Integration Settings</h2>
      
      {/* Connection Mode Selection */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">WhatsApp Connection Mode</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="connectionMode"
              value="restaurant"
              checked={connectionMode === 'restaurant'}
              onChange={(e) => setConnectionMode(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Use Restaurant&apos;s WhatsApp Number</div>
              <p className="text-sm text-gray-600 mt-1">
                Connect your own WhatsApp Business number. Messages will appear from your restaurant&apos;s number.
                Recommended for better brand recognition.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="connectionMode"
              value="dineopen"
              checked={connectionMode === 'dineopen'}
              onChange={(e) => setConnectionMode(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Use DineOpen WhatsApp Number</div>
              <p className="text-sm text-gray-600 mt-1">
                Use DineOpen&apos;s shared WhatsApp number. Quick setup, no configuration needed.
                Messages will appear from DineOpen&apos;s number.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Current Connection Status */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaWhatsapp className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">WhatsApp Business API</h3>
              <p className="text-sm text-gray-600 mt-1">
                {whatsappConnected 
                  ? `Connected (${whatsappSettings?.mode === 'restaurant' ? 'Restaurant Number' : 'DineOpen Number'})`
                  : 'Not connected'}
              </p>
              {whatsappConnected && whatsappSettings?.mode === 'restaurant' && (
                <p className="text-xs text-gray-500 mt-1">
                  Phone: {whatsappSettings?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {whatsappConnected && (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to disconnect WhatsApp?')) {
                    await apiClient.disconnectWhatsApp(restaurantId);
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Disconnect
              </button>
            )}
            <button
              onClick={() => setShowConnectModal(true)}
              className={`px-4 py-2 rounded-lg ${whatsappConnected ? 'bg-gray-100 text-gray-700' : 'bg-green-600 text-white'} hover:opacity-90`}
            >
              {whatsappConnected ? 'Reconfigure' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Instructions */}
      {!whatsappConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
          {connectionMode === 'restaurant' ? (
            <div className="text-sm text-blue-800 space-y-2">
              <p>To connect your restaurant&apos;s WhatsApp number:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a Meta Business Account</li>
                <li>Set up WhatsApp Business API</li>
                <li>Get your Access Token, Phone Number ID, and Business Account ID</li>
                <li>Configure webhook settings with this URL:
                  <div className="bg-blue-100 p-2 rounded mt-1 font-mono text-xs break-all">
                    {whatsappSettings?.webhookUrl || 'Loading webhook URL...'}
                  </div>
                </li>
                <li>Enter credentials below</li>
              </ol>
              <p className="mt-3">
                <a href="/WHATSAPP_SETUP_GUIDE.md" target="_blank" className="text-blue-600 underline">
                  View detailed setup guide →
                </a>
              </p>
            </div>
          ) : (
            <div className="text-sm text-blue-800">
              <p>DineOpen&apos;s WhatsApp number is ready to use. Just click &quot;Connect&quot; to enable it.</p>
              <p className="mt-2">Note: Messages will appear from DineOpen&apos;s number, not your restaurant&apos;s number.</p>
            </div>
          )}
        </div>
      )}

      {/* Test Message Section */}
      {whatsappConnected && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBell className="text-green-600" />
            Test WhatsApp Message
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Send a test message to verify your WhatsApp integration is working correctly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="917042330092 (without + or spaces)"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter phone number with country code (e.g., 917042330092 for India)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTemplate"
                checked={useTemplate}
                onChange={(e) => setUseTemplate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useTemplate" className="text-sm text-gray-700">
                Use Template Message (instead of plain text)
              </label>
            </div>

            {useTemplate ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={testTemplateName}
                    onChange={(e) => setTestTemplateName(e.target.value)}
                    placeholder="jaspers_market_plain_text_v1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Language
                  </label>
                  <select
                    value={testTemplateLanguage}
                    onChange={(e) => setTestTemplateLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Parameter (Message Text)
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter message text that will be used as template parameter"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter your test message here..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaExclamationTriangle className="text-red-600" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Success!' : 'Error'}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {testResult.message || testResult.error}
                </p>
                {testResult.messageId && (
                  <p className="text-xs mt-1 opacity-75">
                    Message ID: {testResult.messageId}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={async () => {
                if (!testPhoneNumber) {
                  alert('Please enter a phone number');
                  return;
                }
                if (!useTemplate && !testMessage) {
                  alert('Please enter a message');
                  return;
                }
                if (useTemplate && !testTemplateName) {
                  alert('Please enter a template name');
                  return;
                }

                setTesting(true);
                setTestResult(null);

                try {
                  const result = await apiClient.testWhatsAppMessage(restaurantId, {
                    phoneNumber: testPhoneNumber,
                    message: useTemplate ? null : testMessage,
                    templateName: useTemplate ? testTemplateName : null,
                    templateLanguage: useTemplate ? testTemplateLanguage : null
                  });

                  setTestResult({
                    success: true,
                    message: result.message || 'Test message sent successfully!',
                    messageId: result.messageId
                  });
                } catch (error) {
                  setTestResult({
                    success: false,
                    error: error.message || 'Failed to send test message'
                  });
                } finally {
                  setTesting(false);
                }
              }}
              disabled={testing || !whatsappConnected}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaBell />
                  Send Test Message
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {connectionMode === 'restaurant' ? 'Connect Your WhatsApp' : 'Enable DineOpen WhatsApp'}
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {connectionMode === 'restaurant' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token *
                  </label>
                  <input
                    type="text"
                    value={connectionData.accessToken}
                    onChange={(e) => setConnectionData({...connectionData, accessToken: e.target.value})}
                    placeholder="EAAxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get this from Meta Business Suite → System Users → Generate Token
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={connectionData.phoneNumberId}
                    onChange={(e) => setConnectionData({...connectionData, phoneNumberId: e.target.value})}
                    placeholder="123456789012345"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Found in WhatsApp API Setup page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Account ID *
                  </label>
                    <input
                      type="text"
                      value={connectionData.businessAccountId}
                      onChange={(e) => setConnectionData({...connectionData, businessAccountId: e.target.value})}
                      placeholder="123456789012345"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  <p className="text-xs text-gray-500 mt-1">
                    Found in WhatsApp API Setup page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Verify Token *
                  </label>
                  <input
                    type="text"
                    value={connectionData.webhookVerifyToken}
                    onChange={(e) => setConnectionData({...connectionData, webhookVerifyToken: e.target.value})}
                    placeholder="your_secure_token"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set this in Meta webhook configuration
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Make sure you&apos;ve completed the WhatsApp setup in Meta Business Suite first.
                    <a href="/WHATSAPP_SETUP_GUIDE.md" target="_blank" className="text-yellow-600 underline ml-1">
                      View setup guide →
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    By using DineOpen&apos;s WhatsApp number, messages will be sent from DineOpen&apos;s shared number.
                    This is a quick setup option that doesn&apos;t require Meta Business Account configuration.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For better brand recognition, we recommend using your own WhatsApp number.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {connectionMode === 'restaurant' ? 'Connect' : 'Enable DineOpen WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automation;

