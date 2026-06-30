'use client';

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

let _cs = 'Rs.';
function setCS(symbol) { _cs = symbol || 'Rs.'; }
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return `${_cs}0.00`;
  return `${_cs}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  subtitle: { fontSize: 9, color: '#6b7280', marginTop: 3 },
  orgName: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  logo: { width: 48, height: 48, objectFit: 'contain', borderRadius: 4, marginBottom: 4 },
  headerBar: { height: 4, backgroundColor: '#16a34a', marginBottom: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  statBox: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 10 },
  statLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 },
  statValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111827' },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 8 },
  headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase' },
  cellText: { fontSize: 9, color: '#111827' },
  summaryBox: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 12, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  summaryLabel: { fontSize: 10, color: '#6b7280' },
  summaryValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#d1d5db', marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827' },
  grandTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#6b7280' },
  textRed: { color: '#dc2626' },
  textGreen: { color: '#16a34a' },
  recipeCard: { marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 12 },
  recipeName: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  instructionItem: { fontSize: 9, color: '#111827', marginBottom: 3, lineHeight: 1.5 },
  noData: { fontSize: 10, color: '#6b7280', textAlign: 'center', paddingVertical: 20 },
});

// Column widths for stock report
const stockCols = {
  num: { width: '4%' },
  name: { width: '16%' },
  category: { width: '10%' },
  stock: { width: '10%', textAlign: 'right' },
  unit: { width: '7%', textAlign: 'center' },
  min: { width: '7%', textAlign: 'right' },
  max: { width: '7%', textAlign: 'right' },
  cost: { width: '13%', textAlign: 'right' },
  value: { width: '14%', textAlign: 'right' },
  status: { width: '12%', textAlign: 'center' },
};

// Column widths for waste report
const wasteCols = {
  date: { width: '11%' },
  item: { width: '14%' },
  qty: { width: '8%', textAlign: 'right' },
  unit: { width: '7%', textAlign: 'center' },
  reason: { width: '13%' },
  source: { width: '11%' },
  value: { width: '14%', textAlign: 'right' },
  notes: { width: '22%' },
};

// Column widths for audit report
const auditCols = {
  item: { width: '18%' },
  unit: { width: '10%', textAlign: 'center' },
  system: { width: '14%', textAlign: 'right' },
  physical: { width: '14%', textAlign: 'right' },
  variance: { width: '14%', textAlign: 'right' },
  varianceValue: { width: '16%', textAlign: 'right' },
};

// Column widths for recipe ingredients
const recipeCols = {
  name: { width: '40%' },
  qty: { width: '20%', textAlign: 'right' },
  unit: { width: '20%', textAlign: 'center' },
  cost: { width: '20%', textAlign: 'right' },
};

function ReportHeader({ org, reportTitle, logoUrl }) {
  return (
    <View fixed>
      <View style={styles.headerBar} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{reportTitle}</Text>
          <Text style={styles.subtitle}>Generated on {formatDate(new Date().toISOString())}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.orgName}>{org.name || ''}</Text>
          {org.address && <Text style={styles.subtitle}>{org.address}</Text>}
          {org.phone && <Text style={styles.subtitle}>{org.phone}</Text>}
          {org.email && <Text style={styles.subtitle}>{org.email}</Text>}
        </View>
      </View>
    </View>
  );
}

function StockReport({ data }) {
  const items = data?.items || [];
  const stats = data?.stats || {};

  return (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Items</Text>
          <Text style={styles.statValue}>{stats.totalItems ?? items.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Low Stock</Text>
          <Text style={[styles.statValue, styles.textRed]}>{stats.lowStock ?? 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Value</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalValue ?? 0)}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.noData}>No stock items found.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, stockCols.num]}>#</Text>
            <Text style={[styles.headerText, stockCols.name]}>Item Name</Text>
            <Text style={[styles.headerText, stockCols.category]}>Category</Text>
            <Text style={[styles.headerText, stockCols.stock]}>Stock</Text>
            <Text style={[styles.headerText, stockCols.unit]}>Unit</Text>
            <Text style={[styles.headerText, stockCols.min]}>Min</Text>
            <Text style={[styles.headerText, stockCols.max]}>Max</Text>
            <Text style={[styles.headerText, stockCols.cost]}>Cost/Unit</Text>
            <Text style={[styles.headerText, stockCols.value]}>Value</Text>
            <Text style={[styles.headerText, stockCols.status]}>Status</Text>
          </View>
          {items.map((item, idx) => {
            const isLow = item.status === 'Low' || item.status === 'low' || (item.currentStock != null && item.minStock != null && item.currentStock <= item.minStock);
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.cellText, stockCols.num]}>{idx + 1}</Text>
                <Text style={[styles.cellText, stockCols.name]}>{item.name || '-'}</Text>
                <Text style={[styles.cellText, stockCols.category]}>{item.category || '-'}</Text>
                <Text style={[styles.cellText, stockCols.stock]}>{item.currentStock ?? 0}</Text>
                <Text style={[styles.cellText, stockCols.unit]}>{item.unit || '-'}</Text>
                <Text style={[styles.cellText, stockCols.min]}>{item.minStock ?? '-'}</Text>
                <Text style={[styles.cellText, stockCols.max]}>{item.maxStock ?? '-'}</Text>
                <Text style={[styles.cellText, stockCols.cost]}>{formatCurrency(item.costPerUnit)}</Text>
                <Text style={[styles.cellText, stockCols.value]}>{formatCurrency(item.value ?? (item.currentStock || 0) * (item.costPerUnit || 0))}</Text>
                <Text style={[styles.cellText, stockCols.status, isLow ? styles.textRed : styles.textGreen]}>
                  {isLow ? 'Low' : 'Good'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {items.length > 0 && (
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 220 }}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Stock Value</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(stats.totalValue ?? items.reduce((sum, i) => sum + ((i.value ?? (i.currentStock || 0) * (i.costPerUnit || 0)) || 0), 0))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function RecipesReport({ data }) {
  const recipes = Array.isArray(data?.recipes) ? data.recipes : [];

  if (recipes.length === 0) {
    return <Text style={styles.noData}>No recipes found.</Text>;
  }

  return (
    <View>
      {recipes.map((recipe, rIdx) => {
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        const instructions = Array.isArray(recipe.instructions)
          ? recipe.instructions.filter(s => typeof s === 'string' && s.trim())
          : (typeof recipe.instructions === 'string' && recipe.instructions.trim()
            ? recipe.instructions.split('\n').filter(s => s.trim())
            : []);
        const totalCost = ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);

        return (
          <View key={rIdx} style={styles.recipeCard} wrap={false}>
            <Text style={styles.recipeName}>{recipe.name || `Recipe ${rIdx + 1}`}</Text>

            {ingredients.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, recipeCols.name]}>Ingredient</Text>
                  <Text style={[styles.headerText, recipeCols.qty]}>Qty</Text>
                  <Text style={[styles.headerText, recipeCols.unit]}>Unit</Text>
                  <Text style={[styles.headerText, recipeCols.cost]}>Cost</Text>
                </View>
                {ingredients.map((ing, iIdx) => (
                  <View key={iIdx} style={styles.tableRow}>
                    <Text style={[styles.cellText, recipeCols.name]}>{String(ing.name || ing.inventoryItemName || '-')}</Text>
                    <Text style={[styles.cellText, recipeCols.qty]}>{ing.quantity != null ? String(ing.quantity) : '-'}</Text>
                    <Text style={[styles.cellText, recipeCols.unit]}>{String(ing.unit || '-')}</Text>
                    <Text style={[styles.cellText, recipeCols.cost]}>{formatCurrency(ing.cost)}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost / Serving</Text>
              <Text style={styles.summaryValue}>{formatCurrency(recipe.costPerServing ?? totalCost)}</Text>
            </View>

            {instructions.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.statLabel, { marginBottom: 4 }]}>Instructions</Text>
                {instructions.map((step, sIdx) => (
                  <Text key={sIdx} style={styles.instructionItem}>
                    {sIdx + 1}. {String(step)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function WasteReport({ data }) {
  const entries = data?.entries || [];
  const summary = data?.summary || {};

  return (
    <View>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Entries</Text>
          <Text style={styles.summaryValue}>{summary.totalEntries ?? entries.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Waste Value</Text>
          <Text style={[styles.summaryValue, styles.textRed]}>{formatCurrency(summary.totalWasteValue ?? 0)}</Text>
        </View>
        {summary.byReason && Object.entries(summary.byReason).map(([reason, value], idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{reason}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(value)}</Text>
          </View>
        ))}
      </View>

      {entries.length === 0 ? (
        <Text style={styles.noData}>No waste entries found.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, wasteCols.date]}>Date</Text>
            <Text style={[styles.headerText, wasteCols.item]}>Item</Text>
            <Text style={[styles.headerText, wasteCols.qty]}>Qty</Text>
            <Text style={[styles.headerText, wasteCols.unit]}>Unit</Text>
            <Text style={[styles.headerText, wasteCols.reason]}>Reason</Text>
            <Text style={[styles.headerText, wasteCols.source]}>Source</Text>
            <Text style={[styles.headerText, wasteCols.value]}>Value</Text>
            <Text style={[styles.headerText, wasteCols.notes]}>Notes</Text>
          </View>
          {entries.map((entry, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cellText, wasteCols.date]}>{formatDate(entry.date)}</Text>
              <Text style={[styles.cellText, wasteCols.item]}>{entry.item || '-'}</Text>
              <Text style={[styles.cellText, wasteCols.qty]}>{entry.quantity ?? '-'}</Text>
              <Text style={[styles.cellText, wasteCols.unit]}>{entry.unit || '-'}</Text>
              <Text style={[styles.cellText, wasteCols.reason]}>{entry.reason || '-'}</Text>
              <Text style={[styles.cellText, wasteCols.source]}>{entry.source || '-'}</Text>
              <Text style={[styles.cellText, wasteCols.value]}>{formatCurrency(entry.value)}</Text>
              <Text style={[styles.cellText, wasteCols.notes]}>{entry.notes || '-'}</Text>
            </View>
          ))}
        </View>
      )}

      {entries.length > 0 && (
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 220 }}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Waste Value</Text>
              <Text style={[styles.grandTotalValue, styles.textRed]}>
                {formatCurrency(summary.totalWasteValue ?? entries.reduce((sum, e) => sum + (e.value || 0), 0))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function AuditReport({ data }) {
  const audit = data?.audit || {};
  const items = audit.items || [];

  return (
    <View>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Audit Date</Text>
          <Text style={styles.summaryValue}>{formatDate(audit.date)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Audited By</Text>
          <Text style={styles.summaryValue}>{audit.auditedBy || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Audited</Text>
          <Text style={styles.summaryValue}>{audit.itemsAudited ?? items.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items with Variance</Text>
          <Text style={[styles.summaryValue, (audit.itemsWithVariance ?? 0) > 0 ? styles.textRed : {}]}>
            {audit.itemsWithVariance ?? items.filter((i) => (i.variance ?? 0) !== 0).length}
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.noData}>No audit items found.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, auditCols.item]}>Item</Text>
            <Text style={[styles.headerText, auditCols.unit]}>Unit</Text>
            <Text style={[styles.headerText, auditCols.system]}>System Stock</Text>
            <Text style={[styles.headerText, auditCols.physical]}>Physical Count</Text>
            <Text style={[styles.headerText, auditCols.variance]}>Variance</Text>
            <Text style={[styles.headerText, auditCols.varianceValue]}>Variance Value</Text>
          </View>
          {items.map((item, idx) => {
            const variance = item.variance ?? ((item.physicalCount ?? 0) - (item.systemStock ?? 0));
            const isNegative = variance < 0;
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.cellText, auditCols.item]}>{item.name || '-'}</Text>
                <Text style={[styles.cellText, auditCols.unit]}>{item.unit || '-'}</Text>
                <Text style={[styles.cellText, auditCols.system]}>{item.systemStock ?? '-'}</Text>
                <Text style={[styles.cellText, auditCols.physical]}>{item.physicalCount ?? '-'}</Text>
                <Text style={[styles.cellText, auditCols.variance, isNegative ? styles.textRed : {}]}>{variance}</Text>
                <Text style={[styles.cellText, auditCols.varianceValue, isNegative ? styles.textRed : {}]}>
                  {formatCurrency(item.varianceValue ?? 0)}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {items.length > 0 && (
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 220 }}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Shrinkage</Text>
              <Text style={[styles.grandTotalValue, styles.textRed]}>
                {formatCurrency(audit.totalShrinkageValue ?? items.reduce((sum, i) => {
                  const v = i.variance ?? ((i.physicalCount ?? 0) - (i.systemStock ?? 0));
                  return v < 0 ? sum + Math.abs(i.varianceValue ?? 0) : sum;
                }, 0))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const reportTitles = {
  stock: 'Stock Report',
  recipes: 'Recipes Report',
  waste: 'Waste Report',
  audit: 'Stock Audit Report',
};

export function InventoryPDFDocument({ reportType, data, org, logoUrl, currencySymbol }) {
  setCS(currencySymbol);
  const safeOrg = org || {};
  const safeData = data || {};
  const title = reportTitles[reportType] || 'Inventory Report';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader org={safeOrg} reportTitle={title} logoUrl={logoUrl} />

        {reportType === 'stock' && <StockReport data={safeData} />}
        {reportType === 'recipes' && <RecipesReport data={safeData} />}
        {reportType === 'waste' && <WasteReport data={safeData} />}
        {reportType === 'audit' && <AuditReport data={safeData} />}

        <Text style={styles.footer}>Generated by DineOpen Inventory</Text>
      </Page>
    </Document>
  );
}
