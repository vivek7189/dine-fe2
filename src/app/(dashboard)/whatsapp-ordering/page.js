'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import {
  FaWhatsapp,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaCog,
  FaHistory,
  FaChartBar,
  FaQrcode,
  FaCopy,
  FaExternalLinkAlt,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
  FaArrowRight,
  FaShoppingCart,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLink,
  FaPhone,
  FaStore,
  FaUsers,
  FaRocket,
  FaClipboardList
} from 'react-icons/fa';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dine-backend.vercel.app';

export default function WhatsAppOrderingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  // Config state
  const [config, setConfig] = useState(null);
  const [configExists, setConfigExists] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    appSecret: '',
    welcomeMessage: '',
    requireTableNumber: true,
    paymentMode: 'pay_at_counter',
    paymentLink: '',
    autoAcceptOrders: false,
    enabled: false
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Test message
  const [testPhone, setTestPhone] = useState('');
  const [testing, setTesting] = useState(false);

  // Toast
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  // Load restaurant ID
  useEffect(() => {
    const id = localStorage.getItem('selectedRestaurantId');
    if (!id) {
      router.push('/restaurants');
      return;
    }
    setRestaurantId(id);
  }, [router]);

  // Load config
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/whatsapp-ordering/config/${restaurantId}`);
      if (response.success && response.exists) {
        setConfig(response.config);
        setConfigExists(true);
        setForm(prev => ({
          ...prev,
          phoneNumberId: response.config.phoneNumberId || '',
          businessAccountId: response.config.businessAccountId || '',
          welcomeMessage: response.config.welcomeMessage || '',
          requireTableNumber: response.config.requireTableNumber !== false,
          paymentMode: response.config.paymentMode || 'pay_at_counter',
          paymentLink: response.config.paymentLink || '',
          autoAcceptOrders: response.config.autoAcceptOrders || false,
          enabled: response.config.enabled || false
        }));
      } else {
        setConfigExists(false);
        setConfig(null);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) loadConfig();
  }, [restaurantId, loadConfig]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/whatsapp-ordering/stats/${restaurantId}`);
      if (response.success) setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && configExists) loadStats();
  }, [restaurantId, configExists, loadStats]);

  // Save config
  const handleSaveConfig = async () => {
    if (!form.accessToken && !config?.accessTokenMasked) {
      showNotification('Access Token is required', 'error');
      return;
    }
    if (!form.phoneNumberId) {
      showNotification('Phone Number ID is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };
      // Don't send empty access token if we already have one saved
      if (!payload.accessToken && config?.accessTokenMasked) {
        delete payload.accessToken;
      }

      const response = await apiClient.post(`/api/whatsapp-ordering/config/${restaurantId}`, payload);
      if (response.success) {
        showNotification('Configuration saved successfully!');
        await loadConfig();
      } else {
        showNotification(response.error || 'Failed to save', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle enabled
  const handleToggle = async () => {
    try {
      const newState = !form.enabled;
      const response = await apiClient.put(`/api/whatsapp-ordering/toggle/${restaurantId}`, { enabled: newState });
      if (response.success) {
        setForm(prev => ({ ...prev, enabled: newState }));
        showNotification(newState ? 'WhatsApp Ordering enabled!' : 'WhatsApp Ordering disabled');
        await loadConfig();
      } else {
        showNotification(response.error || 'Failed to toggle', 'error');
      }
    } catch (error) {
      showNotification('Failed to toggle', 'error');
    }
  };

  // Load orders
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await apiClient.get(`/api/whatsapp-ordering/orders/${restaurantId}?limit=50`);
      if (response.success) setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (activeTab === 'orders' && restaurantId) loadOrders();
  }, [activeTab, restaurantId, loadOrders]);

  // Test message
  const handleTestMessage = async () => {
    if (!testPhone) {
      showNotification('Enter a phone number to test', 'error');
      return;
    }
    setTesting(true);
    try {
      const response = await apiClient.post(`/api/whatsapp-ordering/test-message/${restaurantId}`, { phoneNumber: testPhone });
      if (response.success) {
        showNotification('Test message sent!');
      } else {
        showNotification(response.error || 'Failed to send test message', 'error');
      }
    } catch (error) {
      showNotification('Failed to send test message', 'error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  const webhookUrl = `${BACKEND_URL}/api/whatsapp-ordering/webhook`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaWhatsapp },
    { id: 'setup', label: 'Setup', icon: FaCog },
    { id: 'settings', label: 'Settings', icon: FaClipboardList },
    { id: 'orders', label: 'Orders', icon: FaShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {notification.type === 'error' ? <FaTimes /> : <FaCheck />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <FaWhatsapp className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">WhatsApp Ordering</h1>
                <p className="text-green-100">Let customers order directly via WhatsApp</p>
              </div>
            </div>
            {configExists && (
              <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  form.enabled
                    ? 'bg-white text-green-700 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {form.enabled ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                {form.enabled ? 'Active' : 'Inactive'}
              </button>
            )}
          </div>

          {/* Quick Stats */}
          {configExists && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaShoppingCart className="text-2xl text-green-100" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    <p className="text-green-100 text-sm">Orders (30d)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaChartBar className="text-2xl text-green-100" />
                  <div>
                    <p className="text-2xl font-bold">{config?.currencySymbol || '₹'}{stats.totalRevenue}</p>
                    <p className="text-green-100 text-sm">Revenue (30d)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-2xl text-green-100" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalConversations}</p>
                    <p className="text-green-100 text-sm">Conversations</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaRocket className="text-2xl text-green-100" />
                  <div>
                    <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                    <p className="text-green-100 text-sm">Conversion Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 mt-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex-1 justify-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <OverviewTab configExists={configExists} config={config} form={form} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'setup' && (
            <SetupTab
              form={form}
              setForm={setForm}
              config={config}
              configExists={configExists}
              saving={saving}
              handleSaveConfig={handleSaveConfig}
              webhookUrl={webhookUrl}
              copyToClipboard={copyToClipboard}
              testPhone={testPhone}
              setTestPhone={setTestPhone}
              testing={testing}
              handleTestMessage={handleTestMessage}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              form={form}
              setForm={setForm}
              saving={saving}
              handleSaveConfig={handleSaveConfig}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              ordersLoading={ordersLoading}
              loadOrders={loadOrders}
              currencySymbol={config?.currencySymbol || '₹'}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab stats={stats} currencySymbol={config?.currencySymbol || '₹'} />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Overview Tab ====================

function OverviewTab({ configExists, config, form, setActiveTab }) {
  return (
    <div className="space-y-6">
      {/* How It Works */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How WhatsApp Ordering Works</h2>
        <p className="text-gray-500 mb-8">Customers order food directly through WhatsApp. No app downloads needed.</p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              icon: FaQrcode,
              title: 'Scan QR / Send Message',
              desc: 'Customer scans your QR code or messages your WhatsApp number'
            },
            {
              step: '2',
              icon: FaClipboardList,
              title: 'Browse Menu',
              desc: 'Interactive menu appears with categories, items, and prices'
            },
            {
              step: '3',
              icon: FaShoppingCart,
              title: 'Add to Cart & Checkout',
              desc: 'Customer selects items, enters name, table number, and confirms'
            },
            {
              step: '4',
              icon: FaStore,
              title: 'Order on Dashboard',
              desc: 'Order appears instantly on your dashboard with real-time notification'
            }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                <item.icon className="text-2xl text-green-600" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What You Need */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">What You Need to Get Started</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaWhatsapp className="text-green-600" /> Meta WhatsApp Business Setup
            </h3>
            <div className="space-y-3">
              {[
                { text: 'A Meta Business Account (free)', link: 'https://business.facebook.com' },
                { text: 'A phone number for WhatsApp Business (dedicated number)', link: null },
                { text: 'Create a Meta App with WhatsApp product', link: 'https://developers.facebook.com/apps' },
                { text: 'Generate a permanent access token', link: null },
                { text: 'Configure the webhook URL (we provide this)', link: null },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-700 text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{item.text}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-0.5">
                        Open <FaExternalLinkAlt className="text-[10px]" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" /> Important Notes
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-3 text-sm text-blue-800">
              <p><strong>Each restaurant needs its own WhatsApp number.</strong> The number cannot be used on the regular WhatsApp app at the same time.</p>
              <p><strong>Meta approval:</strong> DineOpen is the platform app. Each restaurant connects their phone number under our app. No per-restaurant approval needed for receiving messages.</p>
              <p><strong>Template messages</strong> (outbound notifications) need Meta approval (24-48h). But replies within the 24h conversation window work immediately.</p>
              <p><strong>Free tier:</strong> First 1,000 conversations/month are free. After that, pricing varies by country (approx $0.01-0.08 per conversation).</p>
            </div>
          </div>
        </div>

        {!configExists && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setActiveTab('setup')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              <FaRocket /> Start Setup
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>

      {/* Setup Guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Step-by-Step Setup Guide</h2>

        <div className="space-y-6">
          {[
            {
              step: 1,
              title: 'Create a Meta Business Account',
              content: 'Go to business.facebook.com and create a free Meta Business Account if you don\'t already have one. Verify your business details.'
            },
            {
              step: 2,
              title: 'Create a Meta App',
              content: 'Go to developers.facebook.com/apps, click "Create App", choose "Business" type, and give it a name (e.g., "My Restaurant WhatsApp"). Then add the "WhatsApp" product to your app.'
            },
            {
              step: 3,
              title: 'Add Your Phone Number',
              content: 'In the WhatsApp section of your Meta App, go to "API Setup". Add a phone number for your restaurant. You\'ll receive an OTP to verify it. This number will be your WhatsApp ordering number.'
            },
            {
              step: 4,
              title: 'Get Your Credentials',
              content: 'From the API Setup page, copy your Phone Number ID and WhatsApp Business Account ID. For a permanent access token, go to Business Settings > System Users > create a system user with WhatsApp permissions and generate a token.'
            },
            {
              step: 5,
              title: 'Configure Webhook',
              content: 'In your Meta App\'s WhatsApp Configuration, set the Webhook URL and Verify Token. We provide these in the Setup tab. Subscribe to the "messages" webhook field.'
            },
            {
              step: 6,
              title: 'Enter Credentials in DineOpen',
              content: 'Go to the Setup tab here, enter your Access Token, Phone Number ID, and Business Account ID. Save and enable WhatsApp Ordering.'
            },
            {
              step: 7,
              title: 'Test It!',
              content: 'Send a "Hi" message to your WhatsApp number from any phone. You should see the welcome message and interactive menu appear!'
            }
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== Setup Tab ====================

function SetupTab({ form, setForm, config, configExists, saving, handleSaveConfig, webhookUrl, copyToClipboard, testPhone, setTestPhone, testing, handleTestMessage }) {
  const verifyToken = 'dineopen_whatsapp_verify';

  return (
    <div className="space-y-6">
      {/* Webhook Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaLink className="text-green-600" /> Webhook Configuration
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Copy these values into your Meta App&apos;s WhatsApp webhook settings.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaCopy className="text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={verifyToken}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(verifyToken)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaCopy className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <FaExclamationTriangle className="inline mr-2" />
            Make sure to subscribe to the <strong>messages</strong> webhook field in your Meta App configuration.
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaCog className="text-green-600" /> WhatsApp API Credentials
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the credentials from your Meta App&apos;s WhatsApp API Setup page.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.accessToken}
              onChange={(e) => setForm(prev => ({ ...prev, accessToken: e.target.value }))}
              placeholder={config?.accessTokenMasked || 'Paste your permanent access token here'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Generate a permanent token from Business Settings &gt; System Users
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.phoneNumberId}
                onChange={(e) => setForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="e.g., 123456789012345"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Account ID
              </label>
              <input
                type="text"
                value={form.businessAccountId}
                onChange={(e) => setForm(prev => ({ ...prev, businessAccountId: e.target.value }))}
                placeholder="e.g., 123456789012345"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Secret (optional, for webhook signature verification)
            </label>
            <input
              type="password"
              value={form.appSecret}
              onChange={(e) => setForm(prev => ({ ...prev, appSecret: e.target.value }))}
              placeholder="Your Meta App Secret"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Connection */}
      {configExists && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaPaperPlane className="text-green-600" /> Test Connection
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Send a test message to verify your WhatsApp setup is working.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Phone number with country code (e.g., 919876543210)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleTestMessage}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {testing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              {testing ? 'Sending...' : 'Send Test'}
            </button>
          </div>

          {form.enabled && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
              <FaCheckCircle />
              WhatsApp Ordering is active. Customers can message your number to place orders.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Settings Tab ====================

function SettingsTab({ form, setForm, saving, handleSaveConfig }) {
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Welcome Message</h3>
        <p className="text-sm text-gray-500 mb-4">
          This message is sent when a customer first messages your WhatsApp number.
        </p>
        <textarea
          value={form.welcomeMessage}
          onChange={(e) => setForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
          rows={5}
          placeholder="Welcome to *Your Restaurant*! I can help you place an order..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Supports WhatsApp formatting: *bold*, _italic_, ~strikethrough~</p>
      </div>

      {/* Order Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Require Table Number</p>
              <p className="text-sm text-gray-500">Ask customers for their table number during checkout</p>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, requireTableNumber: !prev.requireTableNumber }))}
              className={`w-12 h-7 rounded-full transition-colors ${form.requireTableNumber ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${form.requireTableNumber ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Auto-Accept Orders</p>
              <p className="text-sm text-gray-500">Automatically accept WhatsApp orders (skip manual confirmation)</p>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, autoAcceptOrders: !prev.autoAcceptOrders }))}
              className={`w-12 h-7 rounded-full transition-colors ${form.autoAcceptOrders ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${form.autoAcceptOrders ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="py-3">
            <p className="font-medium text-gray-900 mb-2">Payment Mode</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'pay_at_counter', label: 'Pay at Counter', desc: 'Customer pays when collecting order' },
                { value: 'upi_link', label: 'UPI / Payment Link', desc: 'Send a payment link via WhatsApp' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'For delivery orders' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setForm(prev => ({ ...prev, paymentMode: option.value }))}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    form.paymentMode === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.paymentMode === 'upi_link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Link / UPI ID</label>
              <input
                type="text"
                value={form.paymentLink}
                onChange={(e) => setForm(prev => ({ ...prev, paymentLink: e.target.value }))}
                placeholder="e.g., upi://pay?pa=restaurant@upi or https://razorpay.me/restaurant"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg shadow-green-200"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ==================== Orders Tab ====================

function OrdersTab({ orders, ordersLoading, loadOrders, currencySymbol }) {
  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-3xl text-green-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">WhatsApp Orders</h3>
          <p className="text-sm text-gray-500">{orders.length} orders</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
        >
          <FaHistory /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FaWhatsapp className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No WhatsApp orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers order via WhatsApp</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaWhatsapp className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.customerName || 'Guest'} {order.tableNumber ? `- Table ${order.tableNumber}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{currencySymbol}{order.totalAmount}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              {order.items && (
                <div className="mt-2 ml-14 text-sm text-gray-500">
                  {order.items.map((item, i) => (
                    <span key={i}>
                      {item.quantity}x {item.name}
                      {i < order.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({ stats, currencySymbol }) {
  if (!stats) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
        <FaChartBar className="text-5xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No analytics data yet</p>
        <p className="text-sm text-gray-400 mt-1">Analytics will appear once you start receiving WhatsApp orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: FaShoppingCart, color: 'green' },
          { label: 'Total Revenue', value: `${currencySymbol}${stats.totalRevenue}`, icon: FaChartBar, color: 'blue' },
          { label: 'Avg Order Value', value: `${currencySymbol}${stats.avgOrderValue}`, icon: FaStore, color: 'purple' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: FaRocket, color: 'amber' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center`}>
                <item.icon className={`text-${item.color}-600`} />
              </div>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Conversations</h3>
        <p className="text-sm text-gray-500">{stats.totalConversations} total conversations in the last 30 days</p>
        <div className="mt-4 h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Conversations: {stats.totalConversations}</span>
          <span>Converted to orders: {stats.totalOrders}</span>
        </div>
      </div>
    </div>
  );
}
