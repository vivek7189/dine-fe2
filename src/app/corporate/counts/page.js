'use client';
// Live counts — today's meals by period (booked vs served) with subsidy/copay/revenue. Auto-refresh.
import { useEffect, useState, useCallback } from 'react';
import { FaChartBar, FaSyncAlt } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, StatCard, Select, TextInput, Loader, useToast } from '../../../components/corporate/ui';

function todayIST() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }

export default function CountsPage() {
  const toast = useToast();
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [date, setDate] = useState(todayIST());
  const [periodsMap, setPeriodsMap] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const s = await corporateApi.listSites(); setSites(s.sites || []); if ((s.sites || [])[0]) setSiteId(s.sites[0].id); }
    catch (e) { toast.error(e.message); }
  })(); }, []); // eslint-disable-line

  const load = useCallback(async () => {
    try {
      const [cnt, per] = await Promise.all([
        corporateApi.counts({ siteId: siteId || undefined, date }),
        siteId ? corporateApi.listMealPeriods({ siteId }) : Promise.resolve({ periods: [] }),
      ]);
      const map = {}; (per.periods || []).forEach((p) => { map[p.id] = p.name; });
      setPeriodsMap(map); setData(cnt);
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  }, [siteId, date]); // eslint-disable-line

  useEffect(() => { setLoading(true); load(); }, [load]);
  // Auto-refresh every 20s when viewing today
  useEffect(() => {
    if (date !== todayIST()) return;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load, date]);

  const totals = data?.totals || { consumed: 0, booked: 0, subsidyTotal: 0, copayTotal: 0, revenue: 0 };

  return (
    <div style={S.page}>
      <PageHeader title="Live Counts" subtitle="Meals by period — refreshes automatically"
        action={<button onClick={load} style={{ ...S.btnGhost }}><FaSyncAlt size={12} /> Refresh</button>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ maxWidth: 240 }}><option value="">All sites</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Served" value={totals.consumed} sub={`${totals.booked} booked`} icon={FaChartBar} tone="primary" />
        <StatCard label="Subsidy" value={money(totals.subsidyTotal)} tone="green" icon={FaChartBar} />
        <StatCard label="Copay" value={money(totals.copayTotal)} tone="amber" icon={FaChartBar} />
        <StatCard label="Total value" value={money(totals.revenue)} tone="blue" icon={FaChartBar} />
      </div>

      {loading ? <Loader /> : !data?.periods?.length ? (
        <Card style={{ textAlign: 'center', padding: 40, color: C.muted }}>No meals recorded for this day yet.</Card>
      ) : (
        <Card pad={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead><tr style={{ background: C.surface2 }}>
                {['Meal period', 'Booked', 'Served', 'Subsidy', 'Copay', 'Value'].map((h) => <th key={h} style={{ textAlign: h === 'Meal period' ? 'left' : 'right', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {data.periods.map((p) => (
                  <tr key={p.periodId} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: C.ink }}>{periodsMap[p.periodId] || 'Period'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.muted }}>{p.booked}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: C.ink }}>{p.consumed}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.green, fontWeight: 600 }}>{money(p.subsidyTotal)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.amber, fontWeight: 600 }}>{money(p.copayTotal)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: C.ink2, fontWeight: 700 }}>{money(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
