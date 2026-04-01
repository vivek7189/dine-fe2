'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs.0.00';
  return `Rs.${Number(amount).toLocaleString('en-IN', {
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

function createStyles(colors = {}) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';

  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    title: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: font },
    subtitle: { fontSize: 10, color: label, marginTop: 4 },
    statusBadge: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginTop: 4 },
    infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    infoBlock: { width: '48%' },
    label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 3 },
    value: { fontSize: 10, color: font, marginBottom: 8 },
    table: { marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 8 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 8 },
    colNum: { width: '6%', textAlign: 'left' },
    colItem: { width: '34%', textAlign: 'left' },
    colQty: { width: '12%', textAlign: 'right' },
    colRate: { width: '16%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'right' },
    colAmount: { width: '20%', textAlign: 'right' },
    headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase' },
    cellText: { fontSize: 9, color: font },
    totalsSection: { alignItems: 'flex-end', marginBottom: 20 },
    totalsBox: { width: 220 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    totalLabel: { fontSize: 10, color: label },
    totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#d1d5db', marginTop: 4 },
    grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font },
    notesSection: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 4 },
    notesText: { fontSize: 9, color: font, lineHeight: 1.5 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: label },
  });
}

export function InvoicePDF({ data, type = 'invoice', org = {}, colors = {} }) {
  const styles = createStyles(colors);
  const items = data.items || [];
  const typeLabel = type === 'quote' ? 'Quote' : type === 'challan' ? 'Delivery Challan' : 'Invoice';
  const numberField = type === 'quote' ? data.quoteNumber : type === 'challan' ? data.challanNumber : data.invoiceNumber;
  const dateField = type === 'quote' ? data.quoteDate : type === 'challan' ? data.challanDate : data.invoiceDate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{typeLabel}</Text>
            <Text style={styles.subtitle}>{numberField || ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{org.name || ''}</Text>
            {org.email && <Text style={styles.subtitle}>{org.email}</Text>}
            {org.phone && <Text style={styles.subtitle}>{org.phone}</Text>}
            {org.gstin && <Text style={[styles.subtitle, { marginTop: 6 }]}>GSTIN: {org.gstin}</Text>}
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.value}>{data.customer?.name || data.customerName || '-'}</Text>
            {data.customer?.email && <Text style={[styles.subtitle, { marginBottom: 4 }]}>{data.customer.email}</Text>}
            {data.customer?.phone && <Text style={styles.subtitle}>{data.customer.phone}</Text>}
          </View>
          <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(dateField)}</Text>
            {type === 'invoice' && (
              <>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>{formatDate(data.dueDate)}</Text>
              </>
            )}
            {type === 'quote' && data.expiryDate && (
              <>
                <Text style={styles.label}>Expiry Date</Text>
                <Text style={styles.value}>{formatDate(data.expiryDate)}</Text>
              </>
            )}
            <Text style={styles.label}>Status</Text>
            <Text style={styles.statusBadge}>{(data.status || 'draft').toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNum]}>#</Text>
            <Text style={[styles.headerText, styles.colItem]}>Item</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
            {type !== 'challan' && <Text style={[styles.headerText, styles.colTax]}>Tax</Text>}
            <Text style={[styles.headerText, type === 'challan' ? { width: '32%', textAlign: 'right' } : styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colNum]}>{idx + 1}</Text>
              <Text style={[styles.cellText, styles.colItem]}>{item.name || '-'}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{item.quantity || 0}</Text>
              <Text style={[styles.cellText, styles.colRate]}>{formatCurrency(item.rate)}</Text>
              {type !== 'challan' && <Text style={[styles.cellText, styles.colTax]}>{item.taxRate ? `${item.taxRate}%` : '-'}</Text>}
              <Text style={[styles.cellText, type === 'challan' ? { width: '32%', textAlign: 'right' } : styles.colAmount]}>{formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sub Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
            </View>
            {data.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount{data.discountType === 'percentage' && data.discountValue ? ` (${data.discountValue}%)` : ''}</Text>
                <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{formatCurrency(data.discountAmount)}</Text>
              </View>
            )}
            {data.taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.taxAmount)}</Text>
              </View>
            )}
            {data.adjustments !== 0 && data.adjustments !== undefined && data.adjustments !== null && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Adjustment</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.adjustments)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
            </View>
            {type === 'invoice' && data.balanceDue !== undefined && data.balanceDue !== data.total && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
                <Text style={[styles.totalValue, { color: '#2563eb' }]}>{formatCurrency(data.balanceDue)}</Text>
              </View>
            )}
          </View>
        </View>
        {(data.customerNotes || data.termsAndConditions) && (
          <View style={styles.notesSection}>
            {data.customerNotes && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.notesTitle}>Customer Notes</Text>
                <Text style={styles.notesText}>{data.customerNotes}</Text>
              </View>
            )}
            {data.termsAndConditions && (
              <View>
                <Text style={styles.notesTitle}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{data.termsAndConditions}</Text>
              </View>
            )}
          </View>
        )}
        <Text style={styles.footer}>Generated by DineOpen Invoice</Text>
      </Page>
    </Document>
  );
}
