'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaStar, FaRegStar, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * AppraisalsTab — staff performance reviews. Per-criterion ratings (1–5) + notes.
 * Self-contained (fetches its own data), mirrors the Advances/Bonus tabs' pattern.
 */
const CRITERIA = [
  { key: 'punctuality', name: 'Punctuality' },
  { key: 'workQuality', name: 'Work Quality' },
  { key: 'teamwork', name: 'Teamwork' },
  { key: 'customerService', name: 'Customer Service' },
  { key: 'initiative', name: 'Initiative' },
];
const RECOMMENDATIONS = [
  { id: 'none', name: 'No action' },
  { id: 'raise', name: 'Salary raise' },
  { id: 'promotion', name: 'Promotion' },
  { id: 'training', name: 'Needs training' },
  { id: 'warning', name: 'Warning' },
];

function Stars({ value }) {
  const v = Math.round(value || 0);
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#f59e0b' }}>
      {[1, 2, 3, 4, 5].map(i => (i <= v ? <FaStar key={i} size={12} /> : <FaRegStar key={i} size={12} color="#d1d5db" />))}
    </span>
  );
}

export default function AppraisalsTab({ restaurantId, apiClient, staffList = [], isMobile, formatCurrency }) {
  const [appraisals, setAppraisals] = useState([]);
  const [summary, setSummary] = useState({ count: 0, avgRating: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const emptyForm = { staffId: '', period: '', ratings: {}, strengths: '', improvements: '', goals: '', recommendation: 'none' };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const res = await apiClient.getStaffAppraisals(restaurantId);
      setAppraisals(res.appraisals || []);
      setSummary(res.summary || { count: 0, avgRating: null });
    } catch (e) { setError(e?.message || 'Could not load appraisals.'); }
    finally { setLoading(false); }
  }, [restaurantId, apiClient]);

  useEffect(() => { load(); }, [load]);

  const staffOf = (id) => (staffList || []).find(x => (x.id || x.staffId) === id);

  const submit = async () => {
    if (!form.staffId) { setError('Pick a staff member.'); return; }
    setSaving(true); setError('');
    try {
      const s = staffOf(form.staffId);
      await apiClient.createStaffAppraisal(restaurantId, {
        staffId: form.staffId,
        staffName: s ? (s.name || s.staffName) : '',
        role: s ? (s.role || null) : null,
        period: form.period || null,
        ratings: form.ratings,
        strengths: form.strengths || null,
        improvements: form.improvements || null,
        goals: form.goals || null,
        recommendation: form.recommendation,
        status: 'submitted',
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (e) { setError(e?.message || 'Could not save the review.'); }
    finally { setSaving(false); }
  };

  const del = async (a) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this appraisal permanently?')) return;
    try { await apiClient.deleteStaffAppraisal(restaurantId, a.id); await load(); }
    catch (e) { setError(e?.message || 'Delete failed.'); }
  };

  const setRating = (key, val) => setForm(f => ({ ...f, ratings: { ...f.ratings, [key]: val } }));
  const recName = (id) => (RECOMMENDATIONS.find(r => r.id === id) || {}).name || id;

  return (
    <div style={{ padding: isMobile ? '8px' : '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaStar /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff Appraisals</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Performance reviews & ratings.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>AVG RATING</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{summary.avgRating != null ? `${summary.avgRating} / 5` : '—'}</div>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            <FaPlus size={11} /> New Review
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
            <label style={lbl}>Staff member
              <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} style={inp}>
                <option value="">Select staff…</option>
                {(staffList || []).map(s => { const id = s.id || s.staffId; return <option key={id} value={id}>{s.name || s.staffName}{s.role ? ` · ${s.role}` : ''}</option>; })}
              </select>
            </label>
            <label style={lbl}>Review period
              <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Sep 2026, Q3 2026" style={inp} />
            </label>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '4px 0 8px' }}>Ratings (1–5)</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
            {CRITERIA.map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px' }}>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{c.name}</span>
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating(c.key, n)} title={`${n}`} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: (form.ratings[c.key] || 0) >= n ? '#f59e0b' : '#d1d5db' }}>
                      <FaStar size={16} />
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <label style={lbl}>Strengths<textarea value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></label>
            <label style={lbl}>Areas to improve<textarea value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></label>
            <label style={lbl}>Goals for next period<textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ ...lbl, maxWidth: 240 }}>Recommendation
              <select value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} style={inp}>
                {RECOMMENDATIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saving ? '#fcd34d' : '#d97706', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Save review'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : appraisals.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No appraisals yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {appraisals.map(a => {
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : a.id)}>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{a.staffName || (staffOf(a.staffId) || {}).name || 'Staff'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.period || '—'}{a.reviewerName ? ` · by ${a.reviewerName}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stars value={a.overallRating} /><span style={{ fontWeight: 800, color: '#b45309', fontSize: 13 }}>{a.overallRating != null ? a.overallRating : '—'}</span></div>
                    {a.recommendation && a.recommendation !== 'none' && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8' }}>{recName(a.recommendation)}</span>
                    )}
                    <button title="Delete" onClick={(e) => { e.stopPropagation(); del(a); }} style={iconBtn('#b91c1c')}><FaTrash size={10} /></button>
                    {isOpen ? <FaChevronUp size={12} color="#9ca3af" /> : <FaChevronDown size={12} color="#9ca3af" />}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '0 12px 12px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 8, margin: '10px 0' }}>
                      {CRITERIA.map(c => (
                        <div key={c.key} style={{ background: '#fafafa', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontWeight: 800, color: '#f59e0b' }}>{a.ratings?.[c.key] ? `${a.ratings[c.key]}/5` : '—'}</div>
                        </div>
                      ))}
                    </div>
                    {a.strengths && <p style={txt}><b>Strengths:</b> {a.strengths}</p>}
                    {a.improvements && <p style={txt}><b>To improve:</b> {a.improvements}</p>}
                    {a.goals && <p style={txt}><b>Goals:</b> {a.goals}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block' };
const inp = { width: '100%', marginTop: 4, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 400, color: '#111827', background: '#fff', outline: 'none' };
const txt = { fontSize: 13, color: '#374151', margin: '4px 0' };
const iconBtn = (color) => ({ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });
