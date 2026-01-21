'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dine-backend-lake.vercel.app';

// KOT Receipt Component - Styled for 80mm thermal printer
const KOTReceipt = ({ order, restaurantName, onPrint, isPrinting }) => {
  const receiptRef = useRef(null);

  return (
    <div className="kot-receipt-wrapper">
      <div ref={receiptRef} className="kot-receipt" id={`receipt-${order.id}`}>
        {/* Header */}
        <div className="receipt-header">
          <div className="restaurant-name">{restaurantName}</div>
          <div className="receipt-title">--- KITCHEN ORDER ---</div>
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
          {order.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-main">
                <span className="item-qty">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
              </div>
              {item.variant && (
                <div className="item-variant">  [{item.variant}]</div>
              )}
              {item.selectedVariant?.name && (
                <div className="item-variant">  [{item.selectedVariant.name}]</div>
              )}
              {item.customizations && item.customizations.length > 0 && (
                <div className="item-customizations">
                  {item.customizations.map((c, i) => (
                    <div key={i} className="customization">  + {c.name || c}</div>
                  ))}
                </div>
              )}
              {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                <div className="item-customizations">
                  {item.selectedCustomizations.map((c, i) => (
                    <div key={i} className="customization">  + {c.name || c}</div>
                  ))}
                </div>
              )}
              {item.notes && (
                <div className="item-notes">  Note: {item.notes}</div>
              )}
            </div>
          ))}
        </div>

        <div className="receipt-divider">--------------------------------</div>

        {/* Footer */}
        <div className="receipt-footer">
          <div className="total-items">
            Total Items: {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}
          </div>
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

  const pollingIntervalRef = useRef(null);
  const printFrameRef = useRef(null);

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

    try {
      // Create a hidden iframe for printing
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>KOT - ${order.kotId}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.4;
              width: 80mm;
              padding: 5mm;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              margin-bottom: 8px;
            }
            .restaurant-name {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kot-title {
              font-size: 14px;
              font-weight: bold;
              margin-top: 4px;
            }
            .divider {
              text-align: center;
              margin: 6px 0;
              font-size: 12px;
            }
            .info-section {
              margin: 8px 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 8px;
            }
            .info-cell {
              display: flex;
              gap: 4px;
            }
            .info-cell .label {
              font-weight: normal;
              white-space: nowrap;
            }
            .info-cell .value {
              font-weight: bold;
            }
            .info-full {
              grid-column: 1 / -1;
              display: flex;
              gap: 4px;
            }
            .items-section {
              margin: 8px 0;
            }
            .items-header {
              display: flex;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .items-header .qty {
              width: 30px;
            }
            .item {
              margin: 6px 0;
            }
            .item-main {
              display: flex;
            }
            .item-qty {
              width: 30px;
              font-weight: bold;
            }
            .item-name {
              font-weight: bold;
              flex: 1;
            }
            .item-variant, .item-custom, .item-note {
              margin-left: 30px;
              font-size: 11px;
            }
            .item-note {
              font-style: italic;
            }
            .footer {
              margin-top: 8px;
              text-align: center;
            }
            .total-items {
              font-weight: bold;
              font-size: 13px;
            }
            .order-notes {
              margin-top: 6px;
              font-style: italic;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">${restaurantName}</div>
            <div class="kot-title">--- KITCHEN ORDER ---</div>
          </div>

          <div class="divider">--------------------------------</div>

          <div class="info-section">
            <div class="info-grid">
              <div class="info-cell">
                <span class="label">Order#:</span>
                <span class="value">${order.dailyOrderId || order.kotId}</span>
              </div>
              ${order.tableNumber ? `
              <div class="info-cell">
                <span class="label">Table:</span>
                <span class="value">${order.tableNumber}</span>
              </div>
              ` : ''}
              ${order.roomNumber ? `
              <div class="info-cell">
                <span class="label">Room:</span>
                <span class="value">${order.roomNumber}</span>
              </div>
              ` : ''}
              <div class="info-cell">
                <span class="label">Time:</span>
                <span class="value">${order.formattedTime}</span>
              </div>
              <div class="info-cell">
                <span class="label">Date:</span>
                <span class="value">${order.formattedDate}</span>
              </div>
              ${order.staffInfo?.waiterName ? `
              <div class="info-cell">
                <span class="label">Waiter:</span>
                <span class="value">${order.staffInfo.waiterName}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="divider">--------------------------------</div>

          <div class="items-section">
            <div class="items-header">
              <span class="qty">QTY</span>
              <span>ITEM</span>
            </div>
            <div class="divider">--------------------------------</div>
            ${order.items.map(item => `
              <div class="item">
                <div class="item-main">
                  <span class="item-qty">${item.quantity}x</span>
                  <span class="item-name">${item.name}</span>
                </div>
                ${item.variant ? `<div class="item-variant">[${item.variant}]</div>` : ''}
                ${item.selectedVariant?.name ? `<div class="item-variant">[${item.selectedVariant.name}]</div>` : ''}
                ${(item.customizations || []).map(c => `<div class="item-custom">+ ${c.name || c}</div>`).join('')}
                ${(item.selectedCustomizations || []).map(c => `<div class="item-custom">+ ${c.name || c}</div>`).join('')}
                ${item.notes ? `<div class="item-note">Note: ${item.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="divider">--------------------------------</div>

          <div class="footer">
            <div class="total-items">
              Total Items: ${order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}
            </div>
            ${order.notes ? `<div class="order-notes"><strong>Notes:</strong> ${order.notes}</div>` : ''}
          </div>

          <div class="divider">================================</div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.parent.postMessage({ type: 'printComplete', orderId: '${order.id}' }, '*');
              };
            };
          </script>
        </body>
        </html>
      `;

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '80mm';
      iframe.style.height = '0';
      document.body.appendChild(iframe);

      // Write content and print
      iframe.contentDocument.open();
      iframe.contentDocument.write(printContent);
      iframe.contentDocument.close();

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

      // Remove iframe after print
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        setIsPrinting(false);
      }, 2000);

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
      pollingIntervalRef.current = setInterval(fetchPendingOrders, 5000);
      setIsPolling(true);
    }
  }, [isPolling, fetchPendingOrders]);

  // Auto-start polling on mount
  useEffect(() => {
    if (!restaurantId) return;

    // Initial fetch
    fetchPendingOrders();

    // Start polling
    pollingIntervalRef.current = setInterval(fetchPendingOrders, 5000);
    setIsPolling(true);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
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
      width: 80mm;
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
