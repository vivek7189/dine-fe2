'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function BoldTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Courier', color: font, backgroundColor: bg },
    title: { fontSize: 22, fontFamily: 'Courier-Bold', color: font, marginBottom: 4 },
    titleUnderline: { width: '100%', height: 2, backgroundColor: label, marginBottom: 16 },
    orgLine: { fontSize: 9, fontFamily: 'Courier', color: label, marginBottom: 12 },
    infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    infoBlock: { width: '48%' },
    label: { fontSize: 8, fontFamily: 'Courier-Bold', color: label, textTransform: 'uppercase', marginBottom: 2 },
    value: { fontSize: 9, fontFamily: 'Courier', color: font, marginBottom: 6 },
    table: { marginBottom: 20 },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: label,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    headerText: { fontSize: 8, fontFamily: 'Courier-Bold', color: '#ffffff', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4 },
    cell: { borderWidth: 1, borderColor: font, paddingVertical: 5, paddingHorizontal: 4 },
    cellText: { fontSize: 8, fontFamily: 'Courier', color: font },
    colNum: { width: '6%' },
    colDesc: { width: '34%' },
    colQty: { width: '10%', textAlign: 'right' },
    colRate: { width: '18%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'right' },
    colAmount: { width: '20%', textAlign: 'right' },
    colAmountWide: { width: '32%', textAlign: 'right' },
    headerRow: { flexDirection: 'row' },
    bodyRow: { flexDirection: 'row' },
    totalsSection: { alignItems: 'flex-end', marginBottom: 16 },
    totalsBox: { width: 240 },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: font,
      borderTopWidth: 0,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    totalRowFirst: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: font,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    totalLabel: { fontSize: 9, fontFamily: 'Courier', color: font },
    totalValue: { fontSize: 9, fontFamily: 'Courier-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: font,
      borderTopWidth: 0,
      paddingVertical: 6,
      paddingHorizontal: 6,
      backgroundColor: label + '1A',
    },
    grandTotalLabel: { fontSize: 11, fontFamily: 'Courier-Bold', color: font },
    grandTotalValue: { fontSize: 11, fontFamily: 'Courier-Bold', color: font },
    notesSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: font },
    notesTitle: { fontSize: 8, fontFamily: 'Courier-Bold', color: label, textTransform: 'uppercase', marginBottom: 3 },
    notesText: { fontSize: 8, fontFamily: 'Courier', color: font, lineHeight: 1.5 },
    footer: { position: 'absolute', bottom: 24, left: 30, right: 30, textAlign: 'center', fontSize: 7, fontFamily: 'Courier', color: label },
  });

  const showTax = type !== 'challan';

  return (
    <Page size="A4" style={styles.page}>
      {/* Title */}
      <Text style={styles.title}>{typeLabel.toUpperCase()}</Text>
      <View style={styles.titleUnderline} />

      {/* Org Info - single line */}
      <Text style={styles.orgLine}>
        {[org.name, org.email, org.phone].filter(Boolean).join(' | ')}
      </Text>
      {org.gstin && <Text style={[styles.orgLine, { marginTop: -8 }]}>GSTIN: {org.gstin}</Text>}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Bill To</Text>
          <Text style={styles.value}>{data.customer?.name || data.customerName || '-'}</Text>
          {data.customer?.email && <Text style={[styles.value, { marginBottom: 2 }]}>{data.customer.email}</Text>}
          {data.customer?.phone && <Text style={styles.value}>{data.customer.phone}</Text>}
          {data.customer?.address && <Text style={styles.value}>{data.customer.address}</Text>}
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
          <Text style={[styles.value, { fontFamily: 'Courier-Bold' }]}>{(data.status || 'draft').toUpperCase()}</Text>
        </View>
      </View>

      {/* Items Table with full grid borders */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.cell, { backgroundColor: label, width: '6%' }]}>
            <Text style={styles.headerText}>#</Text>
          </View>
          <View style={[styles.cell, { backgroundColor: label, width: '34%', borderLeftWidth: 0 }]}>
            <Text style={styles.headerText}>Description</Text>
          </View>
          <View style={[styles.cell, { backgroundColor: label, width: '10%', borderLeftWidth: 0 }]}>
            <Text style={[styles.headerText, { textAlign: 'right' }]}>Qty</Text>
          </View>
          <View style={[styles.cell, { backgroundColor: label, width: '18%', borderLeftWidth: 0 }]}>
            <Text style={[styles.headerText, { textAlign: 'right' }]}>Unit Price</Text>
          </View>
          {showTax && (
            <View style={[styles.cell, { backgroundColor: label, width: '12%', borderLeftWidth: 0 }]}>
              <Text style={[styles.headerText, { textAlign: 'right' }]}>Tax%</Text>
            </View>
          )}
          <View style={[styles.cell, { backgroundColor: label, width: showTax ? '20%' : '32%', borderLeftWidth: 0 }]}>
            <Text style={[styles.headerText, { textAlign: 'right' }]}>Amount</Text>
          </View>
        </View>
        {/* Rows */}
        {items.map((item, idx) => (
          <View key={idx} style={styles.bodyRow}>
            <View style={[styles.cell, { width: '6%', borderTopWidth: 0 }]}>
              <Text style={styles.cellText}>{idx + 1}</Text>
            </View>
            <View style={[styles.cell, { width: '34%', borderTopWidth: 0, borderLeftWidth: 0 }]}>
              <Text style={styles.cellText}>{item.name || '-'}</Text>
            </View>
            <View style={[styles.cell, { width: '10%', borderTopWidth: 0, borderLeftWidth: 0 }]}>
              <Text style={[styles.cellText, { textAlign: 'right' }]}>{item.quantity || 0}</Text>
            </View>
            <View style={[styles.cell, { width: '18%', borderTopWidth: 0, borderLeftWidth: 0 }]}>
              <Text style={[styles.cellText, { textAlign: 'right' }]}>{formatCurrency(item.rate, data.currencySymbol)}</Text>
            </View>
            {showTax && (
              <View style={[styles.cell, { width: '12%', borderTopWidth: 0, borderLeftWidth: 0 }]}>
                <Text style={[styles.cellText, { textAlign: 'right' }]}>{item.taxRate ? `${item.taxRate}%` : '-'}</Text>
              </View>
            )}
            <View style={[styles.cell, { width: showTax ? '20%' : '32%', borderTopWidth: 0, borderLeftWidth: 0 }]}>
              <Text style={[styles.cellText, { textAlign: 'right' }]}>
                {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0), data.currencySymbol)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals with full borders */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRowFirst}>
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
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total, data.currencySymbol)}</Text>
          </View>
          {type === 'invoice' && data.balanceDue !== undefined && data.balanceDue !== data.total && (
            <View style={[styles.totalRow, { borderTopWidth: 0 }]}>
              <Text style={[styles.totalLabel, { fontFamily: 'Courier-Bold' }]}>Balance Due</Text>
              <Text style={[styles.totalValue, { color: '#2563eb' }]}>{formatCurrency(data.balanceDue, data.currencySymbol)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Notes */}
      {(data.customerNotes || data.termsAndConditions) && (
        <View style={styles.notesSection}>
          {data.customerNotes && (
            <View style={{ marginBottom: 10 }}>
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
