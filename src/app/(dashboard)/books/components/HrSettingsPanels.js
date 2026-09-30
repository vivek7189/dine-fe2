'use client';

import { useState } from 'react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa';
import {
  keyFromName, SUGGESTED_TEMPLATES, SUGGESTED_RECOMMENDATIONS,
  SUGGESTED_EARNINGS, SUGGESTED_DEDUCTIONS, SUGGESTED_PAYMENT_MODES,
} from '../hooks/useHrSettings';

/**
 * Settings panels for Books → Appraisals and Books → Payroll. Each panel edits a local copy and
 * saves one section through useHrSettings().save (owner / manager only — the server enforces it).
 */

const clone = (v) => JSON.parse(JSON.stringify(v || null));
const uniqueId = (base, taken) => { let id = base || 'item'; let n = 2; while (taken.has(id)) id = `${base}${n++}`; return id; };

// ── Generic named list: [{ <idField>, name }] with add / rename / reorder / remove + suggestions ──
export function NamedListEditor({ title, hint, items, idField, onChange, suggestions = [], locked = [], color = '#2563eb' }) {
  const [draft, setDraft] = useState('');
  const taken = new Set(items.map(i => i[idField]));
  const names = new Set(items.map(i => i.name.toLowerCase()));
  const add = (name) => {
    const n = String(name || '').trim();
    if (!n || names.has(n.toLowerCase())) return;
    onChange([...items, { [idField]: uniqueId(keyFromName(n) || 'item', taken), name: n }]);
    setDraft('');
  };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; onChange(next); };
  const pending = suggestions.filter(s => !names.has(s.toLowerCase()));
  return (
    <div style={box}>
      <div style={boxTitle}>{title}</div>
      {hint && <div style={hintStyle}>{hint}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={it[idField]} style={row}>
            <input value={it.name} maxLength={60}
              onChange={e => onChange(items.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
              style={{ ...inp, flex: 1 }} />
            <button type="button" title="Move up" onClick={() => move(i, -1)} style={iconBtn}><FaArrowUp size={10} /></button>
            <button type="button" title="Move down" onClick={() => move(i, 1)} style={iconBtn}><FaArrowDown size={10} /></button>
            <button type="button" title={locked.includes(it[idField]) ? 'Always available' : 'Remove'} disabled={locked.includes(it[idField])}
              onClick={() => onChange(items.filter((_, k) => k !== i))}
              style={{ ...iconBtn, color: '#dc2626', opacity: locked.includes(it[idField]) ? 0.3 : 1 }}><FaTrash size={10} /></button>
          </div>
        ))}
        {items.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af' }}>None yet.</div>}
      </div>
      <div style={{ ...row, marginTop: 8 }}>
        <input value={draft} maxLength={60} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(draft); } }}
          placeholder="Add new…" style={{ ...inp, flex: 1 }} />
        <button type="button" onClick={() => add(draft)} style={{ ...addBtn, background: color }}><FaPlus size={10} /> Add</button>
      </div>
      {pending.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center' }}>Suggestions:</span>
          {pending.map(s => <button type="button" key={s} onClick={() => add(s)} style={chip}>+ {s}</button>)}
        </div>
      )}
    </div>
  );
}

