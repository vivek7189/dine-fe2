/**
 * ECR (Electronic Cash Register) Payment Terminal Constants
 * Supports NAPS Qatar (direct terminal) and Sadad Cloud (WiseCashier cloud mode)
 */

export const ECR_PORT_DEFAULT = 8443;

export const ECR_CURRENCY_QAR = '634';

// 2 minutes — terminal waits for customer to present card
export const ECR_TIMEOUT_MS = 120000;

export const ECR_ENDPOINTS = {
  PURCHASE: '/purchase',
  REFUND: '/refund',
  VOID: '/void',
  SETTLEMENT: '/settlement',
  LAST_TRANSACTION: '/getLastTransaction',
};

export const ECR_RESPONSE_CODES = {
  APPROVED: '00',
  REFER_TO_ISSUER: '01',
  DECLINED: '05',
  ERROR: '06',
  INVALID_TRANSACTION: '12',
  INVALID_AMOUNT: '13',
  INVALID_CARD: '14',
  NO_RESPONSE: '68',
  TIMEOUT: '91',
};

export const ECR_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  WAITING_FOR_CARD: 'waiting_for_card',
  PROCESSING: 'processing',
  POLLING: 'polling',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ERROR: 'error',
  TIMEOUT: 'timeout',
};

export const ECR_INTEGRATION_METHODS = {
  AUTO: 'auto',
  NETWORK: 'network',
  APP_TO_APP: 'app-to-app',
};

// ECR provider types (config-driven)
export const ECR_PROVIDERS = {
  NAPS_DIRECT: 'naps-direct',
  SADAD_CLOUD: 'sadad-cloud',
};

// Sadad Cloud transaction status codes
export const SADAD_TRANS_STATUS = {
  SUCCESS: 2,
  PENDING: 9,
  FAILED: 11,
  CANCELLED: 13,
  PARTIAL_REFUND: 14,
  FULL_REFUND: 17,
};
