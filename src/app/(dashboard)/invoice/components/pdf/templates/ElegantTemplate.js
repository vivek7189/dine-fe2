'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function ElegantTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const styles = StyleSheet.create({
    page: { padding: 40, paddingLeft: 52, fontSize: 10, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 4,
      backgroundColor: label,
    },
    headerSection: { alignItems: 'center', marginBottom: 8 },
    orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: font, textAlign: 'center' },
    orgSubtext: { fontSize: 9, color: label, textAlign: 'center', marginTop: 3, maxWidth: 300 },
    separator: { height: 1, backgroundColor: label + '40', marginVertical: 16 },
    infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    infoBlock: { width: '48%' },
    label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 3, letterSpacing: 0.5 },
    value: { fontSize: 10, color: font, marginBottom: 6 },
    table: { marginBottom: 24 },
    tableTopBorder: { height: 2, backgroundColor: label, marginBottom: 0 },
    tableHeaderRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: label,
    },
    headerText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: label + '30',
    },
    tableBottomBorder: { height: 2, backgroundColor: label },
    cellText: { fontSize: 9, color: font },
    colDesc: { width: '55%', textAlign: 'left' },
    colQty: { width: '20%', textAlign: 'right' },
    colAmount: { width: '25%', textAlign: 'right' },
    totalsSection: { alignItems: 'flex-end', marginBottom: 20 },
    totalsBox: { width: 220 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    totalLabel: { fontSize: 10, color: label },
    totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      marginTop: 6,
    },
    grandTotalUnderline: { height: 2, backgroundColor: label, marginTop: 2 },
    grandTotalLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: font },
    notesSection: { marginTop: 24 },
    notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    notesText: { fontSize: 9, color: font, lineHeight: 1.5 },
    thankYou: {
      position: 'absolute',
      bottom: 50,
      left: 52,
      right: 40,
      textAlign: 'center',
      fontSize: 10,
      fontFamily: 'Helvetica-Oblique',
      color: label,
    },
    footer: { position: 'absolute', bottom: 30, left: 52, right: 40, textAlign: 'center', fontSize: 8, color: label },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Left accent bar */}
      <View style={styles.accentBar} />

      {/* Centered Header */}
      <View style={styles.headerSection}>
        <Text style={styles.orgName}>{org.name || ''}</Text>
        {org.address && <Text style={styles.orgSubtext}>{org.address}</Text>}
        {org.gstin && <Text style={[styles.orgSubtext, { marginTop: 2 }]}>GSTIN: {org.gstin}</Text>}
        {(org.email || org.phone) && (
          <Text style={[styles.orgSubtext, { marginTop: 2 }]}>
            {[org.email, org.phone].filter(Boolean).join(' | ')}
          </Text>
        )}
      </View>

      <View style={styles.separator} />

      {/* Two column: Invoice To / Invoice Details */}
      <View style={styles.infoSection}>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>{typeLabel} To</Text>
          <Text style={[styles.value, { fontFamily: 'Helvetica-Bold' }]}>{data.customer?.name || data.customerName || '-'}</Text>
          {data.customer?.email && <Text style={[styles.value, { fontSize: 9, color: label }]}>{data.customer.email}</Text>}
          {data.customer?.phone && <Text style={[styles.value, { fontSize: 9, color: label }]}>{data.customer.phone}</Text>}
          {data.customer?.address && <Text style={[styles.value, { fontSize: 9, color: label }]}>{data.customer.address}</Text>}
        </View>
        <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.label}>{typeLabel} #</Text>
          <Text style={styles.value}>{numberField || '-'}</Text>
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
          <Text style={[styles.value, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }]}>
            {(data.status || 'draft').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items Table with double lines */}
      <View style={styles.table}>
        <View style={styles.tableTopBorder} />
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colDesc]}>{item.name || '-'}</Text>
            <Text style={[styles.cellText, styles.colQty]}>{item.quantity || 0}</Text>
            <Text style={[styles.cellText, styles.colAmount]}>
              {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}
            </Text>
          </View>
        ))}
        <View style={styles.tableBottomBorder} />
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
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
          <View style={styles.grandTotalUnderline} />
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

      <Text style={styles.thankYou}>Thank you for your business!</Text>
      <Text style={styles.footer}>Generated by DineOpen Invoice</Text>
    </Page>
  );
}