// ── Appraisal settings: templates (criteria per role) + recommendations ──
export function AppraisalSettingsPanel({ settings, staffRoles = [], onSave, onClose }) {
  const [templates, setTemplates] = useState(() => clone(settings.appraisal.templates));
  const [recs, setRecs] = useState(() => clone(settings.appraisal.recommendations));
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const t = templates[active] || templates[0];
  const setT = (patch) => setTemplates(ts => ts.map((x, i) => (i === active ? { ...x, ...patch } : x)));
  const allRoles = [...new Set([...staffRoles, ...templates.flatMap(x => x.roles || [])].map(r => String(r).toLowerCase()).filter(Boolean))].sort();
  const roleOwner = (r) => templates.findIndex(x => (x.roles || []).includes(r));
  const toggleRole = (r) => {
    const has = (t.roles || []).includes(r);
    // A role belongs to one template: assigning it here removes it from any other.
    setTemplates(ts => ts.map((x, i) => {
      if (i === active) return { ...x, roles: has ? x.roles.filter(y => y !== r) : [...(x.roles || []), r] };
      return has ? x : { ...x, roles: (x.roles || []).filter(y => y !== r) };
    }));
  };
  const addTemplate = (preset) => {
    const taken = new Set(templates.map(x => x.id));
    const base = preset ? clone(preset) : { id: 'custom', name: 'New template', roles: [], criteria: [{ key: 'workQuality', name: 'Work quality', weight: 1 }] };
    base.id = uniqueId(base.id, taken);
    // Roles already used by another template stay where they are.
    const used = new Set(templates.flatMap(x => x.roles || []));
    base.roles = (base.roles || []).filter(r => !used.has(r));
    setTemplates(ts => [...ts, base]);
    setActive(templates.length);
  };
  const removeTemplate = () => {
    if (templates.length <= 1) return;
    setTemplates(ts => ts.filter((_, i) => i !== active));
    setActive(0);
  };
  const setCriteria = (criteria) => setT({ criteria });
  const presets = SUGGESTED_TEMPLATES.filter(p => !templates.some(x => x.name.toLowerCase() === p.name.toLowerCase()));

  const save = async () => {
    setErr('');
    const bad = templates.find(x => !x.name.trim() || !(x.criteria || []).some(c => c.name.trim()));
    if (bad) { setErr(`Template "${bad.name || 'untitled'}" needs a name and at least one criterion.`); return; }
    setSaving(true);
    try { await onSave({ appraisal: { templates, recommendations: recs } }); onClose(); }
    catch (e) { setErr(e?.message || 'Could not save settings.'); }
    finally { setSaving(false); }
  };

  return (
    <Shell title="Appraisal settings" subtitle="Rate each role on what matters for their job. Existing reviews keep the criteria they were rated on." onClose={onClose} onSave={save} saving={saving} err={err}>
      <div style={box}>
        <div style={boxTitle}>Rating templates</div>
        <div style={hintStyle}>Each template is a list of criteria. Assign roles to a template — a staff member is reviewed with their role&apos;s template (the first template is used for everyone else).</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {templates.map((x, i) => (
            <button type="button" key={x.id} onClick={() => setActive(i)}
              style={{ ...chip, background: i === active ? '#d97706' : '#fff', color: i === active ? '#fff' : '#374151', borderColor: i === active ? '#d97706' : '#e5e7eb', fontWeight: 700 }}>
              {x.name || 'Untitled'}{i === 0 ? ' · default' : ''}
            </button>
          ))}
          <button type="button" onClick={() => addTemplate(null)} style={chip}><FaPlus size={9} /> New</button>
          {presets.map(p => <button type="button" key={p.id} onClick={() => addTemplate(p)} style={chip}>+ {p.name} (suggested)</button>)}
        </div>
        {t && (
          <div style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 12, background: '#fff' }}>
            <div style={{ ...row, marginBottom: 10 }}>
              <input value={t.name} maxLength={60} onChange={e => setT({ name: e.target.value })} placeholder="Template name" style={{ ...inp, flex: 1, fontWeight: 700 }} />
              {templates.length > 1 && <button type="button" onClick={removeTemplate} style={{ ...iconBtn, width: 'auto', padding: '0 10px', color: '#dc2626' }}><FaTrash size={10} />&nbsp;Delete template</button>}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>USED FOR ROLES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {allRoles.length === 0 && <span style={{ fontSize: 12, color: '#9ca3af' }}>No staff roles found.</span>}
              {allRoles.map(r => {
                const on = (t.roles || []).includes(r);
                const other = !on && roleOwner(r) >= 0 ? templates[roleOwner(r)].name : null;
                return (
                  <button type="button" key={r} onClick={() => toggleRole(r)} title={other ? `Currently in “${other}” — click to move here` : ''}
                    style={{ ...chip, background: on ? '#fef3c7' : '#fff', borderColor: on ? '#f59e0b' : '#e5e7eb', color: on ? '#92400e' : '#6b7280', textTransform: 'capitalize' }}>
                    {on ? '✓ ' : ''}{r.replace(/_/g, ' ')}{other ? ` · ${other}` : ''}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>CRITERIA (rated 1–5) · WEIGHT</div>
            <CriteriaEditor criteria={t.criteria || []} onChange={setCriteria} />
          </div>
        )}
      </div>
      <NamedListEditor title="Recommendations" hint="Outcome options at the end of a review." items={recs} idField="id" onChange={setRecs}
        suggestions={SUGGESTED_RECOMMENDATIONS} locked={['none']} color="#d97706" />
    </Shell>
  );
}

function CriteriaEditor({ criteria, onChange }) {
  const [draft, setDraft] = useState('');
  const taken = new Set(criteria.map(c => c.key));
  const add = () => {
    const n = draft.trim();
    if (!n || criteria.some(c => c.name.toLowerCase() === n.toLowerCase())) return;
    onChange([...criteria, { key: uniqueId(keyFromName(n) || 'criterion', taken), name: n, weight: 1 }]);
    setDraft('');
  };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= criteria.length) return; const next = [...criteria]; [next[i], next[j]] = [next[j], next[i]]; onChange(next); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {criteria.map((c, i) => (
        <div key={c.key} style={row}>
          <input value={c.name} maxLength={60} onChange={e => onChange(criteria.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} style={{ ...inp, flex: 1 }} />
          <select value={c.weight || 1} title="Weight — how much this counts in the overall score" onChange={e => onChange(criteria.map((x, k) => (k === i ? { ...x, weight: Number(e.target.value) } : x)))} style={{ ...inp, width: 64 }}>
            {[0.5, 1, 1.5, 2, 3].map(w => <option key={w} value={w}>×{w}</option>)}
          </select>
          <button type="button" onClick={() => move(i, -1)} style={iconBtn}><FaArrowUp size={10} /></button>
          <button type="button" onClick={() => move(i, 1)} style={iconBtn}><FaArrowDown size={10} /></button>
          <button type="button" disabled={criteria.length <= 1} onClick={() => onChange(criteria.filter((_, k) => k !== i))} style={{ ...iconBtn, color: '#dc2626', opacity: criteria.length <= 1 ? 0.3 : 1 }}><FaTrash size={10} /></button>
        </div>
      ))}
      <div style={row}>
        <input value={draft} maxLength={60} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Add criterion, e.g. Wastage control" style={{ ...inp, flex: 1 }} />
        <button type="button" onClick={add} style={{ ...addBtn, background: '#d97706' }}><FaPlus size={10} /> Add</button>
      </div>
    </div>
  );
}

// ── Payroll settings: earning / deduction components + payment modes ──
export function PayrollSettingsPanel({ settings, onSave, onClose }) {
  const [earnings, setEarnings] = useState(() => clone(settings.payroll.earnings));
  const [deductions, setDeductions] = useState(() => clone(settings.payroll.deductions));
  const [modes, setModes] = useState(() => clone(settings.payroll.paymentModes));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    setErr('');
    if (!modes.some(m => m.name.trim())) { setErr('Add at least one payment mode.'); return; }
    setSaving(true);
    try { await onSave({ payroll: { earnings, deductions, paymentModes: modes } }); onClose(); }
    catch (e) { setErr(e?.message || 'Could not save settings.'); }
    finally { setSaving(false); }
  };
  return (
    <Shell title="Payroll settings" subtitle="Pay components appear in each staff member's salary setup and as one-off lines on a payslip. Removing one here doesn't change saved salaries or payslips." onClose={onClose} onSave={save} saving={saving} err={err}>
      <NamedListEditor title="Allowances & earnings" hint="E.g. uniform allowance (monthly), gift or compensation (one-off on a payslip)." items={earnings} idField="key" onChange={setEarnings} suggestions={SUGGESTED_EARNINGS} color="#059669" />
      <NamedListEditor title="Deductions" hint="E.g. uniform recovery (monthly), penalty for misconduct or breakage (one-off on a payslip)." items={deductions} idField="key" onChange={setDeductions} suggestions={SUGGESTED_DEDUCTIONS} color="#dc2626" />
      <NamedListEditor title="Payment modes" hint="Chosen when a payroll run is marked paid (per run, or per staff member)." items={modes} idField="id" onChange={setModes} suggestions={SUGGESTED_PAYMENT_MODES} />
    </Shell>
  );
}

function Shell({ title, subtitle, onClose, onSave, saving, err, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ ...iconBtn, flexShrink: 0 }}><FaTimes size={12} /></button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#fafafa' }}>{children}</div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          {err && <span style={{ color: '#b91c1c', fontSize: 12, marginRight: 'auto' }}>{err}</span>}
          <button type="button" onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button type="button" onClick={onSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>
    </div>
  );
}

const box = { border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fff' };
const boxTitle = { fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 2 };
const hintStyle = { fontSize: 12, color: '#6b7280', marginBottom: 10 };
const row = { display: 'flex', gap: 6, alignItems: 'center' };
const inp = { padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', minWidth: 0 };
const iconBtn = { width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const addBtn = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 };
const chip = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer' };
