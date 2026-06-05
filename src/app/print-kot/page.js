'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// import Pusher from 'pusher-js'; // COMMENTED OUT — replaced by Firebase RTDB
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../firebase';
import { printDocument } from '../../utils/printBridge';
import { isWeb } from '../../utils/platform';
import { renderKOT } from '../../utils/printTemplates/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
// const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec'; // COMMENTED OUT — replaced by Firebase RTDB
// const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2'; // COMMENTED OUT — replaced by Firebase RTDB

// KOT Receipt Component - Styled for 80mm thermal printer
const KOTReceipt = ({ order, restaurantName, onPrint, isPrinting, kotUpdatePrintMode }) => {
  const receiptRef = useRef(null);

  // Determine if this order has been updated (items changed since original order)
  // Check item flags directly — don't rely solely on needsReprint which can be false for first-time prints
  const hasItemChanges = order.items?.some(i => i.isNew || i.isUpdated) || (order.removedItems?.length > 0);
  const isUpdateReprint = hasItemChanges && (order.updateHistory?.length > 0 || order.needsReprint);
  const removedItems = order.removedItems || [];
  const newItems = isUpdateReprint ? order.items.filter(i => i.isNew) : [];
  const updatedItemsInc = isUpdateReprint ? order.items.filter(i => i.isUpdated && i.quantityDelta > 0) : [];
  const updatedItemsDec = isUpdateReprint ? order.items.filter(i => i.isUpdated && i.quantityDelta < 0) : [];
  const unchangedItems = isUpdateReprint ? order.items.filter(i => !i.isNew && !i.isUpdated) : order.items;
  const hasChanges = newItems.length > 0 || updatedItemsInc.length > 0 || updatedItemsDec.length > 0 || removedItems.length > 0;

  // In delta mode for updates: only show changed items. In detailed mode: show everything with markings.
  const useDeltaMode = kotUpdatePrintMode !== 'detailed';
  const showFullOrder = !isUpdateReprint || !useDeltaMode;

  const renderItemRow = (item, index, { showDelta, isRemoved } = {}) => {
    const displayQty = showDelta && item.quantityDelta != null ? Math.abs(item.quantityDelta) : (isRemoved ? (item.previousQuantity || item.quantity) : item.quantity);
    const label = isRemoved ? ' [CANCEL]' : (showDelta && item.quantityDelta > 0 ? ' [+NEW]' : '');
    return (
      <div key={index} className="item-row" style={isRemoved ? { textDecoration: 'line-through' } : {}}>
        <div className="item-main">
          <span className="item-qty">{displayQty}x</span>
          <span className="item-name">{item.name}{label}</span>
        </div>
        {item.variant && <div className="item-variant">  [{item.variant}]</div>}
        {item.selectedVariant?.name && <div className="item-variant">  [{item.selectedVariant.name}]</div>}
        {(item.customizations || []).map((c, i) => <div key={i} className="customization">  + {c.name || c}</div>)}
        {(item.selectedCustomizations || []).map((c, i) => <div key={i} className="customization">  + {c.name || c}</div>)}
        {item.notes && <div className="item-notes">  Note: {item.notes}</div>}
      </div>
    );
  };

  return (
    <div className="kot-receipt-wrapper">
      <div ref={receiptRef} className="kot-receipt" id={`receipt-${order.id}`}>
        {/* Header */}
        <div className="receipt-header">
          <div className="restaurant-name">{restaurantName}</div>
          <div className="receipt-title">{isUpdateReprint && hasChanges ? '--- KOT UPDATE ---' : '--- KITCHEN ORDER ---'}</div>
        </div>

        {/* Order Info - Two Column Layout */}
        <div className="receipt-info">
          <div className="info-grid">
            <div className="info-cell">
              <span>Order#:</span>
              <span className="bold">{order.dailyOrderId || order.kotId}</span>
            </div>
            {order.tableNumber && (
              <div className="info-cell">
                <span>Table:</span>
                <span className="bold">{order.tableNumber}</span>
              </div>
            )}
            {order.roomNumber && (
              <div className="info-cell">
                <span>Room:</span>
                <span className="bold">{order.roomNumber}</span>
              </div>
            )}
            <div className="info-cell">
              <span>Time:</span>
              <span className="bold">{order.formattedTime}</span>
            </div>
            <div className="info-cell">
              <span>Date:</span>
              <span className="bold">{order.formattedDate}</span>
            </div>
            {order.staffInfo?.waiterName && (
              <div className="info-cell">
                <span>Waiter:</span>
                <span className="bold">{order.staffInfo.waiterName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="receipt-divider">--------------------------------</div>

        {/* Items */}
        <div className="receipt-items">
          <div className="items-header">
            <span>QTY</span>
            <span>ITEM</span>
          </div>
          <div className="receipt-divider">--------------------------------</div>

          {isUpdateReprint && hasChanges ? (
            <>
              {/* Detailed mode: show unchanged items first */}
              {showFullOrder && unchangedItems.map((item, index) => renderItemRow(item, index))}
              {showFullOrder && unchangedItems.length > 0 && (removedItems.length > 0 || newItems.length > 0 || updatedItemsInc.length > 0 || updatedItemsDec.length > 0) && (
                <div className="receipt-divider">- - - - - - - - - - - - - - - -</div>
              )}
              {/* Cancelled / removed items */}
              {removedItems.length > 0 && (
                <>
                  <div className="item-row" style={{ fontWeight: 'bold', textAlign: 'center' }}>*** CANCELLED ***</div>
                  {removedItems.map((item, index) => renderItemRow(item, `rem-${index}`, { isRemoved: true }))}
                </>
              )}
              {/* Reduced quantity items */}
              {updatedItemsDec.length > 0 && (
                <>
                  <div className="item-row" style={{ fontWeight: 'bold', textAlign: 'center' }}>*** REDUCED ***</div>
                  {updatedItemsDec.map((item, index) => renderItemRow(item, `dec-${index}`, { showDelta: true, isRemoved: true }))}
                </>
              )}
              {/* New items added */}
              {(newItems.length > 0 || updatedItemsInc.length > 0) && (
                <>
                  <div className="item-row" style={{ fontWeight: 'bold', textAlign: 'center' }}>*** NEW ITEMS ***</div>
                  {updatedItemsInc.map((item, index) => renderItemRow(item, `inc-${index}`, { showDelta: true }))}
                  {newItems.map((item, index) => renderItemRow(item, `new-${index}`))}
                </>
              )}
            </>
          ) : (
            // Normal order or no changes — print all items as usual
            order.items.map((item, index) => renderItemRow(item, index))
          )}
        </div>

        <div className="receipt-divider">--------------------------------</div>

        {/* Footer */}
        <div className="receipt-footer">
          <div className="total-items">
            {isUpdateReprint && hasChanges && useDeltaMode
              ? `Changes: +${newItems.length + updatedItemsInc.length} new, ${removedItems.length + updatedItemsDec.length} removed`
              : `Total Items: ${order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}`
            }
          </div>
          {order.specialInstructions && (
            <div className="special-instructions">
              <strong>*** SPECIAL INSTRUCTIONS ***</strong>
              <div>{order.specialInstructions}</div>
            </div>
          )}
          {order.notes && (
            <div className="order-notes">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}
        </div>

        <div className="receipt-divider">================================</div>
      </div>

      {/* Print Button */}
      <button
        className="print-button"
        onClick={() => onPrint(order)}
        disabled={isPrinting}
      >
        {isPrinting ? 'Printing...' : 'Reprint'}
      </button>
    </div>
  );
};

// Main Print KOT Page Content
const PrintKOTContent = () => {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant') || searchParams.get('restaurantId') || '';

  const [orders, setOrders] = useState([]);
  const [printedOrders, setPrintedOrders] = useState([]);
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [isPolling, setIsPolling] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printQueue, setPrintQueue] = useState([]);
  const [stats, setStats] = useState({ total: 0, printed: 0 });
  const [kotUpdatePrintMode, setKotUpdatePrintMode] = useState('delta'); // 'delta' or 'detailed'
  const [printSettingsState, setPrintSettingsState] = useState({}); // Full print settings from API

  const pollingIntervalRef = useRef(null);
  const printFrameRef = useRef(null);
  const kotUpdatePrintModeRef = useRef('delta'); // ref for use inside printOrder callback
  const printSettingsRef = useRef({}); // ref for use inside printOrder callback

  // Load printed orders from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`printedKOT_${restaurantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPrintedOrders(parsed);
        } catch (e) {
          console.error('Error parsing stored printed orders:', e);
        }
      }
    }
  }, [restaurantId]);

  // Save printed orders to localStorage
  const savePrintedOrder = useCallback((orderId) => {
    if (typeof window !== 'undefined') {
      const updated = [...printedOrders, orderId];
      setPrintedOrders(updated);
      localStorage.setItem(`printedKOT_${restaurantId}`, JSON.stringify(updated));
    }
  }, [printedOrders, restaurantId]);

  // Fetch restaurant info
  useEffect(() => {
    if (!restaurantId) return;

    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/restaurant/info/${restaurantId}`);
        const data = await response.json();
        if (data.success && data.restaurant) {
          setRestaurantName(data.restaurant.name);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Print function - creates printable content and triggers print
  const printOrder = useCallback(async (order) => {
    setIsPrinting(true);

    // Determine if this is an update reprint
    const hasItemChanges = order.items?.some(i => i.isNew || i.isUpdated) || ((order.removedItems || []).length > 0);
    const isUpdateReprint = hasItemChanges && (order.updateHistory?.length > 0 || order.needsReprint);

    // Build kotData in the format expected by the template system
    const kotData = {
      restaurantName: restaurantName,
      restaurantPhone: order.restaurantPhone || '',
      orderId: order.kotId || order.id,
      dailyOrderId: order.dailyOrderId || order.kotId,
      tableNumber: order.tableNumber || '',
      roomNumber: order.roomNumber || '',
      floorName: order.floorName || '',
      customerName: order.customerName || '',
      orderType: order.orderType || '',
      waiterName: order.staffInfo?.waiterName || order.waiterName || '',
      specialInstructions: order.specialInstructions || order.notes || '',
      items: order.items || [],
      removedItems: order.removedItems || [],
      isIncremental: isUpdateReprint,
      currencySymbol: order.currencySymbol || '',
    };

    try {
      // Generate print HTML using the template system
      const pSettings = printSettingsRef.current || {};
      const templateHtml = renderKOT(kotData, pSettings, {});

      // Add print trigger script for web iframe printing
      const printContent = templateHtml.replace('</body>', `
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.parent.postMessage({ type: 'printComplete', orderId: '${order.id}' }, '*');
              };
            };
          </script>
        </body>`);

      if (!isWeb()) {
        // Native (Capacitor/Tauri): send HTML directly to thermal printer
        await printDocument({ html: printContent, type: 'kot' });
      } else {
        // Web: use hidden iframe approach (unchanged)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '80mm';
        iframe.style.height = '0';
        document.body.appendChild(iframe);

        iframe.contentDocument.open();
        iframe.contentDocument.write(printContent);
        iframe.contentDocument.close();

        // Remove iframe after print
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }

      // Mark as printed in API
      try {
        await fetch(`${API_BASE_URL}/api/kot/${order.id}/printed`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printedAt: new Date().toISOString(),
            printedBy: 'kiosk'
          })
        });
      } catch (apiErr) {
        console.error('Error marking order as printed:', apiErr);
      }

      // Save to local storage
      savePrintedOrder(order.id);
      setIsPrinting(false);

    } catch (err) {
      console.error('Print error:', err);
      setIsPrinting(false);
    }
  }, [restaurantName, savePrintedOrder]);

  // Process print queue
  useEffect(() => {
    if (printQueue.length > 0 && !isPrinting) {
      const nextOrder = printQueue[0];
      setPrintQueue(prev => prev.slice(1));
      printOrder(nextOrder);
    }
  }, [printQueue, isPrinting, printOrder]);

  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/kot/pending-print/${restaurantId}`);
      const data = await response.json();

      if (data.success && data.orders) {
        // Update print settings from server
        if (data.printSettings) {
          setPrintSettingsState(data.printSettings);
          printSettingsRef.current = data.printSettings;
          if (data.printSettings.kotUpdatePrintMode) {
            const mode = data.printSettings.kotUpdatePrintMode;
            setKotUpdatePrintMode(mode);
            kotUpdatePrintModeRef.current = mode;
          }
        }

        // Filter out already printed orders (from localStorage)
        const newOrders = data.orders.filter(
          order => !printedOrders.includes(order.id)
        );

        // Find truly new orders (not in current orders list)
        const currentOrderIds = orders.map(o => o.id);
        const brandNewOrders = newOrders.filter(
          order => !currentOrderIds.includes(order.id)
        );

        // Add brand new orders to print queue for auto-print
        if (brandNewOrders.length > 0) {
          console.log(`🖨️ New orders to print: ${brandNewOrders.length}`);
          setPrintQueue(prev => [...prev, ...brandNewOrders]);

          // Play notification sound
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }

        setOrders(newOrders);
        setStats({
          total: data.count,
          printed: printedOrders.length
        });
      }

      setLastCheck(new Date().toLocaleTimeString());
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Retrying...');
    }
  }, [restaurantId, printedOrders, orders]);

  // Start/stop polling
  const togglePolling = useCallback(() => {
    if (isPolling) {
      clearInterval(pollingIntervalRef.current);
      setIsPolling(false);
    } else {
      fetchPendingOrders(); // Fetch immediately
      pollingIntervalRef.current = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        fetchPendingOrders();
      }, 300_000); // 5-min fallback (Firebase RTDB is primary)
      setIsPolling(true);
    }
  }, [isPolling, fetchPendingOrders]);

  // Firebase RTDB real-time subscription + 60s fallback poll
  useEffect(() => {
    if (!restaurantId || !database) return;

    // Initial fetch
    fetchPendingOrders();

    // Start 5-min fallback poll (safety net — Firebase RTDB is primary)
    pollingIntervalRef.current = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchPendingOrders();
    }, 300_000);
    setIsPolling(true);

    // Subscribe to Firebase RTDB for real-time order notifications
    const now = Date.now();
    const eventsRef = query(
      ref(database, `events/${restaurantId}/kot`),
      orderByChild('ts'),
      startAt(now)
    );

    const handleOrderEvent = () => {
      fetchPendingOrders();
    };

    const handler = (snapshot) => {
      const event = snapshot.val();
      if (!event) return;
      // React to order-related KOT events
      if (['order-created', 'order-status-updated', 'order-updated'].includes(event.type)) {
        handleOrderEvent();
      }
    };

    onChildAdded(eventsRef, handler);

    console.log(`Firebase RTDB: KOT Printer subscribed to events/${restaurantId}/kot`);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      off(eventsRef, 'child_added', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // Clear printed history
  const clearPrintHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`printedKOT_${restaurantId}`);
      setPrintedOrders([]);
    }
  };

  if (!restaurantId) {
    return (
      <div className="kot-print-page">
        <div className="error-container">
          <h2>Restaurant ID Required</h2>
          <p>Please add ?restaurant=YOUR_RESTAURANT_ID to the URL</p>
          <p className="example">Example: /print-kot?restaurant=abc123</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="kot-print-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <h1>KOT Printer</h1>
          <span className="restaurant-badge">{restaurantName}</span>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <span className={`status-dot ${isPolling ? 'active' : 'inactive'}`}></span>
            <span>{isPolling ? 'Auto-printing ON' : 'Paused'}</span>
          </div>
          <button
            className={`control-button ${isPolling ? 'stop' : 'start'}`}
            onClick={togglePolling}
          >
            {isPolling ? 'Pause' : 'Start'}
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">In Queue</span>
          <span className="stat-value">{printQueue.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last Check</span>
          <span className="stat-value">{lastCheck || '--:--'}</span>
        </div>
        <button className="clear-button" onClick={clearPrintHistory}>
          Clear History
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Printing Indicator */}
      {isPrinting && (
        <div className="printing-indicator">
          <div className="spinner"></div>
          <span>Printing...</span>
        </div>
      )}

      {/* Orders List */}
      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🖨️</div>
            <h3>No pending orders</h3>
            <p>New orders will appear here and print automatically</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <KOTReceipt
                key={order.id}
                order={order}
                restaurantName={restaurantName}
                onPrint={printOrder}
                isPrinting={isPrinting}
                kotUpdatePrintMode={kotUpdatePrintMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print Frame (hidden) */}
      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="print-frame"
      />

      <style jsx>{styles}</style>
      <style jsx global>{globalStyles}</style>
    </div>
  );
};

