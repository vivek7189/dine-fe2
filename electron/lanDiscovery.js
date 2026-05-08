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
  discoverHub,
  stopDiscovery,
  getDiscoveredHub,
  cleanup,
};
