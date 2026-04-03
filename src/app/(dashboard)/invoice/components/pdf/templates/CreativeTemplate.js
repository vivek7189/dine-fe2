'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function CreativeTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const labelBg15 = label + '26'; // 15% opacity

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    decorativeCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: labelBg15,
    },
    topSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orgBlock: { maxWidth: '50%' },
    orgName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font, marginBottom: 2 },
    orgDetail: { fontSize: 8, color: label, marginBottom: 1 },
    titleBlock: { alignItems: 'flex-end' },
    invoiceTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: font },
    invoiceNumber: { fontSize: 10, color: label, marginTop: 4 },
    invoiceDate: { fontSize: 9, color: label, marginTop: 2 },
    accentLine: { height: 3, backgroundColor: label, marginVertical: 16 },
    fromToSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    fromToBlock: { width: '48%' },
    fromToLabel: {
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      color: label,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 2,
      paddingBottom: 4,
      borderBottomWidth: 1.5,
      borderBottomColor: label,
    },
    fromToName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font, marginTop: 6, marginBottom: 2 },
    fromToDetail: { fontSize: 9, color: label, marginBottom: 1 },
    table: { marginBottom: 20 },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: label + '40',
    },
    headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: label + '20',
    },
    cellText: { fontSize: 9, color: font },
    colDesc: { width: '45%', textAlign: 'left' },
    colQty: { width: '15%', textAlign: 'right' },
    colRate: { width: '18%', textAlign: 'right' },
    colAmount: { width: '22%', textAlign: 'right' },
    totalsSection: { alignItems: 'flex-end', marginBottom: 20 },
    totalsBox: { width: 230 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    totalLabel: { fontSize: 10, color: label },
    totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: label,
      marginTop: 6,
    },
    grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    grandTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    notesSection: { marginTop: 20 },
    notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    notesText: { fontSize: 9, color: font, lineHeight: 1.5 },
    footerLine: {
      position: 'absolute',
      bottom: 44,
      left: 40,
      right: 40,
      height: 1.5,
      backgroundColor: label + '40',
    },
    footer: { position: 'absolute', bottom: 28, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: label },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Decorative circle */}
      <View style={styles.decorativeCircle} />

      {/* Top Section: Org left, Title right */}
      <View style={styles.topSection}>
        <View style={styles.orgBlock}>
          <Text style={styles.orgName}>{org.name || ''}</Text>
          {org.email && <Text style={styles.orgDetail}>{org.email}</Text>}
          {org.phone && <Text style={styles.orgDetail}>{org.phone}</Text>}
          {org.gstin && <Text style={[styles.orgDetail, { marginTop: 3 }]}>GSTIN: {org.gstin}</Text>}
          {org.address && <Text style={[styles.orgDetail, { marginTop: 1, maxWidth: 180 }]}>{org.address}</Text>}
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.invoiceTitle}>{typeLabel.toUpperCase()}</Text>
          <Text style={styles.invoiceNumber}>{numberField || ''}</Text>
          <Text style={styles.invoiceDate}>{formatDate(dateField)}</Text>
          {type === 'invoice' && data.dueDate && (
            <Text style={styles.invoiceDate}>Due: {formatDate(data.dueDate)}</Text>
          )}
          {type === 'quote' && data.expiryDate && (
            <Text style={styles.invoiceDate}>Expires: {formatDate(data.expiryDate)}</Text>
          )}
        </View>
      </View>

      {/* Accent line separator */}
      <View style={styles.accentLine} />

      {/* FROM / BILL TO with underlines */}
      <View style={styles.fromToSection}>
        <View style={styles.fromToBlock}>
          <Text style={styles.fromToLabel}>From</Text>
          <Text style={styles.fromToName}>{org.name || ''}</Text>
          {org.email && <Text style={styles.fromToDetail}>{org.email}</Text>}
          {org.phone && <Text style={styles.fromToDetail}>{org.phone}</Text>}
        </View>
        <View style={styles.fromToBlock}>
          <Text style={styles.fromToLabel}>Bill To</Text>
          <Text style={styles.fromToName}>{data.customer?.name || data.customerName || '-'}</Text>
          {data.customer?.email && <Text style={styles.fromToDetail}>{data.customer.email}</Text>}
          {data.customer?.phone && <Text style={styles.fromToDetail}>{data.customer.phone}</Text>}
          {data.customer?.address && <Text style={styles.fromToDetail}>{data.customer.address}</Text>}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colRate]}>Unit Price</Text>
          <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colDesc]}>{item.name || '-'}</Text>
            <Text style={[styles.cellText, styles.colQty]}>{item.quantity || 0}</Text>
            <Text style={[styles.cellText, styles.colRate]}>{formatCurrency(item.rate)}</Text>
            <Text style={[styles.cellText, styles.colAmount]}>
              {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          {data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount{data.discountType === 'percentage' && data.discountValue ? ` (${data.discountValue}%)` : ''}
              </Text>
              <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{formatCurrency(data.discountAmount)}</Text>
            </View>
          )}
          {data.taxAmount > 0 && type !== 'challan' && (
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
            <View style={[styles.totalRow, { marginTop: 6 }]}>
              <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
              <Text style={[styles.totalValue, { color: '#2563eb' }]}>{formatCurrency(data.balanceDue)}</Text>
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

      <View style={styles.footerLine} />
      <Text style={styles.footer}>Generated by DineOpen Invoice</Text>
    </Page>
  );
}
