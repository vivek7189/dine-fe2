'use client';

import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// ── Helpers ──────────────────────────────────────────────────────

function fmtCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'Rs.0.00';
  return `Rs.${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return '0%';
  return `${Number(v).toFixed(1)}%`;
}

function fmtNum(v) {
  if (v == null || isNaN(v)) return '0';
  return Number(v).toLocaleString('en-IN');
}

// ── Color palette ────────────────────────────────────────────────

const C = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  primaryDark: '#15803d',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  amber: '#d97706',
  amberLight: '#fef3c7',
  red: '#dc2626',
  redLight: '#fee2e2',
  cyan: '#0891b2',
  cyanLight: '#cffafe',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#ffffff',
};

// ── Styles ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: C.gray900, position: 'relative' },
  // Header
  headerBar: { height: 4, backgroundColor: C.primary, marginBottom: 16, borderRadius: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, objectFit: 'contain', borderRadius: 4 },
  orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  reportTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 2 },
  dateRange: { fontSize: 9, color: C.gray500 },
  genDate: { fontSize: 8, color: C.gray500, marginTop: 2 },
  // Section
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.gray900, marginTop: 18, marginBottom: 10, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: C.primary },
  subTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray700, marginTop: 12, marginBottom: 6 },
  // Summary cards
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  statBox: { flex: 1, minWidth: 100, padding: 10, borderRadius: 6, borderWidth: 1 },
  statLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  statValue: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  statSub: { fontSize: 7, color: C.gray500, marginTop: 2 },
  // Tables
  table: { marginBottom: 12 },
  tHead: { flexDirection: 'row', backgroundColor: C.gray100, borderBottomWidth: 1, borderBottomColor: C.gray200, paddingVertical: 6, paddingHorizontal: 6 },
  tRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray100, paddingVertical: 5, paddingHorizontal: 6 },
  tRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray100, paddingVertical: 5, paddingHorizontal: 6, backgroundColor: C.gray50 },
  th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: 8, color: C.gray900 },
  tdBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  tdRight: { fontSize: 8, color: C.gray900, textAlign: 'right' },
  tdGreen: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
  tdRed: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.red },
  // Progress bar
  barBg: { height: 6, backgroundColor: C.gray100, borderRadius: 3, flex: 1 },
  barFill: { height: 6, borderRadius: 3 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Footer
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: C.gray500 },
  pageNum: { fontSize: 7, color: C.gray500 },
  // Rank badge
  rankBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.amberLight, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.amber },
  // Misc
  noData: { fontSize: 9, color: C.gray500, textAlign: 'center', paddingVertical: 20 },
  divider: { height: 1, backgroundColor: C.gray200, marginVertical: 12 },
});

// ── Stat Box with color ─────────────────────────────────────────

function StatBox({ label, value, color = C.primary, sub }) {
  const bgColor = color === C.primary ? C.primaryLight : color === C.blue ? C.blueLight : color === C.purple ? C.purpleLight : color === C.amber ? C.amberLight : color === C.red ? C.redLight : color === C.cyan ? C.cyanLight : C.gray50;
  const borderColor = color === C.primary ? '#bbf7d0' : color === C.blue ? '#bfdbfe' : color === C.purple ? '#ddd6fe' : color === C.amber ? '#fde68a' : color === C.red ? '#fecaca' : color === C.cyan ? '#a5f3fc' : C.gray200;
  return (
    <View style={[s.statBox, { backgroundColor: bgColor, borderColor }]}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

// ── Header ──────────────────────────────────────────────────────

function ReportHeader({ logoUrl, orgName, reportTitle, dateRange }) {
  return (
    <View fixed>
      <View style={s.headerBar} />
      <View style={s.headerRow}>
        <View>
          <Text style={s.reportTitle}>{reportTitle}</Text>
          {dateRange && <Text style={s.dateRange}>{dateRange}</Text>}
          <Text style={s.genDate}>Generated on {fmtDate(new Date().toISOString())}</Text>
        </View>
        <View style={[s.headerLeft, { flexDirection: 'column', alignItems: 'flex-end' }]}>
          {logoUrl && <Image src={logoUrl} style={s.logo} />}
          {orgName && <Text style={s.orgName}>{orgName}</Text>}
        </View>
      </View>
    </View>
  );
}

// ── Footer ──────────────────────────────────────────────────────

function ReportFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Generated by DineOpen</Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REPORT SECTIONS
// ═══════════════════════════════════════════════════════════════

// ── Sales Summary ───────────────────────────────────────────────

function SalesSummaryPDF({ data }) {
  const sm = data?.summary || {};
  const payments = data?.paymentBreakdown || [];
  const services = data?.serviceTypeBreakdown || [];
  const daily = data?.dailyTrend || [];
  const peaks = data?.peakHours || [];
  const outlets = data?.outletBreakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Revenue" value={fmtCurrency(sm.totalRevenue)} color={C.primary} />
        <StatBox label="Total Orders" value={fmtNum(sm.totalOrders)} color={C.blue} />
        <StatBox label="Avg Ticket Size" value={fmtCurrency(sm.avgTicketSize)} color={C.purple} />
        <StatBox label="Tips + Service" value={fmtCurrency((sm.totalTips || 0) + (sm.totalServiceCharge || 0))} color={C.amber} />
      </View>

      {payments.length > 0 && (
        <View>
          <Text style={s.subTitle}>Payment Method Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Method</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Count</Text>
              <Text style={[s.th, { width: '30%', textAlign: 'right' }]}>Amount</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Share</Text>
            </View>
            {payments.map((p, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '25%', textTransform: 'capitalize' }]}>{p.method}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{p.count}</Text>
                <Text style={[s.tdRight, { width: '30%' }]}>{fmtCurrency(p.amount)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtPct(p.percentage)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {services.length > 0 && (
        <View>
          <Text style={s.subTitle}>Service Type Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Type</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '30%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Share</Text>
            </View>
            {services.map((sv, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '25%', textTransform: 'capitalize' }]}>{(sv.type || '').replace(/_/g, ' ')}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{sv.count}</Text>
                <Text style={[s.tdRight, { width: '30%' }]}>{fmtCurrency(sv.amount)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtPct(sv.percentage)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {peaks.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Peak Hours</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Hour</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '50%', textAlign: 'right' }]}>Revenue</Text>
            </View>
            {peaks.slice(0, 10).map((h, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '25%' }]}>{h.hour}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{h.orderCount}</Text>
                <Text style={[s.tdRight, { width: '50%' }]}>{fmtCurrency(h.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {daily.length > 0 && (
        <View>
          <Text style={s.subTitle}>Daily Trend</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Date</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Value</Text>
            </View>
            {daily.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '30%' }]}>{d.date}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{d.orderCount}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(d.revenue)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{d.orderCount > 0 ? fmtCurrency(d.revenue / d.orderCount) : '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {outlets.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Outlet Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Ticket</Text>
            </View>
            {outlets.map((o, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{o.outletName}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(o.revenue)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{o.orderCount}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(o.avgTicketSize)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Menu Performance ────────────────────────────────────────────

function MenuPerformancePDF({ data }) {
  const sm = data?.summary || {};
  const items = data?.items || data?.breakdown || [];
  const topItems = [...items].sort((a, b) => (b.revenue || b.totalRevenue || 0) - (a.revenue || a.totalRevenue || 0));
  const maxRev = topItems[0]?.revenue || topItems[0]?.totalRevenue || 1;

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Unique Items" value={fmtNum(sm.totalUniqueItems || items.length)} color={C.primary} />
        <StatBox label="Total Qty Sold" value={fmtNum(sm.totalQtySold)} color={C.blue} />
        <StatBox label="Total Revenue" value={fmtCurrency(sm.totalRevenue)} color={C.purple} />
        <StatBox label="Avg Price" value={fmtCurrency(sm.avgPrice)} color={C.amber} />
      </View>

      {topItems.length > 0 && (
        <View>
          <Text style={s.subTitle}>Top Items by Revenue</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '5%' }]}>#</Text>
              <Text style={[s.th, { width: '30%' }]}>Item</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Qty</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%' }]}>Share</Text>
            </View>
            {topItems.slice(0, 30).map((item, i) => {
              const rev = item.revenue || item.totalRevenue || 0;
              const pct = maxRev > 0 ? (rev / maxRev) * 100 : 0;
              return (
                <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                  <Text style={[s.td, { width: '5%' }]}>{i + 1}</Text>
                  <Text style={[s.tdBold, { width: '30%' }]}>{item.itemName || item.name}</Text>
                  <Text style={[s.tdRight, { width: '15%' }]}>{item.qtySold || item.quantity || 0}</Text>
                  <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(rev)}</Text>
                  <View style={[{ width: '25%' }, s.barRow]}>
                    <View style={s.barBg}><View style={[s.barFill, { width: `${pct}%`, backgroundColor: C.primary }]} /></View>
                    <Text style={{ fontSize: 7, color: C.gray500 }}>{fmtPct(item.revenuePercentage || (sm.totalRevenue > 0 ? (rev / sm.totalRevenue) * 100 : 0))}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Staff Performance ───────────────────────────────────────────

function StaffPerformancePDF({ data }) {
  const sm = data?.summary || {};
  const staff = data?.staffRankings || data?.rankings || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Staff" value={fmtNum(sm.totalStaff || staff.length)} color={C.primary} />
        <StatBox label="Top Performer" value={sm.topPerformer || '-'} color={C.blue} />
        <StatBox label="Highest Sales" value={fmtCurrency(sm.highestSales)} color={C.purple} />
        <StatBox label="Total Tips" value={fmtCurrency(sm.totalTips)} color={C.amber} />
      </View>

      {staff.length > 0 && (
        <View>
          <Text style={s.subTitle}>Staff Rankings</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '5%' }]}>#</Text>
              <Text style={[s.th, { width: '25%' }]}>Name</Text>
              <Text style={[s.th, { width: '20%' }]}>Outlets</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Sales</Text>
              <Text style={[s.th, { width: '18%', textAlign: 'right' }]}>Tips</Text>
            </View>
            {staff.map((st, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '5%' }]}>{i + 1}</Text>
                <Text style={[s.tdBold, { width: '25%' }]}>{st.staffName || st.name}</Text>
                <Text style={[s.td, { width: '20%' }]}>{Array.isArray(st.outlets) ? st.outlets.join(', ') : (st.outlets || '-')}</Text>
                <Text style={[s.tdRight, { width: '12%' }]}>{st.ordersHandled || st.orders || 0}</Text>
                <Text style={[s.tdGreen, { width: '20%', textAlign: 'right' }]}>{fmtCurrency(st.totalSales || st.sales)}</Text>
                <Text style={[s.tdRight, { width: '18%' }]}>{fmtCurrency(st.tipsEarned || st.tips)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Category Sales ──────────────────────────────────────────────

function CategorySalesPDF({ data }) {
  const sm = data?.summary || {};
  const cats = data?.categories || data?.breakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Categories" value={fmtNum(sm.totalCategories || cats.length)} color={C.primary} />
        <StatBox label="Top Category" value={sm.topCategory || '-'} color={C.blue} />
        <StatBox label="Top Revenue" value={fmtCurrency(sm.topCategoryRevenue)} color={C.purple} />
      </View>

      {cats.length > 0 && (
        <View>
          <Text style={s.subTitle}>Category Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Category</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Qty</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Share</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Items</Text>
            </View>
            {cats.map((c, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{c.category}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{c.totalQuantity || 0}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(c.totalRevenue)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtPct(c.revenuePercentage)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{c.uniqueItems || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Discount Report ─────────────────────────────────────────────

function DiscountReportPDF({ data }) {
  const sm = data?.summary || {};
  const sources = data?.sourceBreakdown || data?.sources || [];
  const outlets = data?.outletBreakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Discount" value={fmtCurrency(sm.totalDiscountGiven)} color={C.red} />
        <StatBox label="Discounted Orders" value={fmtPct(sm.discountedOrderPercentage)} color={C.amber} />
        <StatBox label="Avg w/ Discount" value={fmtCurrency(sm.avgTicketWithDiscount)} color={C.blue} />
        <StatBox label="Avg w/o Discount" value={fmtCurrency(sm.avgTicketWithoutDiscount)} color={C.primary} />
      </View>

      {sources.length > 0 && (
        <View>
          <Text style={s.subTitle}>Discount Sources</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '20%' }]}>Source</Text>
              <Text style={[s.th, { width: '25%' }]}>Name</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Count</Text>
              <Text style={[s.th, { width: '40%', textAlign: 'right' }]}>Total Discount</Text>
            </View>
            {sources.map((src, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '20%', textTransform: 'capitalize' }]}>{src.source || src.type}</Text>
                <Text style={[s.tdBold, { width: '25%' }]}>{src.name || '-'}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{src.count}</Text>
                <Text style={[s.tdRed, { width: '40%', textAlign: 'right' }]}>{fmtCurrency(src.totalDiscount)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {outlets.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Per-Outlet Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Discount</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Discounted</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Total Orders</Text>
            </View>
            {outlets.map((o, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{o.outletName}</Text>
                <Text style={[s.tdRed, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(o.totalDiscount)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{o.discountedOrders}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{o.totalOrders}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Tax Summary ─────────────────────────────────────────────────

function TaxSummaryPDF({ data }) {
  const sm = data?.summary || {};
  const taxes = data?.taxBreakdown || [];
  const monthly = data?.monthlyTrend || [];
  const outlets = data?.outletBreakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Tax Collected" value={fmtCurrency(sm.totalTaxCollected)} color={C.primary} />
        <StatBox label="Taxable Amount" value={fmtCurrency(sm.totalTaxableAmount)} color={C.blue} />
        <StatBox label="Avg Tax/Order" value={fmtCurrency(sm.avgTaxPerOrder)} color={C.purple} />
      </View>

      {taxes.length > 0 && (
        <View>
          <Text style={s.subTitle}>Tax Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Tax</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Rate</Text>
              <Text style={[s.th, { width: '30%', textAlign: 'right' }]}>Amount</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Orders</Text>
            </View>
            {taxes.map((t, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{t.taxName || t.name}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtPct(t.rate)}</Text>
                <Text style={[s.tdGreen, { width: '30%', textAlign: 'right' }]}>{fmtCurrency(t.totalAmount || t.amount)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{t.orderCount || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {monthly.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Monthly Trend</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Month</Text>
              <Text style={[s.th, { width: '35%', textAlign: 'right' }]}>Tax Collected</Text>
              <Text style={[s.th, { width: '35%', textAlign: 'right' }]}>Orders</Text>
            </View>
            {monthly.map((m, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '30%' }]}>{m.month}</Text>
                <Text style={[s.tdGreen, { width: '35%', textAlign: 'right' }]}>{fmtCurrency(m.taxCollected)}</Text>
                <Text style={[s.tdRight, { width: '35%' }]}>{m.orderCount}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {outlets.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Per-Outlet Tax</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Tax</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Taxable Amt</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
            </View>
            {outlets.map((o, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{o.outletName}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(o.totalTax)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(o.taxableAmount)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{o.orderCount}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Customer Insights ───────────────────────────────────────────

function CustomerInsightsPDF({ data }) {
  const sm = data?.summary || {};
  const tops = data?.topCustomers || [];
  const outlets = data?.outletBreakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Customers" value={fmtNum(sm.totalCustomers)} color={C.primary} />
        <StatBox label="New Customers" value={fmtNum(sm.newCustomers)} color={C.blue} />
        <StatBox label="Returning" value={fmtNum(sm.returningCustomers)} color={C.purple} />
        <StatBox label="Avg Lifetime Value" value={fmtCurrency(sm.avgLifetimeValue)} color={C.amber} />
      </View>

      {tops.length > 0 && (
        <View>
          <Text style={s.subTitle}>Top Customers</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '5%' }]}>#</Text>
              <Text style={[s.th, { width: '25%' }]}>Name</Text>
              <Text style={[s.th, { width: '15%' }]}>Phone</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'right' }]}>Visits</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Spend</Text>
              <Text style={[s.th, { width: '23%', textAlign: 'right' }]}>Last Visit</Text>
            </View>
            {tops.slice(0, 20).map((c, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '5%' }]}>{c.rank || i + 1}</Text>
                <Text style={[s.tdBold, { width: '25%' }]}>{c.name || 'Guest'}</Text>
                <Text style={[s.td, { width: '15%', fontFamily: 'Courier' }]}>{c.phone || '-'}</Text>
                <Text style={[s.tdRight, { width: '12%' }]}>{c.visitCount || c.visits || 0}</Text>
                <Text style={[s.tdGreen, { width: '20%', textAlign: 'right' }]}>{fmtCurrency(c.totalSpend || c.spend)}</Text>
                <Text style={[s.tdRight, { width: '23%' }]}>{c.lastVisit ? fmtDate(c.lastVisit) : '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {outlets.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Customers Per Outlet</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '50%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '50%', textAlign: 'right' }]}>Customers</Text>
            </View>
            {outlets.map((o, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '50%' }]}>{o.outletName}</Text>
                <Text style={[s.tdRight, { width: '50%' }]}>{o.totalCustomers}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Outlet Ranking ──────────────────────────────────────────────

function OutletRankingPDF({ data }) {
  const rankings = data?.rankings || data?.outletRankings || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Outlet Rankings</Text>
      {rankings.length > 0 ? (
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, { width: '8%' }]}>Rank</Text>
            <Text style={[s.th, { width: '30%' }]}>Outlet</Text>
            <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
            <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Orders</Text>
            <Text style={[s.th, { width: '22%', textAlign: 'right' }]}>Avg Ticket</Text>
          </View>
          {rankings.map((o, i) => (
            <View key={i} style={[i % 2 ? s.tRowAlt : s.tRow, i < 3 ? { backgroundColor: C.primaryLight } : {}]}>
              <Text style={[i < 3 ? s.tdBold : s.td, { width: '8%' }]}>{o.rank || i + 1}</Text>
              <Text style={[s.tdBold, { width: '30%' }]}>{o.name || o.outletName}</Text>
              <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(o.revenue)}</Text>
              <Text style={[s.tdRight, { width: '15%' }]}>{o.orders || o.orderCount || 0}</Text>
              <Text style={[s.tdRight, { width: '22%' }]}>{fmtCurrency(o.avgTicket || o.avgTicketSize)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.noData}>No outlet data available.</Text>
      )}
    </View>
  );
}

// ── Consolidated P&L ────────────────────────────────────────────

function ConsolidatedPLPDF({ data }) {
  const sm = data?.summary || {};
  const outlets = data?.outletBreakdown || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Profit & Loss Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Revenue" value={fmtCurrency(sm.totalRevenue)} color={C.primary} />
        <StatBox label="Expenses" value={fmtCurrency(sm.totalExpenses)} color={C.red} />
        <StatBox label="Gross Profit" value={fmtCurrency(sm.grossProfit)} color={C.blue} />
        <StatBox label="Margin" value={fmtPct(sm.profitMargin)} color={sm.profitMargin >= 0 ? C.primary : C.red} />
      </View>
      <View style={s.statsRow}>
        <StatBox label="Orders" value={fmtNum(sm.totalOrders)} color={C.cyan} />
        <StatBox label="Avg Ticket" value={fmtCurrency(sm.avgTicket)} color={C.purple} />
        <StatBox label="Outlets" value={fmtNum(sm.outletCount || outlets.length)} color={C.amber} />
      </View>

      {outlets.length > 0 && (
        <View>
          <Text style={s.subTitle}>Per-Outlet P&L</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '22%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '18%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '18%', textAlign: 'right' }]}>Expenses</Text>
              <Text style={[s.th, { width: '18%', textAlign: 'right' }]}>Profit</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'right' }]}>Margin</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'right' }]}>Orders</Text>
            </View>
            {outlets.map((o, i) => {
              const margin = o.margin || (o.totalRevenue > 0 ? ((o.grossProfit / o.totalRevenue) * 100) : 0);
              return (
                <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                  <Text style={[s.tdBold, { width: '22%' }]}>{o.outletName}</Text>
                  <Text style={[s.tdGreen, { width: '18%', textAlign: 'right' }]}>{fmtCurrency(o.totalRevenue)}</Text>
                  <Text style={[s.tdRed, { width: '18%', textAlign: 'right' }]}>{fmtCurrency(o.totalExpenses)}</Text>
                  <Text style={[margin >= 0 ? s.tdGreen : s.tdRed, { width: '18%', textAlign: 'right' }]}>{fmtCurrency(o.grossProfit)}</Text>
                  <Text style={[s.tdRight, { width: '12%' }]}>{fmtPct(margin)}</Text>
                  <Text style={[s.tdRight, { width: '12%' }]}>{o.orderCount || 0}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Inventory Comparison ────────────────────────────────────────

function InventoryComparisonPDF({ data }) {
  const outlets = data?.outlets || [];
  const items = data?.items || data?.matrix || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Cross-Outlet Inventory</Text>
      {items.length > 0 ? (
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, { width: '30%' }]}>Item</Text>
            <Text style={[s.th, { width: '15%' }]}>Unit</Text>
            {outlets.map((o, i) => (
              <Text key={i} style={[s.th, { width: `${55 / Math.max(outlets.length, 1)}%`, textAlign: 'center' }]}>{o.name || o.outletName || `Outlet ${i + 1}`}</Text>
            ))}
          </View>
          {items.slice(0, 50).map((item, i) => (
            <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
              <Text style={[s.tdBold, { width: '30%' }]}>{item.name || item.itemName}</Text>
              <Text style={[s.td, { width: '15%' }]}>{item.unit || '-'}</Text>
              {(item.stocks || item.outlets || []).map((stk, j) => {
                const qty = stk.qty ?? stk.quantity ?? stk.stock ?? 0;
                const isLow = qty <= 0 || (stk.reorderLevel && qty <= stk.reorderLevel);
                return (
                  <Text key={j} style={[isLow ? s.tdRed : s.td, { width: `${55 / Math.max(outlets.length, 1)}%`, textAlign: 'center' }]}>{qty}</Text>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.noData}>No inventory data available.</Text>
      )}
    </View>
  );
}

// ── Kitchen Reports ─────────────────────────────────────────────

function KitchenReportsPDF({ data }) {
  const sm = data?.summary || {};
  const recipes = data?.recipeBreakdown || [];
  const waste = data?.wasteSummary || {};

  return (
    <View>
      <Text style={s.sectionTitle}>Kitchen Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Orders" value={fmtNum(sm.totalOrders)} color={C.primary} />
        <StatBox label="Completion Rate" value={fmtPct(sm.completionRate)} color={C.blue} />
        <StatBox label="Yield Rate" value={fmtPct(sm.yieldRate)} color={C.purple} />
        <StatBox label="Waste Cost" value={fmtCurrency(sm.wasteCost)} color={C.red} />
      </View>

      {recipes.length > 0 && (
        <View>
          <Text style={s.subTitle}>Recipe Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Recipe</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Done</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Target</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Produced</Text>
            </View>
            {recipes.map((r, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{r.name}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{r.orders}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{r.completed}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{r.targetQty}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{r.producedQty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(waste.byReason || []).length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Waste by Reason</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '40%' }]}>Reason</Text>
              <Text style={[s.th, { width: '30%', textAlign: 'right' }]}>Qty</Text>
              <Text style={[s.th, { width: '30%', textAlign: 'right' }]}>Cost</Text>
            </View>
            {waste.byReason.map((w, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '40%' }]}>{w.reason}</Text>
                <Text style={[s.tdRight, { width: '30%' }]}>{w.qty}</Text>
                <Text style={[s.tdRed, { width: '30%', textAlign: 'right' }]}>{fmtCurrency(w.cost)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Warehouse Metrics ───────────────────────────────────────────

function WarehouseMetricsPDF({ data }) {
  const sm = data?.summary || {};
  const topItems = data?.topRequestedItems || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Warehouse Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Indents" value={fmtNum(sm.totalIndents)} color={C.primary} />
        <StatBox label="Fill Rate" value={fmtPct(sm.fillRate)} color={C.blue} />
        <StatBox label="Avg Processing" value={`${sm.avgProcessingTime || 0}h`} color={C.purple} />
      </View>

      {topItems.length > 0 && (
        <View>
          <Text style={s.subTitle}>Top Requested Items</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '50%' }]}>Item</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Requests</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Total Qty</Text>
            </View>
            {topItems.map((item, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '50%' }]}>{item.item || item.name}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{item.timesRequested}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{item.totalQty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Indent Tracking ─────────────────────────────────────────────

function IndentTrackingPDF({ data }) {
  const statusSummary = data?.statusSummary || data?.summary || {};
  const indents = data?.indents || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Indent Status Summary</Text>
      <View style={s.statsRow}>
        {Object.entries(statusSummary).map(([status, count], i) => {
          const colors = [C.primary, C.blue, C.purple, C.amber, C.cyan, C.red];
          return <StatBox key={i} label={status} value={fmtNum(count)} color={colors[i % colors.length]} />;
        })}
      </View>

      {indents.length > 0 && (
        <View>
          <Text style={s.subTitle}>Indent Details</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '15%' }]}>Indent #</Text>
              <Text style={[s.th, { width: '20%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '20%' }]}>Warehouse</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'center' }]}>Priority</Text>
              <Text style={[s.th, { width: '10%', textAlign: 'right' }]}>Items</Text>
              <Text style={[s.th, { width: '12%', textAlign: 'center' }]}>Status</Text>
              <Text style={[s.th, { width: '11%' }]}>Date</Text>
            </View>
            {indents.slice(0, 30).map((ind, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '15%' }]}>{ind.indentNumber || '-'}</Text>
                <Text style={[s.td, { width: '20%' }]}>{ind.outletName || '-'}</Text>
                <Text style={[s.td, { width: '20%' }]}>{ind.warehouseName || '-'}</Text>
                <Text style={[s.td, { width: '12%', textAlign: 'center', textTransform: 'capitalize' }]}>{ind.priority || 'normal'}</Text>
                <Text style={[s.tdRight, { width: '10%' }]}>{ind.itemCount || 0}</Text>
                <Text style={[s.td, { width: '12%', textAlign: 'center', textTransform: 'capitalize' }]}>{ind.status || '-'}</Text>
                <Text style={[s.td, { width: '11%' }]}>{ind.date ? fmtDate(ind.date) : '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Payment Analytics ───────────────────────────────────────────

function PaymentAnalyticsPDF({ data }) {
  const sm = data?.summary || {};
  const methods = data?.methodBreakdown || [];
  const daily = data?.dailyTrend || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Payment Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Transactions" value={fmtNum(sm.totalTransactions)} color={C.primary} />
        <StatBox label="Total Revenue" value={fmtCurrency(sm.totalRevenue)} color={C.blue} />
        <StatBox label="Avg Transaction" value={fmtCurrency(sm.avgTransactionValue)} color={C.purple} />
        <StatBox label="Split Payments" value={fmtNum(sm.splitPaymentCount)} color={C.amber} />
      </View>

      {methods.length > 0 && (
        <View>
          <Text style={s.subTitle}>Method Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Method</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Count</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Amount</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Share</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Avg Value</Text>
            </View>
            {methods.map((m, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '25%', textTransform: 'capitalize' }]}>{m.method}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{m.count}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(m.amount)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtPct(m.percentage)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{fmtCurrency(m.avgValue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {daily.length > 0 && (
        <View>
          <Text style={s.subTitle}>Daily Payment Trend</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Date</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Cash</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Card</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>UPI</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Other</Text>
              <Text style={[s.th, { width: '15%', textAlign: 'right' }]}>Total</Text>
            </View>
            {daily.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '25%' }]}>{d.date}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtCurrency(d.cash)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtCurrency(d.card)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtCurrency(d.upi)}</Text>
                <Text style={[s.tdRight, { width: '15%' }]}>{fmtCurrency(d.other)}</Text>
                <Text style={[s.tdGreen, { width: '15%', textAlign: 'right' }]}>{fmtCurrency(d.total)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Order Analytics ─────────────────────────────────────────────

function OrderAnalyticsPDF({ data }) {
  const sm = data?.summary || {};
  const types = data?.typeBreakdown || [];
  const daily = data?.dailyVolume || [];
  const dow = data?.dayOfWeekAnalysis || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Order Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Orders" value={fmtNum(sm.totalOrders)} color={C.primary} />
        <StatBox label="Avg Items/Order" value={(sm.avgItemsPerOrder || 0).toFixed(1)} color={C.blue} />
        <StatBox label="Cancellation Rate" value={fmtPct(sm.cancellationRate)} color={C.red} />
        <StatBox label="Avg Order Value" value={fmtCurrency(sm.avgOrderValue)} color={C.purple} />
      </View>

      {types.length > 0 && (
        <View>
          <Text style={s.subTitle}>Order Type Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Type</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Share</Text>
            </View>
            {types.map((t, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%', textTransform: 'capitalize' }]}>{(t.type || '').replace(/_/g, ' ')}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{t.count}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(t.amount)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtPct(t.percentage)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {dow.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Day of Week Analysis</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Day</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Value</Text>
            </View>
            {dow.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{d.day}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{d.orderCount}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(d.revenue)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(d.avgValue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {daily.length > 0 && (
        <View>
          <Text style={s.subTitle}>Daily Volume</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Date</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Value</Text>
            </View>
            {daily.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '30%' }]}>{d.date}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{d.orderCount}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(d.revenue)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(d.avgValue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Revenue Trends ──────────────────────────────────────────────

function RevenueTrendsPDF({ data }) {
  const sm = data?.summary || {};
  const daily = data?.dailyTrend || [];
  const dow = data?.dayOfWeekAvg || [];
  const outlets = data?.outletTrend || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Revenue Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Total Revenue" value={fmtCurrency(sm.totalRevenue)} color={C.primary} />
        <StatBox label="Previous Period" value={fmtCurrency(sm.previousPeriodRevenue)} color={C.blue} />
        <StatBox label="Growth" value={`${sm.growthRate >= 0 ? '▲' : '▼'} ${fmtPct(Math.abs(sm.growthRate || 0))}`} color={sm.growthRate >= 0 ? C.primary : C.red} />
        <StatBox label="Avg Daily" value={fmtCurrency(sm.avgDailyRevenue)} color={C.purple} />
      </View>

      {sm.bestDay && (
        <View style={[s.statsRow, { marginTop: 4 }]}>
          <StatBox label="Best Day" value={fmtCurrency(sm.bestDay.revenue)} color={C.primary} sub={sm.bestDay.date} />
          <StatBox label="Slowest Day" value={fmtCurrency(sm.worstDay?.revenue)} color={C.amber} sub={sm.worstDay?.date} />
        </View>
      )}

      {dow.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Day of Week Average</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '25%' }]}>Day</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Revenue</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Total</Text>
            </View>
            {dow.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '25%' }]}>{d.day}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(d.avgRevenue)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{(d.avgOrders || 0).toFixed(1)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(d.totalRevenue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {outlets.length > 0 && (
        <View wrap={false}>
          <Text style={s.subTitle}>Outlet Revenue Comparison</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Outlet</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Current</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Previous</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Growth</Text>
            </View>
            {outlets.map((o, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.tdBold, { width: '30%' }]}>{o.outletName}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(o.revenue)}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(o.previousRevenue)}</Text>
                <Text style={[o.growth >= 0 ? s.tdGreen : s.tdRed, { width: '20%', textAlign: 'right' }]}>{o.growth >= 0 ? '▲' : '▼'} {fmtPct(Math.abs(o.growth || 0))}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {daily.length > 0 && (
        <View>
          <Text style={s.subTitle}>Daily Revenue</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Date</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Avg Value</Text>
            </View>
            {daily.map((d, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '30%' }]}>{d.date}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(d.revenue)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{d.orderCount}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{fmtCurrency(d.avgValue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Wallet & Loyalty ────────────────────────────────────────────

function WalletLoyaltyPDF({ data }) {
  const sm = data?.summary || {};
  const topUsers = data?.topWalletUsers || [];
  const trend = data?.loyaltyTrend || [];

  return (
    <View>
      <Text style={s.sectionTitle}>Wallet & Loyalty Summary</Text>
      <View style={s.statsRow}>
        <StatBox label="Wallet Redeemed" value={fmtCurrency(sm.totalWalletRedeemed)} color={C.primary} />
        <StatBox label="Points Issued" value={fmtNum(sm.totalLoyaltyPointsIssued)} color={C.blue} />
        <StatBox label="Points Redeemed" value={fmtNum(sm.totalLoyaltyPointsRedeemed)} color={C.purple} />
        <StatBox label="Loyalty Usage" value={fmtPct(sm.loyaltyOrderPercentage)} color={C.amber} />
      </View>
      <View style={s.statsRow}>
        <StatBox label="Wallet Orders" value={fmtNum(sm.walletOrderCount)} color={C.cyan} />
        <StatBox label="Loyalty Orders" value={fmtNum(sm.loyaltyOrderCount)} color={C.primary} />
      </View>

      {topUsers.length > 0 && (
        <View>
          <Text style={s.subTitle}>Top Wallet Users</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '5%' }]}>#</Text>
              <Text style={[s.th, { width: '30%' }]}>Name</Text>
              <Text style={[s.th, { width: '20%' }]}>Phone</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Redeemed</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Orders</Text>
            </View>
            {topUsers.slice(0, 20).map((u, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '5%' }]}>{i + 1}</Text>
                <Text style={[s.tdBold, { width: '30%' }]}>{u.name || 'Guest'}</Text>
                <Text style={[s.td, { width: '20%', fontFamily: 'Courier' }]}>{u.phone || '-'}</Text>
                <Text style={[s.tdGreen, { width: '25%', textAlign: 'right' }]}>{fmtCurrency(u.totalRedeemed)}</Text>
                <Text style={[s.tdRight, { width: '20%' }]}>{u.orderCount}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {trend.length > 0 && (
        <View>
          <Text style={s.subTitle}>Loyalty Daily Trend</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: '30%' }]}>Date</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Issued</Text>
              <Text style={[s.th, { width: '25%', textAlign: 'right' }]}>Redeemed</Text>
              <Text style={[s.th, { width: '20%', textAlign: 'right' }]}>Value</Text>
            </View>
            {trend.map((t, i) => (
              <View key={i} style={i % 2 ? s.tRowAlt : s.tRow}>
                <Text style={[s.td, { width: '30%' }]}>{t.date}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{t.pointsIssued}</Text>
                <Text style={[s.tdRight, { width: '25%' }]}>{t.pointsRedeemed}</Text>
                <Text style={[s.tdGreen, { width: '20%', textAlign: 'right' }]}>{fmtCurrency(t.redemptionValue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN DOCUMENT
// ═══════════════════════════════════════════════════════════════

const REPORT_TITLES = {
  sales: 'Sales Summary Report',
  inventory: 'Inventory Comparison Report',
  pl: 'Consolidated P&L Report',
  kitchen: 'Kitchen Reports',
  warehouse: 'Warehouse Metrics Report',
  indent: 'Indent Tracking Report',
  menu: 'Menu Performance Report',
  ranking: 'Outlet Ranking Report',
  staff: 'Staff Performance Report',
  category: 'Category Sales Report',
  discount: 'Discounts & Offers Report',
  tax: 'Tax Summary Report',
  customer: 'Customer Insights Report',
  payment: 'Payment Analytics Report',
  'order-analytics': 'Order Analytics Report',
  'revenue-trends': 'Revenue Trends Report',
  'wallet-loyalty': 'Wallet & Loyalty Report',
};

export function HQReportPDFDocument({ reportType, data, orgName, logoUrl, dateRange }) {
  const title = REPORT_TITLES[reportType] || 'Report';

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <ReportHeader logoUrl={logoUrl} orgName={orgName} reportTitle={title} dateRange={dateRange} />

        {reportType === 'sales' && <SalesSummaryPDF data={data} />}
        {reportType === 'menu' && <MenuPerformancePDF data={data} />}
        {reportType === 'staff' && <StaffPerformancePDF data={data} />}
        {reportType === 'category' && <CategorySalesPDF data={data} />}
        {reportType === 'discount' && <DiscountReportPDF data={data} />}
        {reportType === 'tax' && <TaxSummaryPDF data={data} />}
        {reportType === 'customer' && <CustomerInsightsPDF data={data} />}
        {reportType === 'ranking' && <OutletRankingPDF data={data} />}
        {reportType === 'pl' && <ConsolidatedPLPDF data={data} />}
        {reportType === 'inventory' && <InventoryComparisonPDF data={data} />}
        {reportType === 'kitchen' && <KitchenReportsPDF data={data} />}
        {reportType === 'warehouse' && <WarehouseMetricsPDF data={data} />}
        {reportType === 'indent' && <IndentTrackingPDF data={data} />}
        {reportType === 'payment' && <PaymentAnalyticsPDF data={data} />}
        {reportType === 'order-analytics' && <OrderAnalyticsPDF data={data} />}
        {reportType === 'revenue-trends' && <RevenueTrendsPDF data={data} />}
        {reportType === 'wallet-loyalty' && <WalletLoyaltyPDF data={data} />}

        <ReportFooter />
      </Page>
    </Document>
  );
}
