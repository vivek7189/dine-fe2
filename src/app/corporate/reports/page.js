'use client';
// MIS reports (Phase 6) — Summary / Per-employee consumption / Per-client subsidy, with date-range
// + client/site filters. All read-only aggregations over mealConsumptions on the backend.
import { useEffect, useState, useCallback } from 'react';
import { FaChartBar, FaSyncAlt, FaUsers, FaBuilding, FaUtensils, FaHandHoldingUsd } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, StatCard, Select, TextInput, Loader, EmptyState, useToast } from '../../../components/corporate/ui';

function todayIST() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function monthStartIST() { const t = todayIST(); return `${t.slice(0, 7)}-01`; }

const TABS = [
  { key: 'summary', label: 'Summary', icon: FaChartBar },
  { key: 'consumption', label: 'By Employee', icon: FaUsers },
  { key: 'subsidy', label: 'By Client', icon: FaBuilding },
];

export default function ReportsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('summary');
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [from, setFrom] = useState(monthStartIST());
  const [to, setTo] = useState(todayIST());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const [c, s] = await Promise.all([corporateApi.listClients(), corporateApi.listSites()]);
      setClients(c.clients || []); setSites(s.sites || []);
    } catch (e) { toast.error(e.message); }
  })(); }, []); // eslint-disable-line

  const load = useCallback(async () => {
    setLoading(true);
    const params = { from, to, clientId: clientId || undefined, siteId: siteId || undefined };
    try {
      let res;
      if (tab === 'summary') res = await corporateApi.reports.summary(params);
      else if (tab === 'consumption') res = await corporateApi.reports.consumption(params);
      else res = await corporateApi.reports.subsidy(params);
      setData(res);
    } catch (e) { toast.error(e.message); setData(null); } finally { setLoading(false); }
  }, [tab, from, to, clientId, siteId]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return (
    <div style={S.page}>
      <PageHeader title="Reports" subtitle="Consumption, subsidy & billing insights"
        action={<button onClick={load} style={{ ...S.btnGhost }}><FaSyncAlt size={12} /> Refresh</button>} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ maxWidth: 220 }}><option value="">All clients</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ maxWidth: 220 }}><option value="">All sites</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ maxWidth: 160 }} />
        <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ maxWidth: 160 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: C.radiusPill,
              border: `1px solid ${active ? C.primary : C.border}`, background: active ? C.primarySoft : C.surface,
              color: active ? C.primary : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}><Icon size={12} /> {t.label}</button>
          );
        })}
      </div>

      {loading ? <Loader /> : !data ? (
        <EmptyState title="No data" subtitle="Try a different date range or filter." />
      ) : tab === 'summary' ? <SummaryView data={data} />
        : tab === 'consumption' ? <ConsumptionView data={data} />
        : <SubsidyView data={data} />}
    </div>
  );
}

function SummaryView({ data }) {
  const t = data.totals || {};
  const trend = data.trend || [];
  const maxCount = Math.max(1, ...trend.map((d) => d.count));
  const payMethods = Object.entries(data.byPayMethod || {});
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Meals served" value={t.meals || 0} icon={FaUtensils} tone="primary" />
        <StatCard label="Total value" value={money(t.revenue)} sub={`Avg ${money(t.avgMealValue)}/meal`} icon={FaChartBar} tone="blue" />
        <StatCard label="Employer subsidy" value={money(t.subsidy)} icon={FaHandHoldingUsd} tone="green" />
        <StatCard label="Employee copay" value={money(t.copay)} icon={FaHandHoldingUsd} tone="amber" />
      </div>

      {trend.length > 0 && (
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Daily meals</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
            {trend.map((d) => (
              <div key={d.date} title={`${d.date}: ${d.count}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 22 }}>
                <div style={{ width: 16, height: Math.round((d.count / maxCount) * 96) + 4, background: C.grad, borderRadius: 4 }} />
                <div style={{ fontSize: 9, color: C.faint, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {payMethods.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Copay collected by method</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {payMethods.map(([m, v]) => (
              <div key={m} style={{ padding: '8px 14px', borderRadius: C.radiusSm, background: C.surface2, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.faint, textTransform: 'capitalize' }}>{m}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{money(v)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function ConsumptionView({ data }) {
  const rows = data.employees || [];
  if (!rows.length) return <EmptyState title="No consumption" subtitle="No meals recorded in this range." />;
  return (
    <Card pad={false}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead><tr style={{ background: C.surface2 }}>
            {['Employee', 'Code', 'Meals', 'Value', 'Subsidy', 'Copay'].map((h, i) => <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.employeeId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: C.ink }}>{e.name}</td>
                <td style={{ padding: '12px 16px', color: C.muted }}>{e.empCode || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: C.ink }}>{e.meals}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.ink2 }}>{money(e.revenue)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.green, fontWeight: 600 }}>{money(e.subsidy)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.amber, fontWeight: 600 }}>{money(e.copay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SubsidyView({ data }) {
  const rows = data.clients || [];
  if (!rows.length) return <EmptyState title="No subsidy data" subtitle="No meals recorded in this range." />;
  return (
    <Card pad={false}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead><tr style={{ background: C.surface2 }}>
            {['Client', 'Meals', 'Subsidy', 'Payroll copay', 'Billable'].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.clientId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: C.ink }}>{c.name}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.ink2 }}>{c.meals}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.green, fontWeight: 600 }}>{money(c.subsidy)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.amber, fontWeight: 600 }}>{money(c.payrollCopay)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: C.primary }}>{money(c.billable)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
