/**
 * Sadad Cloud Payment Service (Frontend)
 * Always routes through the backend API — works on all platforms (Web, Electron, Capacitor).
 * Handles create-order, polling for result, close-order, and refund.
 * Returns normalized responses matching the NAPS ECR shape so useEcr hook works unchanged.
 */

import apiClient from '../../lib/api';
import { ECR_RESPONSE_CODES, ECR_TIMEOUT_MS } from './ecrConstants';

let _config = null;
let _abortController = null;

/**
 * Initialize Sadad Cloud service with restaurant settings.
 * @param {{ restaurantId: string }} settings
 */
export function initSadad(settings) {
  _config = {
    restaurantId: settings.restaurantId,
  };
}

export function isSadadInitialized() {
  return !!_config?.restaurantId;
}

/**
 * Abort any in-progress polling.
 */
export function cancelSadad() {
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
}

/**
 * Push a payment to the Sadad terminal and poll for the result.
 * @param {number|string} amount - Payment amount
 * @param {string} merchantOrderNo - Unique order reference
 * @param {function} [onStatusChange] - Optional callback for status updates during polling
 * @returns {Promise<Object>} Normalized ECR response
 */
export async function purchase(amount, merchantOrderNo, onStatusChange) {
  _assertInitialized();
  _abortController = new AbortController();

  // 1. Create order on backend → push to Sadad terminal
  const createResult = await apiClient.post('/api/sadad/create-order', {
    restaurantId: _config.restaurantId,
    amount: parseFloat(amount).toFixed(2),
    merchantOrderNo,
    description: `Order ${merchantOrderNo}`,
  });

  if (!createResult?.success) {
    throw new Error(createResult?.error || 'Failed to create Sadad payment order');
  }

  // 2. Poll for result
  if (onStatusChange) onStatusChange('polling');

  return _pollForResult(merchantOrderNo, {
    timeoutMs: ECR_TIMEOUT_MS,
    intervalMs: 3000,
    signal: _abortController.signal,
  });
}

/**
 * Close/cancel a pending Sadad order.
 * @param {string} merchantOrderNo
 */
export async function closeOrder(merchantOrderNo) {
  _assertInitialized();
  return apiClient.post('/api/sadad/close-order', {
    restaurantId: _config.restaurantId,
    merchantOrderNo,
  });
}

/**
 * Refund a completed Sadad transaction.
 * @param {number|string} amount
 * @param {string} transNo - Sadad transaction number (used as RRN in normalized response)
 * @param {string} merchantOrderNo
 */
export async function refund(amount, transNo, merchantOrderNo) {
  _assertInitialized();
  const result = await apiClient.post('/api/sadad/refund', {
    restaurantId: _config.restaurantId,
    merchantOrderNo,
    refundAmount: parseFloat(amount).toFixed(2),
    transNo,
    description: 'Refund',
  });

  return _normalizeResponse({
    status: result?.success ? 'success' : 'failed',
    orderAmount: parseFloat(amount).toFixed(2),
    transNo: result?.refundTransNo || transNo,
  });
}

/**
 * Test Sadad configuration via backend.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function testConnection() {
  _assertInitialized();
  return apiClient.post('/api/sadad/test', {
    restaurantId: _config.restaurantId,
  });
}

// ── Internal ──

function _assertInitialized() {
  if (!_config?.restaurantId) {
    throw new Error('Sadad Cloud not initialized. Call initSadad(settings) first.');
  }
}

/**
 * Poll the backend for transaction status until terminal state or timeout.
 */
async function _pollForResult(merchantOrderNo, { timeoutMs = 120000, intervalMs = 3000, signal } = {}) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (signal?.aborted) {
      // User cancelled — try to close the order
      try { await closeOrder(merchantOrderNo); } catch (e) { /* best effort */ }
      throw new Error('Payment cancelled by user');
    }

    try {
      const result = await apiClient.get(
        `/api/sadad/poll/${encodeURIComponent(merchantOrderNo)}?restaurantId=${encodeURIComponent(_config.restaurantId)}`
      );

      if (result.status === 'success') {
        return _normalizeResponse(result);
      }
      if (result.status === 'failed' || result.status === 'cancelled') {
        return _normalizeResponse(result);
      }
      // Still pending — wait and poll again
    } catch (pollErr) {
      // Single poll failure — continue polling rather than failing the whole flow
      console.warn('Sadad poll request failed, retrying:', pollErr.message);
    }

    await _sleep(intervalMs, signal);
  }

  // Timeout — close the order to prevent orphaned pending transactions
  try { await closeOrder(merchantOrderNo); } catch (e) { /* best effort */ }
  throw new Error('Payment timeout — terminal did not respond within 2 minutes');
}

/**
 * Normalize a Sadad poll response to match the NAPS ECR response shape.
 * This allows useEcr hook to work unchanged.
 */
function _normalizeResponse(result) {
  const isSuccess = result.status === 'success';

  return {
    ResponseCode: isSuccess ? ECR_RESPONSE_CODES.APPROVED : ECR_RESPONSE_CODES.DECLINED,
    ResponseMessage: isSuccess ? 'Approved' : (result.status === 'cancelled' ? 'Payment cancelled' : 'Payment failed'),
    CardType: result.cardNetwork || '',
    CardNumber: result.payUserAccountId || '',
    ApprovalCode: result.authNo || '',
    RRN: result.transNo || '',
    Amount: result.orderAmount || '',
    TransactionId: result.merchantOrderNo || '',
    Provider: 'sadad-cloud',
  };
}

function _sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('aborted'));
      }, { once: true });
    }
  });
}
