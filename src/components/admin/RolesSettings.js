'use client';

// Admin → Roles: what each kind of staff can do, set once per role, with rare per-person exceptions.
// Only for restaurants switched to roles (restaurant.rolesV2). The server keeps enforcing with the same
// staff access + Billing Settings lists as before; this screen edits them through roles.
import { useEffect, useMemo, useState } from 'react';
import { FaUserTag, FaPlus, FaTrash, FaUserEdit, FaInfoCircle } from 'react-icons/fa';
import apiClient from '../../lib/api';

const card = { background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
const h = { fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' };
const sub = { fontSize: '12px', color: '#6b7280', margin: '0 0 14px' };
const btn = (primary, danger, disabled) => ({
  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
  border: primary || danger ? 'none' : '1px solid #e5e7eb',
  background: danger ? '#dc2626' : primary ? '#4f46e5' : '#fff', color: primary || danger ? '#fff' : '#374151',
});
const GROUP_ORDER = ['Pages', 'Orders', 'Billing', 'Tables', 'Menu', 'Inventory', 'Customers', 'Offers', 'Bookings', 'Parking', 'Settings'];

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={!!on} title={label}
      style={{ width: 38, height: 22, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: on ? '#4f46e5' : '#d1d5db', position: 'relative', opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
    </button>
  );
}

function Notice({ kind = 'info', children, onClose }) {
  const c = kind === 'error' ? ['#fef2f2', '#b91c1c', '#fecaca'] : kind === 'ok' ? ['#ecfdf5', '#047857', '#a7f3d0'] : ['#eef2ff', '#3730a3', '#c7d2fe'];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>{children}</div>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss" style={{ border: 'none', background: 'transparent', color: c[1], cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>}
    </div>
  );
}

export default function RolesSettings({ restaurant, currentUserRole }) {
  const rid = restaurant?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [newName, setNewName] = useState('');
  const [copyFrom, setCopyFrom] = useState('');
  const [person, setPerson] = useState(null); // { id, name, role, exceptions }
  const [confirmOff, setConfirmOff] = useState(false);
  const [check, setCheck] = useState(null);

  const cleanLabel = (l) => String(l || '').replace(/\s*\(Billing Settings list\)\s*$/, '');
  const labelOf = useMemo(() => Object.fromEntries((data?.catalogue || []).map(e => [e.key, cleanLabel(e.label)])), [data]);
  const load = async (keepSelected) => {
    if (!rid) return;
    setLoading(true);
    try {
      const d = await apiClient.getRoles(rid);
      setData(d);
      const roles = d.roles || [];
      const pick = (keepSelected && roles.find(r => r.id === keepSelected)) || roles.find(r => r.members.length) || roles[0] || null;
      setSelected(pick ? pick.id : null);
      setDraft(pick ? { ...pick.permissions } : null);
    } catch (e) {
      setMsg({ kind: 'error', text: e.message || 'Could not load roles' });
    } finally { setLoading(false); }
  };
  useEffect(() => { setMsg(null); setPerson(null); setCheck(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [rid]);

  const role = (data?.roles || []).find(r => r.id === selected) || null;
  const dirty = role && draft && Object.keys(draft).some(k => !!draft[k] !== !!role.permissions[k]);
  const groups = useMemo(() => {
    const g = {};
    for (const e of data?.catalogue || []) (g[e.group] = g[e.group] || []).push(e);
    return GROUP_ORDER.filter(n => g[n]).map(n => [n, g[n]]);
  }, [data]);

  const selectRole = (id) => {
    const r = (data?.roles || []).find(x => x.id === id);
    setSelected(id); setDraft(r ? { ...r.permissions } : null); setPerson(null);
  };

  const describeSwitched = (list) => (list || []).map(x => `${labelOf[x.key] || x.key} ${x.now ? 'on' : 'off'}`).join(', ');
  const showProblems = (e) => {
    const probs = (e.data && e.data.problems) || [];
    setMsg({ kind: 'error', text: e.message + (probs.length ? ` (${probs.slice(0, 4).map(p => `${p.staff}: ${labelOf[p.key] || p.key}`).join('; ')})` : '') });
  };

  const saveRole = async () => {
    if (!role || !draft) return;
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.saveRolePermissions(rid, role.name, draft);
      const parts = [`Saved ${role.name}.`];
      if (r.updatedStaff) parts.push(`${r.updatedStaff} staff updated.`);
      if (r.autoSwitched && r.autoSwitched.length) parts.push(`Linked permissions also switched: ${describeSwitched(r.autoSwitched)}.`);
      if (r.listsChanged && r.listsChanged.length) parts.push('Billing Settings updated to match.');
      setMsg({ kind: 'ok', text: parts.join(' ') });
      await load(role.id);
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };

  const createRole = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true); setMsg(null);
    try {
      await apiClient.createRole(rid, name, copyFrom || null);
      setNewName(''); setCopyFrom('');
      setMsg({ kind: 'ok', text: `Role "${name}" created.` });
      await load(name.toLowerCase());
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };

  const deleteRole = async () => {
    if (!role) return;
    setBusy(true); setMsg(null);
    try {
      await apiClient.deleteRole(rid, role.name);
      setMsg({ kind: 'ok', text: `Role "${role.name}" deleted.` });
      await load();
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };

  const savePerson = async () => {
    if (!person) return;
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.saveStaffRoleAccess(rid, person.id, person.role, person.exceptions);
      setMsg({ kind: 'ok', text: `Saved ${person.name}.` + (r.updatedStaff ? '' : ' Nothing needed to change.') });
      setPerson(null);
      await load(person.role.toLowerCase());
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };

  const runCheck = async () => {
    setBusy(true); setMsg(null);
    try { setCheck(await apiClient.setRolesEnabled(rid, true, true)); }
    catch (e) { showProblems(e); } finally { setBusy(false); }
  };
  const switchOn = async () => {
    setBusy(true); setMsg(null);
    try {
      await apiClient.setRolesEnabled(rid, true);
      setCheck(null);
      setMsg({ kind: 'ok', text: 'Roles are on. Everyone kept exactly the access they had.' });
      await load();
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };
  const switchOff = async () => {
    setBusy(true); setMsg(null);
    try {
      await apiClient.setRolesEnabled(rid, false);
      setConfirmOff(false);
      setMsg({ kind: 'ok', text: 'Roles are off. Staff keep their current access; edit it from Staff and Billing Settings.' });
      await load();
    } catch (e) { showProblems(e); } finally { setBusy(false); }
  };

  if (!rid) return null;
  if (loading && !data) return <div style={card}><p style={sub}>Loading roles…</p></div>;

  if (data && !data.enabled) {
    return (
      <div style={card}>
        <h3 style={h}><FaUserTag /> Roles</h3>
        <p style={sub}>Set what each kind of staff can do once, per role, instead of person by person.</p>
        {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}
        {!data.canEnable && <Notice>Roles aren’t available for this restaurant yet.</Notice>}
        {data.canEnable && !check && <button type="button" style={btn(true)} disabled={busy} onClick={runCheck}>Check my staff</button>}
        {check && (
          <div>
            <Notice kind={check.problems && check.problems.length ? 'error' : 'info'}>
              {check.problems && check.problems.length
                ? `These can’t be moved to roles yet: ${check.problems.slice(0, 5).join(', ')}`
                : `${check.roles} roles for ${check.staff} staff. ${check.withExceptions} ${check.withExceptions === 1 ? 'person keeps' : 'people keep'} personal exceptions. Nobody’s access changes.`}
            </Notice>
            {!(check.problems && check.problems.length) && <button type="button" style={btn(true)} disabled={busy} onClick={switchOn}>Switch on roles</button>}
          </div>
        )}
      </div>
    );
  }

  const BUILT_IN_ORDER = ['manager', 'captain', 'cashier', 'waiter', 'employee', 'sales'];
  const roles = [...(data?.roles || [])].sort((a, b) => (b.members.length > 0) - (a.members.length > 0)
    || ((BUILT_IN_ORDER.indexOf(a.id) + 1 || 99) - (BUILT_IN_ORDER.indexOf(b.id) + 1 || 99))
    || a.name.localeCompare(b.name));
  const exceptionKeys = (data?.catalogue || []).filter(e => !e.fromBillingSettings);

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <h3 style={h}><FaUserTag /> Roles</h3>
            <p style={{ ...sub, marginBottom: 0 }}>Change a role once and everyone with that role gets it right away. Owners and co-owners always have full access.</p>
          </div>
          {!confirmOff
            ? <button type="button" style={btn(false)} onClick={() => setConfirmOff(true)}>Switch off roles</button>
            : <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>Staff keep their current access.
                <button type="button" style={btn(false, true)} disabled={busy} onClick={switchOff}>Switch off</button>
                <button type="button" style={btn(false)} onClick={() => setConfirmOff(false)}>Cancel</button></span>}
        </div>
      </div>
      {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) minmax(0, 1fr)', gap: 16, alignItems: 'start' }} className="roles-grid">
        <style>{`@media (max-width: 760px) { .roles-grid { grid-template-columns: 1fr !important; } }`}</style>
        {/* role list */}
        <div style={card}>
          <div style={{ display: 'grid', gap: 6 }}>
            {roles.map(r => (
              <button key={r.id} type="button" onClick={() => selectRole(r.id)}
                style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid ' + (r.id === selected ? '#c7d2fe' : 'transparent'), background: r.id === selected ? '#eef2ff' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{r.name}</span>
                <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{r.members.length} staff{r.builtIn ? '' : ' · custom'}</span>
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 12, paddingTop: 12, display: 'grid', gap: 8 }}>
            <label htmlFor="new-role-name" style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>New role</label>
            <input id="new-role-name" value={newName} maxLength={40} onChange={e => setNewName(e.target.value)} placeholder="e.g. Head Chef"
              style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
            <select id="new-role-copy" aria-label="Start from" value={copyFrom} onChange={e => setCopyFrom(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff' }}>
              <option value="">Start from: nothing allowed</option>
              {roles.map(r => <option key={r.id} value={r.name}>Copy {r.name}</option>)}
            </select>
            <button type="button" style={btn(true, false, busy || !newName.trim())} disabled={busy || !newName.trim()} onClick={createRole}><FaPlus style={{ marginRight: 6 }} />Create role</button>
          </div>
        </div>

        {/* role editor */}
        {role && draft && (
          <div>
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ ...h, margin: 0, textTransform: 'capitalize' }}>{role.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!role.builtIn && role.members.length === 0 && <button type="button" style={btn(false)} disabled={busy} onClick={deleteRole}><FaTrash style={{ marginRight: 6 }} />Delete role</button>}
                  <button type="button" style={btn(false, false, !dirty || busy)} disabled={!dirty || busy} onClick={() => setDraft({ ...role.permissions })}>Discard</button>
                  <button type="button" style={btn(true, false, !dirty || busy)} disabled={!dirty || busy} onClick={saveRole}>{busy ? 'Saving…' : 'Save role'}</button>
                </div>
              </div>
              <p style={{ ...sub, display: 'flex', gap: 6, alignItems: 'flex-start' }}><FaInfoCircle style={{ marginTop: 2, flexShrink: 0 }} />Some permissions go together: “Order history” and “See tables” include seeing and taking orders, and “Billing & cash register pages” includes settling bills. Saving keeps them consistent and tells you what else changed.</p>
              {groups.map(([gname, entries]) => (
                <div key={gname} style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 }}>{gname}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px 16px' }}>
                    {entries.map(e => (
                      <div key={e.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                        <span style={{ fontSize: 13, color: '#1f2937' }}>
                          {cleanLabel(e.label)}
                          {e.fromBillingSettings && <span style={{ marginLeft: 6, fontSize: 10, color: '#4f46e5', background: '#eef2ff', padding: '1px 6px', borderRadius: 999 }}>Billing Settings</span>}
                          {!!draft[e.key] !== !!role.permissions[e.key] && <span style={{ marginLeft: 6, fontSize: 10, color: '#b45309' }}>changed</span>}
                        </span>
                        <Toggle on={!!draft[e.key]} label={e.label} onClick={() => setDraft({ ...draft, [e.key]: !draft[e.key] })} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={card}>
              <h3 style={h}><FaUserEdit /> People with this role</h3>
              <p style={sub}>Give one person something different from their role only when needed. Billing Settings items are always per role.</p>
              {role.members.length === 0 && <p style={{ fontSize: 13, color: '#6b7280' }}>Nobody has this role yet.</p>}
              <div style={{ display: 'grid', gap: 8 }}>
                {role.members.map(m => {
                  const n = Object.keys(m.exceptions || {}).length;
                  const open = person && person.id === m.id;
                  return (
                    <div key={m.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}{n > 0 && <span style={{ marginLeft: 8, fontSize: 11, color: '#b45309', background: '#fffbeb', padding: '1px 8px', borderRadius: 999 }}>{n} {n === 1 ? 'exception' : 'exceptions'}</span>}</span>
                        {!open
                          ? <button type="button" style={btn(false)} onClick={() => setPerson({ id: m.id, name: m.name, role: role.name, exceptions: { ...(m.exceptions || {}) } })}>Edit</button>
                          : <span style={{ display: 'flex', gap: 8 }}>
                              <button type="button" style={btn(false)} onClick={() => setPerson(null)}>Cancel</button>
                              <button type="button" style={btn(true)} disabled={busy} onClick={savePerson}>Save</button>
                            </span>}
                      </div>
                      {open && (
                        <div style={{ marginTop: 10 }}>
                          <label htmlFor={`role-of-${m.id}`} style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginRight: 8 }}>Role</label>
                          <select id={`role-of-${m.id}`} value={person.role} onChange={e => setPerson({ ...person, role: e.target.value, exceptions: e.target.value === role.name ? { ...(m.exceptions || {}) } : {} })}
                            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                          </select>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '4px 16px', marginTop: 10 }}>
                            {exceptionKeys.map(e => {
                              const baseRole = roles.find(r => r.name === person.role) || role;
                              const has = e.key in person.exceptions;
                              const val = has ? (person.exceptions[e.key] ? 'allow' : 'deny') : 'role';
                              return (
                                <label key={e.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '3px 0' }}>
                                  <span>{cleanLabel(e.label)}</span>
                                  <select value={val} aria-label={`${e.label} for ${m.name}`}
                                    onChange={ev => {
                                      const next = { ...person.exceptions };
                                      if (ev.target.value === 'role') delete next[e.key]; else next[e.key] = ev.target.value === 'allow';
                                      setPerson({ ...person, exceptions: next });
                                    }}
                                    style={{ padding: '3px 6px', border: '1px solid ' + (has ? '#fcd34d' : '#e5e7eb'), borderRadius: 6, fontSize: 12, background: has ? '#fffbeb' : '#fff' }}>
                                    <option value="role">As role ({baseRole.permissions[e.key] ? 'yes' : 'no'})</option>
                                    <option value="allow">Allow</option>
                                    <option value="deny">Don’t allow</option>
                                  </select>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