// Styles
const styles = `
  .kot-print-page {
    min-height: 100vh;
    background: #1a1a2e;
    color: #fff;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #16213e;
    border-bottom: 1px solid #0f3460;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-left h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  .restaurant-badge {
    background: #e94560;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .status-dot.active {
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    animation: pulse 2s infinite;
  }

  .status-dot.inactive {
    background: #6b7280;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .control-button {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-button.start {
    background: #4ade80;
    color: #000;
  }

  .control-button.stop {
    background: #ef4444;
    color: #fff;
  }

  .stats-bar {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 12px 24px;
    background: #0f3460;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 600;
  }

  .clear-button {
    margin-left: auto;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #4b5563;
    border-radius: 6px;
    color: #9ca3af;
    font-size: 13px;
    cursor: pointer;
  }

  .clear-button:hover {
    background: #374151;
    color: #fff;
  }

  .error-banner {
    padding: 12px 24px;
    background: #7f1d1d;
    color: #fecaca;
    font-size: 14px;
  }

  .printing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: #1e40af;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .orders-container {
    padding: 24px;
  }

  .no-orders {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }

  .no-orders-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .no-orders h3 {
    font-size: 24px;
    margin: 0 0 8px;
    color: #e5e7eb;
  }

  .no-orders p {
    color: #9ca3af;
    margin: 0;
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 20px;
  }

  .error-container h2 {
    color: #ef4444;
    margin-bottom: 12px;
  }

  .error-container p {
    color: #9ca3af;
    margin: 4px 0;
  }

  .error-container .example {
    font-family: monospace;
    background: #374151;
    padding: 8px 16px;
    border-radius: 6px;
    margin-top: 16px;
  }
`;

