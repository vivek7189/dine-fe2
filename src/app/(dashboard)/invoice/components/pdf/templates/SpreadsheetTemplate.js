'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function SpreadsheetTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const labelBg5 = label + '0D';
  const showTax = type !== 'challan';

  const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: label,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    topBarTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    topBarNumber: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    fromToSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    fromToBlock: { width: '48%' },
    sectionLabel: {
      fontSize: 7,
      fontFamily: 'Helvetica-Bold',
      color: label,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    orgName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font, marginBottom: 2 },
    detailText: { fontSize: 8, color: label, marginBottom: 1 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    metaLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label },
    metaValue: { fontSize: 8, color: font },
    table: { marginBottom: 16 },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: label,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    headerText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6 },
    tableRowAlt: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, backgroundColor: labelBg5 },
    cellText: { fontSize: 8, color: font },
    colNum: { width: '5%', textAlign: 'left' },
    colItem: { width: '35%', textAlign: 'left' },
    colQty: { width: '10%', textAlign: 'right' },
    colRate: { width: '16%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'right' },
    colAmount: { width: '22%', textAlign: 'right' },
    colAmountWide: { width: '34%', textAlign: 'right' },
    totalsSection: { alignItems: 'flex-end', marginBottom: 16 },
    totalsBox: { width: 240 },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    totalLabel: { fontSize: 9, color: label },
    totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: label + '1A',
      marginTop: 2,
    },
    grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    notesSection: { marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    notesTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 3 },
    notesText: { fontSize: 8, color: font, lineHeight: 1.4 },
    footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: label },
  });

  const halfTax = data.taxAmount ? data.taxAmount / 2 : 0;

  return (
    <Page size="A4" style={styles.page}>
      {/* Full-width header bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{typeLabel.toUpperCase()}</Text>
        <Text style={styles.topBarNumber}>{numberField || ''}</Text>
      </View>

      {/* From / To */}
      <View style={styles.fromToSection}>
        <View style={styles.fromToBlock}>
          <Text style={styles.sectionLabel}>From</Text>
          <Text style={styles.orgName}>{org.name || ''}</Text>
          {org.email && <Text style={styles.detailText}>{org.email}</Text>}
          {org.phone && <Text style={styles.detailText}>{org.phone}</Text>}
          {org.gstin && <Text style={[styles.detailText, { marginTop: 2 }]}>GSTIN: {org.gstin}</Text>}
          {org.address && <Text style={styles.detailText}>{org.address}</Text>}
        </View>
        <View style={styles.fromToBlock}>
          <Text style={styles.sectionLabel}>To</Text>
          <Text style={styles.orgName}>{data.customer?.name || data.customerName || '-'}</Text>
          {data.customer?.email && <Text style={styles.detailText}>{data.customer.email}</Text>}
          {data.customer?.phone && <Text style={styles.detailText}>{data.customer.phone}</Text>}
          {data.customer?.address && <Text style={styles.detailText}>{data.customer.address}</Text>}
          <View style={{ marginTop: 8 }}>
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
      </View>

      {/* Dense Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colNum]}>#</Text>
          <Text style={[styles.headerText, styles.colItem]}>Item</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
          {showTax && <Text style={[styles.headerText, styles.colTax]}>Tax</Text>}
          <Text style={[styles.headerText, showTax ? styles.colAmount : styles.colAmountWide]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.cellText, styles.colNum]}>{idx + 1}</Text>
            <Text style={[styles.cellText, styles.colItem]}>{item.name || '-'}</Text>
            <Text style={[styles.cellText, styles.colQty]}>{item.quantity || 0}</Text>
            <Text style={[styles.cellText, styles.colRate]}>{formatCurrency(item.rate)}</Text>
            {showTax && (
              <Text style={[styles.cellText, styles.colTax]}>{item.taxRate ? `${item.taxRate}%` : '-'}</Text>
            )}
            <Text style={[styles.cellText, showTax ? styles.colAmount : styles.colAmountWide]}>
              {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals with CGST/SGST split */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
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
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST</Text>
                <Text style={styles.totalValue}>{formatCurrency(halfTax)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST</Text>
                <Text style={styles.totalValue}>{formatCurrency(halfTax)}</Text>
              </View>
            </>
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

      <Text style={styles.footer}>Generated by DineOpen Invoice</Text>
    </Page>
  );
}
