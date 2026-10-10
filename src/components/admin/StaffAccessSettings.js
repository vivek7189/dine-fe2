'use client';

// Admin → Staff Access: who sees what, and when (posSettings.staffAccess). Per restaurant, per
// role, OFF until the owner switches it on. Enforced by the backend (utils/staffAccess.js) on web,
// desktop and the dine-app. Owner / admin / co-owner / manager are never restricted.
import { useEffect, useMemo, useState } from 'react';
import { FaUserShield, FaClock, FaExchangeAlt, FaHistory, FaChartLine } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { fmtDateTime } from '../../lib/restaurantTime';

const NEVER_RESTRICTED = ['owner', 'admin', 'co-owner', 'manager', 'super-admin', 'super_admin', 'customer'];
const BASE_TYPES = [{ id: 'dine_in', label: 'Dine-in' }, { id: 'takeaway', label: 'Takeaway' }, { id: 'delivery', label: 'Delivery' }];
const RULES = [
  { key: 'ownOrdersOnly', label: 'Own orders only', hint: 'Sees and works only the orders they took (plus the current guests of their tables)' },
  { key: 'ownTablesOnly', label: 'Own tables only', hint: 'Tables assigned to another server are locked' },
  { key: 'requireClockIn', label: 'Must clock in', hint: 'Can’t take or see orders until clocked in' },
  { key: 'blockOnLeave', label: 'Block on leave', hint: 'Approved leave today → can’t clock in or work' },
  { key: 'lockAfterShift', label: 'Lock after shift', hint: 'Locked once their rota shift (+ grace) is over' },
  { key: 'lockAfterShiftRota', label: 'Lock by rota (no clock-in)', hint: 'Without “Must clock in”: locked once today’s rota shift (+ grace) is over; a manager’s PIN unlocks. Not on the rota today = not locked' },
];

const PRESETS = {
  full_service: {
    label: 'Full service', desc: 'Waiters: own orders + own tables, dine-in only, clock-in. Captains: their floor. Cashiers: clock-in.',
    roles: {
      waiter: { ownOrdersOnly: true, ownTablesOnly: true, allowedOrderTypes: ['dine_in'], requireClockIn: true, blockOnLeave: true, lockAfterShift: true },
      captain: { ownOrdersOnly: true, ownTablesOnly: true, requireClockIn: true, blockOnLeave: true },
      cashier: { requireClockIn: true, blockOnLeave: true },
    },
  },
  counter: {
    label: 'Counter / QSR', desc: 'Everyone clocks in; waiters see only their own orders. No table rules.',
    roles: {
      cashier: { requireClockIn: true, blockOnLeave: true },
      waiter: { ownOrdersOnly: true, requireClockIn: true, blockOnLeave: true },
    },
  },
  cafe_bar: {
    label: 'Café / Bar (light)', desc: 'Staff see only their own orders and sales. No clock-in needed.',
    roles: {
      waiter: { ownOrdersOnly: true },
      captain: { ownOrdersOnly: true },
      bartender: { ownOrdersOnly: true },
    },
  },
};

