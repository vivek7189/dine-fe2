'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../lib/api';
import { FaPhone, FaCheckCircle, FaTimesCircle, FaSpinner, FaPaperPlane, FaWhatsapp, FaArrowLeft, FaSearch, FaPlug, FaToggleOn, FaToggleOff, FaCopy, FaCheck, FaFacebook } from 'react-icons/fa';

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
  const wabaDataRef = useRef(null);
  const messagesEndRef = useRef(null);

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
      async function (response) {
        if (response.status === 'connected' && response.authResponse?.code) {
          setEmbeddedSignupLoading(true);
          setStatusMsg(null);
          try {
            const wabaData = wabaDataRef.current;
            if (!wabaData?.phone_number_id || !wabaData?.waba_id) {
              setStatusMsg({ type: 'error', text: 'Signup was not completed fully. Please try again and complete all steps including phone verification.' });
              setEmbeddedSignupLoading(false);
              return;
            }

            const res = await apiClient.connectWhatsAppEmbeddedSignup(restaurantId, {
              code: response.authResponse.code,
              phone_number_id: wabaData.phone_number_id,
              waba_id: wabaData.waba_id,
            });
            setStatusMsg({ type: 'success', text: res.message || 'WhatsApp connected!' });
            await loadSettings();
          } catch (err) {
            setStatusMsg({ type: 'error', text: err.error || err.message || 'Failed to complete setup' });
          } finally {
            setEmbeddedSignupLoading(false);
          }
        } else {
          // User cancelled or didn't authorize
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

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('91') && phone.length === 12) return '+91 ' + phone.slice(2);
    return phone;
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
          { id: 'messages', label: 'Messages', icon: <FaWhatsapp size={14} /> }
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

                      {/* Info note */}
                      <div style={{
                        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
                        padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#1e40af', lineHeight: '1.6'
                      }}>
                        <strong>Once connected:</strong> Bills will be sent from your restaurant&apos;s WhatsApp number. Customers will see your restaurant name as the sender.
                        The phone number you connect here should not be actively used on WhatsApp or WhatsApp Business app — it will be migrated to the Cloud API.
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
        <div style={{ display: 'flex', height: '500px' }}>
          {/* Conversations list */}
          <div style={{
            width: selectedConvo ? '300px' : '100%',
            borderRight: selectedConvo ? '1px solid #e5e7eb' : 'none',
            overflowY: 'auto',
            display: selectedConvo && window.innerWidth < 768 ? 'none' : 'block'
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>Conversations</span>
              <button onClick={loadMessages} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#25D366', fontSize: '13px', fontWeight: '500' }}>
                Refresh
              </button>
            </div>

            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '8px', fontSize: '13px' }}>Loading...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <FaWhatsapp size={32} style={{ marginBottom: '8px', color: '#d1d5db' }} />
                <p style={{ fontSize: '13px' }}>No messages yet</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Messages from customers will appear here</p>
              </div>
            ) : (
              conversations.map((convo, idx) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                      {convo.customerName || formatPhone(convo.phone)}
                    </div>
                    {convo.unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#25D366', color: 'white', borderRadius: '10px',
                        padding: '2px 8px', fontSize: '11px', fontWeight: '600'
                      }}>
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  {convo.customerName && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatPhone(convo.phone)}</div>
                  )}
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                    {convo.lastMessage}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: '2px' }}>{formatTime(convo.lastTimestamp)}</div>
                </div>
              ))
            )}
          </div>

          {/* Chat view */}
          {selectedConvo && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Chat header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setSelectedConvo(null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                >
                  <FaArrowLeft size={14} />
                </button>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                    {selectedConvo.customerName || formatPhone(selectedConvo.phone)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatPhone(selectedConvo.phone)}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f0f2f5' }}>
                {convoMessages.map((msg, idx) => {
                  const isOutgoing = msg.direction === 'outgoing' || msg.type === 'test_message' || msg.type === 'bill_sent' || msg.type === 'reply';
                  return (
                    <div key={msg.id || idx} style={{
                      display: 'flex',
                      justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: isOutgoing ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isOutgoing ? '#dcf8c6' : '#fff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                        fontSize: '13px',
                        color: '#111827',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {msg.type === 'bill_sent' && (
                          <div style={{ fontSize: '11px', color: '#25D366', fontWeight: '600', marginBottom: '4px' }}>Bill Sent</div>
                        )}
                        {msg.message}
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                          {formatTime(msg.timestamp)}
                          {isOutgoing && msg.status && (
                            <span style={{ marginLeft: '4px' }}>
                              {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : msg.status === 'sent' ? '✓' : msg.status === 'failed' ? '✗' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', backgroundColor: '#fff' }}>
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Type a reply... (within 24h of last customer message)"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none' }}
                />
                <button
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                    backgroundColor: '#25D366', color: 'white', cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: sendingReply || !replyText.trim() ? 0.5 : 1
                  }}
                >
                  {sendingReply ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane size={14} />}
                </button>
              </div>
            </div>
          )}
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
