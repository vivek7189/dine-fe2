'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaTimes, FaDownload, FaFileUpload, FaCheckCircle, FaExclamationCircle, FaCopy } from 'react-icons/fa';
import { t } from '../../lib/i18n';
import { categoryLabel, fmtDay } from '../../lib/calendar';
import {
  IMPORT_FIELDS, IMPORT_MAX_ROWS, REQUIRED_FIELDS, autoMap, buildPreview, downloadTemplate, readSheetFile,
} from '../../lib/calendarImport';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Import many custom events from CSV / Excel: template → upload → map columns → preview → import → summary.
 * existing: events already loaded in the calendar ([{ name, date }]) for a best-effort duplicate check.
 */
export default function ImportEventsModal({ existing = [], onClose, onImport }) {
  const [step, setStep] = useState('pick'); // pick | preview | result
  const [file, setFile] = useState(null); // { name, headers, rows }
  const [map, setMap] = useState({});
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !importing) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, importing]);

  const preview = useMemo(() => (file ? buildPreview(file.rows, map, existing) : []), [file, map, existing]);
  const ready = preview.filter((r) => !r.errors.length && !r.duplicate);
  const badCount = preview.filter((r) => r.errors.length).length;
  const dupCount = preview.filter((r) => r.duplicate).length;
  const missingRequired = REQUIRED_FIELDS.filter((f) => !(map[f] >= 0));
  const shown = onlyProblems ? preview.filter((r) => r.errors.length || r.duplicate) : preview;

  const handleFile = async (f) => {
    if (!f) return;
    setError('');
    if (!/\.(csv|xlsx|xls|tsv|txt)$/i.test(f.name || '')) { setError(t('eventCalendar.import.badType')); return; }
    if (f.size > MAX_FILE_BYTES) { setError(t('eventCalendar.import.tooBig')); return; }
    setReading(true);
    try {
      const { headers, rows } = await readSheetFile(f);
      if (!headers.length || !rows.length) { setError(t('eventCalendar.import.noRows')); return; }
      setFile({ name: f.name, headers, rows });
      setMap(autoMap(headers));
      setOnlyProblems(false);
      setStep('preview');
    } catch {
      setError(t('eventCalendar.import.readFailed'));
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const runImport = async () => {
    if (!ready.length || importing) return;
    setImporting(true); setError('');
    try {
      const res = await onImport(ready.map((r) => r.event));
      // Server rows are indexes into the sent list → translate to file row numbers.
      const errors = (Array.isArray(res?.errors) ? res.errors : []).map((e) => {
        const idx = Number(e?.row);
        const fileRow = Number.isInteger(idx) && ready[idx] ? ready[idx].rowNum : null;
        return { row: fileRow, message: e?.message || '' };
      });
      setResult({
        created: Number(res?.created || 0),
        skipped: Number(res?.skipped || 0) + dupCount,
        invalid: badCount,
        errors,
      });
      setStep('result');
    } catch (err) {
      setError(err?.message || t('eventCalendar.import.failed'));
    } finally {
      setImporting(false);
    }
  };

  const reset = () => { setFile(null); setMap({}); setResult(null); setError(''); setStep('pick'); };

  const btn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' };
  const primary = { ...btn, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700 };
  const stepTitle = { fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 };
  const stepNum = { width: 20, height: 20, borderRadius: 999, background: '#0f172a', color: '#fff', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

  const fieldLabel = (f) => t(`eventCalendar.import.fields.${f}`);
  const fmt = (d) => (d ? fmtDay(d, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

  return (
    <div role="dialog" aria-modal="true" aria-label={t('eventCalendar.import.title')} className="dcal-imp"
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`
        .dcal-imp table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .dcal-imp th { text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; padding: 8px 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; white-space: nowrap; }
        .dcal-imp td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: top; }
        .dcal-imp tr.bad td { background: #fef2f2; }
        .dcal-imp tr.dup td { background: #fffbeb; }
        .dcal-imp .map-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
        .dcal-imp select { width: 100%; padding: 7px 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: #fff; color: #0f172a; font-family: inherit; }
        .dcal-imp .stat { flex: 1 1 90px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
        .dcal-imp .stat b { display: block; font-size: 22px; font-weight: 800; }
        .dcal-imp .stat span { font-size: 12px; color: #64748b; font-weight: 600; }
        @media (max-width: 640px) {
          .dcal-imp { padding: 0 !important; align-items: flex-end !important; }
          .dcal-imp .panel { max-width: 100% !important; border-radius: 18px 18px 0 0 !important; max-height: 94vh !important; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important; }
          .dcal-imp .hide-sm { display: none; }
        }
      `}</style>
      <div onClick={() => { if (!importing) onClose(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }} />
      <div className="panel" style={{ position: 'relative', width: '100%', maxWidth: step === 'preview' ? 860 : 520, maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.25)', padding: 20, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{t('eventCalendar.import.title')}</h2>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {step === 'preview' && file ? file.name : t('eventCalendar.import.subtitle')}
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={importing} aria-label={t('common.close')} style={{ border: 'none', background: '#f1f5f9', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaTimes /></button>
        </div>

        <div style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
          {step === 'pick' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={stepTitle}><span style={stepNum}>1</span>{t('eventCalendar.import.step1')}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{t('eventCalendar.import.step1Hint')}</div>
                <button type="button" style={btn} onClick={() => downloadTemplate()}><FaDownload size={12} /> {t('eventCalendar.import.downloadTemplate')}</button>
              </div>
              <div>
                <div style={stepTitle}><span style={stepNum}>2</span>{t('eventCalendar.import.step2')}</div>
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer?.files?.[0]); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '26px 16px', border: `2px dashed ${dragOver ? '#6366f1' : '#cbd5e1'}`, borderRadius: 14, background: dragOver ? '#eef2ff' : '#f8fafc', cursor: reading ? 'default' : 'pointer', textAlign: 'center' }}>
                  <FaFileUpload size={26} color="#64748b" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{reading ? t('eventCalendar.import.reading') : t('eventCalendar.import.chooseFile')}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{t('eventCalendar.import.fileHint', { max: IMPORT_MAX_ROWS })}</span>
                  <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    disabled={reading} onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
                </label>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{t('eventCalendar.import.dateFormats')}</div>
              </div>
            </div>
          )}

          {step === 'preview' && file && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={stepTitle}>{t('eventCalendar.import.mapColumns')}</div>
                <div className="map-grid">
                  {IMPORT_FIELDS.map((f) => (
                    <label key={f} style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      <span style={{ display: 'block', marginBottom: 4 }}>{fieldLabel(f)}{REQUIRED_FIELDS.includes(f) ? ' *' : ''}</span>
                      <select value={map[f] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [f]: Number(e.target.value) }))}
                        style={{ borderColor: REQUIRED_FIELDS.includes(f) && !(map[f] >= 0) ? '#f87171' : undefined }}>
                        <option value={-1}>{t('eventCalendar.import.notInFile')}</option>
                        {file.headers.map((h, i) => <option key={i} value={i}>{h || t('eventCalendar.import.columnN', { n: i + 1 })}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              {missingRequired.length > 0 ? (
                <div role="alert" style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>
                  {t('eventCalendar.import.mapRequired', { fields: missingRequired.map(fieldLabel).join(', ') })}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: '#047857', background: '#ecfdf5', borderRadius: 999, padding: '3px 10px' }}>{t('eventCalendar.import.readyN', { n: ready.length })}</span>
                    {badCount > 0 && <span style={{ fontWeight: 700, color: '#b91c1c', background: '#fef2f2', borderRadius: 999, padding: '3px 10px' }}>{t('eventCalendar.import.errorsN', { n: badCount })}</span>}
                    {dupCount > 0 && <span style={{ fontWeight: 700, color: '#92400e', background: '#fffbeb', borderRadius: 999, padding: '3px 10px' }}>{t('eventCalendar.import.duplicatesN', { n: dupCount })}</span>}
                    {file.rows.length > IMPORT_MAX_ROWS && <span style={{ color: '#b45309', fontWeight: 600 }}>{t('eventCalendar.import.tooMany', { max: IMPORT_MAX_ROWS })}</span>}
                    {(badCount > 0 || dupCount > 0) && (
                      <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#334155', cursor: 'pointer' }}>
                        <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} /> {t('eventCalendar.import.onlyProblems')}
                      </label>
                    )}
                  </div>
                  {(badCount > 0 || dupCount > 0) && <div style={{ fontSize: 12, color: '#64748b', marginTop: -6 }}>{t('eventCalendar.import.skipNote')}</div>}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'auto', maxHeight: '42vh' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{fieldLabel('name')}</th>
                          <th>{fieldLabel('date')}</th>
                          <th className="hide-sm">{fieldLabel('repeat_yearly')}</th>
                          <th className="hide-sm">{fieldLabel('category')}</th>
                          <th className="hide-sm">{fieldLabel('expected_crowd')}</th>
                          <th>{t('eventCalendar.import.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((r) => {
                          const ev = r.event;
                          return (
                            <tr key={r.rowNum} className={r.errors.length ? 'bad' : r.duplicate ? 'dup' : ''}>
                              <td style={{ color: '#94a3b8' }}>{r.rowNum}</td>
                              <td style={{ fontWeight: 600, maxWidth: 220, wordBreak: 'break-word' }}>{ev.name || '—'}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{ev.date ? fmt(ev.date) : '—'}{ev.endDate ? ` – ${fmt(ev.endDate)}` : ''}</td>
                              <td className="hide-sm">{ev.repeatYearly === undefined ? '—' : ev.repeatYearly ? t('eventCalendar.import.yes') : t('eventCalendar.import.no')}</td>
                              <td className="hide-sm">{categoryLabel(ev.category)}</td>
                              <td className="hide-sm">{t(`eventCalendar.crowd.${ev.expectedCrowd}`)}</td>
                              <td style={{ minWidth: 120 }}>
                                {r.errors.length ? (
                                  <span style={{ color: '#b91c1c', fontWeight: 600, display: 'inline-flex', gap: 5, alignItems: 'flex-start' }}>
                                    <FaExclamationCircle size={12} style={{ marginTop: 2, flexShrink: 0 }} /> {r.errors.map((k) => t(`eventCalendar.import.${k}`)).join(' · ')}
                                  </span>
                                ) : r.duplicate ? (
                                  <span style={{ color: '#92400e', fontWeight: 600, display: 'inline-flex', gap: 5, alignItems: 'center' }}><FaCopy size={11} /> {t('eventCalendar.import.duplicate')}</span>
                                ) : (
                                  <span style={{ color: '#047857', fontWeight: 600, display: 'inline-flex', gap: 5, alignItems: 'center' }}><FaCheckCircle size={12} /> {t('eventCalendar.import.ok')}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'result' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                <FaCheckCircle color="#16a34a" size={20} /> {t('eventCalendar.import.doneTitle')}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="stat"><b style={{ color: '#047857' }}>{result.created}</b><span>{t('eventCalendar.import.created')}</span></div>
                <div className="stat"><b style={{ color: '#92400e' }}>{result.skipped}</b><span>{t('eventCalendar.import.skipped')}</span></div>
                <div className="stat"><b style={{ color: '#b91c1c' }}>{result.invalid + result.errors.length}</b><span>{t('eventCalendar.import.errors')}</span></div>
              </div>
              {result.errors.length > 0 && (
                <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 12, fontSize: 13, color: '#991b1b', maxHeight: 180, overflowY: 'auto' }}>
                  {result.errors.map((e, i) => (
                    <div key={i}>{e.row ? t('eventCalendar.import.rowError', { row: e.row, message: e.message }) : e.message}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <div role="alert" style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          {step === 'pick' && <button type="button" style={btn} onClick={onClose}>{t('common.cancel')}</button>}
          {step === 'preview' && (
            <>
              <button type="button" style={btn} disabled={importing} onClick={reset}>{t('eventCalendar.import.changeFile')}</button>
              <button type="button" style={{ ...primary, opacity: !ready.length || importing || missingRequired.length ? 0.5 : 1, cursor: !ready.length || importing ? 'default' : 'pointer' }}
                disabled={!ready.length || importing || missingRequired.length > 0} onClick={runImport}>
                {importing ? t('eventCalendar.import.importing') : t('eventCalendar.import.importN', { n: ready.length })}
              </button>
            </>
          )}
          {step === 'result' && (
            <>
              <button type="button" style={btn} onClick={reset}>{t('eventCalendar.import.another')}</button>
              <button type="button" style={primary} onClick={onClose}>{t('eventCalendar.import.done')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
