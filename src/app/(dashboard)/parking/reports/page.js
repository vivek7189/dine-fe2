'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaChartBar, FaCar, FaClock, FaMoneyBillWave, FaCalendarAlt,
  FaArrowLeft, FaDownload, FaCreditCard, FaWallet, FaMobileAlt,
  FaChartLine, FaLayerGroup, FaMapMarkerAlt, FaPercent, FaFilePdf,
  FaSpinner, FaUserTie, FaFileExcel, FaFileCsv, FaUsers, FaUser
} from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import Link from 'next/link';

const PRIMARY = '#0369a1';
const PRIMARY_DARK = '#075985';
const PRIMARY_LIGHT = '#e0f2fe';
const BG = '#f8fafc';
const SUCCESS = '#16a34a';
const SUCCESS_BG = '#dcfce7';
const WARNING = '#d97706';
const WARNING_BG = '#fef3c7';
const DANGER = '#dc2626';

const CHART_COLORS = ['#0369a1', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308'];

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

function formatCurrency(val) {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Safely extract display string from values that might be {en, ar} objects
function safeStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.en || val.ar || val.url || Object.values(val).find(v => typeof v === 'string') || '';
  return String(val);
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getDatePresets() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 6);

  const last30 = new Date(today);
  last30.setDate(last30.getDate() - 29);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return [
    { label: 'Today', start: todayStr, end: todayStr },
    { label: 'Last 7 Days', start: last7.toISOString().split('T')[0], end: todayStr },
    { label: 'Last 30 Days', start: last30.toISOString().split('T')[0], end: todayStr },
    { label: 'This Month', start: monthStart.toISOString().split('T')[0], end: todayStr },
  ];
}

