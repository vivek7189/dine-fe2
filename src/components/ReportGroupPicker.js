'use client';

// Menu → Add / Edit item and Add category: "Report group" (Food, Drinks, …) for the category, so a new
// category can be put in a group right where it is made. Only shown when the restaurant has report
// groups (Reports → Sales Summary → Category Sales → Set up groups); everyone else sees nothing.
// Groups are reports-only — the menu and POS stay the same.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

// same rule as the server (utils/reportGroups catId)
const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const cache = {}; // restaurantId → Promise<groups[]>
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
    return () => { alive = false; };
  }, [restaurantId]);
  return groups;
}

// which group a category (its id and/or name) is in ('' = none)
export function groupOfCategory(groups, category) {
  const keys = [category?.id, category?.name].map(catId).filter(Boolean);
  const g = (groups || []).find((x) => (x.categories || []).some((c) => keys.includes(catId(c))));
  return g ? g.id : '';
}

// Move a category into a group ('' = take it out of every group). Reads the latest groups first so
// a change made elsewhere is not lost.
export async function setCategoryGroup(restaurantId, category, groupId) {
  const keys = [category?.id, category?.name].map(catId).filter(Boolean);
  if (!restaurantId || !keys.length) return null;
  const latest = await loadGroups(restaurantId, true);
  const key = category.id || category.name;
  const next = latest.map((g) => {
    const rest = (g.categories || []).filter((c) => !keys.includes(catId(c)));
    return { ...g, categories: g.id === groupId ? [...rest, key] : rest };
  });
  const r = await apiClient.request(`/api/restaurants/${restaurantId}/report-groups`, { method: 'PUT', body: { reportGroups: next } });
  const saved = Array.isArray(r?.reportGroups) ? r.reportGroups : next;
  cache[restaurantId] = Promise.resolve(saved);
  return saved;
}

// Item window: the selected category's group, saved as soon as it is changed.
export default function ReportGroupPicker({ restaurantId, category }) {
  const groups = useReportGroups(restaurantId);
  const [current, setCurrent] = useState('');
  const [state, setState] = useState(''); // '' | 'saving' | 'saved' | error text
  const catKey = category ? `${category.id || ''}|${category.name || ''}` : '';
  useEffect(() => { setCurrent(groupOfCategory(groups, category)); setState(''); }, [groups, catKey]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!groups.length || !category) return null;
  const change = async (gid) => {
    const before = current;
    setCurrent(gid); setState('saving');
    try { await setCategoryGroup(restaurantId, category, gid); setState('saved'); }
    catch (e) { setCurrent(before); setState(e?.message || 'Could not save the group'); }
  };
  return (
    <div style={{ marginTop: 8 }} data-testid="item-report-group">
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        Report group <span style={{ color: '#9ca3af', fontWeight: 400 }}>— for “{category.name}” (sales reports only)</span>
      </label>
      <select value={current} onChange={(e) => change(e.target.value)} disabled={state === 'saving'} data-testid="item-report-group-select"
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, background: current ? '#ecfdf5' : 'white' }}>
        <option value="">Not in a group</option>
        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <div style={{ fontSize: 11, marginTop: 3, color: state && !['saving', 'saved'].includes(state) ? '#dc2626' : '#6b7280' }}>
        {state === 'saving' ? 'Saving…' : state === 'saved' ? '✓ Saved — applies to every item in this category' : state || 'Applies to the whole category, not only this item.'}
      </div>
    </div>
  );
}
