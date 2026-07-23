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

// Sadad Cloud (PayCloud) base URLs
export const SADAD_URLS = {
  PRODUCTION: 'https://open.sadadpos.com',
  UAT: 'https://open-uat.sadadpos.com', // sandbox / testing
};

// Sadad Cloud transaction status codes.
// CONFIRMED by docs: PENDING = 9 (pre-order / awaiting payment).
// ⚠ The rest mirror the backend's working assumption and MUST be confirmed
//   against Sadad's status-code table. The frontend only consumes the backend's
//   already-mapped status string, so these are informational here.
export const SADAD_TRANS_STATUS = {
  SUCCESS: 2,          // ⚠ VERIFY
  PENDING: 9,          // CONFIRMED
  FAILED: 11,          // ⚠ VERIFY
  CANCELLED: 13,       // ⚠ VERIFY
  PARTIAL_REFUND: 14,  // ⚠ VERIFY
  FULL_REFUND: 17,     // ⚠ VERIFY
};
