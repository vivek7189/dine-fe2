'use client';

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// The built-in Helvetica has no ₹ glyph, so the PDF writes "Rs."
const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const rs = (n) => `Rs. ${nf.format(Math.round(n * 100) / 100)}`;
// Same for any ₹ the user typed (terms, notes, item names). The logo data URL is left alone.
const noRupee = (v) => (typeof v === 'string' ? (v.startsWith('data:') ? v : v.replace(/₹\s?/g, 'Rs. '))
  : Array.isArray(v) ? v.map(noRupee)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, noRupee(x)])) : v);

const s = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  head: { flexDirection: 'row', gap: 14, paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: '#b45309' },
  logo: { width: 56, height: 56, objectFit: 'contain' },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  sub: { fontSize: 9.5, color: '#6b7280', marginBottom: 1.5 },
  docTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#b45309', textAlign: 'right' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fffbeb', borderRadius: 6, padding: 12, marginTop: 14 },
  metaCol: { width: '48%' },
  label: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#92400e', textTransform: 'uppercase', marginBottom: 3 },
  val: { fontSize: 10, color: '#111827', marginBottom: 1.5 },
  valB: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  h: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 16, marginBottom: 6 },
  menuWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  menuCol: { width: '50%', paddingRight: 10, marginBottom: 8 },
  menuTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400e', marginBottom: 3 },
  menuItem: { fontSize: 9.5, color: '#374151', marginBottom: 1.5 },
  th: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#e5e7eb', paddingBottom: 5 },
  tr: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cName: { width: '52%' },
  cQty: { width: '14%', textAlign: 'right' },
  cRate: { width: '16%', textAlign: 'right' },
  cAmt: { width: '18%', textAlign: 'right' },
  thc: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase' },
  td: { fontSize: 9.5, color: '#374151' },
  tdB: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  totWrap: { alignItems: 'flex-end', marginTop: 10 },
  totBox: { width: 250 },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  grand: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 6, padding: 9, marginTop: 6 },
  grandT: { fontSize: 12.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  adv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginTop: 4 },
  terms: { fontSize: 9, color: '#4b5563', marginBottom: 2.5, lineHeight: 1.45 },
  sign: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  signLine: { width: 170, borderTopWidth: 1, borderTopColor: '#9ca3af', paddingTop: 4, fontSize: 8.5, color: '#6b7280', textAlign: 'center' },
  foot: { position: 'absolute', bottom: 26, left: 40, right: 40, textAlign: 'center', fontSize: 7.5, color: '#9ca3af' },
});

