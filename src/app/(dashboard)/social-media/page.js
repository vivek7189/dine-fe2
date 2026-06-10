'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaShareAlt, FaInstagram, FaTwitter, FaLinkedin, FaYoutube,
  FaCalendarAlt, FaPencilAlt, FaChartLine, FaLink, FaRocket,
  FaCheckCircle, FaSpinner, FaExclamationTriangle, FaExternalLinkAlt,
  FaArrowRight, FaTimes,
} from 'react-icons/fa';
import apiClient from '../../../lib/api';

// PostCraze URLs — configurable via env vars
const POSTCRAZE_APP_URL = process.env.NEXT_PUBLIC_POSTCRAZE_URL || 'https://postcraze.com';
const POSTCRAZE_API_URL = process.env.NEXT_PUBLIC_POSTCRAZE_API_URL || 'https://api.postcraze.com';
const EMBED_SECRET = process.env.NEXT_PUBLIC_POSTCRAZE_EMBED_SECRET || 'postcraze-setup-2026';

const PLATFORM_ICONS = {
  instagram: { icon: FaInstagram, color: '#E1306C', name: 'Instagram' },
  twitter: { icon: FaTwitter, color: '#1DA1F2', name: 'Twitter / X' },
  linkedin: { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
  youtube: { icon: FaYoutube, color: '#FF0000', name: 'YouTube' },
};

const FEATURES = [
  { icon: FaPencilAlt, title: 'AI Content Studio', desc: 'Generate engaging posts with AI for any platform' },
  { icon: FaCalendarAlt, title: 'Smart Scheduler', desc: 'Schedule posts for the best times automatically' },
  { icon: FaChartLine, title: 'Analytics', desc: 'Track engagement, reach, and growth across platforms' },
  { icon: FaLink, title: 'Multi-Platform', desc: 'Connect Instagram, Twitter, LinkedIn, YouTube & more' },
];

export default function SocialMediaPage() {
  const router = useRouter();
  const iframeRef = useRef(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Embed state
  const [embedState, setEmbedState] = useState('loading'); // loading | authenticating | ready | error
  const [embedError, setEmbedError] = useState('');
  const [customToken, setCustomToken] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // Active tab for the iframe content
  const [activeTab, setActiveTab] = useState('accounts'); // accounts | content | schedule | analytics

  // ─── Setup ───────────────────────────────────────
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const parsed = apiClient.getUser();
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    const savedId = localStorage.getItem('selectedRestaurantId');
    if (savedId) setRestaurantId(savedId);

    // Get restaurant name
    try {
      const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
      const rest = restaurants.find(r => r.id === savedId);
      if (rest) setRestaurantName(rest.name || rest.restaurantName || '');
    } catch {}

    const handleChange = (event) => {
      setRestaurantId(event.detail?.restaurantId);
      setEmbedState('loading');
      setCustomToken(null);
    };
    window.addEventListener('restaurantChanged', handleChange);
    return () => window.removeEventListener('restaurantChanged', handleChange);
  }, []);

  // ─── Get embed token from PostCraze ──────────────
  const getEmbedToken = useCallback(async () => {
    if (!restaurantId) return;

    setEmbedState('authenticating');
    setEmbedError('');

    try {
      // Get restaurant details for the PostCraze account
      let restName = restaurantName;
      let ownerName = user?.name || '';
      let ownerEmail = user?.email || '';

      if (!restName) {
        try {
          const res = await apiClient.getRestaurants();
          const rest = res?.restaurants?.find(r => r.id === restaurantId);
          if (rest) restName = rest.name || rest.restaurantName || 'My Restaurant';
        } catch {}
      }

      // Call PostCraze embed-login API
      const response = await fetch(`${POSTCRAZE_API_URL}/api/auth/embed-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: EMBED_SECRET,
          restaurantId,
          restaurantName: restName || 'My Restaurant',
          ownerName,
          ownerEmail,
        }),
      });

      const data = await response.json();

      if (data.success && data.customToken) {
        setCustomToken(data.customToken);
        setTeamId(data.teamId);
        setEmbedState('ready');
      } else {
        throw new Error(data.error || 'Failed to authenticate with PostCraze');
      }
    } catch (err) {
      console.error('PostCraze embed login failed:', err);
      setEmbedState('error');
      setEmbedError(err.message || 'Failed to connect to PostCraze');
    }
  }, [restaurantId, restaurantName, user]);

  useEffect(() => {
    if (restaurantId && user) {
      getEmbedToken();
    }
  }, [restaurantId, user, getEmbedToken]);

  // ─── Listen for postMessage from iframe ──────────
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== 'postcraze') return;

      switch (event.data.type) {
        case 'EMBED_READY':
          // PostCraze iframe is ready — send the custom token
          if (customToken && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'EMBED_LOGIN',
              customToken,
              teamId,
            }, '*');
          }
          break;

        case 'ACCOUNT_CONNECTED':
          // Social account connected in PostCraze
          break;

        case 'POST_PUBLISHED':
          // Post was published
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [customToken, teamId]);

  // ─── Build iframe URL ────────────────────────────
  const getIframeUrl = () => {
    const path = activeTab === 'content' ? '/content'
      : activeTab === 'schedule' ? '/schedule'
      : activeTab === 'analytics' ? '/analytics'
      : '/accounts';
    return `${POSTCRAZE_APP_URL}${path}?embed=true&parentOrigin=${encodeURIComponent(window.location.origin)}`;
  };

  // ─── Render ──────────────────────────────────────
  if (!restaurantId || !user) return null;

  return (
    <div style={{ padding: isMobile ? '16px' : '0', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 0 16px' : '20px 24px 16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaShareAlt size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Social Media
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Powered by PostCraze
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        {embedState === 'ready' && (
          <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '3px' }}>
            {[
              { id: 'accounts', label: 'Accounts', icon: FaLink },
              { id: 'content', label: 'Create', icon: FaPencilAlt },
              { id: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
              { id: 'analytics', label: 'Analytics', icon: FaChartLine },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px', border: 'none',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  color: activeTab === tab.id ? '#111827' : '#6b7280',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '13px', cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <tab.icon size={12} />
                {!isMobile && tab.label}
              </button>
            ))}
          </div>
        )}

        {embedState === 'ready' && (
          <a
            href={POSTCRAZE_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              background: '#f3f4f6', color: '#6b7280',
              fontSize: '12px', fontWeight: '500',
              textDecoration: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Open Full App <FaExternalLinkAlt size={10} />
          </a>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Loading State */}
        {(embedState === 'loading' || embedState === 'authenticating') && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '20px',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #ec4899, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <FaShareAlt size={24} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 6px' }}>
                {embedState === 'authenticating' ? 'Connecting to PostCraze...' : 'Loading Social Media...'}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Setting up your social media workspace
              </p>
            </div>
            <FaSpinner size={20} color="#ec4899" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {embedState === 'error' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '20px', padding: '40px',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaExclamationTriangle size={24} color="#ef4444" />
            </div>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>
                Connection Failed
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
                {embedError || 'Could not connect to PostCraze. Please try again.'}
              </p>
              <button
                onClick={getEmbedToken}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #ec4899, #f97316)',
                  color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>

            {/* Show overview features below error */}
            <div style={{
              marginTop: '30px', display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px', maxWidth: '600px', width: '100%',
            }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb',
                  background: 'white', display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <f.icon size={16} color="#ec4899" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{f.title}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PostCraze Iframe */}
        {embedState === 'ready' && (
          <iframe
            ref={iframeRef}
            src={getIframeUrl()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: isMobile ? '0' : '12px 12px 0 0',
              background: 'white',
            }}
            allow="clipboard-write"
            title="PostCraze Social Media Manager"
          />
        )}
      </div>
    </div>
  );
}
