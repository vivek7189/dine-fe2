'use client';

// Menu → Add / Edit item and Add category: "Report group" (Food, Drinks, …) for the category, so a new
// category can be put in a group right where it is made. Only shown when the restaurant has report
// groups (Reports → Sales Summary → Category Sales → Set up groups); everyone else sees nothing.
// Groups can also be added, renamed and deleted here. Groups are reports-only — the menu and POS stay the same.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

// same rule as the server (utils/reportGroups catId)
const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const MAX_GROUPS = 12; // server keeps up to 12
const NEW = '__new__';

const cache = {}; // restaurantId → Promise<groups[]>
const listeners = new Set(); // (restaurantId, groups) → every open picker / form sees a change at once
function loadGroups(restaurantId, fresh) {
  if (!restaurantId) return Promise.resolve([]);
  if (fresh || !cache[restaurantId]) {
    cache[restaurantId] = apiClient.request(`/api/restaurants/${restaurantId}/report-groups`)
      .then((r) => (Array.isArray(r?.reportGroups) ? r.reportGroups : []))
      .catch(() => { delete cache[restaurantId]; return []; }); // no access / offline → picker hidden
  }
  return cache[restaurantId];
}

export function useReportGroups(restaurantId) {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    let alive = true;
    loadGroups(restaurantId).then((g) => { if (alive) setGroups(g); });
    const on = (rid, g) => { if (alive && rid === restaurantId) setGroups(g); };
    listeners.add(on);
    return () => { alive = false; listeners.delete(on); };
  }, [restaurantId]);
  return groups;
}

// which group a category (its id and/or name) is in ('' = none)
export function groupOfCategory(groups, category) {
  const keys = [category?.id, category?.name].map(catId).filter(Boolean);
  const g = (groups || []).find((x) => (x.categories || []).some((c) => keys.includes(catId(c))));
  return g ? g.id : '';
}

// Change the groups: reads the latest first so a change made elsewhere is not lost, then saves.
async function saveGroups(restaurantId, change) {
  const latest = await loadGroups(restaurantId, true);
  const next = change(latest);
  const r = await apiClient.request(`/api/restaurants/${restaurantId}/report-groups`, { method: 'PUT', body: { reportGroups: next } });
  const saved = Array.isArray(r?.reportGroups) ? r.reportGroups : next;
  cache[restaurantId] = Promise.resolve(saved);
  listeners.forEach((fn) => fn(restaurantId, saved));
  return saved;
}

const withoutCategory = (groups, keys) => groups.map((g) => ({ ...g, categories: (g.categories || []).filter((c) => !keys.includes(catId(c))) }));
const sameName = (groups, name, exceptId) => groups.some((g) => g.id !== exceptId && g.name.trim().toLowerCase() === name.trim().toLowerCase());

// Move a category into a group ('' = take it out of every group).
export async function setCategoryGroup(restaurantId, category, groupId) {
  const keys = [category?.id, category?.name].map(catId).filter(Boolean);
  if (!restaurantId || !keys.length) return null;
  const key = category.id || category.name;
  return saveGroups(restaurantId, (latest) => withoutCategory(latest, keys).map((g) => (g.id === groupId ? { ...g, categories: [...g.categories, key] } : g)));
}

// New group (optionally with a category moved into it). Returns the new group's id.
export async function addReportGroup(restaurantId, name, category) {
  const clean = String(name || '').trim().slice(0, 40);
  if (!clean) throw new Error('Type a group name');
  const keys = [category?.id, category?.name].map(catId).filter(Boolean);
  const key = category ? (category.id || category.name) : '';
  let before = [];
  const saved = await saveGroups(restaurantId, (latest) => {
    if (latest.length >= MAX_GROUPS) throw new Error(`Up to ${MAX_GROUPS} groups`);
    if (sameName(latest, clean)) throw new Error(`“${clean}” already exists`);
    before = latest.map((g) => g.id);
    const rest = keys.length ? withoutCategory(latest, keys) : latest;
    return [...rest, { name: clean, categories: key ? [key] : [] }];
  });
  const made = saved.find((g) => !before.includes(g.id) && g.name.trim().toLowerCase() === clean.toLowerCase());
  return made ? made.id : '';
}

export function renameReportGroup(restaurantId, groupId, name) {
  const clean = String(name || '').trim().slice(0, 40);
  if (!clean) return Promise.reject(new Error('Name cannot be empty'));
  return saveGroups(restaurantId, (latest) => {
    if (sameName(latest, clean, groupId)) throw new Error(`“${clean}” already exists`);
    return latest.map((g) => (g.id === groupId ? { ...g, name: clean } : g));
  });
}

// Its categories become "not in a group"; menu items are not touched.
export function deleteReportGroup(restaurantId, groupId) {
  return saveGroups(restaurantId, (latest) => latest.filter((g) => g.id !== groupId));
}

