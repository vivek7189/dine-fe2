'use client';

// "Staff needed" — how well each shift is covered, calm by default (MFC: "too much red").
//   • One line for the week: places filled and a progress bar (AI Generate / Copy Week sit right above).
//   • Open it for a grid of shift × day: one compact cell each ("8 / 32" + bar + the teams most short).
//   • Click a cell → a side panel with every role by team and "+ Add" for each gap.
// Colours: covered = green, short today / tomorrow = red, short later = amber, past days = grey.
// Draft (unpublished) shifts count as planned and are called out in the panel.

import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import { formatDateISO, titleCase, teamOf, TEAMS } from './constants';

const STORE_KEY = 'shifts.coverage.open';
const DAY_MS = 86400000;
const tone = (state) => ({
  full: { bar: '#22c55e', text: '#166534' },
  urgent: { bar: '#ef4444', text: '#b91c1c' },
  soon: { bar: '#f59e0b', text: '#92400e' },
  past: { bar: '#cbd5e1', text: '#94a3b8' },
  none: { bar: '#e5e7eb', text: '#9ca3af' },
}[state]);

function Bar({ have, need, color, height = 5 }) {
  const pct = need ? Math.min(100, Math.round((have / need) * 100)) : 0;
  return (
    <div style={{ height, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .2s' }} />
    </div>
  );
}

// Roles of one cell grouped by team: [{ team, need, have, rows: [...] }]
const byTeam = (rows) => {
  const map = new Map();
  for (const r of rows) {
    const t = teamOf(r.role);
    if (!map.has(t.id)) map.set(t.id, { team: t, need: 0, have: 0, short: 0, rows: [] });
    const g = map.get(t.id);
    g.need += r.need; g.have += Math.min(r.have, r.need); g.short += r.short; g.rows.push(r);
  }
  const order = [...TEAMS.map(t => t.id), 'other'];
  return [...map.values()].sort((a, b) => order.indexOf(a.team.id) - order.indexOf(b.team.id));
};

export default function CoveragePanel({ shiftTypes, weekDates, coverageFor, onAdd, isMobile, mobileDate }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null); // { date, type }
  useEffect(() => { try { setOpen(localStorage.getItem(STORE_KEY) === '1'); } catch (_) {} }, []);
  const toggle = () => setOpen(v => { try { localStorage.setItem(STORE_KEY, v ? '0' : '1'); } catch (_) {} return !v; });

  const todayIdx = Math.floor(new Date(formatDateISO(new Date()) + 'T00:00:00').getTime() / DAY_MS);
  const stateOf = (date, c) => {
    if (!c.need) return 'none';
    const d = Math.floor(new Date(formatDateISO(date) + 'T00:00:00').getTime() / DAY_MS) - todayIdx;
    if (d < 0) return 'past';
    if (c.short === 0) return 'full';
    return d <= 1 ? 'urgent' : 'soon';
  };
  // Per cell: need / have (capped per role) / short / drafts.
  const cell = (date, type) => {
    const c = coverageFor(formatDateISO(date), type);
    const rows = c.rows.length ? c.rows : (c.needTotal ? [{ role: null, need: c.needTotal, have: c.haveTotal, short: Math.max(0, c.needTotal - c.haveTotal), drafts: c.draftTotal || 0 }] : []);
    const need = rows.reduce((a, r) => a + r.need, 0);
    const have = rows.reduce((a, r) => a + Math.min(r.have, r.need), 0);
    return { rows, need, have, short: rows.reduce((a, r) => a + r.short, 0), drafts: rows.reduce((a, r) => a + (r.drafts || 0), 0) };
  };

  const week = useMemo(() => {
    let need = 0, have = 0, urgent = 0, drafts = 0;
    for (const d of weekDates) for (const t of shiftTypes) {
      const c = cell(d, t);
      const st = stateOf(d, c);
      if (st === 'past') continue;
      need += c.need; have += c.have; drafts += c.drafts;
      if (st === 'urgent') urgent += c.short;
    }
    return { need, have, short: Math.max(0, need - have), urgent, drafts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDates, shiftTypes, coverageFor]);
  const pct = week.need ? Math.round((week.have / week.need) * 100) : 100;

  const renderCell = (date, type) => {
    const c = cell(date, type);
    if (!c.need) return <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>;
    const st = stateOf(date, c);
    const tn = tone(st);
    const shortTeams = byTeam(c.rows).filter(g => g.short > 0).sort((a, b) => b.short - a.short).slice(0, 2);
    return (
      <button type="button" onClick={() => setDetail({ date, type })} title="See roles and fill the gaps"
        style={{ width: '100%', border: '1px solid #f1f5f9', background: '#fff', borderRadius: 10, padding: '7px 8px', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: st === 'past' ? '#94a3b8' : '#111827', fontVariantNumeric: 'tabular-nums' }}>{c.have}<span style={{ color: '#9ca3af', fontWeight: 500 }}> / {c.need}</span></span>
          {st === 'full' && <FaCheck size={10} color="#16a34a" />}
        </div>
        <Bar have={c.have} need={c.need} color={tn.bar} />
        {st !== 'past' && st !== 'full' && shortTeams.length > 0 && (
          <div style={{ marginTop: 4, fontSize: 10.5, color: st === 'urgent' ? tn.text : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shortTeams.map(g => `${g.team.name.split(' ')[0]} −${g.short}`).join(' · ')}
          </div>
        )}
      </button>
    );
  };

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: isMobile ? '12px 14px' : '12px 16px' }}>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Staff needed</span>
          <span style={{ fontSize: 12.5, color: '#6b7280' }}>
            {week.need ? <>{week.have} of {week.need} places filled this week{week.short ? <> · <b style={{ color: '#374151' }}>{week.short} open</b></> : ''}{week.urgent ? <> · <b style={{ color: '#b91c1c' }}>{week.urgent} for today / tomorrow</b></> : ''}</> : 'Nothing left to plan this week'}
          </span>
        </div>
        {week.need > 0 && <div style={{ marginTop: 6, maxWidth: 420 }}><Bar have={week.have} need={week.need} color={pct >= 100 ? '#22c55e' : week.urgent ? '#ef4444' : '#6366f1'} height={6} /></div>}
      </div>
      {!isMobile && (
        <button type="button" onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 9, border: 'none', background: '#f8fafc', color: '#4b5563', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          {open ? 'Hide' : 'By shift'} {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eef0f3', marginBottom: 16 }}>
      {header}
      {isMobile && mobileDate && (
        <div style={{ padding: '0 14px 12px', display: 'grid', gap: 8 }}>
          {shiftTypes.map(t => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>{t.name}</span>
              {renderCell(mobileDate, t)}
            </div>
          ))}
        </div>
      )}
      {!isMobile && open && (
        <div style={{ overflowX: 'auto', borderTop: '1px solid #f3f4f6' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 6, tableLayout: 'fixed', minWidth: 760 }}>
            <tbody>
              {shiftTypes.map(t => (
                <tr key={t.name}>
                  <td style={{ width: 166, padding: '2px 8px', fontSize: 12.5, fontWeight: 600, color: '#374151', verticalAlign: 'middle' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: t.color || '#9ca3af', marginRight: 6 }} />
                    {t.name}
                    <div style={{ color: '#9ca3af', fontWeight: 500, fontSize: 11, marginLeft: 14 }}>{t.startTime}–{t.endTime}</div>
                  </td>
                  {weekDates.map((d, i) => <td key={i} style={{ verticalAlign: 'top' }}>{renderCell(d, t)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (() => {
        const c = cell(detail.date, detail.type);
        const st = stateOf(detail.date, c);
        const groups = byTeam(c.rows);
        return (
          <div role="dialog" aria-label="Staff needed for this shift" onClick={() => setDetail(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? '100%' : 380, maxWidth: '100%', height: '100%', background: '#fff', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{detail.type.name}</div>
                  <div style={{ fontSize: 12.5, color: '#6b7280' }}>{detail.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })} · {detail.type.startTime}–{detail.type.endTime}</div>
                </div>
                <button type="button" aria-label="Close" onClick={() => setDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes /></button>
              </div>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <b>{c.have} of {c.need} filled</b>
                  <span style={{ color: tone(st).text, fontWeight: 600 }}>{st === 'full' ? 'Covered' : st === 'past' ? 'Past' : `${c.short} to fill`}</span>
                </div>
                <Bar have={c.have} need={c.need} color={tone(st).bar} height={7} />
                {c.drafts > 0 && <div style={{ fontSize: 11.5, color: '#92400e', marginTop: 6 }}>Includes {c.drafts} draft shift{c.drafts > 1 ? 's' : ''} — staff are told when you Publish.</div>}
              </div>
              <div style={{ overflowY: 'auto', padding: '6px 18px 18px', flex: 1 }}>
                {groups.map(g => (
                  <div key={g.team.id} style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                      <span>{g.team.name}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{g.have}/{g.need}</span>
                    </div>
                    {g.rows.map(r => (
                      <div key={r.role || 'all'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 0', borderBottom: '1px solid #f8fafc' }}>
                        <span style={{ fontSize: 13.5, color: '#111827' }}>{r.role ? titleCase(r.role) : 'Any role'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12.5, color: r.short ? '#6b7280' : '#16a34a', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{Math.min(r.have, r.need)}/{r.need}{!r.short && ' ✓'}</span>
                          {r.short > 0 && st !== 'past' && (
                            <button type="button" onClick={() => { setDetail(null); onAdd(detail.date, detail.type, r.role || undefined); }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#111827', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              <FaPlus size={9} /> Add
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
