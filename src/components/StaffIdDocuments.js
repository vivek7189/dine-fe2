'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaIdCard, FaCarSide, FaPassport, FaFileAlt, FaPlus, FaTrash, FaSave, FaLock, FaPaperclip, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';
import { countries } from '../lib/countries';

/**
 * StaffIdDocuments — "ID & licence" for one staff member, any country: identity documents, driving
 * licences, visas / work permits, tax numbers, certificates, or "Other" with your own name.
 * Everything comes from the server catalogue (utils/staffIdDocs: generic types + the country's own,
 * e.g. Aadhaar / Emirates ID / Iqama / SSN) — nothing about countries is fixed in this screen.
 * Card photos are encrypted private files, opened only for people allowed to see them.
 * `self` → the signed-in person's own (/api/staff/me/id-documents), else `staffId`.
 */
// One entry per country (the shared phone list repeats a few codes).
const COUNTRY_LIST = countries.filter((c, i, a) => a.findIndex(x => x.code === c.code) === i);
const CAT_ICON = { identity: FaIdCard, driving_licence: FaCarSide, work_authorisation: FaPassport };
const QUICK_ADD = [['identity', 'ID card'], ['driving_licence', 'Driving licence'], ['work_authorisation', 'Visa / permit'], ['other', 'Other']];
const fmtSize = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const todayYmd = () => new Date().toISOString().slice(0, 10);
const daysUntil = (ymd) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || ''))) return null;
  const t = todayYmd();
  return Math.round((Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) - Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10))) / 86400000);
};

