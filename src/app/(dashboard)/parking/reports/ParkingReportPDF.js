'use client';

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// ── Helpers ──────────────────────────────────────────────────────

function fmtCurrency(amount, curr) {
  if (amount == null || isNaN(amount)) return `${curr || ''} 0`;
  return `${curr || ''} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtNum(v) {
  if (v == null || isNaN(v)) return '0';
  return Number(v).toLocaleString('en-US');
}

function fmtDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return '0%';
  return `${Number(v).toFixed(1)}%`;
}

// ── Colors ───────────────────────────────────────────────────────

const C = {
  primary: '#0369a1',
  primaryLight: '#e0f2fe',
  green: '#16a34a',
  greenLight: '#dcfce7',
  greenBg: '#f0fdf4',
  blue: '#1d4ed8',
  blueBg: '#eff6ff',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
  amber: '#d97706',
  amberLight: '#fef3c7',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#ffffff',
};

// ── Styles ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: C.gray900, position: 'relative' },
  // Header
  headerBar: { height: 4, backgroundColor: C.primary, marginBottom: 12, borderRadius: 2 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  logo: { width: 44, height: 44, objectFit: 'contain', borderRadius: 4 },
  orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  reportTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 2 },
  dateRange: { fontSize: 9, color: C.gray500 },
  genDate: { fontSize: 8, color: C.gray500, marginTop: 2, marginBottom: 14 },
  // Section
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.gray900, marginTop: 18, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: C.primary },
  // Summary row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: C.gray200, backgroundColor: C.white },
  statLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  statValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  statSub: { fontSize: 7, color: C.gray500, marginTop: 2 },
  // Tables
  tHead: { flexDirection: 'row', backgroundColor: C.gray100, borderBottomWidth: 1, borderBottomColor: C.gray200, paddingVertical: 6, paddingHorizontal: 6 },
  tRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray100, paddingVertical: 5, paddingHorizontal: 6 },
  tRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray100, paddingVertical: 5, paddingHorizontal: 6, backgroundColor: C.gray50 },
  th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: 9, color: C.gray700 },
  tdBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  // Payment cards
  paymentRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  paymentCard: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, textAlign: 'center', alignItems: 'center' },
  paymentValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  paymentLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  paymentCount: { fontSize: 7, color: C.gray500, marginTop: 2 },
  // Footer
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.gray200, paddingTop: 8 },
  footerText: { fontSize: 7, color: C.gray500 },
  pageNum: { fontSize: 7, color: C.gray500 },
});

// ── Header ───────────────────────────────────────────────────────

function ReportHeader({ logoUrl, lotName, reportTitle, dateRange }) {
  return (
    <View fixed>
      <View style={s.headerBar} />
      <View style={s.headerBrand}>
        {logoUrl ? <Image src={logoUrl} style={s.logo} /> : null}
        <View>
          {lotName ? <Text style={s.orgName}>{lotName}</Text> : null}
          <Text style={{ fontSize: 8, color: C.gray500 }}>Parking Management</Text>
        </View>
      </View>
      <Text style={s.reportTitle}>{reportTitle}</Text>
      {dateRange ? <Text style={s.dateRange}>{dateRange}</Text> : null}
      <Text style={s.genDate}>Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );
}

// ── Footer ───────────────────────────────────────────────────────

function ReportFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Generated by DineOpen Parking</Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ── Main Document ────────────────────────────────────────────────

export function ParkingReportPDFDocument({
  config = {},
  summary = {},
  vehicleTypes = [],
  zones = [],
  dailyRevenue = [],
  paymentMethods = {},
  dateRange,
  currency = 'AED',
}) {
  const totalPayments = (paymentMethods.cash || 0) + (paymentMethods.card || 0) + (paymentMethods.digital || 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header with Logo & Parking Name */}
        <ReportHeader
          logoUrl={config.logo || null}
          lotName={config.lotName || 'Parking'}
          reportTitle="Parking Revenue Report"
          dateRange={dateRange}
        />

        {/* Summary Stats */}
        <Text style={s.sectionTitle}>Summary</Text>
        <View style={s.statsRow}>
          <View style={[s.statBox, { borderColor: '#bbf7d0', backgroundColor: C.greenBg }]}>
            <Text style={s.statLabel}>Total Revenue</Text>
            <Text style={[s.statValue, { color: C.green }]}>{fmtCurrency(summary.totalRevenue, currency)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Total Vehicles</Text>
            <Text style={s.statValue}>{fmtNum(summary.totalVehicles)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Avg Duration</Text>
            <Text style={s.statValue}>{fmtDuration(summary.averageDuration)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Avg Rev/Vehicle</Text>
            <Text style={s.statValue}>{fmtCurrency(summary.averageRevenuePerVehicle, currency)}</Text>
          </View>
        </View>

        {/* Payment Method Breakdown */}
        <Text style={s.sectionTitle}>Payment Breakdown</Text>
        <View style={s.paymentRow}>
          <View style={[s.paymentCard, { borderColor: '#bbf7d0', backgroundColor: C.greenBg }]}>
            <Text style={[s.paymentValue, { color: C.green }]}>{fmtCurrency(paymentMethods.cashRevenue, currency)}</Text>
            <Text style={[s.paymentLabel, { color: C.green }]}>Cash</Text>
            <Text style={s.paymentCount}>{paymentMethods.cash || 0} transactions ({totalPayments > 0 ? Math.round((paymentMethods.cash || 0) / totalPayments * 100) : 0}%)</Text>
          </View>
          <View style={[s.paymentCard, { borderColor: '#bfdbfe', backgroundColor: C.blueBg }]}>
            <Text style={[s.paymentValue, { color: C.blue }]}>{fmtCurrency(paymentMethods.cardRevenue, currency)}</Text>
            <Text style={[s.paymentLabel, { color: C.blue }]}>Card</Text>
            <Text style={s.paymentCount}>{paymentMethods.card || 0} transactions ({totalPayments > 0 ? Math.round((paymentMethods.card || 0) / totalPayments * 100) : 0}%)</Text>
          </View>
          <View style={[s.paymentCard, { borderColor: '#ddd6fe', backgroundColor: C.purpleBg }]}>
            <Text style={[s.paymentValue, { color: C.purple }]}>{fmtCurrency(paymentMethods.digitalRevenue, currency)}</Text>
            <Text style={[s.paymentLabel, { color: C.purple }]}>Digital</Text>
            <Text style={s.paymentCount}>{paymentMethods.digital || 0} transactions ({totalPayments > 0 ? Math.round((paymentMethods.digital || 0) / totalPayments * 100) : 0}%)</Text>
          </View>
        </View>

        {/* Daily Revenue Table */}
        {dailyRevenue.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Daily Revenue</Text>
            <View>
              <View style={s.tHead}>
                <Text style={[s.th, { flex: 2 }]}>Date</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Revenue</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Vehicles</Text>
              </View>
              {dailyRevenue.map((d, i) => (
                <View key={d.date || i} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                  <Text style={[s.td, { flex: 2 }]}>
                    {new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={[s.tdBold, { flex: 2, textAlign: 'right', color: C.green }]}>
                    {fmtCurrency(d.revenue, currency)}
                  </Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>
                    {d.vehicleCount || 0}
                  </Text>
                </View>
              ))}
              {/* Total row */}
              <View style={[s.tHead, { marginTop: 0 }]}>
                <Text style={[s.th, { flex: 2, fontSize: 9 }]}>TOTAL</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right', fontSize: 9, color: C.green }]}>
                  {fmtCurrency(summary.totalRevenue, currency)}
                </Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right', fontSize: 9 }]}>
                  {fmtNum(summary.totalVehicles)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Vehicle Types Table */}
        {vehicleTypes.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Vehicle Types</Text>
            <View>
              <View style={s.tHead}>
                <Text style={[s.th, { flex: 2 }]}>Type</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Count</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>%</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Revenue</Text>
              </View>
              {vehicleTypes.map((vt, i) => (
                <View key={vt.type || i} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                  <Text style={[s.td, { flex: 2, textTransform: 'capitalize' }]}>{vt.type}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{vt.count}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{vt.percentage || 0}%</Text>
                  <Text style={[s.tdBold, { flex: 2, textAlign: 'right' }]}>{fmtCurrency(vt.revenue, currency)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Zone Utilization Table */}
        {zones.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Zone Utilization</Text>
            <View>
              <View style={s.tHead}>
                <Text style={[s.th, { flex: 2 }]}>Zone</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Vehicles</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Revenue</Text>
              </View>
              {zones.map((z, i) => (
                <View key={z.zoneId || i} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                  <Text style={[s.td, { flex: 2 }]}>{z.zoneName}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{z.totalVehicles}</Text>
                  <Text style={[s.tdBold, { flex: 2, textAlign: 'right' }]}>{fmtCurrency(z.revenue, currency)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <ReportFooter />
      </Page>
    </Document>
  );
}
