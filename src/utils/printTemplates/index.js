// Print Template Registry
// Dispatches KOT and Bill rendering to the selected template.

import * as kotClassic from './kot/classic';
import * as kotCompact from './kot/compact';
import * as kotBold from './kot/bold';
import * as kotGrouped from './kot/grouped';
import * as kotNumbered from './kot/numbered';

import * as billClassic from './bill/classic';
import * as billCompact from './bill/compact';
import * as billDetailed from './bill/detailed';
import * as billElegant from './bill/elegant';
import * as billMinimal from './bill/minimal';
import * as billProfessional from './bill/professional';

const KOT_TEMPLATES = {
  classic: kotClassic,
  compact: kotCompact,
  bold: kotBold,
  grouped: kotGrouped,
  numbered: kotNumbered,
};

const BILL_TEMPLATES = {
  classic: billClassic,
  compact: billCompact,
  detailed: billDetailed,
  elegant: billElegant,
  minimal: billMinimal,
  professional: billProfessional,
};

// Lists for settings UI dropdowns
export const KOT_TEMPLATE_LIST = Object.values(KOT_TEMPLATES).map(t => ({
  id: t.id, name: t.name, description: t.description,
}));

export const BILL_TEMPLATE_LIST = Object.values(BILL_TEMPLATES).map(t => ({
  id: t.id, name: t.name, description: t.description,
}));

// Render KOT HTML using the selected template
export function renderKOT(kotData, printSettings = {}, labels = {}) {
  const templateId = printSettings.kotTemplate || 'classic';
  const template = KOT_TEMPLATES[templateId] || KOT_TEMPLATES.classic;
  return template.render(kotData, printSettings, labels);
}

// Render Bill/Invoice HTML using the selected template
export function renderBill(invoice, printSettings = {}, labels = {}) {
  const templateId = printSettings.billTemplate || 'classic';
  const template = BILL_TEMPLATES[templateId] || BILL_TEMPLATES.classic;
  // Order-type-aware footer: "Thank you for dining with us!" only fits dine-in. For
  // takeaway / delivery / pickup use a neutral thank-you instead. Only applied when the
  // restaurant hasn't set an explicit custom footer (labels.footer absent), so a custom
  // footer is never overridden. Dine-in and unknown/custom types keep the default.
  const ot = String(invoice.orderType || '').toLowerCase();
  const isNonDineIn = /take\s*-?\s*away|delivery|pick\s*-?\s*up|parcel|to\s*-?\s*go|togo/.test(ot);
  if (isNonDineIn && labels.footer == null) {
    labels = { ...labels, footer: 'Thank you for your order!' };
  }
  return template.render(invoice, printSettings, labels);
}