const card = { background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
const h = { fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' };
const sub = { fontSize: '12px', color: '#6b7280', margin: '0 0 14px' };

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      style={{ width: 38, height: 22, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: on ? '#4f46e5' : '#d1d5db', position: 'relative', opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
    </button>
  );
}

export default function StaffAccessSettings({ restaurant, posSettings, setPosSettings, roles = [], onSave, saving }) {
  const cfg = (posSettings && posSettings.staffAccess) || {};
  const enabled = cfg.enabled === true;
  const [events, setEvents] = useState([]);

  const setCfg = (patch) => setPosSettings(prev => ({ ...prev, staffAccess: { ...((prev && prev.staffAccess) || {}), ...patch } }));
  const roleCfg = (r) => (cfg.roles && cfg.roles[r]) || {};
  const setRole = (r, patch) => setPosSettings(prev => {
    const sa = (prev && prev.staffAccess) || {};
    const rs = sa.roles || {};
    return { ...prev, staffAccess: { ...sa, roles: { ...rs, [r]: { ...(rs[r] || {}), ...patch } } } };
  });

  // Sales visibility (posSettings.salesVisibility.allRoles) — independent of the rules switch.
  const allSalesRoles = useMemo(() => {
    const l = posSettings?.salesVisibility?.allRoles;
    return Array.isArray(l) ? l.map(r => String(r).toLowerCase()) : [];
  }, [posSettings?.salesVisibility?.allRoles]);
  const toggleAllSalesRole = (r) => setPosSettings(prev => {
    const sv = (prev && prev.salesVisibility) || {};
    const cur = Array.isArray(sv.allRoles) ? sv.allRoles.map(x => String(x).toLowerCase()) : [];
    const next = cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r];
    return { ...prev, salesVisibility: { ...sv, allRoles: next } };
  });

  const roleList = useMemo(() => {
    const configured = Object.keys(cfg.roles || {});
    return [...new Set(['waiter', 'captain', 'cashier', ...roles.map(r => String(r).toLowerCase()), ...configured])]
      .filter(r => r && !NEVER_RESTRICTED.includes(r));
  }, [roles, cfg.roles]);

  const orderTypes = useMemo(() => {
    const custom = (Array.isArray(posSettings?.orderTypes) ? posSettings.orderTypes : [])
      .map(o => ({ id: String(o.id || o.label || '').toLowerCase().replace(/[\s-]+/g, '_'), label: o.label || o.id }))
      .filter(o => o.id && !['dine_in', 'dinein', 'takeaway', 'take_away', 'delivery'].includes(o.id));
    return [...BASE_TYPES, ...custom];
  }, [posSettings?.orderTypes]);

  useEffect(() => {
    if (!restaurant?.id || !enabled) return;
    apiClient.request(`/api/staff-access/${restaurant.id}/events`).then(r => setEvents(r?.events || [])).catch(() => setEvents([]));
  }, [restaurant?.id, enabled]);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setPosSettings(prev => {
      const sa = (prev && prev.staffAccess) || {};
      return { ...prev, staffAccess: { earlyClockInMinutes: 15, lateGraceMinutes: 30, transfer: 'owner_or_manager', ...sa, enabled: true, preset: key, roles: { ...(sa.roles || {}), ...p.roles } } };
    });
  };

  const typeOn = (r, id) => {
    const list = roleCfg(r).allowedOrderTypes;
    return !Array.isArray(list) || list.length === 0 || list.includes(id);
  };
  const toggleType = (r, id) => {
    const list = roleCfg(r).allowedOrderTypes;
    const cur = (!Array.isArray(list) || list.length === 0) ? orderTypes.map(t => t.id) : list;
    let next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    if (next.length === 0) next = cur; // keep at least one
    setRole(r, { allowedOrderTypes: next.length === orderTypes.length ? [] : next });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><FaUserShield color="#4f46e5" /> Staff Access</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Who sees which orders, tables and sales — and only while they’re working. Works on web, desktop and the staff app.</p>
        </div>
        <button onClick={onSave} disabled={saving || !restaurant}
          style={{ padding: '10px 24px', background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: saving ? '#9ca3af' : '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={card}>
        <p style={h}><FaChartLine color="#4f46e5" /> Who can see all orders &amp; sales</p>
        <p style={sub}>
          Owner, admin and manager always see every order and the restaurant&apos;s sales. Every other role sees only
          <strong> their own</strong> billed orders and <strong>their shift&apos;s</strong> sales (orders they took, served or billed);
          running orders stay visible to everyone so any cashier can bill them. Tick a role to let it see everything, like the owner.
          Staff who already have the <em>Analytics</em> page also see everything.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {roleList.map(r => {
            const on = allSalesRoles.includes(r);
            return (
              <button key={r} type="button" onClick={() => toggleAllSalesRole(r)} aria-pressed={on}
                style={{ padding: '6px 14px', borderRadius: 999, fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', border: on ? '1px solid #4f46e5' : '1px solid #e5e7eb', background: on ? '#eef2ff' : '#fff', color: on ? '#4338ca' : '#6b7280' }}>
                {on ? '✓ ' : ''}{r} {on ? '— sees all' : '— own only'}
              </button>
            );
          })}
        </div>
        <p style={{ ...sub, margin: '10px 0 0' }}>Click <strong>Save Changes</strong> above to apply. Staff see the change on their next refresh.</p>
      </div>

      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={h}>Use staff access rules{restaurant?.name ? ` at ${restaurant.name}` : ''}</p>
          <p style={{ ...sub, margin: 0 }}>Off = everyone works as today. Owner, admin and manager are never restricted.</p>
        </div>
        <Toggle on={enabled} onClick={() => setCfg({ enabled: !enabled })} label="Use staff access rules" />
      </div>

      {enabled && (
        <>
          <div style={card}>
            <p style={h}>Quick start</p>
            <p style={sub}>Pick the setup closest to your restaurant, then adjust below.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {Object.entries(PRESETS).map(([k, p]) => (
                <button key={k} type="button" onClick={() => applyPreset(k)}
                  style={{ textAlign: 'left', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', border: cfg.preset === k ? '2px solid #4f46e5' : '1px solid #e5e7eb', background: cfg.preset === k ? '#eef2ff' : '#fff' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{p.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={h}>Rules by role</p>
            <p style={sub}>Switch on what each role should follow. A role with nothing switched on works as today.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '11px', color: '#6b7280', padding: '8px', textTransform: 'uppercase' }}>Role</th>
                    {RULES.map(r => <th key={r.key} title={r.hint} style={{ fontSize: '11px', color: '#6b7280', padding: '8px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{r.label}</th>)}
                    <th style={{ textAlign: 'left', fontSize: '11px', color: '#6b7280', padding: '8px', textTransform: 'uppercase' }}>Order types</th>
                  </tr>
                </thead>
                <tbody>
                  {roleList.map(r => {
                    const rc = roleCfg(r);
                    return (
                      <tr key={r} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{r}</td>
                        {RULES.map(rule => {
                          const on = rule.key === 'blockOnLeave' ? (rc.requireClockIn === true && rc.blockOnLeave !== false) : rc[rule.key] === true;
                          const needsClock = rule.key === 'blockOnLeave' || rule.key === 'lockAfterShift';
                          // the rota lock is for roles WITHOUT clock-in (with clock-in, "Lock after shift" applies)
                          const disabled = (needsClock && rc.requireClockIn !== true) || (rule.key === 'lockAfterShiftRota' && rc.requireClockIn === true);
                          return (
                            <td key={rule.key} style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex' }}>
                                <Toggle on={on && !(rule.key === 'lockAfterShiftRota' && rc.requireClockIn === true)} disabled={disabled} label={`${rule.label} — ${r}`}
                                  onClick={() => setRole(r, { [rule.key]: !on })} />
                              </div>
                            </td>
                          );
                        })}
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {orderTypes.map(t => {
                              const on = typeOn(r, t.id);
                              return (
                                <button key={t.id} type="button" onClick={() => toggleType(r, t.id)}
                                  style={{ padding: '4px 10px', borderRadius: 999, fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: on ? '1px solid #4f46e5' : '1px solid #e5e7eb', background: on ? '#eef2ff' : '#fff', color: on ? '#4338ca' : '#9ca3af' }}>
                                  {on ? '✓ ' : ''}{t.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ ...sub, margin: '12px 0 0' }}>
              Tables: assign a server to a table or a whole section on the <strong>Tables</strong> page (table → Assign server). “Own tables only” uses those assignments; unassigned tables stay open to everyone.
            </p>
          </div>

          <div style={card}>
            <p style={h}><FaClock color="#4f46e5" /> Working time</p>
            <p style={sub}>Applies to roles with “Must clock in”. A manager can always let someone in with their PIN (logged).</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <label style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                Clock in up to (minutes before shift)
                <input type="number" min={0} max={240} value={cfg.earlyClockInMinutes ?? 15}
                  onChange={e => setCfg({ earlyClockInMinutes: Math.max(0, Math.min(240, Number(e.target.value) || 0)) })}
                  style={{ display: 'block', marginTop: '6px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              </label>
              <label style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                Grace after shift ends (minutes)
                <input type="number" min={0} max={480} value={cfg.lateGraceMinutes ?? 30}
                  onChange={e => setCfg({ lateGraceMinutes: Math.max(0, Math.min(480, Number(e.target.value) || 0)) })}
                  style={{ display: 'block', marginTop: '6px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Toggle on={cfg.rotaOnlyClockIn === true} onClick={() => setCfg({ rotaOnlyClockIn: cfg.rotaOnlyClockIn !== true })} label="Clock in only during rota shifts" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Clock in only during rota shifts</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Needs published shifts in Shift Scheduling</div>
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <p style={h}><FaExchangeAlt color="#4f46e5" /> Transferring a table / order</p>
            <p style={sub}>Hand an open order (and its table) to another server.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[['owner_or_manager', 'Manager, or the server who owns it'], ['manager', 'Managers only']].map(([k, label]) => (
                <button key={k} type="button" onClick={() => setCfg({ transfer: k })}
                  style={{ padding: '8px 14px', borderRadius: 10, fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: (cfg.transfer || 'owner_or_manager') === k ? '2px solid #4f46e5' : '1px solid #e5e7eb', background: (cfg.transfer || 'owner_or_manager') === k ? '#eef2ff' : '#fff', color: '#374151' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={h}><FaHistory color="#4f46e5" /> Recent overrides & transfers</p>
            {events.length === 0 ? <p style={{ ...sub, margin: 0 }}>Nothing yet.</p> : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {events.slice(0, 30).map(ev => (
                  <div key={ev.id} style={{ fontSize: '12px', color: '#374151', padding: '6px 0', borderTop: '1px solid #f9fafb' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{String(ev.type || '').replace('_', ' ')}</strong>
                    {ev.type === 'transfer' ? ` — order to ${ev.toName || 'staff'}${ev.fromName ? ` (from ${ev.fromName})` : ''}` : ''}
                    {ev.type === 'override' ? ` — by ${ev.approverName || ev.approverRole || 'manager'} for ${ev.minutes || ''} min` : ''}
                    <span style={{ color: '#9ca3af' }}> · {fmtDateTime(ev.at, 'en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
