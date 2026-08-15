'use client';
// Employees — directory per site, with add, bulk CSV import and QR badge (react-qr-code).
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { FaPlus, FaUsers, FaEdit, FaTrash, FaQrcode, FaFileUpload, FaSyncAlt, FaWallet } from 'react-icons/fa';
import corporateApi from '../../../lib/corporateApi';
import { C, S, money } from '../../../corporate/theme';
import { PageHeader, Card, Button, Modal, Field, TextInput, Select, EmptyState, Loader, useToast, statusPill } from '../../../components/corporate/ui';

const EMPTY = { siteId: '', empCode: '', name: '', phone: '', email: '', walletBalance: 0 };

// Parse pasted CSV into [{empCode,name,phone,email}]. Accepts an optional header row.
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].toLowerCase();
  const hasHeader = /name|phone|email|code/.test(header) && !/^\+?\d/.test(lines[0].split(',')[0].trim());
  let idx = { empCode: 0, name: 1, phone: 2, email: 3 };
  let start = 0;
  if (hasHeader) {
    const cols = lines[0].split(',').map((c) => c.trim().toLowerCase());
    idx = {
      empCode: cols.findIndex((c) => /code|id|emp/.test(c)),
      name: cols.findIndex((c) => /name/.test(c)),
      phone: cols.findIndex((c) => /phone|mobile/.test(c)),
      email: cols.findIndex((c) => /email/.test(c)),
    };
    start = 1;
  }
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const c = lines[i].split(',').map((x) => x.trim());
    const get = (k) => (idx[k] >= 0 ? c[idx[k]] || '' : '');
    const name = get('name') || (idx.name < 0 ? c[1] : '');
    if (!name) continue;
    rows.push({ empCode: get('empCode'), name, phone: get('phone'), email: get('email') });
  }
  return rows;
}