export default function StaffIdDocuments({ staffId, self = false, canEdit = true, isMobile = false }) {
  const who = self ? 'me' : staffId;
  const [docs, setDocs] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [editable, setEditable] = useState(false);
  const [uploadsEnabled, setUploadsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);
  const pickFor = useRef(null);

  useEffect(() => {
    if (!who) return;
    let alive = true;
    setLoading(true); setMsg(null); setDirty(false);
    apiClient.getStaffIdDocuments(who)
      .then(r => {
        if (!alive) return;
        setDocs(r?.documents || []); setCatalog(r?.catalog || null);
        setEditable(!!(canEdit && r?.access?.edit)); setUploadsEnabled(r?.uploadsEnabled !== false);
      })
      .catch(err => { if (alive) setMsg({ type: 'err', text: err?.message || 'Could not load the documents.' }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [who, canEdit]);

  const home = catalog?.country || '';
  const allTypes = useMemo(() => catalog?.allTypes || [], [catalog]);
  const typeOf = (key) => allTypes.find(t => t.key === key) || allTypes.find(t => t.key === 'other') || { key: 'other', label: 'Other', category: 'other' };
  // Types offered for a document from `country`: that country's own names + the ones every country has.
  const typesFor = (country) => {
    const c = country || home;
    const own = allTypes.filter(t => t.countries && c && t.countries.includes(c));
    return [...own, ...allTypes.filter(t => !t.countries)];
  };
  const catLabel = (key) => (catalog?.categories || []).find(c => c.key === key)?.label || key;

  const change = (i, patch) => { setDocs(prev => prev.map((d, j) => (j === i ? { ...d, ...patch } : d))); setDirty(true); setMsg(null); };
  const add = (category) => {
    const t = typesFor(home).find(x => x.category === category) || typeOf('other');
    setDocs(prev => [...prev, { id: '', type: t.key, category: t.category, country: home, number: '', issuedBy: '', issueDate: '', expiryDate: '', classes: [], notes: '', files: [], label: '' }]);
    setDirty(true); setMsg(null);
  };
  const remove = (i) => {
    const d = docs[i];
    if ((d.number || d.numberDisplay || (d.files || []).length) && typeof window !== 'undefined' && !window.confirm(`Remove this ${d.label || typeOf(d.type).label}?`)) return;
    setDocs(prev => prev.filter((_, j) => j !== i)); setDirty(true);
  };

  const pick = (i) => { pickFor.current = i; if (fileRef.current) fileRef.current.click(); };
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    const i = pickFor.current;
    if (fileRef.current) fileRef.current.value = '';
    if (!file || i == null) return;
    setUploadingFor(i); setMsg(null);
    try {
      const r = await apiClient.uploadStaffIdFile(who, file);
      setDocs(prev => prev.map((d, j) => (j === i ? { ...d, files: [...(d.files || []), r.file] } : d)));
      setDirty(true);
    } catch (err) {
      setMsg({ type: 'err', text: err?.message || 'Upload failed.' });
    } finally { setUploadingFor(null); }
  };
  const open = async (f) => {
    try { await apiClient.openStaffIdFile(who, f.id); } catch (err) { setMsg({ type: 'err', text: err?.message || 'Could not open the file.' }); }
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const body = docs.map(d => ({ ...d, files: (d.files || []).map(f => f.id || f) }));
      const r = await apiClient.saveStaffIdDocuments(who, body);
      setDocs(r?.documents || []); setDirty(false);
      setMsg({ type: 'ok', text: 'Saved.' });
    } catch (err) {
      setMsg({ type: 'err', text: err?.message || 'Could not save.' });
    } finally { setSaving(false); }
  };

  const box = { backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginTop: '16px' };
  const input = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: editable ? '#fff' : '#f9fafb', boxSizing: 'border-box' };
  const label = { fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 };
  const grid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 };
  const field = (lbl, el) => <div><label style={label}>{lbl}</label>{el}</div>;

  return (
    <div style={box}>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFile} style={{ display: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0, fontSize: isMobile ? 14 : 16 }}>ID &amp; licence</h3>
          <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <FaLock size={9} /> Private — only {self ? 'you, the owner and your manager' : 'this person, the owner and their manager'} can see these. Photos are stored encrypted.
          </div>
        </div>
        {editable && (
          <button onClick={save} disabled={saving || loading || !dirty} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: 'none', background: saving || !dirty ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 12, cursor: saving || !dirty ? 'default' : 'pointer' }}>
            <FaSave size={11} /> {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
      {msg && <div style={{ background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'ok' ? '#166534' : '#b91c1c', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginTop: 8 }}>{msg.text}</div>}
      {dirty && editable && <div style={{ fontSize: 11, color: '#b45309', marginTop: 6 }}>Not saved yet — press Save.</div>}

      {loading ? (
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 10 }}>Loading…</div>
      ) : (
        <>
          {docs.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 10 }}>No ID or licence added yet.</div>}
          {docs.map((d, i) => {
            const t = typeOf(d.type);
            const Icon = CAT_ICON[t.category] || FaFileAlt;
            const left = t.hasExpiry ? daysUntil(d.expiryDate) : null;
            const classesSuggested = (d.country && d.country !== home ? catalog?.licenceClasses?.default : catalog?.licenceClasses?.suggested) || [];
            const typeOptions = typesFor(d.country);
            if (!typeOptions.some(x => x.key === t.key)) typeOptions.unshift(t);
            return (
              <div key={d.id || `new-${i}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: isMobile ? 10 : 12, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <Icon color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{t.customLabel ? (d.label || 'Other document') : t.label}</span>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>· {catLabel(t.category)}</span>
                  {left != null && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: left < 0 ? '#fee2e2' : left <= 30 ? '#fef3c7' : '#dcfce7', color: left < 0 ? '#b91c1c' : left <= 30 ? '#92400e' : '#166534' }}>
                      {left < 0 ? `Expired ${-left} day${left === -1 ? '' : 's'} ago` : left === 0 ? 'Expires today' : left <= 30 ? `Expires in ${left} day${left === 1 ? '' : 's'}` : 'Valid'}
                    </span>
                  )}
                  {editable && <button type="button" onClick={() => remove(i)} title="Remove" style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={10} /></button>}
                </div>
                <div style={grid}>
                  {field('Issuing country', (
                    <select disabled={!editable} value={d.country || ''} onChange={e => change(i, { country: e.target.value })} style={input}>
                      <option value="">—</option>
                      {COUNTRY_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  ))}
                  {field('Document', (
                    <select disabled={!editable} value={t.key} onChange={e => { const nt = typeOf(e.target.value); change(i, { type: nt.key, category: nt.category, ...(nt.maskNumber !== t.maskNumber ? { number: '', numberDisplay: '' } : {}) }); }} style={input}>
                      {typeOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                  ))}
                  {t.customLabel && field('Name of the document', <input disabled={!editable} placeholder="e.g. Fire safety training" value={d.label || ''} onChange={e => change(i, { label: e.target.value })} style={input} />)}
                  {field(t.maskNumber ? 'Number (only the last 4 are kept)' : 'Number', (
                    <input disabled={!editable} value={d.number || ''} placeholder={t.maskNumber && d.numberDisplay ? d.numberDisplay : ''} onChange={e => change(i, { number: e.target.value })} style={input} autoComplete="off" />
                  ))}
                  {field('Issued by (authority / state)', <input disabled={!editable} value={d.issuedBy || ''} onChange={e => change(i, { issuedBy: e.target.value })} style={input} />)}
                  {field('Issue date', <input disabled={!editable} type="date" value={d.issueDate || ''} onChange={e => change(i, { issueDate: e.target.value })} style={input} />)}
                  {t.hasExpiry && field('Valid until', <input disabled={!editable} type="date" value={d.expiryDate || ''} onChange={e => change(i, { expiryDate: e.target.value })} style={input} />)}
                </div>
                {t.hasClasses && (
                  <div style={{ marginTop: 10 }}>
                    <label style={label}>Vehicle classes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[...new Set([...classesSuggested, ...(d.classes || [])])].map(c => {
                        const on = (d.classes || []).includes(c);
                        return (
                          <button key={c} type="button" disabled={!editable} onClick={() => change(i, { classes: on ? d.classes.filter(x => x !== c) : [...(d.classes || []), c] })}
                            style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: editable ? 'pointer' : 'default', border: `1.5px solid ${on ? '#2563eb' : '#e5e7eb'}`, background: on ? '#eff6ff' : '#fff', color: on ? '#1d4ed8' : '#374151' }}>
                            {c}
                          </button>
                        );
                      })}
                      {editable && (
                        <input placeholder="+ other class" style={{ ...input, width: 120, padding: '4px 8px' }}
                          onKeyDown={e => { const v = e.currentTarget.value.trim(); if (e.key === 'Enter' && v) { e.preventDefault(); if (!(d.classes || []).includes(v)) change(i, { classes: [...(d.classes || []), v] }); e.currentTarget.value = ''; } }} />
                      )}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  {field('Notes', <input disabled={!editable} value={d.notes || ''} onChange={e => change(i, { notes: e.target.value })} style={input} />)}
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {(d.files || []).map(f => (
                    <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', borderRadius: 8, padding: '4px 8px', fontSize: 12 }}>
                      <button type="button" onClick={() => open(f)} title="Open" style={{ border: 'none', background: 'none', color: '#1d4ed8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 12 }}>
                        <FaExternalLinkAlt size={10} /> {f.name || 'Photo'}{f.size ? ` · ${fmtSize(f.size)}` : ''}
                      </button>
                      {editable && <button type="button" title="Remove" onClick={() => change(i, { files: d.files.filter(x => x.id !== f.id) })} style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', padding: 0 }}><FaTrash size={9} /></button>}
                    </span>
                  ))}
                  {editable && uploadsEnabled && (d.files || []).length < 4 && (
                    <button type="button" onClick={() => pick(i)} disabled={uploadingFor != null} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, border: '1px dashed #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: 12, cursor: uploadingFor != null ? 'wait' : 'pointer' }}>
                      {uploadingFor === i ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperclip size={10} />} {uploadingFor === i ? 'Uploading…' : 'Add photo / PDF (front, back)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {editable && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {QUICK_ADD.map(([cat, name]) => (
                <button key={cat} type="button" onClick={() => add(cat)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#6d28d9', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  <FaPlus size={10} /> {name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
