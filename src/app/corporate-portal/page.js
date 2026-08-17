'use client';
// Corporate CLIENT self-service portal (Phase 5) — the company's read-only view of its own meal
// consumption + invoices. Standalone page (NOT the operator shell, NO restaurant login): the only
// credential is the per-client portal token, taken from ?t=<token> and remembered in localStorage.
import { useEffect, useState, useCallback } from 'react';
import { FaUtensils, FaHandHoldingUsd, FaFileInvoiceDollar, FaChartBar, FaUsers, FaFilePdf, FaEye, FaSyncAlt, FaLock } from 'react-icons/fa';
import corporatePortalApi from '../../lib/corporatePortalApi';
import { C, S, money } from '../../corporate/theme';
import { StatCard, Card, Loader, EmptyState, Modal, TextInput, ToastProvider, useToast } from '../../components/corporate/ui';

const TOKEN_KEY = 'cm_portal_token';
function todayISO() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function monthStartISO() { return todayISO().slice(0, 7) + '-01'; }

export default function CorporatePortalPage() {
  return <ToastProvider><Portal /></ToastProvider>;
}

function Portal() {
  const toast = useToast();
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState('overview');
  const [me, setMe] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // Resolve the token: ?t= in the URL wins (fresh link), else the remembered one.
  useEffect(() => {
    let t = null;
    try {
      const u = new URL(window.location.href);
      t = u.searchParams.get('t');
      if (t) { window.localStorage.setItem(TOKEN_KEY, t); }
      else { t = window.localStorage.getItem(TOKEN_KEY); }
    } catch { /* SSR guard */ }
    setToken(t);
    if (!t) { setAuthError('This portal link is missing its access token.'); setLoading(false); }
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try { const r = await corporatePortalApi.me(token); setMe(r); setAuthError(''); }
      catch (e) { setAuthError(e.message || 'Invalid or expired link'); setMe(null); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <Shell><Loader /></Shell>;

  if (authError || !me) {
    return (
      <Shell>
        <Card style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 440, margin: '40px auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><FaLock size={22} color={C.faint} /></div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Portal unavailable</div>
          <div style={{ fontSize: 13.5, color: C.muted }}>{authError || 'Please ask your caterer for a fresh access link.'}</div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell client={me.client}>
      {/* Current-month summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label={`Meals · ${me.month}`} value={me.summary.meals} icon={FaUtensils} tone="primary" />
        <StatCard label="Employer subsidy" value={money(me.summary.subsidy)} icon={FaHandHoldingUsd} tone="green" />
        <StatCard label="Employee copay" value={money(me.summary.copay)} icon={FaHandHoldingUsd} tone="amber" />
        <StatCard label="Billable to you" value={money(me.summary.billable)} icon={FaFileInvoiceDollar} tone="blue" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {[{ k: 'overview', l: 'Consumption', i: FaChartBar }, { k: 'invoices', l: 'Invoices', i: FaFileInvoiceDollar }].map((t) => {
          const Icon = t.i; const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: C.radiusPill,
              border: `1px solid ${active ? C.primary : C.border}`, background: active ? C.primarySoft : C.surface,
              color: active ? C.primary : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}><Icon size={12} /> {t.l}</button>
          );
        })}
      </div>

      {tab === 'overview' ? <Consumption token={token} toast={toast} /> : <Invoices token={token} clientName={me.client.name} toast={toast} />}
    </Shell>
  );
}

function Shell({ children, client }) {
  return (
    <div style={{ minHeight: '100vh', background: C.surface2 }}>
      <div style={{ background: C.grad, padding: '22px 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Meal Portal</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{client?.name || 'Corporate Meals'}</div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12.5, fontWeight: 600 }}>Powered by DineOpen</div>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 28px' }}>{children}</div>
    </div>
  );
}

function Consumption({ token, toast }) {
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await corporatePortalApi.consumption(token, { from, to })); }
    catch (e) { toast.error(e.message); setData(null); } finally { setLoading(false); }
  }, [token, from, to]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ maxWidth: 160 }} />
        <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ maxWidth: 160 }} />
        <button onClick={load} style={{ ...S.btnGhost }}><FaSyncAlt size={12} /> Refresh</button>
      </div>
      {loading ? <Loader /> : !data?.employees?.length ? (
        <EmptyState icon={FaUsers} title="No meals in this range" subtitle="Try a wider date range." />
      ) : (
        <Card pad={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead><tr style={{ background: C.surface2 }}>
                {['Employee', 'Code', 'Meals', 'Subsidy', 'Copay'].map((h, i) => <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {data.employees.map((e) => (
                  <tr key={e.employeeId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: C.ink }}>{e.name}</td>
                    <td style={{ padding: '12px 16px', color: C.muted }}>{e.empCode || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: C.ink }}>{e.meals}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.green, fontWeight: 600 }}>{money(e.subsidy)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.amber, fontWeight: 600 }}>{money(e.copay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function Invoices({ token, clientName, toast }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await corporatePortalApi.invoices(token); setInvoices(r.invoices || []); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  }, [token]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const view = async (id) => {
    try { const r = await corporatePortalApi.invoice(token, id); setDetail(r.invoice); }
    catch (e) { toast.error(e.message); }
  };
  const pdf = async (inv) => {
    try { await corporatePortalApi.downloadPdf(token, inv.id, `Invoice_${(clientName || 'client').replace(/[^a-zA-Z0-9]+/g, '_')}_${inv.period}.pdf`); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <Loader />;
  if (!invoices.length) return <EmptyState icon={FaFileInvoiceDollar} title="No invoices yet" subtitle="Your invoices will appear here once generated." />;

  return (
    <>
      <Card pad={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead><tr style={{ background: C.surface2 }}>
              {['Month', 'Meals', 'Payable', 'Status', ''].map((h, i) => <th key={h || i} style={{ textAlign: i === 1 || i === 2 ? 'right' : 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: C.ink }}>{inv.period}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: C.ink2 }}>{inv.totalMeals}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: C.primary }}>{money(inv.netPayable)}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: C.muted, fontSize: 13 }}>{inv.status || 'generated'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => view(inv.id)} style={{ ...S.btnGhost, padding: '6px 10px', marginRight: 6 }}><FaEye size={12} /> View</button>
                    <button onClick={() => pdf(inv)} style={{ ...S.btnGhost, padding: '6px 10px' }}><FaFilePdf size={12} /> PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <InvoiceDetail invoice={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function InvoiceDetail({ invoice, onClose }) {
  if (!invoice) return null;
  const lines = invoice.lines || [];
  return (
    <Modal open={!!invoice} onClose={onClose} title={`Invoice · ${invoice.period}`} width={640}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        {[['Meals', invoice.totalMeals], ['Subsidy', money(invoice.totalSubsidy)], ['Payroll copay', money(invoice.payrollCopay)], ['Net payable', money(invoice.netPayable)]].map(([l, v], i) => (
          <div key={l} style={{ padding: '10px 12px', borderRadius: C.radiusSm, background: i === 3 ? C.primarySoft : C.surface2, border: `1px solid ${i === 3 ? C.primaryBorder : C.border}` }}>
            <div style={{ fontSize: 11, color: C.faint }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: i === 3 ? C.primary : C.ink }}>{v}</div>
          </div>
        ))}
      </div>
      {lines.length > 0 && (
        <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: C.radiusSm }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
            <thead><tr style={{ background: C.surface2 }}>
              {['Employee', 'Meals', 'Subsidy', 'Billable'].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.employeeId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: C.ink }}>{l.name}{l.empCode ? <span style={{ color: C.faint }}> · {l.empCode}</span> : null}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: C.ink2 }}>{l.meals}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: C.green }}>{money(l.subsidy)}</td>
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
