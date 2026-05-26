/**
 * React hook for ECR payment terminal operations
 * Wraps ecrService with state management for UI status tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  purchase,
  refund,
  voidTransaction,
  settlement,
  testConnection,
  testConnectionWithSettings,
  initEcr,
  isEcrInitialized,
} from './ecrService';
import { ECR_STATUS, ECR_RESPONSE_CODES } from './ecrConstants';

export default function useEcr(ecrSettings) {
  const [status, setStatus] = useState(ECR_STATUS.IDLE);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  // Initialize ECR when settings change
  useEffect(() => {
    if (!ecrSettings?.enabled) return;
    // NAPS Direct requires terminalIp; Sadad Cloud requires restaurantId
    const canInit = ecrSettings.provider === 'sadad-cloud'
      ? !!ecrSettings.restaurantId
      : !!ecrSettings.terminalIp;
    if (canInit) {
      initEcr(ecrSettings);
    }
  }, [
    ecrSettings?.enabled,
    ecrSettings?.provider,
    ecrSettings?.terminalIp,
    ecrSettings?.port,
    ecrSettings?.terminalId,
    ecrSettings?.merchantId,
    ecrSettings?.restaurantId,
    ecrSettings?.integrationMethod,
  ]);

  const _handleResponse = useCallback((resp) => {
    if (abortRef.current) return resp;
    setLastResponse(resp);
    if (resp?.ResponseCode === ECR_RESPONSE_CODES.APPROVED) {
      setStatus(ECR_STATUS.APPROVED);
    } else {
      setStatus(ECR_STATUS.DECLINED);
      setError(resp?.ResponseMessage || `Declined (code: ${resp?.ResponseCode})`);
    }
    return resp;
  }, []);

  const _handleError = useCallback((err) => {
    if (abortRef.current) return;
    if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
      setStatus(ECR_STATUS.TIMEOUT);
      setError('Terminal did not respond. Check if the terminal is powered on and connected.');
    } else {
      setStatus(ECR_STATUS.ERROR);
      setError(err.message || 'Unknown error communicating with terminal');
    }
    throw err;
  }, []);

  const doPurchase = useCallback(async (amount, transactionId) => {
    abortRef.current = false;
    setStatus(ECR_STATUS.WAITING_FOR_CARD);
    setError(null);
    setLastResponse(null);
    try {
      const resp = await purchase(amount, transactionId, (s) => {
        // Sadad Cloud sends 'polling' status during wait
        if (s === 'polling' && !abortRef.current) setStatus(ECR_STATUS.POLLING);
      });
      return _handleResponse(resp);
    } catch (err) {
      _handleError(err);
    }
  }, [_handleResponse, _handleError]);

  const doRefund = useCallback(async (amount, originalRRN, transactionId) => {
    abortRef.current = false;
    setStatus(ECR_STATUS.PROCESSING);
    setError(null);
    setLastResponse(null);
    try {
      const resp = await refund(amount, originalRRN, transactionId);
      return _handleResponse(resp);
    } catch (err) {
      _handleError(err);
    }
  }, [_handleResponse, _handleError]);

  const doVoid = useCallback(async (originalRRN) => {
    abortRef.current = false;
    setStatus(ECR_STATUS.PROCESSING);
    setError(null);
    setLastResponse(null);
    try {
      const resp = await voidTransaction(originalRRN);
      return _handleResponse(resp);
    } catch (err) {
      _handleError(err);
    }
  }, [_handleResponse, _handleError]);

  const doSettlement = useCallback(async () => {
    abortRef.current = false;
    setStatus(ECR_STATUS.PROCESSING);
    setError(null);
    setLastResponse(null);
    try {
      const resp = await settlement();
      return _handleResponse(resp);
    } catch (err) {
      _handleError(err);
    }
  }, [_handleResponse, _handleError]);

  const doTest = useCallback(async (settings) => {
    setStatus(ECR_STATUS.CONNECTING);
    setError(null);
    try {
      const result = settings
        ? await testConnectionWithSettings(settings)
        : await testConnection();
      if (result.success) {
        setStatus(ECR_STATUS.IDLE);
      } else {
        setStatus(ECR_STATUS.ERROR);
        setError(result.message);
      }
      return result;
    } catch (err) {
      setStatus(ECR_STATUS.ERROR);
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus(ECR_STATUS.IDLE);
    setLastResponse(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setStatus(ECR_STATUS.IDLE);
    setError(null);
  }, []);

  return {
    status,
    lastResponse,
    error,
    isReady: ecrSettings?.enabled && isEcrInitialized(),
    doPurchase,
    doRefund,
    doVoid,
    doSettlement,
    doTest,
    reset,
    cancel,
  };
}
