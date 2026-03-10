import { hindiBlogPosts } from './blogData';
import BlogCard from '../../../components/BlogCard';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import InternalLinks from '../../../components/InternalLinks';

export const dynamic = 'force-static';

export const metadata = {
  title: 'रेस्टोरेंट मैनेजमेंट ब्लॉग हिंदी में | DineOpen — POS, बिलिंग, GST गाइड',
  description: 'रेस्टोरेंट बिलिंग सॉफ्टवेयर, POS system, GST billing, inventory management, food cost control, और restaurant business tips हिंदी में पढ़ें। North India के restaurant owners के लिए expert guides।',
  keywords: 'रेस्टोरेंट बिलिंग सॉफ्टवेयर, POS system hindi, restaurant management hindi, GST billing restaurant, रेस्टोरेंट कैसे खोलें, फूड कॉस्ट, मेनू कार्ड',
  openGraph: {
    title: 'रेस्टोरेंट मैनेजमेंट ब्लॉग हिंदी में | DineOpen',
    description: 'रेस्टोरेंट owners के लिए हिंदी में expert guides, tips और strategies — billing, POS, GST, inventory, और profit growth।',
    url: 'https://www.dineopen.com/hi/blog',
    locale: 'hi_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen हिंदी ब्लॉग',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'रेस्टोरेंट मैनेजमेंट ब्लॉग हिंदी में | DineOpen',
    description: 'रेस्टोरेंट owners के लिए हिंदी में expert guides और tips',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/hi/blog',
    languages: {
      'en': 'https://www.dineopen.com/blog',
      'hi': 'https://www.dineopen.com/hi/blog',
    },
  },
};

export default function HindiBlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "DineOpen हिंदी ब्लॉग — रेस्टोरेंट मैनेजमेंट गाइड",
    "description": "रेस्टोरेंट owners के लिए हिंदी में expert guides, tips और strategies",
    "url": "https://www.dineopen.com/hi/blog",
    "inLanguage": "hi",
    "publisher": {
      "@type": "Organization",
      "name": "DineOpen",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dineopen.com/favicon.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
          padding: '80px 20px 60px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Language Toggle */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Link href="/blog" style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#9ca3af',
                backgroundColor: '#374151',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                English
              </Link>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              }}>
                हिन्दी
              </span>
            </div>

            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: 'white',
              lineHeight: '1.3',
              marginBottom: '16px',
            }}>
              रेस्टोरेंट मैनेजमेंट{' '}
              <span style={{ color: '#ef4444' }}>ब्लॉग</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#9ca3af',
              lineHeight: '1.7',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              बिलिंग सॉफ्टवेयर, POS system, GST compliance, inventory management, और restaurant business growth — सब कुछ हिंदी में
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 0' }}>
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'हिंदी ब्लॉग' },
          ]} />
        </div>

        {/* Blog Grid */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
          {/* Featured Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '24px 32px',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '32px' }}>🇮🇳</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                North India के Restaurant Owners के लिए
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Delhi, Jaipur, Lucknow, Chandigarh, Patna, Indore — अपनी भाषा में सीखें, अपना business बढ़ाएं
              </p>
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {hindiBlogPosts.map((post, index) => (
              <BlogCard key={index} post={post} basePath="/hi/blog" />
            ))}
          </div>

          {/* English Blog Link */}
          <div style={{
            marginTop: '48px',
            textAlign: 'center',
            padding: '32px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>
              Want to read our blogs in English?
            </p>
            <Link href="/blog" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '15px',
            }}>
              Visit English Blog →
            </Link>
          </div>
        </section>

        {/* Internal Links */}
        <InternalLinks variant="all" />
      </div>
    </>
  );
}
