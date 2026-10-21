import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';

// Shared layout for the plain-language "DineOpen vs X" pages (Rista, DotPe,
// Gofrugal, Foodics). Each page passes its own data; the FAQ schema is built
// from the same FAQ list that is shown on the page.

export function buildFaqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function buildArticleSchema({ headline, description, url, date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    author: { '@type': 'Organization', name: 'DineOpen', url: 'https://www.dineopen.com' },
    publisher: { '@type': 'Organization', name: 'DineOpen', logo: { '@type': 'ImageObject', url: 'https://www.dineopen.com/favicon.png' } },
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: url,
  };
}

const wrap = { maxWidth: '780px', margin: '0 auto', padding: '0 20px' };
const h2 = { fontSize: '28px', fontWeight: '800', lineHeight: '1.25', margin: '52px 0 14px', color: '#0f172a' };
const p = { fontSize: '17px', lineHeight: '1.75', color: '#1f2937', margin: '0 0 16px' };
const small = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '8px 0 0' };
const linkStyle = { color: '#2563eb', textDecoration: 'underline' };
const th = { padding: '12px 14px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#fff', background: '#0f172a' };
const td = { padding: '12px 14px', fontSize: '14px', lineHeight: '1.55', color: '#1f2937', verticalAlign: 'top', borderTop: '1px solid #e2e8f0' };

export default function VsArticle({
  competitor,
  accent,
  badge,
  h1,
  intro,
  quickAnswer,
  table,
  tableNote,
  sections,
  whoThem,
  whoUs,
  faqs,
  sources,
  slug,
  currentPath,
  related,
}) {
  const ctaHref = `/login?utm_source=vs&utm_medium=cta&utm_campaign=${slug}`;
  return (
    <>
      <CommonHeader />
      <main style={{ background: '#fff', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: '20px' }}>
        <header style={{ background: '#f8fafc', padding: '56px 20px 44px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={wrap}>
            <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${accent}`, color: accent, padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, letterSpacing: '.04em' }}>{badge}</div>
            <h1 style={{ fontSize: '40px', lineHeight: '1.15', fontWeight: '900', margin: '18px 0 14px', letterSpacing: '-0.02em' }}>{h1}</h1>
            <p style={{ fontSize: '18px', lineHeight: '1.65', color: '#475569', margin: '0 0 26px' }}>{intro}</p>
            <div style={{ background: '#fff', border: `2px solid ${accent}`, borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: accent, letterSpacing: '.08em', marginBottom: '8px' }}>QUICK ANSWER</div>
              <p style={{ ...p, margin: 0 }}>{quickAnswer}</p>
            </div>
          </div>
        </header>

        <section>
          <div style={wrap}>
            <h2 style={h2}>{`DineOpen and ${competitor}, side by side`}</h2>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: '30%' }}>What you are checking</th>
                    <th style={th}>DineOpen</th>
                    <th style={th}>{competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 ? '#f8fafc' : '#fff' }}>
                      <td style={{ ...td, fontWeight: 600 }}>{row.label}</td>
                      <td style={td}>{row.dine}</td>
                      <td style={td}>{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tableNote && <p style={small}>{tableNote}</p>}
          </div>
        </section>

        {sections.map((s, i) => (
          <section key={i}>
            <div style={wrap}>
              <h2 style={h2}>{s.heading}</h2>
              {s.paragraphs.map((para, j) => (
                <p key={j} style={p}>{para}</p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <div style={wrap}>
            <h2 style={h2}>{`Who should pick ${competitor}`}</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              {whoThem.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
            </ul>
            <h2 style={h2}>Who should pick DineOpen</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              {whoUs.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Questions owners ask us</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderTop: '1px solid #e2e8f0', padding: '18px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{f.q}</h3>
                <p style={{ ...p, margin: 0, color: '#334155' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: '#0f172a', color: '#fff', padding: '52px 20px', margin: '52px 0 0' }}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 12px' }}>Try DineOpen free for 7 days</h2>
            <p style={{ ...p, color: '#cbd5e1' }}>No card needed. Send us your menu on WhatsApp and we will help you set it up.</p>
            <Link href={ctaHref} style={{ display: 'inline-block', background: '#fbbf24', color: '#0f172a', padding: '14px 32px', borderRadius: '999px', fontSize: '17px', fontWeight: 800, textDecoration: 'none', marginTop: '8px' }}>Start the free trial</Link>
            <p style={{ ...small, color: '#94a3b8', marginTop: '16px' }}>
              <Link href="/pricing" style={{ color: '#cbd5e1', textDecoration: 'underline' }}>See DineOpen pricing</Link>
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={{ ...h2, fontSize: '20px' }}>Where the {competitor} facts on this page come from</h2>
            <p style={{ ...small, marginBottom: '10px' }}>
              We only used {competitor}&rsquo;s own website, checked in October 2026. Products change, so please confirm anything important with {competitor} directly. If something here is out of date, tell us and we will fix it.
            </p>
            <ul style={{ ...small, paddingLeft: '20px' }}>
              {sources.map((s, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  {s.label}: <a href={s.url} rel="nofollow noopener" target="_blank" style={linkStyle}>{s.url.replace(/^https?:\/\//, '')}</a>
                </li>
              ))}
            </ul>
            {related && related.length > 0 && (
              <>
                <h2 style={{ ...h2, fontSize: '20px' }}>Related reading</h2>
                <ul style={{ ...p, paddingLeft: '20px' }}>
                  {related.map((r, i) => (
                    <li key={i}><Link href={r.href} style={linkStyle}>{r.title}</Link></li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        <InternalLinks currentPath={currentPath} variant="alternative" />
      </main>
      <Footer />
    </>
  );
}
