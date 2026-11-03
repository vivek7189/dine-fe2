'use client';

// A4 salary slip for @react-pdf. Built-in PDF fonts have no ₹ glyph, so amounts use "Rs.".
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: '#111827' },
  logo: { width: 54, height: 54, objectFit: 'contain' },
  biz: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827' },
  sub: { fontSize: 9.5, color: '#6b7280', marginTop: 2 },
  title: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginVertical: 14, letterSpacing: 1 },
  info: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  infoCell: { width: '50%', flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoK: { width: 90, color: '#6b7280' },
  infoV: { flex: 1, fontFamily: 'Helvetica-Bold', color: '#111827' },
  cols: { flexDirection: 'row', marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  col: { flex: 1 },
  colHead: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  colHeadT: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 10 },
  total: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', fontFamily: 'Helvetica-Bold' },
  net: { marginTop: 16, padding: 12, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 4 },
  netRow: { flexDirection: 'row', justifyContent: 'space-between' },
  netK: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  netV: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#047857' },
  words: { fontSize: 9.5, color: '#374151', marginTop: 5 },
  sign: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 56 },
  signLine: { width: 170, borderTopWidth: 1, borderTopColor: '#9ca3af', paddingTop: 5, fontSize: 9, color: '#6b7280', textAlign: 'center' },
  foot: { position: 'absolute', bottom: 28, left: 40, right: 40, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
});

const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`;

export function SlipPDFDoc({ d }) {
  const { biz, emp, r, words, monthLabel } = d;
  const rows = Math.max(r.earnings.length, r.deductions.length);
  const pad = (list) => [...list, ...Array(rows - list.length).fill(['', null])];
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {biz.logo && <Image src={biz.logo} style={s.logo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.biz}>{biz.name}</Text>
            {!!biz.address && <Text style={s.sub}>{biz.address}</Text>}
          </View>
        </View>
        <Text style={s.title}>SALARY SLIP · {monthLabel.toUpperCase()}</Text>
        <View style={s.info}>
          {emp.info.map(([k, v]) => (
            <View key={k} style={s.infoCell}><Text style={s.infoK}>{k}</Text><Text style={s.infoV}>{v}</Text></View>
          ))}
        </View>
        <View style={s.cols}>
          {[['Earnings', pad(r.earnings), 'Gross pay', r.gross], ['Deductions', pad(r.deductions), 'Total deductions', r.totalDed]].map(([h, list, tl, tv], ci) => (
            <View key={h} style={[s.col, ci === 0 && { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>
              <View style={s.colHead}><Text style={s.colHeadT}>{h}</Text><Text style={s.colHeadT}>Amount</Text></View>
              {list.map(([k, a], i) => (
                <View key={i} style={s.row}><Text>{k || ' '}</Text><Text>{a == null ? ' ' : rs(a)}</Text></View>
              ))}
              <View style={s.total}><Text>{tl}</Text><Text>{rs(tv)}</Text></View>
            </View>
          ))}
        </View>
        <View style={s.net}>
          <View style={s.netRow}><Text style={s.netK}>Net pay</Text><Text style={s.netV}>{rs(r.net)}</Text></View>
          <Text style={s.words}>{words}</Text>
        </View>
        <View style={s.sign}>
          <Text style={s.signLine}>Employee signature</Text>
          <Text style={s.signLine}>For {biz.name}</Text>
        </View>
        <Text style={s.foot}>Made with the free salary slip generator at dineopen.com</Text>
      </Page>
    </Document>
  );
}
