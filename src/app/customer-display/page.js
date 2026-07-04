'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createDisplayReceiver } from '@/lib/displaySync';
import apiClient from '@/lib/api';

// ─── Suspense Wrapper (required for useSearchParams in Next.js 15) ──────────

export default function CustomerDisplayPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }} />}>
      <CustomerDisplayContent />
    </Suspense>
  );
}

// ─── Main Content ───────────────────────────────────────────────────────────

function CustomerDisplayContent() {
  const searchParams = useSearchParams();
  const [displayData, setDisplayData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storeInfo, setStoreInfo] = useState({ name: '', logo: '' });
  const [offers, setOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [offerTransition, setOfferTransition] = useState(true);
  const [lastItemKey, setLastItemKey] = useState(null);
  const receiverRef = useRef(null);

  const storeId = searchParams.get('store') || (typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch restaurant info + offers
  useEffect(() => {
    if (!storeId) return;

    const storedRest = localStorage.getItem('selectedRestaurant');
    if (storedRest) {
      try {
        const r = JSON.parse(storedRest);
        setStoreInfo(prev => ({ ...prev, name: r.name || '' }));
      } catch {}
    }

    apiClient.getPrintSettings(storeId).then(settings => {
      if (settings?.receiptLogo?.url || settings?.receiptLogoUrl) {
        setStoreInfo(prev => ({ ...prev, logo: settings.receiptLogo?.url || settings.receiptLogoUrl }));
      }
    }).catch(() => {});

    apiClient.getActiveOffers(storeId).then(data => {
      const active = Array.isArray(data) ? data.filter(o => o.isActive) : (data?.offers || []).filter(o => o.isActive);
      setOffers(active.slice(0, 10));
    }).catch(() => {});
  }, [storeId]);

  // Offer carousel
  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => {
      setOfferTransition(false);
      setTimeout(() => {
        setCurrentOfferIndex(prev => (prev + 1) % offers.length);
        setOfferTransition(true);
      }, 150);
    }, 5000);
    return () => clearInterval(timer);
  }, [offers.length]);

  // Display data receiver
  useEffect(() => {
    if (!storeId) return;
    receiverRef.current = createDisplayReceiver(storeId, (data) => {
      setDisplayData(data);
      if (data.lastAddedItem) {
        setLastItemKey(data.lastAddedItem.name + '-' + Date.now());
      }
      if (data.storeName) {
        setStoreInfo(prev => ({
          name: data.storeName || prev.name,
          logo: data.storeLogo || prev.logo,
        }));
      }
    });
    return () => { if (receiverRef.current) receiverRef.current.close(); };
  }, [storeId]);

  // Clear highlight after 2s
  useEffect(() => {
    if (!lastItemKey) return;
    const t = setTimeout(() => setLastItemKey(null), 2000);
    return () => clearTimeout(t);
  }, [lastItemKey]);

  // Auto-return to idle after completed screen
  useEffect(() => {
    if (displayData?.status === 'completed') {
      const t = setTimeout(() => setDisplayData(null), 8000);
      return () => clearTimeout(t);
    }
  }, [displayData?.status]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    const symbol = displayData?.currencySymbol || '₹';
    return `${symbol}${num.toFixed(2)}`;
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const storeName = storeInfo.name || displayData?.storeName || 'DineOpen';
  const storeLogo = storeInfo.logo || displayData?.storeLogo || '';

  const isIdle = !displayData || displayData.status === 'idle' || (!displayData.items?.length && displayData.status !== 'completed');
  const isCompleted = displayData?.status === 'completed';
  const isPayment = displayData?.status === 'payment';

  if (isCompleted) {
    return (
      <>
        <Animations />
        <CompletedScreen storeName={storeName} storeLogo={storeLogo} customerName={displayData.customerName} currentTime={currentTime} formatTime={formatTime} formatDate={formatDate} formatCurrency={formatCurrency} total={displayData.total} tableNumber={displayData.tableNumber} />
      </>
    );
  }

  if (isIdle) {
    return (
      <>
        <Animations />
        <IdleScreen storeName={storeName} storeLogo={storeLogo} currentTime={currentTime} formatTime={formatTime} formatDate={formatDate} offers={offers} currentOfferIndex={currentOfferIndex} offerTransition={offerTransition} formatCurrency={formatCurrency} />
      </>
    );
  }

  return (
    <>
      <Animations />
      <ActiveOrderScreen
        displayData={displayData}
        storeName={storeName}
        storeLogo={storeLogo}
        currentTime={currentTime}
        formatTime={formatTime}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        isPayment={isPayment}
        lastItemKey={lastItemKey}
      />
    </>
  );
}

