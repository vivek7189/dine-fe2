'use client';
// Bookings — pre-booked meals per site/date. Employees book from their app; operators can too.
import { useEffect, useState } from 'react';
import { FaCalendarCheck, FaPlus, FaTimes } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S } from '../../../corporate/theme';
import { PageHeader, Card, Button, Modal, Field, Select, TextInput, EmptyState, Loader, useToast, statusPill } from '../../../components/corporate/ui';

function todayIST() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }

export default function BookingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [date, setDate] = useState(todayIST());
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: '', periodId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    try { const s = await corporateApi.listSites(); setSites(s.sites || []); if ((s.sites || [])[0]) setSiteId(s.sites[0].id); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  })(); }, []); // eslint-disable-line

  const load = async () => {
    if (!siteId) return;
    try {
      const [b, e, p] = await Promise.all([
        corporateApi.listBookings({ siteId, date }),
        corporateApi.listEmployees({ siteId }),
        corporateApi.listMealPeriods({ siteId }),
      ]);
      setBookings(b.bookings || []); setEmployees(e.employees || []); setPeriods(p.periods || []);
    } catch (er) { toast.error(er.message); }
  };
  useEffect(() => { load(); }, [siteId, date]); // eslint-disable-line

  const empName = (id) => employees.find((e) => e.id === id)?.name || '—';
  const perName = (id) => periods.find((p) => p.id === id)?.name || '—';

  const book = async () => {
    if (!form.employeeId || !form.periodId) { toast.error('Pick employee and period'); return; }
    setSaving(true);
    try { await corporateApi.createBooking({ ...form, date, source: 'operator' }); toast.success('Booked'); setOpen(false); setForm({ employeeId: '', periodId: '' }); await load(); }
    catch (e) { toast.error(e?.data?.error || e.message || 'Booking failed'); } finally { setSaving(false); }
  };
  const cancel = async (b) => { if (!window.confirm('Cancel this booking?')) return; try { await corporateApi.cancelBooking(b.id); toast.success('Cancelled'); await load(); } catch (e) { toast.error(e.message); } };

  const active = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <div style={S.page}>
      <PageHeader title="Bookings" subtitle="Pre-booked meals by date"
        action={<Button onClick={() => setOpen(true)} disabled={!siteId}><FaPlus size={12} /> Book</Button>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ maxWidth: 240 }}>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      {loading ? <Loader /> : sites.length === 0 ? (
        <EmptyState icon={FaCalendarCheck} title="Add a site first" action={<Button onClick={() => (window.location.href = '/corporate/sites')}>Go to Sites</Button>} />
      ) : active.length === 0 ? (
        <EmptyState icon={FaCalendarCheck} title="No bookings" subtitle="No meals pre-booked for this day." />
      ) : (
        <Card pad={false}>
          {active.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${C.borderSoft}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{empName(b.employeeId)}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{perName(b.periodId)}</div>
              </div>
              <span style={statusPill(b.status)}>{b.status}</span>
              {b.status === 'booked' && <button onClick={() => cancel(b)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer' }}><FaTimes size={11} color={C.muted} /></button>}
            </div>
          ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Book a meal" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={book} loading={saving}>Book</Button></>}>
        <Field label="Date"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Employee" required><Select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select…</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}{e.empCode ? ` (${e.empCode})` : ''}</option>)}</Select></Field>
        <Field label="Meal period" required><Select value={form.periodId} onChange={(e) => setForm({ ...form, periodId: e.target.value })}><option value="">Select…</option>{periods.filter((p) => p.active !== false).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
      </Modal>
    </div>
  );
}
