/**
 * NAPS Qatar ECR (Electronic Cash Register) Payment Terminal Constants
 * Used for POS-to-terminal communication over local network
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
