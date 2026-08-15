'use client';
// Corporate Meals — dashboard. At-a-glance: today's meals + subsidy/copay, and the setup state.
import { useEffect, useState } from 'react';
import { FaBuilding, FaUsers, FaMapMarkerAlt, FaUtensils, FaQrcode, FaCalendarCheck, FaChartBar, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import corporateApi from '../../lib/corporateApi';
import { C, S, money } from '../../corporate/theme';
import { PageHeader, StatCard, Card, Loader } from '../../components/corporate/ui';

function todayIST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export default function CorporateDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ clients: 0, sites: 0, employees: 0, counts: null });

  useEffect(() => {
    (async () => {
      try {
        const [c, s, e, cnt] = await Promise.all([
          corporateApi.listClients().catch(() => ({ clients: [] })),
          corporateApi.listSites().catch(() => ({ sites: [] })),
          corporateApi.listEmployees().catch(() => ({ employees: [] })),
          corporateApi.counts({ date: todayIST() }).catch(() => null),
        ]);
        setData({
          clients: (c.clients || []).length,
          sites: (s.sites || []).length,
          employees: (e.employees || []).length,
          counts: cnt?.totals || null,
        });
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={S.page}><Loader /></div>;

  const t = data.counts || { consumed: 0, booked: 0, subsidyTotal: 0, copayTotal: 0, revenue: 0 };
  const quick = [
    { href: '/corporate/counter', label: 'Open Counter', desc: 'Scan & serve meals', icon: FaQrcode, tone: C.primary, bg: C.primarySoft },
    { href: '/corporate/employees', label: 'Employees', desc: 'Add / import & QR', icon: FaUsers, tone: C.blue, bg: C.blueSoft },
    { href: '/corporate/counts', label: 'Live Counts', desc: 'Today by meal period', icon: FaChartBar, tone: C.green, bg: C.greenSoft },
    { href: '/corporate/meal-periods', label: 'Meal Periods', desc: 'Timings & pricing', icon: FaUtensils, tone: C.amber, bg: C.amberSoft },
  ];

  return (
    <div style={S.page}>
      <PageHeader title="Dashboard" subtitle="Today's meals across your corporate sites" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
        <StatCard label="Meals served today" value={t.consumed} sub={`${t.booked} pre-booked`} icon={FaUtensils} tone="primary" />
        <StatCard label="Employer subsidy" value={money(t.subsidyTotal)} icon={FaBuilding} tone="green" />
        <StatCard label="Employee copay" value={money(t.copayTotal)} icon={FaUsers} tone="amber" />
        <StatCard label="Total value" value={money(t.revenue)} icon={FaChartBar} tone="blue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard label="Clients" value={data.clients} icon={FaBuilding} tone="primary" />
        <StatCard label="Sites" value={data.sites} icon={FaMapMarkerAlt} tone="blue" />
        <StatCard label="Employees" value={data.employees} icon={FaUsers} tone="green" />
      </div>

      <h2 style={{ ...S.h2, marginBottom: 12 }}>Quick actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
        {quick.map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} style={{ textDecoration: 'none' }}>
              <Card style={{ display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={(ev) => { ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.boxShadow = C.shadowLg; }}
                onMouseLeave={(ev) => { ev.currentTarget.style.transform = 'none'; ev.currentTarget.style.boxShadow = C.shadow; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color={q.tone} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{q.label}</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>{q.desc}</div>
                </div>
                <FaArrowRight size={13} color={C.faint} />
              </Card>
            </Link>
          );
        })}
      </div>

      {data.clients === 0 && (
        <Card style={{ marginTop: 20, background: C.primarySoft, border: `1px solid ${C.primaryBorder}` }}>
          <div style={{ fontWeight: 700, color: C.ink, marginBottom: 4 }}>👋 Get started</div>
          <div style={{ fontSize: 13.5, color: C.ink2 }}>Add your first <Link href="/corporate/clients" style={{ color: C.primary, fontWeight: 700 }}>client company</Link>, then create a site, meal periods and import employees. You&apos;ll be serving meals in minutes.</div>
        </Card>
      )}
    </div>
  );
}
