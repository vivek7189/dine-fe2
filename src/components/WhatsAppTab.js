'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../lib/api';
import { FaPhone, FaCheckCircle, FaTimesCircle, FaSpinner, FaPaperPlane, FaWhatsapp, FaArrowLeft, FaSearch, FaPlug, FaToggleOn, FaToggleOff, FaCopy, FaCheck, FaFacebook, FaImage, FaFileAlt, FaMapMarkerAlt, FaVolumeUp, FaVideo, FaChevronDown } from 'react-icons/fa';

export default function WhatsAppTab({ selectedRestaurant }) {
  const [subTab, setSubTab] = useState('settings'); // 'settings' | 'messages'
  const [waSettings, setWaSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [convoMessages, setConvoMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('hello_world');
  const [testAsTemplate, setTestAsTemplate] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [connectMode, setConnectMode] = useState('dineopen');
  const [statusMsg, setStatusMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [embeddedSignupLoading, setEmbeddedSignupLoading] = useState(false);
  const [fbSdkReady, setFbSdkReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const wabaDataRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const FACEBOOK_APP_ID = '1591044548986175';
  // Config ID from Meta App → Facebook Login for Business → Configurations
  // Created using "WhatsApp Embedded Signup" template
  const EMBEDDED_SIGNUP_CONFIG_ID = process.env.NEXT_PUBLIC_WA_EMBEDDED_SIGNUP_CONFIG_ID || '1503970314508774';

  const restaurantId = selectedRestaurant?.id;

  // Load Facebook SDK for Embedded Signup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) { setFbSdkReady(true); return; }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v22.0',
      });
      setFbSdkReady(true);
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.defer = true;
      document.head.appendChild(js);
    }

    // Listen for Embedded Signup session info messages
    const handleMessage = (event) => {
      if (!event.origin?.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            wabaDataRef.current = {
              phone_number_id: data.data.phone_number_id,
              waba_id: data.data.waba_id,
            };
          } else if (data.event === 'CANCEL') {
            console.log('Embedded Signup cancelled at step:', data.data?.current_step);
          } else if (data.event === 'ERROR') {
            console.error('Embedded Signup error:', data.data?.error_message);
          }
        }
      } catch {
        // Non-JSON messages from Facebook — ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load WhatsApp settings
  useEffect(() => {
    if (!restaurantId) return;
    loadSettings();
  }, [restaurantId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getWhatsAppSettings(restaurantId);
      setWaSettings(res);
      // Pre-fill mode from saved settings
      if (res?.settings?.mode) {
        setConnectMode(res.settings.mode === 'restaurant' ? 'restaurant' : 'dineopen');
      }
    } catch (err) {
      console.error('Load WA settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!restaurantId) return;
    setMessagesLoading(true);
    try {
      const res = await apiClient.getWhatsAppMessages(restaurantId, { limit: 200 });
      if (res?.conversations) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (subTab === 'messages' && restaurantId) {
      loadMessages();
    }
  }, [subTab, restaurantId, loadMessages]);

  // Load single conversation messages
  const openConversation = async (convo) => {
    setSelectedConvo(convo);
    try {
      const res = await apiClient.getWhatsAppMessages(restaurantId, { phone: convo.phone, limit: 100 });
      if (res?.messages) {
        setConvoMessages(res.messages.reverse()); // oldest first
      }
      // Mark as read
      await apiClient.markWhatsAppRead(restaurantId, convo.phone).catch(() => {});
    } catch (err) {
      console.error('Load conversation error:', err);
    }
  };

  // Send reply
  const handleReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    setSendingReply(true);
    try {
      await apiClient.replyWhatsApp(restaurantId, { phone: selectedConvo.phone, message: replyText });
      setReplyText('');
      // Reload conversation
      await openConversation(selectedConvo);
    } catch (err) {
      alert('Failed to send: ' + (err.message || 'Unknown error'));
    } finally {
      setSendingReply(false);
    }
  };

  // Connect WhatsApp — DineOpen mode (simple)
  const handleConnectDineopen = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await apiClient.connectWhatsApp(restaurantId, { mode: 'dineopen' });
      setStatusMsg({ type: 'success', text: res.message || 'WhatsApp connected!' });
      await loadSettings();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.error || err.message || 'Failed to connect' });
    } finally {
      setSaving(false);
    }
  };

  // Connect WhatsApp — Restaurant mode via Embedded Signup
  const handleEmbeddedSignup = () => {
    if (!window.FB) {
      setStatusMsg({ type: 'error', text: 'Facebook SDK not loaded. Please refresh the page.' });
      return;
    }
    if (!EMBEDDED_SIGNUP_CONFIG_ID) {
      setStatusMsg({ type: 'error', text: 'Embedded Signup not configured. Please set config ID.' });
      return;
    }

    setStatusMsg(null);
    wabaDataRef.current = null;

    window.FB.login(
      function (response) {
        if (response.status === 'connected' && response.authResponse?.code) {
          setEmbeddedSignupLoading(true);
          setStatusMsg(null);

          // Use .then() instead of async/await since FB.login doesn't accept async callbacks
          const wabaData = wabaDataRef.current;
          if (!wabaData?.phone_number_id || !wabaData?.waba_id) {
            setStatusMsg({ type: 'error', text: 'Signup was not completed fully. Please try again and complete all steps including phone verification.' });
            setEmbeddedSignupLoading(false);
            return;
          }

          apiClient.connectWhatsAppEmbeddedSignup(restaurantId, {
            code: response.authResponse.code,
            phone_number_id: wabaData.phone_number_id,
            waba_id: wabaData.waba_id,
          }).then(res => {
            setStatusMsg({ type: 'success', text: res.message || 'WhatsApp connected!' });
            return loadSettings();
          }).catch(err => {
            setStatusMsg({ type: 'error', text: err.error || err.message || 'Failed to complete setup' });
          }).finally(() => {
            setEmbeddedSignupLoading(false);
          });
        } else {
          if (response.status !== 'unknown') {
            setStatusMsg({ type: 'error', text: 'Facebook login was cancelled or not authorized.' });
          }
        }
      },
      {
        config_id: EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: 3,
        },
      }
    );
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Disconnect WhatsApp? You will not be able to send bills or receive messages.')) return;
    setSaving(true);
    try {
      await apiClient.disconnectWhatsApp(restaurantId);
      setStatusMsg({ type: 'success', text: 'WhatsApp disconnected' });
      await loadSettings();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to disconnect' });
    } finally {
      setSaving(false);
    }
  };

  // Send test message
  const handleTestMessage = async () => {
    if (!testPhone) return alert('Enter a phone number');
    setTestSending(true);
    try {
      await apiClient.testWhatsAppMessage(restaurantId, testAsTemplate
        ? { phoneNumber: testPhone, templateName: testMessage, templateLanguage: 'en_US' }
        : { phoneNumber: testPhone, message: testMessage }
      );
      setStatusMsg({ type: 'success', text: 'Test message sent!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.error || 'Failed to send test message' });
    } finally {
      setTestSending(false);
    }
  };

  const copyWebhookUrl = () => {
    if (waSettings?.webhookUrl) {
      navigator.clipboard.writeText(waSettings.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Relative time: "Just now", "5m", "2h", "Yesterday", or date
  const relativeTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatTimeFull = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('91') && phone.length === 12) return '+91 ' + phone.slice(2);
    return phone;
  };

  const QUICK_REPLIES = [
    'Thank you for your message!',
    'Your order is being prepared.',
    'We\'ll be right with you!',
    'Please visit us again!',
    'Our menu is available on our website.',
  ];

  // Auto-poll conversations every 15s when on messages tab
  useEffect(() => {
    if (subTab === 'messages' && restaurantId) {
      pollRef.current = setInterval(() => {
        apiClient.getWhatsAppMessages(restaurantId, { limit: 200 }).then(res => {
          if (res?.conversations) setConversations(res.conversations);
        }).catch(() => {});
      }, 15000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [subTab, restaurantId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convoMessages]);

  // Filtered conversations based on search
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c =>
        (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || '').includes(searchQuery)
      )
    : conversations;

  // Total unread count for badge
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Get media URL for proxy (includes auth token as query param for img src usage)
  const getMediaUrl = (mediaId) => {
    if (!mediaId || !restaurantId) return '';
    const base = apiClient.baseURL || '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return `${base}/api/automation/${restaurantId}/whatsapp/media/${mediaId}?token=${encodeURIComponent(token || '')}`;
  };

  if (!selectedRestaurant) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px', border: '1px solid #e5e7eb', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <FaWhatsapp size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Select a Restaurant</h3>
          <p>Please select a restaurant from the dropdown above to manage WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', minHeight: '500px' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
        {[
          { id: 'settings', label: 'Settings', icon: <FaPlug size={14} /> },
          { id: 'messages', label: 'Messages', icon: <FaWhatsapp size={14} />, badge: totalUnread }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); setSelectedConvo(null); }}
            style={{
              padding: '14px 20px',
              border: 'none',
              borderBottom: subTab === tab.id ? '2px solid #25D366' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: subTab === tab.id ? '600' : '400',
              color: subTab === tab.id ? '#25D366' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge > 0 && (
              <span style={{
                backgroundColor: '#25D366', color: 'white', borderRadius: '10px',
                padding: '1px 6px', fontSize: '10px', fontWeight: '700', minWidth: '18px', textAlign: 'center'
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {subTab === 'settings' && (
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FaSpinner className="spin" size={24} style={{ color: '#25D366', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '8px', color: '#6b7280' }}>Loading settings...</p>
            </div>
          ) : (
            <>
              {/* Connection Status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                borderRadius: '10px', marginBottom: '20px',
                backgroundColor: waSettings?.connected ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${waSettings?.connected ? '#bbf7d0' : '#fecaca'}`
              }}>
                {waSettings?.connected ? (
                  <FaCheckCircle size={24} color="#22c55e" />
                ) : (
                  <FaTimesCircle size={24} color="#ef4444" />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: waSettings?.connected ? '#166534' : '#991b1b' }}>
                    {waSettings?.connected ? 'WhatsApp Connected' : 'WhatsApp Not Connected'}
                  </div>
                  {waSettings?.connected && waSettings?.settings?.mode && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                      {waSettings.settings.mode === 'dineopen' ? (
                        <>Sending from DineOpen&apos;s shared number</>
                      ) : (
                        <>Sending from your number{waSettings.settings.phoneNumber && waSettings.settings.phoneNumber !== 'N/A' ? `: ${waSettings.settings.phoneNumber}` : ''}</>
                      )}
                    </div>
                  )}
                </div>
                {waSettings?.connected && (
                  <button
                    onClick={handleDisconnect}
                    disabled={saving}
                    style={{
                      marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid #fecaca', backgroundColor: '#fff',
                      color: '#dc2626', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                    }}
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {/* Status message */}
              {statusMsg && (
                <div style={{
                  padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
                  backgroundColor: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: statusMsg.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  fontSize: '14px'
                }}>
                  {statusMsg.text}
                </div>
              )}

              {/* Connect Section (if not connected) */}
              {!waSettings?.connected && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Connect WhatsApp</h3>

                  {/* Mode selector */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { id: 'dineopen', label: 'Use DineOpen Number', desc: 'Send bills from DineOpen\'s shared WhatsApp number' },
                      { id: 'restaurant', label: 'Use Own Number', desc: 'Use your own WhatsApp Business number' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setConnectMode(mode.id)}
                        style={{
                          flex: 1, padding: '16px', borderRadius: '10px', border: `2px solid ${connectMode === mode.id ? '#25D366' : '#e5e7eb'}`,
                          backgroundColor: connectMode === mode.id ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '14px', color: connectMode === mode.id ? '#166534' : '#374151' }}>{mode.label}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{mode.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Restaurant's own number — Embedded Signup */}
                  {connectMode === 'restaurant' && (
                    <div style={{ marginBottom: '16px' }}>
                      {/* How it works */}
                      <div style={{
                        backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                        padding: '20px', marginBottom: '20px'
                      }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                          Connect Your WhatsApp Business Number
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[
                            { step: 1, title: 'Click "Login with Facebook" below', desc: 'A Facebook popup will open for you to authorize DineOpen.' },
                            { step: 2, title: 'Log in with Facebook', desc: 'Use the Facebook account linked to your business. If you don\'t have a Meta Business Account, one will be created for you.' },
                            { step: 3, title: 'Create or select a WhatsApp Business Account', desc: 'Choose an existing WhatsApp Business Account or create a new one in the popup.' },
                            { step: 4, title: 'Add & verify your phone number', desc: 'Enter the phone number you want to use for WhatsApp messaging. Verify it with an OTP sent via SMS or voice call.' },
                          ].map(item => (
                            <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <div style={{
                                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                backgroundColor: '#25D366', color: 'white', fontSize: '12px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px'
                              }}>
                                {item.step}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warning note */}
                      <div style={{
                        backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px',
                        padding: '12px 14px', marginBottom: '12px', fontSize: '12px', color: '#92400e', lineHeight: '1.7'
                      }}>
                        <strong>Important — Please read before connecting:</strong>
                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
                          <li>The phone number you connect will be <strong>migrated to the Cloud API</strong>. It will <strong>stop working</strong> on the WhatsApp or WhatsApp Business app on your phone.</li>
                          <li>Use a <strong>dedicated business number</strong> — do not use your personal WhatsApp number.</li>
                          <li>A separate SIM or landline number works best. You&apos;ll verify it via SMS or voice call during setup.</li>
                          <li>Old chat history from the WhatsApp app will <strong>not</strong> carry over.</li>
                        </ul>
                      </div>

                      {/* Info note */}
                      <div style={{
                        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
                        padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#1e40af', lineHeight: '1.7'
                      }}>
                        <strong>Once connected:</strong>
                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
                          <li>Bills and notifications will be sent from your restaurant&apos;s number. Customers will see your restaurant name as the sender.</li>
                          <li>When customers message this number, you&apos;ll see their messages in the <strong>Messages</strong> tab and can reply from here.</li>
                          <li>You can also send test messages and manage conversations directly from this dashboard.</li>
                        </ul>
                      </div>

                      {/* Embedded Signup button */}
                      <button
                        onClick={handleEmbeddedSignup}
                        disabled={embeddedSignupLoading || !fbSdkReady}
                        style={{
                          padding: '12px 24px', borderRadius: '10px', border: 'none',
                          backgroundColor: '#1877f2', color: 'white', fontSize: '14px',
                          fontWeight: '600', cursor: (embeddedSignupLoading || !fbSdkReady) ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          opacity: (embeddedSignupLoading || !fbSdkReady) ? 0.7 : 1
                        }}
                      >
                        {embeddedSignupLoading ? (
                          <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <FaFacebook size={16} />
                        )}
                        {embeddedSignupLoading ? 'Connecting...' : !fbSdkReady ? 'Loading...' : 'Login with Facebook'}
                      </button>
                    </div>
                  )}

                  {/* DineOpen mode — simple connect */}
                  {connectMode === 'dineopen' && (
                    <button
                      onClick={handleConnectDineopen}
                      disabled={saving}
                      style={{
                        padding: '12px 24px', borderRadius: '10px', border: 'none',
                        backgroundColor: '#25D366', color: 'white', fontSize: '14px',
                        fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1
                      }}
                    >
                      {saving ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaWhatsapp size={16} />}
                      {saving ? 'Connecting...' : 'Connect WhatsApp'}
                    </button>
                  )}
                </div>
              )}

              {/* Restaurant mode info note */}
              {waSettings?.connected && waSettings?.settings?.mode === 'restaurant' && (
                <div style={{
                  padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
                  backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e40af'
                }}>
                  <strong>Bills from your number:</strong> After billing, customers will receive the invoice from your WhatsApp number.
                  The system uses the <code style={{ backgroundColor: '#dbeafe', padding: '1px 4px', borderRadius: '4px' }}>bill_notification</code> template if available on your WABA.
                  If not found, a plain text message is sent instead (only works within 24h of customer messaging you).
                  To send bills anytime, create and get a message template approved in your Meta Business account.
                </div>
              )}

              {/* Test Message (if connected) */}
              {waSettings?.connected && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Send Test Message</h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button onClick={() => setTestAsTemplate(true)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', fontWeight: '500', cursor: 'pointer', backgroundColor: testAsTemplate ? '#25D366' : '#fff', color: testAsTemplate ? '#fff' : '#374151' }}>Template</button>
                    <button onClick={() => setTestAsTemplate(false)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', fontWeight: '500', cursor: 'pointer', backgroundColor: !testAsTemplate ? '#25D366' : '#fff', color: !testAsTemplate ? '#fff' : '#374151' }}>Text</button>
                    <span style={{ fontSize: '11px', color: '#9ca3af', alignSelf: 'center' }}>{testAsTemplate ? 'Templates can reach any customer' : 'Text only works within 24h of customer messaging you'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Phone (with country code)</label>
                      <input
                        value={testPhone}
                        onChange={e => setTestPhone(e.target.value)}
                        placeholder="919876543210"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>{testAsTemplate ? 'Template Name' : 'Message'}</label>
                      <input
                        value={testMessage}
                        onChange={e => setTestMessage(e.target.value)}
                        placeholder={testAsTemplate ? 'hello_world' : 'Test message'}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
                      />
                    </div>
                    <button
                      onClick={handleTestMessage}
                      disabled={testSending}
                      style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#25D366', color: 'white', fontSize: '13px',
                        fontWeight: '600', cursor: testSending ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {testSending ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane size={12} />}
                      Send
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {subTab === 'messages' && (
        <div style={{ display: 'flex', height: '560px' }}>
          {/* Conversations list */}
          <div style={{
            width: selectedConvo ? '320px' : '100%',
            borderRight: selectedConvo ? '1px solid #e5e7eb' : 'none',
            overflowY: 'auto',
            display: selectedConvo && typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600', fontSize: '15px', color: '#111827' }}>
                  Conversations
                  {conversations.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '400', marginLeft: '6px' }}>({conversations.length})</span>
                  )}
                </span>
                <button onClick={loadMessages} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#25D366', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Refresh
                </button>
              </div>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <FaSearch size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  style={{
                    width: '100%', padding: '8px 12px 8px 30px', borderRadius: '8px',
                    border: '1px solid #e5e7eb', fontSize: '12px', outline: 'none',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {messagesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '8px', fontSize: '13px' }}>Loading...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6b7280' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <FaWhatsapp size={24} style={{ color: '#d1d5db' }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    {searchQuery ? 'No matching conversations' : 'No messages yet'}
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>
                    {searchQuery ? 'Try a different search' : 'Customer messages will appear here'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((convo, idx) => (
                  <div
                    key={convo.phone || idx}
                    onClick={() => openConversation(convo)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      backgroundColor: selectedConvo?.phone === convo.phone ? '#f0fdf4' : '#fff',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (selectedConvo?.phone !== convo.phone) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={e => { if (selectedConvo?.phone !== convo.phone) e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* Avatar */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: '#25D366', color: 'white', fontSize: '14px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {(convo.customerName || convo.phone || '?').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: convo.unreadCount > 0 ? '700' : '500', fontSize: '13px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {convo.customerName || formatPhone(convo.phone)}
                              </span>
                              <span style={{ fontSize: '11px', color: convo.unreadCount > 0 ? '#25D366' : '#9ca3af', flexShrink: 0, marginLeft: '8px', fontWeight: convo.unreadCount > 0 ? '600' : '400' }}>
                                {relativeTime(convo.lastTimestamp)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                              <span style={{
                                fontSize: '12px', color: convo.unreadCount > 0 ? '#374151' : '#9ca3af',
                                fontWeight: convo.unreadCount > 0 ? '500' : '400',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px'
                              }}>
                                {convo.lastMessage}
                              </span>
                              {convo.unreadCount > 0 && (
                                <span style={{
                                  backgroundColor: '#25D366', color: 'white', borderRadius: '50%',
                                  width: '20px', height: '20px', fontSize: '10px', fontWeight: '700',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  {convo.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat view */}
          {selectedConvo && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
              {/* Chat header */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff' }}>
                <button
                  onClick={() => setSelectedConvo(null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                >
                  <FaArrowLeft size={14} />
                </button>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: '#25D366', color: 'white', fontSize: '14px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {(selectedConvo.customerName || selectedConvo.phone || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                    {selectedConvo.customerName || formatPhone(selectedConvo.phone)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatPhone(selectedConvo.phone)}</div>
                </div>
                {/* Session status indicator */}
                <div style={{
                  padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600',
                  backgroundColor: selectedConvo.sessionActive ? '#dcfce7' : '#fef3c7',
                  color: selectedConvo.sessionActive ? '#166534' : '#92400e'
                }}>
                  {selectedConvo.sessionActive ? 'Active' : '24h expired'}
                </div>
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {convoMessages.map((msg, idx) => {
                  const isOutgoing = msg.direction === 'outgoing' || msg.type === 'test_message' || msg.type === 'bill_sent' || msg.type === 'reply';
                  const isMedia = ['image', 'video', 'audio', 'document', 'sticker', 'location'].includes(msg.messageType);

                  return (
                    <div key={msg.id || idx} style={{
                      display: 'flex',
                      justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        maxWidth: '70%', minWidth: isMedia ? '200px' : 'auto',
                        padding: msg.messageType === 'image' && msg.mediaId ? '4px 4px 4px 4px' : '6px 10px',
                        borderRadius: isOutgoing ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                        backgroundColor: isOutgoing ? '#dcf8c6' : '#fff',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                        fontSize: '13px', color: '#111827'
                      }}>
                        {/* Bill badge */}
                        {msg.type === 'bill_sent' && (
                          <div style={{
                            fontSize: '10px', color: '#fff', fontWeight: '600', marginBottom: '4px',
                            backgroundColor: '#25D366', padding: '2px 8px', borderRadius: '4px', display: 'inline-block'
                          }}>
                            BILL {msg.amount ? `- ${msg.amount}` : ''}
                          </div>
                        )}

                        {/* Image message */}
                        {msg.messageType === 'image' && msg.mediaId && (
                          <div
                            onClick={() => setImagePreview(getMediaUrl(msg.mediaId))}
                            style={{ cursor: 'pointer', marginBottom: msg.caption ? '4px' : '0' }}
                          >
                            <img
                              src={getMediaUrl(msg.mediaId)}
                              alt="Shared image"
                              style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', display: 'block', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <div style={{ display: 'none', alignItems: 'center', gap: '6px', padding: '12px', color: '#6b7280', fontSize: '12px' }}>
                              <FaImage size={16} /> Image (tap to retry)
                            </div>
                          </div>
                        )}

                        {/* Video message */}
                        {msg.messageType === 'video' && msg.mediaId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: isOutgoing ? '#c8f0b4' : '#f3f4f6', borderRadius: '8px', marginBottom: '4px' }}>
                            <FaVideo size={16} color="#6b7280" />
                            <span style={{ fontSize: '12px', color: '#374151' }}>Video message</span>
                          </div>
                        )}

                        {/* Audio message */}
                        {msg.messageType === 'audio' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: isOutgoing ? '#c8f0b4' : '#f3f4f6', borderRadius: '8px', marginBottom: '4px' }}>
                            <FaVolumeUp size={16} color="#25D366" />
                            <div style={{ flex: 1, height: '4px', backgroundColor: '#d1d5db', borderRadius: '2px' }}>
                              <div style={{ width: '30%', height: '100%', backgroundColor: '#25D366', borderRadius: '2px' }} />
                            </div>
                          </div>
                        )}

                        {/* Document message */}
                        {msg.messageType === 'document' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: isOutgoing ? '#c8f0b4' : '#f3f4f6', borderRadius: '8px', marginBottom: '4px' }}>
                            <FaFileAlt size={16} color="#6b7280" />
                            <span style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {msg.filename || 'Document'}
                            </span>
                          </div>
                        )}

                        {/* Location message */}
                        {msg.messageType === 'location' && (
                          <a
                            href={`https://maps.google.com/?q=${msg.latitude},${msg.longitude}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', backgroundColor: isOutgoing ? '#c8f0b4' : '#f3f4f6', borderRadius: '8px', marginBottom: '4px', textDecoration: 'none', color: '#1e40af' }}
                          >
                            <FaMapMarkerAlt size={16} color="#dc2626" />
                            <span style={{ fontSize: '12px' }}>{msg.locationName || 'View on map'}</span>
                          </a>
                        )}

                        {/* Text content (skip for image-only messages) */}
                        {!(msg.messageType === 'image' && msg.mediaId && !msg.caption) && (
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {msg.messageType === 'image' ? msg.caption : msg.message}
                          </div>
                        )}

                        {/* Footer: time + status + sender */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '3px' }}>
                          {isOutgoing && msg.sentByName && msg.sentByName !== 'Staff' && (
                            <span style={{ fontSize: '10px', color: '#6b7280', marginRight: 'auto' }}>{msg.sentByName}</span>
                          )}
                          <span style={{ fontSize: '10px', color: '#9ca3af' }}>{formatTimeFull(msg.timestamp)}</span>
                          {isOutgoing && msg.status && (
                            <span style={{ fontSize: '12px' }}>
                              {msg.status === 'read' ? (
                                <span style={{ color: '#3b82f6' }}>✓✓</span>
                              ) : msg.status === 'delivered' ? (
                                <span style={{ color: '#9ca3af' }}>✓✓</span>
                              ) : msg.status === 'sent' ? (
                                <span style={{ color: '#9ca3af' }}>✓</span>
                              ) : msg.status === 'failed' ? (
                                <span style={{ color: '#ef4444' }}>✗</span>
                              ) : null}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 24h session warning */}
              {selectedConvo && !selectedConvo.sessionActive && (
                <div style={{
                  padding: '8px 16px', backgroundColor: '#fefce8', borderTop: '1px solid #fde68a',
                  fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span>Customer&apos;s last message was over 24h ago. Only template messages can be sent outside the session window.</span>
                </div>
              )}

              {/* Reply input area */}
              <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                {/* Quick replies dropdown */}
                {showQuickReplies && (
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_REPLIES.map((qr, i) => (
                      <button key={i} onClick={() => { setReplyText(qr); setShowQuickReplies(false); }}
                        style={{
                          padding: '4px 10px', borderRadius: '14px', border: '1px solid #d1d5db',
                          backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#374151',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.borderColor = '#25D366'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Quick reply toggle */}
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    title="Quick replies"
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                      backgroundColor: showQuickReplies ? '#dcfce7' : '#f3f4f6', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: showQuickReplies ? '#25D366' : '#6b7280', transition: 'all 0.15s'
                    }}
                  >
                    <FaChevronDown size={12} style={{ transform: showQuickReplies ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                    placeholder={selectedConvo.sessionActive ? 'Type a reply...' : 'Session expired — use templates'}
                    disabled={!selectedConvo.sessionActive}
                    style={{
                      flex: 1, padding: '9px 14px', borderRadius: '20px',
                      border: '1px solid #d1d5db', fontSize: '13px', outline: 'none',
                      backgroundColor: selectedConvo.sessionActive ? '#fff' : '#f9fafb',
                      opacity: selectedConvo.sessionActive ? 1 : 0.6
                    }}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sendingReply || !replyText.trim() || !selectedConvo.sessionActive}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                      backgroundColor: '#25D366', color: 'white',
                      cursor: (sendingReply || !replyText.trim() || !selectedConvo.sessionActive) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: (sendingReply || !replyText.trim() || !selectedConvo.sessionActive) ? 0.4 : 1,
                      transition: 'opacity 0.15s'
                    }}
                  >
                    {sendingReply ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane size={13} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No conversation selected — show empty state */}
          {!selectedConvo && conversations.length > 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FaWhatsapp size={28} style={{ color: '#d1d5db' }} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#6b7280' }}>Select a conversation</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Choose a chat from the left to view messages</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image preview modal */}
      {imagePreview && (
        <div
          onClick={() => setImagePreview(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'pointer'
          }}
        >
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
