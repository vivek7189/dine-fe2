'use client';
// Corporate clients — the companies EverLoop caters for. Subsidy policy + payment model per client.
import { useEffect, useState } from 'react';
import { FaPlus, FaBuilding, FaEdit, FaTrash, FaPercent } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, Button, Modal, Field, TextInput, Select, EmptyState, Loader, useToast, statusPill } from '../../../components/corporate/ui';

const EMPTY = {
  name: '', gstin: '', billingCycle: 'monthly', paymentModel: 'prepaid_wallet',
  subsidyPolicy: { rule: 'percentage', employerShare: 0, caps: { perMeal: 0, perDay: 0, perMonth: 0 } },
};

function subsidyLabel(p) {
  if (!p || !p.employerShare) return 'No subsidy';
  return p.rule === 'flat' ? `Flat ${money(p.employerShare)}/meal` : `${p.employerShare}% employer`;
}

export default function ClientsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await corporateApi.listClients(); setClients(r.clients || []); }
    catch (e) { toast.error(e.message || 'Failed to load clients'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || '', gstin: c.gstin || '', billingCycle: c.billingCycle || 'monthly', paymentModel: c.paymentModel || 'prepaid_wallet', subsidyPolicy: { rule: c.subsidyPolicy?.rule || 'percentage', employerShare: c.subsidyPolicy?.employerShare || 0, caps: { perMeal: c.subsidyPolicy?.caps?.perMeal || 0, perDay: c.subsidyPolicy?.caps?.perDay || 0, perMonth: c.subsidyPolicy?.caps?.perMonth || 0 } } });
    setOpen(true);
  };

  const setSub = (patch) => setForm((f) => ({ ...f, subsidyPolicy: { ...f.subsidyPolicy, ...patch } }));
  const setCap = (patch) => setForm((f) => ({ ...f, subsidyPolicy: { ...f.subsidyPolicy, caps: { ...f.subsidyPolicy.caps, ...patch } } }));

  const save = async () => {
    if (!form.name.trim()) { toast.error('Client name is required'); return; }
    setSaving(true);
    try {
      if (editing) await corporateApi.updateClient(editing.id, form);
      else await corporateApi.createClient(form);
      toast.success(editing ? 'Client updated' : 'Client added');
      setOpen(false); await load();
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete client "${c.name}"? Its sites and employees stay but are unlinked.`)) return;
    try { await corporateApi.deleteClient(c.id); toast.success('Client deleted'); await load(); }
    catch (e) { toast.error(e.message || 'Delete failed'); }
  };

  return (
    <div style={S.page}>
      <PageHeader title="Clients" subtitle="Company accounts with their subsidy & billing setup"
        action={<Button onClick={openNew}><FaPlus size={12} /> Add Client</Button>} />

      {loading ? <Loader /> : clients.length === 0 ? (
        <EmptyState icon={FaBuilding} title="No clients yet" subtitle="Add the first company you cater for to begin."
          action={<Button onClick={openNew}><FaPlus size={12} /> Add Client</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {clients.map((c) => (
            <Card key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaBuilding size={17} color={C.primary} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.faint }}>{c.gstin || 'No GSTIN'}</div>
                </div>
                <span style={statusPill(c.status === 'active' ? 'active' : 'inactive')}>{c.status || 'active'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...statusPill('booked'), textTransform: 'none' }}><FaPercent size={9} /> {subsidyLabel(c.subsidyPolicy)}</span>
                <span style={{ ...statusPill('pending'), textTransform: 'none' }}>{c.paymentModel === 'postpaid_payroll' ? 'Payroll' : 'Prepaid wallet'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <Button variant="ghost" onClick={() => openEdit(c)} style={{ flex: 1 }}><FaEdit size={11} /> Edit</Button>
                <Button variant="danger" onClick={() => del(c)}><FaTrash size={11} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Client' : 'Add Client'} width={520}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} loading={saving}>{editing ? 'Save changes' : 'Add client'}</Button></>}>
        <Field label="Company name" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Technologies Pvt Ltd" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="GSTIN"><TextInput value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="Optional" /></Field>
          <Field label="Billing cycle"><Select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option></Select></Field>
        </div>
        <Field label="Payment model" hint="Prepaid: employee copay from in-app wallet. Payroll: copay accrues, settled via payroll.">
          <Select value={form.paymentModel} onChange={(e) => setForm({ ...form, paymentModel: e.target.value })}>
            <option value="prepaid_wallet">Prepaid wallet</option>
            <option value="postpaid_payroll">Postpaid payroll deduction</option>
          </Select>
        </Field>

        <div style={{ height: 1, background: C.borderSoft, margin: '6px 0 16px' }} />
        <div style={{ ...S.eyebrow, marginBottom: 10 }}>Employer subsidy</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Rule"><Select value={form.subsidyPolicy.rule} onChange={(e) => setSub({ rule: e.target.value })}><option value="percentage">Percentage of price</option><option value="flat">Flat amount / meal</option></Select></Field>
          <Field label={form.subsidyPolicy.rule === 'flat' ? 'Amount / meal (₹)' : 'Employer share (%)'}>
            <TextInput type="number" min="0" value={form.subsidyPolicy.employerShare} onChange={(e) => setSub({ employerShare: Number(e.target.value) })} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Cap / meal (₹)"><TextInput type="number" min="0" value={form.subsidyPolicy.caps.perMeal} onChange={(e) => setCap({ perMeal: Number(e.target.value) })} /></Field>
          <Field label="Cap / day (₹)"><TextInput type="number" min="0" value={form.subsidyPolicy.caps.perDay} onChange={(e) => setCap({ perDay: Number(e.target.value) })} /></Field>
          <Field label="Cap / month (₹)"><TextInput type="number" min="0" value={form.subsidyPolicy.caps.perMonth} onChange={(e) => setCap({ perMonth: Number(e.target.value) })} /></Field>
        </div>
        <div style={{ fontSize: 11.5, color: C.faint }}>Set a cap to 0 to disable it. Caps limit how much subsidy the employer pays per meal / day / month.</div>
      </Modal>
    </div>
  );
}
