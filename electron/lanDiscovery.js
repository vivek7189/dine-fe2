/**
 * DineOpen LAN Discovery
 *
 * Uses mDNS (via bonjour-service) to advertise and discover the LAN hub
 * on the local network. The hub terminal advertises itself, and other
 * terminals discover it automatically.
 *
 * Service type: _dinepos._tcp
 */

let Bonjour;
try {
  Bonjour = require('bonjour-service').Bonjour;
} catch {
  // bonjour-service not installed — discovery will be disabled
  Bonjour = null;
}

// ─── State ──────────────────────────────────────────────────────────────────

let bonjourInstance = null;
let publishedService = null;
let browser = null;
let discoveredHub = null;

const SERVICE_TYPE = 'dinepos';
const SERVICE_NAME = 'DineOpen POS Hub';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getBonjourInstance() {
  if (!Bonjour) {
    console.warn('[LanDiscovery] bonjour-service not available');
    return null;
  }
  if (!bonjourInstance) {
    bonjourInstance = new Bonjour();
  }
  return bonjourInstance;
}

function getIPv4Address(service) {
  if (!service || !service.addresses) return service?.host || null;

  // Prefer IPv4 addresses
  const ipv4 = service.addresses.find(
    (addr) => addr && !addr.includes(':') // IPv6 contains colons
  );
  return ipv4 || service.addresses[0] || service.host || null;
}

// ─── Advertise Hub ──────────────────────────────────────────────────────────

function advertiseHub(port = 3847, meta = {}) {
  const bonjour = getBonjourInstance();
  if (!bonjour) return false;

  if (publishedService) {
    console.warn('[LanDiscovery] Already advertising');
    return true;
  }

  try {
    publishedService = bonjour.publish({
      name: SERVICE_NAME,
      type: SERVICE_TYPE,
      port,
      txt: {
        version: '1',
        restaurantId: meta.restaurantId || '',
        terminalName: meta.terminalName || 'Hub',
      },
    });

    console.log(`[LanDiscovery] Advertising hub on port ${port}`);
    return true;
  } catch (err) {
    console.error('[LanDiscovery] Failed to advertise:', err.message);
    return false;
  }
}

function stopAdvertising() {
  if (publishedService) {
    try {
      publishedService.stop(() => {
        console.log('[LanDiscovery] Stopped advertising');
      });
    } catch {
      // ignore
    }
    publishedService = null;
  }
}

// ─── Advertise the on-prem BACKEND SERVER (embedded DB + API) ────────────────
// Separate from the WebSocket hub above: this publishes type 'dineopen' at the
// BACKEND port (3003) so phones/terminals auto-discover the host via the
// `discover-local-server` browser (which looks for exactly type 'dineopen').
// Additive — a no-op when bonjour isn't bundled; never throws to the caller.
let publishedServer = null;
let _serverAdvertHeal = null;
// Publish (or re-publish) the server advert with the given restaurantId. Republishing is how we
// stamp the bound restaurant into the TXT record once it's known (mDNS TXT is fixed at publish
// time), so a client can read WHICH restaurant this hub serves straight from discovery.
function _publishServer(port, restaurantId) {
  const bonjour = getBonjourInstance();
  if (!bonjour) return false;
  try {
    if (publishedServer) { try { publishedServer.stop(); } catch (_) {} publishedServer = null; }
    publishedServer = bonjour.publish({
      name: 'DineOpen Server',
      type: 'dineopen', // MUST match discover-local-server's browse type
      port,
      txt: { version: '1', restaurantId: restaurantId || '', role: 'server' },
    });
    console.log(`[LanDiscovery] Advertising DineOpen server (type 'dineopen') on port ${port}${restaurantId ? ` for restaurant ${restaurantId}` : ' (restaurant not bound yet)'}`);
    return true;
  } catch (err) {
    console.error('[LanDiscovery] Failed to advertise server:', err.message);
    return false;
  }
}
function advertiseServer(port = 3003, meta = {}) {
  const bonjour = getBonjourInstance();
  if (!bonjour) return false;
  const rid = meta.restaurantId || '';
  const ok = publishedServer ? true : _publishServer(port, rid);
  // If the restaurant isn't bound yet (fresh, un-provisioned hub) but the caller gave us a way to
  // resolve it later, poll briefly and re-publish once provisioning writes the id — so the TXT
  // self-heals to carry the restaurantId without needing an app restart.
  if (!rid && typeof meta.resolveRestaurantId === 'function' && !_serverAdvertHeal) {
    let tries = 0;
    _serverAdvertHeal = setInterval(() => {
      let resolved = '';
      try { resolved = meta.resolveRestaurantId() || ''; } catch (_) {}
      if (resolved) {
        _publishServer(port, resolved);
        clearInterval(_serverAdvertHeal); _serverAdvertHeal = null;
      } else if (++tries >= 30) { // ~5 min at 10s — give up quietly
        clearInterval(_serverAdvertHeal); _serverAdvertHeal = null;
      }
    }, 10000);
    if (_serverAdvertHeal.unref) _serverAdvertHeal.unref();
  }
  return ok;
}
function stopAdvertisingServer() {
  if (_serverAdvertHeal) { try { clearInterval(_serverAdvertHeal); } catch (_) {} _serverAdvertHeal = null; }
  if (publishedServer) {
    try { publishedServer.stop(() => console.log('[LanDiscovery] Stopped advertising server')); } catch { /* ignore */ }
    publishedServer = null;
  }
}

// ─── Discover Hub ───────────────────────────────────────────────────────────

function discoverHub(onFound, onLost) {
  const bonjour = getBonjourInstance();
  if (!bonjour) return false;

  if (browser) {
    console.warn('[LanDiscovery] Already browsing');
    return true;
  }

  try {
    browser = bonjour.find({ type: SERVICE_TYPE }, (service) => {
      const hubInfo = {
        name: service.name,
        host: getIPv4Address(service),
        port: service.port,
        addresses: service.addresses || [],
        txt: service.txt || {},
        fullService: service,
      };

      discoveredHub = hubInfo;
      console.log(`[LanDiscovery] Found hub: ${hubInfo.host}:${hubInfo.port}`);

      if (typeof onFound === 'function') {
        onFound(hubInfo);
      }
    });

    // Handle service going down
    if (browser && typeof browser.on === 'function') {
      browser.on('down', (service) => {
        console.log(`[LanDiscovery] Hub went down: ${service.name}`);

        if (discoveredHub && discoveredHub.name === service.name) {
          discoveredHub = null;
        }

        if (typeof onLost === 'function') {
          onLost(service);
        }
      });
    }

    console.log('[LanDiscovery] Browsing for hubs...');
    return true;
  } catch (err) {
    console.error('[LanDiscovery] Failed to browse:', err.message);
    return false;
  }
}

function stopDiscovery() {
  if (browser) {
    try {
      browser.stop();
    } catch {
      // ignore
    }
    browser = null;
  }
}

// ─── Query ──────────────────────────────────────────────────────────────────

function getDiscoveredHub() {
  return discoveredHub;
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

function cleanup() {
  stopAdvertising();
  stopDiscovery();

  if (bonjourInstance) {
    try {
      bonjourInstance.destroy();
    } catch {
      // ignore
    }
    bonjourInstance = null;
  }

  discoveredHub = null;
  console.log('[LanDiscovery] Cleaned up');
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  advertiseHub,
  stopAdvertising,
  advertiseServer,
  stopAdvertisingServer,
  discoverHub,
  stopDiscovery,
  getDiscoveredHub,
  cleanup,
};