const inputStyle = { flex: 1, minWidth: 0, padding: '7px 9px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 };
const btn = (bg, color) => ({ padding: '6px 10px', borderRadius: 6, border: 'none', background: bg, color, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' });

// one row of "Edit groups": name you can change, and Delete with a yes/no step
function GroupRow({ restaurantId, group, onError }) {
  const [name, setName] = useState(group.name);
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  useEffect(() => { setName(group.name); }, [group.name]);
  const changed = name.trim() && name.trim() !== group.name;
  const run = async (fn) => { setBusy(true); onError(''); try { await fn(); } catch (e) { onError(e?.message || 'Could not save'); setName(group.name); } setBusy(false); };
  const count = (group.categories || []).length;
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }} data-testid="report-group-row">
      {askDelete ? (
        <>
          <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>Delete “{group.name}”? {count ? `Its ${count} categor${count === 1 ? 'y' : 'ies'} will be not in a group.` : ''}</span>
          <button type="button" disabled={busy} style={btn('#dc2626', 'white')} onClick={() => run(() => deleteReportGroup(restaurantId, group.id))}>{busy ? '…' : 'Delete'}</button>
          <button type="button" disabled={busy} style={btn('#f3f4f6', '#374151')} onClick={() => setAskDelete(false)}>Keep</button>
        </>
      ) : (
        <>
          <input value={name} maxLength={40} disabled={busy} onChange={(e) => setName(e.target.value)} style={inputStyle} aria-label="Group name"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (changed) run(() => renameReportGroup(restaurantId, group.id, name)); } }} />
          {changed && <button type="button" disabled={busy} style={btn('#16a34a', 'white')} onClick={() => run(() => renameReportGroup(restaurantId, group.id, name))}>{busy ? '…' : 'Save'}</button>}
          <button type="button" disabled={busy} style={btn('#fef2f2', '#dc2626')} onClick={() => setAskDelete(true)}>Delete</button>
        </>
      )}
    </div>
  );
}

// "Edit groups" panel: rename / delete each group, add a new one
export function ReportGroupsEditor({ restaurantId, groups, onClose }) {
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const add = async () => {
    setBusy(true); setErr('');
    try { await addReportGroup(restaurantId, newName); setNewName(''); } catch (e) { setErr(e?.message || 'Could not add'); }
    setBusy(false);
  };
  return (
    <div style={{ marginTop: 6, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }} data-testid="report-groups-editor">
      {groups.map((g) => <GroupRow key={g.id} restaurantId={restaurantId} group={g} onError={setErr} />)}
      {groups.length < MAX_GROUPS ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input value={newName} maxLength={40} disabled={busy} placeholder="New group name, e.g. Desserts" onChange={(e) => setNewName(e.target.value)} style={inputStyle}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newName.trim()) add(); } }} data-testid="report-group-new-name" />
          <button type="button" disabled={busy || !newName.trim()} style={{ ...btn('#2563eb', 'white'), opacity: newName.trim() ? 1 : 0.5 }} onClick={add}>{busy ? '…' : '+ Add'}</button>
        </div>
      ) : <div style={{ fontSize: 11, color: '#6b7280' }}>Up to {MAX_GROUPS} groups.</div>}
      {err && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>Changes save at once. Sales reports only — menu and POS stay the same.</span>
        <button type="button" style={btn('#e5e7eb', '#374151')} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// Item window: the selected category's group, saved as soon as it is changed.
export default function ReportGroupPicker({ restaurantId, category }) {
  const groups = useReportGroups(restaurantId);
  const [current, setCurrent] = useState('');
  const [state, setState] = useState(''); // '' | 'saving' | 'saved' | error text
  const [adding, setAdding] = useState(false); // "+ New group" name box
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(false); // "Edit groups" panel
  const catKey = category ? `${category.id || ''}|${category.name || ''}` : '';
  useEffect(() => { setCurrent(groupOfCategory(groups, category)); }, [groups, catKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setState(''); setAdding(false); setNewName(''); }, [catKey]);
  if ((!groups.length && !editing) || !category) return null;
  const change = async (gid) => {
    if (gid === NEW) { setAdding(true); setState(''); return; }
    const before = current;
    setCurrent(gid); setState('saving');
    try { await setCategoryGroup(restaurantId, category, gid); setState('saved'); }
    catch (e) { setCurrent(before); setState(e?.message || 'Could not save the group'); }
  };
  const addNew = async () => {
    setState('saving');
    try { await addReportGroup(restaurantId, newName, category); setAdding(false); setNewName(''); setState('saved'); }
    catch (e) { setState(e?.message || 'Could not add the group'); }
  };
  return (
    <div style={{ marginTop: 8 }} data-testid="item-report-group">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <label style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#374151' }}>
          Report group <span style={{ color: '#9ca3af', fontWeight: 400 }}>— for “{category.name}” (sales reports only)</span>
        </label>
        <button type="button" onClick={() => setEditing((v) => !v)} data-testid="report-groups-edit"
          style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>
          {editing ? 'Close' : 'Edit groups'}
        </button>
      </div>
      {adding ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input autoFocus value={newName} maxLength={40} disabled={state === 'saving'} placeholder="New group name, e.g. Desserts" onChange={(e) => setNewName(e.target.value)} style={inputStyle}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newName.trim()) addNew(); } }} data-testid="item-report-group-new-name" />
          <button type="button" disabled={state === 'saving' || !newName.trim()} style={{ ...btn('#2563eb', 'white'), opacity: newName.trim() ? 1 : 0.5 }} onClick={addNew}>{state === 'saving' ? '…' : 'Add'}</button>
          <button type="button" disabled={state === 'saving'} style={btn('#f3f4f6', '#374151')} onClick={() => { setAdding(false); setNewName(''); setState(''); }}>Cancel</button>
        </div>
      ) : (
        <select value={current} onChange={(e) => change(e.target.value)} disabled={state === 'saving'} data-testid="item-report-group-select"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, background: current ? '#ecfdf5' : 'white' }}>
          <option value="">Not in a group</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          {groups.length < MAX_GROUPS && <option value={NEW}>+ New group…</option>}
        </select>
      )}
      <div style={{ fontSize: 11, marginTop: 3, color: state && !['saving', 'saved'].includes(state) ? '#dc2626' : '#6b7280' }}>
        {state === 'saving' ? 'Saving…' : state === 'saved' ? '✓ Saved — applies to every item in this category' : state || 'Applies to the whole category, not only this item.'}
      </div>
      {editing && <ReportGroupsEditor restaurantId={restaurantId} groups={groups} onClose={() => setEditing(false)} />}
    </div>
  );
}
