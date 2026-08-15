'use client';
// Corporate sites — a client's office/location with a canteen. Owns meal periods & employees.
import { useEffect, useState } from 'react';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S } from '../../../corporate/theme';
import { PageHeader, Card, Button, Modal, Field, TextInput, Select, EmptyState, Loader, useToast, statusPill } from '../../../components/corporate/ui';

const TZs = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Riyadh', 'Africa/Nairobi', 'Europe/London'];
const EMPTY = { clientId: '', name: '', address: '', timezone: 'Asia/Kolkata' };

export default function SitesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([corporateApi.listSites(filter ? { clientId: filter } : {}), corporateApi.listClients()]);
      setSites(s.sites || []); setClients(c.clients || []);
    } catch (e) { toast.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const clientName = (id) => clients.find((c) => c.id === id)?.name || '—';
  const openNew = () => { setEditing(null); setForm({ ...EMPTY, clientId: filter || clients[0]?.id || '' }); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ clientId: s.clientId, name: s.name || '', address: s.address || '', timezone: s.timezone || 'Asia/Kolkata' }); setOpen(true); };

  const save = async () => {
    if (!form.clientId) { toast.error('Select a client'); return; }
    if (!form.name.trim()) { toast.error('Site name is required'); return; }
    setSaving(true);
    try {
      if (editing) await corporateApi.updateSite(editing.id, form);
      else await corporateApi.createSite(form);
      toast.success(editing ? 'Site updated' : 'Site added');
      setOpen(false); await load();
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const del = async (s) => {
    if (!window.confirm(`Delete site "${s.name}"?`)) return;
    try { await corporateApi.deleteSite(s.id); toast.success('Site deleted'); await load(); }
    catch (e) { toast.error(e.message || 'Delete failed'); }
  };

  return (
    <div style={S.page}>
      <PageHeader title="Sites" subtitle="Office locations & canteens for each client"
        action={<Button onClick={openNew} disabled={clients.length === 0}><FaPlus size={12} /> Add Site</Button>} />

      {clients.length > 0 && (
        <div style={{ marginBottom: 16, maxWidth: 260 }}>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      )}

      {loading ? <Loader /> : clients.length === 0 ? (
        <EmptyState icon={FaMapMarkerAlt} title="Add a client first" subtitle="Sites belong to a client company." action={<Button onClick={() => (window.location.href = '/corporate/clients')}>Go to Clients</Button>} />
      ) : sites.length === 0 ? (
        <EmptyState icon={FaMapMarkerAlt} title="No sites yet" subtitle="Add an office location with a canteen." action={<Button onClick={openNew}><FaPlus size={12} /> Add Site</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {sites.map((s) => (
            <Card key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaMapMarkerAlt size={16} color={C.blue} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.faint }}>{clientName(s.clientId)}</div>
                </div>
                <span style={statusPill(s.status === 'active' ? 'active' : 'inactive')}>{s.status || 'active'}</span>
              </div>
              {s.address && <div style={{ fontSize: 12.5, color: C.muted }}>{s.address}</div>}
              <div style={{ fontSize: 11.5, color: C.faint }}>🕒 {s.timezone}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <Button variant="ghost" onClick={() => openEdit(s)} style={{ flex: 1 }}><FaEdit size={11} /> Edit</Button>
                <Button variant="danger" onClick={() => del(s)}><FaTrash size={11} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Site' : 'Add Site'}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} loading={saving}>{editing ? 'Save' : 'Add site'}</Button></>}>
        <Field label="Client" required><Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} disabled={!!editing}><option value="">Select client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Site name" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Whitefield Campus" /></Field>
        <Field label="Address"><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional" /></Field>
        <Field label="Timezone" hint="Serving windows & booking cutoffs use this timezone."><Select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>{TZs.map((t) => <option key={t} value={t}>{t}</option>)}</Select></Field>
      </Modal>
    </div>
  );
}
