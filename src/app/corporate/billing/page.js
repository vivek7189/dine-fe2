'use client';
// Client billing (Phase 4) — generate + view + reconcile monthly invoices per corporate client.
// The invoice bills the company for: employer subsidy + postpaid-payroll copay (wallet/cash copays
// were already collected from the employee, so they're shown for transparency but not billed).
import { useEffect, useState, useCallback } from 'react';
import { FaFileInvoiceDollar, FaSyncAlt, FaEye, FaCheckCircle, FaReceipt } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, StatCard, Select, TextInput, Button, Field, Modal, Loader, EmptyState, useToast } from '../../../components/corporate/ui';

function thisMonthIST() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).format(new Date()).slice(0, 7); }

const STATUS_TONE = { generated: C.slate, sent: C.blue, paid: C.green, reconciled: C.green };
function StatusPill({ status }) {
  const color = STATUS_TONE[status] || C.muted;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: C.radiusPill, fontSize: 11.5, fontWeight: 700, color, background: `${color}18`, textTransform: 'capitalize' }}>{status || 'generated'}</span>;
}

export default function BillingPage() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [month, setMonth] = useState(thisMonthIST());
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState(null);      // full invoice for the view modal
  const [reconcile, setReconcile] = useState(null); // invoice being reconciled

  useEffect(() => { (async () => {
    try { const c = await corporateApi.listClients(); setClients(c.clients || []); if ((c.clients || [])[0]) setClientId(c.clients[0].id); }
    catch (e) { toast.error(e.message); }
  })(); }, []); // eslint-disable-line

  const loadInvoices = useCallback(async () => {
    if (!clientId) { setInvoices([]); return; }
    setLoading(true);
    try { const r = await corporateApi.billing.listInvoices(clientId); setInvoices(r.invoices || []); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  }, [clientId]); // eslint-disable-line

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const generate = async () => {
    if (!clientId || !/^\d{4}-\d{2}$/.test(month)) { toast.error('Pick a client and month'); return; }
    setGenerating(true);
    try {
      const r = await corporateApi.billing.generateInvoice(clientId, month);
      toast.success(`Invoice for ${r.invoice.period} generated — ${money(r.invoice.netPayable)} payable`);
      await loadInvoices();
    } catch (e) { toast.error(e.message); } finally { setGenerating(false); }
  };

  const view = async (id) => {
    try { const r = await corporateApi.billing.getInvoice(id); setDetail(r.invoice); }
    catch (e) { toast.error(e.message); }
  };

  const totalBillable = invoices.reduce((s, i) => s + (Number(i.netPayable) || 0), 0);
  const outstanding = invoices.filter((i) => !['paid', 'reconciled'].includes(i.status)).reduce((s, i) => s + (Number(i.netPayable) || 0), 0);

  return (
    <div style={S.page}>
      <PageHeader title="Billing" subtitle="Generate & reconcile monthly client invoices"
        action={<button onClick={loadInvoices} style={{ ...S.btnGhost }}><FaSyncAlt size={12} /> Refresh</button>} />

      {/* Generate bar */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <Field label="Client"><Select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Select client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
          </div>
          <div style={{ minWidth: 160 }}>
            <Field label="Month"><TextInput type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></Field>
          </div>
          <Button onClick={generate} loading={generating} disabled={!clientId}><FaFileInvoiceDollar size={13} /> Generate invoice</Button>
        </div>
      </Card>

      {invoices.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, marginBottom: 18 }}>
          <StatCard label="Invoices" value={invoices.length} icon={FaReceipt} tone="primary" />
          <StatCard label="Total billed" value={money(totalBillable)} icon={FaFileInvoiceDollar} tone="blue" />
          <StatCard label="Outstanding" value={money(outstanding)} icon={FaFileInvoiceDollar} tone="amber" />
        </div>
      )}

      {loading ? <Loader /> : !clientId ? (
        <EmptyState title="Select a client" subtitle="Choose a client above to view its invoices." />
      ) : !invoices.length ? (
        <EmptyState icon={FaFileInvoiceDollar} title="No invoices yet" subtitle="Generate the first monthly invoice for this client." />
      ) : (
        <Card pad={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead><tr style={{ background: C.surface2 }}>
                {['Month', 'Meals', 'Net payable', 'Status', ''].map((h, i) => <th key={h || i} style={{ textAlign: i === 1 || i === 2 ? 'right' : 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: C.ink }}>{inv.period}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.ink2 }}>{inv.totalMeals}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: C.primary }}>{money(inv.netPayable)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusPill status={inv.status} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => view(inv.id)} style={{ ...S.btnGhost, padding: '6px 10px', marginRight: 6 }}><FaEye size={12} /> View</button>
                      {!['paid', 'reconciled'].includes(inv.status) && (
                        <button onClick={() => setReconcile(inv)} style={{ ...S.btnGhost, padding: '6px 10px', color: C.green, borderColor: C.greenBorder }}><FaCheckCircle size={12} /> Reconcile</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <InvoiceModal invoice={detail} onClose={() => setDetail(null)} />
      <ReconcileModal invoice={reconcile} onClose={() => setReconcile(null)} onDone={() => { setReconcile(null); loadInvoices(); }} />
    </div>
  );
}

function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;
  const lines = invoice.lines || [];
  return (
    <Modal open={!!invoice} onClose={onClose} title={`Invoice — ${invoice.clientName || ''} · ${invoice.period}`} width={640}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        {[['Meals', invoice.totalMeals], ['Consumption', money(invoice.totalConsumption)], ['Subsidy', money(invoice.totalSubsidy)], ['Payroll copay', money(invoice.payrollCopay)]].map(([l, v]) => (
          <div key={l} style={{ padding: '10px 12px', borderRadius: C.radiusSm, background: C.surface2, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.faint }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderRadius: C.radiusSm, background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: C.ink }}>Net payable by client</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{money(invoice.netPayable)}</span>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
        Wallet copay {money(invoice.walletCopay)} and cash copay {money(invoice.cashCopay)} were collected from employees and are not billed.
      </div>
      {lines.length > 0 && (
        <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: C.radiusSm }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead><tr style={{ background: C.surface2 }}>
              {['Employee', 'Meals', 'Subsidy', 'Payroll copay', 'Billable'].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.employeeId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: C.ink }}>{l.name}{l.empCode ? <span style={{ color: C.faint }}> · {l.empCode}</span> : null}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: C.ink2 }}>{l.meals}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: C.green }}>{money(l.subsidy)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: C.amber }}>{money(l.payrollCopay)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: C.ink }}>{money(l.billable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

function ReconcileModal({ invoice, onClose, onDone }) {
  const toast = useToast();
  const [status, setStatus] = useState('paid');
  const [paymentRef, setPaymentRef] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (invoice) { setStatus('paid'); setPaymentRef(''); setNote(''); } }, [invoice]);
  if (!invoice) return null;

  const save = async () => {
    setSaving(true);
    try {
      await corporateApi.billing.reconcileInvoice(invoice.id, { status, paymentRef, note });
      toast.success('Invoice reconciled');
      onDone();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal open={!!invoice} onClose={onClose} title={`Reconcile ${invoice.period}`} width={440}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}>
      <div style={{ marginBottom: 14, fontSize: 13.5, color: C.muted }}>Net payable <b style={{ color: C.primary }}>{money(invoice.netPayable)}</b></div>
      <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="paid">Paid</option><option value="reconciled">Reconciled</option><option value="sent">Sent</option><option value="generated">Generated</option></Select></Field>
      <Field label="Payment reference" hint="UTR / cheque / transfer id (optional)"><TextInput value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. UTR2026081712345" /></Field>
      <Field label="Note"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" /></Field>
    </Modal>
  );
}
