'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../../../lib/api';
import {
  FaPhone,
  FaPhoneAlt,
  FaPhoneSlash,
  FaRobot,
  FaCog,
  FaHistory,
  FaSync,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPlay,
  FaBook,
  FaUtensils,
  FaCalendarAlt,
  FaShoppingCart,
  FaChartBar,
  FaClock,
  FaGlobe,
  FaVolumeUp,
  FaInfoCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaCopy,
  FaDownload,
  FaPlug,
  FaTrash,
  FaLink,
  FaUnlink
} from 'react-icons/fa';

const LANGUAGES = [
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi-en', label: 'Hinglish (Hindi + English)', flag: '🇮🇳' },
  { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { value: 'te', label: 'Telugu', flag: '🇮🇳' },
  { value: 'kn', label: 'Kannada', flag: '🇮🇳' },
  { value: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { value: 'bn', label: 'Bengali', flag: '🇮🇳' },
  { value: 'mr', label: 'Marathi', flag: '🇮🇳' },
  { value: 'gu', label: 'Gujarati', flag: '🇮🇳' },
];

const VOICES = [
  { value: 'rachel', label: 'Rachel (Female, Professional)' },
  { value: 'josh', label: 'Josh (Male, Friendly)' },
  { value: 'emily', label: 'Emily (Female, Warm)' },
  { value: 'adam', label: 'Adam (Male, Professional)' },
  { value: 'alloy', label: 'Alloy (Neutral)' },
];

export default function PhoneAgentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  // Agent state
  const [agent, setAgent] = useState(null);
  const [agentExists, setAgentExists] = useState(false);

  // Setup state
  const [enabling, setEnabling] = useState(false);
  const [settingUpPhone, setSettingUpPhone] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    language: 'hi',
    voice: 'rachel',
    greeting: '',
    capabilities: {
      menuQueries: true,
      reservations: true,
      phoneOrders: true,
      transferToOwner: true
    }
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Call logs state
  const [callLogs, setCallLogs] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);

  // Telephony provider state
  const [providers, setProviders] = useState({ vobiz: false, plivo: false, twilio: false });
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [preferredProvider, setPreferredProvider] = useState(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState(false);
  const [disconnectingProvider, setDisconnectingProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('vobiz');
  const [providerCredentials, setProviderCredentials] = useState({ authId: '', authToken: '' });

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

  const loadAgentStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/bolna/status/${restaurantId}`);
      if (response.success && response.exists) {
        setAgent(response.agent);
        setAgentExists(true);
        setSettings(prev => ({
          ...prev,
          language: response.agent.language || 'hi',
          voice: response.agent.voice || 'rachel',
          greeting: response.agent.greeting || '',
          capabilities: response.agent.capabilities || prev.capabilities
        }));
      } else {
        setAgentExists(false);
        setAgent(null);
      }
    } catch (error) {
      console.error('Error loading agent status:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Load agent data
  useEffect(() => {
    if (restaurantId) {
      loadAgentStatus();
    }
  }, [restaurantId, loadAgentStatus]);

  // Enable phone agent
  const handleEnable = async () => {
    setEnabling(true);
    try {
      const response = await apiClient.post('/api/bolna/setup', {
        restaurantId,
        language: settings.language,
        voice: settings.voice
      });

      if (response.success) {
        showNotification('AI Phone Agent created successfully!');
        await loadAgentStatus();
      } else {
        showNotification(response.error || 'Failed to create agent', 'error');
      }
    } catch (error) {
      console.error('Error enabling agent:', error);
      showNotification('Failed to enable phone agent', 'error');
    } finally {
      setEnabling(false);
    }
  };

  // Setup phone number
  const handleSetupPhone = async () => {
    setSettingUpPhone(true);
    try {
      const response = await apiClient.post('/api/bolna/phone-number', {
        restaurantId,
        country: 'IN',
        provider: preferredProvider || undefined
      });

      if (response.success) {
        showNotification(`Phone number assigned: ${response.phoneNumber}`);
        await loadAgentStatus();
      } else {
        showNotification(response.error || 'Failed to setup phone number', 'error');
      }
    } catch (error) {
      console.error('Error setting up phone:', error);
      showNotification('Failed to setup phone number', 'error');
    } finally {
      setSettingUpPhone(false);
    }
  };

  // Sync menu
  const handleSyncMenu = async () => {
    setSyncing(true);
    try {
      const response = await apiClient.post(`/api/bolna/sync-menu/${restaurantId}`);
      if (response.success) {
        showNotification(`Menu synced! ${response.itemCount} items updated.`);
        await loadAgentStatus();
      } else {
        showNotification(response.error || 'Failed to sync menu', 'error');
      }
    } catch (error) {
      console.error('Error syncing menu:', error);
      showNotification('Failed to sync menu', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await apiClient.put(`/api/bolna/agent/${restaurantId}`, settings);
      if (response.success) {
        showNotification('Settings saved successfully');
        await loadAgentStatus();
      } else {
        showNotification(response.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Load call logs
  const loadCallLogs = useCallback(async () => {
    setCallsLoading(true);
    try {
      const response = await apiClient.get(`/api/bolna/calls/${restaurantId}?limit=50`);
      if (response.success) {
        setCallLogs(response.calls || []);
      }
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setCallsLoading(false);
    }
  }, [restaurantId]);

  // Load call logs when switching to that tab
  useEffect(() => {
    if (activeTab === 'calls' && restaurantId && agentExists) {
      loadCallLogs();
    }
  }, [activeTab, restaurantId, agentExists, loadCallLogs]);

  // Load telephony providers
  const loadProviders = useCallback(async () => {
    setProvidersLoading(true);
    try {
      const response = await apiClient.get(`/api/bolna/providers?restaurantId=${restaurantId}`);
      if (response.success) {
        setProviders(response.providers || { vobiz: false, plivo: false, twilio: false });
        setConnectedProviders(response.connectedProviders || []);
        setPreferredProvider(response.preferredProvider || null);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setProvidersLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (activeTab === 'telephony' && restaurantId) {
      loadProviders();
    }
  }, [activeTab, restaurantId, loadProviders]);

  // Connect telephony provider
  const handleConnectProvider = async () => {
    if (!providerCredentials.authId || !providerCredentials.authToken) {
      showNotification('Please enter both credentials', 'error');
      return;
    }
    setConnectingProvider(true);
    try {
      const response = await apiClient.post('/api/bolna/connect-provider', {
        provider: selectedProvider,
        credentials: providerCredentials,
        restaurantId
      });
      if (response.success) {
        showNotification(`${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} connected successfully!`);
        setProviderCredentials({ authId: '', authToken: '' });
        await loadProviders();
      } else {
        showNotification(response.error || 'Failed to connect provider', 'error');
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      showNotification('Failed to connect provider', 'error');
    } finally {
      setConnectingProvider(false);
    }
  };

  // Disconnect telephony provider
  const handleDisconnectProvider = async (providerName) => {
    if (!confirm(`Are you sure you want to disconnect ${providerName}?`)) return;
    setDisconnectingProvider(providerName);
    try {
      const response = await apiClient.delete(`/api/bolna/provider/${providerName}?restaurantId=${restaurantId}`);
      if (response.success) {
        showNotification(`${providerName} disconnected`);
        await loadProviders();
      } else {
        showNotification(response.error || 'Failed to disconnect', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      showNotification('Failed to disconnect provider', 'error');
    } finally {
      setDisconnectingProvider(null);
    }
  };

  // Disable agent
  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable the AI phone agent? This will deactivate the phone number and stop answering calls.')) return;

    try {
      const response = await apiClient.delete(`/api/bolna/agent/${restaurantId}`);
      if (response.success) {
        showNotification('Phone agent disabled');
        setAgentExists(false);
        setAgent(null);
      } else {
        showNotification(response.error || 'Failed to disable', 'error');
      }
    } catch (error) {
      console.error('Error disabling agent:', error);
      showNotification('Failed to disable agent', 'error');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'setup', label: 'Setup & Status', icon: FaPhone },
    { id: 'telephony', label: 'Telephony', icon: FaPlug },
    { id: 'menu', label: 'Menu & Knowledge', icon: FaUtensils },
    { id: 'settings', label: 'Agent Settings', icon: FaCog },
    { id: 'calls', label: 'Call History', icon: FaHistory },
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <FaPhoneAlt className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Phone Agent</h1>
                <p className="text-emerald-100">AI receptionist that answers calls, takes orders & bookings</p>
              </div>
            </div>
            {agentExists && agent?.status === 'active' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                <span className="font-medium">Active</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {agentExists && agent && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-2xl text-emerald-100" />
                  <div>
                    <p className="text-2xl font-bold">{agent.callStats?.totalCalls || 0}</p>
                    <p className="text-emerald-100 text-sm">Total Calls</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaClock className="text-2xl text-emerald-100" />
                  <div>
                    <p className="text-2xl font-bold">{agent.callStats?.totalMinutes || 0}</p>
                    <p className="text-emerald-100 text-sm">Minutes Used</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-2xl text-emerald-100" />
                  <div>
                    <p className="text-2xl font-bold">{LANGUAGES.find(l => l.value === agent.language)?.label || agent.language}</p>
                    <p className="text-emerald-100 text-sm">Language</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-2xl text-emerald-100" />
                  <div>
                    <p className="text-lg font-bold">{agent.phoneNumber || 'Not assigned'}</p>
                    <p className="text-emerald-100 text-sm">Phone Number</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 mt-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
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
          {activeTab === 'setup' && (
            <SetupTab
              agentExists={agentExists}
              agent={agent}
              settings={settings}
              setSettings={setSettings}
              enabling={enabling}
              settingUpPhone={settingUpPhone}
              handleEnable={handleEnable}
              handleSetupPhone={handleSetupPhone}
              handleDisable={handleDisable}
              copyToClipboard={copyToClipboard}
              preferredProvider={preferredProvider}
            />
          )}

          {activeTab === 'telephony' && (
            <TelephonyTab
              providers={providers}
              connectedProviders={connectedProviders}
              preferredProvider={preferredProvider}
              providersLoading={providersLoading}
              connectingProvider={connectingProvider}
              disconnectingProvider={disconnectingProvider}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              providerCredentials={providerCredentials}
              setProviderCredentials={setProviderCredentials}
              handleConnectProvider={handleConnectProvider}
              handleDisconnectProvider={handleDisconnectProvider}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab
              agentExists={agentExists}
              agent={agent}
              syncing={syncing}
              handleSyncMenu={handleSyncMenu}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              agentExists={agentExists}
              settings={settings}
              setSettings={setSettings}
              savingSettings={savingSettings}
              handleSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'calls' && (
            <CallsTab
              agentExists={agentExists}
              callLogs={callLogs}
              callsLoading={callsLoading}
              loadCallLogs={loadCallLogs}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Setup Tab ====================

function SetupTab({ agentExists, agent, settings, setSettings, enabling, settingUpPhone, handleEnable, handleSetupPhone, handleDisable, copyToClipboard, preferredProvider }) {
  if (!agentExists) {
    return (
      <div className="space-y-6">
        {/* Getting Started */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaRobot className="text-4xl text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Set Up Your AI Phone Agent</h2>
            <p className="text-gray-500 mb-8">
              Your AI receptionist will answer phone calls, help customers with the menu, take reservations, and place orders — in Hindi, English, or both.
            </p>

            {/* Language Selection */}
            <div className="text-left mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Language</label>
              <select
                value={settings.language}
                onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>

            {/* Voice Selection */}
            <div className="text-left mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Agent Voice</label>
              <select
                value={settings.voice}
                onChange={e => setSettings(prev => ({ ...prev, voice: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {VOICES.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEnable}
              disabled={enabling}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {enabling ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <FaRobot />
                  Enable AI Phone Agent
                </>
              )}
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Enable Agent</h4>
              <p className="text-sm text-gray-500">Click the button above to create your AI phone receptionist with your menu and restaurant info.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Get Phone Number</h4>
              <p className="text-sm text-gray-500">A phone number is assigned to your agent. Set up call forwarding from your restaurant number.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">AI Answers Calls</h4>
              <p className="text-sm text-gray-500">When customers call and you don&apos;t pick up, AI answers — handles menu queries, bookings, and orders.</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Agent exists — show status
  return (
    <div className="space-y-6">
      {/* Agent Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Agent Status</h3>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            agent?.status === 'active'
              ? 'bg-green-100 text-green-700'
              : agent?.status === 'created'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              agent?.status === 'active' ? 'bg-green-500' : agent?.status === 'created' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
            {agent?.status === 'active' ? 'Active & Receiving Calls' : agent?.status === 'created' ? 'Created - Needs Phone Number' : agent?.status || 'Unknown'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Agent Name</p>
            <p className="font-semibold text-gray-900">{agent?.agentName || 'DineOpen Agent'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Language</p>
            <p className="font-semibold text-gray-900">{LANGUAGES.find(l => l.value === agent?.language)?.label || agent?.language}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Voice</p>
            <p className="font-semibold text-gray-900">{VOICES.find(v => v.value === agent?.voice)?.label || agent?.voice}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Telephony Provider</p>
            <p className="font-semibold text-gray-900">{agent?.telephonyProvider ? agent.telephonyProvider.charAt(0).toUpperCase() + agent.telephonyProvider.slice(1) : 'Bolna Default'}</p>
          </div>
        </div>
      </div>

      {/* Phone Number Section */}
      {!agent?.phoneNumber ? (
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <FaExclamationTriangle className="text-yellow-500 text-xl mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Phone Number Required</h4>
              <p className="text-sm text-gray-600">
                Your agent needs a phone number to receive calls.
                {preferredProvider ? ` Using ${preferredProvider.charAt(0).toUpperCase() + preferredProvider.slice(1)} as telephony provider.` : ' Go to the Telephony tab to connect a provider first, or use the default.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSetupPhone}
            disabled={settingUpPhone}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {settingUpPhone ? (
              <><FaSpinner className="animate-spin" /> Setting Up...</>
            ) : (
              <><FaPhoneAlt /> Get Phone Number</>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Phone Number & Call Forwarding</h3>

          {/* Phone Number Display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium mb-1">Your AI Phone Number</p>
                <p className="text-2xl font-bold text-emerald-700">{agent.phoneNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(agent.phoneNumber)}
                className="p-3 bg-emerald-100 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                <FaCopy className="text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Call Forwarding Instructions */}
          <h4 className="font-semibold text-gray-900 mb-3">Set Up Call Forwarding</h4>
          <p className="text-sm text-gray-500 mb-4">
            Forward your restaurant&apos;s existing phone number to this AI number. Takes 30 seconds — just dial from your phone:
          </p>

          <div className="space-y-3">
            <ForwardingOption
              label="Forward if no answer (Recommended)"
              code={`**61*${agent.phoneNumber}#`}
              description="Owner gets 15-20 sec to pick up. If not, AI answers."
              recommended
              copyToClipboard={copyToClipboard}
            />
            <ForwardingOption
              label="Forward if busy"
              code={`**67*${agent.phoneNumber}#`}
              description="AI answers only when owner&apos;s line is busy."
              copyToClipboard={copyToClipboard}
            />
            <ForwardingOption
              label="Forward all calls"
              code={`**21*${agent.phoneNumber}#`}
              description="Every call goes directly to AI."
              copyToClipboard={copyToClipboard}
            />
            <ForwardingOption
              label="Forward if unreachable"
              code={`**62*${agent.phoneNumber}#`}
              description="AI answers when phone is off or no network."
              copyToClipboard={copyToClipboard}
            />
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">
              <strong>To cancel forwarding:</strong> Dial <code className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">##21#</code> from your phone.
              Works on Jio (free), Airtel, Vi, BSNL.
            </p>
          </div>
        </div>
      )}

      {/* Capabilities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">What Your Agent Can Do</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCard
            icon={FaUtensils}
            title="Answer Menu Questions"
            description="Reads out menu items, prices, ingredients, and specials"
            enabled={agent?.capabilities?.menuQueries}
          />
          <CapabilityCard
            icon={FaCalendarAlt}
            title="Take Reservations"
            description="Books tables with name, date, time, and party size"
            enabled={agent?.capabilities?.reservations}
          />
          <CapabilityCard
            icon={FaShoppingCart}
            title="Take Phone Orders"
            description="Places delivery/pickup orders with items and address"
            enabled={agent?.capabilities?.phoneOrders}
          />
          <CapabilityCard
            icon={FaPhoneAlt}
            title="Transfer to Owner"
            description="Transfers call to restaurant owner when needed"
            enabled={agent?.capabilities?.transferToOwner}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Disabling the agent will stop all AI call answering and release the phone number.</p>
        <button
          onClick={handleDisable}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <FaPhoneSlash />
          Disable Phone Agent
        </button>
      </div>
    </div>
  );
}

// ==================== Menu Tab ====================

function MenuTab({ agentExists, agent, syncing, handleSyncMenu }) {
  if (!agentExists) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <FaUtensils className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Enable the phone agent first to manage menu sync.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Menu Sync */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Menu Sync</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your DineOpen menu is automatically used by the AI agent. Sync to update after making changes.
            </p>
          </div>
          <button
            onClick={handleSyncMenu}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <><FaSpinner className="animate-spin" /> Syncing...</>
            ) : (
              <><FaSync /> Sync Menu Now</>
            )}
          </button>
        </div>

        {agent?.lastMenuSync && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">
              <FaCheck className="inline mr-2" />
              Last synced: {new Date(agent.lastMenuSync?._seconds * 1000 || agent.lastMenuSync).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Knowledge Base Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">What the Agent Knows</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FaUtensils className="text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Menu Items & Prices</p>
              <p className="text-sm text-gray-500">Auto-synced from your DineOpen menu</p>
            </div>
            <FaCheck className="text-green-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FaClock className="text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Operating Hours</p>
              <p className="text-sm text-gray-500">From your restaurant settings</p>
            </div>
            <FaCheck className="text-green-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FaInfoCircle className="text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Restaurant Info</p>
              <p className="text-sm text-gray-500">Name, address, cuisine type</p>
            </div>
            <FaCheck className="text-green-500 ml-auto" />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700">
            <FaInfoCircle className="inline mr-2" />
            <strong>Tip:</strong> Want the agent to know more? Go to{' '}
            <Link href="/dineai" className="underline font-medium">DineAI Studio</Link>{' '}
            to upload documents, add FAQs, and train the knowledge base. The phone agent uses the same knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== Settings Tab ====================

function SettingsTab({ agentExists, settings, setSettings, savingSettings, handleSaveSettings }) {
  if (!agentExists) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <FaCog className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Enable the phone agent first to configure settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Language & Voice */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Voice</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Voice</label>
            <select
              value={settings.voice}
              onChange={e => setSettings(prev => ({ ...prev, voice: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {VOICES.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Greeting Message */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Greeting Message</h3>
        <p className="text-sm text-gray-500 mb-4">What the AI says when it picks up a call.</p>
        <textarea
          value={settings.greeting}
          onChange={e => setSettings(prev => ({ ...prev, greeting: e.target.value }))}
          placeholder="Leave empty for default greeting based on your restaurant name and language"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Capabilities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Capabilities</h3>
        <p className="text-sm text-gray-500 mb-4">Choose what the AI agent can do during calls.</p>
        <div className="space-y-3">
          <ToggleCapability
            label="Answer Menu Questions"
            description="Agent reads out menu items, prices, and descriptions"
            checked={settings.capabilities.menuQueries}
            onChange={() => setSettings(prev => ({
              ...prev,
              capabilities: { ...prev.capabilities, menuQueries: !prev.capabilities.menuQueries }
            }))}
          />
          <ToggleCapability
            label="Take Reservations"
            description="Agent books tables and creates reservations in DineOpen"
            checked={settings.capabilities.reservations}
            onChange={() => setSettings(prev => ({
              ...prev,
              capabilities: { ...prev.capabilities, reservations: !prev.capabilities.reservations }
            }))}
          />
          <ToggleCapability
            label="Take Phone Orders"
            description="Agent takes food orders for delivery or pickup"
            checked={settings.capabilities.phoneOrders}
            onChange={() => setSettings(prev => ({
              ...prev,
              capabilities: { ...prev.capabilities, phoneOrders: !prev.capabilities.phoneOrders }
            }))}
          />
          <ToggleCapability
            label="Transfer to Owner"
            description="Agent can transfer the call to you when needed"
            checked={settings.capabilities.transferToOwner}
            onChange={() => setSettings(prev => ({
              ...prev,
              capabilities: { ...prev.capabilities, transferToOwner: !prev.capabilities.transferToOwner }
            }))}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {savingSettings ? (
            <><FaSpinner className="animate-spin" /> Saving...</>
          ) : (
            <><FaCheck /> Save Settings</>
          )}
        </button>
      </div>
    </div>
  );
}

// ==================== Calls Tab ====================

function CallsTab({ agentExists, callLogs, callsLoading, loadCallLogs }) {
  if (!agentExists) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Enable the phone agent first to view call history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Call History</h3>
        <button
          onClick={loadCallLogs}
          disabled={callsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <FaSync className={callsLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {callsLoading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
        </div>
      ) : callLogs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <FaPhone className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No calls yet</p>
          <p className="text-sm text-gray-400">Calls will appear here once customers start calling your AI number.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date & Time</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Caller</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Summary</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map((call, i) => (
                  <tr key={call.id || call.execution_id || i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {call.createdAt?._seconds
                        ? new Date(call.createdAt._seconds * 1000).toLocaleString()
                        : call.created_at
                        ? new Date(call.created_at).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {call.callerNumber || call.from_number || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {call.duration ? `${Math.ceil(call.duration / 60)} min` : call.call_duration ? `${Math.ceil(call.call_duration / 60)} min` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        call.status === 'completed' ? 'bg-green-100 text-green-700' :
                        call.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        call.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {call.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {call.summary || call.transcript?.substring(0, 80) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Telephony Tab ====================

const TELEPHONY_PROVIDERS = [
  {
    id: 'vobiz',
    name: 'Vobiz',
    badge: 'Recommended for India',
    pricing: '₹0.65/min',
    features: ['Indian DID numbers', 'TRAI compliant', 'INR billing', 'Low latency India'],
    fields: { authId: 'Auth ID', authToken: 'Auth Token' }
  },
  {
    id: 'plivo',
    name: 'Plivo',
    badge: null,
    pricing: '~₹1.50/min',
    features: ['Global coverage', 'Indian numbers', 'USD billing'],
    fields: { authId: 'Auth ID', authToken: 'Auth Token' }
  },
  {
    id: 'twilio',
    name: 'Twilio',
    badge: null,
    pricing: '~₹2.50/min',
    features: ['Most popular globally', 'Best documentation', 'USD billing'],
    fields: { authId: 'Account SID', authToken: 'Auth Token' }
  }
];

function TelephonyTab({
  providers, connectedProviders, preferredProvider, providersLoading,
  connectingProvider, disconnectingProvider, selectedProvider, setSelectedProvider,
  providerCredentials, setProviderCredentials, handleConnectProvider, handleDisconnectProvider
}) {
  const selectedProviderInfo = TELEPHONY_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Why connect a telephony provider?</h4>
            <p className="text-sm text-gray-600">
              Connect your own telephony provider (Vobiz, Plivo, or Twilio) to get an Indian phone number for your AI agent.
              Vobiz is recommended for India — cheapest rates, TRAI compliant, and INR billing.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Provider</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {TELEPHONY_PROVIDERS.map(provider => {
            const isConnected = connectedProviders.includes(provider.id) || providers[provider.id];
            const isSelected = selectedProvider === provider.id;
            const isPreferred = preferredProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => !isConnected && setSelectedProvider(provider.id)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                  isConnected
                    ? 'border-green-300 bg-green-50'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Badge */}
                {provider.badge && !isConnected && (
                  <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-medium">
                    {provider.badge}
                  </span>
                )}
                {isConnected && (
                  <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                    <FaCheck className="text-[10px]" /> Connected
                  </span>
                )}
                {isPreferred && isConnected && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                    Active
                  </span>
                )}

                <h4 className="font-bold text-gray-900 text-lg mt-1">{provider.name}</h4>
                <p className="text-emerald-600 font-semibold text-sm mb-3">{provider.pricing}</p>

                <ul className="space-y-1.5">
                  {provider.features.map((f, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <FaCheck className="text-emerald-400 text-[9px] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Disconnect button for connected providers */}
                {isConnected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDisconnectProvider(provider.id); }}
                    disabled={disconnectingProvider === provider.id}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {disconnectingProvider === provider.id ? (
                      <><FaSpinner className="animate-spin" /> Disconnecting...</>
                    ) : (
                      <><FaUnlink /> Disconnect</>
                    )}
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Credentials Input — only show if selected provider is not already connected */}
      {!connectedProviders.includes(selectedProvider) && !providers[selectedProvider] && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Connect {selectedProviderInfo?.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedProvider === 'vobiz' && 'Get your credentials from Vobiz Console → Dashboard → Settings → API Keys'}
            {selectedProvider === 'plivo' && 'Get your credentials from Plivo Console → Account → API Credentials'}
            {selectedProvider === 'twilio' && 'Get your credentials from Twilio Console → Account → API Keys'}
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {selectedProviderInfo?.fields.authId || 'Auth ID'}
              </label>
              <input
                type="text"
                value={providerCredentials.authId}
                onChange={e => setProviderCredentials(prev => ({ ...prev, authId: e.target.value }))}
                placeholder={`Enter ${selectedProviderInfo?.fields.authId || 'Auth ID'}`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {selectedProviderInfo?.fields.authToken || 'Auth Token'}
              </label>
              <input
                type="password"
                value={providerCredentials.authToken}
                onChange={e => setProviderCredentials(prev => ({ ...prev, authToken: e.target.value }))}
                placeholder={`Enter ${selectedProviderInfo?.fields.authToken || 'Auth Token'}`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleConnectProvider}
            disabled={connectingProvider || !providerCredentials.authId || !providerCredentials.authToken}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {connectingProvider ? (
              <><FaSpinner className="animate-spin" /> Connecting...</>
            ) : (
              <><FaLink /> Connect {selectedProviderInfo?.name}</>
            )}
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Connect your provider</p>
              <p className="text-sm text-gray-500">Enter your Vobiz/Plivo/Twilio credentials above. This links your telephony account to the AI agent.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Get a phone number</p>
              <p className="text-sm text-gray-500">Go to Setup tab and click &quot;Get Phone Number&quot;. It will use your connected provider to buy an Indian DID number.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Set up call forwarding</p>
              <p className="text-sm text-gray-500">Forward your restaurant phone to the AI number. When you don&apos;t pick up, AI answers automatically.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">AI handles calls</p>
              <p className="text-sm text-gray-500">Calls are routed through your provider (e.g., Vobiz at ₹0.65/min) to the AI agent. All call costs go through your provider account.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Provider</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Telephony Cost</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Indian Numbers</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Billing</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-emerald-50">
                <td className="py-2.5 px-3 font-semibold text-gray-900">Vobiz</td>
                <td className="py-2.5 px-3 text-emerald-600 font-semibold">₹0.65/min</td>
                <td className="py-2.5 px-3"><FaCheck className="text-green-500" /></td>
                <td className="py-2.5 px-3">INR</td>
                <td className="py-2.5 px-3 text-gray-500">India restaurants</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 px-3 font-semibold text-gray-900">Plivo</td>
                <td className="py-2.5 px-3">~₹1.50/min</td>
                <td className="py-2.5 px-3"><FaCheck className="text-green-500" /></td>
                <td className="py-2.5 px-3">USD</td>
                <td className="py-2.5 px-3 text-gray-500">India + Global</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-gray-900">Twilio</td>
                <td className="py-2.5 px-3">~₹2.50/min</td>
                <td className="py-2.5 px-3 text-gray-400">Limited</td>
                <td className="py-2.5 px-3">USD</td>
                <td className="py-2.5 px-3 text-gray-500">Global / USA</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Telephony cost is in addition to Bolna AI processing (~₹4/min). Total cost ≈ ₹4.65/min with Vobiz.
        </p>
      </div>
    </div>
  );
}

// ==================== Helper Components ====================

function ForwardingOption({ label, code, description, recommended, copyToClipboard }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${
      recommended ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{label}</p>
          {recommended && (
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-medium">Recommended</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        <code className="text-sm bg-white px-3 py-1 rounded-lg border border-gray-200 mt-2 inline-block font-mono text-gray-800">{code}</code>
      </div>
      <button
        onClick={() => copyToClipboard(code)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors flex-shrink-0"
      >
        <FaCopy />
      </button>
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, description, enabled }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
      enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-50'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        enabled ? 'bg-emerald-100' : 'bg-gray-200'
      }`}>
        <Icon className={enabled ? 'text-emerald-600' : 'text-gray-400'} />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {enabled && <FaCheck className="text-emerald-500 mt-1 ml-auto flex-shrink-0" />}
    </div>
  );
}

function ToggleCapability({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
        </div>
      </div>
    </label>
  );
}
