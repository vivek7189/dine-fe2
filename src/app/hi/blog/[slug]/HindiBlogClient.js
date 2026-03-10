'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
  FaUtensils
} from 'react-icons/fa';
import Breadcrumb from '../../../../components/Breadcrumb';
import InternalLinks from '../../../../components/InternalLinks';

export default function HindiBlogClient({ blogPost }) {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleBack = () => {
    router.push('/hi/blog');
  };

  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blogPost?.title || '';

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
    }

    if (shareUrl && typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Process content to add error handlers to images
  const processedContent = blogPost?.content ? blogPost.content.replace(
    /<img\s+([^>]*?)>/gi,
    (match) => {
      if (match.includes('onerror=')) {
        return match;
      }
      return match.replace(/<img\s+/, '<img onerror="this.onerror=null; this.style.display=\'none\';" ');
    }
  ) : '';

  const categoryIcons = {
    'बिलिंग सॉफ्टवेयर': FaUtensils,
    'स्टार्टअप गाइड': FaUtensils,
    'ऑपरेशन्स': FaUtensils,
    'टेक्नोलॉजी': FaUtensils,
    'GST & टैक्स': FaUtensils,
    'मेनू डिज़ाइन': FaUtensils,
    'इन्वेंटरी': FaUtensils,
    'ऑनलाइन ऑर्डर': FaUtensils,
    'प्रॉफिट': FaUtensils,
    'QR मेनू': FaUtensils,
  };

  const CategoryIcon = categoryIcons[blogPost?.category] || FaUtensils;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 20px 0' }}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'हिंदी ब्लॉग', href: '/hi/blog' },
          { label: blogPost?.title || '' },
        ]} />
      </div>

      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#6b7280',
              padding: '8px 0',
            }}
          >
            <FaArrowLeft size={14} />
            <span>ब्लॉग पर वापस जाएं</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>शेयर करें:</span>
            <button onClick={() => handleShare('whatsapp')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#25D366' }} title="WhatsApp पर शेयर करें">
              <FaWhatsapp size={18} />
            </button>
            <button onClick={() => handleShare('facebook')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#1877F2' }} title="Facebook पर शेयर करें">
              <FaFacebook size={16} />
            </button>
            <button onClick={() => handleShare('twitter')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#1DA1F2' }} title="Twitter पर शेयर करें">
              <FaTwitter size={16} />
            </button>
            <button onClick={() => handleShare('linkedin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#0A66C2' }} title="LinkedIn पर शेयर करें">
              <FaLinkedin size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Article */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Category Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: blogPost?.categoryColor || '#ef4444',
            backgroundColor: (blogPost?.categoryColor || '#ef4444') + '15',
          }}>
            <CategoryIcon size={12} />
            {blogPost?.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#111827',
          lineHeight: '1.3',
          marginBottom: '16px',
        }}>
          {blogPost?.title}
        </h1>

        {/* Excerpt */}
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          lineHeight: '1.7',
          marginBottom: '24px',
        }}>
          {blogPost?.excerpt}
        </p>

        {/* Author Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 0',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '16px',
          }}>
            <FaUser size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>
              {blogPost?.author}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {blogPost?.authorRole}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', fontSize: '13px', color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaCalendarAlt size={12} />
              {blogPost?.publishDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaClock size={12} />
              {blogPost?.readTime}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        {blogPost?.englishEquivalent && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            <span style={{ color: '#0369a1' }}>🌐</span>
            <span style={{ color: '#0c4a6e' }}>This article is also available in </span>
            <Link href={`/blog/${blogPost.englishEquivalent}`} style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>
              English
            </Link>
          </div>
        )}

        {/* Blog Content */}
        <article
          dangerouslySetInnerHTML={{ __html: processedContent }}
          style={{ lineHeight: '1.8', color: '#374151' }}
        />

        {/* Tags */}
        {blogPost?.tags && blogPost.tags.length > 0 && (
          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginRight: '12px' }}>
              टैग्स:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {blogPost.tags.map((tag, index) => (
                <span key={index} style={{
                  padding: '4px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '16px',
                  fontSize: '13px',
                  color: '#4b5563',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section (visible on page) */}
        {blogPost?.faqs && blogPost.faqs.length > 0 && (
          <div style={{
            marginTop: '48px',
            padding: '32px',
            backgroundColor: '#fafafa',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              ❓ अक्सर पूछे जाने वाले सवाल (FAQ)
            </h2>
            {blogPost.faqs.map((faq, index) => (
              <div key={index} style={{
                borderBottom: index < blogPost.faqs.length - 1 ? '1px solid #e5e7eb' : 'none',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 0',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', lineHeight: '1.5', paddingRight: '16px' }}>
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? <FaChevronUp size={14} color="#6b7280" /> : <FaChevronDown size={14} color="#6b7280" />}
                </button>
                {openFaqIndex === index && (
                  <p style={{
                    fontSize: '15px',
                    color: '#4b5563',
                    lineHeight: '1.7',
                    marginTop: '8px',
                    paddingLeft: '4px',
                  }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div style={{
          marginTop: '48px',
          padding: '40px 32px',
          background: 'linear-gradient(135deg, #111827, #1f2937)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <h3 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
            🚀 अपने रेस्टोरेंट को Transform करने के लिए तैयार?
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
            DineOpen का 30-दिन Free Trial शुरू करें — कोई credit card नहीं चाहिए
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/#pricing" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '16px',
              transition: 'transform 0.2s',
            }}>
              अभी शुरू करें →
            </Link>
            <Link href="/pricing" style={{
              display: 'inline-block',
              padding: '14px 32px',
              border: '2px solid #4b5563',
              color: 'white',
              borderRadius: '12px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '16px',
            }}>
              Pricing देखें
            </Link>
          </div>
        </div>

        {/* Related Hindi Posts */}
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            📚 और पढ़ें (हिंदी में)
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { title: 'POS सिस्टम क्या है?', slug: 'pos-system-kya-hai' },
              { title: 'फूड कॉस्ट कैसे कम करें', slug: 'food-cost-kaise-kam-kare' },
              { title: 'रेस्टोरेंट बिलिंग सॉफ्टवेयर गाइड', slug: 'restaurant-billing-software-guide-2026' },
              { title: 'QR मेनू कैसे बनाएं (FREE)', slug: 'qr-menu-kaise-banaye-free' },
              { title: 'रेस्टोरेंट का प्रॉफिट कैसे बढ़ाएं', slug: 'restaurant-profit-kaise-badhaye' },
            ].map((post, index) => (
              <Link key={index} href={`/hi/blog/${post.slug}`} style={{
                display: 'block',
                padding: '14px 20px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#1f2937',
                fontWeight: '500',
                fontSize: '15px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'white'; }}
              >
                → {post.title}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Internal Links */}
      <InternalLinks variant="all" />

      {/* Article Styles */}
      <style jsx>{`
        article h2 {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin-top: 40px;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #fee2e2;
          line-height: 1.4;
        }
        article h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 28px;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        article h4 {
          font-size: 17px;
          font-weight: 600;
          color: #374151;
          margin-top: 20px;
          margin-bottom: 8px;
        }
        article p {
          margin-bottom: 16px;
          font-size: 16px;
          line-height: 1.8;
        }
        article ul, article ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        article li {
          margin-bottom: 10px;
          line-height: 1.7;
        }
        article strong {
          color: #111827;
          font-weight: 600;
        }
        article a {
          color: #ef4444;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        article a:hover {
          border-bottom-color: #ef4444;
        }
        article table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border-radius: 12px;
          overflow: hidden;
        }
        article th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
        }
        article td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        article tr:last-child td {
          border-bottom: none;
        }
        article img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
        }
        article blockquote {
          border-left: 4px solid #ef4444;
          padding: 16px 20px;
          margin: 20px 0;
          background: #fef2f2;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #374151;
        }
      `}</style>
    </>
  );
}
