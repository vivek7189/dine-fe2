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

// ─── Token Number ───
// Renders just the number in a large, always-visible format. Never truncates.
function TokenNumber({ number, isReady }) {
  return (
    <div style={{
      fontSize: 'clamp(32px, 5vw, 80px)',
      fontWeight: '800',
      lineHeight: 1,
      color: isReady ? '#4ade80' : '#ffffff',
      fontVariantNumeric: 'tabular-nums',
      textShadow: isReady ? '0 0 24px rgba(74,222,128,0.4)' : 'none',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}>
      {number}
    </div>
  );
}

// ─── Token Card ───
function TokenCard({ order, isNew, isReady, settings }) {
  const badge = settings.showOrderType && order.orderType ? order.orderType : null;
  const badgeColors = {
    'dine-in': '#60a5fa',
    'takeaway': '#fbbf24',
    'delivery': '#34d399',
    'online': '#a78bfa',
  };

  return (
    <div style={{
      background: isReady ? 'rgba(22,101,52,0.35)' : 'rgba(255,255,255,0.04)',
      border: isReady ? '2px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: 'clamp(16px, 2vw, 32px) clamp(12px, 1.5vw, 24px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      animation: isNew
        ? 'tokenAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        : (isReady ? 'readyGlow 2.5s ease-in-out infinite' : 'none'),
      transition: 'all 0.3s ease',
    }}>
      <TokenNumber number={order.dailyOrderId} isReady={isReady} />

      {settings.showCustomerName && order.customerName && (
        <div style={{
          fontSize: 'clamp(11px, 1.2vw, 16px)',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {order.customerName}
        </div>
      )}

      {badge && (
        <span style={{
          fontSize: 'clamp(9px, 0.9vw, 12px)',
          fontWeight: '600',
          color: badgeColors[badge] || '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          opacity: 0.8,
        }}>
          {(t(`tokenDisplay.orderTypes.${badge}`) || badge)}
        </span>
      )}
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
      backgroundColor: '#111111', padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#1a1a1a', borderRadius: '24px', padding: '48px 40px',
        width: '100%', maxWidth: '400px', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' }}>
          {t('tokenDisplay.title')}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 28px' }}>
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
              backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              color: '#fff', outline: 'none', boxSizing: 'border-box',
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
              backgroundColor: pin.length >= 4 ? '#dc2626' : '#333',
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

  const [screen, setScreen] = useState('loading');
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

  const [cols, setCols] = useState(2);
  useEffect(() => {
    const handleResize = () => setCols(window.innerWidth < 768 ? 1 : 2);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    if (!restaurantId) { setScreen('error'); setErrorMsg('No restaurant ID provided'); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/token-display/${restaurantId}?pin=`);
        if (res.status === 401) { setScreen('pin'); return; }
        if (res.status === 403) { setScreen('error'); setErrorMsg('Token display is not enabled for this restaurant'); return; }
        if (!res.ok) { setScreen('error'); setErrorMsg('Failed to load token display'); return; }
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

      const prevOrders = ordersRef.current;
      const newReady = (data.orders || []).filter(o =>
        o.status === 'ready' && !prevOrders.find(p => p.id === o.id && p.status === 'ready')
      );
      if (newReady.length > 0 && soundEnabledRef.current) playChime();

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
      if (!snapshot.val()) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchOrders(), 1000);
    };
    onChildAdded(ordersPath, handleSnapshot, (error) => {
      console.error('Token display RTDB error:', error.message);
    });
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      off(ordersPath, 'child_added', handleSnapshot);
    };
  }, [screen, restaurantId, fetchOrders]);

  // ─── Periodic refresh fallback ───
  useEffect(() => {
    if (screen !== 'display') return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [screen, fetchOrders]);

  // ─── Sound toggle ───
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

  // ─── PIN handler ───
  const handlePinSuccess = (enteredPin, data) => {
    setPin(enteredPin);
    setRestaurant(data.restaurant);
    setSettings(data.settings);
    setScreen('display');
    setTimeout(() => {
      fetch(`${API_BASE_URL}/api/public/token-display/${restaurantId}?pin=${encodeURIComponent(enteredPin)}`)
        .then(r => r.json())
        .then(d => { if (d.orders) setOrders(d.orders); })
        .catch(() => {});
    }, 100);
  };

  // ─── Non-display screens ───
  const bgColor = '#111111';
  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor }}>
        <div style={{ color: '#555', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }
  if (screen === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor, padding: '20px' }}>
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

  return (
    <div style={{
      minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#111111', color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        backgroundColor: '#161616',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {restaurant?.logo && (
            <img src={restaurant.logo} alt="" style={{
              width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover',
            }} />
          )}
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
            {restaurant?.name || 'Restaurant'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '600', letterSpacing: '1px',
            textTransform: 'uppercase', color: '#666',
          }}>
            {t('tokenDisplay.title')}
          </span>
          <button
            onClick={toggleSound}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              padding: '5px 10px', cursor: 'pointer',
              color: soundEnabled ? '#4ade80' : '#444',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
            {cols > 1 && <span style={{ fontSize: '12px' }}>{soundEnabled ? t('tokenDisplay.soundOn') : t('tokenDisplay.soundOff')}</span>}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: cols === 1 ? 'column' : 'row',
        overflow: 'hidden',
      }}>
        {/* ── Preparing Section ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '20px 24px', overflow: 'auto', minWidth: 0,
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '16px', flexShrink: 0,
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: '#f59e0b',
              boxShadow: '0 0 8px rgba(245,158,11,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <h2 style={{
              margin: 0, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: '700',
              color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              {t('tokenDisplay.preparing')}
            </h2>
            <span style={{
              backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b',
              borderRadius: '12px', padding: '2px 10px',
              fontSize: '13px', fontWeight: '700',
            }}>
              {preparing.length}
            </span>
          </div>

          {preparing.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#333', fontSize: '16px',
            }}>
              {t('tokenDisplay.noOrders')}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '12px',
              alignContent: 'flex-start',
            }}>
              {preparing.map(order => (
                <TokenCard
                  key={order.id}
                  order={order}
                  isReady={false}
                  isNew={newTokenIds.has(order.id)}
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        {cols > 1 ? (
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
        ) : (
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0, margin: '0 24px' }} />
        )}

        {/* ── Ready Section ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '20px 24px', overflow: 'auto', minWidth: 0,
          backgroundColor: 'rgba(22,101,52,0.08)',
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '16px', flexShrink: 0,
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px rgba(34,197,94,0.5)',
            }} />
            <h2 style={{
              margin: 0, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: '700',
              color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              {t('tokenDisplay.ready')}
            </h2>
            <span style={{
              backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e',
              borderRadius: '12px', padding: '2px 10px',
              fontSize: '13px', fontWeight: '700',
            }}>
              {ready.length}
            </span>
          </div>

          {ready.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#333', fontSize: '16px',
            }}>
              {t('tokenDisplay.noOrders')}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '12px',
              alignContent: 'flex-start',
            }}>
              {ready.map(order => (
                <TokenCard
                  key={order.id}
                  order={order}
                  isReady={true}
                  isNew={newTokenIds.has(order.id)}
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 24px',
        backgroundColor: '#161616',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '12px', color: '#444',
        flexShrink: 0,
      }}>
        <span>{t('tokenDisplay.poweredBy')}</span>
        <Clock />
      </div>

      <style>{`
        @keyframes tokenAppear {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes readyGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
          50% { box-shadow: 0 0 24px 4px rgba(74,222,128,0.15); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        body { margin: 0; padding: 0; overflow: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>
    </div>
  );
}

export default function TokenDisplayPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' }}>
        <div style={{ color: '#555', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <TokenDisplayContent />
    </Suspense>
  );
}
