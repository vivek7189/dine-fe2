import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LP_VARIANTS } from '../variants';
import LPTracker from './LPTracker';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LP_VARIANTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const v = LP_VARIANTS[slug];
  if (!v) return {};
  // Paid-traffic page: kept out of search so it never competes with the SEO pages.
  return { title: v.title, description: v.description, robots: { index: false, follow: true } };
}

const red = '#ef4444';

function TrialButton({ slug, label = 'Start 7-day free trial', big }) {
  return (
    <Link
      href={`/login?utm_source=google&utm_medium=cpc&utm_campaign=lp_${slug}`}
      data-lp-cta="trial"
      style={{ display: 'inline-block', background: red, color: '#fff', fontWeight: 700, borderRadius: 12,
        padding: big ? '16px 28px' : '12px 20px', fontSize: big ? 18 : 15, textDecoration: 'none' }}
    >
      {label} →
    </Link>
  );
}

function WhatsAppButton({ v }) {
  return (
    <a
      href={`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(v.whatsappText)}`}
      target="_blank" rel="noopener noreferrer" data-lp-cta="whatsapp"
      style={{ display: 'inline-block', border: '2px solid #16a34a', color: '#15803d', fontWeight: 700, borderRadius: 12,
        padding: '12px 20px', fontSize: 15, textDecoration: 'none', background: '#fff' }}
    >
      WhatsApp us for a demo
    </a>
  );
}

export default async function LandingPage({ params }) {
  const { slug } = await params;
  const v = LP_VARIANTS[slug];
  if (!v) notFound();
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: v.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 16px' };
  return (
    <main style={{ background: '#fff', color: '#111827', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <LPTracker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header style={{ ...wrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: 20 }}>
          <img src="/favicon.svg" alt="" width={28} height={28} /> DineOpen
        </Link>
        <Link href="/login" style={{ color: '#374151', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>Log in</Link>
      </header>

      <section style={{ background: 'linear-gradient(180deg,#fff5f5 0%,#fff 100%)', padding: '40px 0 48px' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <div style={{ color: red, fontWeight: 700, fontSize: 14, letterSpacing: 0.4, textTransform: 'uppercase' }}>{v.eyebrow}</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', lineHeight: 1.15, fontWeight: 800, margin: '12px auto 16px', maxWidth: 820 }}>{v.h1}</h1>
          <p style={{ fontSize: 'clamp(16px,2.2vw,19px)', color: '#4b5563', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.55 }}>{v.sub}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <TrialButton slug={slug} big />
            <WhatsAppButton v={v} />
          </div>
          <p style={{ marginTop: 14, color: '#6b7280', fontSize: 14 }}>
            <strong style={{ color: '#111827' }}>{v.price}{v.per}</strong> after the trial · {v.priceNote}
          </p>
        </div>
      </section>

      <section style={{ ...wrap, padding: '40px 16px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Everything a restaurant needs, in one app</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
          {v.features.map(([t, d]) => (
            <div key={t} style={{ border: '1px solid #f1f5f9', borderRadius: 14, padding: 18, background: '#fafafa' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>✓ {t}</div>
              <div style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#f9fafb', padding: '40px 0' }}>
        <div style={wrap}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Start billing today</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {[['1. Sign up', 'Create your account with your phone number or Google — takes a minute.'],
              ['2. Add your menu', 'Type it in, import Excel, or send it to us on WhatsApp and we load it.'],
              ['3. Connect a printer & bill', 'Pair your thermal printer and take your first order.']].map(([t, d]) => (
              <div key={t} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eef2f7' }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{t}</div>
                <div style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...wrap, padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', border: `2px solid ${red}`, borderRadius: 18, padding: '28px 32px', maxWidth: 460, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontWeight: 700, color: '#6b7280' }}>Simple pricing</div>
          <div style={{ fontSize: 44, fontWeight: 800, margin: '6px 0' }}>{v.price}<span style={{ fontSize: 18, color: '#6b7280' }}>{v.per}</span></div>
          <div style={{ color: '#4b5563', marginBottom: 18 }}>{v.priceNote}</div>
          <TrialButton slug={slug} />
          <div style={{ marginTop: 10, fontSize: 13 }}><Link href="/pricing" style={{ color: '#6b7280' }}>See all plans</Link></div>
        </div>
      </section>

      <section style={{ ...wrap, padding: '8px 16px 40px', maxWidth: 800 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 16 }}>Questions</h2>
        {v.faqs.map(([q, a]) => (
          <details key={q} style={{ borderBottom: '1px solid #e5e7eb', padding: '14px 0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer' }}>{q}</summary>
            <p style={{ color: '#4b5563', marginTop: 8, lineHeight: 1.55 }}>{a}</p>
          </details>
        ))}
      </section>

      <section style={{ background: '#111827', color: '#fff', padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Try DineOpen free for 7 days</h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <TrialButton slug={slug} big />
          <WhatsAppButton v={v} />
        </div>
      </section>
    </main>
  );
}
