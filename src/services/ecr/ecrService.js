/**
 * NAPS Qatar ECR Payment Terminal Service
 * Platform-adaptive: Electron (direct IPC), Capacitor (Intent/network), Web (backend proxy)
 */

import { getPlatform, isElectron, isCapacitor } from '../../utils/platform';
import apiClient from '../../lib/api';
import {
  ECR_ENDPOINTS,
  ECR_PORT_DEFAULT,
  ECR_CURRENCY_QAR,
  ECR_TIMEOUT_MS,
  ECR_INTEGRATION_METHODS,
} from './ecrConstants';

let _config = null;

/**
 * Initialize ECR with terminal settings
 * @param {{ terminalIp: string, port?: number, terminalId: string, merchantId: string, restaurantId: string, integrationMethod?: string }} settings
 */
export function initEcr(settings) {
  _config = {
    terminalIp: settings.terminalIp,
    port: settings.port || ECR_PORT_DEFAULT,
    terminalId: settings.terminalId,
    merchantId: settings.merchantId,
    restaurantId: settings.restaurantId,
    integrationMethod: settings.integrationMethod || ECR_INTEGRATION_METHODS.AUTO,
  };
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
 * @returns {Promise<Object>} ECR response
 */
export async function purchase(amount, transactionId) {
  _assertInitialized();
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

// ── Internal dispatch ──

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
    // On Capacitor, try App-to-App intent first if configured, else network
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
