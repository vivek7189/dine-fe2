'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../firebase';
import { t } from '../../lib/i18n';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Web Audio Chime ───
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.2;

    // Three-tone ascending chime: C5 → E5 → G5
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(gain);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.2);
    });

    setTimeout(() => ctx.close(), 2000);
  } catch (e) { /* Audio not supported */ }
}

// ─── Clock Component ───
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const fmt = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = time.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  return <span>{fmt} &middot; {date}</span>;
}

// ─── Order Type Badge ───
function OrderTypeBadge({ type }) {
  const colors = {
    'dine-in': { bg: '#1e3a5f', text: '#93c5fd' },
    'takeaway': { bg: '#3b2f1e', text: '#fbbf24' },
    'delivery': { bg: '#1e3b2f', text: '#6ee7b7' },
    'online': { bg: '#2e1e3b', text: '#c4b5fd' },
  };
  const c = colors[type] || colors['dine-in'];
  const label = t(`tokenDisplay.orderTypes.${type}`) || type;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
      fontSize: 'clamp(10px, 1.2vw, 14px)', fontWeight: '600',
      backgroundColor: c.bg, color: c.text,
    }}>
      {label}
    </span>
  );
}

// ─── Token Card ───
function TokenCard({ order, status, isNew, settings }) {
  const isReady = status === 'ready';
  return (
    <div style={{
      backgroundColor: isReady ? '#064e3b' : '#1e293b',
      border: `2px solid ${isReady ? '#10b981' : '#334155'}`,
      borderRadius: '16px',
      padding: 'clamp(12px, 2vw, 24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      animation: isNew ? 'tokenAppear 0.4s ease-out' : (isReady ? 'readyPulse 2s ease-in-out infinite' : 'none'),
      transition: 'all 0.4s ease',
      minWidth: 0,
    }}>
      <div style={{
        fontSize: 'clamp(36px, 5vw, 96px)', fontWeight: '800', lineHeight: 1,
        color: isReady ? '#34d399' : '#f1f5f9',
        fontVariantNumeric: 'tabular-nums',
      }}>
        #{order.dailyOrderId}
      </div>
      {settings.showCustomerName && order.customerName && (
        <div style={{
          fontSize: 'clamp(12px, 1.4vw, 18px)', color: '#94a3b8',
          maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {order.customerName}
        </div>
      )}
      {settings.showOrderType && <OrderTypeBadge type={order.orderType} />}
    </div>
  );
}

// ─── PIN Entry Screen ───
function PinEntry({ restaurantId, onSuccess, error: externalError }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/token-display/${restaurantId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('tokenDisplay.invalidPin'));
        setLoading(false);
        return;
      }
      onSuccess(pin, data);
    } catch (err) {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0f172a', padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#1e293b', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '400px', textAlign: 'center',
        border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>
          {t('tokenDisplay.title')}
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 28px' }}>
          {t('tokenDisplay.enterPin')}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('tokenDisplay.pinPlaceholder')}
            autoFocus
            style={{
              width: '100%', padding: '14px', fontSize: '28px', textAlign: 'center',
              fontFamily: 'monospace', letterSpacing: '8px',
              backgroundColor: '#0f172a', border: '2px solid #334155', borderRadius: '12px',
              color: '#f1f5f9', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {(error || externalError) && (
            <div style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>
              {error || externalError}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            style={{
              width: '100%', padding: '14px', marginTop: '20px',
              backgroundColor: pin.length >= 4 ? '#10b981' : '#334155',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '16px', fontWeight: '600', cursor: pin.length >= 4 ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : t('tokenDisplay.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Token Display ───
function TokenDisplayContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');

  const [screen, setScreen] = useState('loading'); // loading, pin, display, error
  const [pin, setPin] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [settings, setSettings] = useState({ autoClearSeconds: 60, showCustomerName: true, showOrderType: true });
  const [orders, setOrders] = useState([]);
  const [newTokenIds, setNewTokenIds] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  const ordersRef = useRef(orders);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  const autoClearTimers = useRef({});

  // ─── Responsive breakpoint ───
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setCols(w < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Initial load: check if PIN required ───
  useEffect(() => {
    if (!restaurantId) { setScreen('error'); setErrorMsg('No restaurant ID provided'); return; }

    (async () => {
      try {
        // Try without PIN first
        const res = await fetch(`${API_BASE_URL}/api/public/token-display/${restaurantId}?pin=`);
        if (res.status === 401) {
          // PIN required
          setScreen('pin');
          return;
        }
        if (res.status === 403) {
          setScreen('error');
          setErrorMsg('Token display is not enabled for this restaurant');
          return;
        }
        if (!res.ok) {
          setScreen('error');
          setErrorMsg('Failed to load token display');
          return;
        }
        const data = await res.json();
        setRestaurant(data.restaurant);
        setSettings(data.settings);
        setOrders(data.orders || []);
        setScreen('display');
      } catch (err) {
        setScreen('error');
        setErrorMsg('Connection failed');
      }
    })();
  }, [restaurantId]);

  // ─── Fetch orders ───
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const url = `${API_BASE_URL}/api/public/token-display/${restaurantId}?pin=${encodeURIComponent(pin)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      // Detect newly ready tokens
      const prevOrders = ordersRef.current;
      const newReady = (data.orders || []).filter(o =>
        o.status === 'ready' && !prevOrders.find(p => p.id === o.id && p.status === 'ready')
      );
      if (newReady.length > 0 && soundEnabledRef.current) {
        playChime();
      }
      // Mark new tokens for animation
      const prevIds = new Set(prevOrders.map(o => o.id));
      const brandNew = (data.orders || []).filter(o => !prevIds.has(o.id));
      if (brandNew.length > 0) {
        setNewTokenIds(prev => {
          const next = new Set(prev);
          brandNew.forEach(o => next.add(o.id));
          return next;
        });
        setTimeout(() => {
          setNewTokenIds(prev => {
            const next = new Set(prev);
            brandNew.forEach(o => next.delete(o.id));
            return next;
          });
        }, 600);
      }

      setOrders(data.orders || []);
      if (data.settings) setSettings(data.settings);
      if (data.restaurant) setRestaurant(data.restaurant);
    } catch (err) { /* retry on next event */ }
  }, [restaurantId, pin]);

  // ─── Auto-clear ready tokens ───
  useEffect(() => {
    const readyOrders = orders.filter(o => o.status === 'ready');
    readyOrders.forEach(o => {
      if (!autoClearTimers.current[o.id]) {
        autoClearTimers.current[o.id] = setTimeout(() => {
          setOrders(prev => prev.filter(p => p.id !== o.id));
          delete autoClearTimers.current[o.id];
        }, (settings.autoClearSeconds || 60) * 1000);
      }
    });
    // Clean up timers for orders no longer in list
    Object.keys(autoClearTimers.current).forEach(id => {
      if (!orders.find(o => o.id === id && o.status === 'ready')) {
        clearTimeout(autoClearTimers.current[id]);
        delete autoClearTimers.current[id];
      }
    });
  }, [orders, settings.autoClearSeconds]);

  // ─── Firebase RTDB Subscription ───
  useEffect(() => {
    if (screen !== 'display' || !restaurantId || !database) return;

    const now = Date.now();
    const ordersPath = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));

    let debounceTimer = null;
    const handleSnapshot = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchOrders();
      }, 1000);
    };

    onChildAdded(ordersPath, handleSnapshot, (error) => {
      console.error('Token display RTDB error:', error.message);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      off(ordersPath, 'child_added', handleSnapshot);
    };
  }, [screen, restaurantId, fetchOrders]);

  // ─── Periodic refresh fallback (every 30s) ───
  useEffect(() => {
    if (screen !== 'display') return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [screen, fetchOrders]);

  // ─── Sound toggle persistence ───
  useEffect(() => {
    const stored = localStorage.getItem('tokenDisplaySoundEnabled');
    if (stored !== null) setSoundEnabled(stored === 'true');
  }, []);
  const toggleSound = () => {
    setSoundEnabled(prev => {
      localStorage.setItem('tokenDisplaySoundEnabled', String(!prev));
      return !prev;
    });
  };

  // ─── PIN submit handler ───
  const handlePinSuccess = (enteredPin, data) => {
    setPin(enteredPin);
    setRestaurant(data.restaurant);
    setSettings(data.settings);
    setScreen('display');
    // Fetch orders with the validated PIN
    setTimeout(() => {
      fetch(`${API_BASE_URL}/api/public/token-display/${restaurantId}?pin=${encodeURIComponent(enteredPin)}`)
        .then(r => r.json())
        .then(d => { if (d.orders) setOrders(d.orders); })
        .catch(() => {});
    }, 100);
  };

  // ─── Screens ───
  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ color: '#f87171', fontSize: '18px', fontWeight: '600' }}>{errorMsg}</div>
        </div>
      </div>
    );
  }

  if (screen === 'pin') {
    return <PinEntry restaurantId={restaurantId} onSuccess={handlePinSuccess} />;
  }

  // ─── Display Screen ───
  const preparing = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const ready = orders.filter(o => o.status === 'ready');

  const tokenGrid = (items, status) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(clamp(100px, 12vw, 180px), 1fr))`,
      gap: 'clamp(8px, 1.2vw, 16px)',
      padding: '4px',
    }}>
      {items.map(order => (
        <TokenCard
          key={order.id}
          order={order}
          status={status === 'ready' ? 'ready' : order.status}
          isNew={newTokenIds.has(order.id)}
          settings={settings}
        />
      ))}
    </div>
  );

  const sectionStyle = (isReady) => ({
    flex: 1, minWidth: 0, minHeight: 0,
    display: 'flex', flexDirection: 'column',
    padding: 'clamp(12px, 2vw, 24px)',
    overflow: 'auto',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(10px, 1.5vw, 20px) clamp(16px, 2vw, 32px)',
        backgroundColor: '#1e293b', borderBottom: '1px solid #334155',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {restaurant?.logo && (
            <img src={restaurant.logo} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          )}
          <span style={{ fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: '700' }}>
            {restaurant?.name || 'Restaurant'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: 'clamp(12px, 1.2vw, 16px)', color: '#94a3b8' }}>
            {t('tokenDisplay.title')}
          </span>
          <button
            onClick={toggleSound}
            style={{
              background: 'none', border: '1px solid #475569', borderRadius: '8px',
              padding: '6px 12px', cursor: 'pointer', color: soundEnabled ? '#34d399' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(11px, 1vw, 14px)',
            }}
            title={soundEnabled ? t('tokenDisplay.soundOn') : t('tokenDisplay.soundOff')}
          >
            {soundEnabled ? '🔊' : '🔇'}
            <span style={{ display: cols > 1 ? 'inline' : 'none' }}>
              {soundEnabled ? t('tokenDisplay.soundOn') : t('tokenDisplay.soundOff')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: cols === 1 ? 'column' : 'row',
        overflow: 'hidden',
      }}>
        {/* Preparing Column */}
        <div style={sectionStyle(false)}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: 'clamp(10px, 1.5vw, 20px)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 'clamp(20px, 2.5vw, 36px)' }}>🔥</span>
            <h2 style={{
              margin: 0, fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: '700',
              color: '#fbbf24',
            }}>
              {t('tokenDisplay.preparing')}
            </h2>
            <span style={{
              backgroundColor: '#92400e', color: '#fbbf24', borderRadius: '20px',
              padding: '2px 12px', fontSize: 'clamp(12px, 1.2vw, 16px)', fontWeight: '700',
            }}>
              {preparing.length}
            </span>
          </div>
          {preparing.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 'clamp(14px, 1.5vw, 20px)', textAlign: 'center', marginTop: '40px' }}>
              {t('tokenDisplay.noOrders')}
            </div>
          ) : tokenGrid(preparing, 'preparing')}
        </div>

        {/* Divider */}
        {cols > 1 ? (
          <div style={{ width: '2px', backgroundColor: '#334155', flexShrink: 0 }} />
        ) : (
          <div style={{ height: '2px', backgroundColor: '#334155', flexShrink: 0, margin: '0 16px' }} />
        )}

        {/* Ready Column */}
        <div style={sectionStyle(true)}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: 'clamp(10px, 1.5vw, 20px)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 'clamp(20px, 2.5vw, 36px)' }}>✅</span>
            <h2 style={{
              margin: 0, fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: '700',
              color: '#34d399',
            }}>
              {t('tokenDisplay.ready')}
            </h2>
            <span style={{
              backgroundColor: '#064e3b', color: '#34d399', borderRadius: '20px',
              padding: '2px 12px', fontSize: 'clamp(12px, 1.2vw, 16px)', fontWeight: '700',
            }}>
              {ready.length}
            </span>
          </div>
          {ready.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 'clamp(14px, 1.5vw, 20px)', textAlign: 'center', marginTop: '40px' }}>
              {t('tokenDisplay.noOrders')}
            </div>
          ) : tokenGrid(ready, 'ready')}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(8px, 1vw, 14px) clamp(16px, 2vw, 32px)',
        backgroundColor: '#1e293b', borderTop: '1px solid #334155',
        fontSize: 'clamp(11px, 1vw, 14px)', color: '#64748b',
        flexShrink: 0,
      }}>
        <span>{t('tokenDisplay.poweredBy')}</span>
        <Clock />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes tokenAppear {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes readyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.3); }
          50% { box-shadow: 0 0 20px 8px rgba(52, 211, 153, 0.15); }
        }
        body { margin: 0; padding: 0; overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
    </div>
  );
}

export default function TokenDisplayPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <TokenDisplayContent />
    </Suspense>
  );
}
