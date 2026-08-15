'use client';
// Counter — scan an employee QR (USB scanner types the token + Enter) or search, pick the meal
// period, and verify. Shows subsidy/copay result and a running list of served meals.
import { useEffect, useRef, useState } from 'react';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaUtensils, FaBolt } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, Button, Select, Loader, useToast } from '../../../components/corporate/ui';

const ERR = {
  EMPLOYEE_NOT_FOUND: 'Employee not found — check the QR',
  EMPLOYEE_INACTIVE: 'Employee is inactive',
  NOT_ENTITLED: 'Not entitled to this meal',
  OUTSIDE_WINDOW: 'Outside the serving window',
  ALREADY_CONSUMED: 'Already served this meal today',
  DAILY_CAP: 'Daily meal limit reached',
  INSUFFICIENT_WALLET: 'Insufficient wallet balance',
  PERIOD_INACTIVE: 'This meal period is off',
};

export default function CounterPage() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, ...}
  const [log, setLog] = useState([]);

  useEffect(() => { (async () => {
    try { const s = await corporateApi.listSites(); setSites(s.sites || []); if ((s.sites || [])[0]) setSiteId(s.sites[0].id); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  })(); }, []); // eslint-disable-line

  useEffect(() => { (async () => {
    if (!siteId) { setPeriods([]); return; }
    try { const r = await corporateApi.listMealPeriods({ siteId }); const act = (r.periods || []).filter((p) => p.active !== false); setPeriods(act); setPeriodId(act[0]?.id || ''); }
    catch (e) { toast.error(e.message); }
  })(); }, [siteId]); // eslint-disable-line

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 50);
  useEffect(() => { focusInput(); }, [periodId, result]);

  const submit = async (e) => {
    e?.preventDefault?.();
    const qrToken = token.trim();
    if (!qrToken) return;
    if (!periodId) { toast.error('Select a meal period first'); return; }
    setBusy(true); setResult(null);
    try {
      const r = await corporateApi.verify({ qrToken, periodId });
      setResult(r);
      setLog((l) => [{ id: r.consumptionId, name: r.employee?.name, copay: r.copay, subsidy: r.subsidy, ok: true, at: Date.now() }, ...l].slice(0, 12));
      toast.success(`${r.employee?.name} served`);
    } catch (err) {
      const code = err?.data?.code || err?.code;
      const msg = ERR[code] || err?.data?.error || err?.message || 'Verification failed';
      setResult({ ok: false, code, msg });
      setLog((l) => [{ id: `e${Date.now()}`, name: msg, ok: false, at: Date.now() }, ...l].slice(0, 12));
    } finally { setBusy(false); setToken(''); focusInput(); }
  };

  if (loading) return <div style={S.page}><Loader /></div>;

  const activePeriod = periods.find((p) => p.id === periodId);

  return (
    <div style={S.page}>
      <PageHeader title="Counter" subtitle="Scan an employee QR and serve" />

      {sites.length === 0 || periods.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <FaUtensils size={26} color={C.faint} style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 700, color: C.ink }}>{sites.length === 0 ? 'Add a site first' : 'No active meal periods'}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{sites.length === 0 ? 'Set up a site and meal periods to start serving.' : 'Add a meal period for this site.'}</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18, alignItems: 'start' }} className="cm-counter">
          {/* Scan panel */}
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={S.label}>Site</label><Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></div>
              <div><label style={S.label}>Meal period</label><Select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>{periods.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</Select></div>
            </div>

            <form onSubmit={submit}>
              <div style={{ position: 'relative' }}>
                <FaQrcode size={18} color={C.faint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input ref={inputRef} value={token} onChange={(e) => setToken(e.target.value)} autoFocus placeholder="Scan QR or type token, then Enter"
                  style={{ ...S.input, padding: '16px 14px 16px 42px', fontSize: 16, fontWeight: 600 }} />
              </div>
              <Button type="submit" loading={busy} style={{ width: '100%', marginTop: 12, padding: 14, fontSize: 15 }}><FaBolt size={13} /> Verify & Serve</Button>
            </form>

            {activePeriod && <div style={{ marginTop: 12, fontSize: 12.5, color: C.muted, textAlign: 'center' }}>Serving <b>{activePeriod.name}</b> · window {activePeriod.startTime}–{activePeriod.endTime} · price {money(activePeriod.price)}</div>}

            {/* Result */}
            {result && (
              <div style={{ marginTop: 16, borderRadius: 14, padding: 18, textAlign: 'center', background: result.ok ? C.greenSoft : C.primarySoft, border: `1px solid ${result.ok ? C.greenBorder : C.primaryBorder}` }}>
                {result.ok ? <FaCheckCircle size={34} color={C.green} /> : <FaTimesCircle size={34} color={C.primary} />}
                <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginTop: 8 }}>{result.ok ? result.employee?.name : 'Not served'}</div>
                {result.ok ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 12 }}>
                    <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>SUBSIDY</div><div style={{ fontSize: 17, fontWeight: 800, color: C.green }}>{money(result.subsidy)}</div></div>
                    <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>EMPLOYEE PAYS</div><div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{money(result.copay)}</div></div>
                    {result.payMethod === 'wallet' && <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>WALLET LEFT</div><div style={{ fontSize: 17, fontWeight: 800, color: C.blue }}>{money(result.walletBalance)}</div></div>}
                  </div>
                ) : <div style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, marginTop: 6 }}>{result.msg}</div>}
              </div>
            )}
          </Card>

          {/* Served log */}
          <Card pad={false} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.ink, fontSize: 14 }}>Recently served</div>
            {log.length === 0 ? <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: C.faint }}>No meals served yet</div> : (
              <div>
                {log.map((x) => (
                  <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: `1px solid ${C.borderSoft}` }}>
                    {x.ok ? <FaCheckCircle size={14} color={C.green} /> : <FaTimesCircle size={14} color={C.primary} />}
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: x.ok ? C.ink : C.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.name}</div>
                    {x.ok && <div style={{ fontSize: 12.5, color: C.muted }}>{money(x.copay)}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
      <style>{`@media (max-width: 820px){ .cm-counter{grid-template-columns:1fr !important} }`}</style>
    </div>
  );
}
