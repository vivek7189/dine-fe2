/**
 * ECR Payment Terminal Service
 * Platform-adaptive: Electron (direct IPC), Capacitor (Intent/network), Web (backend proxy)
 * Provider-aware: NAPS Direct (local terminal) or Sadad Cloud (cloud-routed via backend)
 */

import { getPlatform, isElectron, isCapacitor } from '../../utils/platform';
import apiClient from '../../lib/api';
import {
  ECR_ENDPOINTS,
  ECR_PORT_DEFAULT,
  ECR_CURRENCY_QAR,
  ECR_TIMEOUT_MS,
  ECR_INTEGRATION_METHODS,
  ECR_PROVIDERS,
} from './ecrConstants';

let _config = null;

/**
 * Initialize ECR with terminal settings
 * @param {Object} settings
 */
export function initEcr(settings) {
  _config = {
    provider: settings.provider || ECR_PROVIDERS.NAPS_DIRECT,
    restaurantId: settings.restaurantId,
    // NAPS fields
    terminalIp: settings.terminalIp,
    port: settings.port || ECR_PORT_DEFAULT,
    terminalId: settings.terminalId,
    merchantId: settings.merchantId,
    integrationMethod: settings.integrationMethod || ECR_INTEGRATION_METHODS.AUTO,
  };

  // Initialize Sadad Cloud service if needed
  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    import('./sadadCloudService').then(({ initSadad }) => {
      initSadad({ restaurantId: settings.restaurantId });
    });
  }
}

export function getEcrConfig() {
  return _config;
}

export function isEcrInitialized() {
  return !!_config;
}

/**
 * Send a purchase request to the payment terminal
 * @param {number} amount - Amount in major currency units (e.g. 150.00)
 * @param {string} transactionId - Unique transaction reference
 * @param {function} [onStatusChange] - Optional callback for Sadad Cloud polling status
 * @returns {Promise<Object>} ECR response
 */
export async function purchase(amount, transactionId, onStatusChange) {
  _assertInitialized();

  // Sadad Cloud: route through backend
  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    return _callViaSadadCloud('purchase', { amount, transactionId, onStatusChange });
  }

  // NAPS Direct: local terminal
  const payload = {
    Amount: amount.toFixed(2),
    CurrencyCode: ECR_CURRENCY_QAR,
    TransactionId: transactionId,
    MerchantId: _config.merchantId,
    TerminalId: _config.terminalId,
  };
  return _dispatch(ECR_ENDPOINTS.PURCHASE, payload);
}

/**
 * Send a refund request
 * @param {number} amount - Refund amount
 * @param {string} originalRRN - RRN from original transaction
 * @param {string} transactionId - Unique transaction reference for refund
 */
export async function refund(amount, originalRRN, transactionId) {
  _assertInitialized();

  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    return _callViaSadadCloud('refund', { amount, originalRRN, transactionId });
  }

  const payload = {
    Amount: amount.toFixed(2),
    CurrencyCode: ECR_CURRENCY_QAR,
    TransactionId: transactionId,
    OriginalRRN: originalRRN,
    MerchantId: _config.merchantId,
    TerminalId: _config.terminalId,
  };
  return _dispatch(ECR_ENDPOINTS.REFUND, payload);
}

/**
 * Void a previous transaction
 * @param {string} originalRRN - RRN from original transaction
 */
export async function voidTransaction(originalRRN) {
  _assertInitialized();

  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    // Sadad Cloud doesn't have void — use close order for pending, refund for completed
    throw new Error('Void is not supported with Sadad Cloud. Use refund instead.');
  }

  const payload = {
    OriginalRRN: originalRRN,
    MerchantId: _config.merchantId,
    TerminalId: _config.terminalId,
  };
  return _dispatch(ECR_ENDPOINTS.VOID, payload);
}

/**
 * End-of-day settlement
 */
export async function settlement() {
  _assertInitialized();

  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    throw new Error('Settlement is not supported with Sadad Cloud.');
  }

  const payload = {
    MerchantId: _config.merchantId,
    TerminalId: _config.terminalId,
  };
  return _dispatch(ECR_ENDPOINTS.SETTLEMENT, payload);
}

/**
 * Get last transaction from terminal
 */
