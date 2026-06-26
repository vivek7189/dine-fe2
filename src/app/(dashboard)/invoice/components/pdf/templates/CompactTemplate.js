'use client';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate, getTypeFields } from '../pdfHelpers';

export default function CompactTemplate({ data, type = 'invoice', org = {}, colors = {} }) {
  const bg = colors.background || '#ffffff';
  const label = colors.label || '#6b7280';
  const font = colors.font || '#111827';
  const { typeLabel, numberField, dateField } = getTypeFields(data, type);
  const items = data.items || [];

  const labelBg8 = label + '14'; // 8% opacity

  const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', color: font, backgroundColor: bg },
    headerBlock: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: labelBg8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 14,
    },
    orgName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: font },
    orgGstin: { fontSize: 8, color: label, marginTop: 2 },
    numberBadge: {
      backgroundColor: label,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
    },
    numberBadgeText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    dateText: { fontSize: 8, color: label, marginTop: 4, textAlign: 'right' },
    billToRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: label + '40',
      marginBottom: 14,
    },
    billToName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    billToDetail: { fontSize: 8, color: label },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: label + '30',
      borderBottomStyle: 'dotted',
    },
    itemLeft: { fontSize: 9, color: font, maxWidth: '70%' },
    itemAmount: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: font },
    totalsSection: { marginTop: 12, alignItems: 'flex-end', marginBottom: 16 },
    totalsBox: { width: 200 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    totalLabel: { fontSize: 9, color: label },
    totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: labelBg8,
      marginTop: 4,
    },
    grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    grandTotalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: font },
    notesSection: { marginTop: 14, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: label + '40' },
    notesTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: label, textTransform: 'uppercase', marginBottom: 3 },
    notesText: { fontSize: 8, color: font, lineHeight: 1.4 },
    footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: label },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Header block */}
      <View style={styles.headerBlock}>
        <View>
          <Text style={styles.orgName}>{org.name || ''}</Text>
          {org.gstin && <Text style={styles.orgGstin}>GSTIN: {org.gstin}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{numberField || typeLabel}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(dateField)}</Text>
          {type === 'invoice' && data.dueDate && (
            <Text style={styles.dateText}>Due: {formatDate(data.dueDate)}</Text>
          )}
          {type === 'quote' && data.expiryDate && (
            <Text style={styles.dateText}>Expires: {formatDate(data.expiryDate)}</Text>
          )}
        </View>
      </View>

      {/* Bill To - single row */}
      <View style={styles.billToRow}>
        <View>
          <Text style={styles.billToName}>{data.customer?.name || data.customerName || '-'}</Text>
          {data.customer?.phone && <Text style={styles.billToDetail}>{data.customer.phone}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {data.customer?.email && <Text style={styles.billToDetail}>{data.customer.email}</Text>}
          <Text style={[styles.billToDetail, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginTop: 2 }]}>
            {(data.status || 'draft').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items as compact lines */}
      <View style={{ marginBottom: 12 }}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemLeft}>
              {item.name || '-'} x{item.quantity || 0}
            </Text>
            <Text style={styles.itemAmount}>
              {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0), data.currencySymbol)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
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
