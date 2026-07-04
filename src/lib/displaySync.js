/**
 * Customer Display Sync — Cross-platform communication between billing page and customer-facing display.
 *
 * Strategy:
 *  1. BroadcastChannel (instant, works in Web + Electron multi-window)
 *  2. localStorage write (fallback for Capacitor/Android where WebViews share origin)
 *  3. Receiver listens on BroadcastChannel + polls localStorage as fallback
 */

const CHANNEL_PREFIX = 'customer-display';
const STORAGE_KEY = 'dineCustomerDisplayData';

// ─── Sender (used by billing page) ──────────────────────────────────────────

export function createDisplaySender(storeId) {
  let channel = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(`${CHANNEL_PREFIX}-${storeId}`);
    }
  } catch {
    // BroadcastChannel not supported
  }

  function send(data) {
    const payload = { ...data, storeId, timestamp: Date.now() };

    // BroadcastChannel (instant delivery to all tabs/windows on same origin)
    if (channel) {
      try {
        channel.postMessage(payload);
      } catch {
        // channel closed or serialization error
      }
    }

    // localStorage (fallback + backward compat)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage full or unavailable
    }
  }

  function sendIdle() {
    send({ status: 'idle', items: [], subtotal: 0, discount: 0, tax: 0, total: 0 });
  }

  function close() {
    if (channel) {
      try { channel.close(); } catch {}
      channel = null;
    }
    // Clear display on close
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return { send, sendIdle, close };
}

// ─── Receiver (used by customer display page) ───────────────────────────────

export function createDisplayReceiver(storeId, callback) {
  let channel = null;
  let pollTimer = null;
  let lastTimestamp = 0;

  // BroadcastChannel listener
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(`${CHANNEL_PREFIX}-${storeId}`);
      channel.onmessage = (event) => {
        const data = event.data;
        if (data && data.timestamp > lastTimestamp) {
          lastTimestamp = data.timestamp;
          callback(data);
        }
      };
    }
  } catch {
    // not supported
  }

  // localStorage polling fallback (500ms)
  pollTimer = setInterval(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.timestamp > lastTimestamp) {
          lastTimestamp = data.timestamp;
          callback(data);
        }
      } else if (lastTimestamp > 0) {
        // Storage cleared — go idle
        lastTimestamp = Date.now();
        callback({ status: 'idle', items: [], subtotal: 0, discount: 0, tax: 0, total: 0, timestamp: lastTimestamp });
      }
    } catch {
      // parse error
    }
  }, 500);

  function close() {
    if (channel) {
      try { channel.close(); } catch {}
      channel = null;
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  return { close };
}
