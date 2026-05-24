'use client';

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937', backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 8, paddingBottom: 16, borderBottomWidth: 3, borderBottomColor: '#059669' },
  logo: { width: 60, height: 60, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  subtitle: { fontSize: 10, color: '#6b7280', marginBottom: 2 },
  badge: { fontSize: 9, color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 8, padding: 14, marginVertical: 18 },
  metaLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 3 },
  metaValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827' },
  metaSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableRowAlt: { backgroundColor: '#fafafa' },
  colNum: { width: '6%' },
  colItem: { width: '38%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '22%', textAlign: 'right' },
  colAmount: { width: '22%', textAlign: 'right' },
  headerCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase' },
  cell: { fontSize: 10, color: '#374151' },
  cellBold: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' },
  totalsWrap: { alignItems: 'flex-end', marginTop: 16 },
  totalsBox: { width: 240 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  totalLabel: { fontSize: 11, color: '#374151' },
  totalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827' },
  grandTotalBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginTop: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  grandTotalLabel: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111827' },
  grandTotalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#059669' },
  notesSection: { marginTop: 24, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  notesTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 },
  notesText: { fontSize: 9, color: '#6b7280', lineHeight: 1.6 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center' },
  footerText: { fontSize: 9, color: '#9ca3af' },
  footerBrand: { fontSize: 8, color: '#d1d5db', marginTop: 3 },
});

export function InvoicePDFDoc({ data }) {
  const {
    restaurantName, restaurantAddress, restaurantPhone, gstin, fssai,
    customerName, invoiceNo, today, items,
    subtotal, discountAmount, discount, gstRate, gstAmount, totalAmount,
    notes, logo,
  } = data;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          {logo && <Image src={logo} style={s.logo} />}
          <View style={[s.headerText, !logo && { textAlign: 'center' }]}>
            <Text style={s.title}>{restaurantName}</Text>
            {restaurantAddress && <Text style={s.subtitle}>{restaurantAddress}</Text>}
            {restaurantPhone && <Text style={s.subtitle}>{restaurantPhone}</Text>}
            <View style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }}>
              {gstin && <Text style={s.badge}>GSTIN: {gstin}</Text>}
              {fssai && <Text style={s.badge}>FSSAI: {fssai}</Text>}
            </View>
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>Invoice</Text>
            <Text style={s.metaValue}>{invoiceNo}</Text>
            <Text style={s.metaSub}>{today}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.metaLabel}>Bill To</Text>
            <Text style={s.metaValue}>{customerName}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={s.tableHeader}>
          <Text style={[s.headerCell, s.colNum]}>#</Text>
          <Text style={[s.headerCell, s.colItem]}>Item</Text>
          <Text style={[s.headerCell, s.colQty]}>Qty</Text>
          <Text style={[s.headerCell, s.colPrice]}>Price</Text>
          <Text style={[s.headerCell, s.colAmount]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={[s.tableRow, idx % 2 === 1 && s.tableRowAlt]}>
            <Text style={[s.cell, s.colNum]}>{idx + 1}</Text>
            <Text style={[s.cellBold, s.colItem]}>{item.name}</Text>
            <Text style={[s.cell, s.colQty]}>{item.qty}</Text>
            <Text style={[s.cell, s.colPrice]}>₹{item.price.toFixed(2)}</Text>
            <Text style={[s.cellBold, s.colAmount]}>₹{(item.qty * item.price).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={s.totalRow}>
                <Text style={[s.totalLabel, { color: '#dc2626' }]}>Discount ({discount}%)</Text>
                <Text style={[s.totalValue, { color: '#dc2626' }]}>-₹{discountAmount.toFixed(2)}</Text>
              </View>
            )}
            {gstRate > 0 && (
              <>
                <View style={s.totalRow}>
                  <Text style={[s.totalLabel, { color: '#6b7280' }]}>CGST ({gstRate / 2}%)</Text>
                  <Text style={[s.totalValue, { color: '#6b7280', fontFamily: 'Helvetica' }]}>₹{(gstAmount / 2).toFixed(2)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={[s.totalLabel, { color: '#6b7280' }]}>SGST ({gstRate / 2}%)</Text>
                  <Text style={[s.totalValue, { color: '#6b7280', fontFamily: 'Helvetica' }]}>₹{(gstAmount / 2).toFixed(2)}</Text>
                </View>
              </>
            )}
            <View style={s.grandTotalBox}>
              <Text style={s.grandTotalLabel}>Grand Total</Text>
              <Text style={s.grandTotalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.notesSection}>
            <Text style={s.notesTitle}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Thank you for dining with us!</Text>
          <Text style={s.footerBrand}>Generated by DineOpen.com</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function PDFDownloadHelper() {
  return null;
}