export function QuotationPDFDoc({ q: raw }) {
  const q = noRupee(raw);
  const { biz, client, event, menu, lines, extras, totals, gstRate, advancePct, validUntil, terms, notes, logo, quoteNo, quoteDate, eventDate } = q;
  return (
    <Document title={`Quotation ${quoteNo}`}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
          {logo && <Image src={logo} style={s.logo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{biz.name}</Text>
            {biz.address ? <Text style={s.sub}>{biz.address}</Text> : null}
            <Text style={s.sub}>{[biz.phone, biz.email].filter(Boolean).join('  ·  ')}</Text>
            {biz.gstin ? <Text style={s.sub}>GSTIN: {biz.gstin}</Text> : null}
          </View>
          <View>
            <Text style={s.docTitle}>QUOTATION</Text>
            <Text style={[s.sub, { textAlign: 'right' }]}>{quoteNo}</Text>
            <Text style={[s.sub, { textAlign: 'right' }]}>Date: {quoteDate}</Text>
            <Text style={[s.sub, { textAlign: 'right' }]}>Valid till: {validUntil}</Text>
          </View>
        </View>

        <View style={s.meta}>
          <View style={s.metaCol}>
            <Text style={s.label}>Prepared for</Text>
            <Text style={s.valB}>{client.name || '—'}</Text>
            {client.phone ? <Text style={s.val}>{client.phone}</Text> : null}
          </View>
          <View style={s.metaCol}>
            <Text style={s.label}>Event</Text>
            <Text style={s.valB}>{event.type || 'Event'}{event.guests ? `  ·  ${event.guests} guests` : ''}</Text>
            {eventDate || event.time ? <Text style={s.val}>{[eventDate, event.time].filter(Boolean).join(', ')}</Text> : null}
            {event.venue ? <Text style={s.val}>{event.venue}</Text> : null}
          </View>
        </View>

        {menu.length > 0 && (
          <>
            <Text style={s.h}>Menu</Text>
            <View style={s.menuWrap}>
              {menu.map((m) => (
                <View key={m.title} style={s.menuCol} wrap={false}>
                  <Text style={s.menuTitle}>{m.title.toUpperCase()}</Text>
                  {m.list.map((it) => <Text key={it} style={s.menuItem}>•  {it}</Text>)}
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={s.h}>Charges</Text>
        <View style={s.th}>
          <Text style={[s.thc, s.cName]}>Description</Text>
          <Text style={[s.thc, s.cQty]}>Qty</Text>
          <Text style={[s.thc, s.cRate]}>Rate</Text>
          <Text style={[s.thc, s.cAmt]}>Amount</Text>
        </View>
        {lines.map((l, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={[s.tdB, s.cName]}>{l.name}</Text>
            <Text style={[s.td, s.cQty]}>{l.qty != null ? nf.format(l.qty) : ''}</Text>
            <Text style={[s.td, s.cRate]}>{l.rate != null ? rs(l.rate) : ''}</Text>
            <Text style={[s.tdB, s.cAmt]}>{rs(l.amount)}</Text>
          </View>
        ))}
        {extras.map((x, i) => (
          <View key={`x${i}`} style={s.tr} wrap={false}>
            <Text style={[s.td, s.cName]}>{x.name}</Text>
            <Text style={[s.td, s.cQty]}></Text>
            <Text style={[s.td, s.cRate]}></Text>
            <Text style={[s.tdB, s.cAmt]}>{rs(x.amount)}</Text>
          </View>
        ))}

        <View style={s.totWrap} wrap={false}>
          <View style={s.totBox}>
            <View style={s.totRow}><Text>Subtotal</Text><Text>{rs(totals.subtotal)}</Text></View>
            {totals.discount > 0 && <View style={s.totRow}><Text style={{ color: '#dc2626' }}>Discount</Text><Text style={{ color: '#dc2626' }}>- {rs(totals.discount)}</Text></View>}
            {gstRate > 0 && (
              <>
                <View style={s.totRow}><Text style={{ color: '#6b7280' }}>CGST ({gstRate / 2}%)</Text><Text style={{ color: '#6b7280' }}>{rs(totals.gst / 2)}</Text></View>
                <View style={s.totRow}><Text style={{ color: '#6b7280' }}>SGST ({gstRate / 2}%)</Text><Text style={{ color: '#6b7280' }}>{rs(totals.gst / 2)}</Text></View>
              </>
            )}
            <View style={s.grand}><Text style={s.grandT}>Total</Text><Text style={s.grandT}>{rs(totals.total)}</Text></View>
            {advancePct > 0 && (
              <>
                <View style={s.adv}><Text>Advance to confirm ({advancePct}%)</Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>{rs(totals.advance)}</Text></View>
                <View style={s.totRow}><Text style={{ color: '#6b7280' }}>Balance</Text><Text style={{ color: '#6b7280' }}>{rs(totals.total - totals.advance)}</Text></View>
              </>
            )}
          </View>
        </View>

        {terms.length > 0 && (
          <View wrap={false}>
            <Text style={s.h}>Terms</Text>
            {terms.map((t, i) => <Text key={i} style={s.terms}>{i + 1}. {t}</Text>)}
          </View>
        )}
        {notes ? (
          <View wrap={false}>
            <Text style={s.h}>Notes</Text>
            <Text style={s.terms}>{notes}</Text>
          </View>
        ) : null}

        <View style={s.sign} wrap={false}>
          <Text style={s.signLine}>Client signature</Text>
          <Text style={s.signLine}>For {biz.name}</Text>
        </View>

        <Text style={s.foot} fixed>Made with the free catering quotation maker at dineopen.com</Text>
      </Page>
    </Document>
  );
}