const globalStyles = `
  .kot-receipt-wrapper {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .kot-receipt {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.4;
    padding: 16px;
    color: #000;
    background: #fff;
  }

  .receipt-header {
    text-align: center;
    margin-bottom: 12px;
  }

  .receipt-header .restaurant-name {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .receipt-header .receipt-title {
    font-size: 14px;
    font-weight: bold;
    margin-top: 4px;
  }

  .receipt-divider {
    text-align: center;
    color: #666;
    margin: 8px 0;
  }

  .receipt-info {
    margin: 8px 0;
  }

  .receipt-info .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
  }

  .receipt-info .info-cell {
    display: flex;
    gap: 4px;
  }

  .receipt-info .info-cell .bold {
    font-weight: bold;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
  }

  .info-row .bold {
    font-weight: bold;
  }

  .receipt-items {
    margin: 8px 0;
  }

  .items-header {
    display: flex;
    gap: 16px;
    font-weight: bold;
    padding-bottom: 4px;
  }

  .item-row {
    margin: 8px 0;
  }

  .item-main {
    display: flex;
    gap: 8px;
  }

  .item-qty {
    font-weight: bold;
    min-width: 30px;
  }

  .item-name {
    font-weight: bold;
    flex: 1;
  }

  .item-variant,
  .item-customizations,
  .item-notes {
    font-size: 11px;
    color: #333;
    padding-left: 38px;
  }

  .customization {
    color: #444;
  }

  .item-notes {
    font-style: italic;
  }

  .receipt-footer {
    text-align: center;
  }

  .total-items {
    font-weight: bold;
    font-size: 13px;
  }

  .order-notes {
    margin-top: 8px;
    text-align: left;
    font-style: italic;
  }

  .special-instructions {
    margin-top: 8px;
    text-align: center;
    font-weight: bold;
    border: 1px dashed #000;
    padding: 8px;
    background: #fff8dc;
  }

  .special-instructions div {
    margin-top: 4px;
    font-weight: normal;
    text-align: left;
  }

  .print-button {
    width: 100%;
    padding: 12px;
    background: #1e40af;
    color: #fff;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .print-button:hover {
    background: #1d4ed8;
  }

  .print-button:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }

  @media print {
    body * {
      visibility: hidden;
    }
    .kot-receipt, .kot-receipt * {
      visibility: visible;
    }
    .kot-receipt {
      position: absolute;
      left: 0;
      top: 0;
      width: 72mm;
    }
    .print-button {
      display: none;
    }
  }
`;

// Main page component with Suspense
export default function PrintKOTPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #fff',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading KOT Printer...</p>
        </div>
      </div>
    }>
      <PrintKOTContent />
    </Suspense>
  );
}
