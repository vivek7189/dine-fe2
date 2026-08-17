// Shift / End-of-Shift summary slip.
// Thermal-safe: everything is pure #000 (1-bit printers dither grey into garble),
// borders are dashed hyphen rules, layout is a narrow single column. Mirrors the
// bill templates' scale/font/width handling so it honours the same Print Settings.

import {
  esc, getPrintFontSizes, getPrintFontFamily, getContentWidth,
  wrapInDocument, buildIdentityHtml, formatDateTime,
} from '../helpers';

export const id = 'shift-summary';
export const name = 'Shift Summary';
export const description = 'End-of-shift cash & sales summary slip for thermal printers.';

function getShiftCSS(scaleOrPreset, fontId, printerWidth, printSettings) {
  const f = getPrintFontSizes(scaleOrPreset);
  const ff = getPrintFontFamily(fontId);
  const cw = getContentWidth(printerWidth, printSettings?.printContentWidth);
  return `@page{size:${cw} auto;margin:0;}`
    + `*{box-sizing:border-box;color:#000;}`
    + `body{font-family:${ff};margin:0;padding:1mm 2mm;font-size:${f.body};line-height:1.35;`
    + `width:${cw};max-width:${cw};color:#000;overflow-wrap:break-word;word-wrap:break-word;}`
    + `.sh-header{text-align:center;margin-bottom:4px;}`
    + `.sh-rest{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;}`
    + `.sh-title{font-size:${f.billTitle};font-weight:bold;margin-top:3px;}`
    + `.sh-sub{font-size:11px;}`
    + `.divider{text-align:center;margin:3px 0;overflow:hidden;font-size:12px;letter-spacing:1px;}`
    + `.row{display:flex;justify-content:space-between;gap:6px;margin:1px 0;font-size:${f.info};}`
    + `.row span:last-child{text-align:right;}`
    + `.row.b{font-weight:bold;}`
    + `.sec{font-weight:bold;text-transform:uppercase;font-size:11px;margin:5px 0 2px;}`
    + `.foot{margin-top:6px;text-align:center;font-size:${f.footer};}`;
}

const DASH = '<div class="divider">--------------------------------</div>';

function fmtDT(v) {
  if (!v) return '-';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return '-'; }
}

/**
 * Build a thermal-ready HTML slip for a closed shift.
 * @param {object} data  Shift summary + context (see fields below).
 * @param {object} printSettings  Restaurant print settings (font/width/layout).
 * @returns {string} full HTML document ready for printDocument / hidden-frame print.
 */
export function buildShiftSummaryHtml(data = {}, printSettings = {}) {
  const {
    restaurantName, restaurantAddress, restaurantPhone,
    cashierName, shiftId, openedAt, closedAt,
    openingCash, cashSales, cardSales, upiSales, totalSales,
    cashIn, cashOut, cashTips, expectedCash, closingCash, cashDifference,
    orderCount, currencySymbol = '', notes,
  } = data;

  const cs = currencySymbol;
  const money = (n) => `${cs}${(Number(n) || 0).toFixed(2)}`;
  const scale = printSettings.billFontScale || printSettings.billFontSize || 100;
  const css = getShiftCSS(scale, printSettings.billFontFamily, printSettings.printerWidth, printSettings);

  const identity = buildIdentityHtml(
    { restaurantName, restaurantAddress, restaurantPhone },
    printSettings
  );
  const now = formatDateTime();

  const diff = (cashDifference != null && cashDifference !== undefined)
    ? Number(cashDifference)
    : ((Number(closingCash) || 0) - (Number(expectedCash) || 0));
  const diffStr = `${diff >= 0 ? '+' : '-'}${money(Math.abs(diff))}`;

  const row = (l, v, cls = '') => `<div class="row ${cls}"><span>${esc(l)}</span><span>${v}</span></div>`;

  const body = `<div class="sh-header">`
    + `<div class="sh-rest">${esc(restaurantName || 'Restaurant')}</div>`
    + identity
    + `<div class="sh-title">END OF SHIFT REPORT</div>`
    + `</div>`
    + DASH
    + (cashierName ? row('Cashier', esc(cashierName)) : '')
    + (shiftId ? row('Shift', esc(String(shiftId).slice(-6).toUpperCase())) : '')
    + row('Opened', esc(fmtDT(openedAt)))
    + row('Closed', esc(fmtDT(closedAt || Date.now())))
    + DASH
    + `<div class="sec">Sales</div>`
    + row('Cash', money(cashSales))
    + row('Card', money(cardSales))
    + row('UPI', money(upiSales))
    + row('Total Sales', money(totalSales), 'b')
    + DASH
    + `<div class="sec">Cash Drawer</div>`
    + row('Opening Cash', money(openingCash))
    + row('Cash In', '+' + money(cashIn))
    + row('Cash Out', '-' + money(cashOut))
    + ((Number(cashTips) || 0) > 0 ? row('Cash Tips', money(cashTips)) : '')
    + row('Expected Cash', money(expectedCash), 'b')
    + row('Closing Cash', money(closingCash), 'b')
    + DASH
    + row('Difference', diffStr, 'b')
    + row('Total Orders', String(orderCount ?? '-'))
    + (notes ? `${DASH}<div class="sh-sub">Notes: ${esc(notes)}</div>` : '')
    + `<div class="foot">Printed ${esc(now.combined)}</div>`;

  return wrapInDocument('Shift Report', css, body);
}

const shiftSummaryTemplate = { id, name, description, buildShiftSummaryHtml };
export default shiftSummaryTemplate;
