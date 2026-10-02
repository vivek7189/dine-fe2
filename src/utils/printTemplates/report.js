// Generic printed report slip (shift reports, register X / Z reports).
// Thermal-safe like the shift summary: pure #000, dashed rules, one narrow column, honours the
// restaurant's Print Settings (paper width, font, scale). Returns BOTH:
//   html — for the desktop app's silent bill printer / the browser print dialog
//   text — plain text at the paper's character width (58 mm = 32, 80 mm = 48) for phone thermal
//          printers in the mobile app, which print text.
//
// sections: [{ title?, rows: [[label, value, bold?], …] }]  — a row may also be a plain string.

import {
  esc, getPrintFontSizes, getPrintFontFamily, getContentWidth, wrapInDocument, formatDateTime,
} from './helpers';

const charsFor = (printSettings = {}) => (Number(printSettings.printerWidth) === 58 ? 32 : 48);

function css(printSettings = {}) {
  const f = getPrintFontSizes(printSettings.billFontScale || printSettings.billFontSize || 100);
  const ff = getPrintFontFamily(printSettings.billFontFamily);
  const cw = getContentWidth(printSettings.printerWidth, printSettings.printContentWidth);
  return `@page{size:${cw} auto;margin:0;}`
    + `*{box-sizing:border-box;color:#000;}`
    + `body{font-family:${ff};margin:0;padding:1mm 2mm;font-size:${f.body};line-height:1.35;`
    + `width:${cw};max-width:${cw};color:#000;overflow-wrap:break-word;word-wrap:break-word;}`
    + `.hd{text-align:center;margin-bottom:4px;}`
    + `.rest{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;}`
    + `.title{font-size:${f.billTitle};font-weight:bold;margin-top:3px;}`
    + `.sub{font-size:11px;}`
    + `.divider{text-align:center;margin:3px 0;overflow:hidden;font-size:12px;letter-spacing:1px;}`
    + `.row{display:flex;justify-content:space-between;gap:6px;margin:1px 0;font-size:${f.info};}`
    + `.row span:last-child{text-align:right;white-space:nowrap;}`
    + `.row.b{font-weight:bold;}`
    + `.sec{font-weight:bold;text-transform:uppercase;font-size:11px;margin:5px 0 2px;}`
    + `.line{font-size:${f.info};margin:1px 0;}`
    + `.foot{margin-top:6px;text-align:center;font-size:${f.footer};}`;
}

const DASH = '<div class="divider">--------------------------------</div>';

// Plain-text helpers (ASCII only — thermal code pages can't print ₹ etc.).
const ascii = (s) => String(s ?? '').replace(/₹/g, 'Rs').replace(/[^\x20-\x7E]/g, '');
const center = (s, w) => { const t = ascii(s).slice(0, w); return ' '.repeat(Math.max(0, Math.floor((w - t.length) / 2))) + t; };
const lr = (l, r, w) => {
  const L = ascii(l), R = ascii(r);
  if (L.length + R.length + 1 <= w) return L + ' '.repeat(w - L.length - R.length) + R;
  // Too long for one line: label on its own line, value right-aligned, wrapped (never cut).
  const parts = [];
  let cur = '';
  for (const word of R.split(' ')) {
    if (cur && (cur + ' ' + word).length > w) { parts.push(cur); cur = word; } else cur = cur ? cur + ' ' + word : word;
  }
  if (cur) parts.push(cur);
  return [L.slice(0, w), ...parts.map(p => ' '.repeat(Math.max(0, w - p.length)) + p.slice(0, w))].join('\n');
};
const wrap = (s, w) => {
  const out = []; let line = '';
  for (const word of ascii(s).split(/\s+/)) {
    if ((line + ' ' + word).trim().length > w) { if (line) out.push(line); line = word.slice(0, w); } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line);
  return out;
};

/**
 * @param {{restaurantName?:string, title:string, subLines?:string[], sections:Array, footerNote?:string}} report
 * @param {object} printSettings
 * @returns {{html:string, text:string}}
 */
export function buildReportSlip(report = {}, printSettings = {}) {
  const { restaurantName, title, subLines = [], sections = [], footerNote } = report;
  const now = formatDateTime();
  const W = charsFor(printSettings);

  // HTML
  const row = (l, v, b) => `<div class="row${b ? ' b' : ''}"><span>${esc(l)}</span><span>${esc(v)}</span></div>`;
  let body = `<div class="hd"><div class="rest">${esc(restaurantName || 'Restaurant')}</div>`
    + `<div class="title">${esc(title)}</div>`
    + subLines.filter(Boolean).map(l => `<div class="sub">${esc(l)}</div>`).join('')
    + `</div>`;
  for (const sec of sections) {
    body += DASH;
    if (sec.title) body += `<div class="sec">${esc(sec.title)}</div>`;
    for (const r of sec.rows || []) body += typeof r === 'string' ? `<div class="line">${esc(r)}</div>` : row(r[0], r[1], r[2]);
  }
  body += DASH + (footerNote ? `<div class="sub">${esc(footerNote)}</div>` : '') + `<div class="foot">Printed ${esc(now.combined)}</div>`;
  const html = wrapInDocument(title || 'Report', css(printSettings), body);

  // Text
  const T = [];
  const rule = '-'.repeat(W);
  T.push(center(restaurantName || 'Restaurant', W), center(title, W));
  subLines.filter(Boolean).forEach(l => wrap(l, W).forEach(x => T.push(center(x, W))));
  for (const sec of sections) {
    T.push(rule);
    if (sec.title) T.push(ascii(sec.title).toUpperCase().slice(0, W));
    for (const r of sec.rows || []) {
      if (typeof r === 'string') wrap(r, W).forEach(x => T.push(x));
      else T.push(lr(r[0], r[1], W));
    }
  }
  T.push(rule);
  if (footerNote) wrap(footerNote, W).forEach(x => T.push(x));
  T.push(center(`Printed ${now.combined}`, W), '', '');
  return { html, text: T.join('\n') };
}

export default { buildReportSlip };
