// Bulk import of a restaurant's own calendar events from CSV / Excel.
// Parsing uses the project's `xlsx` (SheetJS) package, loaded on demand — it reads .csv, .xlsx and .xls.
import { CALENDAR_CATEGORIES } from './calendar';

export const IMPORT_MAX_ROWS = 500;

export const IMPORT_FIELDS = ['name', 'date', 'end_date', 'repeat_yearly', 'category', 'expected_crowd', 'notes'];
export const REQUIRED_FIELDS = ['name', 'date'];

// Header synonyms used for auto-mapping (compared after normalising: lower-case, letters/digits only).
const FIELD_SYNONYMS = {
  name: ['name', 'eventname', 'event', 'title', 'occasion', 'eventtitle'],
  date: ['date', 'startdate', 'start', 'from', 'eventdate', 'day', 'fromdate'],
  end_date: ['enddate', 'end', 'to', 'until', 'till', 'todate', 'lastday'],
  repeat_yearly: ['repeatyearly', 'repeat', 'yearly', 'annual', 'recurring', 'repeatsyearly', 'everyyear', 'repeateveryyear'],
  category: ['category', 'type', 'eventtype', 'kind'],
  expected_crowd: ['expectedcrowd', 'crowd', 'rush', 'expectedrush', 'busy', 'demand'],
  notes: ['notes', 'note', 'description', 'remarks', 'comment', 'comments', 'details'],
};

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function templateCsv() {
  const y = new Date().getFullYear() + 1;
  const rows = [
    IMPORT_FIELDS.join(','),
    `Restaurant anniversary,15/03/${y},,yes,custom,very_busy,Cake for regulars + live music`,
    `Food festival week,${y}-07-10,${y}-07-16,no,cultural,busy,"Special menu, extra kitchen staff"`,
  ];
  // BOM so Excel opens it as UTF-8.
  return `﻿${rows.join('\r\n')}\r\n`;
}

export function downloadTemplate(filename = 'calendar-events-template.csv') {
  const blob = new Blob([templateCsv()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// → { headers: string[], rows: any[][] } (first non-empty row = header)
export async function readSheetFile(file) {
  const XLSX = await import('xlsx');
  const isText = /\.(csv|tsv|txt)$/i.test(file.name || '') || /text\//.test(file.type || '');
  let wb;
  if (isText) {
    let text = await file.text();
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    // raw: keep every value as typed — SheetJS would otherwise guess US month/day order for "08/11/2026".
    wb = XLSX.read(text, { type: 'string', raw: true });
  } else {
    wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  }
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return { headers: [], rows: [] };
  const all = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '', blankrows: false });
  const nonEmpty = all.filter((r) => Array.isArray(r) && r.some((c) => String(c ?? '').trim() !== ''));
  if (!nonEmpty.length) return { headers: [], rows: [] };
  const [head, ...rows] = nonEmpty;
  return { headers: head.map((h) => String(h ?? '').trim()), rows };
}

// { field: columnIndex | -1 }
export function autoMap(headers) {
  const used = new Set();
  const map = {};
  for (const f of IMPORT_FIELDS) {
    const syn = FIELD_SYNONYMS[f];
    let idx = headers.findIndex((h, i) => !used.has(i) && syn.includes(norm(h)));
    if (idx === -1) idx = headers.findIndex((h, i) => !used.has(i) && norm(h) && syn.some((s) => s.length > 3 && norm(h).includes(s)));
    if (idx !== -1) used.add(idx);
    map[f] = idx;
  }
  return map;
}

const pad = (n) => String(n).padStart(2, '0');

function validYmd(y, m, d) {
  if (!(y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Normalise a date cell to "YYYY-MM-DD" (null when empty, false when invalid).
 * Accepts YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (2-digit years → 20YY),
 * Excel serial numbers and Date objects.
 */
export function parseImportDate(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return false;
    return validYmd(v.getFullYear(), v.getMonth() + 1, v.getDate()) || false;
  }
  if (typeof v === 'number') {
    if (!(v > 1 && v < 120000)) return false;
    const dt = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000);
    return validYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()) || false;
  }
  const s = String(v).trim().replace(/\s+.*$/, ''); // drop a trailing time part
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return validYmd(+m[1], +m[2], +m[3]) || false;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return validYmd(y, +m[2], +m[1]) || false;
  }
  if (/^\d{5}$/.test(s)) return parseImportDate(Number(s));
  return false;
}

function parseBool(v) {
  if (typeof v === 'boolean') return v;
  const s = norm(v);
  if (!s) return undefined;
  if (['yes', 'y', 'true', '1', 'yearly', 'annual', 'repeat', 'haan', 'si', 'oui', 'ja', 'sim'].includes(s)) return true;
  if (['no', 'n', 'false', '0', 'once', 'nahi', 'non', 'nein', 'nao'].includes(s)) return false;
  return undefined;
}

function parseCategory(v) {
  const s = norm(v);
  if (!s) return undefined;
  const hit = CALENDAR_CATEGORIES.find((c) => norm(c) === s);
  if (hit) return hit;
  if (s === 'public' || s === 'publicholiday' || s === 'holiday') return 'national';
  if (s === 'sport') return 'sports';
  if (s === 'own' || s === 'ourevents' || s === 'ourevent' || s === 'restaurant') return 'custom';
  return 'custom';
}

function parseCrowd(v) {
  const s = norm(v);
  if (!s) return undefined;
  if (['verybusy', 'veryhigh', 'packed', 'high'].includes(s)) return 'very_busy';
  if (s === 'busy' || s === 'medium') return 'busy';
  if (s === 'normal' || s === 'low' || s === 'quiet' || s === 'regular') return 'normal';
  return undefined;
}

/**
 * Build validated preview rows.
 * existing: [{ name, date }] already in the calendar (best-effort duplicate check).
 * → [{ rowNum, values, event, errors: string[] (i18n keys), duplicate: bool }]
 */
export function buildPreview(rows, map, existing = []) {
  const seen = new Set(existing.map((e) => `${String(e.name || '').trim().toLowerCase()}|${e.date}`));
  const cell = (r, f) => (map[f] >= 0 ? r[map[f]] : '');
  return rows.slice(0, IMPORT_MAX_ROWS).map((r, i) => {
    const errors = [];
    const name = String(cell(r, 'name') ?? '').trim().slice(0, 120);
    const date = parseImportDate(cell(r, 'date'));
    const end = parseImportDate(cell(r, 'end_date'));
    if (!name) errors.push('errName');
    if (!date) errors.push(date === null ? 'errDateMissing' : 'errDate');
    if (end === false) errors.push('errEndDate');
    else if (end && date && end < date) errors.push('errEndBeforeStart');
    const repeatYearly = parseBool(cell(r, 'repeat_yearly'));
    const category = parseCategory(cell(r, 'category'));
    const expectedCrowd = parseCrowd(cell(r, 'expected_crowd'));
    const notes = String(cell(r, 'notes') ?? '').trim().slice(0, 1000);
    const event = {
      name,
      date: date || '',
      endDate: end && date && end !== date ? end : null,
      ...(repeatYearly !== undefined ? { repeatYearly } : {}),
      category: category || 'custom',
      expectedCrowd: expectedCrowd || 'normal',
      ...(notes ? { notes } : {}),
    };
    let duplicate = false;
    if (!errors.length) {
      const k = `${name.toLowerCase()}|${date}`;
      if (seen.has(k)) duplicate = true;
      else seen.add(k);
    }
    return { rowNum: i + 2, event, errors, duplicate };
  });
}
