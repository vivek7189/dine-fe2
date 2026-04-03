'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function ClassicTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const labelBg12 = label + '1F'; // ~12% opacity

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    headerBlock: {
      backgroundColor: labelBg12,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginBottom: 20,
    },
    orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: font },
    orgDetail: { fontSize: 9, color: label, marginTop: 2 },
    infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    infoBox: {
      width: '48%',
      borderWidth: 1,
      borderColor: label + '50',
      padding: 10,
    },
    infoBoxLabel: {
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      color: label,
      textTransform: 'uppercase',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    infoBoxValue: { fontSize: 10, color: font, marginBottom: 3 },
    infoBoxSubValue: { fontSize: 9, color: label, marginBottom: 2 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    metaLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label },
    metaValue: { fontSize: 9, color: font },
    table: { marginBottom: 20 },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: label,
      paddingVertical: 7,
      paddingHorizontal: 8,
    },
    headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase' },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: label + '30',
    },
    cellText: { fontSize: 9, color: font },
    colNum: { width: '6%', textAlign: 'left' },
    colItem: { width: '38%', textAlign: 'left' },
    colQty: { width: '12%', textAlign: 'right' },
    colRate: { width: '18%', textAlign: 'right' },
    colAmount: { width: '26%', textAlign: 'right' },
    totalsSection: { alignItems: 'flex-end', marginBottom: 16 },
    totalsBox: { width: 230, borderWidth: 1, borderColor: label + '40' },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: label + '20',
    },
    totalLabel: { fontSize: 9, color: label },
    totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: labelBg12,
    },
    grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: font },
    bankSection: {
      marginTop: 16,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: label + '40',
    },
    bankTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 4 },
    bankText: { fontSize: 8, color: label },
    notesSection: { marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: label + '40' },
    notesTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 3 },
    notesText: { fontSize: 8, color: font, lineHeight: 1.4 },
    thankYou: {
      position: 'absolute',
      bottom: 48,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 10,
      fontFamily: 'Helvetica-Oblique',
      color: label,
    },
    footer: { position: 'absolute', bottom: 28, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: label },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <Text style={styles.orgName}>{org.name || ''}</Text>
        {org.address && <Text style={styles.orgDetail}>{org.address}</Text>}
        {(org.email || org.phone) && (
          <Text style={styles.orgDetail}>{[org.email, org.phone].filter(Boolean).join(' | ')}</Text>
        )}
        {org.gstin && <Text style={[styles.orgDetail, { marginTop: 2 }]}>GSTIN: {org.gstin}</Text>}
      </View>

      {/* Two bordered boxes: Bill To / Details */}
      <View style={styles.infoSection}>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>Bill To</Text>
          <Text style={[styles.infoBoxValue, { fontFamily: 'Helvetica-Bold' }]}>
            {data.customer?.name || data.customerName || '-'}
          </Text>
          {data.customer?.email && <Text style={styles.infoBoxSubValue}>{data.customer.email}</Text>}
          {data.customer?.phone && <Text style={styles.infoBoxSubValue}>{data.customer.phone}</Text>}
          {data.customer?.address && <Text style={styles.infoBoxSubValue}>{data.customer.address}</Text>}
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>{typeLabel} Details</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{typeLabel} #:</Text>
            <Text style={styles.metaValue}>{numberField || '-'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{formatDate(dateField)}</Text>
          </View>
          {type === 'invoice' && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
            </View>
          )}
          {type === 'quote' && data.expiryDate && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Expiry Date:</Text>
              <Text style={styles.metaValue}>{formatDate(data.expiryDate)}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status:</Text>
            <Text style={[styles.metaValue, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }]}>
              {(data.status || 'draft').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colNum]}>#</Text>
          <Text style={[styles.headerText, styles.colItem]}>Item</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
          <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colNum]}>{idx + 1}</Text>
            <Text style={[styles.cellText, styles.colItem]}>{item.name || '-'}</Text>
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
            <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
              <Text style={[styles.totalValue, { color: '#2563eb' }]}>{formatCurrency(data.balanceDue)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bank Details */}
      <View style={styles.bankSection}>
        <Text style={styles.bankTitle}>Bank Details</Text>
        <Text style={styles.bankText}>Bank: [Your Bank Name] | Account: XXXX | IFSC: XXXX</Text>
      </View>

      {/* Notes */}
      {(data.customerNotes || data.termsAndConditions) && (
        <View style={styles.notesSection}>
          {data.customerNotes && (
            <View style={{ marginBottom: 8 }}>
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

      <Text style={styles.thankYou}>Thank You For Your Business!</Text>
      <Text style={styles.footer}>Generated by DineOpen Invoice</Text>
    </Page>
  );
}