export default function EmployeesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [importing, setImporting] = useState(false);

  const [qrEmp, setQrEmp] = useState(null);

  useEffect(() => { (async () => {
    try { const s = await corporateApi.listSites(); setSites(s.sites || []); if ((s.sites || [])[0]) setSiteId(s.sites[0].id); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  })(); }, []); // eslint-disable-line

  const loadEmployees = async (sid) => {
    if (!sid) { setEmployees([]); return; }
    try { const r = await corporateApi.listEmployees({ siteId: sid }); setEmployees(r.employees || []); }
    catch (e) { toast.error(e.message); }
  };
  useEffect(() => { loadEmployees(siteId); }, [siteId]); // eslint-disable-line

  const site = sites.find((s) => s.id === siteId);
  const filtered = employees.filter((e) => !search || `${e.name} ${e.empCode} ${e.phone}`.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, siteId }); setOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ siteId: e.siteId, empCode: e.empCode || '', name: e.name || '', phone: e.phone || '', email: e.email || '', walletBalance: e.walletBalance || 0 }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) await corporateApi.updateEmployee(editing.id, form);
      else await corporateApi.createEmployee({ ...form, siteId });
      toast.success(editing ? 'Employee updated' : 'Employee added'); setOpen(false); await loadEmployees(siteId);
    } catch (e) { toast.error(e.message || 'Save failed'); } finally { setSaving(false); }
  };
  const del = async (e) => { if (!window.confirm(`Delete ${e.name}?`)) return; try { await corporateApi.deleteEmployee(e.id); toast.success('Deleted'); await loadEmployees(siteId); } catch (er) { toast.error(er.message); } };

  const runImport = async () => {
    const rows = parseCsv(csv);
    if (!rows.length) { toast.error('No valid rows found. Format: empCode, name, phone, email'); return; }
    setImporting(true);
    try { const r = await corporateApi.importEmployees(siteId, rows); toast.success(`Imported ${r.created} employees${r.skipped?.length ? `, ${r.skipped.length} skipped` : ''}`); setImportOpen(false); setCsv(''); await loadEmployees(siteId); }
    catch (e) { toast.error(e.message || 'Import failed'); } finally { setImporting(false); }
  };

  const rotate = async () => { try { const r = await corporateApi.rotateQr(qrEmp.id); setQrEmp({ ...qrEmp, qrToken: r.qrToken }); toast.success('New QR issued'); loadEmployees(siteId); } catch (e) { toast.error(e.message); } };

  const parsedCount = csv ? parseCsv(csv).length : 0;

  return (
    <div style={S.page}>
      <PageHeader title="Employees" subtitle="Add, import and manage employee meal cards"
        action={<div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setImportOpen(true)} disabled={!siteId}><FaFileUpload size={12} /> Import CSV</Button>
          <Button onClick={openNew} disabled={!siteId}><FaPlus size={12} /> Add</Button>
        </div>} />

      {sites.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ maxWidth: 260 }}>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / code / phone" style={{ maxWidth: 280 }} />
        </div>
      )}

      {loading ? <Loader /> : sites.length === 0 ? (
        <EmptyState icon={FaUsers} title="Add a site first" subtitle="Employees belong to a site." action={<Button onClick={() => (window.location.href = '/corporate/sites')}>Go to Sites</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FaUsers} title={search ? 'No matches' : 'No employees yet'} subtitle={search ? 'Try another search.' : 'Add one, or import a CSV.'} action={!search && <Button onClick={openNew}><FaPlus size={12} /> Add Employee</Button>} />
      ) : (
        <Card pad={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead><tr style={{ background: C.surface2 }}>
                {['Employee', 'Code', 'Phone', 'Wallet', 'Status', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: '11px 16px', fontSize: 14, fontWeight: 600, color: C.ink }}>{e.name}<div style={{ fontSize: 11.5, color: C.faint, fontWeight: 400 }}>{e.email || ''}</div></td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: C.muted }}>{e.empCode || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: C.muted }}>{e.phone || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: C.ink2, fontWeight: 600 }}>{money(e.walletBalance)}</td>
                    <td style={{ padding: '11px 16px' }}><span style={statusPill(e.status === 'active' ? 'active' : 'inactive')}>{e.status || 'active'}</span></td>
                    <td style={{ padding: '9px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button title="QR badge" onClick={() => setQrEmp(e)} style={iconBtn}><FaQrcode size={13} color={C.primary} /></button>
                      <button title="Edit" onClick={() => openEdit(e)} style={iconBtn}><FaEdit size={13} color={C.muted} /></button>
                      <button title="Delete" onClick={() => del(e)} style={iconBtn}><FaTrash size={12} color={C.primary} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / edit */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} loading={saving}>{editing ? 'Save' : 'Add'}</Button></>}>
        <Field label="Full name" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Employee code"><TextInput value={form.empCode} onChange={(e) => setForm({ ...form, empCode: e.target.value })} /></Field>
          <Field label="Phone" hint="Used for app login (OTP)"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91…" /></Field>
        </div>
        <Field label="Email"><TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        {site?.clientId && <Field label="Opening wallet balance (₹)" hint="For prepaid clients"><TextInput type="number" min="0" value={form.walletBalance} onChange={(e) => setForm({ ...form, walletBalance: Number(e.target.value) })} /></Field>}
      </Modal>

      {/* Import */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Employees (CSV)" width={560}
        footer={<><Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button><Button onClick={runImport} loading={importing} disabled={!parsedCount}>Import {parsedCount || ''}</Button></>}>
        <Field label="Paste CSV" hint="Columns: empCode, name, phone, email (a header row is optional).">
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={9} placeholder={'empCode,name,phone,email\nE001,Asha Rao,+919000000001,asha@acme.com'} style={{ ...S.input, fontFamily: 'monospace', fontSize: 12.5, resize: 'vertical' }} />
        </Field>
        {csv && <div style={{ fontSize: 13, color: parsedCount ? C.green : C.primary, fontWeight: 600 }}>{parsedCount ? `✓ ${parsedCount} employees detected` : 'No valid rows detected'}</div>}
      </Modal>

      {/* QR badge */}
      <Modal open={!!qrEmp} onClose={() => setQrEmp(null)} title="Employee QR Badge" width={360}
        footer={<><Button variant="ghost" onClick={rotate}><FaSyncAlt size={11} /> New QR</Button><Button onClick={() => setQrEmp(null)}>Done</Button></>}>
        {qrEmp && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{qrEmp.name}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>{qrEmp.empCode || qrEmp.phone || ''}</div>
            <div style={{ display: 'inline-block', padding: 16, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <QRCode value={qrEmp.qrToken || 'x'} size={180} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 12, color: C.faint }}><FaWallet size={11} /> Wallet {money(qrEmp.walletBalance)}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 6, wordBreak: 'break-all' }}>{qrEmp.qrToken}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const iconBtn = { width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 2 };
