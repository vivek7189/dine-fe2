'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function ModernTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const labelBg15 = label + '26'; // 15% opacity
  const labelBg5 = label + '0D'; // 5% opacity

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    orgName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: font, marginBottom: 8 },
    orgDetail: { fontSize: 9, color: label, marginBottom: 2 },
    pill: {
      backgroundColor: labelBg15,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 12,
    },
    pillText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: label },
    dateText: { fontSize: 9, color: label, marginTop: 6, marginBottom: 24 },
    billToSection: { marginBottom: 24 },
    billToLabel: { fontSize: 8, color: label, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 },
    customerName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font, marginBottom: 2 },
    customerDetail: { fontSize: 9, color: label, marginBottom: 1 },
    table: { marginBottom: 24 },
    tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8, marginBottom: 2 },
    headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8 },
    tableRowAlt: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8, backgroundColor: labelBg5 },
    colItem: { width: '50%', textAlign: 'left' },
    colQty: { width: '15%', textAlign: 'right' },
    colRate: { width: '15%', textAlign: 'right' },
    colAmount: { width: '20%', textAlign: 'right' },
    cellText: { fontSize: 9, color: font },
    totalsSection: { alignItems: 'flex-end', marginBottom: 20 },
    totalsBox: { width: 220 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    totalLabel: { fontSize: 10, color: label },
    totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: labelBg15,
      borderRadius: 6,
      marginTop: 6,
    },
    grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font },
    notesSection: { marginTop: 24 },
    notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    notesText: { fontSize: 9, color: font, lineHeight: 1.5 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: label },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.orgName}>{org.name || ''}</Text>
          {org.email && <Text style={styles.orgDetail}>{org.email}</Text>}
          {org.phone && <Text style={styles.orgDetail}>{org.phone}</Text>}
          {org.gstin && <Text style={[styles.orgDetail, { marginTop: 4 }]}>GSTIN: {org.gstin}</Text>}
          {org.address && <Text style={[styles.orgDetail, { marginTop: 2, maxWidth: 200 }]}>{org.address}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{numberField || typeLabel}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(dateField)}</Text>
          {type === 'invoice' && data.dueDate && (
            <Text style={[styles.dateText, { marginTop: 0 }]}>Due: {formatDate(data.dueDate)}</Text>
          )}
          {type === 'quote' && data.expiryDate && (
            <Text style={[styles.dateText, { marginTop: 0 }]}>Expires: {formatDate(data.expiryDate)}</Text>
          )}
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.billToSection}>
        <Text style={styles.billToLabel}>Bill To</Text>
        <Text style={styles.customerName}>{data.customer?.name || data.customerName || '-'}</Text>
        {data.customer?.email && <Text style={styles.customerDetail}>{data.customer.email}</Text>}
        {data.customer?.phone && <Text style={styles.customerDetail}>{data.customer.phone}</Text>}
        {data.customer?.address && <Text style={styles.customerDetail}>{data.customer.address}</Text>}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colItem]}>Item</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
          <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
            <Text style={[styles.cellText, styles.colItem]}>{item.name || '-'}</Text>
            <Text style={[styles.cellText, styles.colQty]}>{item.quantity || 0}</Text>
            <Text style={[styles.cellText, styles.colRate]}>{formatCurrency(item.rate, data.currencySymbol)}</Text>
            <Text style={[styles.cellText, styles.colAmount]}>
              {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0), data.currencySymbol)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal, data.currencySymbol)}</Text>
          </View>
          {data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount{data.discountType === 'percentage' && data.discountValue ? ` (${data.discountValue}%)` : ''}
              </Text>
              <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{formatCurrency(data.discountAmount, data.currencySymbol)}</Text>
            </View>
          )}
          {data.taxAmount > 0 && type !== 'challan' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.taxAmount, data.currencySymbol)}</Text>
            </View>
          )}
          {data.adjustments !== 0 && data.adjustments !== undefined && data.adjustments !== null && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Adjustment</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.adjustments, data.currencySymbol)}</Text>
            </View>
          )}
          <View style={styles.grandTotalBox}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total, data.currencySymbol)}</Text>
          </View>
          {type === 'invoice' && data.balanceDue !== undefined && data.balanceDue !== data.total && (
            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
              <Text style={[styles.totalValue, { color: '#2563eb' }]}>{formatCurrency(data.balanceDue, data.currencySymbol)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Notes */}
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
  );
}
