'use client';
// Meal periods per site — serving window, booking cutoff, price and optional menu.
import { useEffect, useState } from 'react';
import { FaPlus, FaClock, FaEdit, FaTrash, FaUtensils } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, Button, Modal, Field, TextInput, Select, EmptyState, Loader, useToast, statusPill } from '../../../components/corporate/ui';

const EMPTY = { siteId: '', name: 'Lunch', startTime: '12:00', endTime: '15:00', bookingCutoff: '', price: 0, menuText: '' };

export default function MealPeriodsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [periods, setPeriods] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    try { const s = await corporateApi.listSites(); setSites(s.sites || []); if ((s.sites || [])[0]) setSiteId(s.sites[0].id); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  })(); }, []); // eslint-disable-line

  const loadPeriods = async (sid) => {
    if (!sid) { setPeriods([]); return; }
    try { const r = await corporateApi.listMealPeriods({ siteId: sid }); setPeriods(r.periods || []); }
    catch (e) { toast.error(e.message); }
  };
  useEffect(() => { loadPeriods(siteId); }, [siteId]); // eslint-disable-line

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, siteId }); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ siteId: p.siteId, name: p.name, startTime: p.startTime, endTime: p.endTime, bookingCutoff: p.bookingCutoff || '', price: p.price || 0, menuText: (p.menu || []).map((m) => m.name).join(', ') }); setOpen(true); };

  const save = async () => {
    if (!form.siteId) { toast.error('Select a site'); return; }
    if (!form.name.trim()) { toast.error('Period name is required'); return; }
    setSaving(true);
    const body = { ...form, menu: form.menuText.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name })) };
    try {
      if (editing) await corporateApi.updateMealPeriod(editing.id, body);
      else await corporateApi.createMealPeriod(body);
      toast.success(editing ? 'Meal period updated' : 'Meal period added');
      setOpen(false); await loadPeriods(siteId);
    } catch (e) { toast.error(e.message || 'Save failed'); } finally { setSaving(false); }
  };
  const del = async (p) => { if (!window.confirm(`Delete "${p.name}"?`)) return; try { await corporateApi.deleteMealPeriod(p.id); toast.success('Deleted'); await loadPeriods(siteId); } catch (e) { toast.error(e.message); } };

  return (
    <div style={S.page}>
      <PageHeader title="Meal Periods" subtitle="Breakfast, lunch, dinner — windows, cutoffs & pricing"
        action={<Button onClick={openNew} disabled={!siteId}><FaPlus size={12} /> Add Period</Button>} />

      {sites.length > 0 && (
        <div style={{ marginBottom: 16, maxWidth: 280 }}>
          <Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        </div>
      )}

      {loading ? <Loader /> : sites.length === 0 ? (
        <EmptyState icon={FaClock} title="Add a site first" subtitle="Meal periods belong to a site." action={<Button onClick={() => (window.location.href = '/corporate/sites')}>Go to Sites</Button>} />
      ) : periods.length === 0 ? (
        <EmptyState icon={FaClock} title="No meal periods" subtitle="Add serving windows like Lunch 12:00–15:00." action={<Button onClick={openNew}><FaPlus size={12} /> Add Period</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {periods.map((p) => (
            <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.amberSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaUtensils size={16} color={C.amber} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>{p.startTime}–{p.endTime}</div>
                </div>
                <span style={statusPill(p.active === false ? 'inactive' : 'active')}>{p.active === false ? 'off' : 'on'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{money(p.price)}</span>
                {p.bookingCutoff && <span style={{ ...statusPill('pending'), textTransform: 'none' }}>Cutoff {p.bookingCutoff}</span>}
              </div>
              {(p.menu || []).length > 0 && <div style={{ fontSize: 12, color: C.muted }}>{(p.menu || []).map((m) => m.name).join(' · ')}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={() => openEdit(p)} style={{ flex: 1 }}><FaEdit size={11} /> Edit</Button>
                <Button variant="danger" onClick={() => del(p)}><FaTrash size={11} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Meal Period' : 'Add Meal Period'}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} loading={saving}>{editing ? 'Save' : 'Add period'}</Button></>}>
        <Field label="Site" required><Select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })} disabled={!!editing}>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Breakfast / Lunch / Dinner" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Starts"><TextInput type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
          <Field label="Ends"><TextInput type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
          <Field label="Booking cutoff" hint="Optional"><TextInput type="time" value={form.bookingCutoff} onChange={(e) => setForm({ ...form, bookingCutoff: e.target.value })} /></Field>
        </div>
        <Field label="Price (₹)" required><TextInput type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
        <Field label="Menu items" hint="Comma-separated, for display on the employee app."><TextInput value={form.menuText} onChange={(e) => setForm({ ...form, menuText: e.target.value })} placeholder="Veg Thali, Paneer, Curd Rice" /></Field>
      </Modal>
    </div>
  );
}