export async function getLastTransaction() {
  _assertInitialized();

  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    throw new Error('getLastTransaction is not supported with Sadad Cloud.');
  }

  const payload = {
    MerchantId: _config.merchantId,
    TerminalId: _config.terminalId,
  };
  return _dispatch(ECR_ENDPOINTS.LAST_TRANSACTION, payload);
}

/**
 * Test connectivity to the terminal
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function testConnection() {
  _assertInitialized();

  if (_config.provider === ECR_PROVIDERS.SADAD_CLOUD) {
    const { testConnection: sadadTest } = await import('./sadadCloudService');
    return sadadTest();
  }

  try {
    const result = await getLastTransaction();
    return { success: true, message: 'Terminal is reachable', result };
  } catch (err) {
    return { success: false, message: err.message || 'Terminal unreachable' };
  }
}

/**
 * Test connectivity with explicit settings (for admin settings page before saving)
 */
export async function testConnectionWithSettings(settings) {
  const prev = _config;
  try {
    initEcr(settings);
    return await testConnection();
  } finally {
    _config = prev;
  }
}

/**
 * Cancel a Sadad Cloud order (used when user presses Cancel during polling)
 * @param {string} merchantOrderNo
 */
export async function cancelSadadOrder(merchantOrderNo) {
  const { cancelSadad, closeOrder } = await import('./sadadCloudService');
  cancelSadad(); // abort polling
  if (merchantOrderNo) {
    try { await closeOrder(merchantOrderNo); } catch (e) { /* best effort */ }
  }
}

// ── Internal dispatch (NAPS Direct only) ──

function _assertInitialized() {
  if (!_config) {
    throw new Error('ECR not initialized. Call initEcr(settings) first.');
  }
}

async function _dispatch(endpoint, payload) {
  const platform = getPlatform();

  if (platform === 'electron') {
    return _callViaElectron(endpoint, payload);
  }

  if (platform === 'capacitor') {
    if (_config.integrationMethod === ECR_INTEGRATION_METHODS.APP_TO_APP) {
      return _callViaCapacitorIntent(endpoint, payload);
    }
    if (_config.integrationMethod === ECR_INTEGRATION_METHODS.NETWORK) {
      return _callViaBackendProxy(endpoint, payload);
    }
    // AUTO: try Intent first, fallback to network proxy
    try {
      return await _callViaCapacitorIntent(endpoint, payload);
    } catch (intentErr) {
      if (intentErr.message?.includes('not available')) {
        return _callViaBackendProxy(endpoint, payload);
      }
      throw intentErr;
    }
  }

  // Web — always proxy through backend
  return _callViaBackendProxy(endpoint, payload);
}

async function _callViaSadadCloud(operation, params) {
  const sadadService = await import('./sadadCloudService');

  if (!sadadService.isSadadInitialized()) {
    sadadService.initSadad({ restaurantId: _config.restaurantId });
  }

  if (operation === 'purchase') {
    return sadadService.purchase(params.amount, params.transactionId, params.onStatusChange);
  }
  if (operation === 'refund') {
    return sadadService.refund(params.amount, params.originalRRN, params.transactionId);
  }
  throw new Error(`Unsupported Sadad operation: ${operation}`);
}

async function _callViaElectron(endpoint, payload) {
  if (!window.electronAPI?.ecrRequest) {
    throw new Error('Electron ECR bridge not available. Update the desktop app.');
  }
  return window.electronAPI.ecrRequest({
    url: `https://${_config.terminalIp}:${_config.port}${endpoint}`,
    method: 'POST',
    body: payload,
    timeoutMs: ECR_TIMEOUT_MS,
  });
}

async function _callViaCapacitorIntent(endpoint, payload) {
  try {
    const { default: EcrPlugin } = await import('./capacitorEcrPlugin');
    return await EcrPlugin.sendRequest({ endpoint, payload });
  } catch (err) {
    if (err.message?.includes('not implemented')) {
      throw new Error('ECR App-to-App not available on this device');
    }
    throw err;
  }
}

async function _callViaBackendProxy(endpoint, payload) {
  const resp = await apiClient.post('/api/ecr/proxy', {
    terminalIp: _config.terminalIp,
    port: _config.port,
    endpoint,
    payload,
    restaurantId: _config.restaurantId,
  });
  return resp;
}