// ─── Logo Component ─────────────────────────────────────────────────────────

function StoreLogo({ src, name, size = 56 }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, fontWeight: '700', color: '#0f172a',
    }}>
      {(name || 'D').charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Idle Screen ────────────────────────────────────────────────────────────

function IdleScreen({ storeName, storeLogo, currentTime, formatTime, formatDate, offers, currentOfferIndex, offerTransition, formatCurrency }) {
  return (
    <div style={S.container}>
      <div style={S.timeCorner}>
        <div style={S.timeText}>{formatTime(currentTime)}</div>
        <div style={S.dateText}>{formatDate(currentTime)}</div>
      </div>

      <div style={S.idleCenter}>
        <StoreLogo src={storeLogo} name={storeName} size={120} />
        <h1 style={S.idleStoreName}>{storeName}</h1>

        {offers.length > 0 ? (
          <div style={S.promoContainer}>
            <div style={{ ...S.promoCard, opacity: offerTransition ? 1 : 0, transform: offerTransition ? 'translateY(0)' : 'translateY(12px)' }}>
              <div style={S.promoTag}>
                {offers[currentOfferIndex]?.discountType === 'percentage'
                  ? `${offers[currentOfferIndex]?.discountValue}% OFF`
                  : `${formatCurrency(offers[currentOfferIndex]?.discountValue)} OFF`}
              </div>
              <div style={S.promoName}>{offers[currentOfferIndex]?.name}</div>
              {offers[currentOfferIndex]?.description && (
                <div style={S.promoDesc}>{offers[currentOfferIndex].description}</div>
              )}
              {offers[currentOfferIndex]?.minOrderValue > 0 && (
                <div style={S.promoMin}>Min. order {formatCurrency(offers[currentOfferIndex].minOrderValue)}</div>
              )}
            </div>

            {offers.length > 1 && (
              <div style={S.promoDots}>
                {offers.map((_, i) => (
                  <div key={i} style={{ ...S.promoDot, backgroundColor: i === currentOfferIndex ? '#f59e0b' : '#475569' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={S.welcomeText}>Welcome</p>
        )}
      </div>

      <div style={S.footerBar}>
        <span style={S.footerText}>Powered by DineOpen</span>
      </div>
    </div>
  );
}

// ─── Active Order Screen ────────────────────────────────────────────────────

function ActiveOrderScreen({ displayData, storeName, storeLogo, currentTime, formatTime, formatDate, formatCurrency, isPayment, lastItemKey }) {
  const items = displayData?.items || [];
  const itemListRef = useRef(null);

  useEffect(() => {
    if (itemListRef.current) {
      itemListRef.current.scrollTop = itemListRef.current.scrollHeight;
    }
  }, [items.length]);

  return (
    <div style={{ ...S.container, opacity: isPayment ? 0.6 : 1, transition: 'opacity 0.4s' }}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <StoreLogo src={storeLogo} name={storeName} size={48} />
          <div>
            <h1 style={S.headerStoreName}>{storeName}</h1>
            {displayData.tableNumber && (
              <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: '500' }}>Table: {displayData.tableNumber}</div>
            )}
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.timeText}>{formatTime(currentTime)}</div>
          <div style={S.dateText}>{formatDate(currentTime)}</div>
        </div>
      </div>

      {displayData.customerName && (
        <div style={S.customerBar}>
          <span style={S.customerIcon}>&#128100;</span>
          <span>{displayData.customerName}</span>
        </div>
      )}

      <div style={S.itemsSection}>
        <div style={S.itemsTableHeader}>
          <span style={S.colName}>Item</span>
          <span style={S.colQty}>Qty</span>
          <span style={S.colPrice}>Price</span>
          <span style={S.colTotal}>Total</span>
        </div>
        <div style={S.itemsList} ref={itemListRef}>
          {items.map((item, i) => {
            const isLast = displayData.lastAddedItem && item.name === displayData.lastAddedItem.name && lastItemKey;
            return (
              <div
                key={`${item.name}-${i}`}
                className={isLast ? 'item-highlight' : ''}
                style={{
                  ...S.itemRow,
                  backgroundColor: i % 2 === 0 ? '#1e293b' : '#253349',
                  ...(isLast ? { boxShadow: 'inset 0 0 0 2px #4ade80', backgroundColor: '#1a3a2a' } : {}),
                }}
              >
                <span style={S.itemName}>{item.name}</span>
                <span style={S.itemQty}>&times;{item.quantity}</span>
                <span style={S.itemUnitPrice}>{formatCurrency(item.unitPrice)}</span>
                <span style={S.itemLineTotal}>{formatCurrency(item.lineTotal)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={S.totalsPanel}>
        <div style={S.totalRow}>
          <span style={S.totalLabel}>Subtotal ({items.reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
          <span style={S.totalValue}>{formatCurrency(displayData.subtotal)}</span>
        </div>
        {(displayData.discount || 0) > 0 && (
          <div style={S.totalRow}>
            <span style={{ ...S.totalLabel, color: '#4ade80' }}>Discount</span>
            <span style={{ ...S.totalValue, color: '#4ade80' }}>-{formatCurrency(displayData.discount)}</span>
          </div>
        )}
        {(displayData.tax || 0) > 0 && (
          <div style={S.totalRow}>
            <span style={S.totalLabel}>Tax</span>
            <span style={S.totalValue}>{formatCurrency(displayData.tax)}</span>
          </div>
        )}
        <div style={S.grandTotalRow}>
          <span style={S.grandTotalLabel}>TOTAL</span>
          <span style={S.grandTotalValue}>{formatCurrency(displayData.total)}</span>
        </div>
      </div>

      {isPayment && <PaymentOverlay paymentMethod={displayData.paymentMethod} />}
    </div>
  );
}

// ─── Payment Overlay ────────────────────────────────────────────────────────

function PaymentOverlay({ paymentMethod }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500);
    return () => clearInterval(t);
  }, []);

  const methodLabel = {
    cash: 'Cash', card: 'Card', upi: 'UPI', check: 'Cheque', credit: 'Credit',
  }[paymentMethod?.toLowerCase()] || paymentMethod || 'Payment';

  return (
    <div style={S.paymentOverlay} className="payment-fade-in">
      <div style={S.paymentCard}>
        <div className="payment-pulse" style={S.paymentPulse} />
        <div style={S.paymentTitle}>Processing {methodLabel}{dots}</div>
        <div style={S.paymentSub}>Please wait...</div>
      </div>
    </div>
  );
}

// ─── Completed Screen ───────────────────────────────────────────────────────

function CompletedScreen({ storeName, storeLogo, customerName, currentTime, formatTime, formatDate, formatCurrency, total, tableNumber }) {
  return (
    <div style={S.container}>
      <div style={S.timeCorner}>
        <div style={S.timeText}>{formatTime(currentTime)}</div>
        <div style={S.dateText}>{formatDate(currentTime)}</div>
      </div>

      <div style={S.completedCenter}>
        <div className="checkmark-pop" style={S.checkCircle}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path className="checkmark-draw" d="M15 30 L26 41 L45 19" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <h1 style={S.thankYouTitle}>
          Thank You{customerName ? `, ${customerName}` : ''}!
        </h1>

        {total > 0 && (
          <div style={S.completedTotal}>
            <span style={S.completedTotalLabel}>Amount Paid</span>
            <span style={S.completedTotalValue}>{formatCurrency(total)}</span>
          </div>
        )}

        <p style={S.completedSub}>Payment Successful</p>

        <div style={S.completedStoreLine}>
          <StoreLogo src={storeLogo} name={storeName} size={36} />
          <span style={S.completedStoreText}>Visit us again at {storeName}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CSS Animations ─────────────────────────────────────────────────────────

function Animations() {
  return (
    <style>{`
      .checkmark-pop {
        animation: checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
      }
      @keyframes checkPop {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
      .checkmark-draw {
        stroke-dasharray: 60;
        stroke-dashoffset: 60;
        animation: drawCheck 0.5s 0.3s ease forwards;
      }
      @keyframes drawCheck {
        to { stroke-dashoffset: 0; }
      }
      .payment-pulse {
        animation: pulseRing 1.8s ease-in-out infinite;
      }
      @keyframes pulseRing {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.3; }
      }
      .payment-fade-in {
        animation: fadeUp 0.4s ease both;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .item-highlight {
        animation: itemGlow 2s ease both;
      }
      @keyframes itemGlow {
        0% { background-color: #166534 !important; }
        100% { background-color: inherit !important; }
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      body { margin: 0; padding: 0; overflow: hidden; }
    `}</style>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const S = {
  container: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', maxHeight: '100vh',
    backgroundColor: '#0f172a', color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
  },
  timeCorner: { position: 'absolute', top: 20, right: 24, textAlign: 'right', zIndex: 2 },
  timeText: { fontSize: 18, fontWeight: '600', color: '#e2e8f0', lineHeight: '1.3' },
  dateText: { fontSize: 13, color: '#94a3b8' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 14, borderBottom: '1px solid #334155', marginBottom: 12, flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerStoreName: { fontSize: 24, fontWeight: '700', color: '#f59e0b', margin: 0 },
  headerRight: { textAlign: 'right' },
  customerBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 16, color: '#cbd5e1', marginBottom: 10, flexShrink: 0,
  },
  customerIcon: { fontSize: 18 },
  itemsSection: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 12 },
  itemsTableHeader: {
    display: 'flex', padding: '10px 16px', backgroundColor: '#334155',
    borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: 14, color: '#94a3b8', flexShrink: 0,
  },
  colName: { flex: 1 },
  colQty: { width: 60, textAlign: 'center' },
  colPrice: { width: 100, textAlign: 'right' },
  colTotal: { width: 110, textAlign: 'right' },
  itemsList: { flex: 1, overflowY: 'auto', borderRadius: '0 0 8px 8px' },
  itemRow: {
    display: 'flex', alignItems: 'center', padding: '14px 16px',
    fontSize: 20, fontWeight: '500', transition: 'background-color 0.5s ease',
  },
  itemName: { flex: 1, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 },
  itemQty: { width: 60, textAlign: 'center', color: '#cbd5e1', fontWeight: '600' },
  itemUnitPrice: { width: 100, textAlign: 'right', color: '#94a3b8', fontSize: 16 },
  itemLineTotal: { width: 110, textAlign: 'right', color: '#f59e0b', fontWeight: '700' },
  totalsPanel: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: '16px 20px',
    borderTop: '2px solid #334155', flexShrink: 0,
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 18 },
  totalLabel: { color: '#94a3b8' },
  totalValue: { color: '#e2e8f0', fontWeight: '500' },
  grandTotalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, marginTop: 10, borderTop: '2px solid #475569',
  },
  grandTotalLabel: { fontSize: 26, fontWeight: '700', color: '#f8fafc' },
  grandTotalValue: { fontSize: 38, fontWeight: '800', color: '#f59e0b' },
  paymentOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10,
  },
  paymentCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 64px', backgroundColor: '#1e293b',
    borderRadius: 20, border: '2px solid #3b82f6',
    boxShadow: '0 0 60px rgba(59, 130, 246, 0.3)',
  },
  paymentPulse: {
    width: 24, height: 24, borderRadius: '50%', backgroundColor: '#3b82f6', marginBottom: 24,
  },
  paymentTitle: { fontSize: 32, fontWeight: '700', color: '#93c5fd', marginBottom: 8 },
  paymentSub: { fontSize: 18, color: '#64748b' },
  idleCenter: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 20,
  },
  idleStoreName: { fontSize: 44, fontWeight: '700', color: '#f59e0b', margin: 0, textAlign: 'center' },
  welcomeText: { fontSize: 32, color: '#94a3b8', fontWeight: '300' },
  promoContainer: {
    marginTop: 20, width: '100%', maxWidth: 500,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  promoCard: {
    width: '100%', padding: '28px 32px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid #334155', borderRadius: 16, textAlign: 'center',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  promoTag: {
    display: 'inline-block', padding: '6px 20px',
    backgroundColor: '#f59e0b', color: '#0f172a',
    borderRadius: 20, fontSize: 18, fontWeight: '800', marginBottom: 14,
    letterSpacing: '0.5px',
  },
  promoName: { fontSize: 22, fontWeight: '600', color: '#f1f5f9', marginBottom: 6 },
  promoDesc: { fontSize: 16, color: '#94a3b8', marginBottom: 4 },
  promoMin: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
  promoDots: { display: 'flex', gap: 8, marginTop: 16 },
  promoDot: { width: 8, height: 8, borderRadius: '50%', transition: 'background-color 0.3s' },
  completedCenter: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  checkCircle: {
    width: 100, height: 100, borderRadius: '50%',
    border: '3px solid #4ade80', display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  thankYouTitle: { fontSize: 40, fontWeight: '700', color: '#f8fafc', margin: 0, textAlign: 'center' },
  completedTotal: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 32px', backgroundColor: '#1e293b', borderRadius: 12, margin: '8px 0',
  },
  completedTotalLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  completedTotalValue: { fontSize: 36, fontWeight: '800', color: '#f59e0b' },
  completedSub: { fontSize: 22, color: '#4ade80', margin: '4px 0 20px' },
  completedStoreLine: { display: 'flex', alignItems: 'center', gap: 12 },
  completedStoreText: { fontSize: 18, color: '#64748b' },
  footerBar: { textAlign: 'center', paddingTop: 12, flexShrink: 0 },
  footerText: { fontSize: 12, color: '#334155' },
};
