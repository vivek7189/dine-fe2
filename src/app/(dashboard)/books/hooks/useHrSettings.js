'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * HR settings for Books → Appraisals / Payroll (owner-editable lists, see backend utils/hrSettings.js).
 * DEFAULTS mirror the backend and are what a restaurant sees until it saves its own lists — they
 * match the lists that were hard-coded before, so nothing changes until someone edits.
 */
export const DEFAULT_CRITERIA = [
  { key: 'punctuality', name: 'Punctuality', weight: 1 },
  { key: 'workQuality', name: 'Work Quality', weight: 1 },
  { key: 'teamwork', name: 'Teamwork', weight: 1 },
  { key: 'customerService', name: 'Customer Service', weight: 1 },
  { key: 'initiative', name: 'Initiative', weight: 1 },
];

export const DEFAULT_HR_SETTINGS = {
  appraisal: {
    templates: [{ id: 'default', name: 'General', roles: [], criteria: DEFAULT_CRITERIA }],
    recommendations: [
      { id: 'none', name: 'No action' },
      { id: 'raise', name: 'Salary raise' },
      { id: 'promotion', name: 'Promotion' },
      { id: 'training', name: 'Needs training' },
      { id: 'warning', name: 'Warning' },
    ],
  },
  payroll: {
    earnings: [{ key: 'hra', name: 'HRA' }, { key: 'travel', name: 'Travel' }, { key: 'food', name: 'Food' }],
    deductions: [{ key: 'pf', name: 'PF' }, { key: 'tax', name: 'Tax' }, { key: 'other', name: 'Other' }],
    paymentModes: [
      { id: 'cash', name: 'Cash' }, { id: 'bank', name: 'Bank transfer' },
      { id: 'upi', name: 'UPI' }, { id: 'cheque', name: 'Cheque' },
    ],
    lopFromAttendance: true, // cut pay for absent days using attendance
  },
};

// One-click suggestions shown in the settings panels (only the ones not already added).
export const SUGGESTED_TEMPLATES = [
  {
    id: 'kitchen', name: 'Kitchen', roles: ['chef', 'cook', 'kitchen', 'kitchen_staff', 'helper'],
    criteria: [
      { key: 'foodQuality', name: 'Food quality & taste', weight: 1 },
      { key: 'efficiency', name: 'Efficiency / speed', weight: 1 },
      { key: 'wastageControl', name: 'Wastage control', weight: 1 },
      { key: 'utilityUsage', name: 'Utility usage (gas, power, water)', weight: 1 },
      { key: 'hygiene', name: 'Hygiene & cleanliness', weight: 1 },
      { key: 'recipeAdherence', name: 'Recipe & portion adherence', weight: 1 },
      { key: 'punctuality', name: 'Punctuality', weight: 1 },
    ],
  },
  {
    id: 'service', name: 'Service', roles: ['waiter', 'captain', 'server', 'steward', 'host'],
    criteria: [
      { key: 'customerService', name: 'Customer service', weight: 1 },
      { key: 'upselling', name: 'Upselling', weight: 1 },
      { key: 'serviceSpeed', name: 'Service speed', weight: 1 },
      { key: 'grooming', name: 'Grooming & uniform', weight: 1 },
      { key: 'teamwork', name: 'Teamwork', weight: 1 },
      { key: 'punctuality', name: 'Punctuality', weight: 1 },
    ],
  },
  {
    id: 'cashier', name: 'Cashier', roles: ['cashier'],
    criteria: [
      { key: 'cashAccuracy', name: 'Cash accuracy', weight: 1 },
      { key: 'billingSpeed', name: 'Billing speed', weight: 1 },
      { key: 'customerHandling', name: 'Customer handling', weight: 1 },
      { key: 'punctuality', name: 'Punctuality', weight: 1 },
    ],
  },
];
export const SUGGESTED_RECOMMENDATIONS = [
  'Incentive / bonus', 'Role change / cross-training', 'Hygiene / food-safety training', 'Confirm employment',
  'Extend probation', 'Written warning', 'Performance improvement plan (PIP)', 'Termination review',
];
export const SUGGESTED_EARNINGS = ['Uniform allowance', 'Overtime', 'Night shift allowance', 'Attendance bonus', 'Gift', 'Compensation', 'Incentive'];
export const SUGGESTED_DEDUCTIONS = ['Uniform recovery', 'Meal deduction', 'Penalty – misconduct', 'Damage / breakage', 'Late coming', 'Cash shortage'];
export const SUGGESTED_PAYMENT_MODES = ['Card', 'Wallet', 'Split (cash + bank)'];

// "Wastage control" → "wastageControl" — same rule as the backend, for new items.
export function keyFromName(name) {
  const words = String(name || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean);
  return words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join('').slice(0, 40);
}

// Pick the appraisal template for a staff role. Roles compare ignoring case and extra spaces
// ('Dosai  Master ' = 'dosai master', as the server stores template roles). No match → the
// template that lists no roles (the general one), else the first template.
const normRole = (r) => String(r || '').trim().replace(/\s+/g, ' ').toLowerCase();
export function templateForRole(templates, role) {
  const list = templates && templates.length ? templates : DEFAULT_HR_SETTINGS.appraisal.templates;
  const r = normRole(role);
  return (r && list.find(t => (t.roles || []).some(x => normRole(x) === r)))
    || list.find(t => !(t.roles || []).length)
    || list[0];
}

export default function useHrSettings(restaurantId, apiClient) {
  const [settings, setSettings] = useState(DEFAULT_HR_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!restaurantId || !apiClient?.getHrSettings) return;
    try {
      const res = await apiClient.getHrSettings(restaurantId);
      if (res?.settings) setSettings(res.settings);
    } catch (_) { /* keep defaults — the screens still work */ }
    finally { setLoaded(true); }
  }, [restaurantId, apiClient]);

  useEffect(() => { reload(); }, [reload]);

  // Saves one section ({ appraisal } or { payroll }); returns the saved settings or throws.
  const save = useCallback(async (partial) => {
    const res = await apiClient.saveHrSettings(restaurantId, partial);
    if (res?.settings) setSettings(res.settings);
    return res?.settings;
  }, [restaurantId, apiClient]);

  return { settings, loaded, reload, save };
}