// ================================================================
export default function ParkingReportsPage() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 6);
  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [activePreset, setActivePreset] = useState('Last 7 Days');

  // Download state
  const [reportFormat, setReportFormat] = useState('xlsx');
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [staffFilter, setStaffFilter] = useState('all');

  // User info
  const [user, setUser] = useState(null);
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || '{}')); } catch { setUser({}); }
  }, []);
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

  // --- Responsive ---
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // --- Load restaurantId (localStorage → user → API) ---
  useEffect(() => {
    const resolve = async () => {
      try {
        const saved = localStorage.getItem('selectedRestaurantId');
        if (saved) { setRestaurantId(saved); return; }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.restaurantId) { setRestaurantId(user.restaurantId); return; }
        const res = await apiClient.getRestaurants();
        const list = res?.restaurants || [];
        if (list.length > 0) {
          const r = list.find(r => r.id === res.defaultRestaurantId) || list[0];
          localStorage.setItem('selectedRestaurantId', r.id);
          setRestaurantId(r.id);
          return;
        }
      } catch {}
      setLoading(false);
    };
    resolve();
  }, []);

  // --- Load reports ---
  const loadReports = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, printRes] = await Promise.allSettled([
        apiClient.getParkingReports(restaurantId, { startDate, endDate }),
        apiClient.getPrintSettings(restaurantId)
      ]);
      const rData = reportsRes.status === 'fulfilled' ? (reportsRes.value?.reports || null) : null;
      // Merge receipt logo from admin print settings as fallback
      if (rData?.config) {
        const ps = printRes.status === 'fulfilled' ? printRes.value?.printSettings : null;
        if (!rData.config.logo && ps?.receiptLogo?.url && ps.receiptLogo.enabled !== false) {
          rData.config.logo = ps.receiptLogo.url;
        }
      }
      setReports(rData);
      if (reportsRes.status === 'rejected') throw reportsRes.reason;
    } catch (e) {
      console.error('Failed to load reports:', e);
      setError(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, startDate, endDate]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handlePreset = (preset) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setActivePreset(preset.label);
  };

  const handleDateChange = (field, value) => {
    if (field === 'start') setStartDate(value);
    else setEndDate(value);
    setActivePreset(null);
  };

  const presets = getDatePresets();
  const summary = reports?.summary || {};
  const reportConfig = reports?.config || {};
  const vehicleTypes = reports?.vehicleTypes || [];
  const zones = reports?.zones || [];
  const dailyRevenue = reports?.dailyRevenue || [];
  const hourlyDistribution = reports?.hourlyDistribution || [];
  const paymentMethods = reports?.paymentMethods || {};
  const currency = summary.currency || reportConfig.currency || 'AED';

  const maxVehicleTypeCount = Math.max(...vehicleTypes.map(v => v.count || 0), 1);
  const maxZoneCount = Math.max(...zones.map(z => z.totalVehicles || 0), 1);
  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue || 0), 1);
  const maxHourlyCount = Math.max(...hourlyDistribution.map(h => h.count || 0), 1);

  const operators = reports?.operators || [];
  const totalPayments = (paymentMethods.cash || 0) + (paymentMethods.card || 0) + (paymentMethods.digital || 0);

  // PDF Download
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      // Convert logo URL to base64 via backend proxy to avoid CORS issues with GCP Storage
      let pdfConfig = { ...reportConfig };
      if (pdfConfig.logo) {
        try {
          const proxyRes = await apiClient.imageToBase64(pdfConfig.logo);
          if (proxyRes?.base64) pdfConfig.logo = proxyRes.base64;
        } catch (e) {
          console.warn('Logo base64 proxy failed:', e.message);
        }
      }
      const { pdf } = await import('@react-pdf/renderer');
      const { ParkingReportPDFDocument } = await import('./ParkingReportPDF');
      const blob = await pdf(
        <ParkingReportPDFDocument
          config={pdfConfig}
          summary={summary}
          vehicleTypes={vehicleTypes}
          zones={zones}
          dailyRevenue={dailyRevenue}
          paymentMethods={paymentMethods}
          operators={operators}
          dateRange={`${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
          currency={currency}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Parking-Report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Excel/CSV Download
  const handleDownloadReport = async (staffId) => {
    if (!restaurantId) return;
    setDownloading(true);
    setDownloadType(staffId ? 'my' : 'all');
    try {
      await apiClient.downloadParkingReport(restaurantId, {
        startDate, endDate, staffId, format: reportFormat,
      });
    } catch (err) {
      alert(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  // ================================================================
  // RENDER
  // ================================================================
  if (!restaurantId && !loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: BG, minHeight: '100vh' }}>
        <FaChartBar size={40} style={{ color: '#d1d5db', marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No Restaurant Found</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Please log in again or select a restaurant.</p>
        <Link href="/parking" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
          background: PRIMARY, color: '#fff', borderRadius: 10, textDecoration: 'none',
          fontWeight: 600, fontSize: 14
        }}>
          <FaArrowLeft size={12} /> Back to Parking
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0', padding: isMobile ? '16px' : '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/parking" style={{
            width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', cursor: 'pointer'
          }}>
            <FaArrowLeft size={14} color="#475569" />
          </Link>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaChartBar size={20} color={PRIMARY} /> Parking Reports
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Analytics and revenue insights</p>
          </div>
        </div>
        {!loading && reports && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
            <FaDownload size={12} /> Scroll down to download reports
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      <div style={{ padding: isMobile ? '16px' : '20px 32px' }}>
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 16 : 20, border: '1px solid #e2e8f0'
        }}>
          {/* Presets */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {presets.map(p => (
              <button key={p.label} onClick={() => handlePreset(p)} style={{
                padding: '7px 16px', borderRadius: 8, border: activePreset === p.label ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                background: activePreset === p.label ? PRIMARY_LIGHT : '#fff',
                color: activePreset === p.label ? PRIMARY_DARK : '#475569',
                fontWeight: activePreset === p.label ? 600 : 400, fontSize: 13, cursor: 'pointer'
              }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaCalendarAlt size={13} color="#94a3b8" />
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>From:</label>
              <input type="date" value={startDate} onChange={e => handleDateChange('start', e.target.value)}
                style={dateInputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>To:</label>
              <input type="date" value={endDate} onChange={e => handleDateChange('end', e.target.value)}
                style={dateInputStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* Download Report Section */}
      {!loading && reports && (
        <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? 16 : 20, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FaDownload size={16} color={PRIMARY} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Download Parking Report</h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0' }}>
              Download detailed reports — your own or all staff. Includes sales breakdown, payment methods, and transaction details.
            </p>

            {/* Format selector */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
              {[{ id: 'xlsx', label: 'Excel', icon: FaFileExcel }, { id: 'csv', label: 'CSV', icon: FaFileCsv }].map((f, i) => (
                <button key={f.id} onClick={() => setReportFormat(f.id)} style={{
                  padding: '8px 18px', border: `1px solid ${reportFormat === f.id ? PRIMARY : '#e2e8f0'}`,
                  background: reportFormat === f.id ? PRIMARY_LIGHT : '#fff',
                  color: reportFormat === f.id ? PRIMARY_DARK : '#475569',
                  fontWeight: reportFormat === f.id ? 600 : 400, fontSize: 13, cursor: 'pointer',
                  borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
                  borderLeft: i > 0 ? 'none' : undefined,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <f.icon size={13} /> {f.label}
                </button>
              ))}
            </div>

            {/* Staff filter for owner/admin */}
            {isOwnerOrAdmin && operators.length > 1 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Staff Filter</label>
                <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} style={{
                  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#334155', minWidth: 200, outline: 'none',
                }}>
                  <option value="all">All Staff</option>
                  {operators.map(op => <option key={op.id} value={op.id}>{safeStr(op.name)}</option>)}
                </select>
              </div>
            )}

            {/* Download buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadReport(user?.id || user?.userId)}
                disabled={downloading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: 'none',
                  background: downloading && downloadType === 'my' ? '#94a3b8' : PRIMARY,
                  color: '#fff', fontWeight: 600, fontSize: 13, cursor: downloading ? 'wait' : 'pointer',
                }}
              >
                {downloading && downloadType === 'my' ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaUser size={13} />}
                {downloading && downloadType === 'my' ? 'Downloading...' : `Download My Report (${reportFormat.toUpperCase()})`}
              </button>
              {isOwnerOrAdmin && (
                <button
                  onClick={() => handleDownloadReport(staffFilter !== 'all' ? staffFilter : null)}
                  disabled={downloading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: 'none',
                    background: downloading && downloadType === 'all' ? '#94a3b8' : '#7c3aed',
                    color: '#fff', fontWeight: 600, fontSize: 13, cursor: downloading ? 'wait' : 'pointer',
                  }}
                >
                  {downloading && downloadType === 'all' ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaUsers size={13} />}
                  {downloading && downloadType === 'all' ? 'Downloading...' : `${staffFilter !== 'all' ? 'Staff' : 'All Staff'} Report (${reportFormat.toUpperCase()})`}
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: 'none',
                  background: pdfGenerating ? '#94a3b8' : '#dc2626',
                  color: '#fff', fontWeight: 600, fontSize: 13, cursor: pdfGenerating ? 'wait' : 'pointer',
                }}
              >
                {pdfGenerating ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaFilePdf size={13} />}
                {pdfGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#94a3b8', margin: '10px 0 0 0' }}>
              Report includes: Staff Summary, Payment Breakdown (Cash/Card/Digital), Daily Revenue, Transaction Details {reportFormat === 'xlsx' ? '— Excel has 4 separate sheets' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ padding: isMobile ? '0 16px' : '0 32px', marginBottom: 16 }}>
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#991b1b', fontSize: 14, fontWeight: 500 }}>
            {error}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <Shimmer key={i} h={100} r={12} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
            <SummaryCard
              icon={FaMoneyBillWave} label="Total Revenue"
              value={formatCurrency(summary.totalRevenue || 0)} prefix={currency}
              color={SUCCESS}
            />
            <SummaryCard
              icon={FaCar} label="Total Vehicles"
              value={formatCurrency(summary.totalVehicles || 0)}
              color={PRIMARY}
            />
            <SummaryCard
              icon={FaClock} label="Avg Duration"
              value={formatDuration(summary.averageDuration || 0)}
              color={WARNING}
            />
            <SummaryCard
              icon={FaChartLine} label="Avg Revenue/Vehicle"
              value={formatCurrency(summary.averageRevenuePerVehicle || 0)} prefix={currency}
              color="#8b5cf6"
            />
          </div>
        )}
      </div>

      {/* Staff Performance Table */}
      {!loading && isOwnerOrAdmin && operators.length > 0 && (
        <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FaUserTie size={16} color={PRIMARY} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Staff Performance</h3>
            </div>
            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={thStyle}>Staff</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Vehicles</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Revenue ({currency})</th>
                    <th style={{ ...thStyle, textAlign: 'right', color: SUCCESS }}>Cash</th>
                    <th style={{ ...thStyle, textAlign: 'right', color: PRIMARY }}>Card</th>
                    <th style={{ ...thStyle, textAlign: 'right', color: '#7c3aed' }}>Digital</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op, i) => (
                    <tr key={op.id || i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{safeStr(op.name)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{op.vehicles}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(op.revenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: SUCCESS }}>{formatCurrency(op.cashRevenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: PRIMARY }}>{formatCurrency(op.cardRevenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#7c3aed' }}>{formatCurrency(op.digitalRevenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{formatDuration(op.avgDuration)}</td>
                    </tr>
                  ))}
                  {operators.length > 1 && (
                    <tr style={{ background: '#f0f9ff', borderTop: '2px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{operators.reduce((s, o) => s + (o.vehicles || 0), 0)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{formatCurrency(operators.reduce((s, o) => s + (o.revenue || 0), 0))}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: SUCCESS }}>{formatCurrency(operators.reduce((s, o) => s + (o.cashRevenue || 0), 0))}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: PRIMARY }}>{formatCurrency(operators.reduce((s, o) => s + (o.cardRevenue || 0), 0))}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(operators.reduce((s, o) => s + (o.digitalRevenue || 0), 0))}</td>
                      <td style={tdStyle}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>

          {/* Vehicle Type Distribution */}
          <ChartCard title="Vehicle Type Distribution" icon={FaCar} loading={loading}>
            {vehicleTypes.length === 0 ? (
              <EmptyChart message="No vehicle data" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {vehicleTypes.map((vt, i) => (
                  <div key={vt.type || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155', textTransform: 'capitalize' }}>{safeStr(vt.type) || 'Unknown'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{vt.count} ({vt.percentage || Math.round((vt.count / (summary.totalVehicles || 1)) * 100)}%)</span>
                    </div>
                    <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(vt.count / maxVehicleTypeCount) * 100}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 6,
                        transition: 'width 0.5s ease', minWidth: vt.count > 0 ? 4 : 0
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          {/* Zone Utilization */}
          <ChartCard title="Zone Utilization" icon={FaMapMarkerAlt} loading={loading}>
            {zones.length === 0 ? (
              <EmptyChart message="No zone data" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {zones.map((z, i) => (
                  <div key={z.zoneId || z.zoneName || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{safeStr(z.zoneName) || 'Zone'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{z.totalVehicles} vehicles &middot; {currency} {formatCurrency(z.revenue || 0)}</span>
                    </div>
                    <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(z.totalVehicles / maxZoneCount) * 100}%`,
                        background: CHART_COLORS[(i + 2) % CHART_COLORS.length], borderRadius: 6,
                        transition: 'width 0.5s ease', minWidth: z.totalVehicles > 0 ? 4 : 0
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
        <ChartCard title="Payment Methods" icon={FaCreditCard} loading={loading}>
          {totalPayments === 0 ? (
            <EmptyChart message="No payment data" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Revenue by payment method */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <FaWallet size={18} color="#16a34a" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>{currency} {formatCurrency(paymentMethods.cashRevenue || 0)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', marginTop: 2 }}>Cash</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{paymentMethods.cash || 0} transactions</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <FaCreditCard size={18} color="#0369a1" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{currency} {formatCurrency(paymentMethods.cardRevenue || 0)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', marginTop: 2 }}>Card</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{paymentMethods.card || 0} transactions</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                  <FaMobileAlt size={18} color="#7c3aed" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#6d28d9' }}>{currency} {formatCurrency(paymentMethods.digitalRevenue || 0)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginTop: 2 }}>Digital</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{paymentMethods.digital || 0} transactions</div>
                </div>
              </div>
              {/* Stacked bar */}
              <div>
                <div style={{ height: 32, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                  {paymentMethods.cash > 0 && (
                    <div style={{ height: '100%', width: `${((paymentMethods.cash || 0) / totalPayments) * 100}%`, background: '#16a34a', transition: 'width 0.5s ease' }} />
                  )}
                  {paymentMethods.card > 0 && (
                    <div style={{ height: '100%', width: `${((paymentMethods.card || 0) / totalPayments) * 100}%`, background: '#0369a1', transition: 'width 0.5s ease' }} />
                  )}
                  {paymentMethods.digital > 0 && (
                    <div style={{ height: '100%', width: `${((paymentMethods.digital || 0) / totalPayments) * 100}%`, background: '#8b5cf6', transition: 'width 0.5s ease' }} />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#6b7280' }}>
                  <span>Cash {totalPayments > 0 ? Math.round((paymentMethods.cash || 0) / totalPayments * 100) : 0}%</span>
                  <span>Card {totalPayments > 0 ? Math.round((paymentMethods.card || 0) / totalPayments * 100) : 0}%</span>
                  <span>Digital {totalPayments > 0 ? Math.round((paymentMethods.digital || 0) / totalPayments * 100) : 0}%</span>
                </div>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Daily Revenue */}
      <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 20px' }}>
        <ChartCard title="Daily Revenue" icon={FaChartLine} loading={loading}>
          {dailyRevenue.length === 0 ? (
            <EmptyChart message="No daily revenue data" />
          ) : (
            <>
              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 2 : 4, height: 160, marginBottom: 16 }}>
                {dailyRevenue.map((d, i) => {
                  const barHeight = maxDailyRevenue > 0 ? (d.revenue / maxDailyRevenue) * 140 : 0;
                  const dateLabel = new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  return (
                    <div key={d.date || i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', marginBottom: 4, whiteSpace: 'nowrap' }}>
                        {formatCurrency(d.revenue)}
                      </span>
                      <div style={{
                        width: '100%', maxWidth: 40, height: Math.max(barHeight, 2), background: PRIMARY,
                        borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease'
                      }} />
                      <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {isMobile && dailyRevenue.length > 14 && i % 3 !== 0 ? '' : dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Table with payment breakdown */}
              <div style={{ maxHeight: 300, overflowY: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                      <th style={thStyle}>Date</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
                      <th style={{ ...thStyle, textAlign: 'right', color: SUCCESS }}>Cash</th>
                      <th style={{ ...thStyle, textAlign: 'right', color: PRIMARY }}>Card</th>
                      <th style={{ ...thStyle, textAlign: 'right', color: '#7c3aed' }}>Digital</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Vehicles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRevenue.map((d, i) => (
                      <tr key={d.date || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>
                          {new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: SUCCESS }}>{formatCurrency(d.revenue)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontSize: 12, color: '#16a34a' }}>{formatCurrency(d.cashRevenue || 0)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontSize: 12, color: PRIMARY }}>{formatCurrency(d.cardRevenue || 0)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontSize: 12, color: '#7c3aed' }}>{formatCurrency(d.digitalRevenue || 0)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{d.vehicleCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Hourly Distribution */}
      <div style={{ padding: isMobile ? '0 16px 24px' : '0 32px 40px' }}>
        <ChartCard title="Hourly Distribution" icon={FaClock} loading={loading}>
          {hourlyDistribution.length === 0 ? (
            <EmptyChart message="No hourly data" />
          ) : (
            <div>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: isMobile ? 1 : 3, height: 140
              }}>
                {hourlyDistribution.map((h, i) => {
                  const barHeight = maxHourlyCount > 0 ? (h.count / maxHourlyCount) * 120 : 0;
                  const isPeak = h.count === maxHourlyCount && h.count > 0;
                  return (
                    <div key={h.hour !== undefined ? h.hour : i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <span style={{
                        fontSize: 9, fontWeight: isPeak ? 700 : 500,
                        color: isPeak ? DANGER : '#64748b', marginBottom: 2
                      }}>
                        {h.count > 0 ? h.count : ''}
                      </span>
                      <div style={{
                        width: '100%', maxWidth: 28, height: Math.max(barHeight, 2),
                        background: isPeak ? DANGER : (h.count > maxHourlyCount * 0.7 ? WARNING : PRIMARY),
                        borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease',
                        opacity: h.count === 0 ? 0.2 : 1
                      }} />
                    </div>
                  );
                })}
              </div>
              {/* Hour labels */}
              <div style={{ display: 'flex', gap: isMobile ? 1 : 3, marginTop: 4 }}>
                {hourlyDistribution.map((h, i) => (
                  <div key={i} style={{
                    flex: 1, textAlign: 'center', fontSize: isMobile ? 7 : 9, color: '#94a3b8', minWidth: 0
                  }}>
                    {isMobile && i % 3 !== 0 ? '' : `${String(h.hour !== undefined ? h.hour : i).padStart(2, '0')}`}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                Hour of day (00 - 23)
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ================================================================
// SUB-COMPONENTS
// ================================================================

function SummaryCard({ icon: Icon, label, value, prefix, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
          {prefix && <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginRight: 4 }}>{prefix}</span>}
          {value}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, loading, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon size={16} color={PRIMARY} />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Shimmer h={24} r={6} />
          <Shimmer h={24} r={6} />
          <Shimmer h={24} r={6} />
          <Shimmer h={24} r={6} />
        </div>
      ) : children}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
      <FaChartBar size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{message}</p>
    </div>
  );
}

function PaymentBlock({ icon: Icon, label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ textAlign: 'center', minWidth: 90 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{pct}%</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{count} transactions</div>
    </div>
  );
}

// ================================================================
// STYLES
// ================================================================

const dateInputStyle = {
  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', color: '#334155'
};

const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569',
  fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0'
};

const tdStyle = {
  padding: '10px 14px', color: '#334155'
};
